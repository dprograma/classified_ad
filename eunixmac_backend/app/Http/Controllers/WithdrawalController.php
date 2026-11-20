<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Withdrawal;
use App\Models\Payment;
use Illuminate\Support\Facades\Validator;

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
     * Request a withdrawal. The request is held as 'pending' until an admin
     * approves it (see AdminController::approveWithdrawal) — nothing is
     * disbursed here.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // A new bank account can be supplied inline (already resolved via
        // POST /bank-accounts/verify) instead of picking a saved one.
        $usingNewBankAccount = $request->filled('account_number') || $request->filled('bank_code');

        $rules = [
            'amount' => 'required|numeric|min:' . self::MINIMUM_WITHDRAWAL,
        ];

        if ($usingNewBankAccount) {
            $rules += [
                'bank_name' => 'required|string|max:255',
                'bank_code' => 'required|string',
                'account_number' => 'required|digits:10',
                'account_name' => 'required|string|max:255',
            ];
        } else {
            $rules += [
                'bank_account_id' => 'required|exists:bank_accounts,id',
            ];
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($usingNewBankAccount) {
            // Reuse a matching saved account if one already exists, instead
            // of creating a duplicate.
            $bankAccount = $user->bankAccounts()
                ->where('account_number', $request->account_number)
                ->where('bank_code', $request->bank_code)
                ->first();

            if (!$bankAccount) {
                $bankAccount = $user->bankAccounts()->create([
                    'bank_name' => $request->bank_name,
                    'bank_code' => $request->bank_code,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                    'is_primary' => $user->bankAccounts()->count() === 0,
                    // Resolved via /bank-accounts/verify before this call.
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);
            }
        } else {
            $bankAccount = $user->bankAccounts()->findOrFail($request->bank_account_id);
        }

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

        // Don't allow stacking requests while one is already awaiting review
        $hasActiveWithdrawal = $user->withdrawals()->whereIn('status', ['pending', 'processing'])->exists();

        if ($hasActiveWithdrawal) {
            return response()->json([
                'error' => 'You already have a withdrawal request awaiting review. Please wait for it to be resolved.'
            ], 400);
        }

        // Calculate fees
        $fee = self::TRANSFER_FEE;
        $netAmount = $request->amount - $fee;

        $withdrawal = $user->withdrawals()->create([
            'bank_account_id' => $bankAccount->id,
            'amount' => $request->amount,
            'fee' => $fee,
            'net_amount' => $netAmount,
            'status' => 'pending',
            'reference' => Withdrawal::generateReference(),
        ]);

        return response()->json([
            'message' => 'Withdrawal request submitted successfully. It will be reviewed by an admin before funds are disbursed.',
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
     * Get withdrawal details
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $withdrawal = $user->withdrawals()->with('bankAccount')->findOrFail($id);

        return response()->json($withdrawal);
    }
}
