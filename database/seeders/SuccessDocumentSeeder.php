<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SuccessDocumentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get or Create NmAngkut
        $nmAngkutId = DB::table('nm_angkut')->where('nm_angkut', 'MV. EVER GIVEN')->value('id');
        if (!$nmAngkutId) {
            $nmAngkutId = DB::table('nm_angkut')->insertGetId([
                'nm_angkut' => 'MV. EVER GIVEN',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Clear old data with same ref_number
        DB::table('documents')->where('ref_number', 'TPSO251031000007')->delete();

        // 3. Create Document (Adding required tgl_entry, jam_entry, created_by)
        $documentId = DB::table('documents')->insertGetId([
            'ref_number' => 'TPSO251031000007',
            'kd_dok' => '1',
            'kd_tps' => 'TPSL',
            'nm_angkut_id' => $nmAngkutId,
            'no_voy_flight' => 'VOY-005',
            'tgl_entry' => '2025-10-21',
            'jam_entry' => '16:38:56',
            'tgl_tiba' => '2025-10-21',
            'kd_gudang' => 'TANK',
            'status' => 'SUBMITTED',
            'username' => 'admin',
            'created_by' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Create Tangki Details (Adding required jenis_isi)
        $details = [
            [
                'no_bl_awb' => 'BL25103100071',
                'tgl_bl_awb' => '2025-10-25',
                'id_consignee' => 'C000007',
                'consignee' => 'PT. Consignee H',
                'no_bc11' => '25103100000701',
                'tgl_bc11' => '2025-10-19',
                'no_pos_bc11' => '0001',
                'no_tangki' => 'TK00701',
                'jml_satuan' => 1.000,
                'jns_satuan' => 'Unit',
                'kd_dok_inout' => '1',
                'wk_inout' => '2025-10-23 16:38:56',
                'kd_sar_angkut_inout' => '3',
                'pel_muat' => 'IDSRG',
                'pel_transit' => 'IDBPN',
                'pel_bongkar' => 'IDTPP',
                'urutan' => 1,
                'jenis_isi' => 'LIQUID'
            ],
            [
                'no_bl_awb' => 'BL25103100072',
                'tgl_bl_awb' => '2025-10-15',
                'id_consignee' => 'C000007',
                'consignee' => 'PT. Consignee H',
                'no_bc11' => '25103100000702',
                'tgl_bc11' => '2025-10-29',
                'no_pos_bc11' => '0002',
                'no_tangki' => 'TK00702',
                'jml_satuan' => 1.000,
                'jns_satuan' => 'Unit',
                'kd_dok_inout' => '1',
                'wk_inout' => '2025-10-27 16:38:56',
                'kd_sar_angkut_inout' => '3',
                'pel_muat' => 'IDSUB',
                'pel_transit' => 'IDBPN',
                'pel_bongkar' => 'IDTPP',
                'urutan' => 2,
                'jenis_isi' => 'LIQUID'
            ],
            [
                'no_bl_awb' => 'BL25103100073',
                'tgl_bl_awb' => '2025-10-17',
                'id_consignee' => 'C000007',
                'consignee' => 'PT. Consignee H',
                'no_bc11' => '25103100000703',
                'tgl_bc11' => '2025-10-19',
                'no_pos_bc11' => '0003',
                'no_tangki' => 'TK00703',
                'jml_satuan' => 1.000,
                'jns_satuan' => 'Unit',
                'kd_dok_inout' => '1',
                'wk_inout' => '2025-10-26 16:38:56',
                'kd_sar_angkut_inout' => '3',
                'pel_muat' => 'IDTPP',
                'pel_transit' => 'IDSUB',
                'pel_bongkar' => 'IDTPP',
                'urutan' => 3,
                'jenis_isi' => 'LIQUID'
            ],
            [
                'no_bl_awb' => 'BL25103100074',
                'tgl_bl_awb' => '2025-10-22',
                'id_consignee' => 'C000007',
                'consignee' => 'PT. Consignee H',
                'no_bc11' => '25103100000704',
                'tgl_bc11' => '2025-10-21',
                'no_pos_bc11' => '0004',
                'no_tangki' => 'TK00704',
                'jml_satuan' => 1.000,
                'jns_satuan' => 'Unit',
                'kd_dok_inout' => '1',
                'wk_inout' => '2025-10-30 16:38:56',
                'kd_sar_angkut_inout' => '3',
                'pel_muat' => 'IDCGK',
                'pel_transit' => '',
                'pel_bongkar' => 'IDTPP',
                'urutan' => 4,
                'jenis_isi' => 'LIQUID'
            ],
        ];

        foreach ($details as $detail) {
            $detail['document_id'] = $documentId;
            $detail['created_at'] = now();
            $detail['updated_at'] = now();
            DB::table('tangki')->insert($detail);
        }

        echo "SuccessDocumentSeeder completed successfully (with all required fields).\n";
    }
}
