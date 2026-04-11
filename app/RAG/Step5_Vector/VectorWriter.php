<?php
namespace App\RAG\Step5_Vector;
use App\RAG\Step5_Vector\Models\PdfVector;
class VectorWriter{public function store(string $s,string $c,array $e){PdfVector::create(['section'=>$s,'content'=>$c,'embedding'=>$e]);}}
