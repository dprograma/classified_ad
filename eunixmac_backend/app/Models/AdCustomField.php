<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdCustomField extends Model
{
    use HasFactory;

    protected $fillable = [
        'ad_id',
        'field_name',
        'field_value',
    ];

    public function ad()
    {
        return $this->belongsTo(Ad::class);
    }
}