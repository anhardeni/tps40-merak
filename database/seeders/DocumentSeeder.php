<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\NmAngkut;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating sample documents...');

        // Get users
        $admin = User::where('email', 'admin@tpsonline.test')->first();
        $operator = User::where('email', 'operator@tpsonline.test')->first();

        if (! $admin || ! $operator) {
            $this->command->error('Users not found! Please run UserSeeder first.');

            return;
        }

        // Get transport names
        $nmAngkuts = NmAngkut::all();

        if ($nmAngkuts->isEmpty()) {
            $this->command->error('Transport names not found! Please run ReferenceDataSeeder first.');

            return;
        }

        // Sample documents data
        $documents = [
            // BC 1.1 - Impor Umum (Status: Submitted & Sent)
            [
                'ref_number' => 'TPSO'.date('ymd').'000001',
                'kd_dok' => '1',
                'kd_tps' => 'TPSL',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'MV. EVER GIVEN')->first()->id,
                'kd_gudang' => 'G001',
                'no_pol' => null,
                'no_voy_flight' => 'VOY-001',
                'tgl_entry' => Carbon::today()->subDays(5),
                'tgl_tiba' => Carbon::today()->subDays(5),
                'jam_entry' => '08:30:00',
                'tgl_gate_in' => Carbon::today()->subDays(5),
                'jam_gate_in' => '09:00:00',
                'tgl_gate_out' => null,
                'jam_gate_out' => null,
                'status' => 'submitted',
                'username' => 'operator',
                'submitted_at' => Carbon::today()->subDays(5)->setTime(9, 30),
                'keterangan' => 'Impor barang elektronik dari China',
                'sppb_number' => 'SPPB-'.date('Ymd').'-001',
                'sppb_data' => [
                    'no_sppb' => 'SPPB-'.date('Ymd').'-001',
                    'tgl_sppb' => Carbon::today()->subDays(4)->format('Y-m-d'),
                    'npwp' => '01.234.567.8-901.000',
                    'nama_importir' => 'PT ELEKTRONIK SEJAHTERA',
                ],
                'sppb_checked_at' => Carbon::today()->subDays(4)->setTime(10, 0),
                'sent_to_host' => true,
                'sent_at' => Carbon::today()->subDays(4)->setTime(14, 30),
                'host_response' => [
                    'status' => 'OK',
                    'message' => 'Data berhasil dikirim',
                    'response_code' => '200',
                ],
                'created_by' => $operator->id,
                'updated_by' => $operator->id,
            ],

            // BC 1.2 - Impor dengan nilai > USD 5000 (Status: Draft)
            [
                'ref_number' => 'TPSO'.date('ymd').'000002',
                'kd_dok' => '2',
                'kd_tps' => 'TPSL',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'MV. MAERSK LINE')->first()->id,
                'kd_gudang' => 'G002',
                'no_pol' => null,
                'no_voy_flight' => 'VOY-002',
                'tgl_entry' => Carbon::today()->subDays(3),
                'tgl_tiba' => Carbon::today()->subDays(3),
                'jam_entry' => '10:15:00',
                'tgl_gate_in' => Carbon::today()->subDays(3),
                'jam_gate_in' => '11:00:00',
                'tgl_gate_out' => null,
                'jam_gate_out' => null,
                'status' => 'draft',
                'username' => 'operator',
                'submitted_at' => null,
                'keterangan' => 'Impor spare part mesin industri',
                'sppb_number' => null,
                'sppb_data' => null,
                'sppb_checked_at' => null,
                'sent_to_host' => false,
                'sent_at' => null,
                'host_response' => null,
                'created_by' => $operator->id,
                'updated_by' => $operator->id,
            ],

            // BC 2.0 - Ekspor (Status: Completed)
            [
                'ref_number' => 'TPSO'.date('ymd').'000003',
                'kd_dok' => '3',
                'kd_tps' => 'TPSU',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'GARUDA INDONESIA')->first()->id,
                'kd_gudang' => 'G003',
                'no_pol' => null,
                'no_voy_flight' => 'GA-401',
                'tgl_entry' => Carbon::today()->subDays(7),
                'tgl_tiba' => Carbon::today()->subDays(7),
                'jam_entry' => '14:00:00',
                'tgl_gate_in' => Carbon::today()->subDays(7),
                'jam_gate_in' => '14:30:00',
                'tgl_gate_out' => Carbon::today()->subDays(6),
                'jam_gate_out' => '16:00:00',
                'status' => 'completed',
                'username' => 'admin',
                'submitted_at' => Carbon::today()->subDays(7)->setTime(15, 0),
                'keterangan' => 'Ekspor produk tekstil ke Jepang',
                'sppb_number' => 'SPPB-EXP-'.date('Ymd').'-001',
                'sppb_data' => [
                    'no_sppb' => 'SPPB-EXP-'.date('Ymd').'-001',
                    'tgl_sppb' => Carbon::today()->subDays(6)->format('Y-m-d'),
                    'npwp' => '02.345.678.9-012.000',
                    'nama_eksportir' => 'PT TEKSTIL NUSANTARA',
                ],
                'sppb_checked_at' => Carbon::today()->subDays(6)->setTime(10, 30),
                'sent_to_host' => true,
                'sent_at' => Carbon::today()->subDays(6)->setTime(11, 0),
                'host_response' => [
                    'status' => 'OK',
                    'message' => 'Data ekspor berhasil diproses',
                    'response_code' => '200',
                ],
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],

            // BC 2.3 - Ekspor Penimbunan (Status: Submitted)
            [
                'ref_number' => 'TPSO'.date('ymd').'000004',
                'kd_dok' => '4',
                'kd_tps' => 'TPSL',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'MV. CMA CGM')->first()->id,
                'kd_gudang' => 'G001',
                'no_pol' => null,
                'no_voy_flight' => 'VOY-CMA-003',
                'tgl_entry' => Carbon::today()->subDays(2),
                'tgl_tiba' => Carbon::today()->subDays(2),
                'jam_entry' => '09:00:00',
                'tgl_gate_in' => Carbon::today()->subDays(2),
                'jam_gate_in' => '09:30:00',
                'tgl_gate_out' => null,
                'jam_gate_out' => null,
                'status' => 'submitted',
                'username' => 'operator',
                'submitted_at' => Carbon::today()->subDays(2)->setTime(10, 0),
                'keterangan' => 'Ekspor CPO (Crude Palm Oil) ke India',
                'sppb_number' => 'SPPB-'.date('Ymd').'-002',
                'sppb_data' => [
                    'no_sppb' => 'SPPB-'.date('Ymd').'-002',
                    'tgl_sppb' => Carbon::today()->subDays(1)->format('Y-m-d'),
                    'npwp' => '03.456.789.0-123.000',
                    'nama_eksportir' => 'PT SAWIT MAKMUR',
                ],
                'sppb_checked_at' => Carbon::today()->subDays(1)->setTime(11, 0),
                'sent_to_host' => true,
                'sent_at' => Carbon::today()->subDays(1)->setTime(13, 30),
                'host_response' => [
                    'status' => 'OK',
                    'message' => 'Data BC 2.3 berhasil dikirim',
                    'response_code' => '200',
                ],
                'created_by' => $operator->id,
                'updated_by' => $operator->id,
            ],

            // BC 1.1 - Impor via Darat (Status: Draft)
            [
                'ref_number' => 'TPSO'.date('ymd').'000005',
                'kd_dok' => '1',
                'kd_tps' => 'TPSD',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'TRUCK CONTAINER')->first()->id,
                'kd_gudang' => 'G005',
                'no_pol' => 'B 1234 XYZ',
                'no_voy_flight' => null,
                'tgl_entry' => Carbon::today()->subDays(1),
                'tgl_tiba' => Carbon::today()->subDays(1),
                'jam_entry' => '13:00:00',
                'tgl_gate_in' => Carbon::today()->subDays(1),
                'jam_gate_in' => '13:30:00',
                'tgl_gate_out' => null,
                'jam_gate_out' => null,
                'status' => 'draft',
                'username' => 'operator',
                'submitted_at' => null,
                'keterangan' => 'Impor barang dari Malaysia via darat',
                'sppb_number' => null,
                'sppb_data' => null,
                'sppb_checked_at' => null,
                'sent_to_host' => false,
                'sent_at' => null,
                'host_response' => null,
                'created_by' => $operator->id,
                'updated_by' => $operator->id,
            ],

            // BC 4.0 - Reekspor (Status: Submitted)
            [
                'ref_number' => 'TPSO'.date('ymd').'000006',
                'kd_dok' => '5',
                'kd_tps' => 'TPSL',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'MV. COSCO SHIPPING')->first()->id,
                'kd_gudang' => 'G002',
                'no_pol' => null,
                'no_voy_flight' => 'COSCO-004',
                'tgl_entry' => Carbon::today(),
                'tgl_tiba' => Carbon::today(),
                'jam_entry' => '08:00:00',
                'tgl_gate_in' => Carbon::today(),
                'jam_gate_in' => '08:30:00',
                'tgl_gate_out' => null,
                'jam_gate_out' => null,
                'status' => 'submitted',
                'username' => 'admin',
                'submitted_at' => Carbon::today()->setTime(9, 0),
                'keterangan' => 'Reekspor barang reject quality',
                'sppb_number' => 'SPPB-RE-'.date('Ymd').'-001',
                'sppb_data' => [
                    'no_sppb' => 'SPPB-RE-'.date('Ymd').'-001',
                    'tgl_sppb' => Carbon::today()->format('Y-m-d'),
                    'npwp' => '04.567.890.1-234.000',
                    'nama_eksportir' => 'PT TRADING INTERNASIONAL',
                ],
                'sppb_checked_at' => Carbon::today()->setTime(10, 0),
                'sent_to_host' => true,
                'sent_at' => Carbon::today()->setTime(11, 30),
                'host_response' => [
                    'status' => 'OK',
                    'message' => 'Data reekspor berhasil diproses',
                    'response_code' => '200',
                ],
                'created_by' => $admin->id,
                'updated_by' => $admin->id,
            ],

            // BC 1.1 - Impor Curah Cair (untuk tangki) (Status: Completed)
            [
                'ref_number' => 'TPSO'.date('ymd').'000007',
                'kd_dok' => '1',
                'kd_tps' => 'TPSL',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'MV. EVER GIVEN')->first()->id,
                'kd_gudang' => 'TANK',
                'no_pol' => null,
                'no_voy_flight' => 'VOY-005',
                'tgl_entry' => Carbon::today()->subDays(10),
                'tgl_tiba' => Carbon::today()->subDays(10),
                'jam_entry' => '07:00:00',
                'tgl_gate_in' => Carbon::today()->subDays(10),
                'jam_gate_in' => '07:30:00',
                'tgl_gate_out' => Carbon::today()->subDays(8),
                'jam_gate_out' => '15:00:00',
                'status' => 'completed',
                'username' => 'operator',
                'submitted_at' => Carbon::today()->subDays(10)->setTime(8, 0),
                'keterangan' => 'Impor minyak mentah (crude oil) untuk refinery',
                'sppb_number' => 'SPPB-TANK-'.date('Ymd').'-001',
                'sppb_data' => [
                    'no_sppb' => 'SPPB-TANK-'.date('Ymd').'-001',
                    'tgl_sppb' => Carbon::today()->subDays(9)->format('Y-m-d'),
                    'npwp' => '05.678.901.2-345.000',
                    'nama_importir' => 'PT PERTAMINA (PERSERO)',
                ],
                'sppb_checked_at' => Carbon::today()->subDays(9)->setTime(9, 0),
                'sent_to_host' => true,
                'sent_at' => Carbon::today()->subDays(9)->setTime(10, 0),
                'host_response' => [
                    'status' => 'OK',
                    'message' => 'Data curah cair berhasil diproses',
                    'response_code' => '200',
                ],
                'created_by' => $operator->id,
                'updated_by' => $operator->id,
            ],

            // BC 2.0 - Ekspor via Udara (Status: Submitted)
            [
                'ref_number' => 'TPSO'.date('ymd').'000008',
                'kd_dok' => '3',
                'kd_tps' => 'TPSU',
                'nm_angkut_id' => $nmAngkuts->where('nm_angkut', 'LION AIR CARGO')->first()->id,
                'kd_gudang' => 'G004',
                'no_pol' => null,
                'no_voy_flight' => 'JT-610',
                'tgl_entry' => Carbon::today()->subDays(1),
                'tgl_tiba' => Carbon::today()->subDays(1),
                'jam_entry' => '16:00:00',
                'tgl_gate_in' => Carbon::today()->subDays(1),
                'jam_gate_in' => '16:30:00',
                'tgl_gate_out' => null,
                'jam_gate_out' => null,
                'status' => 'submitted',
                'username' => 'operator',
                'submitted_at' => Carbon::today()->subDays(1)->setTime(17, 0),
                'keterangan' => 'Ekspor kerajinan tangan ke Singapore',
                'sppb_number' => 'SPPB-AIR-'.date('Ymd').'-001',
                'sppb_data' => [
                    'no_sppb' => 'SPPB-AIR-'.date('Ymd').'-001',
                    'tgl_sppb' => Carbon::today()->format('Y-m-d'),
                    'npwp' => '06.789.012.3-456.000',
                    'nama_eksportir' => 'CV KERAJINAN NUSANTARA',
                ],
                'sppb_checked_at' => Carbon::today()->setTime(8, 0),
                'sent_to_host' => false,
                'sent_at' => null,
                'host_response' => null,
                'created_by' => $operator->id,
                'updated_by' => $operator->id,
            ],
        ];

        // Insert documents
        foreach ($documents as $docData) {
            Document::create($docData);
            $this->command->info("✓ Created document: {$docData['ref_number']} ({$docData['status']})");
        }

        $this->command->info("\n".count($documents).' documents created successfully!');
        $this->command->info("\nDocument Status Summary:");
        $this->command->info('- Draft: 3 documents');
        $this->command->info('- Submitted: 4 documents');
        $this->command->info('- Completed: 2 documents');
    }
}
