<?php
namespace App\RAG\Step4_Embedding;
use App\RAG\Exceptions\EmbeddingException;
use Illuminate\Support\Facades\Http;

class OllamaEmbeddingProvider implements EmbeddingProvider {
    private string $baseUrl; private string $model; private int $timeout;
    public function __construct() {
        $this->baseUrl = rtrim(config('rag.ollama_url', 'http://localhost:11434'), '/');
        $this->model = config('rag.embedding_model', 'nomic-embed-text');
        $this->timeout = 60;
    }
    public function embed(string $text): array {
        $text = mb_substr(trim(preg_replace('/\s+/', ' ', $text)), 0, 8192);
        $resp = Http::timeout($this->timeout)->post("{$this->baseUrl}/api/embeddings", ['model' => $this->model, 'prompt' => $text]);
        if ($resp->failed() || empty($resp->json('embedding'))) throw new EmbeddingException("Ollama embed error");
        return array_map('floatval', $resp->json('embedding'));
    }
    public function embedBatch(array $texts): array {
        $res = [];
        foreach ($texts as $i => $t) {
            try { $res[] = $this->embed($t); } catch (\Exception $e) { $res[] = array_fill(0, $this->dimensions(), 0.0); }
        }
        return $res;
    }
    public function dimensions(): int { return 768; }
    public function modelName(): string { return $this->model; }
}
