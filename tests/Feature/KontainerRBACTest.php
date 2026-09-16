<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\KontainerDocument;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KontainerRBACTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $viewerUser;
    protected User $creatorUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);

        // Create Admin
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole(Role::findByName('admin'));

        // Create Viewer Role and User
        $viewerRole = Role::create(['name' => 'kontainer-viewer', 'display_name' => 'Kontainer Viewer']);
        $viewerRole->permissions()->attach(Permission::where('name', 'kontainer.view')->first()->id);
        
        $this->viewerUser = User::factory()->create();
        $this->viewerUser->assignRole($viewerRole);

        // Create Creator Role and User
        $creatorRole = Role::create(['name' => 'kontainer-creator', 'display_name' => 'Kontainer Creator']);
        $creatorRole->permissions()->attach(
            Permission::whereIn('name', ['kontainer.view', 'kontainer.create'])->pluck('id')
        );

        $this->creatorUser = User::factory()->create();
        $this->creatorUser->assignRole($creatorRole);
    }

    public function test_viewer_can_list_and_view_but_cannot_access_create_page()
    {
        // 1. Viewer can see Index
        $response = $this->actingAs($this->viewerUser)->get('/kontainer');
        $response->assertStatus(200);

        // 2. Viewer cannot access Create page
        $response = $this->actingAs($this->viewerUser)->get('/kontainer/create');
        $response->assertStatus(403);
    }

    public function test_creator_can_access_create_page()
    {
        $response = $this->actingAs($this->creatorUser)->get('/kontainer/create');
        $response->assertStatus(200);
    }
}
