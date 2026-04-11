<?php
namespace App\RAG\Step3_Chunking;
use App\RAG\Step3_Chunking\Dto\PdfChunk;
class PdfChunker{public function chunk(string $section,string $text){$b=preg_split('/

+/',$text);$c=[];foreach($b as $x){$x=trim($x);if(strlen($x)>50)$c[]=new PdfChunk($section,substr($x,0,1000));}return $c;}}
