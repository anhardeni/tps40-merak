<?php

namespace App\Http\Controllers;

use App\Imports\PengeluaranImport;
use App\Models\Document;
use App\Models\KdDok;
use App\Models\KdGudang;
use App\Models\KdTps;
use App\Models\NmAngkut;
use App\Models\Tangki;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PengeluaranController extends Controller
{
    /**
     * Display a listing of Pengeluaran documents (KD_DOK = 3)
     */
    public function index(Request $request)
    {
        $query = Document::with(['tangki', 'nmAngkut', 'kdDok', 'kdTps', 'kdGudang'])
            ->where('kd_dok', '3');

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ref_number', 'like', "%{$search}%")
                    ->orWhere('no_dok_ijin_tps', 'like', "%{$search}%")
                    ->orWhereHas('tangki', function ($tq) use ($search) {
                        $tq->where('no_bl_awb', 'like', "%{$search}%")
                            ->orWhere('no_bc11', 'like', "%{$search}%")
                            ->orWhere('no_tangki', 'like', "%{$search}%")
                            ->orWhere('no_pol', 'like', "%{$search}%")
                            ->orWhere('consignee', 'like', "%{$search}%");
                    });
            });
        }

        // Date Filter
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('tgl_entry', [$request->start_date, $request->end_date]);
        }

        // Status Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $documents = $query->latest()->paginate(15)->withQueryString();

        // Calculate Stats
        $stats = [
            'totalDocuments' => Document::where('kd_dok', '3')->count(),
            'totalVolume' => Tangki::whereHas('document', fn($q) => $q->where('kd_dok', '3'))->sum('jml_satuan'),
            'totalTrucks' => Tangki::whereHas('document', fn($q) => $q->where('kd_dok', '3'))->whereNotNull('no_pol')->count(),
            'sentToHost' => Document::where('kd_dok', '3')->where('sent_to_host', true)->count(),
        ];

        return Inertia::render('Pengeluaran/Index', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'start_date', 'end_date', 'status']),
            'stats' => $stats,
        ]);
    }

    /**
     * Preview Excel Upload before saving (Pengeluaran)
     */
    public function importPreview(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $import = new PengeluaranImport();
            $sheets = Excel::toCollection($import, $request->file('file'));

            if ($sheets->isEmpty()) {
                return response()->json(['error' => 'File Excel kosong atau format tidak sesuai.'], 422);
            }

            $rows = collect();
            foreach ($sheets as $sheet) {
                if ($sheet instanceof Collection) {
                    $rows = $rows->concat($sheet);
                } elseif (is_array($sheet)) {
                    $rows = $rows->concat(collect($sheet));
                }
            }

            if ($rows->isEmpty()) {
                return response()->json(['error' => 'File Excel kosong atau format tidak sesuai.'], 422);
            }

            $groupedData = [];
            $errors = [];
            $headerMap = null;

            $knownHeaders = [
                'KDDOK', 'KDTPS', 'NMANGKUT', 'NOVOYFLIGHT', 'CALLSIGN', 'TGLTIBA',
                'KDGUDANG', 'REFNUMBER', 'NOBLAWB', 'NOBL', 'TGLBLAWB', 'IDCONSIGNEE',
                'CONSIGNEE', 'NOBC11', 'TGLBC11', 'NOPOSBC11', 'NOTANGKI', 'JMLSATOAN',
                'JMLSATUAN', 'JNSSATUAN', 'KDDOKINOUT', 'NODOKINOUT', 'TGLDOKINOUT',
                'WKINOUT', 'KDSARANGKUTINOUT', 'PELMUAT', 'PELTRANSIT', 'PELBONGKAR',
                'SERIOUT', 'NOPOL', 'NOIJINTPS', 'TGLIJINTPS'
            ];

            foreach ($rows as $index => $row) {
                if ($row instanceof Collection) {
                    $rowArray = $row->toArray();
                } elseif (is_array($row)) {
                    $rowArray = $row;
                } else {
                    $rowArray = (array)$row;
                }
                $rowValues = array_values($rowArray);

                // Check if row has any non-empty data
                $nonEmpty = array_filter($rowValues, function ($v) {
                    $s = $this->toStr($v);
                    return $s !== '' && $s !== '-';
                });
                if (empty($nonEmpty)) {
                    continue;
                }

                $firstVal = strtoupper($this->toStr($rowValues[0] ?? ''));

                // Dynamic Header Detection: Check if 2 or more cells match known headers
                $matchedHeaders = 0;
                foreach ($rowValues as $v) {
                    $cleanV = strtoupper(preg_replace('/[^A-Z0-9]/', '', $this->toStr($v)));
                    if (in_array($cleanV, $knownHeaders)) {
                        $matchedHeaders++;
                    }
                }

                if ($matchedHeaders >= 2) {
                    $headerMap = [];
                    foreach ($rowValues as $colIdx => $colName) {
                        $cleanCol = strtoupper(preg_replace('/[^A-Z0-9]/', '', $this->toStr($colName)));
                        if ($colIdx === 0 && (empty($cleanCol) || is_numeric($cleanCol) || $cleanCol === 'KDDOK')) {
                            $cleanCol = 'KDDOK';
                        }
                        if (!empty($cleanCol)) {
                            $headerMap[$colIdx] = $cleanCol;
                        }
                    }
                    continue; // Skip processing header row as data
                }

                // Skip markdown sheet title comments
                if (str_contains(strtoupper($firstVal), 'SHEET')) {
                    continue;
                }

                // Combine row with headerMap if available, keeping numeric indexes as fallback
                $dataRow = [];
                foreach ($rowValues as $colIdx => $val) {
                    $dataRow[$colIdx] = $val;
                    if ($headerMap && isset($headerMap[$colIdx])) {
                        $dataRow[$headerMap[$colIdx]] = $val;
                    }
                }

                $kdDok = $this->toStr($this->getRowValue($dataRow, ['KDDOK', 'KD_DOK'], 0, ''));
                if ($kdDok === '1') {
                    continue; // Skip Pemasukan rows in Pengeluaran import
                }

                $noBlAwb = $this->getRowValue($dataRow, ['NOBLAWB', 'NOBL', 'BLAWB', 'BL', 'NOAWB', 'BLNUMBER'], 9);
                $noBc11 = $this->getRowValue($dataRow, ['NOBC11', 'BC11', 'NOBC'], 13);
                $noDokInout = $this->getRowValue($dataRow, ['NODOKINOUT', 'NODOK', 'DOKINOUT', 'NOINOUT'], 20);
                $noTangki = $this->getRowValue($dataRow, ['NOTANGKI', 'TANGKI', 'NOMORTANGKI', 'TANKNO', 'CONTAINER', 'NOKONTAINER'], 16);
                $noPol = $this->getRowValue($dataRow, ['NOPOL', 'NOPOLISI', 'NOMORPOLISI', 'TRUK', 'TRUCK'], 24);
                $nmAngkut = $this->getRowValue($dataRow, ['NMANGKUT', 'NAMAANGKUT', 'NAMAKAPAL', 'VESSEL', 'VESSELNAME', 'KAPAL'], 2, 'UNKNOWN');
                $tglTibaRaw = $this->getRowValue($dataRow, ['TGLTIBA', 'TANGGALTIBA', 'TIBA'], 5);

                $tglTiba = $this->parseDate($tglTibaRaw) ?: date('Y-m-d');
                $voy = $this->getRowValue($dataRow, ['NOVOYFLIGHT', 'VOYAGE', 'NOVOY', 'VOY'], 3, '-');

                $groupKey = strtoupper(trim($this->toStr($nmAngkut))) . '_' . $tglTiba;
                if ($voy !== '-' && !empty($voy)) {
                    $groupKey .= '_' . strtoupper(trim($this->toStr($voy)));
                }

                if (!isset($groupedData[$groupKey])) {
                    $groupedData[$groupKey] = [
                        'kd_dok' => '3',
                        'kd_tps' => $this->getRowValue($dataRow, ['KDTPS', 'KODE_TPS'], 1, 'PLCM'),
                        'nm_angkut' => $nmAngkut,
                        'no_voy_flight' => $voy,
                        'call_sign' => $this->getRowValue($dataRow, ['CALLSIGN', 'CALL_SIGN'], 4, '-'),
                        'tgl_tiba' => $this->parseDate($tglTibaRaw),
                        'kd_gudang' => $this->getRowValue($dataRow, ['KDGUDANG', 'KODE_GUDANG', 'GUDANG'], 6, 'A019'),
                        'ref_number' => $this->getRowValue($dataRow, ['REFNUMBER', 'REF_NUMBER'], 7),
                        'no_dok_ijin_tps' => $this->getRowValue($dataRow, ['NOIJINTPS', 'NO_IJIN_TPS'], 31),
                        'tgl_dok_ijin_tps' => $this->parseDate($this->getRowValue($dataRow, ['TGLIJINTPS', 'TGL_IJIN_TPS'], 32)),
                        'details' => [],
                    ];
                }

                $groupedData[$groupKey]['details'][] = [
                    'no_tangki' => $noTangki ?: 'TANGKI-' . (count($groupedData[$groupKey]['details']) + 1),
                    'seri_out' => is_numeric($this->getRowValue($dataRow, ['SERIOUT', 'SERI_OUT'], 8)) ? (int)$this->getRowValue($dataRow, ['SERIOUT', 'SERI_OUT'], 8) : null,
                    'no_bl_awb' => $noBlAwb ?: '-',
                    'tgl_bl_awb' => $this->parseDate($this->getRowValue($dataRow, ['TGLBLAWB', 'TGL_BL_AWB'], 10)),
                    'id_consignee' => $this->getRowValue($dataRow, ['IDCONSIGNEE', 'ID_CONSIGNEE'], 11),
                    'consignee' => $this->getRowValue($dataRow, ['CONSIGNEE', 'NAMA_CONSIGNEE', 'PEMILIK'], 12),
                    'no_bc11' => $noBc11 ?: '-',
                    'tgl_bc11' => $this->getRowValue($dataRow, ['TGLBC11', 'TGL_BC11'], 14),
                    'no_pos_bc11' => $this->getRowValue($dataRow, ['NOPOSBC11', 'NO_POS_BC11'], 15),
                    'jml_satuan' => floatval($this->getRowValue($dataRow, ['JMLSATOAN', 'JMLSATUAN', 'JML_SATUAN', 'JUMLAH', 'QTY'], 17, 0)),
                    'jns_satuan' => $this->getRowValue($dataRow, ['JNSSATUAN', 'JNS_SATUAN', 'SATUAN'], 18, 'KGM'),
                    'kd_dok_inout' => $this->getRowValue($dataRow, ['KDDOKINOUT', 'KD_DOK_INOUT'], 19, '1'),
                    'no_dok_inout' => $noDokInout ?: '-',
                    'tgl_dok_inout' => $this->parseDate($this->getRowValue($dataRow, ['TGLDOKINOUT', 'TGL_DOK_INOUT'], 21)),
                    'wk_inout' => $this->parseDateTime($this->getRowValue($dataRow, ['WKINOUT', 'WK_INOUT'], 22)),
                    'kd_sar_angkut_inout' => $this->getRowValue($dataRow, ['KDSARANGKUTINOUT', 'KD_SAR_ANGKUT_INOUT'], 23, '1'),
                    'no_pol' => $noPol ?: null,
                    'pel_muat' => $this->getRowValue($dataRow, ['PELMUAT', 'PEL_MUAT'], 25),
                    'pel_transit' => $this->getRowValue($dataRow, ['PELTRANSIT', 'PEL_TRANSIT'], 26),
                    'pel_bongkar' => $this->getRowValue($dataRow, ['PELBONGKAR', 'PEL_BONGKAR'], 27),
                    'jenis_isi' => 'KIMIA',
                    'satuan' => $this->getRowValue($dataRow, ['JNSSATUAN', 'JNS_SATUAN', 'SATUAN'], 18, 'KGM'),
                    'jumlah_isi' => floatval($this->getRowValue($dataRow, ['JMLSATOAN', 'JMLSATUAN', 'JML_SATUAN', 'JUMLAH', 'QTY'], 17, 0)),
                ];
            }

            $groups = array_values($groupedData);
            if (empty($groups)) {
                return response()->json(['error' => 'Tidak ditemukan data Pengeluaran (KD_DOK = 3) yang valid dalam file Excel.'], 422);
            }

            $totalDetailCount = array_sum(array_map(fn($g) => count($g['details']), $groups));

            return response()->json([
                'success' => true,
                'summary' => [
                    'total_master' => count($groups),
                    'total_detail' => $totalDetailCount,
                    'total_errors' => count($errors),
                ],
                'groups' => $groups,
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            Log::error("Import Pengeluaran Preview Error: " . $e->getMessage());
            return response()->json(['error' => 'Gagal membaca file Excel: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Confirm and Save Excel Import Groups (Pengeluaran)
     */
    public function importConfirm(Request $request)
    {
        $request->validate([
            'groups' => 'required|array|min:1',
            'groups.*.kd_dok' => 'required',
            'groups.*.details' => 'required|array|min:1',
        ]);

        DB::beginTransaction();
        try {
            $createdDocuments = 0;
            $createdTangki = 0;

            foreach ($request->groups as $groupData) {
                // Find or Create NmAngkut
                $nmAngkutName = $groupData['nm_angkut'] ?? 'UNKNOWN';
                $nmAngkut = NmAngkut::firstOrCreate(['nm_angkut' => $nmAngkutName]);

                // Find or Create KdTps and KdGudang
                $kdTpsCode = $groupData['kd_tps'] ?? 'PLCM';
                KdTps::firstOrCreate(
                    ['kd_tps' => $kdTpsCode],
                    ['nm_tps' => 'TPS ' . $kdTpsCode, 'is_active' => true]
                );

                $kdGudangCode = $groupData['kd_gudang'] ?? 'A019';
                KdGudang::firstOrCreate(
                    ['kd_gudang' => $kdGudangCode],
                    [
                        'nm_gudang' => 'Gudang ' . $kdGudangCode,
                        'kd_tps' => $kdTpsCode,
                        'is_active' => true,
                    ]
                );

                KdDok::firstOrCreate(
                    ['kd_dok' => '3'],
                    ['nm_dok' => 'BC 2.0', 'is_active' => true]
                );

                $refNumber = (!empty($groupData['ref_number']) && trim($groupData['ref_number']) !== '-')
                    ? $groupData['ref_number']
                    : Document::generateRefNumber();

                // Create Master Document
                $document = Document::create([
                    'ref_number' => $refNumber,
                    'kd_dok' => '3',
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
                    'created_by' => auth()->id() ?? 1,
                    'updated_by' => auth()->id() ?? 1,
                ]);

                $createdDocuments++;

                // Create Tangki Details
                foreach ($groupData['details'] as $index => $detail) {
                    Tangki::create([
                        'document_id' => $document->id,
                        'no_tangki' => $detail['no_tangki'] ?? ('TANGKI-' . ($index + 1)),
                        'seri_out' => (isset($detail['seri_out']) && is_numeric($detail['seri_out'])) ? (int)$detail['seri_out'] : null,
                        'no_bl_awb' => $detail['no_bl_awb'] ?? '-',
                        'tgl_bl_awb' => $detail['tgl_bl_awb'] ?? null,
                        'id_consignee' => $detail['id_consignee'] ?? null,
                        'consignee' => $detail['consignee'] ?? null,
                        'no_bc11' => $detail['no_bc11'] ?? '-',
                        'tgl_bc11' => $detail['tgl_bc11'] ?? null,
                        'no_pos_bc11' => $detail['no_pos_bc11'] ?? null,
                        'jml_satuan' => $detail['jml_satuan'] ?? 0,
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
                        'jumlah_isi' => $detail['jumlah_isi'] ?? 0,
                        'satuan' => $detail['satuan'] ?? 'KGM',
                        'urutan' => $index + 1,
                    ]);
                    $createdTangki++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Berhasil mengimpor {$createdDocuments} Dokumen Master dan {$createdTangki} Detail Tangki Pengeluaran.",
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Import Pengeluaran Confirm Error: " . $e->getMessage());
            return response()->json(['error' => 'Gagal menyimpan data import: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Destroy a Pengeluaran document
     */
    public function destroy(Document $document)
    {
        if ($document->kd_dok !== '3') {
            return back()->with('error', 'Dokumen bukan merupakan Dokumen Pengeluaran.');
        }

        $document->delete();

        return redirect()->route('pengeluaran.index')->with('success', 'Dokumen Pengeluaran berhasil dihapus.');
    }

    /**
     * Convert any value (string, int, float, array, object) safely to string.
     */
    private function toStr($value): string
    {
        if ($value === null) {
            return '';
        }
        if ($value instanceof Collection) {
            $value = $value->toArray();
        }
        if (is_array($value)) {
            $flat = [];
            array_walk_recursive($value, function ($v) use (&$flat) {
                if ($v !== null && !is_array($v)) {
                    if (is_object($v)) {
                        if (method_exists($v, '__toString')) {
                            $flat[] = (string)$v;
                        }
                    } else {
                        $flat[] = (string)$v;
                    }
                }
            });
            return trim(implode(' ', $flat));
        }
        if (is_object($value)) {
            return method_exists($value, '__toString') ? (string)$value : '';
        }
        if (is_resource($value)) {
            return '';
        }
        return trim((string)$value);
    }

    /**
     * Convert value safely to float.
     */
    private function toFloat($val): float
    {
        $str = $this->toStr($val);
        $clean = preg_replace('/[^0-9\.]/', '', str_replace(',', '.', $str));
        return is_numeric($clean) ? (float)$clean : 0.0;
    }

    /**
     * Helper to parse Excel dates
     */
    private function parseDate($value)
    {
        $str = $this->toStr($value);
        if (empty($str) || $str === '-') return null;
        try {
            if (is_numeric($str)) {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$str))->toDateString();
            }
            return Carbon::parse($str)->toDateString();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Helper to parse Excel datetime
     */
    private function parseDateTime($value)
    {
        $str = $this->toStr($value);
        if (empty($str) || $str === '-') return null;
        try {
            if (is_numeric($str)) {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float)$str))->toDateTimeString();
            }
            return Carbon::parse($str)->toDateTimeString();
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Helper to retrieve row value by checking key variations and fallback index
     */
    private function getRowValue($row, array $possibleKeys, ?int $positionIndex = null, $default = null)
    {
        if ($row instanceof Collection) {
            $row = $row->toArray();
        }
        if (!is_array($row)) {
            return $default;
        }

        foreach ($possibleKeys as $key) {
            $target = strtoupper(preg_replace('/[^A-Z0-9]/', '', $this->toStr($key)));
            foreach ($row as $rowKey => $val) {
                if (is_numeric($rowKey) && !is_numeric($target)) {
                    continue;
                }
                $currentKey = strtoupper(preg_replace('/[^A-Z0-9]/', '', $this->toStr($rowKey)));
                if ($currentKey === $target) {
                    $strVal = $this->toStr($val);
                    if ($strVal !== '') {
                        return $strVal;
                    }
                }
            }
        }

        if ($positionIndex !== null) {
            if (array_key_exists($positionIndex, $row)) {
                $strVal = $this->toStr($row[$positionIndex]);
                if ($strVal !== '') {
                    return $strVal;
                }
            }
        }

        return $default;
    }
}
