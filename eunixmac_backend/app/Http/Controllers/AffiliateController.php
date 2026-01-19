<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AffiliateCommission;
use App\Models\Withdrawal;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AffiliateController extends Controller
{
    const AFFILIATE_ENROLLMENT_FEE = 3000; // ₦3,000
    const COMMISSION_RATE = 65; // 65%
    const MINIMUM_WITHDRAWAL = 3000; // ₦3,000

    /**
     * Initiate affiliate enrollment payment
     */
    public function initiateEnrollment(Request $request)
    {
        $user = $request->user();

        if ($user->is_affiliate) {
            return response()->json([
                'message' => 'You are already an affiliate',
                'referral_link' => env('FRONTEND_URL') . '/register?ref=' . $user->referral_code,
            ], 400);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email' => $user->email,
            'amount' => self::AFFILIATE_ENROLLMENT_FEE * 100, // Convert to kobo
            'callback_url' => env('APP_URL') . '/api/affiliate/verify-enrollment',
            'metadata' => [
                'user_id' => $user->id,
                'type' => 'affiliate_enrollment',
            ],
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json([
            'message' => 'Payment initiation failed',
            'error' => $response->json()
        ], 500);
    }

    /**
     * Verify affiliate enrollment payment
     */
    public function verifyEnrollment(Request $request)
    {
        $reference = $request->input('reference') ?? $request->input('trxref');

        if (!$reference) {
            return redirect(env('FRONTEND_URL') . '/dashboard?tab=affiliate&status=error&message=' . urlencode('Payment reference not found'));
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/transaction/verify/' . $reference);

        if ($response->successful() && $response->json()['data']['status'] === 'success') {
            $data = $response->json()['data'];
            $metadata = $data['metadata'];

            if ($metadata['type'] !== 'affiliate_enrollment') {
                return redirect(env('FRONTEND_URL') . '/dashboard?tab=affiliate&status=error&message=' . urlencode('Invalid payment type'));
            }

            $user = User::find($metadata['user_id']);

            if (!$user) {
                return redirect(env('FRONTEND_URL') . '/dashboard?tab=affiliate&status=error&message=' . urlencode('User not found'));
            }

            // Check if payment already processed
            $existingPayment = Payment::where('reference', $reference)->first();
            if (!$existingPayment) {
                // Create payment record
                Payment::create([
                    'user_id' => $user->id,
                    'payable_id' => $user->id,
                    'payable_type' => 'affiliate_enrollment',
                    'amount' => $data['amount'] / 100,
                    'reference' => $reference,
                    'status' => 'success',
                ]);

                // Activate affiliate status
                $user->is_affiliate = true;
                $user->referral_code = strtoupper(Str::random(8));
                $user->affiliate_enrolled_at = now();
                $user->save();
            }

            return redirect(env('FRONTEND_URL') . '/dashboard?tab=affiliate&status=success&message=' . urlencode('Welcome to the affiliate program!'));
        }

        return redirect(env('FRONTEND_URL') . '/dashboard?tab=affiliate&status=error&message=' . urlencode('Payment verification failed'));
    }

    /**
     * Get affiliate dashboard data
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        if (!$user->is_affiliate) {
            return response()->json([
                'message' => 'Not an affiliate',
                'enrollment_fee' => self::AFFILIATE_ENROLLMENT_FEE,
            ], 403);
        }

        $totalReferrals = User::where('referred_by', $user->id)->count();
        $successfulReferrals = AffiliateCommission::where('affiliate_id', $user->id)->distinct('referred_user_id')->count('referred_user_id');

        $totalEarnings = AffiliateCommission::where('affiliate_id', $user->id)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('commission_amount');

        $pendingEarnings = AffiliateCommission::where('affiliate_id', $user->id)
            ->where('status', 'pending')
            ->sum('commission_amount');

        $availableBalance = AffiliateCommission::where('affiliate_id', $user->id)
            ->where('status', 'approved')
            ->sum('commission_amount');

        $totalWithdrawn = Withdrawal::where('user_id', $user->id)
            ->where('status', 'success')
            ->sum('amount');

        $recentCommissions = AffiliateCommission::where('affiliate_id', $user->id)
            ->with(['referredUser:id,name,email', 'payment:id,created_at'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($commission) {
                return [
                    'id' => $commission->id,
                    'referred_user' => $commission->referredUser->name ?? 'Unknown',
                    'referred_email' => $commission->referredUser->email ?? '',
                    'purchase_amount' => (float) $commission->purchase_amount,
                    'commission_amount' => (float) $commission->commission_amount,
                    'status' => $commission->status,
                    'date' => $commission->created_at,
                ];
            });

        $recentWithdrawals = Withdrawal::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => env('FRONTEND_URL') . '/register?ref=' . $user->referral_code,
            'total_referrals' => $totalReferrals,
            'successful_referrals' => $successfulReferrals,
            'total_earnings' => (float) $totalEarnings,
            'pending_earnings' => (float) $pendingEarnings,
            'available_balance' => (float) $availableBalance,
            'total_withdrawn' => (float) $totalWithdrawn,
            'commission_rate' => self::COMMISSION_RATE,
            'minimum_withdrawal' => self::MINIMUM_WITHDRAWAL,
            'recent_commissions' => $recentCommissions,
            'recent_withdrawals' => $recentWithdrawals,
            'bank_account' => [
                'bank_name' => $user->bank_name,
                'account_number' => $user->bank_account_number,
                'account_name' => $user->bank_account_name,
            ],
        ]);
    }

    /**
     * Update bank account details
     */
    public function updateBankAccount(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_code' => 'required|string|max:20',
            'bank_account_number' => 'required|string|max:20',
            'bank_account_name' => 'required|string|max:255',
        ]);

        $user = $request->user();

        // Verify bank account with Paystack
        $verifyResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/bank/resolve', [
            'account_number' => $request->bank_account_number,
            'bank_code' => $request->bank_code,
        ]);

        if (!$verifyResponse->successful() || !$verifyResponse->json()['status']) {
            return response()->json([
                'message' => 'Could not verify bank account. Please check your details.',
                'error' => $verifyResponse->json()['message'] ?? 'Verification failed'
            ], 400);
        }

        $verifiedData = $verifyResponse->json()['data'];

        $user->update([
            'bank_name' => $request->bank_name,
            'bank_code' => $request->bank_code,
            'bank_account_number' => $request->bank_account_number,
            'bank_account_name' => $verifiedData['account_name'] ?? $request->bank_account_name,
        ]);

        return response()->json([
            'message' => 'Bank account updated successfully',
            'bank_account' => [
                'bank_name' => $user->bank_name,
                'account_number' => $user->bank_account_number,
                'account_name' => $user->bank_account_name,
            ],
        ]);
    }

    /**
     * Get list of banks from Paystack
     */
    public function getBanks()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/bank?country=nigeria');

        if ($response->successful()) {
            return response()->json($response->json()['data']);
        }

        return response()->json([
            'message' => 'Could not fetch banks list'
        ], 500);
    }

    /**
     * Request withdrawal
     */
    public function requestWithdrawal(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:' . self::MINIMUM_WITHDRAWAL,
        ]);

        $user = $request->user();

        if (!$user->is_affiliate) {
            return response()->json(['message' => 'Not an affiliate'], 403);
        }

        // Check if bank account is set up
        if (!$user->bank_account_number || !$user->bank_code) {
            return response()->json([
                'message' => 'Please set up your bank account first'
            ], 400);
        }

        // Check available balance
        $availableBalance = AffiliateCommission::where('affiliate_id', $user->id)
            ->where('status', 'approved')
            ->sum('commission_amount');

        if ($request->amount > $availableBalance) {
            return response()->json([
                'message' => 'Insufficient balance. Available: ₦' . number_format($availableBalance, 2),
                'available_balance' => (float) $availableBalance,
            ], 400);
        }

        // Check for pending withdrawals
        $pendingWithdrawal = Withdrawal::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'processing'])
            ->first();

        if ($pendingWithdrawal) {
            return response()->json([
                'message' => 'You have a pending withdrawal request. Please wait for it to be processed.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Create transfer recipient on Paystack
            $recipientResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.paystack.co/transferrecipient', [
                'type' => 'nuban',
                'name' => $user->bank_account_name,
                'account_number' => $user->bank_account_number,
                'bank_code' => $user->bank_code,
                'currency' => 'NGN',
            ]);

            if (!$recipientResponse->successful()) {
                throw new \Exception('Failed to create transfer recipient: ' . ($recipientResponse->json()['message'] ?? 'Unknown error'));
            }

            $recipientCode = $recipientResponse->json()['data']['recipient_code'];
            $reference = Withdrawal::generateReference();

            // Initiate transfer
            $transferResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.paystack.co/transfer', [
                'source' => 'balance',
                'amount' => $request->amount * 100, // Convert to kobo
                'recipient' => $recipientCode,
                'reason' => 'Affiliate commission withdrawal',
                'reference' => $reference,
            ]);

            if (!$transferResponse->successful()) {
                throw new \Exception('Failed to initiate transfer: ' . ($transferResponse->json()['message'] ?? 'Unknown error'));
            }

            $transferData = $transferResponse->json()['data'];

            // Create withdrawal record
            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'bank_name' => $user->bank_name,
                'bank_account_number' => $user->bank_account_number,
                'bank_account_name' => $user->bank_account_name,
                'bank_code' => $user->bank_code,
                'transfer_code' => $transferData['transfer_code'] ?? null,
                'reference' => $reference,
                'status' => 'processing',
            ]);

            // Mark commissions as paid up to the withdrawal amount
            $remainingAmount = $request->amount;
            $commissions = AffiliateCommission::where('affiliate_id', $user->id)
                ->where('status', 'approved')
                ->orderBy('created_at', 'asc')
                ->get();

            foreach ($commissions as $commission) {
                if ($remainingAmount <= 0) break;

                $commission->status = 'paid';
                $commission->paid_at = now();
                $commission->save();

                $remainingAmount -= $commission->commission_amount;
            }

            DB::commit();

            return response()->json([
                'message' => 'Withdrawal request submitted successfully',
                'withdrawal' => $withdrawal,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Withdrawal error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Withdrawal failed. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get withdrawal history
     */
    public function withdrawalHistory(Request $request)
    {
        $user = $request->user();

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->latest()
            ->paginate(15);

        return response()->json($withdrawals);
    }

    /**
     * Get commission history
     */
    public function commissionHistory(Request $request)
    {
        $user = $request->user();

        $commissions = AffiliateCommission::where('affiliate_id', $user->id)
            ->with(['referredUser:id,name,email'])
            ->latest()
            ->paginate(15);

        return response()->json($commissions);
    }
}
