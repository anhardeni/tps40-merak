<?php

namespace App\Services\HostTransmission;

use App\Models\BeacukaiCredential;
use App\Models\Document;
use App\Services\HostTransmission\Contracts\TransmitterInterface;
use App\Services\XmlJsonGeneratorService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XmlSoapTransmitter implements TransmitterInterface
{
    protected XmlJsonGeneratorService $xmlGenerator;

    public function __construct(XmlJsonGeneratorService $xmlGenerator)
    {
        $this->xmlGenerator = $xmlGenerator;
    }

    /**
     * Send document via SOAP 1.2 with embedded authentication
     */
    public function send(Document $document, BeacukaiCredential $credential): array
    {
        try {
            // 1. Generate XML document (reuse existing service)
            $xmlContent = $this->xmlGenerator->generateHostXML($document);

            // 2. Build SOAP 1.2 envelope with fStream
            $soapEnvelope = $this->buildSoap12Envelope(
                $xmlContent,
                $credential->username,
                $credential->getDecryptedPassword()
            );

            Log::info('HostTransmission XML: Sending document', [
                'document_id' => $document->id,
                'ref_number' => $document->ref_number,
                'endpoint' => $credential->endpoint_url,
                'username' => $credential->username,
                'xml_size' => strlen($xmlContent),
                'soap_size' => strlen($soapEnvelope),
            ]);

            $startTime = microtime(true);

            // 3. Prepare HTTP client with SSL if configured
            $httpClient = $this->prepareHttpClient($credential);

            // 4. Send SOAP request
            $response = $httpClient->post($credential->endpoint_url, [
                'headers' => [
                    'Content-Type' => 'application/soap+xml; charset=utf-8',
                ],
                'body' => $soapEnvelope,
            ]);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            // 5. Parse response
            if (! $response->successful()) {
                throw new \Exception('HTTP Error: '.$response->status().' - '.$response->body());
            }

            $result = $this->parseSoap12Response($response->body());

            // 6. Check if transmission was successful
            if (! $result['success']) {
                throw new \Exception($result['message']);
            }

            // 7. Record usage
            $credential->recordUsage();

            Log::info('HostTransmission XML: Success', [
                'document_id' => $document->id,
                'response_time' => $responseTime,
                'result' => $result['message'],
            ]);

            return [
                'success' => true,
                'format' => 'xml',
                'transmitter' => $this->getName(),
                'message' => $result['message'],
                'response_time' => $responseTime,
                'response_data' => $result,
                'transmission_size' => strlen($soapEnvelope),
                'transmitted_at' => now()->toIso8601String(),
            ];

        } catch (\Exception $e) {
            Log::error('HostTransmission XML: Error', [
                'document_id' => $document->id,
                'ref_number' => $document->ref_number,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Build SOAP 1.2 envelope with fStream CDATA
     */
    protected function buildSoap12Envelope(string $xmlContent, string $username, string $password): string
    {
        $dom = new \DOMDocument('1.0', 'utf-8');
        $dom->formatOutput = false; // Keep compact for transmission

        // SOAP 1.2 Envelope
        $envelope = $dom->createElementNS('http://www.w3.org/2003/05/soap-envelope', 'soap12:Envelope');
        $envelope->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $envelope->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xsd', 'http://www.w3.org/2001/XMLSchema');
        $dom->appendChild($envelope);

        // SOAP Body
        $body = $dom->createElementNS('http://www.w3.org/2003/05/soap-envelope', 'soap12:Body');
        $envelope->appendChild($body);

        // CoCoTangki Operation
        $operation = $dom->createElementNS('http://services.beacukai.go.id/', 'CoCoTangki');
        $body->appendChild($operation);

        // fStream - XML content dalam CDATA
        $fStream = $dom->createElement('fStream');
        $fStream->appendChild($dom->createCDATASection($xmlContent));
        $operation->appendChild($fStream);

        // Username
        $usernameNode = $dom->createElement('Username', htmlspecialchars($username, ENT_XML1));
        $operation->appendChild($usernameNode);

        // Password (plain text)
        $passwordNode = $dom->createElement('Password', htmlspecialchars($password, ENT_XML1));
        $operation->appendChild($passwordNode);

        return $dom->saveXML();
    }

    /**
     * Parse SOAP 1.2 response
     */
    protected function parseSoap12Response(string $soapResponse): array
    {
        try {
            $dom = new \DOMDocument;
            @$dom->loadXML($soapResponse); // Suppress warnings for malformed XML

            $xpath = new \DOMXPath($dom);
            $xpath->registerNamespace('soap12', 'http://www.w3.org/2003/05/soap-envelope');
            $xpath->registerNamespace('ns', 'http://services.beacukai.go.id/');

            // Check for SOAP Fault
            $fault = $xpath->query('//soap12:Fault');
            if ($fault->length > 0) {
                $reason = $xpath->query('//soap12:Reason/soap12:Text')->item(0)?->nodeValue;

                return [
                    'success' => false,
                    'error_type' => 'soap_fault',
                    'message' => $reason ?? 'Unknown SOAP fault',
                ];
            }

            // Get CoCoTangkiResult
            $resultNodes = $xpath->query('//ns:CoCoTangkiResult');

            if ($resultNodes->length > 0) {
                $result = $resultNodes->item(0)->nodeValue;

                // Check for error keywords in message
                if (stripos($result, 'ERROR') !== false ||
                    stripos($result, 'GAGAL') !== false ||
                    stripos($result, 'INVALID') !== false) {
                    return [
                        'success' => false,
                        'error_type' => 'business_error',
                        'message' => $result,
                    ];
                }

                // Success
                return [
                    'success' => true,
                    'message' => $result,
                ];
            }

            return [
                'success' => false,
                'error_type' => 'parse_error',
                'message' => 'Cannot parse response: CoCoTangkiResult not found',
                'raw_response' => substr($soapResponse, 0, 500),
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error_type' => 'exception',
                'message' => 'Error parsing response: '.$e->getMessage(),
                'raw_response' => substr($soapResponse, 0, 500),
            ];
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

                Log::debug('HostTransmission XML: Using SSL certificates', [
                    'cert' => $certPath,
                    'key' => $keyPath,
                ]);
            } else {
                Log::warning('HostTransmission XML: SSL certificates configured but files not found', [
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
        if ($credential->service_type !== 'soap_xml') {
            return false;
        }

        // Check endpoint
        if (empty($credential->endpoint_url)) {
            return false;
        }

        return true;
    }

    /**
     * Get transmitter name
     */
    public function getName(): string
    {
        return 'XML SOAP 1.2 Transmitter';
    }
}
