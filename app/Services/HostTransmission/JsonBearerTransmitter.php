<?php

namespace App\Services\HostTransmission;

use App\Models\BeacukaiCredential;
use App\Models\Document;
use App\Services\HostTransmission\Contracts\TransmitterInterface;
use App\Services\XmlJsonGeneratorService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JsonBearerTransmitter implements TransmitterInterface
{
    protected XmlJsonGeneratorService $jsonGenerator;

    protected TokenManager $tokenManager;

    public function __construct(
        XmlJsonGeneratorService $jsonGenerator,
        TokenManager $tokenManager
    ) {
        $this->jsonGenerator = $jsonGenerator;
        $this->tokenManager = $tokenManager;
    }

    /**
     * Send document via JSON with Bearer token
     */
    public function send(Document $document, BeacukaiCredential $credential): array
    {
        try {
            // 1. Get valid token (login if needed)
            $token = $this->tokenManager->getValidToken($credential);

            // 2. Generate JSON document
            $jsonContent = $this->jsonGenerator->generateHostJSON($document);

            Log::info('HostTransmission JSON: Sending document', [
                'document_id' => $document->id,
                'ref_number' => $document->ref_number,
                'endpoint' => $credential->endpoint_url,
                'has_token' => ! empty($token),
                'json_size' => strlen($jsonContent),
            ]);

            $startTime = microtime(true);

            // 3. Prepare HTTP client with SSL
            $httpClient = $this->prepareHttpClient($credential);

            // 4. Send JSON request with Bearer token
            $response = $httpClient->post($credential->endpoint_url, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer '.$token,
                    'Accept' => 'application/json',
                ],
                'body' => $jsonContent,
            ]);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            // 5. Handle 401 Unauthorized (token expired)
            if ($response->status() === 401) {
                Log::warning('HostTransmission JSON: Token expired (401), attempting refresh', [
                    'document_id' => $document->id,
                ]);

                // Refresh token and retry
                $token = $this->tokenManager->refreshToken($credential);

                $response = $httpClient->post($credential->endpoint_url, [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Authorization' => 'Bearer '.$token,
                        'Accept' => 'application/json',
                    ],
                    'body' => $jsonContent,
                ]);

                $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            }

            // 6. Check response status
            if (! $response->successful()) {
                throw new \Exception('HTTP Error: '.$response->status().' - '.$response->body());
            }

            // 7. Parse response
            $result = $response->json();

            if (empty($result)) {
                throw new \Exception('Empty response from host');
            }

            // Check for error in response
            if (isset($result['success']) && $result['success'] === false) {
                throw new \Exception($result['message'] ?? 'Unknown error from host');
            }

            // 8. Record usage
            $credential->recordUsage();

            Log::info('HostTransmission JSON: Success', [
                'document_id' => $document->id,
                'response_time' => $responseTime,
            ]);

            return [
                'success' => true,
                'format' => 'json',
                'transmitter' => $this->getName(),
                'message' => $result['message'] ?? 'Document sent successfully',
                'response_time' => $responseTime,
                'response_data' => $result,
                'transmission_size' => strlen($jsonContent),
                'transmitted_at' => now()->toIso8601String(),
            ];

        } catch (\Exception $e) {
            Log::error('HostTransmission JSON: Error', [
                'document_id' => $document->id,
                'ref_number' => $document->ref_number,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Prepare HTTP client with SSL certificates if configured
     */
    protected function prepareHttpClient(BeacukaiCredential $credential): \Illuminate\Http\Client\PendingRequest
    {
        $config = $credential->additional_config ?? [];
        $timeout = $config['timeout'] ?? 30;

        $httpClient = Http::timeout($timeout);

        // Add SSL certificates if configured
        if (! empty($config['ssl_cert_path']) && ! empty($config['ssl_key_path'])) {
            $certPath = storage_path($config['ssl_cert_path']);
            $keyPath = storage_path($config['ssl_key_path']);

            if (file_exists($certPath) && file_exists($keyPath)) {
                $httpClient = $httpClient->withOptions([
                    'cert' => $certPath,
                    'ssl_key' => $keyPath,
                    'verify' => $config['ssl_verify'] ?? true,
                ]);

                Log::debug('HostTransmission JSON: Using SSL certificates', [
                    'cert' => $certPath,
                    'key' => $keyPath,
                ]);
            } else {
                Log::warning('HostTransmission JSON: SSL certificates configured but files not found', [
                    'cert' => $certPath,
                    'key' => $keyPath,
                ]);
            }
        }

        return $httpClient;
    }

    /**
     * Validate credential configuration
     */
    public function validateCredential(BeacukaiCredential $credential): bool
    {
        if (! $credential->isConfigured()) {
            return false;
        }

        // Check service type
        if ($credential->service_type !== 'json_bearer') {
            return false;
        }

        $config = $credential->additional_config ?? [];

        // Check auth endpoint
        if (empty($config['auth_endpoint'])) {
            return false;
        }

        return true;
    }

    /**
     * Get transmitter name
     */
    public function getName(): string
    {
        return 'JSON Bearer Token Transmitter';
    }
}
