<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    public function redirect($provider)
    {
        if ($provider === 'facebook') {
            // Manually construct Facebook OAuth URL with only public_profile scope
            $clientId = config('services.facebook.client_id');
            $redirectUri = urlencode(config('services.facebook.redirect'));

            $url = "https://www.facebook.com/v18.0/dialog/oauth?" . http_build_query([
                'client_id' => $clientId,
                'redirect_uri' => $redirectUri,
                'scope' => 'public_profile',
                'response_type' => 'code',
            ]);

            return redirect($url);
        } elseif ($provider === 'google') {
            // Explicitly set Google scopes
            return Socialite::driver($provider)
                ->stateless()
                ->scopes(['openid', 'profile', 'email'])
                ->redirect();
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback($provider)
    {
        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->away(config('app.frontend_url') . '/login?error=provider_error');
        }

        // Handle cases where email might not be available
        $email = $socialiteUser->getEmail();
        $name = $socialiteUser->getName() ?: $socialiteUser->getNickname() ?: 'User';

        // If no email is provided by the social provider, generate a placeholder
        if (!$email) {
            $email = $provider . '_user_' . $socialiteUser->getId() . '@' . $provider . '.social';
        }

        $user = User::where('provider', $provider)
            ->where('provider_id', $socialiteUser->getId())
            ->first();

        if (!$user) {
            // Only check for existing email if we have a real email (not a placeholder)
            if (strpos($email, '.social') === false) {
                $user = User::where('email', $email)->first();
            }

            if ($user) {
                // Link existing account
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialiteUser->getId(),
                    'provider_token' => $socialiteUser->token,
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'provider' => $provider,
                    'provider_id' => $socialiteUser->getId(),
                    'provider_token' => $socialiteUser->token,
                    'email_verified_at' => now(), // Social logins are considered verified
                ]);
            }
        }

        Auth::login($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return redirect()->away(config('app.frontend_url') . '/login?token=' . $token);
    }
}