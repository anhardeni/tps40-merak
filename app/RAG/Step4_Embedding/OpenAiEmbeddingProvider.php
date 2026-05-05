<?php
namespace App\RAG\Step4_Embedding;
use App\RAG\Exceptions\EmbeddingException;
use Illuminate\Support\Facades\Http;

class OpenAiEmbeddingProvider implements EmbeddingProvider {
    public function embed(string $text): array {
        $key = config('rag.openai_api_key');
        if (empty($key)) throw new EmbeddingException('OpenAI key missing');
        $resp = Http::withToken($key)->post('https://api.openai.com/v1/embeddings', ['model' => config('rag.openai_embedding_model', 'text-embedding-3-small'), 'input' => mb_substr($text,0,8191)]);
        return array_map('floatval', $resp->json('data.0.embedding') ?? []);
    }
    public function embedBatch(array $texts): array { return []; }
    public function dimensions(): int { return 1536; }
    public function modelName(): string { return 'text-embedding-3-small'; }
}
