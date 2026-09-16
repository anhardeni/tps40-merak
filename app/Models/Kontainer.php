<?php

namespace App\Models;

use App\Traits\IsolatableByLocation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kontainer extends Model
{
    use HasFactory, SoftDeletes, IsolatableByLocation;

    protected $fillable = [
        'kontainer_document_id',
        'no_kontainer',
        'ukuran_kontainer',
        'no_segel',
        'jns_kontainer',
        'kd_kantor',
        'no_bl_awb',
        'tgl_bl_awb',
        'no_master_bl_awb',
        'tgl_master_bl_awb',
        'id_consignee',
        'consignee',
        'bruto',
        'wk_inout',
        'no_pos_bc11',
        'kd_timbun',
        'kd_sar_angkut',
        'no_pol',
        'fl_kontainer',
        'iso_code',
        'pel_muat',
        'pel_transit',
        'pel_bongkar',
        'gudang_tujuan',
        'no_daftar_pabean',
        'tgl_daftar_pabean',
        'no_segel_bc',
        'tgl_segel_bc',
        'no_ijin_tps',
        'tgl_ijin_tps',
        'kd_dok_inout',
        'urutan',
    ];

    protected $casts = [
        'tgl_bl_awb' => 'date',
        'tgl_master_bl_awb' => 'date',
        'tgl_daftar_pabean' => 'date',
        'tgl_segel_bc' => 'date',
        'tgl_ijin_tps' => 'date',
        'wk_inout' => 'datetime',
        'bruto' => 'decimal:4',
        'fl_kontainer' => 'boolean',
        'urutan' => 'integer',
    ];

    // Relations
    public function header(): BelongsTo
    {
        return $this->belongsTo(KontainerDocument::class, 'kontainer_document_id');
    }

    // Scopes
    public function scopeByHeader($query, $headerId)
    {
        return $query->where('kontainer_document_id', $headerId);
    }
}
