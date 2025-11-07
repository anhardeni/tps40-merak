<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Full system access with all permissions',
            ]
        );

        $operatorRole = Role::firstOrCreate(
            ['name' => 'operator'],
            [
                'display_name' => 'Operator',
                'description' => 'Standard user with limited access',
            ]
        );

        $supervisorRole = Role::firstOrCreate(
            ['name' => 'supervisor'],
            [
                'display_name' => 'Supervisor',
                'description' => 'Supervisor with approval permissions',
            ]
        );

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@tpsonline.test'],
            [
                'name' => 'Admin TPS Online',
                'username' => 'admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'workos_id' => 'admin-'.uniqid(),
                'employee_id' => 'EMP001',
                'phone' => '081234567890',
                'department' => 'IT',
                'position' => 'System Administrator',
                'is_active' => true,
                'avatar' => '',
            ]
        );

        if (! $admin->roles()->where('role_id', $adminRole->id)->exists()) {
            $admin->roles()->attach($adminRole->id);
        }

        // Create Operator User
        $operator = User::firstOrCreate(
            ['email' => 'operator@tpsonline.test'],
            [
                'name' => 'Operator TPS',
                'username' => 'operator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'workos_id' => 'operator-'.uniqid(),
                'employee_id' => 'EMP002',
                'phone' => '081234567891',
                'department' => 'Operations',
                'position' => 'Data Entry Operator',
                'is_active' => true,
                'avatar' => '',
            ]
        );

        if (! $operator->roles()->where('role_id', $operatorRole->id)->exists()) {
            $operator->roles()->attach($operatorRole->id);
        }

        // Create Supervisor User
        $supervisor = User::firstOrCreate(
            ['email' => 'supervisor@tpsonline.test'],
            [
                'name' => 'Supervisor TPS',
                'username' => 'supervisor',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'workos_id' => 'supervisor-'.uniqid(),
                'employee_id' => 'EMP003',
                'phone' => '081234567892',
                'department' => 'Operations',
                'position' => 'Operations Supervisor',
                'is_active' => true,
                'avatar' => '',
            ]
        );

        if (! $supervisor->roles()->where('role_id', $supervisorRole->id)->exists()) {
            $supervisor->roles()->attach($supervisorRole->id);
        }
    }
}
