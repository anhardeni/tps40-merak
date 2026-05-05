<?php
namespace App\RAG\Step4_Embedding;
interface EmbeddingProvider {
    public function embed(string $text): array;
    public function embedBatch(array $texts): array;
    public function dimensions(): int;
    public function modelName(): string;
}
