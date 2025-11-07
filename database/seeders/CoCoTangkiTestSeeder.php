<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Tangki;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoCoTangkiTestSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // Get or create reference data first
            $nmAngkut = \App\Models\NmAngkut::firstOrCreate(['nm_angkut' => 'PT. Bulk Carrier Indonesia']);
            $kdDok = \App\Models\KdDok::firstOrCreate(['kd_dok' => '23'], ['nm_dok' => 'BC 2.3']);
            $kdTps = \App\Models\KdTps::firstOrCreate(['kd_tps' => 'TPSP01'], ['nm_tps' => 'TPS Petikemas Tanjung Perak']);
            $kdGudang = \App\Models\KdGudang::firstOrCreate(['kd_gudang' => 'TPS01'], [
                'nm_gudang' => 'TPS Tanjung Perak',
                'kd_tps' => 'TPSP01',
            ]);
            $user = \App\Models\User::first();

            // Create test document
            $document = Document::create([
                'ref_number' => 'COC0012024TEST001',
                'kd_dok' => '23',
                'kd_tps' => 'TPSP01',
                'nm_angkut_id' => $nmAngkut->id,
                'kd_gudang' => 'TPS01',
                'no_pol' => 'BCI2024001',
                'tgl_entry' => '2024-01-15',
                'jam_entry' => '08:00:00',
                'tgl_gate_in' => '2024-01-15',
                'jam_gate_in' => '08:30:00',
                'status' => 'APPROVED',
                'created_by' => $user->id ?? 1,
            ]);

            // Create test tangki data
            for ($i = 1; $i <= 3; $i++) {
                Tangki::create([
                    'document_id' => $document->id,
                    'no_tangki' => 'TK'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'jenis_isi' => 'Minyak Kelapa Sawit',
                    'jenis_kemasan' => 'TANGKI',
                    'kapasitas' => 50000,
                    'jumlah_isi' => 48500 - ($i * 500),
                    'satuan' => 'LITER',
                    'panjang' => 15.5,
                    'lebar' => 8.2,
                    'tinggi' => 12.0,
                    'berat_kosong' => 2500,
                    'berat_isi' => 45000 - ($i * 400),
                    'kondisi' => 'BAIK',
                    'lokasi_penempatan' => 'Area Tangki Blok A-'.$i,
                    'urutan' => $i,

                    // CoCoTangki specific fields
                    'no_bl_awb' => 'SAWIT-BL-'.date('Y').str_pad($i, 4, '0', STR_PAD_LEFT),
                    'tgl_bl_awb' => '2024-01-13',
                    'id_consignee' => 'CONS'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'consignee' => 'PT. Minyak Sawit Nusantara '.$i,
                    'no_bc11' => 'BC11-'.date('Y').'-'.str_pad($i, 6, '0', STR_PAD_LEFT),
                    'tgl_bc11' => '2024-01-13',
                    'no_pos_bc11' => str_pad($i, 3, '0', STR_PAD_LEFT),
                    'wk_inout' => '08:'.str_pad(15 + $i, 2, '0', STR_PAD_LEFT).':00',
                    'pel_muat' => 'IDMKS',
                    'pel_transit' => 'IDBLW',
                    'pel_bongkar' => 'IDTJP',
                ]);
            }

            // Create another document for testing bulk operations
            $nmAngkut2 = \App\Models\NmAngkut::firstOrCreate(['nm_angkut' => 'PT. Tanker Nusantara']);
            $kdTps2 = \App\Models\KdTps::firstOrCreate(['kd_tps' => 'TPSB01'], ['nm_tps' => 'TPS Berlian Tanjung Perak']);
            $kdGudang2 = \App\Models\KdGudang::firstOrCreate(['kd_gudang' => 'TPS02'], [
                'nm_gudang' => 'TPS Berlian',
                'kd_tps' => 'TPSB01',
            ]);

            $document2 = Document::create([
                'ref_number' => 'COC0022024TEST001',
                'kd_dok' => '23',
                'kd_tps' => 'TPSB01',
                'nm_angkut_id' => $nmAngkut2->id,
                'kd_gudang' => 'TPS02',
                'no_pol' => 'TN2024002',
                'tgl_entry' => '2024-01-16',
                'jam_entry' => '09:00:00',
                'tgl_gate_in' => '2024-01-16',
                'jam_gate_in' => '09:30:00',
                'status' => 'APPROVED',
                'created_by' => $user->id ?? 1,
            ]);

            // Create tangki for second document
            for ($i = 1; $i <= 2; $i++) {
                Tangki::create([
                    'document_id' => $document2->id,
                    'no_tangki' => 'TB'.str_pad($i, 3, '0', STR_PAD_LEFT),
                    'jenis_isi' => 'Minyak Kelapa Sawit Mentah',
                    'jenis_kemasan' => 'TANGKI',
                    'kapasitas' => 75000,
                    'jumlah_isi' => 72000 - ($i * 1000),
                    'satuan' => 'LITER',
                    'panjang' => 20.0,
                    'lebar' => 10.5,
                    'tinggi' => 15.0,
                    'berat_kosong' => 3500,
                    'berat_isi' => 65000 - ($i * 800),
                    'kondisi' => 'BAIK',
                    'lokasi_penempatan' => 'Area Tangki Blok B-'.$i,
                    'urutan' => $i,

                    // CoCoTangki specific fields
                    'no_bl_awb' => 'CPO-BL-'.date('Y').str_pad($i + 10, 4, '0', STR_PAD_LEFT),
                    'tgl_bl_awb' => '2024-01-14',
                    'id_consignee' => 'CONS'.str_pad($i + 10, 3, '0', STR_PAD_LEFT),
                    'consignee' => 'PT. Crude Palm Oil '.($i + 10),
                    'no_bc11' => 'BC11-'.date('Y').'-'.str_pad($i + 10, 6, '0', STR_PAD_LEFT),
                    'tgl_bc11' => '2024-01-14',
                    'no_pos_bc11' => str_pad($i + 10, 3, '0', STR_PAD_LEFT),
                    'wk_inout' => '09:'.str_pad(15 + $i, 2, '0', STR_PAD_LEFT).':00',
                    'pel_muat' => 'IDBLW',
                    'pel_bongkar' => 'IDTJP',
                ]);
            }

            DB::commit();

            $this->command->info('CoCoTangki test data created successfully!');
            $this->command->info('Documents created:');
            $this->command->info('- '.$document->ref_number.' (3 tangki)');
            $this->command->info('- '.$document2->ref_number.' (2 tangki)');

        } catch (\Exception $e) {
            DB::rollback();
            $this->command->error('Error creating test data: '.$e->getMessage());
            throw $e;
        }
    }
}
