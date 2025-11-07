<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref_number',
        'kd_dok',
        'kd_tps',
        'nm_angkut_id',
        'kd_gudang',
        'no_voy_flight',
        'call_sign',
        'tgl_entry',
        'tgl_tiba',
        'jam_entry',
        'tgl_gate_in',
        'jam_gate_in',
        'tgl_gate_out',
        'jam_gate_out',
        'status',
        'keterangan',
        'username',
        'submitted_at',
        'sppb_number',
        'sppb_data',
        'sppb_checked_at',
        'sent_to_host',
        'sent_at',
        'host_response',
        'created_by',
        'updated_by',
        // CoCoTangki fields
        'cocotangki_status',
        'cocotangki_sent_at',
        'cocotangki_response',
        'cocotangki_error',
    ];

    protected $casts = [
        'tgl_entry' => 'date',
        'tgl_tiba' => 'date',
        'tgl_gate_in' => 'date',
        'tgl_gate_out' => 'date',
        'submitted_at' => 'datetime',
        'sppb_data' => 'array',
        'host_response' => 'array',
        'cocotangki_sent_at' => 'datetime',
        'cocotangki_response' => 'array',
        'sppb_checked_at' => 'datetime',
        'sent_at' => 'datetime',
        'sent_to_host' => 'boolean',
    ];

    // Generate reference number format: AAAAYYMMDDNNNNNN
    public static function generateRefNumber(): string
    {
        $prefix = 'TPSO'; // 4 karakter
        $year = date('y'); // 2 digit tahun
        $month = date('m'); // 2 digit bulan
        $day = date('d'); // 2 digit hari

        // Ambil nomor urut terakhir hari ini
        $lastNumber = static::whereDate('created_at', today())
            ->where('ref_number', 'like', $prefix.$year.$month.$day.'%')
            ->count();

        $sequence = str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);

        return $prefix.$year.$month.$day.$sequence;
    }

    // Relations
    public function kdDok(): BelongsTo
    {
        return $this->belongsTo(KdDok::class, 'kd_dok', 'kd_dok');
    }

    public function kdTps(): BelongsTo
    {
        return $this->belongsTo(KdTps::class, 'kd_tps', 'kd_tps');
    }

    public function nmAngkut(): BelongsTo
    {
        return $this->belongsTo(NmAngkut::class, 'nm_angkut_id');
    }

    public function kdGudang(): BelongsTo
    {
        return $this->belongsTo(KdGudang::class, 'kd_gudang', 'kd_gudang');
    }

    public function tangki(): HasMany
    {
        return $this->hasMany(Tangki::class);
    }

    public function tangkiReferences(): HasMany
    {
        return $this->hasMany(TangkiReference::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function soapLogs(): HasMany
    {
        return $this->hasMany(SoapLog::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tgl_entry', [$startDate, $endDate]);
    }

    // Boot method to auto-generate ref_number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->ref_number)) {
                $model->ref_number = static::generateRefNumber();
            }
        });
    }
}
