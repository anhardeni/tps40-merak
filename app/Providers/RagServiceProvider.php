<?php
namespace App\Providers;
use App\RAG\Step4_Embedding\{EmbeddingProvider, EmbeddingService, OllamaEmbeddingProvider, OpenAiEmbeddingProvider};
use App\RAG\Step6_RAG\{RagEngine, RagPromptBuilder};
use Illuminate\Support\ServiceProvider;

class RagServiceProvider extends ServiceProvider {
    public function register(): void {
        $this->app->singleton(EmbeddingProvider::class, fn() => config('rag.provider') === 'openai' ? new \App\RAG\Step4_Embedding\OpenAiEmbeddingProvider() : new \App\RAG\Step4_Embedding\OllamaEmbeddingProvider());
        $this->app->singleton(EmbeddingService::class, fn($app) => new EmbeddingService($app->make(EmbeddingProvider::class)));
        $this->app->singleton(RagEngine::class, fn($app) => new RagEngine($app->make(EmbeddingService::class), new \App\RAG\Step6_RAG\RagPromptBuilder()));

        $this->app->singleton(\App\RAG\Pipeline\RagPipeline::class, function($app) {
            return new \App\RAG\Pipeline\RagPipeline(
                $app->make(\App\RAG\Step1_Classifier\PdfClassifierService::class),
                $app->make(\App\RAG\Step2_Splitter\PdfSectionSplitter::class),
                $app->make(\App\RAG\Step3_Chunking\PdfChunker::class),
                $app->make(EmbeddingService::class),
                $app->make(\App\RAG\Step5_Vector\VectorWriter::class),
                $app->make(RagEngine::class)
            );
        });
    }
}
