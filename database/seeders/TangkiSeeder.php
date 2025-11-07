<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Tangki;
use Illuminate\Database\Seeder;

class TangkiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = Document::all();

        if ($documents->isEmpty()) {
            $this->command->warn('No documents found. Please run DocumentSeeder first.');

            return;
        }

        $this->command->info('Seeding tangki data...');

        $jenisIsi = ['Liquid', 'Gas', 'Chemical', 'Oil', 'Fuel'];
        $jenisKemasan = ['ISO Tank', 'Tank Container', 'Flexi Tank', 'Bulk Tank'];
        $kondisi = ['Baik', 'Rusak Ringan', 'Perlu Perbaikan'];
        $satuan = ['Liter', 'Kiloliter', 'Ton', 'M3'];
        $pelabuhan = ['IDCGK', 'IDTPP', 'IDSUB', 'IDSRG', 'IDBPN'];

        foreach ($documents as $index => $document) {
            // Setiap document memiliki 2-4 tangki
            $jumlahTangki = rand(2, 4);

            for ($i = 1; $i <= $jumlahTangki; $i++) {
                $kapasitas = rand(15000, 30000);
                $jumlahIsi = $kapasitas * (rand(70, 95) / 100); // 70-95% dari kapasitas
                $beratKosong = rand(2500, 4000);
                $beratIsi = $beratKosong + ($jumlahIsi * rand(8, 12) / 10); // Berat = kosong + isi

                Tangki::create([
                    'document_id' => $document->id,
                    'no_tangki' => 'TK'.str_pad($document->id, 3, '0', STR_PAD_LEFT).str_pad($i, 2, '0', STR_PAD_LEFT),
                    'no_bl_awb' => 'BL'.date('ymd').str_pad($document->id * 10 + $i, 5, '0', STR_PAD_LEFT),
                    'tgl_bl_awb' => now()->subDays(rand(5, 30)),
                    'id_consignee' => 'C'.str_pad($document->id, 6, '0', STR_PAD_LEFT),
                    'consignee' => 'PT. Consignee '.chr(65 + ($document->id % 26)),
                    'no_bc11' => date('ymd').str_pad($document->id * 100 + $i, 8, '0', STR_PAD_LEFT),
                    'tgl_bc11' => now()->subDays(rand(1, 15)),
                    'no_pos_bc11' => str_pad($i, 4, '0', STR_PAD_LEFT),
                    'jml_satuan' => 1,
                    'jns_satuan' => 'Unit',
                    'wk_inout' => now()->subDays(rand(1, 10))->format('Y-m-d\TH:i:s'),
                    'pel_muat' => $pelabuhan[array_rand($pelabuhan)],
                    'pel_transit' => rand(0, 1) ? $pelabuhan[array_rand($pelabuhan)] : null,
                    'pel_bongkar' => 'IDTPP', // Default pelabuhan bongkar
                    'jenis_isi' => $jenisIsi[array_rand($jenisIsi)],
                    'jenis_kemasan' => $jenisKemasan[array_rand($jenisKemasan)],
                    'kapasitas' => $kapasitas,
                    'jumlah_isi' => $jumlahIsi,
                    'satuan' => $satuan[array_rand($satuan)],
                    'panjang' => rand(600, 650) / 100, // 6.0-6.5 meter
                    'lebar' => rand(240, 250) / 100, // 2.4-2.5 meter
                    'tinggi' => rand(240, 260) / 100, // 2.4-2.6 meter
                    'berat_kosong' => $beratKosong,
                    'berat_isi' => $beratIsi,
                    'kondisi' => $kondisi[array_rand($kondisi)],
                    'keterangan' => 'Tangki '.$jenisIsi[array_rand($jenisIsi)].' dengan kondisi '.$kondisi[array_rand($kondisi)],
                    'tgl_produksi' => now()->subYears(rand(1, 5))->subMonths(rand(1, 11)),
                    'tgl_expired' => now()->addYears(rand(3, 7)),
                    'no_segel_bc' => 'BC'.strtoupper(substr(md5(uniqid()), 0, 10)),
                    'no_segel_perusahaan' => 'CP'.strtoupper(substr(md5(uniqid()), 0, 10)),
                    'lokasi_penempatan' => 'G'.chr(65 + rand(0, 5)).'-'.rand(1, 20),
                    'urutan' => $i,
                ]);
            }

            $this->command->info("Created {$jumlahTangki} tangki for document {$document->ref_number}");
        }

        $totalTangki = Tangki::count();
        $this->command->info("✓ Successfully created {$totalTangki} tangki records");
    }
}
