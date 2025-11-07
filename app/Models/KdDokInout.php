<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KdDokInout extends Model
{
    protected $table = 'kd_dok_inout';

    protected $primaryKey = 'kd_dok_inout';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'kd_dok_inout',
        'nm_dok_inout',
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
