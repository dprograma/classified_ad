<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bank_name',
        'account_number',
        'account_name',
        'bank_code',
        'is_verified',
        'verified_at',
        'verification_amount',
        'is_primary',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_primary' => 'boolean',
        'verified_at' => 'datetime',
        'verification_amount' => 'decimal:2',
    ];

    /**
     * Get the user that owns the bank account
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the withdrawals for this bank account
     */
    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }
}
