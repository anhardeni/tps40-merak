<?php
namespace App\RAG\Step6_RAG;
class RagPromptBuilder{public function build(string $f,string $c){return "Extract $f from:
$c";}}
