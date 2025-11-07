<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create demo admin user with placeholder data
        User::firstOrCreate(
            ['email' => 'admin@tpsonline.test'],
            [
                'name' => 'Admin TPS Online',
                'email' => 'admin@tpsonline.test',
                'email_verified_at' => now(),
                'workos_id' => 'demo_admin_workos_id',
                'avatar' => '',
            ]
        );

        // Create demo operator user with placeholder data
        User::firstOrCreate(
            ['email' => 'operator@tpsonline.test'],
            [
                'name' => 'Operator TPS',
                'email' => 'operator@tpsonline.test',
                'email_verified_at' => now(),
                'workos_id' => 'demo_operator_workos_id',
                'avatar' => '',
            ]
        );

        $this->command->info('Demo users created successfully!');
        $this->command->info('Note: This app uses WorkOS authentication.');
        $this->command->info('Configure WorkOS credentials in .env file.');
    }
}
