<?php
namespace App\RAG\Pipeline;
use App\RAG\Step1_Classifier\PdfClassifierService;
use App\RAG\Step2_Splitter\PdfSectionSplitter;
use App\RAG\Step3_Chunking\PdfChunker;
use App\RAG\Step4_Embedding\EmbeddingService;
use App\RAG\Step5_Vector\VectorWriter;
use App\RAG\Step6_RAG\RagEngine;
class RagPipeline{
 public function __construct(
  protected PdfClassifierService $c,
  protected PdfSectionSplitter $s,
  protected PdfChunker $ch,
  protected EmbeddingService $e,
  protected VectorWriter $w,
  protected RagEngine $r
 ){}
}
