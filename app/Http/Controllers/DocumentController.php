<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\KdDok;
use App\Models\KdDokInout;
use App\Models\KdGudang;
use App\Models\KdTps;
use App\Models\NmAngkut;
use App\Models\ReferensiJenisSatuan;
use App\Models\ReferensiJenisKemasan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\TangkiImport;

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
            'kdDokInout' => \App\Models\KdDokInout::select('kd_dok_inout', 'nm_dok_inout', 'jenis')->where('is_active', true)->get(),
            'jenisSatuan' => ReferensiJenisSatuan::select('kode_satuan_barang', 'nama_satuan_barang')->get(),
            'jenisKemasan' => ReferensiJenisKemasan::select('kode_jenis_kemasan', 'nama_jenis_kemasan')->get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Document $document)
    {
        // Allow editing when the document is still a draft or when it's already submitted
        // (quick change to permit adding tangki and re-submitting). This relaxes the
        // previous restriction which allowed only DRAFT.
        if (! in_array(strtoupper($document->status), ['DRAFT', 'SUBMITTED'])) {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen hanya dapat diedit jika statusnya masih Draft atau Submitted.');
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
        // Allow updating if status is DRAFT or SUBMITTED (quick change to permit edits
        // after submission). In a stricter workflow you might prefer RETURNED/AMEND flow.
        if (! in_array(strtoupper($document->status), ['DRAFT', 'SUBMITTED'])) {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen hanya dapat diupdate jika statusnya masih Draft atau Submitted.');
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

        // Allow submit when document is DRAFT or already SUBMITTED (supports re-submit
        // after quick edits). Keep requirement that document must have at least one tangki.
        if (! in_array(strtoupper($document->status), ['DRAFT', 'SUBMITTED'])) {
            return redirect()->route('documents.show', $document)
                ->with('error', 'Dokumen hanya dapat disubmit jika statusnya masih Draft atau Submitted.');
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
     * Append one or more tangki to an existing document.
     * This endpoint is intended for a lightweight "add tangki" action (used by the
     * Documents show page modal) and therefore validates a subset of tangki fields.
     */
    public function appendTangki(Request $request, Document $document)
    {
        // Authorization: only owner (created_by) or admin role or users with permission 'documents.append' can append
        $user = auth()->user();
        if (! $user) {
            abort(403);
        }

        if (! (
            $user->id === $document->created_by
            || $user->hasRole('admin')
            || $user->hasPermission('documents.append')
        )) {
            abort(403, 'Anda tidak memiliki akses untuk menambah tangki pada dokumen ini.');
        }

        // Snapshot before
        $before = [
            'tangki_count' => $document->tangki()->count(),
            'tangki_ids' => $document->tangki()->pluck('id')->toArray(),
        ];

        // Stricter validation: require kd_dok_inout and proper exists checks
        $validated = $request->validate([
            'tangki' => ['required', 'array', 'min:1'],
            'tangki.*.no_tangki' => ['required', 'string', 'max:50'],
            'tangki.*.kd_dok_inout' => ['required', 'string', 'exists:kd_dok_inout,kd_dok_inout'],
            'tangki.*.jenis_isi' => ['required', 'string', 'max:200'],
            'tangki.*.kapasitas' => ['required', 'numeric', 'min:0'],
            'tangki.*.jumlah_isi' => ['required', 'numeric', 'min:0'],
            'tangki.*.satuan' => ['required', 'string', 'max:10'],
            'tangki.*.kondisi' => ['required', 'string', 'in:BAIK,RUSAK,BOCOR'],
            // other optional fields
            'tangki.*.seri_out' => ['nullable', 'integer', 'min:1'],
            'tangki.*.no_bl_awb' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_bl_awb' => ['nullable', 'date'],
            'tangki.*.id_consignee' => ['nullable', 'string', 'max:50'],
            'tangki.*.consignee' => ['nullable', 'string', 'max:200'],
            'tangki.*.no_bc11' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_bc11' => ['nullable', 'date'],
            'tangki.*.no_pos_bc11' => ['nullable', 'string', 'max:10'],
            'tangki.*.no_dok_inout' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_dok_inout' => ['nullable', 'date'],
            'tangki.*.kd_sar_angkut_inout' => ['nullable', 'string', 'max:10'],
            'tangki.*.no_pol' => ['nullable', 'string', 'max:20'],
            'tangki.*.jenis_kemasan' => ['nullable', 'string', 'max:100'],
            'tangki.*.jml_satuan' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.jns_satuan' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_muat' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_transit' => ['nullable', 'string', 'max:10'],
            'tangki.*.pel_bongkar' => ['nullable', 'string', 'max:10'],
            'tangki.*.panjang' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.lebar' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.tinggi' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.berat_kosong' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.berat_isi' => ['nullable', 'numeric', 'min:0'],
            'tangki.*.lokasi_penempatan' => ['nullable', 'string', 'max:100'],
            'tangki.*.wk_inout' => ['nullable', 'string', 'max:50'],
            'tangki.*.tgl_produksi' => ['nullable', 'date'],
            'tangki.*.tgl_expired' => ['nullable', 'date'],
            'tangki.*.no_segel_bc' => ['nullable', 'string', 'max:50'],
            'tangki.*.no_segel_perusahaan' => ['nullable', 'string', 'max:50'],
            'tangki.*.keterangan' => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        try {
            $createdTangkiIds = [];
            $createdTangkiRows = [];
            foreach ($validated['tangki'] as $tangkiData) {
                if (! isset($tangkiData['seri_out']) || empty($tangkiData['seri_out'])) {
                    $maxSeri = $document->tangki()
                        ->where('no_tangki', $tangkiData['no_tangki'])
                        ->max('seri_out');
                    $tangkiData['seri_out'] = ($maxSeri ?? 0) + 1;
                }

                $created = $document->tangki()->create($tangkiData);
                $createdTangkiIds[] = $created->id;
                $createdTangkiRows[] = $created->toArray();
            }

            DB::commit();

            // create audit entry
            \App\Models\DocumentAudit::create([
                'document_id' => $document->id,
                'user_id' => $user->id,
                'action' => 'append_tangki',
                'before' => $before,
                'after' => [
                    'added_ids' => $createdTangkiIds,
                    'added_rows' => $createdTangkiRows,
                ],
            ]);

            // update status to AMENDED so approver knows to re-check
            $document->update(['status' => 'AMENDED']);

            // notify approvers (users with role 'approver' or permission 'documents.approve' and admins)
            $approvers = \App\Models\User::whereHas('roles', function ($q) {
                $q->where('name', 'approver');
            })->get();

            $withPerm = \App\Models\User::whereHas('roles.permissions', function ($q) {
                $q->where('name', 'documents.approve');
            })->get();

            $admins = \App\Models\User::whereHas('roles', function ($q) {
                $q->where('name', 'admin');
            })->get();

            $notify = $approvers->merge($withPerm)->merge($admins)->unique('id');

            if ($notify->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send($notify, new \App\Notifications\DocumentAmended($document, $user));
            }

            return redirect()->route('documents.show', $document)
                ->with('success', 'Tangki berhasil ditambahkan dan dokumen diberi status AMENDED.');

        } catch (\Exception $e) {
            DB::rollback();

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menambah tangki: '.$e->getMessage()]);
        }
    }

    /**
     * Parse Excel file and return data for frontend form
     */
    public function parseTangkiExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $data = Excel::toArray(new TangkiImport, $request->file('file'));
            $rows = $data[0] ?? [];

            $mappedData = collect($rows)->map(function ($row) {
                // Map Excel columns to Tangki model fields
                // Assuming Excel headers are snake_case or close to it
                // You might need more robust mapping here depending on the Excel template
                return [
                    'no_tangki' => $row['no_tangki'] ?? $row['nomor_tangki'] ?? '',
                    'kd_dok_inout' => $row['kd_dok_inout'] ?? $row['kode_dok_inout'] ?? '',
                    'jenis_isi' => $row['jenis_isi'] ?? '',
                    'kapasitas' => $row['kapasitas'] ?? 0,
                    'jumlah_isi' => $row['jumlah_isi'] ?? 0,
                    'satuan' => $row['satuan'] ?? 'LITER',
                    'kondisi' => strtoupper($row['kondisi'] ?? 'BAIK'),
                    'no_bl_awb' => $row['no_bl_awb'] ?? '',
                    'tgl_bl_awb' => $this->transformDate($row['tgl_bl_awb'] ?? null),
                    'id_consignee' => $row['id_consignee'] ?? '',
                    'consignee' => $row['consignee'] ?? '',
                    'no_bc11' => $row['no_bc11'] ?? '',
                    'tgl_bc11' => $this->transformDate($row['tgl_bc11'] ?? null),
                    'no_pos_bc11' => $row['no_pos_bc11'] ?? '',
                    'no_dok_inout' => $row['no_dok_inout'] ?? '',
                    'tgl_dok_inout' => $this->transformDate($row['tgl_dok_inout'] ?? null),
                    'kd_sar_angkut_inout' => $row['kd_sar_angkut_inout'] ?? '',
                    'no_pol' => $row['no_pol'] ?? '',
                    'jenis_kemasan' => $row['jenis_kemasan'] ?? '',
                    'jml_satuan' => $row['jml_satuan'] ?? 0,
                    'jns_satuan' => $row['jns_satuan'] ?? '',
                    'pel_muat' => $row['pel_muat'] ?? '',
                    'pel_transit' => $row['pel_transit'] ?? '',
                    'pel_bongkar' => $row['pel_bongkar'] ?? '',
                    'panjang' => $row['panjang'] ?? 0,
                    'lebar' => $row['lebar'] ?? 0,
                    'tinggi' => $row['tinggi'] ?? 0,
                    'berat_kosong' => $row['berat_kosong'] ?? 0,
                    'berat_isi' => $row['berat_isi'] ?? 0,
                    'lokasi_penempatan' => $row['lokasi_penempatan'] ?? '',
                    'wk_inout' => $row['wk_inout'] ?? '', // datetime handling might be needed
                    'tgl_produksi' => $this->transformDate($row['tgl_produksi'] ?? null),
                    'tgl_expired' => $this->transformDate($row['tgl_expired'] ?? null),
                    'no_segel_bc' => $row['no_segel_bc'] ?? '',
                    'no_segel_perusahaan' => $row['no_segel_perusahaan'] ?? '',
                    'keterangan' => $row['keterangan'] ?? '',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $mappedData,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses file: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import Tangki from Excel and append to Document
     */
    public function importTangki(Request $request, Document $document)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        // Authorization check (same as appendTangki)
        $user = auth()->user();
        if (! $user || ! ($user->id === $document->created_by || $user->hasRole('admin') || $user->hasPermission('documents.append'))) {
            return back()->withErrors(['error' => 'Anda tidak memiliki akses untuk menambah tangki.']);
        }

        DB::beginTransaction();
        try {
            $data = Excel::toArray(new TangkiImport, $request->file('file'));
            $rows = $data[0] ?? [];
            $count = 0;

            foreach ($rows as $row) {
                $tangkiData = [
                    'no_tangki' => $row['no_tangki'] ?? $row['nomor_tangki'] ?? null,
                    'kd_dok_inout' => $row['kd_dok_inout'] ?? $row['kode_dok_inout'] ?? null,
                    'jenis_isi' => $row['jenis_isi'] ?? null,
                    'kapasitas' => $row['kapasitas'] ?? 0,
                    'jumlah_isi' => $row['jumlah_isi'] ?? 0,
                    'satuan' => $row['satuan'] ?? 'LITER',
                    'kondisi' => strtoupper($row['kondisi'] ?? 'BAIK'),
                    // ... map other fields similarly to parseTangkiExcel ...
                    'no_bl_awb' => $row['no_bl_awb'] ?? null,
                    'tgl_bl_awb' => $this->transformDate($row['tgl_bl_awb'] ?? null),
                    'id_consignee' => $row['id_consignee'] ?? null,
                    'consignee' => $row['consignee'] ?? null,
                    'no_bc11' => $row['no_bc11'] ?? null,
                    'tgl_bc11' => $this->transformDate($row['tgl_bc11'] ?? null),
                    'no_pos_bc11' => $row['no_pos_bc11'] ?? null,
                    'no_dok_inout' => $row['no_dok_inout'] ?? null,
                    'tgl_dok_inout' => $this->transformDate($row['tgl_dok_inout'] ?? null),
                    'kd_sar_angkut_inout' => $row['kd_sar_angkut_inout'] ?? null,
                    'no_pol' => $row['no_pol'] ?? null,
                    'jenis_kemasan' => $row['jenis_kemasan'] ?? null,
                    'jml_satuan' => $row['jml_satuan'] ?? 0,
                    'jns_satuan' => $row['jns_satuan'] ?? null,
                    'pel_muat' => $row['pel_muat'] ?? null,
                    'pel_transit' => $row['pel_transit'] ?? null,
                    'pel_bongkar' => $row['pel_bongkar'] ?? null,
                    'panjang' => $row['panjang'] ?? 0,
                    'lebar' => $row['lebar'] ?? 0,
                    'tinggi' => $row['tinggi'] ?? 0,
                    'berat_kosong' => $row['berat_kosong'] ?? 0,
                    'berat_isi' => $row['berat_isi'] ?? 0,
                    'lokasi_penempatan' => $row['lokasi_penempatan'] ?? null,
                    'wk_inout' => $row['wk_inout'] ?? null,
                    'tgl_produksi' => $this->transformDate($row['tgl_produksi'] ?? null),
                    'tgl_expired' => $this->transformDate($row['tgl_expired'] ?? null),
                    'no_segel_bc' => $row['no_segel_bc'] ?? null,
                    'no_segel_perusahaan' => $row['no_segel_perusahaan'] ?? null,
                    'keterangan' => $row['keterangan'] ?? null,
                ];

                // Basic validation: skip empty rows
                if (empty($tangkiData['no_tangki'])) continue;

                // Auto-generate seri_out
                $maxSeri = $document->tangki()
                    ->where('no_tangki', $tangkiData['no_tangki'])
                    ->max('seri_out');
                $tangkiData['seri_out'] = ($maxSeri ?? 0) + 1;

                $document->tangki()->create($tangkiData);
                $count++;
            }

            DB::commit();

            return back()->with('success', "Berhasil mengimport $count tangki.");

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal mengimport file: ' . $e->getMessage()]);
        }
    }

    private function transformDate($value)
    {
        if (! $value) return null;
        try {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
        } catch (\Exception $e) {
            // Fallback if it's already a string date
            return date('Y-m-d', strtotime($value));
        }
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
            // include kd_tps so frontend can filter gudang options by selected TPS
            'kdGudang' => KdGudang::select('kd_gudang', 'nm_gudang', 'kd_tps')->get(),
            'kdDokInout' => KdDokInout::select('kd_dok_inout', 'nm_dok_inout', 'jenis')->where('is_active', true)->get(),
            'jenisSatuan' => ReferensiJenisSatuan::select('kode_satuan_barang', 'nama_satuan_barang')->get(),
            'jenisKemasan' => ReferensiJenisKemasan::select('kode_jenis_kemasan', 'nama_jenis_kemasan')->get(),
        ];
    }
}
