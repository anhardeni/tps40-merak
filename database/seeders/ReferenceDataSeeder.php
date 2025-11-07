<?php

namespace Database\Seeders;

use App\Models\KdDok;
use App\Models\KdDokInout;
use App\Models\KdGudang;
use App\Models\KdSarAngkutInout;
use App\Models\KdTps;
use App\Models\NmAngkut;
use Illuminate\Database\Seeder;

class ReferenceDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedKdTps();
        $this->seedKdDok();
        $this->seedKdDokInout();
        $this->seedKdGudang();
        $this->seedKdSarAngkutInout();
        $this->seedNmAngkut();
    }

    private function seedKdTps(): void
    {
        $data = [
            ['kd_tps' => 'TPSL', 'nm_tps' => 'TPS Laut', 'alamat' => '', 'kota' => '', 'is_active' => true],
            ['kd_tps' => 'TPSU', 'nm_tps' => 'TPS Udara', 'alamat' => '', 'kota' => '', 'is_active' => true],
            ['kd_tps' => 'TPSD', 'nm_tps' => 'TPS Darat', 'alamat' => '', 'kota' => '', 'is_active' => true],
            ['kd_tps' => 'TPSK', 'nm_tps' => 'TPS Khusus', 'alamat' => '', 'kota' => '', 'is_active' => true],
        ];

        foreach ($data as $item) {
            KdTps::firstOrCreate(['kd_tps' => $item['kd_tps']], $item);
        }
    }

    private function seedKdDok(): void
    {
        $data = [
            ['kd_dok' => '1', 'nm_dok' => 'BC 1.1', 'keterangan' => 'Pemberitahuan Pabean Impor', 'is_active' => true],
            ['kd_dok' => '2', 'nm_dok' => 'BC 1.2', 'keterangan' => 'Pemberitahuan Pabean Impor dengan nilai pabean > USD 5000', 'is_active' => true],
            ['kd_dok' => '3', 'nm_dok' => 'BC 2.0', 'keterangan' => 'Pemberitahuan Ekspor Barang', 'is_active' => true],
            ['kd_dok' => '4', 'nm_dok' => 'BC 2.3', 'keterangan' => 'Pemberitahuan Ekspor Barang Penimbunan', 'is_active' => true],
            ['kd_dok' => '5', 'nm_dok' => 'BC 4.0', 'keterangan' => 'Pemberitahuan Reekspor', 'is_active' => true],
            ['kd_dok' => '6', 'nm_dok' => 'BC 4.1', 'keterangan' => 'Pemberitahuan Reimpor', 'is_active' => true],
            ['kd_dok' => '7', 'nm_dok' => 'BC 2.5', 'keterangan' => 'Pemberitahuan Ekspor Barang Kembali', 'is_active' => true],
            ['kd_dok' => '8', 'nm_dok' => 'BC 3.0', 'keterangan' => 'Pemberitahuan Impor Barang Kembali', 'is_active' => true],
            ['kd_dok' => '9', 'nm_dok' => 'BC 3.3', 'keterangan' => 'Pemberitahuan Impor Barang yang Diekspor untuk Perbaikan', 'is_active' => true],
        ];

        foreach ($data as $item) {
            KdDok::firstOrCreate(['kd_dok' => $item['kd_dok']], $item);
        }
    }

    private function seedKdDokInout(): void
    {
        $data = [
            ['kd_dok_inout' => 'IN', 'nm_dok_inout' => 'Dokumen In', 'jenis' => 'IN', 'keterangan' => 'Dokumen masuk barang ke TPS', 'is_active' => true],
            ['kd_dok_inout' => 'OUT', 'nm_dok_inout' => 'Dokumen Out', 'jenis' => 'OUT', 'keterangan' => 'Dokumen keluar barang dari TPS', 'is_active' => true],
            ['kd_dok_inout' => 'SPPB', 'nm_dok_inout' => 'Surat Persetujuan Pengeluaran Barang', 'jenis' => 'OUT', 'keterangan' => 'SPPB dari Beacukai', 'is_active' => true],
            ['kd_dok_inout' => 'SPP', 'nm_dok_inout' => 'Surat Persetujuan Pemasukan', 'jenis' => 'IN', 'keterangan' => 'SPP dari Beacukai', 'is_active' => true],
        ];

        foreach ($data as $item) {
            KdDokInout::firstOrCreate(['kd_dok_inout' => $item['kd_dok_inout']], $item);
        }
    }

    private function seedKdGudang(): void
    {
        $data = [
            ['kd_gudang' => 'G001', 'nm_gudang' => 'Gudang 1', 'kd_tps' => 'TPSL', 'alamat' => 'Area 1', 'kapasitas' => 1000.00, 'is_active' => true],
            ['kd_gudang' => 'G002', 'nm_gudang' => 'Gudang 2', 'kd_tps' => 'TPSL', 'alamat' => 'Area 2', 'kapasitas' => 1500.00, 'is_active' => true],
            ['kd_gudang' => 'G003', 'nm_gudang' => 'Gudang 3', 'kd_tps' => 'TPSU', 'alamat' => 'Area 3', 'kapasitas' => 800.00, 'is_active' => true],
            ['kd_gudang' => 'G004', 'nm_gudang' => 'Gudang 4', 'kd_tps' => 'TPSU', 'alamat' => 'Area 4', 'kapasitas' => 1200.00, 'is_active' => true],
            ['kd_gudang' => 'G005', 'nm_gudang' => 'Gudang 5', 'kd_tps' => 'TPSD', 'alamat' => 'Area 5', 'kapasitas' => 2000.00, 'is_active' => true],
            ['kd_gudang' => 'TANK', 'nm_gudang' => 'Gudang Tangki', 'kd_tps' => 'TPSL', 'alamat' => 'Area Tangki', 'kapasitas' => 5000.00, 'is_active' => true],
        ];

        foreach ($data as $item) {
            KdGudang::firstOrCreate(['kd_gudang' => $item['kd_gudang']], $item);
        }
    }

    private function seedKdSarAngkutInout(): void
    {
        $data = [
            ['kd_sar_angkut_inout' => 'SEA', 'nm_sar_angkut_inout' => 'Angkutan Laut', 'jenis' => 'LAUT', 'keterangan' => 'Sarana angkutan laut (kapal)', 'is_active' => true],
            ['kd_sar_angkut_inout' => 'AIR', 'nm_sar_angkut_inout' => 'Angkutan Udara', 'jenis' => 'UDARA', 'keterangan' => 'Sarana angkutan udara (pesawat)', 'is_active' => true],
            ['kd_sar_angkut_inout' => 'LAND', 'nm_sar_angkut_inout' => 'Angkutan Darat', 'jenis' => 'DARAT', 'keterangan' => 'Sarana angkutan darat (truk, mobil)', 'is_active' => true],
            ['kd_sar_angkut_inout' => 'RAIL', 'nm_sar_angkut_inout' => 'Angkutan Kereta Api', 'jenis' => 'DARAT', 'keterangan' => 'Sarana angkutan kereta api', 'is_active' => true],
            ['kd_sar_angkut_inout' => 'PIPE', 'nm_sar_angkut_inout' => 'Angkutan Pipa', 'jenis' => 'KHUSUS', 'keterangan' => 'Sarana angkutan pipa untuk curah cair/gas', 'is_active' => true],
        ];

        foreach ($data as $item) {
            KdSarAngkutInout::firstOrCreate(['kd_sar_angkut_inout' => $item['kd_sar_angkut_inout']], $item);
        }
    }

    private function seedNmAngkut(): void
    {
        $data = [
            ['nm_angkut' => 'MV. EVER GIVEN', 'call_sign' => 'HSQT-EG', 'jenis_angkutan' => 'SEA', 'bendera' => 'Panama', 'is_active' => true],
            ['nm_angkut' => 'MV. MAERSK LINE', 'call_sign' => 'OWJA-ML', 'jenis_angkutan' => 'SEA', 'bendera' => 'Denmark', 'is_active' => true],
            ['nm_angkut' => 'MV. CMA CGM', 'call_sign' => 'FNUR-CC', 'jenis_angkutan' => 'SEA', 'bendera' => 'France', 'is_active' => true],
            ['nm_angkut' => 'MV. COSCO SHIPPING', 'call_sign' => 'BRQF-CS', 'jenis_angkutan' => 'SEA', 'bendera' => 'China', 'is_active' => true],
            ['nm_angkut' => 'GARUDA INDONESIA', 'call_sign' => 'GIA401', 'jenis_angkutan' => 'AIR', 'bendera' => 'Indonesia', 'is_active' => true],
            ['nm_angkut' => 'LION AIR CARGO', 'call_sign' => 'LNI610', 'jenis_angkutan' => 'AIR', 'bendera' => 'Indonesia', 'is_active' => true],
            ['nm_angkut' => 'CITILINK CARGO', 'call_sign' => 'CTV100', 'jenis_angkutan' => 'AIR', 'bendera' => 'Indonesia', 'is_active' => true],
            ['nm_angkut' => 'TRUCK CONTAINER', 'call_sign' => '', 'jenis_angkutan' => 'LAND', 'bendera' => 'Indonesia', 'is_active' => true],
            ['nm_angkut' => 'KERETA API BARANG', 'call_sign' => '', 'jenis_angkutan' => 'RAIL', 'bendera' => 'Indonesia', 'is_active' => true],
        ];

        foreach ($data as $item) {
            NmAngkut::firstOrCreate(['nm_angkut' => $item['nm_angkut']], $item);
        }
    }
}
