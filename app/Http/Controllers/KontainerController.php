<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKontainerRequest;
use App\Models\KontainerDocument;
use App\Models\KdDok;
use App\Models\KdGudang;
use App\Models\KdTps;
use App\Models\NmAngkut;
use App\Services\BeacukaiRestService;
use App\Imports\KontainerImport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KontainerController extends Controller
{
    /**
     * Display a listing of the containers.
     */
    public function index(Request $request)
    {
        $query = KontainerDocument::with(['kdTps', 'kdGudang'])
            ->withCount('kontainers');

        // Search & Filters
        if ($request->search) {
            $query->where('ref_number', 'like', "%{$request->search}%");
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $documents = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Kontainer/Index', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new container document.
     */
    public function create()
    {
        return Inertia::render('Kontainer/Create', [
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    /**
     * Store a newly created container document.
     */
    public function store(StoreKontainerRequest $request)
    {
        DB::beginTransaction();
        try {
            $headerData = $request->validated()['header'];
            
            // Ref number is auto-generated in the model boot method using kode_tps prefix
            $document = KontainerDocument::create([
                'kd_dok' => $headerData['kd_dok'],
                'kd_tps' => $headerData['kd_tps'],
                'kd_gudang' => $headerData['kd_gudang'],
                'tgl_tiba' => \Carbon\Carbon::createFromFormat('d-m-Y', $headerData['tgl_tiba']),
                'no_bc11' => $headerData['no_bc11'],
                'tgl_bc11' => \Carbon\Carbon::createFromFormat('d-m-Y', $headerData['tgl_bc11']),
                'keterangan' => $headerData['keterangan'] ?? null,
                'status' => 'DRAFT',
                'created_by' => auth()->id(),
            ]);

            foreach ($request->validated()['kontainer'] as $index => $kData) {
                $document->kontainers()->create(array_merge($kData, [
                    'tgl_bl_awb' => $kData['tgl_bl_awb'] ? \Carbon\Carbon::createFromFormat('d-m-Y', $kData['tgl_bl_awb']) : null,
                    'tgl_master_bl_awb' => $kData['tgl_master_bl_awb'] ? \Carbon\Carbon::createFromFormat('d-m-Y', $kData['tgl_master_bl_awb']) : null,
                    'wk_inout' => \Carbon\Carbon::createFromFormat('d-m-Y H:i:s', $kData['wk_inout']),
                    'tgl_daftar_pabean' => isset($kData['tgl_daftar_pabean']) ? \Carbon\Carbon::createFromFormat('d-m-Y', $kData['tgl_daftar_pabean']) : null,
                    'tgl_segel_bc' => isset($kData['tgl_segel_bc']) ? \Carbon\Carbon::createFromFormat('d-m-Y', $kData['tgl_segel_bc']) : null,
                    'tgl_ijin_tps' => isset($kData['tgl_ijin_tps']) ? \Carbon\Carbon::createFromFormat('d-m-Y', $kData['tgl_ijin_tps']) : null,
                    'urutan' => $index + 1,
                ]));
            }

            DB::commit();
            return redirect()->route('kontainer.show', $document)->with('success', 'Draft kontainer berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified container document.
     */
    public function show(KontainerDocument $document)
    {
        $document->load(['kontainers', 'kdTps', 'kdGudang']);
        return Inertia::render('Kontainer/Show', [
            'document' => $document,
        ]);
    }

    /**
     * Submit to Beacukai via REST API
     */
    public function submit(KontainerDocument $document, BeacukaiRestService $restService)
    {
        if ($document->status === 'SUCCESS') {
            return back()->with('error', 'Dokumen sudah berhasil terkirim.');
        }

        $result = $restService->submitKontainer($document);

        if ($result['success']) {
            return back()->with('success', 'Data berhasil diterima oleh Beacukai.');
        }

        return back()->with('error', 'Ditolak Beacukai: ' . $result['message']);
    }

    /**
     * Import container data from Excel
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $import = new KontainerImport();
            $data = Excel::toCollection($import, $request->file('file'));
            
            if ($data->isEmpty()) {
                return response()->json(['error' => 'File Excel kosong atau format tidak sesuai'], 422);
            }

            $rows = collect();
            foreach ($data as $sheet) {
                if ($sheet instanceof Collection) {
                    $rows = $rows->concat($sheet);
                }
            }

            if ($rows->isEmpty()) {
                return response()->json(['error' => 'File Excel kosong atau format tidak sesuai'], 422);
            }

            return response()->json([
                'success' => true,
                'data' => $rows
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal membaca file: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get reference data for the form
     */
    protected function getReferenceData()
    {
        return [
            'kdTps' => KdTps::select('kd_tps', 'nm_tps')->get(),
            'kdGudang' => KdGudang::select('kd_gudang', 'nm_gudang', 'kd_tps')->get(),
            'kdDok' => KdDok::where('kd_dok', '1')->select('kd_dok', 'nm_dok')->get(),
            'nmAngkut' => NmAngkut::select('id', 'nm_angkut')->get(),
        ];
    }
}
