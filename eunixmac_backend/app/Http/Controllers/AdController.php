<?php

namespace App\Http\Controllers;

use App\Models\Ad;
use App\Models\AdCustomField;
use App\Models\AdImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdController extends Controller
{
    public function index(Request $request)
    {
        $query = Ad::query()->where('status', 'active');

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->input('search');
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'ILIKE', '%' . $searchTerm . '%')
                  ->orWhere('description', 'ILIKE', '%' . $searchTerm . '%');
            });
        }

        // Category filtering
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Location filtering
        if ($request->has('location') && !empty($request->location)) {
            $query->where('location', 'ILIKE', '%' . $request->input('location') . '%');
        }

        // Price range filtering
        if ($request->has('min_price') && is_numeric($request->min_price)) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price') && is_numeric($request->max_price)) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        
        // Boost ads first, then by selected sort
        $query->orderByRaw('is_boosted DESC, boost_expires_at DESC NULLS LAST')
              ->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = min($request->input('per_page', 12), 50); // Max 50 items per page
        $ads = $query->with(['user', 'category', 'images', 'customFields'])
                    ->paginate($perPage);

        return response()->json($ads);
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
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair', 'Poor'], 'required' => true],
                ['name' => 'warranty', 'label' => 'Warranty (months)', 'type' => 'number', 'required' => false],
            ];
        }

        // Vehicles category fields
        elseif (str_contains($categoryName, 'vehicle') || str_contains($categoryName, 'car') || str_contains($categoryName, 'truck')) {
            $fields = [
                ['name' => 'make', 'label' => 'Make', 'type' => 'text', 'required' => true],
                ['name' => 'model', 'label' => 'Model', 'type' => 'text', 'required' => true],
                ['name' => 'year', 'label' => 'Year', 'type' => 'number', 'required' => true],
                ['name' => 'mileage', 'label' => 'Mileage (km)', 'type' => 'number', 'required' => false],
                ['name' => 'fuel_type', 'label' => 'Fuel Type', 'type' => 'select', 'options' => ['Petrol', 'Diesel', 'Electric', 'Hybrid'], 'required' => true],
                ['name' => 'transmission', 'label' => 'Transmission', 'type' => 'select', 'options' => ['Manual', 'Automatic'], 'required' => true],
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair', 'Poor'], 'required' => true],
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
                ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'options' => ['New', 'Like New', 'Good', 'Fair', 'Poor'], 'required' => true],
            ];
        }

        // Building Materials category fields  
        elseif (str_contains($categoryName, 'building') || str_contains($categoryName, 'material')) {
            $fields = [
                ['name' => 'material_type', 'label' => 'Material Type', 'type' => 'select', 'options' => ['Cement', 'Blocks', 'Roofing Sheets', 'Tiles', 'Plumbing', 'Electrical'], 'required' => true],
                ['name' => 'quantity', 'label' => 'Quantity Available', 'type' => 'number', 'required' => true],
                ['name' => 'unit', 'label' => 'Unit (e.g., bags, pieces)', 'type' => 'text', 'required' => true],
                ['name' => 'brand', 'label' => 'Brand', 'type' => 'text', 'required' => false],
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
            'reference' => 'required|string',
        ]);

        try {
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
}