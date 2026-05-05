<?php
namespace App\Services;

use App\Models\BeacukaiCredential;
use App\Models\Document;
use App\Models\SoapLog;
use App\Models\Tangki;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;

class CoCoTangkiService
{
    protected $credential;

    protected $endpoint;

    protected $timeout;

    public function __construct()
    {
        // Get credential from database
        $this->credential = BeacukaiCredential::getByService('cocotangki');

        if ($this->credential && $this->credential->isConfigured()) {
            $this->endpoint = $this->credential->endpoint_url;
        } else {
            // Fallback to config if no credential configured
            $this->endpoint = config('services.cocotangki.endpoint', 'https://tpsonline.beacukai.go.id/cocotangki/service.asmx');
        }

        $this->timeout = config('services.cocotangki.timeout', 30);
    }

    /**
     * Generate CoCoTangki XML dari document dan tangki data
     */
    public function generateCoCoTangkiXML(Document $document): string
    {
        $xml = new SimpleXMLElement('<?xml version="1.0" encoding="utf-8"?><DOCUMENT></DOCUMENT>');

        $cocotangki = $xml->addChild('COCOTANGKI');

        $addChild = function ($parent, $name, $value) {
            // Always add the child node, even if value is empty/null,
            // as Beacukai XSD often requires the tag to be present.
            $parent->addChild($name, htmlspecialchars((string)($value ?? '')));
        };

        // HEADER Section
        $header = $cocotangki->addChild('HEADER');
        $addChild($header, 'KD_DOK', $document->kd_dok);
        $addChild($header, 'KD_TPS', $document->kd_tps);
        $addChild($header, 'NM_ANGKUT', $document->nmAngkut->nm_angkut ?? '');
        $addChild($header, 'NO_VOY_FLIGHT', $document->no_voy_flight);
        $addChild($header, 'CALL_SIGN', $document->nmAngkut->call_sign ?? $document->call_sign ?? '');
        $addChild($header, 'TGL_TIBA', $this->formatDate($document->tgl_tiba));
        $addChild($header, 'KD_GUDANG', $document->kd_gudang);
        $addChild($header, 'REF_NUMBER', $document->ref_number);

        // DETIL Section
        $detil = $cocotangki->addChild('DETIL');

        // Load tangki yang terkait dengan document ini
        $tankiList = $document->tangki()->get();

        foreach ($tankiList as $tangki) {
            $tangkiNode = $detil->addChild('TANGKI');

            $addChild($tangkiNode, 'SERI_OUT', $tangki->urutan ?? $tangki->seri_out ?? '1');
            $addChild($tangkiNode, 'NO_BL_AWB', $tangki->no_bl_awb);
            $addChild($tangkiNode, 'TGL_BL_AWB', $this->formatDate($tangki->tgl_bl_awb));
            $addChild($tangkiNode, 'ID_CONSIGNEE', $tangki->id_consignee);
            $addChild($tangkiNode, 'CONSIGNEE', $tangki->consignee);
            $addChild($tangkiNode, 'NO_BC11', $tangki->no_bc11);
            $addChild($tangkiNode, 'TGL_BC11', $this->formatDate($tangki->tgl_bc11));
            $addChild($tangkiNode, 'NO_POS_BC11', $tangki->no_pos_bc11);
            $addChild($tangkiNode, 'NO_TANGKI', $tangki->no_tangki);
            $addChild($tangkiNode, 'JML_SATUAN', (string)(float)$tangki->jml_satuan);
            $addChild($tangkiNode, 'JNS_SATUAN', $tangki->satuan ?? $tangki->jns_satuan ?? 'KGM');
            $addChild($tangkiNode, 'KD_DOK_INOUT', $tangki->kd_dok_inout);
            $addChild($tangkiNode, 'NO_DOK_INOUT', $tangki->no_dok_inout);
            $addChild($tangkiNode, 'TGL_DOK_INOUT', $this->formatDate($tangki->tgl_dok_inout));
            $addChild($tangkiNode, 'WK_INOUT', $this->formatDateTime($tangki->wk_inout));
            $addChild($tangkiNode, 'KD_SAR_ANGKUT_INOUT', $tangki->kd_sar_angkut_inout);
            $addChild($tangkiNode, 'NO_POL', $tangki->no_pol);
            $addChild($tangkiNode, 'PEL_MUAT', $tangki->pel_muat);
            $addChild($tangkiNode, 'PEL_TRANSIT', $tangki->pel_transit);
            $addChild($tangkiNode, 'PEL_BONGKAR', $tangki->pel_bongkar);
        }

        // Format XML dengan indentasi yang proper
        $dom = new \DOMDocument('1.0', 'utf-8');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        $dom->loadXML($xml->asXML());

        // Tambahkan xmlns="cocotangki.xsd" sesuai referensi schema Beacukai
        $dom->documentElement->setAttribute('xmlns', 'cocotangki.xsd');

        // Force full tags instead of self-closing tags (e.g., <TAG></TAG> instead of <TAG/>)
        // This is often required by Beacukai SOAP parsers.
        $xpath = new \DOMXPath($dom);
        foreach ($xpath->query('//*[not(node())]') as $node) {
            $node->nodeValue = '';
        }

        // Return only element content WITHOUT the declaration.
        return $dom->saveXML($dom->documentElement);
    }

