<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\XmlJsonGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ExportController extends Controller
{
    protected $xmlJsonService;

    public function __construct(XmlJsonGeneratorService $xmlJsonService)
    {
        $this->xmlJsonService = $xmlJsonService;
    }

    /**
     * Download document as XML
     */
    public function downloadXml(string $id)
    {
        try {
            $document = Document::findOrFail($id);

            // Authorization handled by role:admin middleware in routes

            $xml = $this->xmlJsonService->generateXML($document);
            $filename = 'document_'.$document->ref_number.'_'.now()->format('YmdHis').'.xml';

            return response($xml, 200, [
                'Content-Type' => 'application/xml',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);

        } catch (\Exception $e) {
            Log::error('XML Export Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error generating XML: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download document as JSON
     */
    public function downloadJson(string $id)
    {
        try {
            $document = Document::findOrFail($id);

            // Authorization handled by role:admin middleware in routes

            $json = $this->xmlJsonService->generateJSON($document);
            $filename = 'document_'.$document->ref_number.'_'.now()->format('YmdHis').'.json';

            return response($json, 200, [
                'Content-Type' => 'application/json',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);

        } catch (\Exception $e) {
            Log::error('JSON Export Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error generating JSON: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview XML in browser
     */
    public function previewXml(string $id)
    {
        try {
            $document = Document::findOrFail($id);

            $xml = $this->xmlJsonService->generateXML($document);

            return response($xml, 200, [
                'Content-Type' => 'application/xml; charset=utf-8',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating XML preview: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview JSON in browser
     */
    public function previewJson(string $id)
    {
        try {
            $document = Document::findOrFail($id);

            $json = $this->xmlJsonService->generateJSON($document);

            return response($json, 200, [
                'Content-Type' => 'application/json; charset=utf-8',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generating JSON preview: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Bulk export multiple documents
     */
    public function bulkExport(Request $request)
    {
        $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id',
            'format' => 'required|in:xml,json',
        ]);

        try {
            $documents = Document::whereIn('id', $request->document_ids)->get();

            if ($documents->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No documents found',
                ], 404);
            }

            $exportData = [];

            foreach ($documents as $document) {
                // Authorization handled by role:admin middleware in routes

                if ($request->format === 'xml') {
                    $exportData[$document->ref_number] = $this->xmlJsonService->generateXML($document);
                } else {
                    $exportData[$document->ref_number] = json_decode($this->xmlJsonService->generateJSON($document), true);
                }
            }

            if (empty($exportData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No documents available for export',
                ], 403);
            }

            $filename = 'bulk_export_'.now()->format('YmdHis');

            if ($request->format === 'json') {
                $content = json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                $mimeType = 'application/json';
                $filename .= '.json';
            } else {
                // For XML bulk export, create a container XML
                $dom = new \DOMDocument('1.0', 'UTF-8');
                $dom->formatOutput = true;
                $root = $dom->createElement('BulkExport');
                $dom->appendChild($root);

                foreach ($exportData as $refNumber => $xmlContent) {
                    $docElement = $dom->createElement('Document');
                    $docElement->setAttribute('ref_number', $refNumber);
                    // Parse and import the XML content
                    $tempDoc = new \DOMDocument;
                    $tempDoc->loadXML($xmlContent);
                    $importedNode = $dom->importNode($tempDoc->documentElement, true);
                    $docElement->appendChild($importedNode);
                    $root->appendChild($docElement);
                }

                $content = $dom->saveXML();
                $mimeType = 'application/xml';
                $filename .= '.xml';
            }

            return response($content, 200, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);

        } catch (\Exception $e) {
            Log::error('Bulk Export Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error during bulk export: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send document to host-to-host endpoint
     */
    public function sendToHost(string $id, Request $request)
    {
        try {
            $document = Document::findOrFail($id);

            // Check if document is approved
            if ($document->status !== 'APPROVED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only approved documents can be sent to host',
                ], 400);
            }

            if ($document->sent_to_host) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document already sent to host',
                ], 400);
            }

            // Get format from request (default: xml)
            $format = $request->input('format', 'xml');

            if (! in_array($format, ['xml', 'json'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid format. Allowed: xml, json',
                ], 400);
            }

            // Use new HostTransmissionService with retry
            $hostService = app(\App\Services\HostTransmission\HostTransmissionService::class);
            $retryHandler = app(\App\Services\HostTransmission\RetryHandler::class);

            Log::info('Sending to host', [
                'document_id' => $document->id,
                'ref_number' => $document->ref_number,
                'format' => $format,
            ]);

            // Send with automatic retry (3 attempts with exponential backoff)
            $result = $retryHandler->execute(
                callback: fn () => $hostService->send($document, $format),
                context: [
                    'document_id' => $document->id,
                    'ref_number' => $document->ref_number,
                    'format' => $format,
                ]
            );

            // Update document
            $document->update([
                'sent_to_host' => true,
                'sent_at' => now(),
                'host_response' => [
                    'transmission_format' => $result['format'],
                    'transmission_size' => $result['transmission_size'] ?? null,
                    'response_time' => $result['response_time'] ?? null,
                    'transmitter' => $result['transmitter'] ?? null,
                    'message' => $result['message'] ?? null,
                    'response_data' => $result['response_data'] ?? null,
                    'transmitted_at' => $result['transmitted_at'] ?? null,
                ],
                'updated_by' => auth()->id(),
            ]);

            Log::info('Successfully sent to host', [
                'document_id' => $document->id,
                'format' => $format,
                'response_time' => $result['response_time'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => $result['message'] ?? "Document sent to host successfully ({$format} format)",
                'format' => $result['format'],
                'transmitter' => $result['transmitter'] ?? null,
                'response_time' => $result['response_time'] ?? null,
                'transmission_size' => $result['transmission_size'] ?? null,
                'host_response' => $result['response_data'] ?? null,
            ]);

        } catch (\Exception $e) {
            Log::error('Send to Host Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error sending to host: '.$e->getMessage(),
            ], 500);
        }
    }
}
