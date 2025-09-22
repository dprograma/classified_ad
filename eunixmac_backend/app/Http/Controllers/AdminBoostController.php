<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Ad;
use Carbon\Carbon;

class AdminBoostController extends Controller
{
    /**
     * Get boost revenue analytics
     */
    public function analytics(Request $request)
    {
        // Total boost revenue
        $totalRevenue = Payment::where('payable_type', 'ad_boost')
            ->where('status', 'success')
            ->sum('amount');

        // Monthly revenue for current year
        $monthlyRevenue = Payment::where('payable_type', 'ad_boost')
            ->where('status', 'success')
            ->whereYear('created_at', now()->year)
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->mapWithKeys(function ($item) {
                return [Carbon::create()->month($item->month)->format('M') => $item->total];
            });

        // Active boost stats
        $activeBoostedAds = Ad::where('is_boosted', true)
            ->where('boost_expires_at', '>', now())
            ->count();

        $expiredBoosts = Ad::where('is_boosted', true)
            ->where('boost_expires_at', '<', now())
            ->count();

        // Popular boost durations
        $boostDurations = Payment::where('payable_type', 'ad_boost')
            ->where('status', 'success')
            ->selectRaw('
                CASE
                    WHEN amount = 1000 THEN "7 days"
                    WHEN amount = 1800 THEN "14 days"
                    WHEN amount = 3500 THEN "30 days"
                    ELSE "Unknown"
                END as duration,
                COUNT(*) as count
            ')
            ->groupBy('duration')
            ->get();

        // Recent boost payments
        $recentPayments = Payment::where('payable_type', 'ad_boost')
            ->where('status', 'success')
            ->with(['user:id,name,email', 'payable:id,title'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'active_boosted_ads' => $activeBoostedAds,
            'expired_boosts' => $expiredBoosts,
            'boost_durations' => $boostDurations,
            'recent_payments' => $recentPayments
        ]);
    }

    /**
     * Get detailed boost statistics
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30'); // days

        $startDate = now()->subDays($period);

        $stats = [
            'total_boost_purchases' => Payment::where('payable_type', 'ad_boost')
                ->where('status', 'success')
                ->where('created_at', '>=', $startDate)
                ->count(),

            'total_revenue' => Payment::where('payable_type', 'ad_boost')
                ->where('status', 'success')
                ->where('created_at', '>=', $startDate)
                ->sum('amount'),

            'average_order_value' => Payment::where('payable_type', 'ad_boost')
                ->where('status', 'success')
                ->where('created_at', '>=', $startDate)
                ->avg('amount'),

            'conversion_rate' => $this->calculateConversionRate($startDate),

            'top_performing_ads' => $this->getTopPerformingBoostedAds($startDate),
        ];

        return response()->json($stats);
    }

    private function calculateConversionRate($startDate)
    {
        $totalViews = \App\Models\AdView::where('viewed_at', '>=', $startDate)->count();
        $totalBoosts = Payment::where('payable_type', 'ad_boost')
            ->where('status', 'success')
            ->where('created_at', '>=', $startDate)
            ->count();

        return $totalViews > 0 ? round(($totalBoosts / $totalViews) * 100, 2) : 0;
    }

    private function getTopPerformingBoostedAds($startDate)
    {
        return Ad::where('is_boosted', true)
            ->where('boost_expires_at', '>', now())
            ->withCount(['views' => function ($query) use ($startDate) {
                $query->where('viewed_at', '>=', $startDate);
            }])
            ->orderBy('views_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'price', 'boost_expires_at']);
    }
}
