<?php
namespace App\RAG\Step6_RAG;
use App\RAG\Exceptions\RagException;
use App\RAG\Step4_Embedding\EmbeddingService;
use App\RAG\Step5_Vector\Models\PdfVector;
use Illuminate\Support\Facades\Http;

class RagEngine {
    public function __construct(protected EmbeddingService $emb, protected RagPromptBuilder $prompt) {}
    public function ask(string $query, array $options = []): array {
        $queryVec = $this->emb->embed($query);
        $chunks = $this->vectorSearch($queryVec, $options['top_k'] ?? 5);
        if ($chunks->isEmpty()) return ['answer' => 'Tidak ditemukan referensi relevan.', 'chunks' => []];

        $context = $chunks->map(fn($c, $i) => "[{$i}] [{$c->source}]\n{$c->content}")->implode("\n\n");
        $answer = $this->callLlm($this->prompt->build($query, $context));

        return [
            'answer' => $answer,
            'chunks' => $chunks->map(fn($c) => ['section' => $c->section, 'content' => mb_substr($c->content,0,200), 'source' => $c->source])->toArray()
        ];
    }

    private function vectorSearch(array $queryVec, int $topK) {
        try {
            return PdfVector::selectRaw("*, VEC_DISTANCE_COSINE(embedding_vec, VEC_FromText(?)) AS similarity_score", [json_encode($queryVec)])
                ->whereNotNull('embedding_vec')->orderBy('similarity_score', 'asc')->limit($topK)->get();
        } catch (\Exception $e) {
            return PdfVector::whereNotNull('embedding')->get()->map(function ($c) use ($queryVec) {
                $c->similarity_score = cosineSimilarity($queryVec, is_string($c->embedding) ? json_decode($c->embedding,true) : $c->embedding);
                return $c;
            })->sortByDesc('similarity_score')->take($topK);
        }
    }

    private function callLlm(string $prompt): string {
        $resp = Http::timeout(120)->post(config('rag.ollama_url', 'http://localhost:11434').'/api/chat', [
            'model' => config('rag.llm_model', 'glm-4.7-flash'), 'stream' => false,
            'messages' => [['role'=>'system','content'=>'Kamu ahli HS Code Indonesia.'], ['role'=>'user','content'=>$prompt]]
        ]);
        return $resp->json('message.content') ?? 'Error LLM';
    }
}
