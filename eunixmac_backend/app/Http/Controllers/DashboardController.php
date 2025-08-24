<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $ads = $user->ads()
            ->with(['category:id,name', 'images:id,ad_id,image_path'])
            ->select('id', 'user_id', 'category_id', 'title', 'price', 'created_at', 'status', 'is_boosted')
            ->latest()
            ->get();

        $totalAds = $ads->count();
        $activeAds = $ads->where('status', 'active')->count();
        $messageCount = $user->sentMessages()->count() + $user->receivedMessages()->count();
        $unreadMessages = $user->receivedMessages()->count(); // For now, all messages are considered unread since no read_at column exists
        $reviewCount = $user->reviews()->count();
        
        // Calculate total views for user's ads (placeholder - implement if you have views tracking)
        $totalViews = 0; // Views tracking not implemented yet

        return response()->json([
            'user' => $user,
            'ads' => $ads,
            'stats' => [
                'total_ads' => $totalAds,
                'active_ads' => $activeAds,
                'total_views' => $totalViews,
                'unread_messages' => $unreadMessages,
                'ads_count' => $totalAds,
                'message_count' => $messageCount,
                'review_count' => $reviewCount,
            ],
            'affiliate' => $user->is_affiliate ? [
                'total_referrals' => 0, // Implement referral tracking
                'successful_referrals' => 0,
                'total_earnings' => 0,
                'pending_earnings' => 0,
                'recent_referrals' => []
            ] : null,
            'materials' => $user->is_agent ? [] : null, // Implement educational materials tracking
            'conversations' => [], // Implement conversations
            'payments' => $user->payments()->latest()->take(10)->get(),
            'analytics' => [
                'views_this_month' => 0,
                'messages_this_month' => 0,
                'sales_this_month' => 0
            ],
            'recent_activity' => [] // Implement activity tracking
        ]);
    }
}