<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tangki extends Model
{
    use HasFactory;

    protected $table = 'tangki';

    protected $fillable = [
        'document_id',
        'kd_dok_inout', // Mandatory FK
        'no_tangki',
        'seri_out', // Activity sequence
        'no_bl_awb',
        'tgl_bl_awb',
        'id_consignee',
        'consignee',
        'no_bc11',
        'tgl_bc11',
        'no_pos_bc11',
        'jml_satuan',
        'jns_satuan',
        'no_dok_inout',
        'tgl_dok_inout',
        'kd_sar_angkut_inout',
        'no_pol',
        'jenis_isi',
        'jenis_kemasan',
        'kapasitas',
        'jumlah_isi',
        'satuan',
        'panjang',
        'lebar',
        'tinggi',
        'berat_kosong',
        'berat_isi',
        'kondisi',
        'keterangan',
        'tgl_produksi',
        'tgl_expired',
        'no_segel_bc',
        'no_segel_perusahaan',
        'lokasi_penempatan',
        'urutan',
        'wk_inout',
        'pel_muat',
        'pel_transit',
        'pel_bongkar',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'seri_out' => 'integer',
        'kapasitas' => 'decimal:3',
        'jumlah_isi' => 'decimal:3',
        'jml_satuan' => 'decimal:3',
        'panjang' => 'decimal:2',
        'lebar' => 'decimal:2',
        'tinggi' => 'decimal:2',
        'berat_kosong' => 'decimal:2',
        'berat_isi' => 'decimal:2',
        'tgl_produksi' => 'date',
        'tgl_expired' => 'date',
        'tgl_bl_awb' => 'date',
        'tgl_bc11' => 'date',
        'tgl_dok_inout' => 'date',
        'urutan' => 'integer',
    ];

    // Relations
    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function kdDokInout(): BelongsTo
    {
        return $this->belongsTo(KdDokInout::class, 'kd_dok_inout', 'kd_dok_inout');
    }

    public function referenceJenisSatuan(): BelongsTo
    {
        return $this->belongsTo(ReferensiJenisSatuan::class, 'jns_satuan', 'kode_satuan_barang');
    }

    public function referenceJenisKemasan(): BelongsTo
    {
        return $this->belongsTo(ReferensiJenisKemasan::class, 'jenis_kemasan', 'kode_jenis_kemasan');
    }

    public function tangkiReferences(): HasMany
    {
        return $this->hasMany(TangkiReference::class);
    }

    // Boot method for auto-filling audit fields
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($tangki) {
            if (auth()->check()) {
                $tangki->created_by = auth()->user()->name ?? auth()->user()->email;
            }
        });

        static::updating(function ($tangki) {
            if (auth()->check()) {
                $tangki->updated_by = auth()->user()->name ?? auth()->user()->email;
            }
        });
    }

    // Scopes
    public function scopeByDocument($query, $documentId)
    {
        return $query->where('document_id', $documentId);
    }

    public function scopeByKondisi($query, $kondisi)
    {
        return $query->where('kondisi', $kondisi);
    }

    // Accessors
    public function getVolumeAttribute()
    {
        if ($this->panjang && $this->lebar && $this->tinggi) {
            return $this->panjang * $this->lebar * $this->tinggi;
        }

        return null;
    }

    public function getPersentaseIsiAttribute()
    {
        if ($this->kapasitas > 0) {
            return ($this->jumlah_isi / $this->kapasitas) * 100;
        }

        return 0;
    }
}
