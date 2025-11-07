<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\KdDok;
use App\Models\KdGudang;
use App\Models\KdTps;
use App\Models\NmAngkut;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentController extends Controller
{
    // Middleware moved to routes or use PHP attributes
    // In Laravel 11+, use Route::middleware() or #[Middleware] attribute

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Document::with(['nmAngkut'])
            ->withCount('tangki');

        // Search functionality
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ref_number', 'like', "%{$search}%")
                    ->orWhere('kd_dok', 'like', "%{$search}%")
                    ->orWhere('kd_tps', 'like', "%{$search}%")
                    ->orWhere('no_voy_flight', 'like', "%{$search}%")
                    ->orWhereHas('nmAngkut', function ($q) use ($search) {
                        $q->where('nm_angkut', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Date filter
        if ($request->date_from) {
            $query->whereDate('tgl_entry', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('tgl_entry', '<=', $request->date_to);
        }

        $documents = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Documents/Index', [
            'documents' => [
                'data' => $documents->items(),
                'meta' => [
                    'current_page' => $documents->currentPage(),
                    'from' => $documents->firstItem(),
                    'last_page' => $documents->lastPage(),
                    'per_page' => $documents->perPage(),
                    'to' => $documents->lastItem(),
                    'total' => $documents->total(),
                ],
                'links' => [
                    'first' => $documents->url(1),
                    'last' => $documents->url($documents->lastPage()),
                    'prev' => $documents->previousPageUrl(),
                    'next' => $documents->nextPageUrl(),
                ],
            ],
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Documents/Create', [
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kd_dok' => ['required', 'string', 'exists:kd_dok,kd_dok'],
            'kd_tps' => ['required', 'string', 'exists:kd_tps,kd_tps'],
            'nm_angkut_id' => ['required', 'integer', 'exists:nm_angkut,id'],
            'kd_gudang' => ['required', 'string', 'exists:kd_gudang,kd_gudang'],
            'no_voy_flight' => ['nullable', 'string', 'max:50'],
            'tgl_entry' => ['required', 'date'],
            'tgl_tiba' => ['nullable', 'date'],
            'jam_entry' => ['required', 'string'],
            'tgl_gate_in' => ['nullable', 'date'],
            'jam_gate_in' => ['nullable', 'string'],
            'tgl_gate_out' => ['nullable', 'date'],
            'jam_gate_out' => ['nullable', 'string'],
            'keterangan' => ['nullable', 'string'],
            'tangki' => ['required', 'array', 'min:1'],
            'tangki.*.kd_dok_inout' => ['required', 'string', 'exists:kd_dok_inout,kd_dok_inout'],
            'tangki.*.no_tangki' => ['required', 'string', 'max:50'],
            'tangki.*.seri_out' => ['nullable', 'integer', 'min:1'],
            'tangki.*.no_bl_awb' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_bl_awb' => ['nullable', 'date'],
            'tangki.*.id_consignee' => ['nullable', 'string', 'max:50'],
            'tangki.*.consignee' => ['nullable', 'string', 'max:200'],
            'tangki.*.no_bc11' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_bc11' => ['nullable', 'date'],
            'tangki.*.no_pos_bc11' => ['nullable', 'string', 'max:10'],
            'tangki.*.jenis_isi' => ['required', 'string', 'max:200'],
            'tangki.*.jenis_kemasan' => ['nullable', 'string', 'max:100'],
            'tangki.*.kapasitas' => ['required', 'numeric', 'min:0'],
            'tangki.*.jumlah_isi' => ['required', 'numeric', 'min:0'],
            'tangki.*.satuan' => ['required', 'string', 'max:10'],
            'tangki.*.panjang' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.lebar' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.tinggi' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.berat_kosong' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.berat_isi' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.kondisi' => ['required', 'string', 'in:BAIK,RUSAK,BOCOR'],
            'tangki.*.keterangan' => ['nullable', 'string'],
            'tangki.*.tgl_produksi' => ['nullable', 'date'],
            'tangki.*.tgl_expired' => ['nullable', 'date'],
            'tangki.*.no_segel_bc' => ['nullable', 'string', 'max:50'],
            'tangki.*.no_segel_perusahaan' => ['nullable', 'string', 'max:50'],
            'tangki.*.lokasi_penempatan' => ['nullable', 'string', 'max:100'],
            'tangki.*.wk_inout' => ['nullable', 'string', 'max:50'],
            'tangki.*.pel_muat' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_transit' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_bongkar' => ['nullable', 'string', 'max:10'],
        ]);

        DB::beginTransaction();
        try {
            // Create document
            $document = Document::create([
                'ref_number' => Document::generateRefNumber(),
                'kd_dok' => $validated['kd_dok'],
                'kd_tps' => $validated['kd_tps'],
                'nm_angkut_id' => $validated['nm_angkut_id'],
                'kd_gudang' => $validated['kd_gudang'],
                'no_voy_flight' => $validated['no_voy_flight'],
                'tgl_entry' => $validated['tgl_entry'],
                'tgl_tiba' => $validated['tgl_tiba'],
                'jam_entry' => $validated['jam_entry'],
                'tgl_gate_in' => $validated['tgl_gate_in'],
                'jam_gate_in' => $validated['jam_gate_in'],
                'tgl_gate_out' => $validated['tgl_gate_out'],
                'jam_gate_out' => $validated['jam_gate_out'],
                'keterangan' => $validated['keterangan'],
                'status' => 'DRAFT',
                'username' => auth()->user()->name ?? 'system',
            ]);

            // Create tangki with auto seri_out generation
            foreach ($validated['tangki'] as $tangkiData) {
                // Auto-generate seri_out if not provided
                if (! isset($tangkiData['seri_out'])) {
                    $maxSeri = $document->tangki()
                        ->where('no_tangki', $tangkiData['no_tangki'])
                        ->max('seri_out');
                    $tangkiData['seri_out'] = ($maxSeri ?? 0) + 1;
                }

                $document->tangki()->create($tangkiData);
            }

            DB::commit();

            return redirect()->route('documents.show', $document)
                ->with('success', 'Dokumen berhasil dibuat.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan dokumen: '.$e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        $document->load(['nmAngkut', 'tangki']);

        return Inertia::render('Documents/Show', [
            'document' => $document,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Document $document)
    {
        // Only allow editing if status is DRAFT
        if (strtoupper($document->status) !== 'DRAFT') {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen hanya dapat diedit jika statusnya masih Draft.');
        }

        $document->load(['nmAngkut', 'tangki']);

        return Inertia::render('Documents/Edit', [
            'document' => $document,
            'referenceData' => $this->getReferenceData(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document)
    {
        // Only allow updating if status is DRAFT
        if (strtoupper($document->status) !== 'DRAFT') {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen hanya dapat diupdate jika statusnya masih Draft.');
        }

        $validated = $request->validate([
            'kd_dok' => ['required', 'string', 'exists:kd_dok,kd_dok'],
            'kd_tps' => ['required', 'string', 'exists:kd_tps,kd_tps'],
            'nm_angkut_id' => ['required', 'integer', 'exists:nm_angkut,id'],
            'kd_gudang' => ['required', 'string', 'exists:kd_gudang,kd_gudang'],
            'no_voy_flight' => ['nullable', 'string', 'max:50'],
            'tgl_entry' => ['required', 'date'],
            'tgl_tiba' => ['nullable', 'date'],
            'jam_entry' => ['required', 'string'],
            'tgl_gate_in' => ['nullable', 'date'],
            'jam_gate_in' => ['nullable', 'string'],
            'tgl_gate_out' => ['nullable', 'date'],
            'jam_gate_out' => ['nullable', 'string'],
            'keterangan' => ['nullable', 'string'],
            'tangki' => ['required', 'array', 'min:1'],
            'tangki.*.kd_dok_inout' => ['required', 'string', 'exists:kd_dok_inout,kd_dok_inout'],
            'tangki.*.no_tangki' => ['required', 'string', 'max:50'],
            'tangki.*.seri_out' => ['nullable', 'integer', 'min:1'],
            'tangki.*.no_bl_awb' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_bl_awb' => ['nullable', 'date'],
            'tangki.*.id_consignee' => ['nullable', 'string', 'max:50'],
            'tangki.*.consignee' => ['nullable', 'string', 'max:200'],
            'tangki.*.no_bc11' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_bc11' => ['nullable', 'date'],
            'tangki.*.no_pos_bc11' => ['nullable', 'string', 'max:10'],
            'tangki.*.jenis_isi' => ['required', 'string', 'max:200'],
            'tangki.*.jenis_kemasan' => ['nullable', 'string', 'max:100'],
            'tangki.*.kapasitas' => ['required', 'numeric', 'min:0'],
            'tangki.*.jumlah_isi' => ['required', 'numeric', 'min:0'],
            'tangki.*.satuan' => ['required', 'string', 'max:10'],
            'tangki.*.panjang' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.lebar' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.tinggi' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.berat_kosong' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.berat_isi' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.kondisi' => ['required', 'string', 'in:BAIK,RUSAK,BOCOR'],
            'tangki.*.keterangan' => ['nullable', 'string'],
            'tangki.*.tgl_produksi' => ['nullable', 'date'],
            'tangki.*.tgl_expired' => ['nullable', 'date'],
            'tangki.*.no_segel_bc' => ['nullable', 'string', 'max:50'],
            'tangki.*.no_segel_perusahaan' => ['nullable', 'string', 'max:50'],
            'tangki.*.lokasi_penempatan' => ['nullable', 'string', 'max:100'],
            'tangki.*.wk_inout' => ['nullable', 'string', 'max:50'],
            'tangki.*.pel_muat' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_transit' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_bongkar' => ['nullable', 'string', 'max:10'],
        ]);

        DB::beginTransaction();
        try {
            // Update document
            $document->update([
                'kd_dok' => $validated['kd_dok'],
                'kd_tps' => $validated['kd_tps'],
                'nm_angkut_id' => $validated['nm_angkut_id'],
                'kd_gudang' => $validated['kd_gudang'],
                'no_voy_flight' => $validated['no_voy_flight'],
                'tgl_entry' => $validated['tgl_entry'],
                'tgl_tiba' => $validated['tgl_tiba'],
                'jam_entry' => $validated['jam_entry'],
                'tgl_gate_in' => $validated['tgl_gate_in'],
                'jam_gate_in' => $validated['jam_gate_in'],
                'tgl_gate_out' => $validated['tgl_gate_out'],
                'jam_gate_out' => $validated['jam_gate_out'],
                'keterangan' => $validated['keterangan'],
            ]);

            // Delete existing tangki and recreate with auto seri_out
            $document->tangki()->delete();
            foreach ($validated['tangki'] as $tangkiData) {
                // Auto-generate seri_out if not provided
                if (! isset($tangkiData['seri_out'])) {
                    $maxSeri = $document->tangki()
                        ->where('no_tangki', $tangkiData['no_tangki'])
                        ->max('seri_out');
                    $tangkiData['seri_out'] = ($maxSeri ?? 0) + 1;
                }

                $document->tangki()->create($tangkiData);
            }

            DB::commit();

            return redirect()->route('documents.show', $document)
                ->with('success', 'Dokumen berhasil diupdate.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Terjadi kesalahan saat mengupdate dokumen: '.$e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        // Only allow deleting if status is DRAFT
        if ($document->status !== 'DRAFT') {
            return redirect()->route('documents.index')
                ->with('error', 'Dokumen hanya dapat dihapus jika statusnya masih Draft.');
        }

        DB::beginTransaction();
        try {
            // Delete tangki first (due to foreign key constraint)
            $document->tangki()->delete();

            // Delete document
            $document->delete();

            DB::commit();

            return redirect()->route('documents.index')
                ->with('success', 'Dokumen berhasil dihapus.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menghapus dokumen: '.$e->getMessage()]);
        }
    }

    /**
     * Submit document for approval
     */
    public function submit(Document $document)
    {
        if ($document->status !== 'DRAFT') {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen hanya dapat disubmit jika statusnya masih Draft.');
        }

        // Validate that document has at least one tangki
        if ($document->tangki()->count() === 0) {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen harus memiliki minimal satu tangki untuk disubmit.');
        }

        $document->update([
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        return redirect()->route('documents.show', $document)
            ->with('success', 'Dokumen berhasil disubmit untuk persetujuan.');
    }

    /**
     * Get reference data for forms
     */
    private function getReferenceData()
    {
        return [
            'kdDok' => KdDok::select('kd_dok', 'nm_dok')->get(),
            'kdTps' => KdTps::select('kd_tps', 'nm_tps')->get(),
            'nmAngkut' => NmAngkut::select('id', 'nm_angkut', 'call_sign')->get(),
            'kdGudang' => KdGudang::select('kd_gudang', 'nm_gudang')->get(),
        ];
    }
}
