<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Tangki;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TangkiController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:tangki.view')->only(['index', 'show', 'getByDocument']);
        $this->middleware('permission:tangki.create')->only(['store']);
        $this->middleware('permission:tangki.edit')->only(['update']);
        $this->middleware('permission:tangki.delete')->only(['destroy']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Tangki::with('document');

        // Filter by document_id if provided
        if ($request->document_id) {
            $query->where('document_id', $request->document_id);
        }

        // Search functionality
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_tangki', 'like', "%{$search}%")
                    ->orWhere('jenis_isi', 'like', "%{$search}%")
                    ->orWhere('no_bl_awb', 'like', "%{$search}%")
                    ->orWhere('consignee', 'like', "%{$search}%");
            });
        }

        $tangki = $query->orderBy('document_id')
            ->orderBy('urutan')
            ->paginate(15)
            ->withQueryString();

        return response()->json($tangki);
    }

    /**
     * Get all tangki for a specific document (untuk entry berulang).
     */
    public function getByDocument($documentId)
    {
        $document = Document::findOrFail($documentId);

        $tangki = Tangki::where('document_id', $documentId)
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'success' => true,
            'document' => $document,
            'tangki' => $tangki,
            'total' => $tangki->count(),
        ]);
    }

    /**
     * Store a newly created resource in storage (mendukung multiple entry).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_id' => ['required', 'exists:documents,id'],
            'no_tangki' => ['required', 'string', 'max:20'],
            'seri_out' => ['nullable', 'string', 'max:10'],
            'no_bl_awb' => ['nullable', 'string', 'max:50'],
            'tgl_bl_awb' => ['nullable', 'date'],
            'id_consignee' => ['nullable', 'string', 'max:20'],
            'consignee' => ['nullable', 'string', 'max:200'],
            'no_bc11' => ['nullable', 'string', 'max:50'],
            'tgl_bc11' => ['nullable', 'date'],
            'no_pos_bc11' => ['nullable', 'string', 'max:10'],
            'jml_satuan' => ['nullable', 'integer'],
            'jns_satuan' => ['nullable', 'string', 'max:10'],
            'kd_dok_inout' => ['nullable', 'string', 'max:10'],
            'no_dok_inout' => ['nullable', 'string', 'max:50'],
            'tgl_dok_inout' => ['nullable', 'date'],
            'kd_sar_angkut_inout' => ['nullable', 'string', 'max:10'],
            'no_pol' => ['nullable', 'string', 'max:20'],
            'jenis_isi' => ['required', 'string', 'max:50'],
            'jenis_kemasan' => ['nullable', 'string', 'max:30'],
            'kapasitas' => ['nullable', 'numeric', 'min:0'],
            'jumlah_isi' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:10'],
            'panjang' => ['nullable', 'numeric', 'min:0'],
            'lebar' => ['nullable', 'numeric', 'min:0'],
            'tinggi' => ['nullable', 'numeric', 'min:0'],
            'berat_kosong' => ['nullable', 'numeric', 'min:0'],
            'berat_isi' => ['nullable', 'numeric', 'min:0'],
            'kondisi' => ['nullable', 'string', 'max:20'],
            'keterangan' => ['nullable', 'string'],
            'tgl_produksi' => ['nullable', 'date'],
            'tgl_expired' => ['nullable', 'date'],
            'no_segel_bc' => ['nullable', 'string', 'max:50'],
            'no_segel_perusahaan' => ['nullable', 'string', 'max:50'],
            'lokasi_penempatan' => ['nullable', 'string', 'max:100'],
            'wk_inout' => ['nullable', 'string', 'max:50'],
            'pel_muat' => ['nullable', 'string', 'max:10'],
            'pel_transit' => ['nullable', 'string', 'max:10'],
            'pel_bongkar' => ['nullable', 'string', 'max:10'],
        ]);

        DB::beginTransaction();
        try {
            // Auto-increment urutan untuk document yang sama
            $maxUrutan = Tangki::where('document_id', $validated['document_id'])
                ->max('urutan') ?? 0;

            $validated['urutan'] = $maxUrutan + 1;

            $tangki = Tangki::create($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data tangki berhasil ditambahkan',
                'data' => $tangki->load('document'),
                'urutan' => $validated['urutan'],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan data tangki',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $tangki = Tangki::with('document')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $tangki,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $tangki = Tangki::findOrFail($id);

        $validated = $request->validate([
            'no_tangki' => ['required', 'string', 'max:20'],
            'seri_out' => ['nullable', 'string', 'max:10'],
            'no_bl_awb' => ['nullable', 'string', 'max:50'],
            'tgl_bl_awb' => ['nullable', 'date'],
            'id_consignee' => ['nullable', 'string', 'max:20'],
            'consignee' => ['nullable', 'string', 'max:200'],
            'no_bc11' => ['nullable', 'string', 'max:50'],
            'tgl_bc11' => ['nullable', 'date'],
            'no_pos_bc11' => ['nullable', 'string', 'max:10'],
            'jml_satuan' => ['nullable', 'integer'],
            'jns_satuan' => ['nullable', 'string', 'max:10'],
            'kd_dok_inout' => ['nullable', 'string', 'max:10'],
            'no_dok_inout' => ['nullable', 'string', 'max:50'],
            'tgl_dok_inout' => ['nullable', 'date'],
            'kd_sar_angkut_inout' => ['nullable', 'string', 'max:10'],
            'no_pol' => ['nullable', 'string', 'max:20'],
            'jenis_isi' => ['required', 'string', 'max:50'],
            'jenis_kemasan' => ['nullable', 'string', 'max:30'],
            'kapasitas' => ['nullable', 'numeric', 'min:0'],
            'jumlah_isi' => ['required', 'numeric', 'min:0'],
            'satuan' => ['required', 'string', 'max:10'],
            'panjang' => ['nullable', 'numeric', 'min:0'],
            'lebar' => ['nullable', 'numeric', 'min:0'],
            'tinggi' => ['nullable', 'numeric', 'min:0'],
            'berat_kosong' => ['nullable', 'numeric', 'min:0'],
            'berat_isi' => ['nullable', 'numeric', 'min:0'],
            'kondisi' => ['nullable', 'string', 'max:20'],
            'keterangan' => ['nullable', 'string'],
            'tgl_produksi' => ['nullable', 'date'],
            'tgl_expired' => ['nullable', 'date'],
            'no_segel_bc' => ['nullable', 'string', 'max:50'],
            'no_segel_perusahaan' => ['nullable', 'string', 'max:50'],
            'lokasi_penempatan' => ['nullable', 'string', 'max:100'],
            'wk_inout' => ['nullable', 'string', 'max:50'],
            'pel_muat' => ['nullable', 'string', 'max:10'],
            'pel_transit' => ['nullable', 'string', 'max:10'],
            'pel_bongkar' => ['nullable', 'string', 'max:10'],
        ]);

        $tangki->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data tangki berhasil diupdate',
            'data' => $tangki->fresh('document'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tangki = Tangki::findOrFail($id);
        $documentId = $tangki->document_id;
        $urutan = $tangki->urutan;

        DB::beginTransaction();
        try {
            $tangki->delete();

            // Re-order urutan untuk tangki yang tersisa
            Tangki::where('document_id', $documentId)
                ->where('urutan', '>', $urutan)
                ->decrement('urutan');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Data tangki berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data tangki',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
