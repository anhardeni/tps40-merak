<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\CoCoTangkiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CoCoTangkiController extends Controller
{
    protected $cocoTangkiService;

    public function __construct(CoCoTangkiService $cocoTangkiService)
    {
        $this->cocoTangkiService = $cocoTangkiService;
    }

    /**
     * Display CoCoTangki dashboard
     */
    public function index(Request $request)
    {
        $query = Document::with(['tangki', 'nmAngkut'])
            ->withCount('tangki')
            ->whereNotNull('status');

        // Filter berdasarkan status CoCoTangki
        if ($request->cocotangki_status) {
            if ($request->cocotangki_status === 'not_sent') {
                $query->whereNull('cocotangki_status');
            } else {
                $query->where('cocotangki_status', $request->cocotangki_status);
            }
        }

        // Search functionality
        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ref_number', 'like', "%{$search}%")
                    ->orWhere('kd_dok', 'like', "%{$search}%")
                    ->orWhere('nm_angkut', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $documents = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Statistics
        $stats = [
            'total_documents' => Document::whereNotNull('status')->count(),
            'not_sent' => Document::whereNull('cocotangki_status')->count(),
            'sent' => Document::where('cocotangki_status', 'sent')->count(),
            'error' => Document::where('cocotangki_status', 'error')->count(),
            'ready_to_send' => Document::whereNotNull('status')
                ->whereNull('cocotangki_status')
                ->whereHas('tangki')
                ->count(),
        ];

        return Inertia::render('CoCoTangki/Index', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'cocotangki_status']),
        ]);
    }

    /**
     * Show detail document untuk CoCoTangki
     */
    public function show(Document $document)
    {
        $document->load(['tangki', 'nmAngkut', 'kdTps', 'kdGudang']);

        // Get validation results
        $validation = $this->cocoTangkiService->validateCoCoTangkiData($document);

        // Get submission status
        $submissionStatus = $this->cocoTangkiService->getSubmissionStatus($document);

        return Inertia::render('CoCoTangki/Show', [
            'document' => $document,
            'validation' => $validation,
            'submission_status' => $submissionStatus,
        ]);
    }

    /**
     * Generate XML preview
     */
    public function generateXml(Document $document)
    {
        try {
            $validation = $this->cocoTangkiService->validateCoCoTangkiData($document);

            if (! $validation['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Data tidak valid',
                    'errors' => $validation['errors'],
                ], 400);
            }

            $xml = $this->cocoTangkiService->generateCoCoTangkiXML($document);

            return response()->json([
                'success' => true,
                'xml' => $xml,
                'ref_number' => $document->ref_number,
            ]);

        } catch (\Exception $e) {
            Log::error('CoCoTangki XML Generation Error', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal generate XML: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download XML file
     */
    public function download(Document $document)
    {
        try {
            $validation = $this->cocoTangkiService->validateCoCoTangkiData($document);

            if (! $validation['valid']) {
                return back()->with('error', 'Data tidak valid untuk di-download: '.implode(', ', $validation['errors']));
            }

            $xml = $this->cocoTangkiService->generateCoCoTangkiXML($document);
            $filename = 'cocotangki_'.$document->ref_number.'_'.now()->format('Ymd_His').'.xml';

            return response($xml)
                ->header('Content-Type', 'application/xml')
                ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');

        } catch (\Exception $e) {
            Log::error('CoCoTangki XML Download Error', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal download XML: '.$e->getMessage());
        }
    }

    /**
     * Kirim single document ke CoCoTangki
     */
    public function send(Document $document)
    {
        try {
            // Validate data first
            $validation = $this->cocoTangkiService->validateCoCoTangkiData($document);

            if (! $validation['valid']) {
                return back()->with('error', 'Data tidak valid: '.implode(', ', $validation['errors']));
            }

            // Send data
            $result = $this->cocoTangkiService->sendCoCoTangkiData($document);

            if ($result['success']) {
                return back()->with('success', $result['message']);
            } else {
                return back()->with('error', $result['message']);
            }

        } catch (\Exception $e) {
            Log::error('CoCoTangki Send Error', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Terjadi kesalahan: '.$e->getMessage());
        }
    }

    /**
     * Kirim multiple documents sekaligus
     */
    public function sendBulk(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array|min:1',
            'document_ids.*' => 'exists:documents,id',
        ]);

        try {
            $result = $this->cocoTangkiService->sendBulkCoCoTangkiData($request->document_ids);

            $message = sprintf(
                'Proses bulk selesai. Berhasil: %d, Gagal: %d dari total %d document',
                $result['success_count'],
                $result['error_count'],
                $result['total_processed']
            );

            if ($result['error_count'] > 0) {
                return back()->with('warning', $message);
            } else {
                return back()->with('success', $message);
            }

        } catch (\Exception $e) {
            Log::error('CoCoTangki Bulk Send Error', [
                'document_ids' => $request->document_ids,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Terjadi kesalahan: '.$e->getMessage());
        }
    }

    /**
     * Validate document data
     */
    public function validate(Document $document)
    {
        try {
            $validation = $this->cocoTangkiService->validateCoCoTangkiData($document);

            return response()->json([
                'success' => true,
                'validation' => $validation,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get submission status
     */
    public function status(Document $document)
    {
        try {
            $status = $this->cocoTangkiService->getSubmissionStatus($document);

            return response()->json([
                'success' => true,
                'status' => $status,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Status check error: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retry failed submissions
     */
    public function retry(Document $document)
    {
        try {
            // Reset error status
            $document->update([
                'cocotangki_status' => null,
                'cocotangki_error' => null,
            ]);

            // Attempt to send again
            return $this->send($document);

        } catch (\Exception $e) {
            Log::error('CoCoTangki Retry Error', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Gagal retry pengiriman: '.$e->getMessage());
        }
    }
}
