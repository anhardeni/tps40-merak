<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\SoapClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    protected $soapService;

    public function __construct(SoapClientService $soapService)
    {
        $this->soapService = $soapService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Document::with(['kdDok', 'kdTps', 'nmAngkut', 'kdGudang', 'tangki']);

            // Filtering
            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            if ($request->has('start_date') && $request->has('end_date')) {
                $query->byDateRange($request->start_date, $request->end_date);
            }

            if ($request->has('kd_tps')) {
                $query->where('kd_tps', $request->kd_tps);
            }

            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('ref_number', 'like', '%'.$request->search.'%')
                        ->orWhere('sppb_number', 'like', '%'.$request->search.'%');
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'tgl_entry');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $documents = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $documents,
                'message' => 'Documents retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving documents: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'kd_dok' => 'required|string|exists:kd_dok,kd_dok',
            'kd_tps' => 'required|string|exists:kd_tps,kd_tps',
            'nm_angkut_id' => 'required|exists:nm_angkut,id',
            'kd_gudang' => 'required|string|exists:kd_gudang,kd_gudang',
            'tgl_entry' => 'required|date',
            'jam_entry' => 'required|string|max:8',
            'tgl_gate_in' => 'nullable|date',
            'jam_gate_in' => 'nullable|string|max:8',
            'tgl_gate_out' => 'nullable|date',
            'jam_gate_out' => 'nullable|string|max:8',
            'keterangan' => 'nullable|string',

            // Tangki data
            'tangki' => 'required|array|min:1',
            'tangki.*.no_tangki' => 'required|string|max:20',
            'tangki.*.jenis_isi' => 'required|string|max:50',
            'tangki.*.jenis_kemasan' => 'nullable|string|max:30',
            'tangki.*.kapasitas' => 'required|numeric|min:0',
            'tangki.*.jumlah_isi' => 'required|numeric|min:0',
            'tangki.*.satuan' => 'required|string|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Create document
            $document = Document::create([
                'kd_dok' => $request->kd_dok,
                'kd_tps' => $request->kd_tps,
                'nm_angkut_id' => $request->nm_angkut_id,
                'kd_gudang' => $request->kd_gudang,
                'tgl_entry' => $request->tgl_entry,
                'jam_entry' => $request->jam_entry,
                'tgl_gate_in' => $request->tgl_gate_in,
                'jam_gate_in' => $request->jam_gate_in,
                'tgl_gate_out' => $request->tgl_gate_out,
                'jam_gate_out' => $request->jam_gate_out,
                'keterangan' => $request->keterangan,
                'status' => 'DRAFT',
                'created_by' => Auth::id(),
            ]);

            // Create tangki
            foreach ($request->tangki as $index => $tangkiData) {
                $document->tangki()->create([
                    'no_tangki' => $tangkiData['no_tangki'],
                    'jenis_isi' => $tangkiData['jenis_isi'],
                    'jenis_kemasan' => $tangkiData['jenis_kemasan'] ?? null,
                    'kapasitas' => $tangkiData['kapasitas'],
                    'jumlah_isi' => $tangkiData['jumlah_isi'],
                    'satuan' => $tangkiData['satuan'],
                    'panjang' => $tangkiData['panjang'] ?? null,
                    'lebar' => $tangkiData['lebar'] ?? null,
                    'tinggi' => $tangkiData['tinggi'] ?? null,
                    'berat_kosong' => $tangkiData['berat_kosong'] ?? null,
                    'berat_isi' => $tangkiData['berat_isi'] ?? null,
                    'kondisi' => $tangkiData['kondisi'] ?? 'BAIK',
                    'keterangan' => $tangkiData['keterangan'] ?? null,
                    'tgl_produksi' => $tangkiData['tgl_produksi'] ?? null,
                    'tgl_expired' => $tangkiData['tgl_expired'] ?? null,
                    'no_segel_bc' => $tangkiData['no_segel_bc'] ?? null,
                    'no_segel_perusahaan' => $tangkiData['no_segel_perusahaan'] ?? null,
                    'lokasi_penempatan' => $tangkiData['lokasi_penempatan'] ?? null,
                    'urutan' => $index + 1,
                ]);
            }

            DB::commit();

            $document->load(['kdDok', 'kdTps', 'nmAngkut', 'kdGudang', 'tangki']);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document created successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error creating document: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $document = Document::with([
                'kdDok', 'kdTps', 'nmAngkut', 'kdGudang',
                'tangki.tangkiReferences', 'createdBy', 'updatedBy',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Document not found',
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            // Check if document can be updated
            if ($document->status === 'APPROVED' && ! $request->user()->hasPermission('document.update.approved')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot update approved document',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'kd_dok' => 'required|string|exists:kd_dok,kd_dok',
                'kd_tps' => 'required|string|exists:kd_tps,kd_tps',
                'nm_angkut_id' => 'required|exists:nm_angkut,id',
                'kd_gudang' => 'required|string|exists:kd_gudang,kd_gudang',
                'tgl_entry' => 'required|date',
                'jam_entry' => 'required|string|max:8',
                'tgl_gate_in' => 'nullable|date',
                'jam_gate_in' => 'nullable|string|max:8',
                'tgl_gate_out' => 'nullable|date',
                'jam_gate_out' => 'nullable|string|max:8',
                'keterangan' => 'nullable|string',
                'tangki' => 'required|array|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();

            // Update document
            $document->update([
                'kd_dok' => $request->kd_dok,
                'kd_tps' => $request->kd_tps,
                'nm_angkut_id' => $request->nm_angkut_id,
                'kd_gudang' => $request->kd_gudang,
                'tgl_entry' => $request->tgl_entry,
                'jam_entry' => $request->jam_entry,
                'tgl_gate_in' => $request->tgl_gate_in,
                'jam_gate_in' => $request->jam_gate_in,
                'tgl_gate_out' => $request->tgl_gate_out,
                'jam_gate_out' => $request->jam_gate_out,
                'keterangan' => $request->keterangan,
                'updated_by' => Auth::id(),
            ]);

            // Update tangki - delete existing and recreate
            $document->tangki()->delete();
            foreach ($request->tangki as $index => $tangkiData) {
                $document->tangki()->create([
                    'no_tangki' => $tangkiData['no_tangki'],
                    'jenis_isi' => $tangkiData['jenis_isi'],
                    'jenis_kemasan' => $tangkiData['jenis_kemasan'] ?? null,
                    'kapasitas' => $tangkiData['kapasitas'],
                    'jumlah_isi' => $tangkiData['jumlah_isi'],
                    'satuan' => $tangkiData['satuan'],
                    'urutan' => $index + 1,
                ]);
            }

            DB::commit();

            $document->load(['kdDok', 'kdTps', 'nmAngkut', 'kdGudang', 'tangki']);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document updated successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error updating document: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            // Check if document can be deleted
            if ($document->status === 'APPROVED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete approved document',
                ], 403);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting document: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Submit document for approval
     */
    public function submit(string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            if ($document->status !== 'DRAFT') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft documents can be submitted',
                ], 400);
            }

            $document->update([
                'status' => 'SUBMITTED',
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document submitted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting document: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve document
     */
    public function approve(string $id): JsonResponse
    {
        try {
            $document = Document::findOrFail($id);

            if ($document->status !== 'SUBMITTED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only submitted documents can be approved',
                ], 400);
            }

            $document->update([
                'status' => 'APPROVED',
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $document,
                'message' => 'Document approved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error approving document: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check SPPB data
     */
    public function checkSppb(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sppb_number' => 'required|string',
            'tgl_sppb' => 'nullable|string', // format dd-mm-yyyy for TPB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $document = Document::findOrFail($id);

            // Choose which SOAP method to use
            if ($request->has('tgl_sppb') && ! empty($request->tgl_sppb)) {
                $result = $this->soapService->cekDataSPPBTPB(
                    $request->sppb_number,
                    $request->tgl_sppb,
                    $document->id
                );
            } else {
                $result = $this->soapService->cekDataSPPB(
                    $request->sppb_number,
                    $document->id
                );
            }

            // Update document with SPPB data
            if ($result['success']) {
                $document->update([
                    'sppb_number' => $request->sppb_number,
                    'sppb_data' => $result['data'],
                    'sppb_checked_at' => now(),
                    'updated_by' => Auth::id(),
                ]);
            }

            return response()->json([
                'success' => $result['success'],
                'data' => $result['data'] ?? null,
                'message' => $result['success'] ? 'SPPB data retrieved successfully' : 'Failed to retrieve SPPB data',
                'error' => $result['error'] ?? null,
                'document' => $document->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error checking SPPB: '.$e->getMessage(),
            ], 500);
        }
    }
}
