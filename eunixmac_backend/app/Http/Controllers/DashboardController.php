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
            ->select('id', 'user_id', 'category_id', 'title', 'price', 'created_at', 'status')
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
            'affiliate' => $user->is_affiliate ? $this->getAffiliateData($user) : null,
            'materials' => $user->is_agent ? $this->getEducationalMaterials($user) : null,
            'earnings' => $user->is_agent ? $this->getEarningsData($user) : null,
            'conversations' => $this->getConversations($user),
            'payments' => $user->payments()->latest()->take(10)->get(),
            'analytics' => [
                'views_this_month' => 0,
                'messages_this_month' => 0,
                'sales_this_month' => 0
            ],
            'recent_activity' => [] // Implement activity tracking
        ]);
    }

    /**
     * Get conversations for the user
     */
    private function getConversations($user)
    {
        $conversations = [];

        // Get all messages where user is sender or receiver
        $messages = \App\Models\Message::where(function($query) use ($user) {
                $query->where('sender_id', $user->id)
                      ->orWhere('receiver_id', $user->id);
            })
            ->with(['ad:id,title,user_id', 'sender:id,name,email,profile_picture', 'receiver:id,name,email,profile_picture'])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        // Group messages by ad and conversation partner
        $groupedMessages = $messages->groupBy(function($message) use ($user) {
            $otherId = $message->sender_id == $user->id ? $message->receiver_id : $message->sender_id;
            return $message->ad_id . '_' . $otherId;
        });

        foreach ($groupedMessages as $key => $messageGroup) {
            $lastMessage = $messageGroup->first();
            $otherId = $lastMessage->sender_id == $user->id ? $lastMessage->receiver_id : $lastMessage->sender_id;
            $otherUser = $lastMessage->sender_id == $user->id ? $lastMessage->receiver : $lastMessage->sender;

            // Count unread messages (messages where current user is receiver and not read)
            $unreadCount = $messageGroup->where('receiver_id', $user->id)->whereNull('read_at')->count();

            $conversations[] = [
                'id' => $key,
                'ad_id' => $lastMessage->ad_id,
                'ad' => $lastMessage->ad,
                'other_user' => $otherUser,
                'last_message' => [
                    'message' => $lastMessage->message,
                    'created_at' => $lastMessage->created_at,
                    'sender_id' => $lastMessage->sender_id
                ],
                'unread_count' => $unreadCount,
                'updated_at' => $lastMessage->created_at
            ];
        }

        // Sort by most recent activity
        usort($conversations, function($a, $b) {
            return $b['updated_at'] <=> $a['updated_at'];
        });

        return $conversations;
    }

    /**
     * Get books for the agent user
     */
    private function getEducationalMaterials($user)
    {
        // Books category IDs
        $educationalCategoryIds = [83, 84, 85, 86]; // Books, Past Questions, Ebooks, Publications

        $materials = $user->ads()
            ->whereIn('category_id', $educationalCategoryIds)
            ->whereNotNull('file_path')
            ->with(['category:id,name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ad) {
                // Calculate earnings from successful payments for this material
                $totalEarnings = \App\Models\Payment::where('payable_id', $ad->id)
                    ->where('payable_type', 'book')
                    ->where('status', 'success')
                    ->sum('amount');

                // Calculate sales count
                $salesCount = \App\Models\Payment::where('payable_id', $ad->id)
                    ->where('payable_type', 'educational_material')
                    ->where('status', 'success')
                    ->count();

                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'description' => $ad->description,
                    'price' => (float) $ad->price,
                    'type' => $ad->category->name ?? 'Unknown',
                    'status' => $this->mapAdStatusToMaterialStatus($ad->status),
                    'created_at' => $ad->created_at,
                    'updated_at' => $ad->updated_at,
                    'file_path' => $ad->file_path,
                    'preview_image_path' => $ad->preview_image_path,
                    'sales_count' => $salesCount,
                    'download_count' => $salesCount, // Using sales count as download count for now
                    'total_earnings' => (float) $totalEarnings,
                    'earnings' => (float) $totalEarnings,
                    'rating' => 5.0, // Default rating for now - can implement reviews later
                    'recent_sales' => [] // Can implement detailed sales tracking later
                ];
            });

        return $materials;
    }

    /**
     * Get earnings data for agent
     */
    private function getEarningsData($user)
    {
        $bookEarnings = $user->book_earnings;

        $totalWithdrawn = $user->withdrawals()
            ->whereIn('status', ['completed', 'processing'])
            ->sum('amount');

        $availableBalance = max(0, $bookEarnings - $totalWithdrawn);

        $pendingWithdrawals = $user->withdrawals()
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        return [
            'total_earnings' => (float) $bookEarnings,
            'total_withdrawn' => (float) $totalWithdrawn,
            'available_balance' => (float) $availableBalance,
            'pending_withdrawals' => (float) $pendingWithdrawals,
        ];
    }

    /**
     * Map ad status to educational material status
     */
    private function mapAdStatusToMaterialStatus($adStatus)
    {
        $statusMap = [
            'active' => 'approved',
            'pending_approval' => 'pending',
            'draft' => 'draft',
            'inactive' => 'inactive'
        ];

        return $statusMap[$adStatus] ?? 'pending';
    }

    /**
     * Get affiliate data for the user
     */
    private function getAffiliateData($user)
    {
        // Get all users referred by this affiliate
        $totalReferrals = $user->referrals()->count();

        // Get successful referrals (users who have made at least one payment)
        $successfulReferrals = $user->referrals()
            ->whereHas('payments', function($query) {
                $query->where('status', 'success');
            })
            ->count();

        // Calculate affiliate earnings (65% commission on first payment from each referral)
        $totalEarnings = 0;
        $pendingEarnings = 0;

        foreach ($user->referrals as $referral) {
            $firstPayment = $referral->payments()
                ->where('status', 'success')
                ->oldest()
                ->first();

            if ($firstPayment) {
                $commission = $firstPayment->amount * 0.65; // 65% commission
                $totalEarnings += $commission;
            }
        }

        // Get recent referrals (last 10)
        $recentReferrals = $user->referrals()
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->take(10)
            ->get()
            ->map(function($referral) {
                $firstPayment = $referral->payments()
                    ->where('status', 'success')
                    ->oldest()
                    ->first();

                return [
                    'id' => $referral->id,
                    'name' => $referral->name,
                    'email' => $referral->email,
                    'joined_at' => $referral->created_at,
                    'first_payment' => $firstPayment ? [
                        'amount' => $firstPayment->amount,
                        'commission' => $firstPayment->amount * 0.65,
                        'date' => $firstPayment->created_at
                    ] : null
                ];
            });

        return [
            'total_referrals' => $totalReferrals,
            'successful_referrals' => $successfulReferrals,
            'total_earnings' => (float) $totalEarnings,
            'pending_earnings' => (float) $pendingEarnings,
            'recent_referrals' => $recentReferrals
        ];
    }
}