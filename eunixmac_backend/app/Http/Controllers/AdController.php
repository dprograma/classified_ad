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
        $query = Ad::query();

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where('title', 'ILIKE', '%' . $searchTerm . '%')
                  ->orWhere('description', 'ILIKE', '%' . $searchTerm . '%');
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->has('location')) {
            $query->where('location', 'ILIKE', '%' . $request->input('location') . '%');
        }

        $ads = $query->with(['user', 'category', 'images', 'customFields'])->get();
        return response()->json($ads);
    }

    public function show(Ad $ad)
    {
        $ad->load(['user', 'category', 'images', 'customFields']);
        return response()->json($ad);
    }

    public function store(Request $request)
    {
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

        $ad = Ad::create([
            'user_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'location' => $request->location,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('ads', 'public');
                AdImage::create([
                    'ad_id' => $ad->id,
                    'image_path' => $path,
                    'is_preview' => false, // You might want to add logic to determine the preview image
                ]);
            }
        }

        if ($request->has('custom_fields')) {
            foreach ($request->custom_fields as $field) {
                AdCustomField::create([
                    'ad_id' => $ad->id,
                    'field_name' => $field['field_name'],
                    'field_value' => $field['field_value'],
                ]);
            }
        }

        return response()->json($ad->load(['images', 'customFields']), 201);
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
}