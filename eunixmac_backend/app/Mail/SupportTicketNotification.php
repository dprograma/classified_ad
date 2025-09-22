<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\SupportTicket;

class SupportTicketNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $ticket;
    public $type;

    /**
     * Create a new message instance.
     */
    public function __construct(SupportTicket $ticket, string $type = 'new')
    {
        $this->ticket = $ticket;
        $this->type = $type;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->type) {
            'new' => 'New Support Ticket: ' . $this->ticket->ticket_number,
            'updated' => 'Support Ticket Updated: ' . $this->ticket->ticket_number,
            'response' => 'New Response on Ticket: ' . $this->ticket->ticket_number,
            default => 'Support Ticket Notification: ' . $this->ticket->ticket_number,
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.support-ticket',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
