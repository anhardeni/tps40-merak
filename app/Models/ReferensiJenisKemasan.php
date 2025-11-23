<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferensiJenisKemasan extends Model
{
    protected $fillable = [
        'kode_jenis_kemasan',
        'nama_jenis_kemasan',
    ];
}
