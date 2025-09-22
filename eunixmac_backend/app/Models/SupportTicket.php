<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'user_id',
        'assigned_to',
        'category',
        'subject',
        'message',
        'status',
        'priority',
        'resolved_at',
        'closed_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = 'TKT-' . strtoupper(Str::random(8));
            }
        });

        static::updating(function ($ticket) {
            if ($ticket->isDirty('status')) {
                if ($ticket->status === 'resolved' && !$ticket->resolved_at) {
                    $ticket->resolved_at = now();
                }
                if ($ticket->status === 'closed' && !$ticket->closed_at) {
                    $ticket->closed_at = now();
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(SupportTicketResponse::class);
    }

    public function getStatusBadgeClassAttribute(): string
    {
        return match($this->status) {
            'open' => 'bg-blue-100 text-blue-800',
            'in_progress' => 'bg-yellow-100 text-yellow-800',
            'resolved' => 'bg-green-100 text-green-800',
            'closed' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getPriorityBadgeClassAttribute(): string
    {
        return match($this->priority) {
            'low' => 'bg-gray-100 text-gray-800',
            'medium' => 'bg-blue-100 text-blue-800',
            'high' => 'bg-orange-100 text-orange-800',
            'urgent' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopePriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function isOverdue(): bool
    {
        if ($this->status === 'closed' || $this->status === 'resolved') {
            return false;
        }

        $hoursLimit = match($this->priority) {
            'urgent' => 2,
            'high' => 8,
            'medium' => 24,
            'low' => 72,
            default => 24,
        };

        return $this->created_at->diffInHours(now()) > $hoursLimit;
    }
}
