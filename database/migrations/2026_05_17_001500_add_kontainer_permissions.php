<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $permissions = [
            ['name' => 'kontainer.view', 'display_name' => 'View Kontainer', 'description' => 'Can view container lists and details'],
            ['name' => 'kontainer.create', 'display_name' => 'Create Kontainer', 'description' => 'Can create new container documents'],
            ['name' => 'kontainer.update', 'display_name' => 'Update Kontainer', 'description' => 'Can update draft container documents'],
            ['name' => 'kontainer.delete', 'display_name' => 'Delete Kontainer', 'description' => 'Can delete draft container documents'],
            ['name' => 'kontainer.submit', 'display_name' => 'Submit to Beacukai', 'description' => 'Can submit container data to Beacukai REST API'],
            ['name' => 'kontainer.approve', 'display_name' => 'Approve Kontainer', 'description' => 'Can approve container documents internally'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission['name']],
                array_merge($permission, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // Assign all new permissions to the admin role safely if it exists
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        if ($adminRole) {
            $adminPermissions = DB::table('permissions')
                ->where('name', 'like', 'kontainer.%')
                ->pluck('id');
 
            foreach ($adminPermissions as $permissionId) {
                DB::table('role_permissions')->updateOrInsert(
                    ['permission_id' => $permissionId, 'role_id' => $adminRole->id]
                );
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->where('name', 'like', 'kontainer.%')
            ->pluck('id');

        DB::table('role_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
    }
};
