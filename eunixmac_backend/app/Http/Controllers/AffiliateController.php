<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AffiliateCommission;
use App\Models\Withdrawal;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
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
                $payment = Payment::create([
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

                // Process affiliate commission for the referrer
                // If this user was referred by an active affiliate, pay them 65% of the enrollment fee
                try {
                    if ($user->referred_by) {
                        $affiliate = User::find($user->referred_by);

                        if ($affiliate && $affiliate->is_affiliate) {
                            $commissionAmount = (self::AFFILIATE_ENROLLMENT_FEE * self::COMMISSION_RATE) / 100;

                            AffiliateCommission::create([
                                'affiliate_id' => $affiliate->id,
                                'referred_user_id' => $user->id,
                                'payment_id' => $payment->id,
                                'purchase_amount' => self::AFFILIATE_ENROLLMENT_FEE,
                                'commission_rate' => self::COMMISSION_RATE,
                                'commission_amount' => $commissionAmount,
                                'status' => 'approved',
                            ]);

                            Log::info("Affiliate enrollment commission: Affiliate #{$affiliate->id} earns ₦{$commissionAmount} from referral #{$user->id} enrollment");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Affiliate enrollment commission error: ' . $e->getMessage());
                    // Don't block enrollment if commission processing fails
                }
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
        $successfulReferrals = User::where('referred_by', $user->id)->where('is_affiliate', true)->count();

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
            ->where('status', 'completed')
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
            ->with('bankAccount')
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

        // Reuse (or create) a BankAccount record from the affiliate's saved
        // bank details, so this flows through the same admin-approved
        // disbursement path as other withdrawals — nothing is transferred
        // here; an admin must approve it first (see
        // AdminController::approveWithdrawal).
        $bankAccount = $user->bankAccounts()
            ->where('account_number', $user->bank_account_number)
            ->where('bank_code', $user->bank_code)
            ->first();

        if (!$bankAccount) {
            $bankAccount = $user->bankAccounts()->create([
                'bank_name' => $user->bank_name,
                'bank_code' => $user->bank_code,
                'account_number' => $user->bank_account_number,
                'account_name' => $user->bank_account_name,
                'is_primary' => $user->bankAccounts()->count() === 0,
                'is_verified' => true,
                'verified_at' => now(),
            ]);
        }

        $withdrawal = Withdrawal::create([
            'user_id' => $user->id,
            'bank_account_id' => $bankAccount->id,
            'amount' => $request->amount,
            'fee' => 0,
            'net_amount' => $request->amount,
            'status' => 'pending',
            'reference' => Withdrawal::generateReference(),
        ]);

        return response()->json([
            'message' => 'Withdrawal request submitted successfully. It will be reviewed by an admin before funds are disbursed.',
            'withdrawal' => $withdrawal->load('bankAccount'),
        ], 201);
    }

    /**
     * Get withdrawal history
     */
    public function withdrawalHistory(Request $request)
    {
        $user = $request->user();

        $withdrawals = Withdrawal::where('user_id', $user->id)
            ->with('bankAccount')
            ->latest()
            ->paginate(15);

        return response()->json($withdrawals);
    }

    /**
     * Get list of referred users
     */
    public function referrals(Request $request)
    {
        $user = $request->user();

        if (!$user->is_affiliate) {
            return response()->json(['message' => 'Not an affiliate'], 403);
        }

        $referrals = User::where('referred_by', $user->id)
            ->select('id', 'name', 'email', 'created_at', 'is_affiliate')
            ->latest()
            ->get()
            ->map(function ($referral) use ($user) {
                $commission = AffiliateCommission::where('affiliate_id', $user->id)
                    ->where('referred_user_id', $referral->id)
                    ->first();

                return [
                    'id' => $referral->id,
                    'name' => $referral->name,
                    'email' => $referral->email,
                    'joined_at' => $referral->created_at,
                    'is_affiliate' => (bool) $referral->is_affiliate,
                    'enrollment_fee' => $referral->is_affiliate ? self::AFFILIATE_ENROLLMENT_FEE : 0,
                    'total_commission' => $commission ? (float) $commission->commission_amount : 0,
                ];
            });

        return response()->json($referrals);
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
