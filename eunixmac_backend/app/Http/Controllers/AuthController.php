<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\UserSettings;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Access\AuthorizationException;
use App\Exceptions\Custom\PermissionDeniedException;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'ref' => 'nullable|string|max:8'
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
        ];

        // Handle referral code if provided
        if ($request->ref) {
            $referrer = User::where('referral_code', $request->ref)->first();
            if ($referrer && $referrer->is_affiliate) {
                $userData['referred_by'] = $referrer->id;
            }
        }

        $user = User::create($userData);

        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw new PermissionDeniedException('Invalid login details');
        }

        $user = User::where('email', $request->email)->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }

    public function becomeAgent(Request $request)
    {
        $user = $request->user();
        
        if ($user->is_agent) {
            return response()->json([
                'message' => 'User is already an agent',
            ], 400);
        }
        
        $user->is_agent = true;
        $user->save();

        return response()->json([
            'message' => 'Congratulations! You are now an agent. You can start uploading educational materials.',
            'user' => $user
        ]);
    }

    public function becomeAffiliate(Request $request)
    {
        $user = $request->user();
        
        if ($user->is_affiliate) {
            return response()->json([
                'message' => 'User is already an affiliate',
                'referral_link' => env('APP_URL') . '?ref=' . $user->referral_code,
            ], 400);
        }
        
        $user->is_affiliate = true;
        
        // Generate and store a unique referral code if not exists
        if (!$user->referral_code) {
            $user->referral_code = strtoupper(Str::random(8));
        }
        
        $user->save();

        return response()->json([
            'message' => 'Welcome to our affiliate program! Your unique referral link has been generated.',
            'referral_link' => env('APP_URL') . '?ref=' . $user->referral_code,
            'user' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:50|unique:users,phone_number,' . $user->id,
            'location' => 'sometimes|string|max:255',
            'bio' => 'sometimes|string|max:1000',
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->filled('phone_number')) {
            $user->phone_number = $request->phone_number;
        }
        if ($request->filled('location')) {
            $user->location = $request->location;
        }
        if ($request->filled('bio')) {
            $user->bio = $request->bio;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if it exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'marketing_emails' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'show_phone' => 'sometimes|boolean',
            'show_email' => 'sometimes|boolean',
            'language' => 'sometimes|string|in:en,pidgin',
        ]);

        $settings = $user->settings()->firstOrCreate(['user_id' => $user->id]);
        $settings->update($request->all());

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings,
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw new PermissionDeniedException('Incorrect password');
        }

        try {
            // Use database transaction to ensure all deletions succeed or fail together
            \DB::transaction(function () use ($user) {
                // Delete profile picture if exists
                if ($user->profile_picture) {
                    Storage::disk('public')->delete($user->profile_picture);
                }

                // Delete all related data in the correct order to avoid foreign key constraints

                // 1. Delete user settings
                $user->settings()->delete();

                // 2. Delete all messages sent and received by the user
                $user->sentMessages()->delete();
                $user->receivedMessages()->delete();

                // 3. Delete all payments made by the user
                $user->payments()->delete();

                // 4. Delete all ads and their related data
                foreach ($user->ads as $ad) {
                    // Delete ad views for this ad
                    \App\Models\AdView::where('ad_id', $ad->id)->delete();

                    // Delete messages related to this ad
                    \App\Models\Message::where('ad_id', $ad->id)->delete();

                    // Delete any ad-specific images or files if needed
                    // (Add logic here if ads have uploaded images)

                    // Delete the ad itself
                    $ad->delete();
                }

                // 5. Update referral relationships - set referred_by to null for referred users
                // instead of deleting them (they should remain as independent users)
                \App\Models\User::where('referred_by', $user->id)->update(['referred_by' => null]);

                // 6. Delete all API tokens for this user
                $user->tokens()->delete();

                // 7. Finally, delete the user record
                $user->delete();
            });

            return response()->json(['message' => 'Account deleted successfully']);

        } catch (\Exception $e) {
            \Log::error('Account deletion failed for user ' . $user->id . ': ' . $e->getMessage());

            return response()->json([
                'message' => 'Account deletion failed. Please try again or contact support.',
                'error' => 'An error occurred while deleting your account.'
            ], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'The email address you entered is not registered in our system.'], 404);
        }

        // Create a new token
        $token = Password::broker()->createToken($user);

        // Send the custom notification
        $user->notify(new \App\Notifications\CustomResetPassword($token));

        return response()->json(['message' => 'Password reset link has been sent to your email. Please check your inbox.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Here we will attempt to reset the user's password. This function will
        // validate the token and the user's email address. It will also
        // catch any errors that occur during this process.
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        // If the password was successfully reset, we will redirect the user back to
        // the application's home page. Otherwise, we will return an error message.
        if ($status == Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        throw new PermissionDeniedException(__($status));
    }

    public function verifyEmail(Request $request)
    {
        $user = User::findOrFail($request->route('id'));

        if (! hash_equals((string) $request->route('hash'),
                          sha1($user->getEmailForVerification()))) {
            throw new PermissionDeniedException('Invalid verification link.');
        }

        if ($user->hasVerifiedEmail()) {
            throw new PermissionDeniedException('Email already verified.');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function resendVerificationEmail(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            throw new PermissionDeniedException('Email already verified.');
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email sent.']);
    }

    /**
     * Get list of banks from Paystack
     */
    public function getBanks()
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/bank?country=nigeria');

        if ($response->successful()) {
            return response()->json($response->json()['data']);
        }

        return response()->json([
            'message' => 'Could not fetch banks list'
        ], 500);
    }

    /**
     * Get user's bank account details
     */
    public function getBankAccount(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'bank_account' => [
                'bank_name' => $user->bank_name,
                'bank_code' => $user->bank_code,
                'account_number' => $user->bank_account_number,
                'account_name' => $user->bank_account_name,
            ],
        ]);
    }

    /**
     * Update bank account details
     */
    public function updateBankAccount(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:255',
            'bank_code' => 'required|string|max:20',
            'bank_account_number' => 'required|string|max:20',
            'bank_account_name' => 'required|string|max:255',
        ]);

        $user = $request->user();

        // Verify bank account with Paystack
        $verifyResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
        ])->get('https://api.paystack.co/bank/resolve', [
            'account_number' => $request->bank_account_number,
            'bank_code' => $request->bank_code,
        ]);

        if (!$verifyResponse->successful() || !$verifyResponse->json()['status']) {
            return response()->json([
                'message' => 'Could not verify bank account. Please check your details.',
                'error' => $verifyResponse->json()['message'] ?? 'Verification failed'
            ], 400);
        }

        $verifiedData = $verifyResponse->json()['data'];

        $user->update([
            'bank_name' => $request->bank_name,
            'bank_code' => $request->bank_code,
            'bank_account_number' => $request->bank_account_number,
            'bank_account_name' => $verifiedData['account_name'] ?? $request->bank_account_name,
        ]);

        return response()->json([
            'message' => 'Bank account updated successfully',
            'bank_account' => [
                'bank_name' => $user->bank_name,
                'bank_code' => $user->bank_code,
                'account_number' => $user->bank_account_number,
                'account_name' => $user->bank_account_name,
            ],
        ]);
    }
}