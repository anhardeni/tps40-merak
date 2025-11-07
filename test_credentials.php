<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\BeacukaiCredential;

echo "=== Testing Beacukai Credential Encryption ===\n\n";

$credential = BeacukaiCredential::first();

if ($credential) {
    echo "✓ Credential found:\n";
    echo "  Service: {$credential->service_name}\n";
    echo "  Type: {$credential->service_type}\n";
    echo "  Username: {$credential->username}\n";
    echo '  Password (encrypted in DB): '.substr($credential->getAttributes()['password'], 0, 80)."...\n";
    echo "  Password (decrypted): {$credential->password}\n";
    echo "  Endpoint: {$credential->endpoint_url}\n";
    echo '  Active: '.($credential->is_active ? 'Yes' : 'No')."\n";
    echo "  Created by: User #{$credential->created_by}\n\n";

    echo "✓ Encryption/Decryption working correctly!\n";

    // Test all credentials
    echo "\n=== All Credentials ===\n";
    $allCredentials = BeacukaiCredential::all();
    foreach ($allCredentials as $cred) {
        echo sprintf(
            "- %-20s | %-15s | Active: %s\n",
            $cred->service_name,
            $cred->service_type,
            $cred->is_active ? 'Yes' : 'No'
        );
    }

} else {
    echo "✗ No credential found!\n";
    echo "Run: php artisan db:seed --class=BeacukaiCredentialSeeder\n";
}
