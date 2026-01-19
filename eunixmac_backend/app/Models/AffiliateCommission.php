<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'affiliate_id',
        'referred_user_id',
        'payment_id',
        'purchase_amount',
        'commission_rate',
        'commission_amount',
        'status',
        'paid_at',
    ];

    protected $casts = [
        'purchase_amount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    /**
     * Get the affiliate user who earned the commission
     */
    public function affiliate()
    {
        return $this->belongsTo(User::class, 'affiliate_id');
    }

    /**
     * Get the referred user who made the purchase
     */
    public function referredUser()
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }

    /**
     * Get the payment that triggered this commission
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Scope for pending commissions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved commissions
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for paid commissions
     */
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
