<?php

namespace Database\Seeders;

use App\Models\BeacukaiCredential;
use Illuminate\Database\Seeder;

class BeacukaiCredentialSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating Beacukai credentials...');

        // Get admin user by email
        $user = \App\Models\User::where('email', 'admin@tpsonline.test')->first();
        if (! $user) {
            $this->command->error('Admin user not found! Please run UserSeeder first.');

            return;
        }        // Create credentials for different services
        $credentials = [
            [
                'service_name' => 'CoCoTangki',
                'service_type' => 'cocotangki',
                'endpoint_url' => 'https://tpsonline.beacukai.go.id/cocotangki/service.asmx',
                'username' => 'TPSDEMO',
                'password' => 'demo123', // Will be encrypted automatically
                'description' => 'Credential untuk service CoCoTangki - Laporan barang curah dalam tangki',
                'is_active' => true,
            ],
            [
                'service_name' => 'Host-to-Host XML',
                'service_type' => 'soap_xml',
                'endpoint_url' => 'https://tpsonline.beacukai.go.id/tps/service.asmx',
                'username' => 'TPSDEMO',
                'password' => 'demo123',
                'description' => 'Credential untuk host-to-host transmission menggunakan XML SOAP 1.2',
                'is_active' => true,
                'additional_config' => [
                    'timeout' => 30,
                    'ssl_cert_path' => 'certificates/client.pem',
                    'ssl_key_path' => 'certificates/client.key',
                    'ssl_verify' => true,
                ],
            ],
            [
                'service_name' => 'Host-to-Host JSON',
                'service_type' => 'json_bearer',
                'endpoint_url' => 'https://tpsonline.beacukai.go.id/api/tps/json',
                'username' => 'TPSDEMO',
                'password' => 'demo123',
                'description' => 'Credential untuk host-to-host transmission menggunakan JSON Bearer Token',
                'is_active' => true,
                'additional_config' => [
                    'auth_endpoint' => 'https://tpsonline.beacukai.go.id/api/auth/login',
                    'refresh_endpoint' => 'https://tpsonline.beacukai.go.id/api/auth/refresh',
                    'token_field' => 'access_token',
                    'refresh_token_field' => 'refresh_token',
                    'expires_in_field' => 'expires_in',
                    'default_expiry' => 86400, // 24 hours
                    'timeout' => 30,
                    'ssl_cert_path' => 'certificates/client.pem',
                    'ssl_key_path' => 'certificates/client.key',
                    'ssl_verify' => true,
                ],
            ],
            [
                'service_name' => 'SPPB Online',
                'service_type' => 'sppb',
                'endpoint_url' => 'https://tpsonline.beacukai.go.id/tps/service.asmx',
                'username' => 'TPSDEMO',
                'password' => 'demo123',
                'description' => 'Credential untuk cek data SPPB online',
                'is_active' => true,
            ],
            [
                'service_name' => 'BC 2.3 Online',
                'service_type' => 'bc23',
                'endpoint_url' => 'https://tpsonline.beacukai.go.id/bc23/service.asmx',
                'username' => 'TPSDEMO',
                'password' => 'demo123',
                'description' => 'Credential untuk pengiriman BC 2.3',
                'is_active' => true,
            ],
            [
                'service_name' => 'Gate In/Out',
                'service_type' => 'gate',
                'endpoint_url' => 'https://tpsonline.beacukai.go.id/gate/service.asmx',
                'username' => 'TPSDEMO',
                'password' => 'demo123',
                'description' => 'Credential untuk laporan gate in/out',
                'is_active' => false, // Inactive by default
            ],
        ];

        foreach ($credentials as $credentialData) {
            $credentialData['created_by'] = $user->id;

            BeacukaiCredential::firstOrCreate(
                [
                    'service_type' => $credentialData['service_type'],
                ],
                $credentialData
            );

            $this->command->info("✓ Created credential: {$credentialData['service_name']}");
        }

        $this->command->info("\n".count($credentials).' credentials created successfully!');
        $this->command->warn("\n⚠️  IMPORTANT: These are DEMO credentials!");
        $this->command->warn('Please update with real credentials from Beacukai before production use.');
        $this->command->info("\nYou can manage credentials at: /settings/beacukai-credentials");
    }
}
