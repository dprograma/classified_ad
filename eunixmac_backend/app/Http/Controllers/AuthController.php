<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
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

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone_number' => 'required|string|max:50|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
        ]);

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
        $user->is_agent = true;
        $user->save();

        return response()->json([
            'message' => 'User is now an agent',
        ]);
    }

    public function becomeAffiliate(Request $request)
    {
        $user = $request->user();
        $user->is_affiliate = true;
        $user->save();

        // Generate and store a unique referral link for the user
        // For simplicity, we'll just use the user ID as the referral code for now
        // In a real application, you'd generate a more robust unique code
        $user->referral_code = uniqid('affiliate_'); // Add a referral_code column to users table
        $user->save();

        return response()->json([
            'message' => 'User is now an affiliate',
            'referral_link' => env('APP_URL') . '/register?ref=' . $user->referral_code,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'phone_number' => 'sometimes|string|max:50|unique:users,phone_number,' . $user->id,
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->filled('phone_number')) {
            $user->phone_number = $request->phone_number;
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

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw new PermissionDeniedException('Incorrect password');
        }

        // Delete profile picture if exists
        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // To prevent user enumeration, we can return a success message even if the user doesn't exist.
            return response()->json(['message' => 'If your email address exists in our system, you will receive a password reset link.']);
        }

        // Create a new token
        $token = Password::broker()->createToken($user);

        // Send the custom notification
        $user->notify(new \App\Notifications\CustomResetPassword($token));

        return response()->json(['message' => 'Password reset email sent.']);
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
}