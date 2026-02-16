<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Ad;
use App\Models\Payment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $books = $request->user()->ads()
            ->whereIn('category_id', [83, 84, 85, 86]) // Books, Past Questions, Ebooks, Publications
            ->whereNotNull('file_path')
            ->with(['category:id,name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'description' => $ad->description,
                    'price' => (float) $ad->price,
                    'category' => $ad->category->name ?? 'Unknown',
                    'status' => $ad->status,
                    'created_at' => $ad->created_at,
                    'updated_at' => $ad->updated_at,
                    'file_path' => $ad->file_path,
                    'preview_image_path' => $ad->preview_image_path,
                    'file_type' => strtoupper(pathinfo($ad->file_path, PATHINFO_EXTENSION)),
                    'file_size' => $this->getFileSize($ad->file_path),
                    'sales_count' => \App\Models\Payment::where('payable_id', $ad->id)
                        ->where('payable_type', 'book')
                        ->where('status', 'success')
                        ->count(),
                    'total_earnings' => (float) \App\Models\Payment::where('payable_id', $ad->id)
                        ->where('payable_type', 'book')
                        ->where('status', 'success')
                        ->sum('amount'),
                ];
            });

        return response()->json($books);
    }

    public function show(Request $request, Ad $ad)
    {
        // Check if user owns this book or has paid for it
        $user = $request->user();
        $canView = $ad->user_id === $user->id ||
                   \App\Models\Payment::where('user_id', $user->id)
                       ->where('payable_id', $ad->id)
                       ->where('payable_type', 'book')
                       ->where('status', 'success')
                       ->exists();

        if (!$canView) {
            return response()->json(['message' => 'Unauthorized to view this book.'], 403);
        }

        return response()->json([
            'id' => $ad->id,
            'title' => $ad->title,
            'description' => $ad->description,
            'price' => (float) $ad->price,
            'category' => $ad->category->name ?? 'Unknown',
            'status' => $ad->status,
            'created_at' => $ad->created_at,
            'updated_at' => $ad->updated_at,
            'file_path' => $ad->file_path,
            'preview_image_path' => $ad->preview_image_path,
            'file_type' => strtoupper(pathinfo($ad->file_path, PATHINFO_EXTENSION)),
            'file_size' => $this->getFileSize($ad->file_path),
            'sales_count' => \App\Models\Payment::where('payable_id', $ad->id)
                ->where('payable_type', 'book')
                ->where('status', 'success')
                ->count(),
            'total_earnings' => (float) \App\Models\Payment::where('payable_id', $ad->id)
                ->where('payable_type', 'book')
                ->where('status', 'success')
                ->sum('amount'),
        ]);
    }

    public function update(Request $request, Ad $ad)
    {
        // Check if user owns this book
        if ($ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to edit this book.'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'file' => 'sometimes|file|mimes:pdf,doc,docx,txt|max:10240', // 10MB max
            'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $updateData = $request->only(['title', 'description', 'price']);

        if ($request->hasFile('file')) {
            // Delete old file
            if ($ad->file_path) {
                \Storage::disk('public')->delete($ad->file_path);
            }
            $updateData['file_path'] = $request->file('file')->store('books', 'public');
            $updateData['status'] = 'pending_approval'; // Re-approval required for new file
        }

        if ($request->hasFile('preview_image')) {
            // Delete old preview image
            if ($ad->preview_image_path) {
                \Storage::disk('public')->delete($ad->preview_image_path);
            }
            $updateData['preview_image_path'] = $request->file('preview_image')->store('books/previews', 'public');
        }

        $ad->update($updateData);

        return response()->json([
            'message' => 'Book updated successfully.',
            'book' => $ad->fresh()
        ]);
    }

    public function destroy(Request $request, Ad $ad)
    {
        // Check if user owns this book
        if ($ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized to delete this book.'], 403);
        }

        // Delete associated files
        if ($ad->file_path) {
            \Storage::disk('public')->delete($ad->file_path);
        }
        if ($ad->preview_image_path) {
            \Storage::disk('public')->delete($ad->preview_image_path);
        }

        $ad->delete();

        return response()->json(['message' => 'Book deleted successfully.']);
    }

    private function getFileSize($filePath)
    {
        try {
            if (!$filePath || !\Storage::disk('public')->exists($filePath)) {
                return 'Unknown';
            }

            $bytes = \Storage::disk('public')->size($filePath);
            if ($bytes === false || $bytes === null) {
                return 'Unknown';
            }

            $units = ['B', 'KB', 'MB', 'GB'];

            for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
                $bytes /= 1024;
            }

            return round($bytes, 2) . ' ' . $units[$i];
        } catch (\Exception $e) {
            \Log::warning('Unable to retrieve file size for: ' . $filePath . '. Error: ' . $e->getMessage());
            return 'Unknown';
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'file' => 'required|file|mimes:pdf,doc,docx,txt,ppt,pptx|max:10240', // 10MB max
            'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category' => 'nullable|string|max:255',
            'subject_area' => 'nullable|string|max:255',
            'education_level' => 'nullable|string|max:255',
            'tags' => 'nullable|string',
            'preview_text' => 'nullable|string',
            'author_info' => 'nullable|string',
            'year_published' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'language' => 'nullable|string|max:100',
        ]);

        $file_path = $request->file('file')->store('books', 'public');
        $preview_image_path = null;
        if ($request->hasFile('preview_image')) {
            $preview_image_path = $request->file('preview_image')->store('books/previews', 'public');
        }

        // Find the appropriate category ID based on category name
        $categoryId = $this->getCategoryIdByName($request->input('category', 'Book'));

        $ad = Ad::create([
            'user_id' => $request->user()->id,
            'category_id' => $categoryId,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'location' => 'Digital Product', // Books don't have a physical location
            'status' => 'pending_approval', // Admin review required
            'file_path' => $file_path,
            'preview_image_path' => $preview_image_path,
            // Store additional metadata as JSON in a metadata field or separate fields
            'subject_area' => $request->input('subject_area'),
            'education_level' => $request->input('education_level'),
            'tags' => $request->input('tags'),
            'preview_text' => $request->input('preview_text'),
            'author_info' => $request->input('author_info'),
            'year_published' => $request->input('year_published'),
            'language' => $request->input('language', 'English'),
        ]);

        return response()->json([
            'message' => 'Book uploaded successfully and is pending approval.',
            'book' => $ad
        ], 201);
    }

    private function getCategoryIdByName($categoryName)
    {
        // Map category names to IDs based on the Books category (ID 83) sub-categories
        $categoryMap = [
            'Past Questions' => 84,
            'Ebooks' => 85,
            'Publications' => 86,
            'Books' => 83, // Default parent
        ];

        return $categoryMap[$categoryName] ?? 83; // Default to Books parent category
    }

    public function download(Request $request, Ad $ad)
    {
        // Check if the user has paid for this book
        $hasPaid = Payment::where('user_id', $request->user()->id)
                            ->where('payable_id', $ad->id)
                            ->where('payable_type', 'book')
                            ->where('status', 'success')
                            ->exists();

        if (!$hasPaid && $ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Payment required to download this book.'], 403);
        }

        // Check if file exists before attempting download
        if (!$ad->file_path || !\Storage::disk('public')->exists($ad->file_path)) {
            return response()->json(['message' => 'File not found. Please contact support.'], 404);
        }

        try {
            return \Storage::disk('public')->download($ad->file_path, $ad->title . '.' . pathinfo($ad->file_path, PATHINFO_EXTENSION));
        } catch (\Exception $e) {
            \Log::error('File download error for book ' . $ad->id . ': ' . $e->getMessage());
            return response()->json(['message' => 'Download failed. Please try again later.'], 500);
        }
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
                'type' => 'book',
            ],
        ]);

        if ($response->successful()) {
            return response()->json($response->json());
        } else {
            return response()->json(['message' => 'Payment initiation failed', 'error' => $response->json()], 500);
        }
    }
}
