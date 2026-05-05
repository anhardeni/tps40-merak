<?php

return [
    /*
    |--------------------------------------------------------------------------
    | RAG Configuration
    |--------------------------------------------------------------------------
    */

    'provider' => env('RAG_PROVIDER', 'ollama'), // 'ollama' or 'openai'

    'ollama_url' => env('OLLAMA_URL', 'http://localhost:11434'),

    'embedding_model' => env('RAG_EMBEDDING_MODEL', 'nomic-embed-text'),

    'llm_model' => env('RAG_LLM_MODEL', 'glm-4.7-flash'),

    'chunk_size' => env('RAG_CHUNK_SIZE', 1000),

    'top_k' => env('RAG_TOP_K', 5),

    'openai_key' => env('OPENAI_API_KEY'),
];
