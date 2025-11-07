<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Tangki;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class XmlJsonGeneratorService
{
    /**
     * Generate XML from Document sesuai format cocotanki.xml
     */
    public function generateXML(Document $document): string
    {
        try {
            // Load semua relasi yang dibutuhkan
            $document->load([
                'kdDok', 'kdTps', 'nmAngkut', 'kdGudang',
                'tangki.tangkiReferences', 'createdBy',
            ]);

            $dom = new \DOMDocument('1.0', 'UTF-8');
            $dom->formatOutput = true;

            // Root element sesuai cocotanki.xsd
            $root = $dom->createElement('DOCUMENT');
            $root->setAttribute('xmlns', 'cocotangki.xsd');
            $dom->appendChild($root);

            // COCOTANGKI wrapper
            $cocotangki = $dom->createElement('COCOTANGKI');
            $root->appendChild($cocotangki);

            // HEADER
            $header = $dom->createElement('HEADER');
            $cocotangki->appendChild($header);

            $this->addElement($dom, $header, 'KD_DOK', $document->kd_dok);
            $this->addElement($dom, $header, 'KD_TPS', $document->kd_tps);
            $this->addElement($dom, $header, 'NM_ANGKUT', $document->nmAngkut->nm_angkut ?? '');
            $this->addElement($dom, $header, 'NO_VOY_FLIGHT', $document->no_voy_flight ?? '');
            $this->addElement($dom, $header, 'CALL_SIGN', $document->nmAngkut->call_sign ?? '');
            $this->addElement($dom, $header, 'TGL_TIBA', $document->tgl_tiba ? $document->tgl_tiba->format('Ymd') : '');
            $this->addElement($dom, $header, 'KD_GUDANG', $document->kd_gudang);
            $this->addElement($dom, $header, 'REF_NUMBER', $document->ref_number);

            // DETIL
            $detil = $dom->createElement('DETIL');
            $cocotangki->appendChild($detil);

            foreach ($document->tangki as $tangki) {
                $tangkiElement = $dom->createElement('TANGKI');
                $detil->appendChild($tangkiElement);

                $this->addElement($dom, $tangkiElement, 'SERI_OUT', (string) $tangki->urutan);
                $this->addElement($dom, $tangkiElement, 'NO_BL_AWB', $tangki->no_bl_awb ?? '');
                $this->addElement($dom, $tangkiElement, 'TGL_BL_AWB', $tangki->tgl_bl_awb ? $tangki->tgl_bl_awb->format('Ymd') : '');
                $this->addElement($dom, $tangkiElement, 'ID_CONSIGNEE', $tangki->id_consignee ?? '');
                $this->addElement($dom, $tangkiElement, 'CONSIGNEE', $tangki->consignee ?? '');
                $this->addElement($dom, $tangkiElement, 'NO_BC11', $tangki->no_bc11 ?? '');
                $this->addElement($dom, $tangkiElement, 'TGL_BC11', $tangki->tgl_bc11 ? $tangki->tgl_bc11->format('Ymd') : '');
                $this->addElement($dom, $tangkiElement, 'NO_POS_BC11', $tangki->no_pos_bc11 ?? '');
                $this->addElement($dom, $tangkiElement, 'NO_TANGKI', $tangki->no_tangki);
                $this->addElement($dom, $tangkiElement, 'JML_SATUAN', (string) $tangki->jumlah_isi);
                $this->addElement($dom, $tangkiElement, 'JNS_SATUAN', $tangki->satuan);

                // References untuk dokumen in/out
                $reference = $tangki->tangkiReferences->first();
                if ($reference) {
                    $this->addElement($dom, $tangkiElement, 'KD_DOK_INOUT', $reference->kd_dok_inout ?? '');
                    $this->addElement($dom, $tangkiElement, 'NO_DOK_INOUT', $reference->ref_number ?? '');
                    $this->addElement($dom, $tangkiElement, 'TGL_DOK_INOUT', $reference->ref_date ? $reference->ref_date->format('YmdH') : '');
                    $this->addElement($dom, $tangkiElement, 'KD_SAR_ANGKUT_INOUT', $reference->kd_sar_angkut_inout ?? '');
                } else {
                    $this->addElement($dom, $tangkiElement, 'KD_DOK_INOUT', '');
                    $this->addElement($dom, $tangkiElement, 'NO_DOK_INOUT', '');
                    $this->addElement($dom, $tangkiElement, 'TGL_DOK_INOUT', '');
                    $this->addElement($dom, $tangkiElement, 'KD_SAR_ANGKUT_INOUT', '');
                }

                $this->addElement($dom, $tangkiElement, 'WK_INOUT', $this->formatDateTime($tangki->wk_inout));
                $this->addElement($dom, $tangkiElement, 'NO_POL', $tangki->no_pol ?? '');
                $this->addElement($dom, $tangkiElement, 'PEL_MUAT', $tangki->pel_muat ?? '');
                $this->addElement($dom, $tangkiElement, 'PEL_TRANSIT', $tangki->pel_transit ?? '');
                $this->addElement($dom, $tangkiElement, 'PEL_BONGKAR', $tangki->pel_bongkar ?? '');
            }

            return $dom->saveXML();

        } catch (\Exception $e) {
            Log::error('XML Generation Error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate JSON from Document
     */
    public function generateJSON(Document $document): string
    {
        try {
            // Load semua relasi yang dibutuhkan
            $document->load([
                'kdDok', 'kdTps', 'nmAngkut', 'kdGudang',
                'tangki.tangkiReferences', 'createdBy',
            ]);

            $data = [
                'header' => [
                    'ref_number' => $document->ref_number,
                    'document' => [
                        'kd_dok' => $document->kd_dok,
                        'nm_dok' => $document->kdDok->nm_dok ?? '',
                    ],
                    'tps' => [
                        'kd_tps' => $document->kd_tps,
                        'nm_tps' => $document->kdTps->nm_tps ?? '',
                        'alamat' => $document->kdTps->alamat ?? '',
                    ],
                    'angkutan' => [
                        'nm_angkut' => $document->nmAngkut->nm_angkut ?? '',
                        'call_sign' => $document->nmAngkut->call_sign ?? '',
                        'jenis_angkutan' => $document->nmAngkut->jenis_angkutan ?? '',
                    ],
                    'gudang' => [
                        'kd_gudang' => $document->kd_gudang,
                        'nm_gudang' => $document->kdGudang->nm_gudang ?? '',
                    ],
                    'tanggal_waktu' => [
                        'tgl_entry' => $document->tgl_entry?->format('Y-m-d'),
                        'jam_entry' => $document->jam_entry,
                        'tgl_gate_in' => $document->tgl_gate_in?->format('Y-m-d'),
                        'jam_gate_in' => $document->jam_gate_in,
                        'tgl_gate_out' => $document->tgl_gate_out?->format('Y-m-d'),
                        'jam_gate_out' => $document->jam_gate_out,
                    ],
                    'status' => $document->status,
                    'keterangan' => $document->keterangan,
                ],
                'sppb' => null,
                'detail_tangki' => [],
                'metadata' => [
                    'generated_at' => now()->toISOString(),
                    'generated_by' => $document->createdBy->name ?? '',
                    'total_tangki' => $document->tangki->count(),
                ],
            ];

            // SPPB data if exists
            if ($document->sppb_number) {
                $data['sppb'] = [
                    'no_sppb' => $document->sppb_number,
                    'checked_at' => $document->sppb_checked_at?->toISOString(),
                    'data' => $document->sppb_data,
                ];
            }

            // Detail tangki
            foreach ($document->tangki as $tangki) {
                $tangkiData = [
                    'no_tangki' => $tangki->no_tangki,
                    'jenis_isi' => $tangki->jenis_isi,
                    'jenis_kemasan' => $tangki->jenis_kemasan,
                    'kapasitas' => (float) $tangki->kapasitas,
                    'jumlah_isi' => (float) $tangki->jumlah_isi,
                    'satuan' => $tangki->satuan,
                    'dimensi' => [
                        'panjang' => (float) $tangki->panjang,
                        'lebar' => (float) $tangki->lebar,
                        'tinggi' => (float) $tangki->tinggi,
                        'volume' => $tangki->volume,
                    ],
                    'berat' => [
                        'berat_kosong' => (float) $tangki->berat_kosong,
                        'berat_isi' => (float) $tangki->berat_isi,
                    ],
                    'kondisi' => $tangki->kondisi,
                    'tanggal' => [
                        'tgl_produksi' => $tangki->tgl_produksi?->format('Y-m-d'),
                        'tgl_expired' => $tangki->tgl_expired?->format('Y-m-d'),
                    ],
                    'segel' => [
                        'no_segel_bc' => $tangki->no_segel_bc,
                        'no_segel_perusahaan' => $tangki->no_segel_perusahaan,
                    ],
                    'lokasi_penempatan' => $tangki->lokasi_penempatan,
                    'urutan' => $tangki->urutan,
                    'persentase_isi' => $tangki->persentase_isi,
                    'references' => [],
                ];

                // References
                foreach ($tangki->tangkiReferences as $ref) {
                    $tangkiData['references'][] = [
                        'ref_type' => $ref->ref_type,
                        'ref_number' => $ref->ref_number,
                        'ref_date' => $ref->ref_date?->format('Y-m-d'),
                        'ref_pos' => $ref->ref_pos,
                        'jumlah_referensi' => (float) $ref->jumlah_referensi,
                        'satuan_referensi' => $ref->satuan_referensi,
                        'nilai_referensi' => (float) $ref->nilai_referensi,
                    ];
                }

                $data['detail_tangki'][] = $tangkiData;
            }

            return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('JSON Generation Error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Helper method to add XML element
     */
    private function addElement(\DOMDocument $dom, \DOMElement $parent, string $name, ?string $value): void
    {
        $element = $dom->createElement($name);
        if ($value !== null && $value !== '') {
            $element->appendChild($dom->createTextNode($value));
        }
        $parent->appendChild($element);
    }

    /**
     * Generate XML for host-to-host transmission
     */
    public function generateHostXML(Document $document): string
    {
        // Ini akan disesuaikan dengan format XML khusus untuk pengiriman host-to-host
        // Format mungkin berbeda dengan XML untuk download
        return $this->generateXML($document);
    }

    /**
     * Generate JSON for host-to-host transmission
     */
    public function generateHostJSON(Document $document): string
    {
        $document->load(['tangki', 'nmAngkut', 'kdTps', 'kdGudang', 'kdDok']);

        $data = [
            'document' => [
                'ref_number' => $document->ref_number,
                'kd_dok' => $document->kd_dok,
                'kd_tps' => $document->kd_tps,
                'kd_gudang' => $document->kd_gudang,
                'status' => $document->status,
                'tgl_entry' => $document->tgl_entry?->format('Y-m-d'),
                'tgl_tiba' => $document->tgl_tiba?->format('Y-m-d'),
                'jam_entry' => $document->jam_entry,
                'tgl_gate_in' => $document->tgl_gate_in?->format('Y-m-d'),
                'jam_gate_in' => $document->jam_gate_in,
                'tgl_gate_out' => $document->tgl_gate_out?->format('Y-m-d'),
                'jam_gate_out' => $document->jam_gate_out,
                'submitted_at' => $document->submitted_at?->toIso8601String(),
                'created_at' => $document->created_at->toIso8601String(),
                'updated_at' => $document->updated_at->toIso8601String(),
            ],
            'transport' => [
                'nm_angkut' => $document->nmAngkut?->nm_angkut,
                'no_voy_flight' => $document->no_voy_flight,
                'call_sign' => $document->call_sign,
            ],
            'sppb' => $document->sppb_number ? [
                'sppb_number' => $document->sppb_number,
                'sppb_data' => $document->sppb_data,
                'sppb_checked_at' => $document->sppb_checked_at?->toIso8601String(),
            ] : null,
            'host_transmission' => [
                'sent_to_host' => $document->sent_to_host,
                'sent_at' => $document->sent_at?->toIso8601String(),
                'format' => 'json',
                'version' => '1.0',
            ],
            'tangki' => $document->tangki->map(function ($tangki) {
                return [
                    'no_tangki' => $tangki->no_tangki,
                    'kap_tangki' => $tangki->kap_tangki,
                    'jns_isi' => $tangki->jns_isi,
                    'kd_tps' => $tangki->kd_tps,
                    'kode_kms' => $tangki->kode_kms,
                    'ur_brg' => $tangki->ur_brg,
                    'asal_brg' => $tangki->asal_brg,
                    'volume' => $tangki->volume,
                    'teus' => $tangki->teus,
                    'berat' => $tangki->berat,
                    'density' => $tangki->density,
                    'seri_in' => $tangki->seri_in,
                    'tgl_in' => $tangki->tgl_in,
                    'jam_in' => $tangki->jam_in,
                    'wk_inout' => $this->formatDateTime($tangki->wk_inout),
                    'seri_out' => $tangki->seri_out,
                    'tgl_out' => $tangki->tgl_out,
                    'jam_out' => $tangki->jam_out,
                    'no_bl_awb' => $tangki->no_bl_awb,
                    'tgl_bl_awb' => $tangki->tgl_bl_awb,
                    'no_master_bl_awb' => $tangki->no_master_bl_awb,
                    'tgl_master_bl_awb' => $tangki->tgl_master_bl_awb,
                    'consignee' => $tangki->consignee,
                    'pel_muat' => $tangki->pel_muat,
                    'tgl_muat' => $tangki->tgl_muat,
                ];
            })->toArray(),
            'metadata' => [
                'generated_at' => now()->toIso8601String(),
                'generated_by' => auth()->user()?->name ?? 'system',
                'application' => 'TPS Online',
                'version' => config('app.version', '1.0.0'),
            ],
        ];

        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Format datetime to YmdHis+offset format
     * Format: YYYYMMDDHHMMSStzhh (contoh: 2025102117113607 untuk 2025-10-21 17:11:36 +07:00)
     */
    private function formatDateTime($datetime): string
    {
        if (empty($datetime)) {
            return '';
        }

        try {
            // Parse datetime dan set timezone ke Asia/Jakarta
            $carbon = Carbon::parse($datetime)->setTimezone('Asia/Jakarta');
            // Format: YmdHis + offset (contoh: 20251021171136 + 07 = 2025102117113607)
            $offset = $carbon->offsetHours >= 0 ? sprintf('%02d', $carbon->offsetHours) : sprintf('%02d', abs($carbon->offsetHours));
            return $carbon->format('YmdHis').$offset;
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * Validate XML structure
     */
    public function validateXML(string $xml): array
    {
        try {
            $dom = new \DOMDocument;
            $dom->loadXML($xml);

            return [
                'valid' => true,
                'message' => 'XML structure is valid',
            ];
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'message' => 'Invalid XML: '.$e->getMessage(),
            ];
        }
    }
}
