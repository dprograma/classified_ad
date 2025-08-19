<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Support\Facades\Notification;

class MailTest extends TestCase
{
    use RefreshDatabase;

    public function test_verification_email_can_be_sent(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email_verified_at' => null
        ]);

        $user->notify(new CustomVerifyEmail);

        Notification::assertSentTo(
            $user,
            CustomVerifyEmail::class
        );
    }
}
