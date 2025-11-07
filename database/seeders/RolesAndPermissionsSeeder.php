<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // Document Management
            ['name' => 'documents.view', 'display_name' => 'View Documents', 'module' => 'documents'],
            ['name' => 'documents.create', 'display_name' => 'Create Documents', 'module' => 'documents'],
            ['name' => 'documents.edit', 'display_name' => 'Edit Documents', 'module' => 'documents'],
            ['name' => 'documents.delete', 'display_name' => 'Delete Documents', 'module' => 'documents'],
            ['name' => 'documents.submit', 'display_name' => 'Submit Documents', 'module' => 'documents'],
            ['name' => 'documents.approve', 'display_name' => 'Approve Documents', 'module' => 'documents'],
            ['name' => 'documents.export', 'display_name' => 'Export Documents', 'module' => 'documents'],

            // User Management
            ['name' => 'users.view', 'display_name' => 'View Users', 'module' => 'users'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'module' => 'users'],
            ['name' => 'users.edit', 'display_name' => 'Edit Users', 'module' => 'users'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'module' => 'users'],
            ['name' => 'users.manage-roles', 'display_name' => 'Manage User Roles', 'module' => 'users'],

            // Role Management
            ['name' => 'roles.view', 'display_name' => 'View Roles', 'module' => 'roles'],
            ['name' => 'roles.create', 'display_name' => 'Create Roles', 'module' => 'roles'],
            ['name' => 'roles.edit', 'display_name' => 'Edit Roles', 'module' => 'roles'],
            ['name' => 'roles.delete', 'display_name' => 'Delete Roles', 'module' => 'roles'],
            ['name' => 'roles.assign-permissions', 'display_name' => 'Assign Role Permissions', 'module' => 'roles'],

            // Reports
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'module' => 'reports'],
            ['name' => 'reports.generate', 'display_name' => 'Generate Reports', 'module' => 'reports'],
            ['name' => 'reports.export', 'display_name' => 'Export Reports', 'module' => 'reports'],

            // System Administration
            ['name' => 'system.logs', 'display_name' => 'View System Logs', 'module' => 'system'],
            ['name' => 'system.settings', 'display_name' => 'Manage System Settings', 'module' => 'system'],
            ['name' => 'system.backup', 'display_name' => 'System Backup & Restore', 'module' => 'system'],
            ['name' => 'system.maintenance', 'display_name' => 'System Maintenance', 'module' => 'system'],

            // API Access
            ['name' => 'api.access', 'display_name' => 'API Access', 'module' => 'api'],
            ['name' => 'api.soap', 'display_name' => 'SOAP API Access', 'module' => 'api'],

            // Reference Data
            ['name' => 'reference.view', 'display_name' => 'View Reference Data', 'module' => 'reference'],
            ['name' => 'reference.manage', 'display_name' => 'Manage Reference Data', 'module' => 'reference'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Create Roles
        $roles = [
            [
                'name' => 'super-admin',
                'display_name' => 'Super Administrator',
                'description' => 'Full system access with all permissions',
                'permissions' => Permission::pluck('name')->toArray(), // All permissions
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'System administrator with most permissions except super admin functions',
                'permissions' => [
                    'documents.view', 'documents.create', 'documents.edit', 'documents.delete',
                    'documents.submit', 'documents.approve', 'documents.export',
                    'users.view', 'users.create', 'users.edit', 'users.manage-roles',
                    'reports.view', 'reports.generate', 'reports.export',
                    'system.logs', 'system.settings',
                    'api.access', 'api.soap',
                    'reference.view', 'reference.manage',
                ],
            ],
            [
                'name' => 'supervisor',
                'display_name' => 'Supervisor',
                'description' => 'Supervises document processing and user activities',
                'permissions' => [
                    'documents.view', 'documents.create', 'documents.edit', 'documents.submit',
                    'documents.approve', 'documents.export',
                    'users.view',
                    'reports.view', 'reports.generate',
                    'api.access', 'api.soap',
                    'reference.view',
                ],
            ],
            [
                'name' => 'operator',
                'display_name' => 'Operator',
                'description' => 'Document entry and basic operations',
                'permissions' => [
                    'documents.view', 'documents.create', 'documents.edit', 'documents.submit',
                    'reports.view',
                    'api.access',
                    'reference.view',
                ],
            ],
            [
                'name' => 'viewer',
                'display_name' => 'Viewer',
                'description' => 'Read-only access to documents and reports',
                'permissions' => [
                    'documents.view',
                    'reports.view',
                    'reference.view',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            $permissions = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::create($roleData);

            // Assign permissions to role
            $permissionIds = Permission::whereIn('name', $permissions)->pluck('id');
            $role->permissions()->attach($permissionIds);
        }

        // Create default super admin user if no users exist
        if (User::count() === 0) {
            $user = User::create([
                'name' => 'Super Administrator',
                'email' => 'admin@tpsonline.com',
                'username' => 'admin',
                'employee_id' => 'ADMIN001',
                'department' => 'IT',
                'position' => 'System Administrator',
                'is_active' => true,
                'email_verified_at' => now(),
                'workos_id' => 'admin-'.\Str::random(10),
                'avatar' => '',
            ]);

            // Assign super-admin role
            $superAdminRole = Role::where('name', 'super-admin')->first();
            $user->assignRole($superAdminRole);

            $this->command->info('Default super admin user created: admin@tpsonline.com');
        }

        $this->command->info('Roles and permissions seeded successfully!');
    }
}
