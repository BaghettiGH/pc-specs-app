<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComputerSpecification extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'employee_name',
        'employee_email',
        'device_name',
        'serial_number',
        'cpu',
        'ram',
        'storage',
        'gpu',
        'os',
        'status',
    ];
}
