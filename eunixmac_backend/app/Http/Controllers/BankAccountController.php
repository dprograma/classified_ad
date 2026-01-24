<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class BankAccountController extends Controller
{
    /**
     * Get all bank accounts for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $bankAccounts = $user->bankAccounts()->latest()->get();

        return response()->json($bankAccounts);
    }

    /**
     * Get list of Nigerian banks from Paystack
     */
    public function getBanks()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/bank');

        if ($response->successful()) {
            return response()->json($response->json()['data']);
        }

        return response()->json(['error' => 'Unable to fetch banks'], 500);
    }

    /**
     * Verify account number with Paystack
     */
    public function verifyAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_number' => 'required|digits:10',
            'bank_code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/bank/resolve', [
            'account_number' => $request->account_number,
            'bank_code' => $request->bank_code,
        ]);

        if ($response->successful() && $response->json()['status']) {
            return response()->json([
                'account_name' => $response->json()['data']['account_name'],
                'account_number' => $response->json()['data']['account_number'],
            ]);
        }

        return response()->json([
            'error' => 'Unable to verify account. Please check account number and bank.'
        ], 400);
    }

    /**
     * Store a new bank account
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'bank_name' => 'required|string|max:255',
            'bank_code' => 'required|string',
            'account_number' => 'required|digits:10',
            'account_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if user already has this account
        $exists = $user->bankAccounts()
            ->where('account_number', $request->account_number)
            ->where('bank_code', $request->bank_code)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'This bank account already exists'], 409);
        }

        // If this is the first account, make it primary
        $isPrimary = $user->bankAccounts()->count() === 0;

        // Create bank account
        $bankAccount = $user->bankAccounts()->create([
            'bank_name' => $request->bank_name,
            'bank_code' => $request->bank_code,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'is_primary' => $isPrimary,
            'is_verified' => false,
        ]);

        // Send verification amount (small deposit)
        $this->sendVerificationDeposit($bankAccount);

        return response()->json([
            'message' => 'Bank account added successfully. A verification deposit will be sent shortly.',
            'bank_account' => $bankAccount
        ], 201);
    }

    /**
     * Set a bank account as primary
     */
    public function setPrimary(Request $request, $id)
    {
        $user = $request->user();
        $bankAccount = $user->bankAccounts()->findOrFail($id);

        if (!$bankAccount->is_verified) {
            return response()->json(['error' => 'Please verify this account before setting it as primary'], 400);
        }

        // Remove primary status from all other accounts
        $user->bankAccounts()->update(['is_primary' => false]);

        // Set this account as primary
        $bankAccount->update(['is_primary' => true]);

        return response()->json([
            'message' => 'Primary bank account updated successfully',
            'bank_account' => $bankAccount
        ]);
    }

    /**
     * Delete a bank account
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $bankAccount = $user->bankAccounts()->findOrFail($id);

        // Don't allow deletion if there are pending withdrawals
        if ($bankAccount->withdrawals()->whereIn('status', ['pending', 'processing'])->exists()) {
            return response()->json([
                'error' => 'Cannot delete account with pending withdrawals'
            ], 400);
        }

        $bankAccount->delete();

        return response()->json(['message' => 'Bank account deleted successfully']);
    }

    /**
     * Send small verification deposit to bank account
     */
    private function sendVerificationDeposit($bankAccount)
    {
        // Generate random amount between ₦1 and ₦10
        $verificationAmount = rand(1, 10);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->post('https://api.paystack.co/transfer', [
                'source' => 'balance',
                'amount' => $verificationAmount * 100, // Convert to kobo
                'recipient' => $this->createTransferRecipient($bankAccount),
                'reason' => 'Account verification - eUnix Mac',
            ]);

            if ($response->successful()) {
                $bankAccount->update([
                    'verification_amount' => $verificationAmount,
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Verification deposit failed: ' . $e->getMessage());
        }
    }

    /**
     * Create transfer recipient on Paystack
     */
    private function createTransferRecipient($bankAccount)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->post('https://api.paystack.co/transferrecipient', [
            'type' => 'nuban',
            'name' => $bankAccount->account_name,
            'account_number' => $bankAccount->account_number,
            'bank_code' => $bankAccount->bank_code,
            'currency' => 'NGN',
        ]);

        if ($response->successful()) {
            return $response->json()['data']['recipient_code'];
        }

        throw new \Exception('Failed to create transfer recipient');
    }
}
