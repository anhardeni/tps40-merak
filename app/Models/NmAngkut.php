<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NmAngkut extends Model
{
    protected $table = 'nm_angkut';

    protected $fillable = [
        'nm_angkut',
    ];

    public $timestamps = true;
}
