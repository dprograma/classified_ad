<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ad;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

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
}
