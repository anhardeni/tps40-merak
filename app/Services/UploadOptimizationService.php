<?php

namespace App\Services;

use App\Models\Document;
use App\Models\KdDok;
use App\Models\KdGudang;
use App\Models\KdTps;
use App\Models\NmAngkut;
use App\Models\Tangki;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service to optimize bulk Excel uploads and prevent side-effect database bottlenecks.
 */
class UploadOptimizationService
{
    /**
     * In-memory cache for reference entities during batch execution.
     */
    protected array $nmAngkutCache = [];
    protected array $kdTpsCache = [];
    protected array $kdGudangCache = [];
    protected array $kdDokCache = [];

    /**
     * Generate a batch of unique sequential reference numbers in a single DB count operation.
     * Prevents N SQL COUNT(*) queries inside batch upload loops.
     *
     * @param int $count Number of reference numbers needed
     * @param string $prefix Gudang prefix (default 'A019')
     * @return array Array of generated reference numbers
     */
    public function generateBatchRefNumbers(int $count, string $prefix = 'A019'): array
    {
        if ($count <= 0) {
            return [];
        }

        $year = date('y');
        $month = date('m');
        $day = date('d');
        $pattern = $prefix . $year . $month . $day . '%';

        // Single query to count existing records for today
        $startSequence = Document::whereDate('created_at', today())
            ->where('ref_number', 'like', $pattern)
            ->count() + 1;

        $refNumbers = [];
        for ($i = 0; $i < $count; $i++) {
            $seqStr = str_pad($startSequence + $i, 6, '0', STR_PAD_LEFT);
            $refNumbers[] = $prefix . $year . $month . $day . $seqStr;
        }

        return $refNumbers;
    }

    /**
     * Get or create NmAngkut with in-memory caching to avoid repeated DB queries.
     */
    public function getOrCacheNmAngkut(string $name): NmAngkut
    {
        $key = strtoupper(trim($name));
        if (empty($key)) {
            $key = 'UNKNOWN';
        }

        if (!isset($this->nmAngkutCache[$key])) {
            $this->nmAngkutCache[$key] = NmAngkut::firstOrCreate(['nm_angkut' => $key]);
        }

        return $this->nmAngkutCache[$key];
    }

    /**
     * Ensure KdTps exists with in-memory caching.
     */
    public function ensureKdTps(string $kdTps): KdTps
    {
        $code = strtoupper(trim($kdTps)) ?: 'PLCM';

        if (!isset($this->kdTpsCache[$code])) {
            $this->kdTpsCache[$code] = KdTps::firstOrCreate(
                ['kd_tps' => $code],
                ['nm_tps' => 'TPS ' . $code, 'is_active' => true]
            );
        }

        return $this->kdTpsCache[$code];
    }

    /**
     * Ensure KdGudang exists with in-memory caching.
     */
    public function ensureKdGudang(string $kdGudang, string $kdTps = 'PLCM'): KdGudang
    {
        $code = strtoupper(trim($kdGudang)) ?: 'A019';

        if (!isset($this->kdGudangCache[$code])) {
            $this->kdGudangCache[$code] = KdGudang::firstOrCreate(
                ['kd_gudang' => $code],
                [
                    'nm_gudang' => 'Gudang ' . $code,
                    'kd_tps' => $kdTps,
                    'is_active' => true,
                ]
            );
        }

        return $this->kdGudangCache[$code];
    }

    /**
     * Ensure KdDok exists with in-memory caching.
     */
    public function ensureKdDok(string $kdDok, string $defaultName = 'BC 2.0'): KdDok
    {
        $code = trim($kdDok) ?: '3';

        if (!isset($this->kdDokCache[$code])) {
            $this->kdDokCache[$code] = KdDok::firstOrCreate(
                ['kd_dok' => $code],
                ['nm_dok' => $defaultName, 'is_active' => true]
            );
        }

        return $this->kdDokCache[$code];
    }

