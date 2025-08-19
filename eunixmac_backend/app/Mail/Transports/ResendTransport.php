<?php

namespace App\Mail\Transports;

use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;
use Illuminate\Support\Facades\Http;

class ResendTransport extends AbstractTransport
{
    protected $key;

    public function __construct(string $key)
    {
        parent::__construct();
        $this->key = $key;
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $payload = [
            'from' => $this->formatAddress($email->getFrom()[0]),
            'to' => array_map([$this, 'formatAddress'], $email->getTo()),
            'subject' => $email->getSubject(),
            'html' => $email->getHtmlBody() ?? $email->getTextBody(),
        ];

        if ($email->getCc()) {
            $payload['cc'] = array_map([$this, 'formatAddress'], $email->getCc());
        }

        if ($email->getBcc()) {
            $payload['bcc'] = array_map([$this, 'formatAddress'], $email->getBcc());
        }

        if ($email->getReplyTo()) {
            $payload['reply_to'] = array_map([$this, 'formatAddress'], $email->getReplyTo());
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->key,
            'Content-Type' => 'application/json',
        ])->post('https://api.resend.com/emails', $payload);

        if ($response->failed()) {
            throw new \Exception('Failed to send email via Resend: ' . $response->body());
        }
    }

    private function formatAddress(\Symfony\Component\Mime\Address $address): string
    {
        if ($address->getName()) {
            return $address->getName() . ' <' . $address->getAddress() . '>';
        }
        return $address->getAddress();
    }

    public function __toString(): string
    {
        return 'resend';
    }
}
