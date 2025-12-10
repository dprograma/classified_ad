<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NewsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only authenticated admins can create/update news
        return $this->user() && $this->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $newsId = $this->route('news') ? $this->route('news')->id : null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('news', 'slug')->ignore($newsId),
            ],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120'], // 5MB max
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,gif,webp', 'max:5120'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The news title is required.',
            'title.max' => 'The title cannot exceed 255 characters.',
            'content.required' => 'The news content is required.',
            'thumbnail.image' => 'The thumbnail must be an image file.',
            'thumbnail.mimes' => 'The thumbnail must be a JPEG, JPG, PNG, GIF, or WEBP file.',
            'thumbnail.max' => 'The thumbnail size cannot exceed 5MB.',
            'images.array' => 'Images must be provided as an array.',
            'images.max' => 'You cannot upload more than 5 additional images.',
            'images.*.image' => 'Each file must be an image.',
            'images.*.mimes' => 'Each image must be a JPEG, JPG, PNG, GIF, or WEBP file.',
            'images.*.max' => 'Each image size cannot exceed 5MB.',
            'status.required' => 'Please select a status for this news.',
            'status.in' => 'Invalid status selected.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set published_at to now if status is published and published_at is not set
        if ($this->status === 'published' && !$this->published_at) {
            $this->merge([
                'published_at' => now(),
            ]);
        }
    }
}
