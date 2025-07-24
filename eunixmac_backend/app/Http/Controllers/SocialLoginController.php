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
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback($provider)
    {
        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->away(config('app.frontend_url') . '/login?error=provider_error');
        }

        $user = User::where('provider', $provider)
            ->where('provider_id', $socialiteUser->getId())
            ->first();

        if (!$user) {
            $user = User::where('email', $socialiteUser->getEmail())->first();

            if ($user) {
                // Link account
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialiteUser->getId(),
                    'provider_token' => $socialiteUser->token,
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $socialiteUser->getName(),
                    'email' => $socialiteUser->getEmail(),
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