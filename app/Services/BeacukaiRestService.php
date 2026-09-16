<?php

namespace App\Services;

use App\Models\BeacukaiCredential;
use App\Models\KontainerDocument;
use App\Models\KontainerAudit;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class BeacukaiRestService
{
    protected $client;
    protected $credentials;

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'verify' => false, // Set to true in production
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);

        // Fetch REST credentials
        $this->credentials = BeacukaiCredential::where('service_type', 'REST')
            ->where('is_active', true)
            ->first();
    }

    /**
     * Submit Kontainer Document to Beacukai
     */
    public function submitKontainer(KontainerDocument $document)
    {
        if (!$this->credentials) {
            return [
                'success' => false,
                'message' => 'API Credentials not found or inactive',
                'status' => 'AUTH_ERROR'
            ];
        }

        $payload = $this->mapToSchema($document);
        $startTime = microtime(true);

        try {
            $response = $this->client->post($this->credentials->endpoint_url, [
                'json' => $payload,
                'auth' => [
                    $this->credentials->username,
                    $this->credentials->password
                ]
            ]);

            $statusCode = $response->getStatusCode();
            $responseData = json_decode($response->getBody()->getContents(), true);
            $duration = round((microtime(true) - $startTime) * 1000);

            $result = $this->handleResponse($statusCode, $responseData, $document, $duration);
            
            // Audit Log
            $this->logAudit($document, 'submit', $payload, $responseData, $statusCode);

            return $result;

        } catch (GuzzleException $e) {
            $statusCode = $e->getCode();
            $errorResponse = method_exists($e, 'getResponse') && $e->getResponse() 
                ? json_decode($e->getResponse()->getBody()->getContents(), true) 
                : ['message' => $e->getMessage()];

            $result = $this->handleResponse($statusCode, $errorResponse, $document);
            
            // Audit Log
            $this->logAudit($document, 'submit_error', $payload, $errorResponse, $statusCode);

            return $result;
        }
    }

    /**
     * Map Internal Model to Beacukai JSON Schema
     */
    protected function mapToSchema(KontainerDocument $document): array
    {
        $document->load('kontainers');

        return [
            'header' => [
                'kodeDokumen' => (string) $document->kd_dok,
                'kodeTps' => $document->kd_tps,
                'tanggalTiba' => $document->tgl_tiba->format('d-m-Y'),
                'kodeGudang' => $document->kd_gudang,
                'refNumber' => $document->ref_number,
                'noBc11' => $document->no_bc11,
                'tanggalBc11' => $document->tgl_bc11->format('d-m-Y'),
            ],
            'kontainer' => $document->kontainers->map(function ($k) {
                return [
                    'nomorKontainer' => $k->no_kontainer,
                    'ukuranKontainer' => $k->ukuran_kontainer,
                    'nomorSegel' => $k->no_segel,
                    'jenisKontainer' => $k->jns_kontainer,
                    'kodeKantor' => $k->kd_kantor,
                    'noBlAwb' => $k->no_bl_awb,
                    'tanggalBlAwb' => $k->tgl_bl_awb ? $k->tgl_bl_awb->format('d-m-Y') : null,
                    'noMasterBlAwb' => $k->no_master_bl_awb,
                    'tanggalMasterBlAwb' => $k->tgl_master_bl_awb ? $k->tgl_master_bl_awb->format('d-m-Y') : null,
                    'idConsignee' => $k->id_consignee,
                    'consignee' => $k->consignee,
                    'bruto' => (float) $k->bruto,
                    'waktuInOut' => $k->wk_inout->format('d-m-Y H:i:s'),
                    'nomorPosBc11' => $k->no_pos_bc11,
                    'kodeTimbun' => $k->kd_timbun,
                    'kodeSaranaPengangkut' => $k->kd_sar_angkut,
                    'nomorPolisi' => $k->no_pol,
                    'flagKontainer' => (bool) $k->fl_kontainer,
                    'isoCode' => $k->iso_code,
                    'pelabuhanMuat' => $k->pel_muat,
                    'pelabuhanTransit' => $k->pel_transit,
                    'pelabuhanBongkar' => $k->pel_bongkar,
                    'gudangTujuan' => $k->gudang_tujuan,
                    'nomorDaftarPabean' => $k->no_daftar_pabean,
                    'tanggalDaftarPabean' => $k->tgl_daftar_pabean ? $k->tgl_daftar_pabean->format('d-m-Y') : null,
                    'nomorSegelBc' => $k->no_segel_bc,
                    'tanggalSegelBc' => $k->tgl_segel_bc ? $k->tgl_segel_bc->format('d-m-Y') : null,
                    'nomorIjinTps' => $k->no_ijin_tps,
                    'tanggalIjinTps' => $k->tgl_ijin_tps ? $k->tgl_ijin_tps->format('d-m-Y') : null,
                    'kodeDokumenInOut' => $k->kd_dok_inout,
                ];
            })->toArray()
        ];
    }

    /**
     * Map HTTP Status to Internal Business Status
     */
    protected function handleResponse(int $code, array $data, KontainerDocument $document, int $duration = 0): array
    {
        $statusMap = [
            200 => 'SUCCESS',
            201 => 'SUCCESS',
            204 => 'SUCCESS',
            400 => 'REJECTED',
            401 => 'AUTH_ERROR',
            403 => 'AUTH_ERROR',
            409 => 'DUPLICATE',
        ];

        $status = $statusMap[$code] ?? ($code >= 500 ? 'RETRY_LATER' : 'ERROR');

        $document->update([
            'status' => $status,
            'sent_at' => now(),
            'response_data' => array_merge($data, ['http_code' => $code, 'duration_ms' => $duration]),
        ]);

        return [
            'success' => in_array($status, ['SUCCESS']),
            'status' => $status,
            'message' => $data['message'] ?? ($status == 'SUCCESS' ? 'Data accepted' : 'Beacukai error'),
            'data' => $data
        ];
    }

    /**
     * Log to KontainerAudit
     */
    protected function logAudit(KontainerDocument $document, string $event, array $payload, array $response, int $code)
    {
        KontainerAudit::create([
            'auditable_type' => KontainerDocument::class,
            'auditable_id' => $document->id,
            'user_id' => Auth::id(),
            'event' => $event,
            'old_values' => ['status' => $document->getOriginal('status')],
            'new_values' => [
                'status' => $document->status,
                'http_code' => $code,
                'payload_size' => strlen(json_encode($payload)),
                'response' => $response
            ],
            'url' => request()->fullUrl(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
