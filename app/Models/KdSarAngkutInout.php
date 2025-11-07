<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KdSarAngkutInout extends Model
{
    protected $table = 'kd_sar_angkut_inout';

    protected $primaryKey = 'kd_sar_angkut_inout';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'kd_sar_angkut_inout',
        'nm_sar_angkut_inout',
        'jenis',
        'keterangan',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
