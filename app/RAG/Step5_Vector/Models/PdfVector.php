<?php
namespace App\RAG\Step5_Vector\Models;
use Illuminate\Database\Eloquent\Model;
class PdfVector extends Model{protected $fillable=['section','content','embedding']; protected $casts=['embedding'=>'array'];}
