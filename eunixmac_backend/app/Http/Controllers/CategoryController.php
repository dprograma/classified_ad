<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Get all categories with their children and ad counts
     * This includes ads from both the parent category and all its children
     */
    public function index()
    {
        try {
            // Get parent categories
            $parentCategories = Category::whereNull('parent_id')
                ->with(['children' => function ($query) {
                    $query->select('id', 'parent_id', 'name', 'icon');
                }])
                ->get();

            // Add ad counts to categories
            $categoriesWithCounts = $parentCategories->map(function ($category) {
                // Get child category IDs
                $childIds = $category->children->pluck('id')->toArray();
                
                // Count ads in parent category
                $parentAdsCount = Ad::where('category_id', $category->id)
                    ->where('status', 'active')
                    ->whereNotNull('approved_at')
                    ->count();
                
                // Count ads in child categories
                $childAdsCount = 0;
                if (!empty($childIds)) {
                    $childAdsCount = Ad::whereIn('category_id', $childIds)
                        ->where('status', 'active')
                        ->whereNotNull('approved_at')
                        ->count();
                }
                
                // Total count
                $totalCount = $parentAdsCount + $childAdsCount;
                
                // Add counts to children
                $childrenWithCounts = $category->children->map(function ($child) {
                    $childAdsCount = Ad::where('category_id', $child->id)
                        ->where('status', 'active')
                        ->whereNotNull('approved_at')
                        ->count();
                    
                    return array_merge($child->toArray(), [
                        'ads_count' => $childAdsCount
                    ]);
                });
                
                return array_merge($category->toArray(), [
                    'ads_count' => $totalCount,
                    'parent_ads_count' => $parentAdsCount,
                    'children_ads_count' => $childAdsCount,
                    'children' => $childrenWithCounts
                ]);
            });

            return response()->json([
                'success' => true,
                'data' => $categoriesWithCounts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get a specific category with its children and ad counts
     */
    public function show(Category $category)
    {
        try {
            $category->load(['children' => function ($query) {
                $query->select('id', 'parent_id', 'name', 'icon');
            }]);

            // If this is a parent category, get ad counts
            if (!$category->parent_id) {
                $childIds = $category->children->pluck('id')->toArray();
                
                $parentAdsCount = Ad::where('category_id', $category->id)
                    ->where('status', 'active')
                    ->whereNotNull('approved_at')
                    ->count();
                
                $childAdsCount = 0;
                if (!empty($childIds)) {
                    $childAdsCount = Ad::whereIn('category_id', $childIds)
                        ->where('status', 'active')
                        ->whereNotNull('approved_at')
                        ->count();
                }
                
                $childrenWithCounts = $category->children->map(function ($child) {
                    $childAdsCount = Ad::where('category_id', $child->id)
                        ->where('status', 'active')
                        ->whereNotNull('approved_at')
                        ->count();
                    
                    return array_merge($child->toArray(), [
                        'ads_count' => $childAdsCount
                    ]);
                });
                
                $category->ads_count = $parentAdsCount + $childAdsCount;
                $category->parent_ads_count = $parentAdsCount;
                $category->children_ads_count = $childAdsCount;
                $category->children = $childrenWithCounts;
            } else {
                // This is a child category
                $category->ads_count = Ad::where('category_id', $category->id)
                    ->where('status', 'active')
                    ->whereNotNull('approved_at')
                    ->count();
            }

            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching category: ' . $e->getMessage(), [
                'category_id' => $category->id,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'parent_id' => 'nullable|exists:categories,id',
                'icon' => 'nullable|string|max:255',
            ]);

            $category = Category::create($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating category: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
                'parent_id' => 'nullable|exists:categories,id',
                'icon' => 'nullable|string|max:255',
            ]);

            $category->update($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    public function destroy(Category $category)
    {
        try {
            // Check if category has ads
            $adsCount = Ad::where('category_id', $category->id)->count();
            if ($adsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete category with {$adsCount} active ads"
                ], 422);
            }

            // Check if category has children
            if ($category->children()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with subcategories'
                ], 422);
            }

            $category->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ], 204);
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category',
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }
}
