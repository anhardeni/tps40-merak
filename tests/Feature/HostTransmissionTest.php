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
    // Create admin role and user
    $role = Role::create(['name' => 'admin', 'description' => 'Admin Role']);
    $this->user = User::factory()->create();
    $this->user->assignRole($role);
    
    // Create document and tangki
    $this->document = Document::create([
        'ref_number' => 'REF-TEST-001',
        'kd_dok' => '1',
        'kd_tps' => 'TPS01',
        'nm_angkut_id' => 1, // Assuming seeded or created
        'kd_gudang' => 'GUDANG01',
        'tgl_entry' => now(),
        'jam_entry' => '10:00:00',
        'status' => 'APPROVED', // Must be APPROVED to send
        'created_by' => $this->user->id,
    ]);

    $this->document->tangki()->create([
        'no_tangki' => 'TANGKI01',
        'jenis_isi' => 'MINYAK',
        'kapasitas' => 1000,
        'jumlah_isi' => 1000,
        'satuan' => 'LITER',
        'kondisi' => 'BAIK',
        'kd_dok_inout' => '1',
    ]);
});

test('xml transmission success', function () {
    // Create XML Credential
    $credential = BeacukaiCredential::create([
        'service_name' => 'Test XML Service',
        'service_type' => 'soap_xml',
        'endpoint_url' => 'https://tps.beacukai.go.id/service.asmx',
        'username' => 'testuser',
        'password' => 'testpass',
        'is_active' => true,
        'additional_config' => ['timeout' => 30],
    ]);

    // Mock SOAP Response
    Http::fake([
        'https://tps.beacukai.go.id/service.asmx' => Http::response(
            '<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                <soap:Body>
                    <CoCoTangkiResult xmlns="http://services.beacukai.go.id/">Berhasil Kirim Data</CoCoTangkiResult>
                </soap:Body>
            </soap:Envelope>',
            200
        ),
    ]);

    $response = $this->actingAs($this->user)
        ->postJson(route('export.send-to-host', $this->document->id), [
            'format' => 'xml',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'format' => 'xml',
            'message' => 'Berhasil Kirim Data',
        ]);

    $this->assertDatabaseHas('documents', [
        'id' => $this->document->id,
        'sent_to_host' => true,
    ]);

    $this->assertDatabaseHas('host_transmission_logs', [
        'document_id' => $this->document->id,
        'format' => 'xml',
        'status' => 'success',
    ]);
});

test('json transmission success', function () {
    // Create JSON Credential
    $credential = BeacukaiCredential::create([
        'service_name' => 'Test JSON Service',
        'service_type' => 'json_bearer',
        'endpoint_url' => 'https://api.beacukai.go.id/v1/submission',
        'username' => 'testuser',
        'password' => 'testpass',
        'is_active' => true,
        'additional_config' => [
            'auth_endpoint' => 'https://api.beacukai.go.id/v1/auth/login',
            'timeout' => 30
        ],
    ]);

    // Mock Auth and Submission Responses
    Http::fake([
        'https://api.beacukai.go.id/v1/auth/login' => Http::response([
            'access_token' => 'fake-jwt-token',
            'expires_in' => 3600,
        ], 200),
        'https://api.beacukai.go.id/v1/submission' => Http::response([
            'success' => true,
            'message' => 'Data received successfully',
        ], 200),
    ]);

    $response = $this->actingAs($this->user)
        ->postJson(route('export.send-to-host', $this->document->id), [
            'format' => 'json',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'format' => 'json',
            'message' => 'Data received successfully',
        ]);

    $this->assertDatabaseHas('documents', [
        'id' => $this->document->id,
        'sent_to_host' => true,
    ]);

    $this->assertDatabaseHas('host_transmission_logs', [
        'document_id' => $this->document->id,
        'format' => 'json',
        'status' => 'success',
    ]);
});

test('transmission failure handles error correctly', function () {
    // Create XML Credential
    BeacukaiCredential::create([
        'service_name' => 'Test XML Service',
        'service_type' => 'soap_xml',
        'endpoint_url' => 'https://tps.beacukai.go.id/service.asmx',
        'username' => 'testuser',
        'password' => 'testpass',
        'is_active' => true,
    ]);

    // Mock Error Response
    Http::fake([
        'https://tps.beacukai.go.id/service.asmx' => Http::response('Internal Server Error', 500),
    ]);

    $response = $this->actingAs($this->user)
        ->postJson(route('export.send-to-host', $this->document->id), [
            'format' => 'xml',
        ]);

    $response->assertStatus(500)
        ->assertJson([
            'success' => false,
        ]);

    $this->assertDatabaseHas('host_transmission_logs', [
        'document_id' => $this->document->id,
        'format' => 'xml',
        'status' => 'failed',
    ]);
});
