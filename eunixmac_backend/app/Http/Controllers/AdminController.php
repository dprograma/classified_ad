<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Ad;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:admin');
    }

    public function getUsers()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function verifyUser(Request $request, User $user)
    {
        $user->is_verified = true;
        $user->save();
        return response()->json($user);
    }

    public function getAds()
    {
        $ads = Ad::with(['user', 'category', 'images', 'customFields'])->get();
        return response()->json($ads);
    }

    public function approveAd(Request $request, Ad $ad)
    {
        $ad->status = 'active';
        $ad->save();
        return response()->json($ad);
    }

    public function rejectAd(Request $request, Ad $ad)
    {
        $ad->status = 'rejected';
        $ad->save();
        return response()->json($ad);
    }

    public function getDashboardStats()
    {
        $totalUsers = User::count();
        $totalAds = Ad::count();
        $pendingAds = Ad::where('status', 'pending_approval')->count();
        $totalAgents = User::where('is_agent', true)->count();
        $totalAffiliates = User::where('is_affiliate', true)->count();

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalAds' => $totalAds,
            'pendingAds' => $pendingAds,
            'totalAgents' => $totalAgents,
            'totalAffiliates' => $totalAffiliates,
        ]);
    }
}