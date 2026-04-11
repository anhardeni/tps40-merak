<?php
namespace App\RAG\Step4_Embedding;
class EmbeddingService{public function __construct(protected EmbeddingProvider $p){} public function embed(string $t){return $this->p->embed($t);} }
