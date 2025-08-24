<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ad;
use App\Models\Payment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class EducationalMaterialController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'file' => 'required|file|mimes:pdf,doc,docx,txt|max:10240', // 10MB max
            'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $file_path = $request->file('file')->store('educational_materials', 'public');
        $preview_image_path = null;
        if ($request->hasFile('preview_image')) {
            $preview_image_path = $request->file('preview_image')->store('educational_materials/previews', 'public');
        }

        $ad = Ad::create([
            'user_id' => $request->user()->id,
            'category_id' => 17, // Assuming 'Educational Material' category has ID 17
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'location' => 'N/A', // Educational materials don't have a physical location
            'status' => 'pending_approval', // Admin review required
            'file_path' => $file_path,
            'preview_image_path' => $preview_image_path,
        ]);

        return response()->json($ad, 201);
    }

    public function download(Request $request, Ad $ad)
    {
        // Check if the user has paid for this educational material
        $hasPaid = Payment::where('user_id', $request->user()->id)
                            ->where('payable_id', $ad->id)
                            ->where('payable_type', 'educational_material')
                            ->where('status', 'success')
                            ->exists();

        if (!$hasPaid && $ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Payment required to download this material.'], 403);
        }

        return Storage::disk('public')->download($ad->file_path, $ad->title . '.' . pathinfo($ad->file_path, PATHINFO_EXTENSION));
    }

    public function initiatePayment(Request $request, Ad $ad)
    {
        $user = $request->user();
        $amount = $ad->price;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('PAYSTACK_SECRET_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.paystack.co/transaction/initialize', [
            'email' => $user->email,
            'amount' => $amount * 100,
            'callback_url' => env('APP_URL') . '/api/payments/verify',
            'metadata' => [
                'ad_id' => $ad->id,
                'user_id' => $user->id,
                'type' => 'educational_material',
            ],
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        } else {
            return response()->json(['message' => 'Payment initiation failed', 'error' => $response->json()], 500);
        }
    }
}
