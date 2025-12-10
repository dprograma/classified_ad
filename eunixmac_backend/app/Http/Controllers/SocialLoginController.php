<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    /**
     * Redirect to social provider authentication page
     *
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirect($provider)
    {
        try {
            // Validate provider
            if (!in_array($provider, ['google', 'facebook', 'twitter'])) {
                return redirect()->away(
                    config('app.frontend_url') . '/login?error=invalid_provider'
                );
            }

            // Generate and store state parameter for CSRF protection
            $state = Str::random(40);
            session(['oauth_state' => $state]);

            if ($provider === 'facebook') {
                // Facebook specific configuration
                $clientId = config('services.facebook.client_id');
                $redirectUri = urlencode(config('services.facebook.redirect'));

                if (!$clientId || !$redirectUri) {
                    Log::error('Facebook OAuth configuration missing');
                    return redirect()->away(
                        config('app.frontend_url') . '/login?error=configuration_error'
                    );
                }

                $url = "https://www.facebook.com/v18.0/dialog/oauth?" . http_build_query([
                    'client_id' => $clientId,
                    'redirect_uri' => urldecode($redirectUri),
                    'scope' => 'public_profile', // Only request public_profile until email is approved
                    'response_type' => 'code',
                    'state' => $state,
                ]);

                return redirect($url);
            } elseif ($provider === 'google') {
                // Google specific configuration
                return Socialite::driver($provider)
                    ->stateless()
                    ->with(['state' => $state])
                    ->scopes(['openid', 'profile', 'email'])
                    ->redirect();
            } elseif ($provider === 'twitter') {
                // Twitter/X OAuth 2.0
                return Socialite::driver($provider)
                    ->stateless()
                    ->with(['state' => $state])
                    ->redirect();
            }

            return Socialite::driver($provider)
                ->stateless()
                ->with(['state' => $state])
                ->redirect();

        } catch (\Exception $e) {
            Log::error('Social login redirect error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->away(
                config('app.frontend_url') . '/login?error=redirect_failed'
            );
        }
    }

    /**
     * Handle callback from social provider
     *
     * @param string $provider
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback($provider)
    {
        try {
            // Validate provider
            if (!in_array($provider, ['google', 'facebook', 'twitter'])) {
                Log::warning('Invalid social provider attempted', ['provider' => $provider]);
                return redirect()->away(
                    config('app.frontend_url') . '/login?error=invalid_provider'
                );
            }

            // Get user from social provider
            $socialiteUser = Socialite::driver($provider)->stateless()->user();

            if (!$socialiteUser) {
                throw new \Exception('Failed to retrieve user from provider');
            }

            // Extract user information
            $email = $socialiteUser->getEmail();
            $name = $socialiteUser->getName() ?: $socialiteUser->getNickname() ?: 'User';
            $providerId = $socialiteUser->getId();
            $providerToken = $socialiteUser->token;
            $avatar = $socialiteUser->getAvatar();

            // Handle missing email
            if (!$email) {
                // Some providers may not return email
                Log::warning('Social login without email', [
                    'provider' => $provider,
                    'provider_id' => $providerId
                ]);

                // Generate placeholder email
                $email = $provider . '_user_' . $providerId . '@' . $provider . '.social';
            }

            // Check if user exists with this provider
            $user = User::where('provider', $provider)
                ->where('provider_id', $providerId)
                ->first();

            if (!$user) {
                // Check if email already exists (for linking accounts)
                if (strpos($email, '.social') === false) {
                    $existingUser = User::where('email', $email)->first();

                    if ($existingUser) {
                        // User exists with this email, link the social account
                        $existingUser->update([
                            'provider' => $provider,
                            'provider_id' => $providerId,
                            'provider_token' => $providerToken,
                            'email_verified_at' => $existingUser->email_verified_at ?? now(),
                        ]);

                        $user = $existingUser;
                        Log::info('Linked existing account to social provider', [
                            'user_id' => $user->id,
                            'provider' => $provider
                        ]);
                    }
                }

                // Create new user if not found
                if (!$user) {
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'provider' => $provider,
                        'provider_id' => $providerId,
                        'provider_token' => $providerToken,
                        'profile_picture' => $avatar,
                        'email_verified_at' => now(), // Social logins are pre-verified
                        'referral_code' => $this->generateUniqueReferralCode(),
                    ]);

                    // Create default user settings
                    $user->settings()->create([
                        'email_notifications' => true,
                        'sms_notifications' => false,
                    ]);

                    Log::info('Created new user via social login', [
                        'user_id' => $user->id,
                        'provider' => $provider
                    ]);
                }
            } else {
                // Update existing social user's token and avatar
                $user->update([
                    'provider_token' => $providerToken,
                    'profile_picture' => $avatar ?? $user->profile_picture,
                ]);
            }

            // Log the user in
            Auth::login($user);

            // Create access token with 30 day expiration
            $token = $user->createToken('social_auth_token', ['*'], now()->addDays(30))
                ->plainTextToken;

            Log::info('Social login successful', [
                'user_id' => $user->id,
                'provider' => $provider
            ]);

            // Redirect to frontend with token
            $frontendUrl = config('app.frontend_url');
            return redirect()->away("{$frontendUrl}/login?token={$token}&social=true");

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            Log::error('Social login CSRF/state validation failed', [
                'provider' => $provider,
                'error' => $e->getMessage()
            ]);

            return redirect()->away(
                config('app.frontend_url') . '/login?error=security_check_failed'
            );

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            Log::error('Social provider API error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'response' => $e->getResponse()->getBody()->getContents()
            ]);

            return redirect()->away(
                config('app.frontend_url') . '/login?error=provider_error'
            );

        } catch (\Exception $e) {
            Log::error('Social login callback error', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->away(
                config('app.frontend_url') . '/login?error=authentication_failed'
            );
        }
    }

    /**
     * Generate a unique referral code
     *
     * @return string
     */
    private function generateUniqueReferralCode()
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}
