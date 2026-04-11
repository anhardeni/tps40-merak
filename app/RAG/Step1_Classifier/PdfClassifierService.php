<?php
namespace App\RAG\Step1_Classifier;
use App\RAG\Step1_Classifier\Enums\PdfType;
class PdfClassifierService{
 public function classify(string $pdf):PdfType{
  $t=shell_exec('pdftotext '.escapeshellarg($pdf).' -');
  return strlen(trim($t))>300?PdfType::TEXT:PdfType::IMAGE;
 }
}
