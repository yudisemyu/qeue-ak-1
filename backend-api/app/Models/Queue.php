<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Queue extends Model
{
    protected $fillable = [
        'nomor_antrian',
        'nik',
        'nama',
        'status',
        'tanggal_antrian',
    ];
}
