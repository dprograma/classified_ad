<?php

namespace App\Mail\Transports;

use Illuminate\Mail\Transport\Transport;
use Illuminate\Support\Facades\Http;

class ResendTransport extends Transport
{
    protected $key;

    public function __construct(string $key)
    {
        $this->key = $key;
    }

    public function send(\Swift_Mime_SimpleMessage $message, &$failedRecipients = null)
    {
        $this->beforeSendPerformed($message);

        $payload = $this->getPayload($message);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->key,
            'Content-Type' => 'application/json',
        ])->post('https://api.resend.com/emails', $payload);

        if ($response->failed()) {
            throw new \Exception('Failed to send email via Resend: ' . $response->body());
        }

        $this->sendPerformed($message);

        return $this->numberOfRecipients($message);
    }

    protected function getPayload(\Swift_Mime_SimpleMessage $message)
    {
        return [
            'from' => $this->mapContactsToEmail($message->getFrom()),
            'to' => $this->mapContactsToEmail($message->getTo()),
            'subject' => $message->getSubject(),
            'html' => $message->getBody(),
        ];
    }

    protected function mapContactsToEmail(array $contacts)
    {
        $emails = [];
        foreach ($contacts as $address => $name) {
            $emails[] = $name ? $name . ' <' . $address . '>' : $address;
        }
        return implode(',', $emails);
    }
}
