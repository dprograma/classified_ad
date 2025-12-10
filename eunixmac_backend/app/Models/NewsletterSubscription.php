<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'status',
        'verification_token',
        'verified_at',
        'unsubscribed_at',
        'ip_address',
        'user_agent',
        'source',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    protected $hidden = [
        'verification_token',
    ];

    /**
     * Scope for active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for unsubscribed
     */
    public function scopeUnsubscribed($query)
    {
        return $query->where('status', 'unsubscribed');
    }

    /**
     * Scope for verified subscriptions
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    /**
     * Check if subscription is active
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Check if subscription is verified
     */
    public function isVerified()
    {
        return !is_null($this->verified_at);
    }

    /**
     * Mark subscription as unsubscribed
     */
    public function unsubscribe()
    {
        $this->update([
            'status' => 'unsubscribed',
            'unsubscribed_at' => now(),
        ]);
    }

    /**
     * Resubscribe (reactivate)
     */
    public function resubscribe()
    {
        $this->update([
            'status' => 'active',
            'unsubscribed_at' => null,
        ]);
    }

    /**
     * Mark as verified
     */
    public function markAsVerified()
    {
        $this->update([
            'verified_at' => now(),
            'verification_token' => null,
        ]);
    }

    /**
     * Generate verification token
     */
    public static function generateToken()
    {
        return Str::random(64);
    }

    /**
     * Boot method for auto-generating tokens
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscription) {
            if (!$subscription->verification_token) {
                $subscription->verification_token = static::generateToken();
            }
        });
    }
}
