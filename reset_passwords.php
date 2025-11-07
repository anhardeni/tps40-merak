<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Reset Password untuk Testing ===\n\n";

try {
    $users = [
        ['email' => 'admin@tpsonline.test', 'password' => 'password'],
        ['email' => 'operator@tpsonline.test', 'password' => 'password'],
        ['email' => 'admin@test.com', 'password' => 'password'],
    ];

    foreach ($users as $userData) {
        $user = User::where('email', $userData['email'])->first();

        if ($user) {
            $user->update([
                'password' => Hash::make($userData['password']),
                'email_verified_at' => now(),
            ]);

            echo "✓ Password reset untuk: {$userData['email']}\n";
            echo "  Password: {$userData['password']}\n\n";
        }
    }

    echo "=== Login Credentials ===\n\n";

    $allUsers = User::all();
    foreach ($allUsers as $user) {
        echo "Email: {$user->email}\n";
        echo "Password: password\n";
        echo "Name: {$user->name}\n";
        echo "---\n";
    }

    echo "\n=== Instructions ===\n";
    echo "1. URL Login: http://realav1_tpsonline.test/login\n";
    echo "2. Pilih salah satu email di atas\n";
    echo "3. Password: password\n";
    echo "4. Jika masih error, cek:\n";
    echo "   - Browser console (F12)\n";
    echo "   - storage/logs/laravel.log\n";
    echo "   - Pastikan npm run dev sedang berjalan\n\n";

    echo "✅ Semua password sudah direset!\n";

} catch (\Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
}
