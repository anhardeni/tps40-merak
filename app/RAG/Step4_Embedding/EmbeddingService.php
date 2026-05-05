<?php
namespace App\RAG\Step4_Embedding;
use Illuminate\Support\Facades\Cache;
class EmbeddingService {
    public function __construct(protected EmbeddingProvider $provider) {}
    public function embed(string $text): array {
        $key = 'rag_emb_' . md5($this->provider->modelName() . $text);
        return Cache::remember($key, now()->addHours(24), fn() => $this->provider->embed($text));
    }
    public function embedBatch(array $texts): array { return $this->provider->embedBatch($texts); }
    public function dimensions(): int { return $this->provider->dimensions(); }
    public function modelName(): string { return $this->provider->modelName(); }
}
