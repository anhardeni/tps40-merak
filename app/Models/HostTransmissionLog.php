<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostTransmissionLog extends Model
{
    protected $fillable = [
        'document_id',
        'format',
        'status',
        'request_data',
        'response_data',
        'response_time',
        'transmission_size',
        'transmitter',
        'error_message',
        'sent_at',
        'sent_by',
    ];

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
            'response_time' => 'integer',
            'transmission_size' => 'integer',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function sentBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
