<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NmAngkut extends Model
{
    protected $table = 'nm_angkut';

    protected $fillable = [
        'nm_angkut',
        'call_sign',
        'jenis_angkutan',
        'bendera',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public $timestamps = true;
}
