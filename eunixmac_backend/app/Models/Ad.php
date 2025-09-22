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
        'is_boosted',
        'boost_expires_at',
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
        'is_boosted' => 'boolean',
        'boost_expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['preview_image', 'formatted_price', 'views_count', 'boost_performance'];

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

    public function getBoostPerformanceAttribute()
    {
        if (!$this->is_boosted) {
            return [
                'total_views' => 0,
                'unique_views' => 0,
                'conversion_rate' => 0
            ];
        }

        try {
            $boostStart = $this->updated_at; // Assuming boost starts when ad is updated
            $totalViews = $this->views()->where('viewed_at', '>=', $boostStart)->count();
            $uniqueViews = $this->views()->where('viewed_at', '>=', $boostStart)->distinct('ip_address')->count();

            return [
                'total_views' => $totalViews,
                'unique_views' => $uniqueViews,
                'conversion_rate' => $totalViews > 0 ? round(($this->messages()->count() / $totalViews) * 100, 2) : 0
            ];
        } catch (\Exception $e) {
            return [
                'total_views' => 0,
                'unique_views' => 0,
                'conversion_rate' => 0
            ];
        }
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeBoosted($query)
    {
        return $query->where('is_boosted', true)
                    ->where('boost_expires_at', '>', now());
    }
}