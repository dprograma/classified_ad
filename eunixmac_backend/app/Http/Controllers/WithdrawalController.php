<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Withdrawal;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    const MINIMUM_WITHDRAWAL = 3000; // ₦3,000 minimum
    const TRANSFER_FEE = 50; // ₦50 transfer fee

    /**
     * Get withdrawal history for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = $request->get('per_page', 15);

        $withdrawals = $user->withdrawals()
            ->with('bankAccount')
            ->latest()
            ->paginate($perPage);

        return response()->json($withdrawals);
    }

    /**
     * Get withdrawal statistics
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        // Calculate book earnings
        $bookEarnings = $user->book_earnings;

        // Calculate total withdrawn
        $totalWithdrawn = $user->withdrawals()
            ->whereIn('status', ['completed', 'processing'])
            ->sum('amount');

        // Calculate available balance
        $availableBalance = max(0, $bookEarnings - $totalWithdrawn);

        // Calculate pending withdrawals
        $pendingWithdrawals = $user->withdrawals()
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        return response()->json([
            'total_earnings' => $bookEarnings,
            'total_withdrawn' => $totalWithdrawn,
            'available_balance' => $availableBalance,
            'pending_withdrawals' => $pendingWithdrawals,
            'minimum_withdrawal' => self::MINIMUM_WITHDRAWAL,
            'transfer_fee' => self::TRANSFER_FEE,
        ]);
    }

    /**
     * Request a withdrawal
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:' . self::MINIMUM_WITHDRAWAL,
            'bank_account_id' => 'required|exists:bank_accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify bank account belongs to user and is verified
        $bankAccount = $user->bankAccounts()->findOrFail($request->bank_account_id);

        if (!$bankAccount->is_verified) {
            return response()->json([
                'error' => 'Please verify your bank account before making a withdrawal'
            ], 400);
        }

        // Check available balance
        $availableBalance = $user->getAvailableWithdrawalBalance();

        if ($request->amount > $availableBalance) {
            return response()->json([
                'error' => 'Insufficient balance. Available: ₦' . number_format($availableBalance, 2)
            ], 400);
        }

        // Calculate fees
        $fee = self::TRANSFER_FEE;
        $netAmount = $request->amount - $fee;

        // Create withdrawal request
        $withdrawal = DB::transaction(function () use ($user, $request, $bankAccount, $fee, $netAmount) {
            $withdrawal = $user->withdrawals()->create([
                'bank_account_id' => $bankAccount->id,
                'amount' => $request->amount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'status' => 'pending',
                'reference' => Withdrawal::generateReference(),
            ]);

            // Automatically process the withdrawal
            $this->processWithdrawal($withdrawal);

            return $withdrawal;
        });

        return response()->json([
            'message' => 'Withdrawal request submitted successfully',
            'withdrawal' => $withdrawal->load('bankAccount')
        ], 201);
    }

    /**
     * Cancel a pending withdrawal
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $withdrawal = $user->withdrawals()->findOrFail($id);

        if ($withdrawal->status !== 'pending') {
            return response()->json([
                'error' => 'Only pending withdrawals can be cancelled'
            ], 400);
        }

        $withdrawal->update([
            'status' => 'cancelled',
            'reason' => 'Cancelled by user',
        ]);

        return response()->json([
            'message' => 'Withdrawal cancelled successfully',
            'withdrawal' => $withdrawal
        ]);
    }

    /**
     * Process withdrawal via Paystack Transfer
     */
    private function processWithdrawal($withdrawal)
    {
        try {
            $withdrawal->update(['status' => 'processing', 'processed_at' => now()]);

            $bankAccount = $withdrawal->bankAccount;

            // Create transfer recipient
            $recipientResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->post('https://api.paystack.co/transferrecipient', [
                'type' => 'nuban',
                'name' => $bankAccount->account_name,
                'account_number' => $bankAccount->account_number,
                'bank_code' => $bankAccount->bank_code,
                'currency' => 'NGN',
            ]);

            if (!$recipientResponse->successful()) {
                throw new \Exception('Failed to create transfer recipient');
            }

            $recipientCode = $recipientResponse->json()['data']['recipient_code'];

            // Initiate transfer
            $transferResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->post('https://api.paystack.co/transfer', [
                'source' => 'balance',
                'amount' => $withdrawal->net_amount * 100, // Convert to kobo
                'recipient' => $recipientCode,
                'reason' => 'Withdrawal - ' . $withdrawal->reference,
                'reference' => $withdrawal->reference,
            ]);

            if ($transferResponse->successful()) {
                $transferData = $transferResponse->json()['data'];

                $withdrawal->update([
                    'paystack_transfer_code' => $transferData['transfer_code'],
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                return true;
            } else {
                throw new \Exception($transferResponse->json()['message'] ?? 'Transfer failed');
            }

        } catch (\Exception $e) {
            $withdrawal->update([
                'status' => 'failed',
                'reason' => $e->getMessage(),
            ]);

            \Log::error('Withdrawal processing failed: ' . $e->getMessage(), [
                'withdrawal_id' => $withdrawal->id,
                'reference' => $withdrawal->reference
            ]);

            return false;
        }
    }

    /**
     * Get withdrawal details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $withdrawal = $user->withdrawals()->with('bankAccount')->findOrFail($id);

        return response()->json($withdrawal);
    }
}
