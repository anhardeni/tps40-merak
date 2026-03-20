<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class TangkiTemplateExport implements FromArray, WithHeadings, WithTitle, ShouldAutoSize
{
    public function array(): array
    {
        return [
            [
                'no_tangki' => 'TNK001',
                'kd_dok_inout' => '1',
                'jenis_isi' => 'CPO',
                'kapasitas' => 30000,
                'jumlah_isi' => 25000,
                'satuan' => 'LITER',
                'kondisi' => 'BAIK',
                'no_bl_awb' => 'BL12345',
                'tgl_bl_awb' => '2023-10-25',
                'id_consignee' => 'ID123',
                'consignee' => 'PT SAMPLE INDONESIA',
                'no_bc11' => 'BC11-001',
                'tgl_bc11' => '2023-10-25',
                'no_pos_bc11' => '001',
                'no_dok_inout' => 'DOK-001',
                'tgl_dok_inout' => '2023-10-25',
                'kd_sar_angkut_inout' => 'TRK',
                'no_pol' => 'B 1234 ABC',
                'jenis_kemasan' => 'DRUM',
                'jml_satuan' => 10,
                'jns_satuan' => 'UNT',
                'pel_muat' => 'IDJKT',
                'pel_transit' => 'SGSIN',
                'pel_bongkar' => 'IDSRG',
                'panjang' => 0,
                'lebar' => 0,
                'tinggi' => 0,
            ]
        ];
    }

    public function headings(): array
    {
        return [
            'no_tangki',
            'kd_dok_inout',
            'jenis_isi',
            'kapasitas',
            'jumlah_isi',
            'satuan',
            'kondisi',
            'no_bl_awb',
            'tgl_bl_awb',
            'id_consignee',
            'consignee',
            'no_bc11',
            'tgl_bc11',
            'no_pos_bc11',
            'no_dok_inout',
            'tgl_dok_inout',
            'kd_sar_angkut_inout',
            'no_pol',
            'jenis_kemasan',
            'jml_satuan',
            'jns_satuan',
            'pel_muat',
            'pel_transit',
            'pel_bongkar',
            'panjang',
            'lebar',
            'tinggi',
        ];
    }

    public function title(): string
    {
        return 'Template Tangki';
    }
}
