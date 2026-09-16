<?php

namespace App\Models;

use App\Traits\IsolatableByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class KontainerDocument extends Model
{
    use HasFactory, SoftDeletes, IsolatableByLocation;

    protected $fillable = [
        'ref_number',
        'kd_dok',
        'kd_tps',
        'kd_gudang',
        'tgl_tiba',
        'no_bc11',
        'tgl_bc11',
        'status',
        'keterangan',
        'submitted_at',
        'sent_at',
        'response_data',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'tgl_tiba' => 'date',
        'tgl_bc11' => 'date',
        'submitted_at' => 'datetime',
        'sent_at' => 'datetime',
        'response_data' => 'array',
    ];

    /**
     * Generate reference number format: AAAAYYMMDDNNNNNN
     * AAAA = First 5 characters of kode_tps (or padded if shorter)
     */
    public static function generateRefNumber(string $kodeTps): string
    {
        // 5 digit early from kode_tps
        $prefix = Str::upper(Str::substr(str_pad($kodeTps, 5, '0'), 0, 5));
        $year = date('y'); // 2 digit year
        $month = date('m');
        $day = date('d');

        // Get the last sequence for today
        $lastNumber = static::withTrashed()
            ->whereDate('created_at', today())
            ->where('ref_number', 'like', $prefix.$year.$month.$day.'%')
            ->count();

        $sequence = str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);

        return $prefix.$year.$month.$day.$sequence;
    }

    // Relations
    public function kontainers(): HasMany
    {
        return $this->hasMany(Kontainer::class);
    }

    public function kdDok(): BelongsTo
    {
        return $this->belongsTo(KdDok::class, 'kd_dok', 'kd_dok');
    }

    public function kdTps(): BelongsTo
    {
        return $this->belongsTo(KdTps::class, 'kd_tps', 'kd_tps');
    }

    public function kdGudang(): BelongsTo
    {
        return $this->belongsTo(KdGudang::class, 'kd_gudang', 'kd_gudang');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Boot method for events
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ref_number) && !empty($model->kd_tps)) {
                $model->ref_number = static::generateRefNumber($model->kd_tps);
            }
        });
    }
}
