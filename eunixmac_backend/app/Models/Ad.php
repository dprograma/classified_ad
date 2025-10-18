<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'price',
        'location',
        'status',
        'file_path',
        'preview_image_path',
        'subject_area',
        'education_level',
        'tags',
        'preview_text',
        'author_info',
        'year_published',
        'language',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['preview_image', 'formatted_price', 'views_count'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function customFields()
    {
        return $this->hasMany(AdCustomField::class);
    }

    public function images()
    {
        return $this->hasMany(AdImage::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function views()
    {
        return $this->hasMany(AdView::class);
    }

    // Accessors
    public function getPreviewImageAttribute()
    {
        $previewImage = $this->images()->where('is_preview', true)->first();
        if ($previewImage) {
            return asset('storage/' . $previewImage->image_path);
        }
        
        $firstImage = $this->images()->first();
        return $firstImage ? asset('storage/' . $firstImage->image_path) : null;
    }

    public function getFormattedPriceAttribute()
    {
        return $this->price ? '₦' . number_format($this->price, 2) : 'Price on request';
    }

    public function getViewsCountAttribute()
    {
        return $this->views()->count();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}