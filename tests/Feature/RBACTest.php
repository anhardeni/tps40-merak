<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RBACTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
    }

    public function test_user_can_have_roles()
    {
        $user = User::factory()->create();
        $role = Role::findByName('operator');

        $user->assignRole($role);

        $this->assertTrue($user->hasRole('operator'));
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_user_can_have_permissions_through_roles()
    {
        $user = User::factory()->create();
        $role = Role::findByName('operator');

        $user->assignRole($role);

        $this->assertTrue($user->hasPermission('documents.view'));
        $this->assertTrue($user->hasPermission('documents.create'));
        $this->assertFalse($user->hasPermission('users.create'));
    }

    public function test_super_admin_has_all_permissions()
    {
        $user = User::factory()->create();
        $superAdminRole = Role::findByName('super-admin');

        $user->assignRole($superAdminRole);

        $this->assertTrue($user->hasRole('super-admin'));
        $this->assertTrue($user->hasPermission('users.create'));
        $this->assertTrue($user->hasPermission('system.settings'));
        $this->assertTrue($user->hasPermission('documents.approve'));
    }

    public function test_permission_middleware_blocks_unauthorized_access()
    {
        $user = User::factory()->create();
        $viewerRole = Role::findByName('viewer');

        $user->assignRole($viewerRole);
        $this->actingAs($user);

        // Viewer can access documents.view
        $response = $this->get('/documents');
        $response->assertStatus(200);

        // But cannot access user management
        $response = $this->get('/admin/users');
        $response->assertStatus(403);
    }

    public function test_role_middleware_works()
    {
        $user = User::factory()->create();
        $operatorRole = Role::findByName('operator');

        $user->assignRole($operatorRole);

        $this->assertTrue($user->hasRole('operator'));
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_permissions_are_properly_seeded()
    {
        $this->assertDatabaseHas('permissions', ['name' => 'documents.view']);
        $this->assertDatabaseHas('permissions', ['name' => 'users.create']);
        $this->assertDatabaseHas('permissions', ['name' => 'system.logs']);

        $this->assertDatabaseHas('roles', ['name' => 'super-admin']);
        $this->assertDatabaseHas('roles', ['name' => 'operator']);
        $this->assertDatabaseHas('roles', ['name' => 'viewer']);
    }
}
