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
            ->select('id', 'user_id', 'category_id', 'title', 'price', 'created_at')
            ->latest()
            ->get();

        $adCount = $ads->count();
        $messageCount = $user->messages()->count();
        $reviewCount = $user->reviews()->count();

        return response()->json([
            'user' => $user,
            'ads' => $ads,
            'stats' => [
                'ad_count' => $adCount,
                'message_count' => $messageCount,
                'review_count' => $reviewCount,
            ],
        ]);
    }
}