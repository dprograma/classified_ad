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
        // Cache featured ads for 2 minutes to reduce load
        if ($request->input('featured') === 'true' && !$request->has('search') && !$request->has('category_id')) {
            $cacheKey = 'featured_ads_' . $request->input('limit', 8);

            return Cache::remember($cacheKey, 120, function () use ($request) {
                return $this->getFeaturedAdsQuery($request);
            });
        }

        $query = Ad::query()->where('status', 'active');

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

        // Category filtering
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->input('category_id'));
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

        // Featured/Boosted ads filtering
        if ($request->has('featured') && $request->input('featured') === 'true') {
            $query->where('is_boosted', true)
                  ->where('boost_expires_at', '>', now());
        }

        // Boosted ads filtering (alternative parameter)
        if ($request->has('boosted') && $request->input('boosted') === 'true') {
            $query->where('is_boosted', true)
                  ->where('boost_expires_at', '>', now());
        }

        // Enhanced sorting options
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Valid sort options
        $validSorts = ['created_at', 'price', 'title', 'views', 'updated_at'];
        if (!in_array($sortBy, $validSorts)) {
            $sortBy = 'created_at';
        }

        // Active boosted ads first (only non-expired boosts), then by selected sort
        $query->orderByRaw('(is_boosted = 1 AND boost_expires_at > NOW()) DESC')
              ->orderBy($sortBy, $sortOrder);

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
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image
            'custom_fields' => 'nullable|array',
            'custom_fields.*.field_name' => 'required_with:custom_fields|string|max:100',
            'custom_fields.*.field_value' => 'required_with:custom_fields|string|max:255',
        ];

        // Add category-specific validation rules
        $categoryValidationRules = $this->getCategorySpecificValidation($request->category_id);
        $validationRules = array_merge($validationRules, $categoryValidationRules);

        $validatedData = $request->validate($validationRules);

        try {
            $ad = Ad::create([
                'user_id' => $request->user()->id,
                'category_id' => $validatedData['category_id'],
                'title' => $validatedData['title'],
                'description' => $validatedData['description'],
                'price' => $validatedData['price'],
                'location' => $validatedData['location'],
                'status' => 'active',
            ]);

            // Handle image uploads with preview detection
            if ($request->hasFile('images')) {
                $isFirstImage = true;
                foreach ($request->file('images') as $index => $image) {
                    try {
                        if (!$image->isValid()) {
                            throw new \Exception("Invalid image file at index $index");
                        }
                        
                        $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                        $path = $image->storeAs('ads', $filename, 'public');
                        
                        if ($path === false) {
                            throw new \Exception("Failed to store image at index $index");
                        }
                        
                        AdImage::create([
                            'ad_id' => $ad->id,
                            'image_path' => $path,
                            'is_preview' => $isFirstImage,
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
     * Get category-specific validation rules based on category name
     */
    private function getCategorySpecificValidation($categoryId)
    {
        if (!$categoryId) return [];

        $category = \App\Models\Category::find($categoryId);
        if (!$category) return [];

        $categoryName = strtolower($category->name);
        $validationRules = [];

        // Electronics category
        if (str_contains($categoryName, 'electronics') || str_contains($categoryName, 'smartphone') || str_contains($categoryName, 'laptop')) {
            $validationRules = array_merge($validationRules, [
                'custom_fields.brand.field_value' => 'nullable|string|max:100',
                'custom_fields.model.field_value' => 'nullable|string|max:100',
                'custom_fields.condition.field_value' => 'nullable|string|in:New,Like New,Good,Fair,Poor',
            ]);
        }

        // Vehicles category
        if (str_contains($categoryName, 'vehicle') || str_contains($categoryName, 'car') || str_contains($categoryName, 'truck')) {
            $validationRules = array_merge($validationRules, [
                'custom_fields.make.field_value' => 'nullable|string|max:100',
                'custom_fields.model.field_value' => 'nullable|string|max:100',
                'custom_fields.year.field_value' => 'nullable|numeric|min:1900|max:' . (date('Y') + 1),
                'custom_fields.mileage.field_value' => 'nullable|numeric|min:0',
                'custom_fields.fuel_type.field_value' => 'nullable|string|in:Petrol,Diesel,Electric,Hybrid',
                'custom_fields.transmission.field_value' => 'nullable|string|in:Manual,Automatic',
            ]);
        }

        // Real Estate category
        if (str_contains($categoryName, 'real estate') || str_contains($categoryName, 'apartment') || str_contains($categoryName, 'house')) {
            $validationRules = array_merge($validationRules, [
                'custom_fields.property_type.field_value' => 'nullable|string|max:100',
                'custom_fields.bedrooms.field_value' => 'nullable|numeric|min:0|max:20',
                'custom_fields.bathrooms.field_value' => 'nullable|numeric|min:0|max:20',
                'custom_fields.area_sqm.field_value' => 'nullable|numeric|min:1',
            ]);
        }

        // Fashion category
        if (str_contains($categoryName, 'fashion') || str_contains($categoryName, 'clothing') || str_contains($categoryName, 'footwear')) {
            $validationRules = array_merge($validationRules, [
                'custom_fields.size.field_value' => 'nullable|string|max:20',
                'custom_fields.gender.field_value' => 'nullable|string|in:Men,Women,Kids,Unisex',
                'custom_fields.material.field_value' => 'nullable|string|max:100',
                'custom_fields.color.field_value' => 'nullable|string|max:50',
                'custom_fields.condition.field_value' => 'nullable|string|in:New,Like New,Good,Fair,Poor',
            ]);
        }

        return $validationRules;
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

        $categoryName = strtolower($category->name);
        $fields = [];

        // Electronics category fields
        if (str_contains($categoryName, 'electronics') || str_contains($categoryName, 'smartphone') || str_contains($categoryName, 'laptop')) {
            $fields = [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used', 'Good', 'Fair', 'Poor'], 'required' => true],
                ['name' => 'warranty', 'label' => 'Warranty (months)', 'type' => 'number', 'required' => false],
            ];
        }

        // Vehicles category fields
        elseif (str_contains($categoryName, 'vehicle') || str_contains($categoryName, 'cars') || str_contains($categoryName, 'truck') || preg_match('/\bcar\b/', $categoryName)) {
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
        elseif (str_contains($categoryName, 'real estate') || str_contains($categoryName, 'apartment') || str_contains($categoryName, 'house')) {
            $fields = [
                ['name' => 'property_type', 'label' => 'Property Type', 'type' => 'select', 'options' => ['Apartment', 'House', 'Villa', 'Land', 'Commercial'], 'required' => true],
                ['name' => 'bedrooms', 'label' => 'Bedrooms', 'type' => 'number', 'required' => false],
                ['name' => 'bathrooms', 'label' => 'Bathrooms', 'type' => 'number', 'required' => false],
                ['name' => 'area_sqm', 'label' => 'Area (sqm)', 'type' => 'number', 'required' => false],
                ['name' => 'furnished', 'label' => 'Furnished', 'type' => 'select', 'options' => ['Yes', 'No', 'Partially'], 'required' => false],
            ];
        }

        // Fashion category fields
        elseif (str_contains($categoryName, 'fashion') || str_contains($categoryName, 'clothing') || str_contains($categoryName, 'footwear')) {
            $fields = [
                ['name' => 'size', 'label' => 'Size', 'type' => 'text', 'required' => true],
                ['name' => 'gender', 'label' => 'Gender', 'type' => 'select', 'options' => ['Men', 'Women', 'Kids', 'Unisex'], 'required' => true],
                ['name' => 'material', 'label' => 'Material', 'type' => 'text', 'required' => false],
                ['name' => 'color', 'label' => 'Color', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used', 'Good', 'Fair', 'Poor'], 'required' => true],
            ];
        }

        // Education Material category fields (MUST be checked before Building Materials)
        elseif (str_contains($categoryName, 'education') || str_contains($categoryName, 'past questions') || str_contains($categoryName, 'ebooks') || str_contains($categoryName, 'publications')) {
            $fields = [
                ['name' => 'material_type', 'label' => 'Material Type', 'type' => 'select', 'options' => ['Past Questions', 'Ebook', 'Publication', 'Study Guide', 'Textbook', 'Course Material', 'Other'], 'required' => true],
                ['name' => 'subject', 'label' => 'Subject/Topic', 'type' => 'text', 'required' => true],
                ['name' => 'education_level', 'label' => 'Education Level', 'type' => 'select', 'options' => ['Primary', 'Secondary', 'Undergraduate', 'Postgraduate', 'Professional', 'All Levels'], 'required' => true],
                ['name' => 'format', 'label' => 'Format', 'type' => 'select', 'options' => ['PDF', 'Physical Copy', 'eBook', 'Audio', 'Video', 'Other'], 'required' => true],
                ['name' => 'year', 'label' => 'Year/Edition', 'type' => 'text', 'required' => false],
                ['name' => 'author_publisher', 'label' => 'Author/Publisher', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition (Physical)', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair', 'Digital Only'], 'required' => false],
            ];
        }

        // Building Materials category fields
        elseif (str_contains($categoryName, 'building')) {
            $fields = [
                ['name' => 'material_type', 'label' => 'Material Type', 'type' => 'select', 'options' => ['Cement', 'Blocks', 'Roofing Sheets', 'Tiles', 'Plumbing', 'Electrical'], 'required' => true],
                ['name' => 'quantity', 'label' => 'Quantity Available', 'type' => 'number', 'required' => true],
                ['name' => 'unit', 'label' => 'Unit (e.g., bags, pieces)', 'type' => 'text', 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
            ];
        }

        // Beauty and Personal Care category fields
        elseif (str_contains($categoryName, 'beauty') || str_contains($categoryName, 'personal care') || str_contains($categoryName, 'skincare') || str_contains($categoryName, 'makeup') || str_contains($categoryName, 'haircare')) {
            $fields = [
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => true],
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Skincare', 'Haircare', 'Makeup', 'Fragrance', 'Wellness', 'Other'], 'required' => true],
                ['name' => 'size_volume', 'label' => 'Size/Volume', 'type' => 'text', 'required' => false],
                ['name' => 'skin_hair_type', 'label' => 'Skin/Hair Type', 'type' => 'select', 'options' => ['All Types', 'Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'], 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used', 'Gently Used'], 'required' => true],
                ['name' => 'expiry_date', 'label' => 'Expiry Date', 'type' => 'text', 'required' => false],
            ];
        }

        // Sports and Outdoors category fields
        elseif (str_contains($categoryName, 'sports') || str_contains($categoryName, 'outdoor') || str_contains($categoryName, 'fitness')) {
            $fields = [
                ['name' => 'sport_type', 'label' => 'Sport Type', 'type' => 'select', 'options' => ['Fitness Equipment', 'Team Sports', 'Outdoor Gear', 'Camping', 'Hiking', 'Cycling', 'Water Sports', 'Other'], 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair'], 'required' => true],
                ['name' => 'size', 'label' => 'Size (if applicable)', 'type' => 'text', 'required' => false],
                ['name' => 'material', 'label' => 'Material', 'type' => 'text', 'required' => false],
            ];
        }

        // Toys and Games category fields
        elseif (str_contains($categoryName, 'toys') || str_contains($categoryName, 'games')) {
            $fields = [
                ['name' => 'toy_type', 'label' => 'Toy/Game Type', 'type' => 'select', 'options' => ['Action Figures', 'Dolls', 'Board Games', 'Puzzles', 'Outdoor Toys', 'Educational', 'Electronic', 'Other'], 'required' => true],
                ['name' => 'age_range', 'label' => 'Age Range', 'type' => 'select', 'options' => ['0-2 years', '3-5 years', '6-8 years', '9-12 years', '13+ years', 'All Ages'], 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair'], 'required' => true],
                ['name' => 'number_of_pieces', 'label' => 'Number of Pieces (if applicable)', 'type' => 'number', 'required' => false],
            ];
        }

        // Books and Media category fields
        elseif (str_contains($categoryName, 'books') || str_contains($categoryName, 'media') || str_contains($categoryName, 'fiction') || str_contains($categoryName, 'music') || str_contains($categoryName, 'movies')) {
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

        // Health and Wellness category fields
        elseif (str_contains($categoryName, 'health') || str_contains($categoryName, 'wellness')) {
            $fields = [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Supplements', 'Fitness Equipment', 'Healthy Snacks', 'Medical Equipment', 'Monitoring Device', 'Other'], 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used'], 'required' => true],
                ['name' => 'expiry_date', 'label' => 'Expiry Date (if applicable)', 'type' => 'text', 'required' => false],
                ['name' => 'quantity', 'label' => 'Quantity/Size', 'type' => 'text', 'required' => false],
            ];
        }

        // Baby and Kids category fields
        elseif (str_contains($categoryName, 'baby') || str_contains($categoryName, 'kids')) {
            $fields = [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Strollers', 'Car Seats', 'Toys', 'Clothing', 'Nursery Furniture', 'Feeding', 'Diapering', 'Other'], 'required' => true],
                ['name' => 'age_range', 'label' => 'Age Range', 'type' => 'select', 'options' => ['0-6 months', '6-12 months', '1-2 years', '3-5 years', '6-8 years', '9-12 years'], 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair'], 'required' => true],
                ['name' => 'gender', 'label' => 'Gender (if applicable)', 'type' => 'select', 'options' => ['Boy', 'Girl', 'Unisex'], 'required' => false],
                ['name' => 'size', 'label' => 'Size (if applicable)', 'type' => 'text', 'required' => false],
            ];
        }

        // Pet Care category fields
        elseif (str_contains($categoryName, 'pet')) {
            $fields = [
                ['name' => 'product_type', 'label' => 'Product Type', 'type' => 'select', 'options' => ['Food', 'Toys', 'Grooming', 'Health/Medicine', 'Accessories', 'Housing', 'Training', 'Other'], 'required' => true],
                ['name' => 'pet_type', 'label' => 'Pet Type', 'type' => 'select', 'options' => ['Dog', 'Cat', 'Bird', 'Fish', 'Small Animals', 'Reptile', 'All Pets'], 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
                ['name' => 'size_weight', 'label' => 'Size/Weight', 'type' => 'text', 'required' => false],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Used'], 'required' => true],
                ['name' => 'expiry_date', 'label' => 'Expiry Date (if applicable)', 'type' => 'text', 'required' => false],
            ];
        }

        // Jobs category fields
        elseif (str_contains($categoryName, 'jobs') || str_contains($categoryName, 'full-time') || str_contains($categoryName, 'part-time') || str_contains($categoryName, 'internship') || str_contains($categoryName, 'freelance')) {
            $fields = [
                ['name' => 'job_type', 'label' => 'Job Type', 'type' => 'select', 'options' => ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract', 'Temporary'], 'required' => true],
                ['name' => 'industry', 'label' => 'Industry', 'type' => 'select', 'options' => ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Hospitality', 'Manufacturing', 'Marketing', 'Sales', 'Other'], 'required' => true],
                ['name' => 'experience_level', 'label' => 'Experience Level', 'type' => 'select', 'options' => ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Executive'], 'required' => true],
                ['name' => 'salary_range', 'label' => 'Salary Range (Optional)', 'type' => 'text', 'required' => false],
                ['name' => 'company_name', 'label' => 'Company Name', 'type' => 'text', 'required' => false],
                ['name' => 'remote_option', 'label' => 'Remote Option', 'type' => 'select', 'options' => ['On-site', 'Remote', 'Hybrid'], 'required' => false],
            ];
        }

        // Services category fields
        elseif (str_contains($categoryName, 'services') || str_contains($categoryName, 'beauty service') || str_contains($categoryName, 'tutoring')) {
            $fields = [
                ['name' => 'service_type', 'label' => 'Service Type', 'type' => 'select', 'options' => ['Beauty', 'Pet Care', 'Home Cleaning', 'Tutoring', 'Repair', 'Moving', 'Event Planning', 'Photography', 'Other'], 'required' => true],
                ['name' => 'experience_years', 'label' => 'Years of Experience', 'type' => 'number', 'required' => false],
                ['name' => 'pricing_type', 'label' => 'Pricing Type', 'type' => 'select', 'options' => ['Hourly', 'Per Session', 'Fixed Rate', 'Negotiable'], 'required' => true],
                ['name' => 'availability', 'label' => 'Availability', 'type' => 'select', 'options' => ['Weekdays', 'Weekends', 'Evenings', 'Flexible'], 'required' => false],
                ['name' => 'service_location', 'label' => 'Service Location', 'type' => 'select', 'options' => ['Client Location', 'Provider Location', 'Both'], 'required' => false],
            ];
        }

        return response()->json(['fields' => $fields]);
    }

    /**
     * Get boost pricing options
     */
    public function getBoostPricing()
    {
        return response()->json([
            'pricing' => [
                [
                    'days' => 7,
                    'price' => 1000.00,
                    'label' => '7 days',
                    'currency' => 'NGN'
                ],
                [
                    'days' => 14,
                    'price' => 1800.00,
                    'label' => '14 days',
                    'currency' => 'NGN'
                ],
                [
                    'days' => 30,
                    'price' => 3500.00,
                    'label' => '30 days',
                    'currency' => 'NGN'
                ]
            ]
        ]);
    }

    /**
     * Initiate boost payment for an ad
     */
    public function initiateBoost(Request $request, Ad $ad)
    {
        // Check if user owns the ad
        if ($ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'boost_days' => 'required|integer|in:7,14,30',
            'email' => 'required|email',
        ], [
            'boost_days.required' => 'Boost duration is required',
            'boost_days.integer' => 'Boost duration must be a number',
            'boost_days.in' => 'Boost duration must be 7, 14, or 30 days',
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address'
        ]);

        $boostDays = $request->boost_days;
        $pricing = [
            7 => 1000.00,
            14 => 1800.00,
            30 => 3500.00,
        ];

        $amount = $pricing[$boostDays];

        try {
            // Initialize Paystack payment
            $paystack = new \App\Services\PaystackService();
            $reference = 'boost_' . $ad->id . '_' . time();
            
            $paymentData = [
                'reference' => $reference,
                'amount' => $amount * 100, // Convert to kobo
                'email' => $request->email,
                'callback_url' => env('APP_URL') . '/api/payments/verify',
                'metadata' => [
                    'ad_id' => $ad->id,
                    'boost_days' => $boostDays,
                    'type' => 'ad_boost'
                ]
            ];

            $response = $paystack->initializePayment($paymentData);

            if (!$response['status']) {
                return response()->json([
                    'message' => 'Failed to initialize payment',
                    'error' => $response['message']
                ], 400);
            }

            // Store payment record
            \App\Models\Payment::create([
                'user_id' => $request->user()->id,
                'payable_id' => $ad->id,
                'payable_type' => 'AdBoost',
                'amount' => $amount,
                'reference' => $reference,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Payment initialized successfully',
                'data' => [
                    'authorization_url' => $response['data']['authorization_url'],
                    'access_code' => $response['data']['access_code'],
                    'reference' => $reference
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initialize boost payment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify boost payment and activate boost
     */
    public function verifyBoostPayment(Request $request)
    {
        $request->validate([
            'reference' => 'required|string|min:1|max:255',
            'ad_id' => 'required_if:test_mode,true|integer|exists:ads,id',
            'days' => 'required_if:test_mode,true|integer|in:7,14,30',
            'test_mode' => 'boolean'
        ], [
            'reference.required' => 'Payment reference is required',
            'reference.string' => 'Payment reference must be a string',
            'reference.min' => 'Payment reference cannot be empty',
            'reference.max' => 'Payment reference is too long',
            'ad_id.required_if' => 'Ad ID is required for test mode',
            'ad_id.integer' => 'Ad ID must be a valid number',
            'ad_id.exists' => 'The specified ad does not exist',
            'days.required_if' => 'Boost duration is required for test mode',
            'days.integer' => 'Boost duration must be a number',
            'days.in' => 'Boost duration must be 7, 14, or 30 days'
        ]);

        try {
            // Check if in test mode
            if (config('app.env') !== 'production' && $request->has('test_mode')) {
                // Test mode payment verification
                return $this->handleTestModePayment($request);
            }

            $paystack = new \App\Services\PaystackService();
            $response = $paystack->verifyPayment($request->reference);

            if (!$response['status']) {
                return response()->json([
                    'message' => 'Payment verification failed',
                    'error' => $response['message']
                ], 400);
            }

            $paymentData = $response['data'];
            
            // Find the payment record
            $payment = \App\Models\Payment::where('reference', $request->reference)->first();
            
            if (!$payment) {
                return response()->json(['message' => 'Payment record not found'], 404);
            }

            if ($paymentData['status'] === 'success') {
                // Update payment status
                $payment->update(['status' => 'success']);

                // Get ad and boost days from metadata
                $metadata = $paymentData['metadata'];
                $ad = Ad::find($metadata['ad_id']);
                $boostDays = $metadata['boost_days'];

                if ($ad) {
                    // Calculate boost expiry date
                    $expiresAt = now()->addDays($boostDays);
                    
                    // Activate boost
                    $ad->update([
                        'is_boosted' => true,
                        'boost_expires_at' => $expiresAt,
                    ]);

                    return response()->json([
                        'message' => 'Ad boosted successfully!',
                        'data' => [
                            'ad_id' => $ad->id,
                            'boost_expires_at' => $expiresAt,
                            'amount_paid' => $payment->amount
                        ]
                    ]);
                }
            } else {
                $payment->update(['status' => 'failed']);
                return response()->json(['message' => 'Payment was not successful'], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment verification failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if ad boost has expired and update status
     */
    public function checkBoostExpiry()
    {
        $expiredAds = Ad::where('is_boosted', true)
                       ->where('boost_expires_at', '<', now())
                       ->get();

        foreach ($expiredAds as $ad) {
            $ad->update([
                'is_boosted' => false,
                'boost_expires_at' => null,
            ]);
        }

        return response()->json([
            'message' => 'Boost expiry check completed',
            'expired_ads_count' => $expiredAds->count()
        ]);
    }

    /**
     * Handle test mode payment verification
     */
    private function handleTestModePayment(Request $request)
    {
        $request->validate([
            'ad_id' => 'required|integer|exists:ads,id',
            'days' => 'required|integer|in:7,14,30'
        ]);

        $ad = Ad::find($request->ad_id);

        // Check if user owns the ad
        if ($ad->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Simulate successful payment
        $pricing = ['7' => 1000, '14' => 1800, '30' => 3500];
        $amount = $pricing[$request->days];

        // Create test payment record
        $payment = \App\Models\Payment::create([
            'user_id' => $request->user()->id,
            'payable_id' => $ad->id,
            'payable_type' => 'ad_boost',
            'amount' => $amount,
            'reference' => 'test_' . uniqid(),
            'status' => 'success',
        ]);

        // Activate boost
        $expiresAt = now()->addDays($request->days);
        $ad->update([
            'is_boosted' => true,
            'boost_expires_at' => $expiresAt,
        ]);

        return response()->json([
            'message' => 'Ad boosted successfully (TEST MODE)!',
            'data' => [
                'ad_id' => $ad->id,
                'boost_expires_at' => $expiresAt,
                'amount_paid' => $payment->amount,
                'test_mode' => true
            ]
        ]);
    }

    /**
     * Get boost history for authenticated user
     */
    public function getBoostHistory(Request $request)
    {
        $user = $request->user();

        $history = \App\Models\Payment::where('user_id', $user->id)
            ->where('payable_type', 'AdBoost')
            ->with(['payable:id,title,user_id'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'message' => 'Boost history retrieved successfully',
            'data' => $history
        ]);
    }

    /**
     * Helper method to get featured ads with optimized query
     */
    private function getFeaturedAdsQuery(Request $request)
    {
        $limit = min($request->input('limit', 8), 20);

        $ads = Ad::query()
            ->where('status', 'active')
            ->where('is_boosted', true)
            ->where('boost_expires_at', '>', now())
            ->with(['user:id,name,email', 'category:id,name', 'images:id,ad_id,image_path'])
            ->orderByRaw('(is_boosted = 1 AND boost_expires_at > NOW()) DESC')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $ads,
            'total' => $ads->count()
        ]);
    }
}