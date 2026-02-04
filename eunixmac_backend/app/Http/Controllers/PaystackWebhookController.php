<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    /**
     * Handle Paystack webhook for transfer events
     */
    public function handleTransferWebhook(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        $body = $request->getContent();

        $expectedSignature = hash_hmac('sha512', $body, env('PAYSTACK_SECRET_KEY'));

        if ($signature !== $expectedSignature) {
            Log::warning('Paystack webhook signature verification failed');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? [];

        Log::info('Paystack webhook received', [
            'event' => $event,
            'reference' => $data['reference'] ?? null
        ]);

        // Handle transfer events
        switch ($event) {
            case 'transfer.success':
                $this->handleTransferSuccess($data);
                break;

            case 'transfer.failed':
                $this->handleTransferFailed($data);
                break;

            case 'transfer.reversed':
                $this->handleTransferReversed($data);
                break;

            default:
                Log::info('Unhandled Paystack webhook event: ' . $event);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle successful transfer
     */
    private function handleTransferSuccess($data)
    {
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            Log::error('Transfer success webhook received without reference');
            return;
        }

        $withdrawal = Withdrawal::where('reference', $reference)->first();

        if (!$withdrawal) {
            Log::error('Withdrawal not found for reference: ' . $reference);
            return;
        }

        if ($withdrawal->status === 'completed') {
            Log::info('Withdrawal already completed: ' . $reference);
            return;
        }

        $withdrawal->update([
            'status' => 'completed',
            'completed_at' => now(),
            'paystack_transfer_code' => $data['transfer_code'] ?? $withdrawal->paystack_transfer_code,
        ]);

        Log::info('Withdrawal marked as completed: ' . $reference, [
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->net_amount
        ]);

        // TODO: Send notification to user about successful withdrawal
    }

    /**
     * Handle failed transfer
     */
    private function handleTransferFailed($data)
    {
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            Log::error('Transfer failed webhook received without reference');
            return;
        }

        $withdrawal = Withdrawal::where('reference', $reference)->first();

        if (!$withdrawal) {
            Log::error('Withdrawal not found for reference: ' . $reference);
            return;
        }

        if ($withdrawal->status === 'failed') {
            Log::info('Withdrawal already marked as failed: ' . $reference);
            return;
        }

        $reason = $data['message'] ?? 'Transfer failed';

        $withdrawal->update([
            'status' => 'failed',
            'reason' => $reason,
        ]);

        Log::error('Withdrawal marked as failed: ' . $reference, [
            'withdrawal_id' => $withdrawal->id,
            'reason' => $reason
        ]);

        // TODO: Send notification to user about failed withdrawal
        // TODO: Optionally refund the amount back to available balance
    }

    /**
     * Handle reversed transfer
     */
    private function handleTransferReversed($data)
    {
        $reference = $data['reference'] ?? null;

        if (!$reference) {
            Log::error('Transfer reversed webhook received without reference');
            return;
        }

        $withdrawal = Withdrawal::where('reference', $reference)->first();

        if (!$withdrawal) {
            Log::error('Withdrawal not found for reference: ' . $reference);
            return;
        }

        $withdrawal->update([
            'status' => 'failed',
            'reason' => 'Transfer was reversed by Paystack',
        ]);

        Log::warning('Withdrawal reversed: ' . $reference, [
            'withdrawal_id' => $withdrawal->id,
            'amount' => $withdrawal->net_amount
        ]);

        // TODO: Send notification to user about reversed withdrawal
        // TODO: Refund the amount back to available balance
    }
}
