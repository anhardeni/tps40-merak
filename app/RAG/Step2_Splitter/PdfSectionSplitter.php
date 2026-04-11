<?php
namespace App\RAG\Step2_Splitter;
class PdfSectionSplitter{
 public function split(string $pdf){$t=shell_exec('pdftotext '.escapeshellarg($pdf).' -');$r=[];foreach(SectionRules::rules() as $k=>$v){foreach($v as $w){if(stripos($t,$w)!==false){$r[]=$k;break;}}}return $r;}
}
