<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Tests\TestCase;

class KontainerImportTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $guestUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
        
        // Create users
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole(Role::findByName('admin'));
        
        $this->guestUser = User::factory()->create(); // No roles or permissions
    }

    public function test_guests_are_redirected_or_blocked_from_importing_container_excel_files()
    {
        $response = $this->postJson('/kontainer/import', [
            'file' => UploadedFile::fake()->create('containers.xlsx', 10)
        ]);

        $response->assertStatus(401);
    }

    public function test_users_without_kontainer_create_permission_are_forbidden_from_importing()
    {
        $response = $this->actingAs($this->guestUser)
            ->postJson('/kontainer/import', [
                'file' => UploadedFile::fake()->create('containers.xlsx', 10)
            ]);

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_import_container_excel()
    {
        $mockFile = UploadedFile::fake()->create('containers.xlsx', 100);
        
        Excel::fake();
        Excel::shouldReceive('toCollection')
            ->andReturn(collect([
                collect([
                    [
                        'no_kontainer' => 'CONT123456',
                        'ukuran_kontainer' => '40',
                        'no_segel' => 'SEG123',
                        'jns_kontainer' => '8',
                        'bruto' => '12500',
                        'wk_inout' => '2026-05-16 12:00:00'
                    ]
                ])
            ]));

        $response = $this->actingAs($this->adminUser)
            ->postJson('/kontainer/import', [
                'file' => $mockFile,
            ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'no_kontainer',
                    'ukuran_kontainer',
                    'no_segel',
                    'jns_kontainer',
                    'bruto',
                    'wk_inout',
                ]
            ]
        ]);
    }
}
