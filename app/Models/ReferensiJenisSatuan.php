<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferensiJenisSatuan extends Model
{
    protected $fillable = [
        'kode_satuan_barang',
        'nama_satuan_barang',
    ];
}
