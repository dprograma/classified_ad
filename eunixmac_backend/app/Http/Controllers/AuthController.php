<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\PasswordReset;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Access\AuthorizationException;
use App\Exceptions\Custom\PermissionDeniedException;

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
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|string|max:50|unique:users,phone_number,' . $user->id,
            'password' => 'sometimes|string|min:8|confirmed',
            'profile_picture' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('phone_number')) {
            $user->phone_number = $request->phone_number;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
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
        $request->validate(['email' => 'required|email|exists:users,email']);

        $token = Str::random(60);

        PasswordReset::create([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        // Send password reset email
        Mail::send('emails.password_reset', ['token' => $token], function ($message) use ($request) {
            $message->to($request->email);
            $message->subject('Reset your password');
        });

        return response()->json(['message' => 'Password reset email sent.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
            'token' => 'required|string',
        ]);

        $passwordReset = PasswordReset::where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$passwordReset || now()->subMinutes(60)->isAfter($passwordReset->created_at)) {
            throw new PermissionDeniedException('Invalid or expired token.');
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->password = Hash::make($request->password);
        $user->save();

        $passwordReset->delete();

        return response()->json(['message' => 'Password has been reset.']);
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