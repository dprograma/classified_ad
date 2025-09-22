<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_notifications',
        'sms_notifications',
        'marketing_emails',
        'push_notifications',
        'show_phone',
        'show_email',
        'language',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'marketing_emails' => 'boolean',
        'push_notifications' => 'boolean',
        'show_phone' => 'boolean',
        'show_email' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