    /**
     * Kirim data CoCoTangki ke endpoint Beacukai
     */
    public function sendCoCoTangkiData(Document $document): array
    {
        try {
            // Check if credential is configured
            if (! $this->credential || ! $this->credential->isConfigured()) {
                throw new \Exception('CoCoTangki credential tidak dikonfigurasi atau tidak lengkap');
            }

            // Generate XML
            $xmlData = $this->generateCoCoTangkiXML($document);

            Log::info('CoCoTangki: Sending data for document ID: '.$document->id, [
                'ref_number' => $document->ref_number,
                'tangki_count' => $document->tangki()->count(),
                'endpoint' => $this->endpoint,
                'username' => $this->credential->username,
            ]);

            $startTime = microtime(true);

            // Prepare SOAP request with credentials
            $soapEnvelope = $this->buildSoapEnvelope(
                $xmlData, 
                $this->credential->username, 
                $this->credential->getDecryptedPassword()
            );

            // Send HTTP request
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Content-Type' => 'text/xml; charset=utf-8',
                    'SOAPAction' => '"http://services.beacukai.go.id/CoCoTangki"',
                ])
                ->send('POST', $this->endpoint, [
                    'body' => $soapEnvelope,
                ]);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);

            // Log SOAP request/response
            $this->logSoapTransaction(
                'CoCoTangki',
                $soapEnvelope,
                $response->body(),
                $response->successful() ? 'success' : 'error',
                $responseTime,
                $response->successful() ? null : $response->status().': '.$response->body()
            );

            if ($response->successful()) {
                $responseXml = $this->parseSoapResponse($response->body());

                // Update document status jika berhasil
                $document->update([
                    'cocotangki_sent_at' => now(),
                    'cocotangki_status' => 'sent',
                    'cocotangki_response' => $responseXml,
                ]);

                // Record credential usage
                $this->credential->recordUsage();

                Log::info('CoCoTangki: Successfully sent data for document ID: '.$document->id);

                return [
                    'success' => true,
                    'message' => 'Data CoCoTangki berhasil dikirim',
                    'response_time' => $responseTime,
                    'response_data' => $responseXml,
                    'ref_number' => $document->ref_number,
                ];
            } else {
                $errorMessage = 'HTTP Error: '.$response->status();

                $document->update([
                    'cocotangki_status' => 'error',
                    'cocotangki_error' => $errorMessage,
                ]);

                Log::error('CoCoTangki: Failed to send data for document ID: '.$document->id, [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'message' => 'Gagal mengirim data CoCoTangki: '.$errorMessage,
                    'response_time' => $responseTime,
                    'error' => $response->body(),
                ];
            }

        } catch (\Exception $e) {
            Log::error('CoCoTangki: Exception occurred', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $document->update([
                'cocotangki_status' => 'error',
                'cocotangki_error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Terjadi kesalahan: '.$e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Kirim data multiple documents sekaligus
     */
    public function sendBulkCoCoTangkiData(array $documentIds): array
    {
        $results = [];
        $successCount = 0;
        $errorCount = 0;

        foreach ($documentIds as $documentId) {
            $document = Document::with('tangki')->find($documentId);

            if (! $document) {
                $results[] = [
                    'document_id' => $documentId,
                    'success' => false,
                    'message' => 'Document tidak ditemukan',
                ];
                $errorCount++;

                continue;
            }

            $result = $this->sendCoCoTangkiData($document);
            $result['document_id'] = $documentId;
            $result['ref_number'] = $document->ref_number;

            $results[] = $result;

            if ($result['success']) {
                $successCount++;
            } else {
                $errorCount++;
            }

            // Add small delay between requests to avoid overwhelming the server
            usleep(500000); // 0.5 second
        }

        return [
            'total_processed' => count($documentIds),
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'results' => $results,
        ];
    }

    /**
     * Validasi data sebelum mengirim
     */
    public function validateCoCoTangkiData(Document $document): array
    {
        $errors = [];

        // Validasi document header
        if (empty($document->kd_dok)) {
            $errors[] = 'KD_DOK harus diisi';
        }

        if (empty($document->kd_tps)) {
            $errors[] = 'KD_TPS harus diisi';
        }

        if (empty($document->ref_number)) {
            $errors[] = 'REF_NUMBER harus diisi';
        }

        // Validasi tangki data
        $tankiList = $document->tangki()->get();

        if ($tankiList->isEmpty()) {
            $errors[] = 'Tidak ada data tangki yang terkait dengan document ini';
        }

        foreach ($tankiList as $index => $tangki) {
            $tangkiErrors = [];

            if (empty($tangki->no_tangki)) {
                $tangkiErrors[] = 'NO_TANGKI harus diisi';
            }

            if (empty($tangki->jml_satuan) || $tangki->jml_satuan <= 0) {
                $tangkiErrors[] = 'JML_SATUAN harus diisi dan lebih dari 0';
            }

            if (empty($tangki->consignee)) {
                $tangkiErrors[] = 'CONSIGNEE harus diisi';
            }

            if (! empty($tangkiErrors)) {
                $errors[] = 'Tangki '.($index + 1).': '.implode(', ', $tangkiErrors);
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Build SOAP envelope
     */
    private function buildSoapEnvelope(string $xmlData, string $username, string $password): string
    {
        return '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CoCoTangki xmlns="http://services.beacukai.go.id/">
      <fStream><![CDATA['.$xmlData.']]></fStream>
      <Username>'.htmlspecialchars($username, ENT_XML1, 'UTF-8').'</Username>
      <Password>'.htmlspecialchars($password, ENT_XML1, 'UTF-8').'</Password>
    </CoCoTangki>
  </soap:Body>
</soap:Envelope>';
    }

    /**
     * Parse SOAP response
     */
    private function parseSoapResponse(string $soapResponse): array
    {
        try {
            $xml = simplexml_load_string($soapResponse);
            $xml->registerXPathNamespace('soap', 'http://schemas.xmlsoap.org/soap/envelope/');

            // Extract result from SOAP response
            $result = $xml->xpath('//CoCoTangkiResult');

            if (! empty($result)) {
                $resultText = trim((string) $result[0]);

                // Beacukai returns an error message when validation fails
                // Success messages typically contain 'berhasil', a doc number, or are empty
                $isError = stripos($resultText, 'tidak benar') !== false
                    || stripos($resultText, 'validasi') !== false
                    || stripos($resultText, 'error') !== false
                    || stripos($resultText, 'gagal') !== false
                    || stripos($resultText, 'failed') !== false;

                if ($isError) {
                    return [
                        'status'  => 'error',
                        'message' => 'Beacukai menolak dokumen: ' . $resultText,
                        'result'  => $resultText,
                    ];
                }

                return [
                    'status'  => 'success',
                    'message' => 'Data berhasil diterima',
                    'result'  => $resultText,
                ];
            }

            return [
                'status'      => 'unknown',
                'message'     => 'Response tidak dapat diparse',
                'raw_response' => $soapResponse,
            ];

        } catch (\Exception $e) {
            return [
                'status'      => 'error',
                'message'     => 'Error parsing response: '.$e->getMessage(),
                'raw_response' => $soapResponse,
            ];
        }
    }

    /**
     * Log SOAP transaction
     */
    private function logSoapTransaction(string $method, string $request, string $response, string $status, float $responseTime, ?string $errorMessage = null): void
    {
        SoapLog::create([
            'method' => $method,
            'endpoint' => $this->endpoint,
            'request_data' => $request,
            'response_data' => $response,
            'response_status' => $status,
            'request_time' => now()->subMilliseconds($responseTime),
            'response_time' => now(),
            'duration_ms' => $responseTime,
            'error_message' => $errorMessage,
            'user_id' => auth()->id(),
        ]);
    }

    /**
     * Format date untuk XML (YYYYMMDD)
     */
    private function formatDate($date): string
    {
        if (empty($date)) {
            return '';
        }

        try {
            return Carbon::parse($date)->format('Ymd');
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Format datetime untuk XML (YYYYMMDDHHmmss + timezone offset)
     */
    private function formatDateTime($datetime): string
    {
        if (empty($datetime)) {
            return '';
        }

        try {
            $carbon = Carbon::parse($datetime)->setTimezone('Asia/Jakarta');
            
            // Format: YYYYMMDDHHMMSS
            return $carbon->format('YmdHis');
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Get CoCoTangki submission status untuk document
     */
    public function getSubmissionStatus(Document $document): array
    {
        return [
            'document_id' => $document->id,
            'ref_number' => $document->ref_number,
            'status' => $document->cocotangki_status ?? 'not_sent',
            'sent_at' => $document->cocotangki_sent_at,
            'error' => $document->cocotangki_error,
            'response' => $document->cocotangki_response,
            'tangki_count' => $document->tangki()->count(),
        ];
    }
}
