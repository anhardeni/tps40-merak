<?php
namespace App\RAG\Step5_Vector\Models;
use Illuminate\Database\Eloquent\Model;
class PdfVector extends Model {
    protected $fillable = ['section', 'content', 'embedding', 'embedding_vec', 'source', 'reference_url', 'ruling_id', 'hs_code'];
    protected $casts = ['embedding' => 'array'];
}
