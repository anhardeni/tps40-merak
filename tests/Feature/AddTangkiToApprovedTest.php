<?php

use App\Models\BeacukaiCredential;
use App\Models\Document;
use App\Models\Role;
use App\Models\Tangki;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed reference data
    $this->seed(\Database\Seeders\ReferenceDataSeeder::class);
    
    // Create admin role and user
    $role = Role::create(['name' => 'admin', 'description' => 'Admin Role']);
    $this->user = User::factory()->create();
    $this->user->assignRole($role);
});

test('add tangki to approved document sets needs_resend flag', function () {
    $document = Document::create([
        'ref_number' => 'REF-TEST-001',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1,
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'APPROVED',
        'sent_to_host' => true, // Already sent
        'sent_at' => now()->subHours(2),
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('documents.append-tangki', $document->id), [
            'tangki' => [[
                'no_tangki' => 'TANGKI01',
                'kd_dok_inout' => '1',
                'jenis_isi' => 'MINYAK',
                'kapasitas' => 1000,
                'jumlah_isi' => 1000,
                'satuan' => 'LITER',
                'kondisi' => 'BAIK',
            ]],
        ]);

    $response->assertRedirect();
    
    // Verify needs_resend flag is set
    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'status' => 'APPROVED', // Status unchanged
        'needs_resend' => true, // Flag set
    ]);
    
    // Verify tangki was added
    $this->assertDatabaseHas('tangki', [
        'document_id' => $document->id,
        'no_tangki' => 'TANGKI01',
    ]);
});

test('import tangki to approved document sets needs_resend flag', function () {
    $document = Document::create([
        'ref_number' => 'REF-TEST-002',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1,
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'APPROVED',
        'sent_to_host' => true,
        'created_by' => $this->user->id,
    ]);

    // Create mock Excel file content
    $mockFile = \Illuminate\Http\UploadedFile::fake()->create('tangki.xlsx', 100);
    
    // Mock Excel import to return tangki data
    Excel::fake();
    Excel::shouldReceive('toArray')
        ->andReturn([[
            ['no_tangki' => 'TANGKI02', 'kd_dok_inout' => '1', 'jenis_isi' => 'BENSIN', 'kapasitas' => 2000, 'jumlah_isi' => 1500, 'satuan' => 'LITER', 'kondisi' => 'BAIK'],
        ]]);

    $response = $this->actingAs($this->user)
        ->post(route('documents.import-tangki', $document->id), [
            'file' => $mockFile,
        ]);

    $response->assertRedirect();
    
    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'needs_resend' => true,
    ]);
});

test('resend after add tangki clears needs_resend flag', function () {
    // Create credential
    $credential = BeacukaiCredential::create([
        'service_name' => 'Test XML Service',
        'service_type' => 'soap_xml',
        'endpoint_url' => 'https://tps.beacukai.go.id/service.asmx',
        'username' => 'testuser',
        'password' => 'testpass',
        'is_active' => true,
    ]);

    // Create APPROVED document with needs_resend = true
    $document = Document::create([
        'ref_number' => 'REF-TEST-003',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1,
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'APPROVED',
        'sent_to_host' => true,
        'needs_resend' => true, // Needs resend
        'created_by' => $this->user->id,
    ]);

    $document->tangki()->create([
        'no_tangki' => 'TANGKI03',
        'kd_dok_inout' => '1',
        'jenis_isi' => 'DIESEL',
        'kapasitas' => 3000,
        'jumlah_isi' => 2500,
        'satuan' => 'LITER',
        'kondisi' => 'BAIK',
    ]);

    // Mock SOAP Response
    Http::fake([
        'https://tps.beacukai.go.id/service.asmx' => Http::response(
            '<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
                <soap:Body>
                    <CoCoTangkiResult xmlns="http://services.beacukai.go.id/">Berhasil Kirim Data</CoCoTangkiResult>
                </soap:Body>
            </soap:Envelope>',
            200
        ),
    ]);

    $response = $this->actingAs($this->user)
        ->postJson(route('export.resend-to-host', $document->id), [
            'format' => 'xml',
        ]);

    $response->assertStatus(200);
    
    // Verify needs_resend flag is cleared
    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'needs_resend' => false, // Flag cleared after resend
    ]);
});

test('add tangki to draft does not set needs_resend', function () {
    $document = Document::create([
        'ref_number' => 'REF-TEST-004',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1,
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'DRAFT', // DRAFT status
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('documents.append-tangki', $document->id), [
            'tangki' => [[
                'no_tangki' => 'TANGKI04',
                'kd_dok_inout' => '1',
                'jenis_isi' => 'SOLAR',
                'kapasitas' => 500,
                'jumlah_isi' => 400,
                'satuan' => 'LITER',
                'kondisi' => 'BAIK',
            ]],
        ]);

    $response->assertRedirect();
    
    // Verify needs_resend is NOT set for DRAFT
    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'status' => 'DRAFT',
        'needs_resend' => false, // Should remain false
    ]);
});

test('add tangki to submitted changes status to amended', function () {
    $document = Document::create([
        'ref_number' => 'REF-TEST-005',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1,
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'SUBMITTED',
        'created_by' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->post(route('documents.append-tangki', $document->id), [
            'tangki' => [[
                'no_tangki' => 'TANGKI05',
                'kd_dok_inout' => '1',
                'jenis_isi' => 'PREMIUM',
                'kapasitas' => 1500,
                'jumlah_isi' => 1200,
                'satuan' => 'LITER',
                'kondisi' => 'BAIK',
            ]],
        ]);

    $response->assertRedirect();
    
    // Verify status changed to AMENDED
    $this->assertDatabaseHas('documents', [
        'id' => $document->id,
        'status' => 'AMENDED',
    ]);
});

test('authorization required to add tangki', function () {
    $otherUser = User::factory()->create(); // No roles
    
    $document = Document::create([
        'ref_number' => 'REF-TEST-006',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1,
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'APPROVED',
        'created_by' => $this->user->id, // Created by different user
    ]);

    $response = $this->actingAs($otherUser)
        ->post(route('documents.append-tangki', $document->id), [
            'tangki' => [[
                'no_tangki' => 'TANGKI06',
                'kd_dok_inout' => '1',
                'jenis_isi' => 'PERTAMAX',
                'kapasitas' => 800,
                'jumlah_isi' => 700,
                'satuan' => 'LITER',
                'kondisi' => 'BAIK',
            ]],
        ]);

    $response->assertForbidden(); // Should be denied
});
