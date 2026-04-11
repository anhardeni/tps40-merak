<?php
namespace App\RAG\Step4_Embedding;
class OpenAiEmbeddingProvider implements EmbeddingProvider{public function embed(string $t):array{return array_fill(0,8,0.1);}}
