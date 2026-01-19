<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'bank_code',
        'transfer_code',
        'reference',
        'status',
        'failure_reason',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    /**
     * Get the user who made the withdrawal
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for pending withdrawals
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for successful withdrawals
     */
    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Generate a unique reference
     */
    public static function generateReference()
    {
        return 'WD-' . strtoupper(uniqid()) . '-' . time();
    }
}
