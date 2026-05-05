<?php
namespace App\RAG\Step3_Chunking\Dto;
class PdfChunk {
    public function __construct(
        public readonly string $section,
        public readonly string $content,
        public readonly int $index = 0,
        public readonly array $meta = []
    ) {}
}
