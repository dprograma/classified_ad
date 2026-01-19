<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Message;
use App\Models\Ad;

class MessageController extends Controller
{
    public function index(Ad $ad)
    {
        $messages = Message::where('ad_id', $ad->id)
                            ->where(function ($query) use ($ad) {
                                $query->where('sender_id', auth()->id())
                                      ->orWhere('receiver_id', auth()->id());
                            })
                            ->orderBy('created_at', 'asc')
                            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, Ad $ad)
    {
        $request->validate([
            'message' => 'required|string',
            'receiver_id' => 'required|exists:users,id',
        ]);

        $message = Message::create([
            'ad_id' => $ad->id,
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        return response()->json($message, 201);
    }

    public function markAsRead($conversationId)
    {
        // Parse the conversation ID (format: ad_id_other_user_id)
        $parts = explode('_', $conversationId);
        if (count($parts) !== 2) {
            return response()->json(['message' => 'Invalid conversation ID format'], 400);
        }

        $adId = $parts[0];
        $otherUserId = $parts[1];
        $currentUserId = auth()->id();

        // Mark all messages in this conversation as read for the current user
        // We'll update messages where the current user is the receiver
        $updatedCount = Message::where('ad_id', $adId)
            ->where('receiver_id', $currentUserId)
            ->where(function($query) use ($otherUserId) {
                $query->where('sender_id', $otherUserId);
            })
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Messages marked as read',
            'updated_count' => $updatedCount
        ]);
    }

    /**
     * Get unread message count for notification badge
     */
    public function unreadCount()
    {
        $currentUserId = auth()->id();

        $unreadCount = Message::where('receiver_id', $currentUserId)
            ->whereNull('read_at')
            ->count();

        // Get list of conversations with unread messages
        $unreadConversations = Message::where('receiver_id', $currentUserId)
            ->whereNull('read_at')
            ->select('ad_id', 'sender_id')
            ->with(['ad:id,title', 'sender:id,name,profile_picture'])
            ->groupBy('ad_id', 'sender_id')
            ->get()
            ->map(function ($message) use ($currentUserId) {
                $unreadInConversation = Message::where('ad_id', $message->ad_id)
                    ->where('sender_id', $message->sender_id)
                    ->where('receiver_id', $currentUserId)
                    ->whereNull('read_at')
                    ->count();

                $latestMessage = Message::where('ad_id', $message->ad_id)
                    ->where('sender_id', $message->sender_id)
                    ->where('receiver_id', $currentUserId)
                    ->whereNull('read_at')
                    ->latest()
                    ->first();

                return [
                    'ad_id' => $message->ad_id,
                    'ad_title' => $message->ad->title ?? 'Unknown Ad',
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name ?? 'Unknown User',
                    'sender_picture' => $message->sender->profile_picture ?? null,
                    'unread_count' => $unreadInConversation,
                    'latest_message' => $latestMessage ? $latestMessage->message : null,
                    'latest_message_time' => $latestMessage ? $latestMessage->created_at : null,
                ];
            });

        return response()->json([
            'unread_count' => $unreadCount,
            'conversations' => $unreadConversations
        ]);
    }
}
