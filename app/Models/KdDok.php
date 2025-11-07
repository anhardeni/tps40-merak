<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KdDok extends Model
{
    protected $table = 'kd_dok';

    protected $primaryKey = 'kd_dok';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'kd_dok',
        'nm_dok',
        'keterangan',
        'is_active',
    ];

    public $timestamps = true;
}
