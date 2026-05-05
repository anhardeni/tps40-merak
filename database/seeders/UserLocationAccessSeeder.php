<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserLocationAccessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a test user (non-admin)
        $user = User::whereHas('roles', function($q) {
            $q->where('name', '!=', 'admin');
        })->first();

        if (!$user) {
            // Create one if doesn't exist
            $user = User::create([
                'name' => 'Operator TPS 1',
                'email' => 'operator1@example.com',
                'username' => 'operator1',
                'is_active' => true,
            ]);
        }

        $gudang = DB::table('kd_gudang')->first();
        if ($gudang) {
            $tps = DB::table('kd_tps')->where('kd_tps', $gudang->kd_tps)->first();
            if ($tps) {
                $this->command->info("Found Gudang {$gudang->kd_gudang} linked to TPS {$tps->kd_tps}");
            } else {
                $this->command->error("Gudang {$gudang->kd_gudang} has no matching TPS entry.");
            }
        } else {
            $this->command->error("No Gudang found in kd_gudang table.");
            $tps = null;
        }

        if ($user && $tps && $gudang) {
            DB::table('user_location_access')->updateOrInsert(
                ['user_id' => $user->id, 'kd_tps' => $tps->kd_tps, 'kd_gudang' => $gudang->kd_gudang],
                ['created_at' => now(), 'updated_at' => now()]
            );
            
            $this->command->info("Assigned user {$user->username} to TPS {$tps->kd_tps} and Gudang {$gudang->kd_gudang}");
        } else {
            $this->command->error("Could not find reference data (kd_tps/kd_gudang) to assign.");
        }
    }
}
