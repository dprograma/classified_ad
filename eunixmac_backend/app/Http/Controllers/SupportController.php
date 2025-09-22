<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\SupportTicket;
use App\Mail\SupportTicketNotification;
use App\Models\SupportTicket as SupportTicketModel;

class SupportController extends Controller
{
    public function contact(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|string|in:verification,payment,technical,account,feedback',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        try {
            // Create the support ticket in database
            $ticket = SupportTicketModel::create([
                'user_id' => $user->id,
                'category' => $request->category,
                'subject' => $request->subject,
                'message' => $request->message,
                'priority' => $this->determinePriority($request->category),
                'metadata' => [
                    'user_agent' => $request->header('User-Agent'),
                    'ip_address' => $request->ip(),
                    'submitted_at' => now()->toISOString(),
                ]
            ]);

            // Log the support request
            Log::info('Support ticket created', [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'user_id' => $user->id,
                'category' => $request->category,
                'subject' => $request->subject,
            ]);

            // Send email notification to support team
            try {
                $supportEmail = config('mail.support_email', config('app.support_email', 'support@classifiedads.com'));
                Mail::to($supportEmail)->send(new SupportTicketNotification($ticket, 'new'));

                Log::info('Support ticket email notification sent', [
                    'ticket_id' => $ticket->id,
                    'sent_to' => $supportEmail
                ]);
            } catch (\Exception $mailException) {
                Log::warning('Failed to send support ticket email notification', [
                    'ticket_id' => $ticket->id,
                    'error' => $mailException->getMessage()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Your support request has been submitted successfully. We will get back to you within 24 hours.',
                'ticket_number' => $ticket->ticket_number,
                'ticket_id' => $ticket->id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create support ticket', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit support request. Please try again later.'
            ], 500);
        }
    }

    /**
     * Determine ticket priority based on category
     */
    private function determinePriority(string $category): string
    {
        return match($category) {
            'payment' => 'high',
            'technical' => 'medium',
            'verification' => 'medium',
            'account' => 'medium',
            'feedback' => 'low',
            default => 'medium',
        };
    }
}