<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KdGudang extends Model
{
    protected $table = 'kd_gudang';

    protected $primaryKey = 'kd_gudang';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'kd_gudang',
        'nm_gudang',
        'kd_tps',
        'alamat',
        'kapasitas',
        'is_active',
    ];

    public $timestamps = true;
}
