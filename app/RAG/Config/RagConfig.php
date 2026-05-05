<?php
namespace App\RAG\Config;
class RagConfig {
    public static function chunkSize(): int { return (int) config('rag.chunk_size', 1000); }
    public static function topK(): int { return (int) config('rag.top_k', 5); }
    public static function ollamaUrl(): string { return config('rag.ollama_url', 'http://localhost:11434'); }
    public static function embeddingModel(): string { return config('rag.embedding_model', 'nomic-embed-text'); }
    public static function llmModel(): string { return config('rag.llm_model', 'glm-4.7-flash'); }
    public static function provider(): string { return config('rag.provider', 'ollama'); }
}
