<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\RAG\Config\RagConfig;

class SystemHealthService
{
    /**
     * Get the overall health status of the application components.
     */
    public function getStatus(): array
    {
        return [
            'database' => $this->checkDatabase(),
            'djbc_soap' => $this->checkDjbcSoap(),
            'ai_engine' => $this->checkAiEngine(),
            'storage' => $this->checkStorage(),
            'last_check' => now()->toDateTimeString(),
        ];
    }

    private function checkDatabase(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function checkDjbcSoap(): bool
    {
        // Pinging the default DJBC endpoint (if configured)
        $url = config('services.beacukai.endpoint', 'https://tpsonline.beacukai.go.id/tps/service.asmx');
        try {
            $response = Http::timeout(3)->get($url);
            return $response->successful() || $response->status() === 405; // 405 is normal for GET on ASMX
        } catch (\Exception $e) {
            return false;
        }
    }

    private function checkAiEngine(): bool
    {
        if (RagConfig::provider() === 'ollama') {
            try {
                $response = Http::timeout(2)->get(RagConfig::ollamaUrl() . '/api/tags');
                return $response->successful();
            } catch (\Exception $e) {
                return false;
            }
        }
        
        return !empty(config('rag.openai_key'));
    }

    private function checkStorage(): bool
    {
        return is_writable(storage_path('app/public')) && is_writable(storage_path('logs'));
    }
}