    /**
     * Perform fast bulk insert for Tangki detail records in chunks.
     * Prevents N individual Eloquent create SQL statements.
     *
     * @param int $documentId Master Document ID
     * @param array $details Detail items array
     * @param int $chunkSize Number of records per INSERT statement
     * @return int Count of inserted rows
     */
    public function bulkInsertTangkiDetails(int $documentId, array $details, int $chunkSize = 200): int
    {
        if (empty($details)) {
            return 0;
        }

        $now = now()->toDateTimeString();
        $records = [];

        foreach ($details as $index => $detail) {
            $seriOut = (isset($detail['seri_out']) && is_numeric($detail['seri_out'])) ? (int)$detail['seri_out'] : null;

            $records[] = [
                'document_id' => $documentId,
                'no_tangki' => $detail['no_tangki'] ?? ('TANGKI-' . ($index + 1)),
                'seri_out' => $seriOut,
                'no_bl_awb' => $detail['no_bl_awb'] ?? '-',
                'tgl_bl_awb' => $detail['tgl_bl_awb'] ?? null,
                'id_consignee' => $detail['id_consignee'] ?? null,
                'consignee' => $detail['consignee'] ?? null,
                'no_bc11' => $detail['no_bc11'] ?? '-',
                'tgl_bc11' => $detail['tgl_bc11'] ?? null,
                'no_pos_bc11' => $detail['no_pos_bc11'] ?? null,
                'jml_satuan' => floatval($detail['jml_satuan'] ?? 0),
                'jns_satuan' => $detail['jns_satuan'] ?? 'KGM',
                'kd_dok_inout' => $detail['kd_dok_inout'] ?? '1',
                'no_dok_inout' => $detail['no_dok_inout'] ?? '-',
                'tgl_dok_inout' => $detail['tgl_dok_inout'] ?? null,
                'wk_inout' => $detail['wk_inout'] ?? null,
                'kd_sar_angkut_inout' => $detail['kd_sar_angkut_inout'] ?? '1',
                'no_pol' => $detail['no_pol'] ?? null,
                'pel_muat' => $detail['pel_muat'] ?? null,
                'pel_transit' => $detail['pel_transit'] ?? null,
                'pel_bongkar' => $detail['pel_bongkar'] ?? null,
                'jenis_isi' => $detail['jenis_isi'] ?? 'KIMIA',
                'jumlah_isi' => floatval($detail['jumlah_isi'] ?? 0),
                'satuan' => $detail['satuan'] ?? 'KGM',
                'urutan' => $index + 1,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert in optimized chunks
        $insertedTotal = 0;
        foreach (array_chunk($records, $chunkSize) as $chunk) {
            Tangki::insert($chunk);
            $insertedTotal += count($chunk);
        }

        return $insertedTotal;
    }

    /**
     * Process optimized batch import of master groups and detail tangki.
     * Wraps transaction, reference caching, and bulk inserting into a single high-performance pipeline.
     *
     * @param array $groups Array of master group data with details
     * @param string $kdDok Default kd_dok ('1' for Pemasukan, '3' for Pengeluaran)
     * @param int $userId ID of user executing import
     * @return array Summary of result ['created_documents' => int, 'created_tangki' => int]
     */
    public function processOptimizedBatchImport(array $groups, string $kdDok = '3', int $userId = 1): array
    {
        if (empty($groups)) {
            return ['created_documents' => 0, 'created_tangki' => 0];
        }

        // Pre-generate ref numbers for all master documents in a single DB query
        $batchRefNumbers = $this->generateBatchRefNumbers(count($groups));

        $createdDocuments = 0;
        $createdTangki = 0;

        DB::transaction(function () use ($groups, $kdDok, $userId, $batchRefNumbers, &$createdDocuments, &$createdTangki) {
            foreach ($groups as $groupIndex => $groupData) {
                // 1. Get cached reference models (0 redundant DB queries)
                $nmAngkut = $this->getOrCacheNmAngkut($groupData['nm_angkut'] ?? 'UNKNOWN');
                $kdTpsCode = $groupData['kd_tps'] ?? 'PLCM';
                $this->ensureKdTps($kdTpsCode);

                $kdGudangCode = $groupData['kd_gudang'] ?? 'A019';
                $this->ensureKdGudang($kdGudangCode, $kdTpsCode);

                $defaultDokName = $kdDok === '1' ? 'BC 1.1' : 'BC 2.0';
                $this->ensureKdDok($kdDok, $defaultDokName);

                // 2. Determine Ref Number (use Excel provided or pre-generated batch ref number)
                $refNumber = (!empty($groupData['ref_number']) && trim($groupData['ref_number']) !== '-')
                    ? $groupData['ref_number']
                    : ($batchRefNumbers[$groupIndex] ?? Document::generateRefNumber());

                // 3. Create Master Document
                $document = Document::create([
                    'ref_number' => $refNumber,
                    'kd_dok' => $kdDok,
                    'kd_tps' => $kdTpsCode,
                    'nm_angkut_id' => $nmAngkut->id,
                    'kd_gudang' => $kdGudangCode,
                    'no_voy_flight' => $groupData['no_voy_flight'] ?? '-',
                    'call_sign' => $groupData['call_sign'] ?? '-',
                    'tgl_entry' => now()->toDateString(),
                    'jam_entry' => now()->toTimeString(),
                    'tgl_tiba' => $groupData['tgl_tiba'] ?? now()->toDateString(),
                    'tgl_gate_in' => now()->toDateString(),
                    'jam_gate_in' => now()->toTimeString(),
                    'status' => 'DRAFT',
                    'no_dok_ijin_tps' => $groupData['no_dok_ijin_tps'] ?? null,
                    'tgl_dok_ijin_tps' => $groupData['tgl_dok_ijin_tps'] ?? null,
                    'created_by' => $userId,
                    'updated_by' => $userId,
                ]);

                $createdDocuments++;

                // 4. Perform fast bulk insertion of Tangki details
                if (!empty($groupData['details'])) {
                    $inserted = $this->bulkInsertTangkiDetails($document->id, $groupData['details']);
                    $createdTangki += $inserted;
                }
            }
        });

        return [
            'created_documents' => $createdDocuments,
            'created_tangki' => $createdTangki,
        ];
    }
}
