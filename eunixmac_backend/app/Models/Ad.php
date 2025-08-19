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
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_boosted' => 'boolean',
        'boost_expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['preview_image', 'formatted_price'];

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
        return '₦' . number_format($this->price, 2);
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