<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ad;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    public function initiateAdBoost(Request $request, Ad $ad)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
        ]);

        $user = $request->user();
        $amount = $request->amount;

        // Initiate payment with Paystack
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email' => $user->email,
            'amount' => $amount * 100, // Paystack expects amount in kobo
            'callback_url' => env('APP_URL') . '/api/payments/verify',
            'metadata' => [
                'ad_id' => $ad->id,
                'user_id' => $user->id,
                'type' => 'ad_boost',
            ],
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        } else {
            return response()->json(['message' => 'Payment initiation failed', 'error' => $response->json()], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        // This method handles Paystack callbacks (both GET and POST)
        $reference = $request->input('reference') ?? $request->input('trxref');
        
        if (!$reference) {
            return redirect(env('FRONTEND_URL') . '/payment/callback?status=error&message=' . urlencode('Payment reference not found'));
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/transaction/verify/' . $reference);

        if ($response->successful() && $response->json()['data']['status'] === 'success') {
            $data = $response->json()['data'];
            $metadata = $data['metadata'];

            // Update ad status and record payment
            if ($metadata['type'] === 'ad_boost') {
                $ad = Ad::find($metadata['ad_id']);
                if ($ad) {
                    $boostDays = $metadata['boost_days'] ?? 7; // Default to 7 if not specified
                    $ad->is_boosted = true;
                    $ad->boost_expires_at = now()->addDays($boostDays);
                    $ad->save();
                }
            }

            // Check if payment record already exists (avoid duplicates)
            $existingPayment = Payment::where('reference', $reference)->first();
            if (!$existingPayment) {
                Payment::create([
                    'user_id' => $metadata['user_id'],
                    'payable_id' => $metadata['ad_id'],
                    'payable_type' => $metadata['type'],
                    'amount' => $data['amount'] / 100, // Convert back from kobo
                    'reference' => $reference,
                    'status' => 'success',
                ]);
            }

            // Redirect to frontend success page
            return redirect(env('FRONTEND_URL') . '/payment/callback?status=success&reference=' . $reference . '&ad_id=' . $metadata['ad_id']);
        } else {
            // Redirect to frontend error page
            return redirect(env('FRONTEND_URL') . '/payment/callback?status=error&reference=' . $reference . '&message=' . urlencode('Payment verification failed'));
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);
        $type = $request->get('type'); // Filter by payment type

        $query = $user->payments()->latest();

        // Filter by type if specified
        if ($type && $type !== 'all') {
            switch ($type) {
                case 'boost':
                    $query->whereIn('payable_type', ['ad_boost', 'AdBoost']);
                    break;
                case 'materials':
                    $query->where('payable_type', 'educational_material');
                    break;
                case 'affiliate':
                    $query->where('type', 'affiliate_payout');
                    break;
            }
        }

        $payments = $query->paginate($perPage);

        // Add additional metadata for frontend
        $payments->getCollection()->transform(function ($payment) {
            $paymentArray = $payment->toArray();

            // Add description based on payment type
            switch ($payment->payable_type) {
                case 'ad_boost':
                case 'AdBoost':
                    $paymentArray['description'] = 'Ad Boost Payment';
                    $paymentArray['payable_type'] = 'AdBoost'; // Normalize for frontend

                    // Try to load ad details if payable_id exists
                    if ($payment->payable_id) {
                        $ad = \App\Models\Ad::find($payment->payable_id);
                        if ($ad) {
                            $paymentArray['ad_details'] = [
                                'id' => $ad->id,
                                'title' => $ad->title,
                                'price' => $ad->price,
                                'is_boosted' => $ad->is_boosted,
                                'boost_expires_at' => $ad->boost_expires_at
                            ];
                        }
                    }
                    break;
                case 'educational_material':
                    $paymentArray['description'] = 'Educational Material Purchase';
                    $paymentArray['payable_type'] = 'EducationalMaterial'; // Normalize for frontend
                    break;
                default:
                    $paymentArray['description'] = $payment->type ?? 'Payment';
                    break;
            }

            return $paymentArray;
        });

        return response()->json($payments);
    }

    public function stats(Request $request)
    {
        $user = $request->user();

        // Calculate total spent on boosts and materials
        $totalSpent = $user->payments()
            ->where('status', 'success')
            ->whereIn('payable_type', ['AdBoost', 'ad_boost', 'educational_material'])
            ->sum('amount');

        // Calculate total earned from affiliate payouts
        $totalEarned = $user->payments()
            ->where('status', 'success')
            ->where('type', 'affiliate_payout')
            ->sum('amount');

        // Total transaction count
        $totalTransactions = $user->payments()->count();

        // Count by payment type
        $boostPayments = $user->payments()
            ->whereIn('payable_type', ['AdBoost', 'ad_boost'])
            ->count();

        $materialPayments = $user->payments()
            ->where('payable_type', 'educational_material')
            ->count();

        $affiliatePayments = $user->payments()
            ->where('type', 'affiliate_payout')
            ->count();

        return response()->json([
            'total_spent' => (float) $totalSpent,
            'total_earned' => (float) $totalEarned,
            'total_transactions' => $totalTransactions,
            'boost_payments' => $boostPayments,
            'material_payments' => $materialPayments,
            'affiliate_payments' => $affiliatePayments
        ]);
    }

    public function downloadReceipt(Request $request, Payment $payment)
    {
        $user = $request->user();

        // Check if user owns this payment
        if ($payment->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow receipt download for successful payments
        if ($payment->status !== 'success') {
            return response()->json(['message' => 'Receipt only available for successful payments'], 400);
        }

        try {
            // Generate PDF receipt
            $receiptData = [
                'payment' => $payment,
                'user' => $user,
                'company' => [
                    'name' => 'EunixMac Classified Ads',
                    'address' => 'Lagos, Nigeria',
                    'email' => 'support@eunixmac.com',
                    'phone' => '+234 XXX XXX XXXX'
                ]
            ];

            $pdf = Pdf::loadView('receipts.payment', $receiptData);

            return $pdf->download("receipt-{$payment->reference}.pdf");
        } catch (\Exception $e) {
            \Log::error('Receipt generation error: ' . $e->getMessage());
            return response()->json(['message' => 'Unable to generate receipt. Please try again later.'], 500);
        }
    }
}
