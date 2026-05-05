<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Role;
use App\Models\User;
use App\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LocationIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Manual Minimal Seeding (FASTER)
        DB::table('kd_dok')->insert(['kd_dok' => '1', 'nm_dok' => 'Test Dok', 'is_active' => true]);
        DB::table('kd_tps')->insert(['kd_tps' => 'TPSL', 'nm_tps' => 'TPS Laut', 'is_active' => true]);
        DB::table('kd_tps')->insert(['kd_tps' => 'TPSU', 'nm_tps' => 'TPS Udara', 'is_active' => true]);
        DB::table('kd_gudang')->insert(['kd_gudang' => 'G001', 'nm_gudang' => 'Gudang 1', 'kd_tps' => 'TPSL', 'is_active' => true]);
        DB::table('kd_gudang')->insert(['kd_gudang' => 'G003', 'nm_gudang' => 'Gudang 3', 'kd_tps' => 'TPSU', 'is_active' => true]);
        DB::table('nm_angkut')->insert(['id' => 1, 'nm_angkut' => 'Test Vessel', 'call_sign' => 'TEST', 'jenis_angkutan' => 'SEA', 'bendera' => 'ID', 'is_active' => true]);
        
        // 2. Minimal Roles
        $roleOperator = Role::create(['name' => 'operator', 'display_name' => 'Operator']);
        $roleAdmin = Role::create(['name' => 'admin', 'display_name' => 'Admin']);
        
        // Permissions (Optional for isolation check itself, but good to have)
        $permView = Permission::create(['name' => 'documents.view', 'display_name' => 'View Docs', 'module' => 'docs']);
        $roleOperator->permissions()->attach($permView->id);
    }

    /**
     * Test that index results are filtered by assigned location.
     */
    public function test_index_results_are_filtered_by_location_access()
    {
        // Setup users
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        
        $userA->roles()->attach(Role::where('name', 'operator')->first()->id);
        $userB->roles()->attach(Role::where('name', 'operator')->first()->id);

        // Assign User A to Location A (TPSL/G001)
        DB::table('user_location_access')->insert([
            'user_id' => $userA->id,
            'kd_tps' => 'TPSL',
            'kd_gudang' => 'G001',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Create documents
        Document::factory()->create(['kd_tps' => 'TPSL', 'kd_gudang' => 'G001', 'ref_number' => 'DOC-A-001']);
        Document::factory()->create(['kd_tps' => 'TPSU', 'kd_gudang' => 'G003', 'ref_number' => 'DOC-B-001']);

        // Assert for User A (Should see only A)
        $this->actingAs($userA);
        $response = $this->get('/documents');
        $response->assertStatus(200);
        
        // Check Inertia data (more robust than assertSee)
        $documents = $response->viewData('page')['props']['documents']['data'];
        $this->assertCount(1, $documents);
        $this->assertEquals('DOC-A-001', $documents[0]['ref_number']);

        // Assert for User B (No assignment = Should see NOTHING)
        $this->actingAs($userB);
        $response = $this->get('/documents');
        $documents = $response->viewData('page')['props']['documents']['data'];
        $this->assertCount(0, $documents);
    }

    /**
     * Test that admin can see everything.
     */
    public function test_admin_can_see_all_locations()
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::where('name', 'admin')->first()->id);

        Document::factory()->create(['kd_tps' => 'TPSL', 'kd_gudang' => 'G001', 'ref_number' => 'DOC-A-001']);
        Document::factory()->create(['kd_tps' => 'TPSU', 'kd_gudang' => 'G003', 'ref_number' => 'DOC-B-001']);

        $this->actingAs($admin);
        $response = $this->get('/documents');
        
        $documents = $response->viewData('page')['props']['documents']['data'];
        $this->assertCount(2, $documents);
    }

    /**
     * Test that show view is isolated.
     */
    public function test_show_view_is_isolated_by_location()
    {
        $userA = User::factory()->create();
        $userA->roles()->attach(Role::where('name', 'operator')->first()->id);

        // Assign User A to Location A
        DB::table('user_location_access')->insert([
            'user_id' => $userA->id,
            'kd_tps' => 'TPSL',
            'kd_gudang' => 'G001',
        ]);

        $docA = Document::factory()->create(['kd_tps' => 'TPSL', 'kd_gudang' => 'G001', 'ref_number' => 'DOC-A-001']);
        $docB = Document::factory()->create(['kd_tps' => 'TPSU', 'kd_gudang' => 'G003', 'ref_number' => 'DOC-B-001']);

        $this->actingAs($userA);

        // Can see A
        $response = $this->get("/documents/{$docA->id}");
        $response->assertStatus(200);

        // Cannot see B (Should get 404 because of Global Scope filtering it out of the query)
        $response = $this->get("/documents/{$docB->id}");
        $response->assertStatus(404);
    }

    /**
     * Test that store action is guarded.
     */
    public function test_user_cannot_store_document_for_unauthorized_location()
    {
        $userA = User::factory()->create();
        $userA->roles()->attach(Role::where('name', 'operator')->first()->id);

        // Assign User A to Location A only
        DB::table('user_location_access')->insert([
            'user_id' => $userA->id,
            'kd_tps' => 'TPSL',
            'kd_gudang' => 'G001',
        ]);

        $this->actingAs($userA);

        // Attempt to store for Location B (TPSU/G003)
        $response = $this->post('/documents', [
            'kd_dok' => '1',
            'kd_tps' => 'TPSU',
            'nm_angkut_id' => 1,
            'kd_gudang' => 'G003',
            'tgl_entry' => now()->toDateString(),
            'jam_entry' => '08:00',
            'tangki' => [
                ['no_tangki' => 'T-001', 'jenis_isi' => 'OIL', 'kapasitas' => 1000, 'jumlah_isi' => 500, 'satuan' => 'LTR', 'kondisi' => 'BAIK']
            ]
        ]);

        // Should return validation error for kd_tps
        $response->assertSessionHasErrors(['kd_tps']);
    }

    /**
     * Test that Tangki records are also isolated.
     */
    public function test_tangki_isolation()
    {
        $userA = User::factory()->create();
        $userA->roles()->attach(Role::where('name', 'operator')->first()->id);

        // Assign User A to Location A
        DB::table('user_location_access')->insert([
            'user_id' => $userA->id,
            'kd_tps' => 'TPSL',
            'kd_gudang' => 'G001',
        ]);

        $docA = Document::factory()->create(['kd_tps' => 'TPSL', 'kd_gudang' => 'G001']);
        $docB = Document::factory()->create(['kd_tps' => 'TPSU', 'kd_gudang' => 'G003']);

        // Create Tangki for both
        DB::table('tangki')->insert(['document_id' => $docA->id, 'no_tangki' => 'T-A', 'jenis_isi' => 'OIL', 'kapasitas' => 100, 'jumlah_isi' => 50, 'satuan' => 'L', 'kondisi' => 'BAIK']);
        DB::table('tangki')->insert(['document_id' => $docB->id, 'no_tangki' => 'T-B', 'jenis_isi' => 'OIL', 'kapasitas' => 100, 'jumlah_isi' => 50, 'satuan' => 'L', 'kondisi' => 'BAIK']);

        $this->actingAs($userA);

        // User A should see only Tangki A
        $this->assertEquals(1, \App\Models\Tangki::count());
        $this->assertEquals('T-A', \App\Models\Tangki::first()->no_tangki);
    }
}
