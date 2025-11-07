<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KdTps extends Model
{
    protected $table = 'kd_tps';

    protected $primaryKey = 'kd_tps';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'kd_tps',
        'nm_tps',
    ];

    public $timestamps = true;
}
