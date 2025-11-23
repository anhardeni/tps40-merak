<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class DocumentPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Permissions
        $append = Permission::firstOrCreate([
            'name' => 'documents.append'
        ], [
            'display_name' => 'Append Tangki to Document',
            'description' => 'Allow user to append tangki to an existing document',
            'module' => 'documents',
            'is_active' => true,
        ]);

        $approve = Permission::firstOrCreate([
            'name' => 'documents.approve'
        ], [
            'display_name' => 'Approve Documents',
            'description' => 'Allow user to approve amended/submitted documents',
            'module' => 'documents',
            'is_active' => true,
        ]);

        // Roles
        $approver = Role::firstOrCreate([
            'name' => 'approver'
        ], [
            'display_name' => 'Document Approver',
            'description' => 'User who reviews and approves documents',
            'is_active' => true,
        ]);

        $admin = Role::firstOrCreate([
            'name' => 'admin'
        ], [
            'display_name' => 'Administrator',
            'description' => 'System administrator with all permissions',
            'is_active' => true,
        ]);

        // Attach permissions to roles
        $approver->givePermissionTo($approve);
        $admin->givePermissionTo($append);
        $admin->givePermissionTo($approve);
    }
}
