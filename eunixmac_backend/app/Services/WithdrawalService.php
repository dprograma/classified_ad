<?php

namespace App\Services;

use App\Models\AffiliateCommission;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\Http;

class WithdrawalService
{
    /**
     * Disburse an approved withdrawal via Paystack Transfer.
     * Called only after an admin has approved the request.
     */
    public function disburse(Withdrawal $withdrawal): bool
    {
        try {
            $withdrawal->update(['status' => 'processing', 'processed_at' => now()]);

            [$accountName, $accountNumber, $bankCode] = $this->resolveRecipientDetails($withdrawal);

            // Create transfer recipient
            $recipientResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            ])->post('https://api.paystack.co/transferrecipient', [
                'type' => 'nuban',
                'name' => $accountName,
                'account_number' => $accountNumber,
                'bank_code' => $bankCode,
                'currency' => 'NGN',
            ]);

            if (!$recipientResponse->successful()) {
                throw new \Exception('Failed to create transfer recipient: ' . ($recipientResponse->json()['message'] ?? 'Unknown error'));
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

            if (!$transferResponse->successful()) {
                throw new \Exception($transferResponse->json()['message'] ?? 'Transfer failed');
            }

            $transferData = $transferResponse->json()['data'];

            $withdrawal->update([
                'paystack_transfer_code' => $transferData['transfer_code'],
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $this->markAffiliateCommissionsPaid($withdrawal);

            return true;
        } catch (\Exception $e) {
            $withdrawal->update([
                'status' => 'failed',
                'reason' => $e->getMessage(),
            ]);

            \Log::error('Withdrawal processing failed: ' . $e->getMessage(), [
                'withdrawal_id' => $withdrawal->id,
                'reference' => $withdrawal->reference,
            ]);

            return false;
        }
    }

    /**
     * Where to pull the transfer recipient's name/account/bank from. Most
     * withdrawals have a bankAccount relation; affiliate withdrawals fall
     * back to the legacy bank_* columns stored directly on the user.
     *
     * @return array{0: string, 1: string, 2: string}
     */
    private function resolveRecipientDetails(Withdrawal $withdrawal): array
    {
        if ($withdrawal->bankAccount) {
            return [
                $withdrawal->bankAccount->account_name,
                $withdrawal->bankAccount->account_number,
                $withdrawal->bankAccount->bank_code,
            ];
        }

        $user = $withdrawal->user;

        return [
            $user->bank_account_name,
            $user->bank_account_number,
            $user->bank_code,
        ];
    }

    /**
     * Mark the affiliate's oldest approved commissions as paid, up to the
     * withdrawn amount. No-op for withdrawals that aren't affiliate payouts,
     * since those users have no AffiliateCommission rows.
     */
    private function markAffiliateCommissionsPaid(Withdrawal $withdrawal): void
    {
        $remaining = (float) $withdrawal->amount;

        $commissions = AffiliateCommission::where('affiliate_id', $withdrawal->user_id)
            ->where('status', 'approved')
            ->orderBy('created_at', 'asc')
            ->get();

        foreach ($commissions as $commission) {
            if ($remaining <= 0) {
                break;
            }

            $commission->update(['status' => 'paid', 'paid_at' => now()]);
            $remaining -= (float) $commission->commission_amount;
        }
    }
}
