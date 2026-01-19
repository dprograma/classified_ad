<?php

namespace App\Models;


use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomVerifyEmail;
use App\Notifications\CustomResetPassword;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    public function ads()
    {
        return $this->hasMany(Ad::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function settings()
    {
        return $this->hasOne(UserSettings::class);
    }

    public function affiliateCommissions()
    {
        return $this->hasMany(AffiliateCommission::class, 'affiliate_id');
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * Get the available balance for withdrawal (approved commissions not yet paid)
     */
    public function getAvailableBalanceAttribute()
    {
        return $this->affiliateCommissions()
            ->where('status', 'approved')
            ->sum('commission_amount');
    }

    /**
     * Get total earnings (all paid commissions)
     */
    public function getTotalEarningsAttribute()
    {
        return $this->affiliateCommissions()
            ->where('status', 'paid')
            ->sum('commission_amount');
    }

    /**
     * Get pending earnings (pending approval)
     */
    public function getPendingEarningsAttribute()
    {
        return $this->affiliateCommissions()
            ->where('status', 'pending')
            ->sum('commission_amount');
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'phone_number',
        'location',
        'bio',
        'password',
        'profile_picture',
        'is_agent',
        'is_affiliate',
        'is_verified',
        'referral_code',
        'referred_by',
        'provider',
        'provider_id',
        'provider_token',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'bank_code',
        'affiliate_enrolled_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'provider_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'affiliate_enrolled_at' => 'datetime',
        'is_agent' => 'boolean',
        'is_affiliate' => 'boolean',
        'is_verified' => 'boolean',
        'is_admin' => 'boolean',
    ];
}
