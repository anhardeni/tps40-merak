<?php
namespace App\RAG\Pipeline;
use App\RAG\Step1_Classifier\PdfClassifierService;
use App\RAG\Step2_Splitter\PdfSectionSplitter;
use App\RAG\Step3_Chunking\PdfChunker;
use App\RAG\Step4_Embedding\EmbeddingService;
use App\RAG\Step5_Vector\VectorWriter;
use App\RAG\Step6_RAG\RagEngine;

class RagPipeline {
    public function __construct(
        protected PdfClassifierService $c, protected PdfSectionSplitter $s, protected PdfChunker $ch,
        protected EmbeddingService $e, protected VectorWriter $w, protected RagEngine $r
    ) {}

    public function ingest(string $pdfPath, array $meta = []): array {
        $type = $this->c->classify($pdfPath);
        $fullText = $this->c->extractFullText($pdfPath);
        $sectionMap = $this->s->splitTextWithSections($fullText);
        $allChunks = $this->ch->chunkAll($sectionMap);

        $texts = array_map(fn($c) => $c->content, $allChunks);
        $embeddings = $this->e->embedBatch($texts);

        foreach ($allChunks as $i => $chunk) {
            $this->w->store($chunk->section, $chunk->content, $embeddings[$i] ?? [], array_merge($meta, ['pdf_type' => $type->value]));
        }
        return ['pdf_type' => $type->value, 'chunks' => count($allChunks), 'model' => $this->e->modelName()];
    }

    public function query(string $question, array $options = []): array {
        return $this->r->ask($question, $options);
    }
}
