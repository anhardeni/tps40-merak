<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\NmAngkut;
use App\Models\KdTps;
use App\Models\KdGudang;
use App\Models\KdDok;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DocumentDataSeeder extends Seeder
{
    public function run(): void
    {
        $nmAngkut = NmAngkut::where('nm_angkut', 'MV. EVER GIVEN')->first() ?: NmAngkut::first();
        $kdTps = KdTps::where('kd_tps', 'TPSL')->first() ?: KdTps::first();
        $kdGudang = KdGudang::where('kd_gudang', 'TANK')->first() ?: KdGudang::first();
        $kdIn = DB::table('kd_dok_inout')->where('kd_dok_inout', 'IN')->value('kd_dok_inout') ?: '1';
        $kdOut = DB::table('kd_dok_inout')->where('kd_dok_inout', 'OUT')->value('kd_dok_inout') ?: '2';
        
        $docs = [
            ['kd_dok' => '1', 'flow_code' => $kdIn],  // BC 1.1
            ['kd_dok' => '2', 'flow_code' => $kdIn],  // BC 1.2
            ['kd_dok' => '3', 'flow_code' => $kdOut], // BC 2.0
            ['kd_dok' => '4', 'flow_code' => $kdOut], // BC 2.3
            ['kd_dok' => '6', 'flow_code' => $kdIn],  // BC 4.1
        ];

        foreach ($docs as $index => $doc) {
            $document = Document::create([
                'kd_dok' => $doc['kd_dok'],
                'kd_tps' => $kdTps->kd_tps,
                'nm_angkut_id' => $nmAngkut->id,
                'kd_gudang' => $kdGudang->kd_gudang,
                'no_voy_flight' => 'VOY-00' . ($index + 1),
                'tgl_entry' => now()->subDays($index)->format('Y-m-d'),
                'jam_entry' => '10:00:00',
                'status' => 'DRAFT',
                'username' => 'admin',
                'created_by' => 1,
            ]);

            $document->tangki()->create([
                'no_tangki' => 'TNK-' . ($index + 100),
                'jenis_isi' => 'CPO (Crude Palm Oil)',
                'kapasitas' => 25000,
                'jumlah_isi' => 20000,
                'satuan' => 'LITER',
                'no_bl_awb' => 'BL-' . Str::random(8),
                'tgl_bl_awb' => now()->subDays(10)->format('Y-m-d'),
                'consignee' => 'PT. SAWIT MAJU BERSAMA',
                'kd_dok_inout' => $doc['flow_code'],
                'no_pol' => 'B ' . rand(1000, 9999) . ' ABC',
                'kd_sar_angkut_inout' => 'LAND',
                'kondisi' => 'BAIK',
                'urutan' => 1,
            ]);
        }
    }
}
