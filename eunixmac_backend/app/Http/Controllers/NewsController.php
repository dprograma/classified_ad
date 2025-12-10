<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Http\Requests\NewsRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Display a listing of published news.
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 12);
            $status = $request->input('status', 'published');

            $query = News::with('author:id,name,email')
                ->when($status === 'published', function ($q) {
                    return $q->published();
                })
                ->when($status === 'draft', function ($q) {
                    return $q->draft();
                })
                ->when($status === 'archived', function ($q) {
                    return $q->archived();
                })
                ->when($status === 'all', function ($q) {
                    return $q->orderBy('created_at', 'desc');
                });

            $news = $query->paginate($perPage);

            return response()->json($news, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified news by slug or ID.
     */
    public function show($identifier)
    {
        try {
            // Try to find by slug first, then by ID
            $news = News::with('author:id,name,email,profile_picture')
                ->where('slug', $identifier)
                ->orWhere('id', $identifier)
                ->firstOrFail();

            // Increment views only for published news
            if ($news->status === 'published') {
                $news->incrementViews();
            }

            return response()->json($news, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'News not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Store a newly created news in storage.
     */
    public function store(NewsRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $data['author_id'] = auth()->id();

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                $thumbnail = $request->file('thumbnail');
                $thumbnailPath = $thumbnail->store('news/thumbnails', 'public');
                $data['thumbnail'] = $thumbnailPath;
            }

            // Handle additional images upload
            if ($request->hasFile('images')) {
                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('news/images', 'public');
                    $imagePaths[] = $imagePath;
                }
                $data['images'] = $imagePaths;
            }

            $news = News::create($data);
            $news->load('author:id,name,email');

            DB::commit();

            return response()->json([
                'message' => 'News created successfully',
                'news' => $news
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // Clean up uploaded files if transaction fails
            if (isset($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }
            if (isset($imagePaths)) {
                Storage::disk('public')->delete($imagePaths);
            }

            return response()->json([
                'message' => 'Failed to create news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified news in storage.
     */
    public function update(NewsRequest $request, News $news)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            // Handle thumbnail upload
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail
                if ($news->thumbnail) {
                    Storage::disk('public')->delete($news->thumbnail);
                }

                $thumbnail = $request->file('thumbnail');
                $thumbnailPath = $thumbnail->store('news/thumbnails', 'public');
                $data['thumbnail'] = $thumbnailPath;
            }

            // Handle additional images upload
            if ($request->hasFile('images')) {
                // Delete old images
                if ($news->images) {
                    Storage::disk('public')->delete($news->images);
                }

                $imagePaths = [];
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('news/images', 'public');
                    $imagePaths[] = $imagePath;
                }
                $data['images'] = $imagePaths;
            }

            $news->update($data);
            $news->load('author:id,name,email');

            DB::commit();

            return response()->json([
                'message' => 'News updated successfully',
                'news' => $news
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            // Clean up newly uploaded files if transaction fails
            if (isset($thumbnailPath)) {
                Storage::disk('public')->delete($thumbnailPath);
            }
            if (isset($imagePaths)) {
                Storage::disk('public')->delete($imagePaths);
            }

            return response()->json([
                'message' => 'Failed to update news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified news from storage.
     */
    public function destroy(News $news)
    {
        try {
            // Check if user is authorized
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Delete associated files
            if ($news->thumbnail) {
                Storage::disk('public')->delete($news->thumbnail);
            }
            if ($news->images) {
                Storage::disk('public')->delete($news->images);
            }

            $news->delete();

            return response()->json([
                'message' => 'News deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get latest published news for homepage.
     */
    public function latest(Request $request)
    {
        try {
            $limit = $request->input('limit', 6);

            $news = News::with('author:id,name')
                ->published()
                ->take($limit)
                ->get();

            return response()->json($news, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch latest news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search news by title or content.
     */
    public function search(Request $request)
    {
        try {
            $query = $request->input('query');
            $perPage = $request->input('per_page', 12);

            if (!$query) {
                return $this->index($request);
            }

            $news = News::with('author:id,name')
                ->published()
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('summary', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%");
                })
                ->paginate($perPage);

            return response()->json($news, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to search news',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get news statistics (admin only).
     */
    public function statistics()
    {
        try {
            if (!auth()->user()->is_admin) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            $stats = [
                'total' => News::count(),
                'published' => News::where('status', 'published')->count(),
                'draft' => News::where('status', 'draft')->count(),
                'archived' => News::where('status', 'archived')->count(),
                'total_views' => News::sum('views_count'),
                'most_viewed' => News::published()
                    ->orderBy('views_count', 'desc')
                    ->take(5)
                    ->get(['id', 'title', 'slug', 'views_count', 'published_at']),
            ];

            return response()->json($stats, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
