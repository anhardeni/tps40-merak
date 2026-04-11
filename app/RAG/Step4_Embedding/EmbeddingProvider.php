<?php
namespace App\RAG\Step4_Embedding;
interface EmbeddingProvider{public function embed(string $t):array;}
