<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\AdCustomField;
use App\Models\AdImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class AdController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('Ad search request:', $request->all());
        $query = Ad::query()->where('status', 'active')->whereNotNull('approved_at');

        // Enhanced search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhere('description', 'LIKE', '%' . $searchTerm . '%')
                  ->orWhereHas('customFields', function($cf) use ($searchTerm) {
                      $cf->where('field_value', 'LIKE', '%' . $searchTerm . '%');
                  });
            });
        }

        // Category and sub-category filtering
        if ($request->has('subcategory') && !empty($request->subcategory) && $request->has('category_id') && !empty($request->category_id)) {
            $subCategoryName = $request->input('subcategory');
            $parentCategoryId = $request->input('category_id');

            // Find the subcategory by name and parent_id
            $subCategory = \App\Models\Category::where('name', $subCategoryName)
                ->where('parent_id', $parentCategoryId)
                ->first();

            if ($subCategory) {
                // Filter by the specific subcategory
                $query->where('category_id', $subCategory->id);
                \Log::info("Filtering by subcategory: {$subCategory->name} (ID: {$subCategory->id})");
            } else {
                // If subcategory not found, apply a filter that returns no results
                \Log::warning("Subcategory '{$subCategoryName}' not found for parent category ID: {$parentCategoryId}");
                $query->whereRaw('1 = 0');
            }
        } elseif ($request->has('category_id') && !empty($request->category_id)) {
            $categoryId = $request->input('category_id');

            // Check if this is a parent category
            $category = \App\Models\Category::find($categoryId);

            if ($category) {
                if ($category->parent_id === null) {
                    // This is a parent category - get ads from parent and all children
                    $childIds = \App\Models\Category::where('parent_id', $categoryId)->pluck('id')->toArray();

                    // Also check for duplicate parent categories with the same name
                    $duplicateParents = \App\Models\Category::where('name', $category->name)
                        ->whereNull('parent_id')
                        ->where('id', '!=', $categoryId)
                        ->pluck('id')
                        ->toArray();

                    if (!empty($duplicateParents)) {
                        \Log::info("Found duplicate parent categories for '{$category->name}': " . implode(', ', $duplicateParents));
                        // Get children of duplicate parent categories too
                        $duplicateChildIds = \App\Models\Category::whereIn('parent_id', $duplicateParents)->pluck('id')->toArray();
                        $childIds = array_merge($childIds, $duplicateChildIds);
                    }

                    $allCategoryIds = array_unique(array_merge([$categoryId], $duplicateParents, $childIds));
                    \Log::info("Filtering by parent category '{$category->name}' (ID: {$categoryId}) and children: " . implode(', ', $allCategoryIds));
                    $query->whereIn('category_id', $allCategoryIds);
                } else {
                    // This is a child category - filter by this specific category only
                    \Log::info("Filtering by child category: {$category->name} (ID: {$categoryId})");
                    $query->where('category_id', $categoryId);
                }
            } else {
                // Category not found
                \Log::warning("Category ID {$categoryId} not found");
                $query->whereRaw('1 = 0');
            }
        }

        // Location filtering with multiple options
        if ($request->has('location') && !empty($request->location)) {
            $locations = is_array($request->location) ? $request->location : [$request->location];
            $query->where(function($q) use ($locations) {
                foreach ($locations as $location) {
                    $q->orWhere('location', 'LIKE', '%' . $location . '%');
                }
            });
        }

        // Enhanced price range filtering
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Price range presets (like Jiji.ng)
        if ($request->has('price_range')) {
            $priceRange = $request->input('price_range');
            switch ($priceRange) {
                case 'under_50k':
                    $query->where('price', '<', 50000);
                    break;
                case '50k_200k':
                    $query->whereBetween('price', [50000, 200000]);
                    break;
                case '200k_1m':
                    $query->whereBetween('price', [200000, 1000000]);
                    break;
                case '1m_5m':
                    $query->whereBetween('price', [1000000, 5000000]);
                    break;
                case 'over_5m':
                    $query->where('price', '>', 5000000);
                    break;
            }
        }

        // Custom field filtering (brand, model, condition, etc.)
        if ($request->has('custom_fields')) {
            $customFields = $request->input('custom_fields');
            foreach ($customFields as $fieldName => $fieldValue) {
                if (!empty($fieldValue)) {
                    $values = is_array($fieldValue) ? $fieldValue : [$fieldValue];
                    $query->whereHas('customFields', function($cf) use ($fieldName, $values) {
                        $cf->where('field_name', $fieldName)
                           ->where(function($q) use ($values) {
                               foreach ($values as $value) {
                                   $q->orWhere('field_value', 'LIKE', '%' . $value . '%');
                               }
                           });
                    });
                }
            }
        }

        // Condition filtering (specific for used items)
        if ($request->has('condition')) {
            $conditions = is_array($request->condition) ? $request->condition : [$request->condition];
            $query->whereHas('customFields', function($cf) use ($conditions) {
                $cf->where('field_name', 'condition')
                   ->whereIn('field_value', $conditions);
            });
        }

        // Date range filtering
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        // Enhanced sorting options
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Valid sort options
        $validSorts = ['created_at', 'price', 'title', 'views', 'updated_at'];
        if (!in_array($sortBy, $validSorts)) {
            $sortBy = 'created_at';
        }

        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->input('per_page', 12), 50);
        $ads = $query->with(['user', 'category', 'images', 'customFields'])
                    ->paginate($perPage);

        // Add search metadata
        $metadata = [
            'total_count' => $ads->total(),
            'search_term' => $request->input('search'),
            'filters_applied' => [
                'category' => $request->input('category_id'),
                'location' => $request->input('location'),
                'price_range' => $request->input('price_range'),
                'condition' => $request->input('condition'),
                'custom_fields' => $request->input('custom_fields', []),
            ],
            'sort_by' => $sortBy,
            'sort_order' => $sortOrder
        ];

        return response()->json(array_merge($ads->toArray(), ['search_metadata' => $metadata]));
    }

    public function show(Ad $ad)
    {
        $ad->load(['user', 'category', 'images', 'customFields']);
        return response()->json($ad);
    }

    public function store(Request $request)
    {
        $validationRules = [
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // 2MB max per image (PHP limit)
            'custom_fields' => 'nullable|array',
            'custom_fields.*.field_name' => 'required_with:custom_fields|string|max:100',
            'custom_fields.*.field_value' => 'required_with:custom_fields|string|max:255',
        ];

        $validatedData = $request->validate($validationRules);

        try {
            $ad = Ad::create([
                'user_id' => $request->user()->id,
                'category_id' => $validatedData['category_id'],
                'title' => $validatedData['title'],
                'description' => $validatedData['description'],
                'price' => $validatedData['price'],
                'location' => $validatedData['location'],
                'status' => 'pending_approval',
            ]);

            // Handle image uploads with preview detection
            if ($request->hasFile('images')) {
                $imageFiles = $request->file('images');
                \Log::info('Uploading images for ad', ['ad_id' => $ad->id, 'image_count' => count($imageFiles)]);

                $isFirstImage = true;
                foreach ($imageFiles as $index => $image) {
                    try {
                        if (!$image->isValid()) {
                            throw new \Exception("Invalid image file at index $index");
                        }
                        
                        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                        $path = $image->storeAs('ads', $filename, 'public');
                        
                        if ($path === false) {
                            throw new \Exception("Failed to store image at index $index");
                        }
                        
                        $savedImage = AdImage::create([
                            'ad_id' => $ad->id,
                            'image_path' => $path,
                            'is_preview' => $isFirstImage,
                        ]);
                        \Log::info('Image saved successfully', [
                            'ad_id' => $ad->id,
                            'image_id' => $savedImage->id,
                            'path' => $path,
                            'is_preview' => $isFirstImage
                        ]);
                        $isFirstImage = false;
                    } catch (\Exception $e) {
                        // Delete the ad and any images that were uploaded
                        if ($ad->exists) {
                            foreach ($ad->images as $savedImage) {
                                Storage::disk('public')->delete($savedImage->image_path);
                            }
                            $ad->images()->delete();
                            $ad->delete();
                        }
                        
                        return response()->json([
                            'message' => 'Failed to upload image',
                            'errors' => [
                                "images.$index" => [$e->getMessage()]
                            ]
                        ], 422);
                    }
                }
            }

            // Handle custom fields
            if ($request->has('custom_fields') && is_array($request->custom_fields)) {
                foreach ($request->custom_fields as $field) {
                    if (!empty($field['field_name']) && !empty($field['field_value'])) {
                        AdCustomField::create([
                            'ad_id' => $ad->id,
                            'field_name' => $field['field_name'],
                            'field_value' => $field['field_value'],
                        ]);
                    }
                }
            }

            $ad->load(['user', 'category', 'images', 'customFields']);
            
            return response()->json([
                'message' => 'Ad posted successfully!',
                'ad' => $ad
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create ad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Ad $ad)
    {
        $this->authorize('update', $ad);

        // Handle status-only updates (for toggle functionality)
        if ($request->only(['status']) == $request->all() && $request->has('status')) {
            $request->validate([
                'status' => 'required|string|in:active,inactive,paused,expired',
            ]);

            $ad->update(['status' => $request->status]);
            
            return response()->json([
                'message' => 'Ad status updated successfully',
                'ad' => $ad->load(['images', 'customFields'])
            ]);
        }

        // Handle full ad updates
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'location' => 'required|string|max:255',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'custom_fields.*.field_name' => 'required_with:custom_fields|string',
            'custom_fields.*.field_value' => 'required_with:custom_fields|string',
        ]);

        $ad->update($request->only([
            'category_id',
            'title',
            'description',
            'price',
            'location',
        ]));

        // Handle image updates (delete old, add new)
        if ($request->hasFile('images')) {
            // Delete existing images
            foreach ($ad->images as $image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            }
            // Add new images
            foreach ($request->file('images') as $image) {
                $path = $image->store('ads', 'public');
                AdImage::create([
                    'ad_id' => $ad->id,
                    'image_path' => $path,
                    'is_preview' => false,
                ]);
            }
        }

        // Handle custom fields updates (delete old, add new)
        if ($request->has('custom_fields')) {
            $ad->customFields()->delete();
            foreach ($request->custom_fields as $field) {
                AdCustomField::create([
                    'ad_id' => $ad->id,
                    'field_name' => $field['field_name'],
                    'field_value' => $field['field_value'],
                ]);
            }
        }

        return response()->json($ad->load(['images', 'customFields']));
    }

    public function destroy(Ad $ad)
    {
        $this->authorize('delete', $ad);

        // Delete associated images
        foreach ($ad->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }
        $ad->images()->delete();
        $ad->customFields()->delete();
        $ad->delete();

        return response()->json(null, 204);
    }



    /**
     * Get search suggestions for autocomplete
     */
    public function getSearchSuggestions(Request $request)
    {
        $query = $request->input('query', '');
        $limit = min($request->input('limit', 10), 20);

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $suggestions = [];

        // Get title suggestions
        $titleSuggestions = Ad::where('status', 'active')
            ->where('title', 'LIKE', '%' . $query . '%')
            ->select('title')
            ->distinct()
            ->limit($limit)
            ->pluck('title')
            ->toArray();

        // Get location suggestions
        $locationSuggestions = Ad::where('status', 'active')
            ->where('location', 'LIKE', '%' . $query . '%')
            ->select('location')
            ->distinct()
            ->limit(5)
            ->pluck('location')
            ->toArray();

        // Get custom field suggestions (brands, models, etc.)
        $customFieldSuggestions = \App\Models\AdCustomField::whereHas('ad', function($q) {
                $q->where('status', 'active');
            })
            ->where('field_value', 'LIKE', '%' . $query . '%')
            ->select('field_value', 'field_name')
            ->distinct()
            ->limit(5)
            ->get()
            ->toArray();

        return response()->json([
            'titles' => array_slice($titleSuggestions, 0, 7),
            'locations' => $locationSuggestions,
            'custom_fields' => $customFieldSuggestions
        ]);
    }

    /**
     * Get filter options for a specific category
     */
    public function getCategoryFilters($categoryId)
    {
        $category = \App\Models\Category::find($categoryId);
        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        // Get unique custom field values for this category
        $filterOptions = [];
        
        $customFields = \App\Models\AdCustomField::whereHas('ad', function($q) use ($categoryId) {
                $q->where('status', 'active')
                  ->where('category_id', $categoryId);
            })
            ->select('field_name', 'field_value')
            ->get()
            ->groupBy('field_name');

        foreach ($customFields as $fieldName => $values) {
            $filterOptions[$fieldName] = $values->pluck('field_value')
                ->unique()
                ->values()
                ->take(20)
                ->toArray();
        }

        // Get location options for this category
        $locations = Ad::where('status', 'active')
            ->where('category_id', $categoryId)
            ->select('location')
            ->distinct()
            ->pluck('location')
            ->take(20)
            ->toArray();

        // Get price ranges for this category
        $priceStats = Ad::where('status', 'active')
            ->where('category_id', $categoryId)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price, AVG(price) as avg_price')
            ->first();

        return response()->json([
            'category' => $category->name,
            'custom_fields' => $filterOptions,
            'locations' => $locations,
            'price_stats' => $priceStats
        ]);
    }

    /**
     * Get category field definitions for frontend form generation
     */
    public function getCategoryFields($categoryId)
    {
        $category = \App\Models\Category::find($categoryId);
        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $parentCategory = $category->parent ?? $category;
        $categoryName = strtolower($parentCategory->name);
        $fields = [];

        // Electronics category fields
        if (str_contains($categoryName, 'electronics')) {
            $fields = [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used', 'Good', 'Fair', 'Poor'], 'required' => true],
                ['name' => 'warranty', 'label' => 'Warranty (months)', 'type' => 'number', 'required' => false],
            ];
        }

        // Vehicles category fields
        elseif (str_contains($categoryName, 'vehicles')) {
            $fields = [
                ['name' => 'make', 'label' => 'Make', 'type' => 'text', 'required' => true],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'required' => true],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'required' => true],
                ['name' => 'mileage', 'label' => 'Mileage (km)', 'type' => 'number', 'required' => false],
                ['name' => 'fuel_type', 'label' => 'Fuel Type', 'type' => 'select', 'options' => ['Petrol', 'Diesel', 'Electric', 'Hybrid'], 'required' => true],
                ['name' => 'transmission', 'label' => 'Transmission', 'type' => 'select', 'options' => ['Manual', 'Automatic'], 'required' => true],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used', 'Good', 'Fair', 'Poor'], 'required' => true],
            ];
        }

        // Real Estate category fields
        elseif (str_contains($categoryName, 'real estate')) {
            $fields = [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Apartment', 'House', 'Villa', 'Land', 'Commercial'], 'required' => true],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'required' => false],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'required' => false],
                ['name' => 'area_sqm', 'label' => 'Area (sqm)', 'type' => 'number', 'required' => false],
                ['name' => 'furnished', 'label' => 'Furnished', 'type' => 'select', 'options' => ['Yes', 'No', 'Partially'], 'required' => false],
            ];
        }

        // Fashion category fields
        elseif (str_contains($categoryName, 'fashion')) {
            $fields = [
                ['name' => 'size', 'label' => 'Size', 'type' => 'text', 'required' => true],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Men', 'Women', 'Kids', 'Unisex'], 'required' => true],
                ['name' => 'material', 'label' => 'Material', 'type' => 'text', 'required' => false],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used', 'Good', 'Fair', 'Poor'], 'required' => true],
            ];
        }

        // Books and Media category fields
        elseif (str_contains($categoryName, 'books and media')) {
            $fields = [
                ['name' => 'media_type', 'label' => 'Media Type', 'type' => 'select', 'options' => ['Fiction Book', 'Non-Fiction Book', 'Music Album', 'Movie/DVD', 'TV Show', 'Magazine', 'Comic/Manga', 'Other'], 'required' => true],
                ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
                ['name' => 'author_artist', 'label' => 'Author/Artist', 'type' => 'text', 'required' => false],
                ['name' => 'format', 'label' => 'Format', 'type' => 'select', 'options' => ['Hardcover', 'Paperback', 'Digital/eBook', 'Audio', 'CD', 'DVD', 'Blu-ray', 'Vinyl', 'Other'], 'required' => true],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair', 'Acceptable'], 'required' => true],
                ['name' => 'publication_year', 'label' => 'Publication/Release Year', 'type' => 'number', 'required' => false],
                ['name' => 'language', 'label' => 'Language', 'type' => 'text', 'required' => false],
            ];
        }

        return response()->json(['fields' => $fields]);
    }
}