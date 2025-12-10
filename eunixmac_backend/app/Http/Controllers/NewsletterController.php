<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        try {
            // Validate email
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please provide a valid email address.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $email = strtolower(trim($request->email));

            // Check if already subscribed
            $existing = NewsletterSubscription::where('email', $email)->first();

            if ($existing) {
                // If they were unsubscribed, resubscribe them
                if ($existing->status === 'unsubscribed') {
                    $existing->resubscribe();

                    return response()->json([
                        'success' => true,
                        'message' => 'Welcome back! You have been resubscribed to our newsletter.',
                        'data' => [
                            'email' => $existing->email,
                            'status' => $existing->status
                        ]
                    ], 200);
                }

                // Already subscribed and active
                return response()->json([
                    'success' => true,
                    'message' => 'You are already subscribed to our newsletter.',
                    'data' => [
                        'email' => $existing->email,
                        'status' => $existing->status
                    ]
                ], 200);
            }

            // Create new subscription
            $subscription = NewsletterSubscription::create([
                'email' => $email,
                'status' => 'active',
                'verified_at' => now(), // Auto-verify for simplicity
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'source' => $request->input('source', 'website'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully subscribed to newsletter! Thank you for joining us.',
                'data' => [
                    'email' => $subscription->email,
                    'status' => $subscription->status
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Newsletter subscription error:', [
                'email' => $request->email ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to subscribe. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please provide a valid email address.',
                    'errors' => $validator->errors()
                ], 422);
            }

            $email = strtolower(trim($request->email));

            $subscription = NewsletterSubscription::where('email', $email)->first();

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email address not found in our newsletter list.'
                ], 404);
            }

            if ($subscription->status === 'unsubscribed') {
                return response()->json([
                    'success' => true,
                    'message' => 'You are already unsubscribed from our newsletter.'
                ], 200);
            }

            $subscription->unsubscribe();

            return response()->json([
                'success' => true,
                'message' => 'Successfully unsubscribed from newsletter. We\'re sorry to see you go!'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Newsletter unsubscribe error:', [
                'email' => $request->email ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to unsubscribe. Please try again later.'
            ], 500);
        }
    }

    /**
     * Verify email subscription (optional feature)
     */
    public function verify($token)
    {
        try {
            $subscription = NewsletterSubscription::where('verification_token', $token)->first();

            if (!$subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired verification token.'
                ], 404);
            }

            if ($subscription->isVerified()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Your email is already verified.'
                ], 200);
            }

            $subscription->markAsVerified();

            return response()->json([
                'success' => true,
                'message' => 'Email successfully verified! Thank you for subscribing.'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Newsletter verification error:', [
                'token' => $token,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to verify email. Please try again later.'
            ], 500);
        }
    }

    /**
     * Admin: Get all subscriptions with pagination and filters
     */
    public function index(Request $request)
    {
        try {
            // Check admin authorization
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $perPage = $request->input('per_page', 20);
            $status = $request->input('status');
            $search = $request->input('search');

            $query = NewsletterSubscription::query();

            // Filter by status
            if ($status) {
                if ($status === 'active') {
                    $query->active();
                } elseif ($status === 'unsubscribed') {
                    $query->unsubscribed();
                } elseif ($status === 'verified') {
                    $query->verified();
                }
            }

            // Search by email
            if ($search) {
                $query->where('email', 'like', "%{$search}%");
            }

            // Order by most recent first
            $query->orderBy('created_at', 'desc');

            $subscriptions = $query->paginate($perPage);

            return response()->json($subscriptions, 200);

        } catch (\Exception $e) {
            \Log::error('Newsletter index error:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch subscriptions.'
            ], 500);
        }
    }

    /**
     * Admin: Get newsletter statistics
     */
    public function statistics()
    {
        try {
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $stats = [
                'total' => NewsletterSubscription::count(),
                'active' => NewsletterSubscription::active()->count(),
                'unsubscribed' => NewsletterSubscription::unsubscribed()->count(),
                'verified' => NewsletterSubscription::verified()->count(),
                'today' => NewsletterSubscription::whereDate('created_at', today())->count(),
                'this_week' => NewsletterSubscription::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
                'this_month' => NewsletterSubscription::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'growth_rate' => $this->calculateGrowthRate(),
                'recent_subscriptions' => NewsletterSubscription::active()
                    ->latest()
                    ->take(5)
                    ->get(['email', 'created_at']),
            ];

            return response()->json($stats, 200);

        } catch (\Exception $e) {
            \Log::error('Newsletter statistics error:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics.'
            ], 500);
        }
    }

    /**
     * Admin: Delete a subscription
     */
    public function destroy($id)
    {
        try {
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $subscription = NewsletterSubscription::findOrFail($id);
            $subscription->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subscription deleted successfully.'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Newsletter delete error:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subscription.'
            ], 500);
        }
    }

    /**
     * Admin: Export subscriptions to CSV
     */
    public function export(Request $request)
    {
        try {
            if (!auth()->check() || !auth()->user()->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $status = $request->input('status', 'active');

            $query = NewsletterSubscription::query();

            if ($status === 'active') {
                $query->active();
            } elseif ($status === 'unsubscribed') {
                $query->unsubscribed();
            }

            $subscriptions = $query->orderBy('created_at', 'desc')->get();

            $csv = "Email,Status,Subscribed At,Verified,Unsubscribed At\n";

            foreach ($subscriptions as $sub) {
                $csv .= sprintf(
                    "%s,%s,%s,%s,%s\n",
                    $sub->email,
                    $sub->status,
                    $sub->created_at->format('Y-m-d H:i:s'),
                    $sub->isVerified() ? 'Yes' : 'No',
                    $sub->unsubscribed_at ? $sub->unsubscribed_at->format('Y-m-d H:i:s') : 'N/A'
                );
            }

            return response($csv, 200)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="newsletter_subscriptions_' . date('Y-m-d') . '.csv"');

        } catch (\Exception $e) {
            \Log::error('Newsletter export error:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to export subscriptions.'
            ], 500);
        }
    }

    /**
     * Calculate growth rate (private helper)
     */
    private function calculateGrowthRate()
    {
        try {
            $currentMonth = NewsletterSubscription::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            $lastMonth = NewsletterSubscription::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();

            if ($lastMonth == 0) {
                return $currentMonth > 0 ? 100 : 0;
            }

            $growthRate = (($currentMonth - $lastMonth) / $lastMonth) * 100;
            return round($growthRate, 2);

        } catch (\Exception $e) {
            return 0;
        }
    }
}
