<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SimpleCoCoTangkiSeeder extends Seeder
{
    public function run(): void
    {
        // Insert reference data directly with raw SQL to avoid model dependencies

        // Insert nm_angkut
        DB::table('nm_angkut')->insertOrIgnore([
            ['id' => 1, 'nm_angkut' => 'PT. Bulk Carrier Indonesia', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'nm_angkut' => 'PT. Tanker Nusantara', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert kd_dok
        DB::table('kd_dok')->insertOrIgnore([
            ['kd_dok' => '23', 'nm_dok' => 'BC 2.3', 'keterangan' => 'Dokumen BC 2.3', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert kd_tps
        DB::table('kd_tps')->insertOrIgnore([
            ['kd_tps' => 'TPSP01', 'nm_tps' => 'TPS Petikemas Tanjung Perak', 'alamat' => 'Surabaya', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['kd_tps' => 'TPSB01', 'nm_tps' => 'TPS Berlian Tanjung Perak', 'alamat' => 'Surabaya', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert kd_gudang
        DB::table('kd_gudang')->insertOrIgnore([
            ['kd_gudang' => 'TPS01', 'nm_gudang' => 'TPS Tanjung Perak', 'kd_tps' => 'TPSP01', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['kd_gudang' => 'TPS02', 'nm_gudang' => 'TPS Berlian', 'kd_tps' => 'TPSB01', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Insert users if not exists
        if (DB::table('users')->count() == 0) {
            DB::table('users')->insert([
                'name' => 'Admin Test',
                'email' => 'admin@test.com',
                'email_verified_at' => now(),
                'password' => bcrypt('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $userId = DB::table('users')->first()->id;

        // Insert documents
        $documentId1 = DB::table('documents')->insertGetId([
            'ref_number' => 'COC0012024TEST001',
            'kd_dok' => '23',
            'kd_tps' => 'TPSP01',
            'nm_angkut_id' => 1,
            'kd_gudang' => 'TPS01',
            'no_pol' => 'BCI2024001',
            'tgl_entry' => '2024-01-15',
            'jam_entry' => '08:00:00',
            'tgl_gate_in' => '2024-01-15',
            'jam_gate_in' => '08:30:00',
            'status' => 'APPROVED',
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $documentId2 = DB::table('documents')->insertGetId([
            'ref_number' => 'COC0022024TEST001',
            'kd_dok' => '23',
            'kd_tps' => 'TPSB01',
            'nm_angkut_id' => 2,
            'kd_gudang' => 'TPS02',
            'no_pol' => 'TN2024002',
            'tgl_entry' => '2024-01-16',
            'jam_entry' => '09:00:00',
            'tgl_gate_in' => '2024-01-16',
            'jam_gate_in' => '09:30:00',
            'status' => 'APPROVED',
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Insert tangki for document 1
        for ($i = 1; $i <= 3; $i++) {
            DB::table('tangki')->insert([
                'document_id' => $documentId1,
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
                'jml_satuan' => 45000 - ($i * 400),
                'jns_satuan' => 'KGM',
                'pel_muat' => 'IDMKS',
                'pel_transit' => 'IDBLW',
                'pel_bongkar' => 'IDTJP',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insert tangki for document 2
        for ($i = 1; $i <= 2; $i++) {
            DB::table('tangki')->insert([
                'document_id' => $documentId2,
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
                'jml_satuan' => 65000 - ($i * 800),
                'jns_satuan' => 'KGM',
                'pel_muat' => 'IDBLW',
                'pel_bongkar' => 'IDTJP',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('CoCoTangki test data created successfully!');
        $this->command->info('Created 2 documents with 5 total tangki');
    }
}
