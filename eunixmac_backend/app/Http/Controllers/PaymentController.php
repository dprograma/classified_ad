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
        $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $request->reference;

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
                    $ad->is_boosted = true;
                    // Set boost expiration (e.g., 7 days from now)
                    $ad->boost_expires_at = now()->addDays(7);
                    $ad->save();
                }
            }

            Payment::create([
                'user_id' => $metadata['user_id'],
                'payable_id' => $metadata['ad_id'],
                'payable_type' => $metadata['type'],
                'amount' => $data['amount'] / 100, // Convert back from kobo
                'reference' => $reference,
                'status' => 'success',
            ]);

            return response()->json(['message' => 'Payment verified successfully', 'data' => $data]);
        } else {
            return response()->json(['message' => 'Payment verification failed', 'error' => $response->json()], 400);
        }
    }
}
