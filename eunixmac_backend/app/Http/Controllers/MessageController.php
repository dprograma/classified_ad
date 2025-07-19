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
}
