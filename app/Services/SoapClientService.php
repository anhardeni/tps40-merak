<?php

namespace App\Services;

use App\Models\SoapLog;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SoapClientService
{
    private $client;

    private $endpoint;

    private $username;

    private $password;

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'verify' => false, // Untuk development, dalam production gunakan SSL yang benar
            'headers' => [
                'Content-Type' => 'text/xml; charset=utf-8',
                'SOAPAction' => '',
                'User-Agent' => 'Laravel-SOAP-Client/1.0',
            ],
        ]);

        $this->endpoint = config('services.soap.endpoint', 'https://tpsonline.beacukai.go.id/tps/service.asmx');
        $this->username = config('services.soap.username');
        $this->password = config('services.soap.password');
    }

    /**
     * Cek Data SPPB
     */
    public function cekDataSPPB(string $sppbNumber, ?string $documentId = null): array
    {
        $method = 'CekDataSPPB';
        $requestTime = now();

        $requestData = [
            'sppb_number' => $sppbNumber,
            'username' => $this->username,
            'password' => $this->password,
        ];

        // Build SOAP XML Request
        $soapXml = $this->buildCekDataSPPBXml($sppbNumber);

        $logData = [
            'method' => $method,
            'endpoint' => $this->endpoint,
            'request_data' => $requestData,
            'request_xml' => $soapXml,
            'request_time' => $requestTime,
            'user_id' => Auth::id(),
            'document_id' => $documentId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        try {
            $startTime = microtime(true);

            $response = $this->client->post($this->endpoint, [
                'body' => $soapXml,
                'headers' => [
                    'SOAPAction' => 'http://tempuri.org/CekDataSPPB',
                ],
            ]);

            $endTime = microtime(true);
            $duration = round(($endTime - $startTime) * 1000); // milliseconds

            $responseXml = $response->getBody()->getContents();
            $responseData = $this->parseXmlResponse($responseXml);

            // Log successful response
            $logData = array_merge($logData, [
                'response_data' => $responseData,
                'response_xml' => $responseXml,
                'response_time' => now(),
                'response_code' => $response->getStatusCode(),
                'response_status' => 'SUCCESS',
                'duration_ms' => $duration,
                'request_size' => strlen($soapXml),
                'response_size' => strlen($responseXml),
            ]);

            $this->logSoapRequest($logData);

            return [
                'success' => true,
                'data' => $responseData,
                'raw_response' => $responseXml,
                'duration' => $duration,
            ];

        } catch (GuzzleException $e) {
            $errorMessage = $e->getMessage();
            $logData = array_merge($logData, [
                'response_time' => now(),
                'response_code' => $e->getCode(),
                'response_status' => 'ERROR',
                'error_message' => $errorMessage,
                'error_trace' => $e->getTraceAsString(),
                'duration_ms' => isset($startTime) ? round((microtime(true) - $startTime) * 1000) : null,
            ]);

            $this->logSoapRequest($logData);

            Log::error('SOAP CekDataSPPB Error: '.$errorMessage);

            return [
                'success' => false,
                'error' => $errorMessage,
                'data' => null,
            ];
        }
    }

    /**
     * Cek Data SPPB TPB dengan format tanggal dd-mm-yyyy
     *
     * @param  string  $tanggal  Format: dd-mm-yyyy
     */
    public function cekDataSPPBTPB(string $sppbNumber, string $tanggal, ?string $documentId = null): array
    {
        $method = 'CekDataSPPB_TPB';
        $requestTime = now();

        $requestData = [
            'sppb_number' => $sppbNumber,
            'tanggal' => $tanggal,
            'username' => $this->username,
            'password' => $this->password,
        ];

        // Build SOAP XML Request
        $soapXml = $this->buildCekDataSPPBTPBXml($sppbNumber, $tanggal);

        $logData = [
            'method' => $method,
            'endpoint' => $this->endpoint,
            'request_data' => $requestData,
            'request_xml' => $soapXml,
            'request_time' => $requestTime,
            'user_id' => Auth::id(),
            'document_id' => $documentId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        try {
            $startTime = microtime(true);

            $response = $this->client->post($this->endpoint, [
                'body' => $soapXml,
                'headers' => [
                    'SOAPAction' => 'http://tempuri.org/CekDataSPPB_TPB',
                ],
            ]);

            $endTime = microtime(true);
            $duration = round(($endTime - $startTime) * 1000);

            $responseXml = $response->getBody()->getContents();
            $responseData = $this->parseXmlResponse($responseXml);

            $logData = array_merge($logData, [
                'response_data' => $responseData,
                'response_xml' => $responseXml,
                'response_time' => now(),
                'response_code' => $response->getStatusCode(),
                'response_status' => 'SUCCESS',
                'duration_ms' => $duration,
                'request_size' => strlen($soapXml),
                'response_size' => strlen($responseXml),
            ]);

            $this->logSoapRequest($logData);

            return [
                'success' => true,
                'data' => $responseData,
                'raw_response' => $responseXml,
                'duration' => $duration,
            ];

        } catch (GuzzleException $e) {
            $errorMessage = $e->getMessage();
            $logData = array_merge($logData, [
                'response_time' => now(),
                'response_code' => $e->getCode(),
                'response_status' => 'ERROR',
                'error_message' => $errorMessage,
                'error_trace' => $e->getTraceAsString(),
                'duration_ms' => isset($startTime) ? round((microtime(true) - $startTime) * 1000) : null,
            ]);

            $this->logSoapRequest($logData);

            Log::error('SOAP CekDataSPPB_TPB Error: '.$errorMessage);

            return [
                'success' => false,
                'error' => $errorMessage,
                'data' => null,
            ];
        }
    }

    /**
     * Build SOAP XML for CekDataSPPB
     */
    private function buildCekDataSPPBXml(string $sppbNumber): string
    {
        return '<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                       xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                       xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <CekDataSPPB xmlns="http://tempuri.org/">
                    <UserName>'.htmlspecialchars($this->username).'</UserName>
                    <PassWord>'.htmlspecialchars($this->password).'</PassWord>
                    <NoSPPB>'.htmlspecialchars($sppbNumber).'</NoSPPB>
                </CekDataSPPB>
            </soap:Body>
        </soap:Envelope>';
    }

    /**
     * Build SOAP XML for CekDataSPPB_TPB
     */
    private function buildCekDataSPPBTPBXml(string $sppbNumber, string $tanggal): string
    {
        return '<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                       xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                       xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <CekDataSPPB_TPB xmlns="http://tempuri.org/">
                    <UserName>'.htmlspecialchars($this->username).'</UserName>
                    <PassWord>'.htmlspecialchars($this->password).'</PassWord>
                    <NoSPPB>'.htmlspecialchars($sppbNumber).'</NoSPPB>
                    <TglSPPB>'.htmlspecialchars($tanggal).'</TglSPPB>
                </CekDataSPPB_TPB>
            </soap:Body>
        </soap:Envelope>';
    }

    /**
     * Parse XML response to array
     */
    private function parseXmlResponse(string $xml): array
    {
        try {
            $dom = new \DOMDocument;
            $dom->loadXML($xml);

            // Convert to SimpleXML for easier parsing
            $simpleXml = simplexml_import_dom($dom);

            // Convert to array
            $array = json_decode(json_encode($simpleXml), true);

            return $array;
        } catch (\Exception $e) {
            Log::error('XML Parsing Error: '.$e->getMessage());

            return ['error' => 'Failed to parse XML response'];
        }
    }

    /**
     * Log SOAP request/response
     */
    private function logSoapRequest(array $data): void
    {
        try {
            SoapLog::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to log SOAP request: '.$e->getMessage());
        }
    }

    /**
     * Test SOAP connection
     */
    public function testConnection(): array
    {
        try {
            $testResponse = $this->client->get($this->endpoint.'?WSDL');

            return [
                'success' => true,
                'message' => 'SOAP endpoint is accessible',
                'status_code' => $testResponse->getStatusCode(),
            ];
        } catch (GuzzleException $e) {
            return [
                'success' => false,
                'message' => 'Failed to connect to SOAP endpoint: '.$e->getMessage(),
                'status_code' => $e->getCode(),
            ];
        }
    }
}
