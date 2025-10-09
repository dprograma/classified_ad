<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends VerifyEmailBase
{
    use Queueable;

    /**
     * Get the verification URL for the given notifiable.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function verificationUrl($notifiable)
    {
        // Generate the temporary signed URL to the backend verification endpoint.
        $backendSignedUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // Extract the path and query from the generated URL.
        // This is more robust than passing the whole URL.
        $urlParts = parse_url($backendSignedUrl);
        $path = $urlParts['path']; // e.g., /api/email/verify/1/somehash
        $query = $urlParts['query']; // e.g., expires=16...&signature=...

        // Get the frontend URL from the config.
        // IMPORTANT: Ensure FRONTEND_URL is set in your .env file!
        $frontendUrl = config('app.frontend_url');

        // Build the final URL pointing to your frontend.
        return "{$frontendUrl}/verify-email?path=" . urlencode($path) . "&query=" . urlencode($query);
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Eunixma Account')
            ->greeting('Hello!')
            ->line('Thanks for signing up for Eunixma, the best place for classified ads. Please click the button below to verify your email address and get started.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('If you did not create an account, you can safely ignore this email.');
    }
}
