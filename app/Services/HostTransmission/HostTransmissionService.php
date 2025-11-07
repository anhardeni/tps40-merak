<?php

namespace App\Services\HostTransmission;

use App\Models\BeacukaiCredential;
use App\Models\Document;
use App\Services\XmlJsonGeneratorService;
use Illuminate\Support\Facades\Log;

class HostTransmissionService
{
    protected XmlJsonGeneratorService $generator;

    protected TokenManager $tokenManager;

    public function __construct(
        XmlJsonGeneratorService $generator,
        TokenManager $tokenManager
    ) {
        $this->generator = $generator;
        $this->tokenManager = $tokenManager;
    }

    /**
     * Send document to host using specified format
     *
     * @param  Document  $document  Document to transmit
     * @param  string  $format  Format: 'xml' or 'json'
     * @param  array  $options  Additional options
     * @return array Transmission result
     *
     * @throws \InvalidArgumentException If format is invalid
     * @throws \Exception If credential not found or transmission fails
     */
    public function send(Document $document, string $format = 'xml', array $options = []): array
    {
        // 1. Validate format
        if (! in_array($format, ['xml', 'json'])) {
            throw new \InvalidArgumentException("Invalid format: {$format}. Must be 'xml' or 'json'");
        }

        // 2. Load credential based on format
        $credential = $this->loadCredential($format);

        if (! $credential) {
            throw new \Exception("No active credential found for format: {$format}");
        }

        // 3. Get appropriate transmitter
        $transmitter = $this->getTransmitter($format);

        // 4. Validate credential for this transmitter
        if (! $transmitter->validateCredential($credential)) {
            throw new \Exception("Invalid credential configuration for {$transmitter->getName()}");
        }

        Log::info('HostTransmission: Starting transmission', [
            'document_id' => $document->id,
            'ref_number' => $document->ref_number,
            'format' => $format,
            'transmitter' => $transmitter->getName(),
            'service_name' => $credential->service_name,
        ]);

        try {
            // 5. Send via transmitter
            $result = $transmitter->send($document, $credential);

            Log::info('HostTransmission: Transmission successful', [
                'document_id' => $document->id,
                'format' => $format,
                'transmitter' => $transmitter->getName(),
            ]);

            return $result;

        } catch (\Exception $e) {
            Log::error('HostTransmission: Transmission failed', [
                'document_id' => $document->id,
                'format' => $format,
                'transmitter' => $transmitter->getName(),
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Load credential for specified format
     */
    protected function loadCredential(string $format): ?BeacukaiCredential
    {
        $serviceType = match ($format) {
            'xml' => 'soap_xml',
            'json' => 'json_bearer',
            default => null,
        };

        if (! $serviceType) {
            return null;
        }

        return BeacukaiCredential::where('service_type', $serviceType)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get transmitter instance for format
     */
    protected function getTransmitter(string $format): Contracts\TransmitterInterface
    {
        return match ($format) {
            'xml' => new XmlSoapTransmitter($this->generator),
            'json' => new JsonBearerTransmitter($this->generator, $this->tokenManager),
            default => throw new \InvalidArgumentException("Invalid format: {$format}"),
        };
    }

    /**
     * Test connection for specified format
     *
     * @return array Test result
     */
    public function testConnection(string $format = 'xml'): array
    {
        try {
            $credential = $this->loadCredential($format);

            if (! $credential) {
                return [
                    'success' => false,
                    'format' => $format,
                    'message' => 'No active credential found',
                ];
            }

            $transmitter = $this->getTransmitter($format);

            if (! $transmitter->validateCredential($credential)) {
                return [
                    'success' => false,
                    'format' => $format,
                    'message' => 'Invalid credential configuration',
                ];
            }

            // For JSON, test token acquisition
            if ($format === 'json') {
                $token = $this->tokenManager->getValidToken($credential);

                return [
                    'success' => true,
                    'format' => $format,
                    'message' => 'Authentication successful',
                    'has_token' => ! empty($token),
                    'transmitter' => $transmitter->getName(),
                ];
            }

            // For XML, just validate configuration
            return [
                'success' => true,
                'format' => $format,
                'message' => 'Configuration valid',
                'transmitter' => $transmitter->getName(),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'format' => $format,
                'message' => $e->getMessage(),
            ];
        }
    }
}
