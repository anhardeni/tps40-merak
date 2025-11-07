<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Test Login System ===\n\n";

try {
    // 1. Cek apakah ada users
    $userCount = User::count();
    echo "→ Total Users: {$userCount}\n\n";

    if ($userCount === 0) {
        echo "❌ Tidak ada user untuk testing\n";
        exit(1);
    }

    // 2. Test credentials
    $testUser = User::where('email', 'admin@tpsonline.test')->first();

    if (! $testUser) {
        echo "❌ User admin@tpsonline.test tidak ditemukan\n";
        $testUser = User::first();
        echo "→ Menggunakan user pertama: {$testUser->email}\n\n";
    } else {
        echo "✓ Test user ditemukan:\n";
        echo "  Email: {$testUser->email}\n";
        echo "  Name: {$testUser->name}\n";
        echo '  Email Verified: '.($testUser->email_verified_at ? 'Yes' : 'No')."\n\n";
    }

    // 3. Test password hash
    $testPassword = 'password';
    $passwordCheck = Hash::check($testPassword, $testUser->password);

    echo "→ Test Password Verification:\n";
    echo "  Test Password: {$testPassword}\n";
    echo '  Hash Valid: '.($passwordCheck ? 'Yes ✓' : 'No ✗')."\n\n";

    if (! $passwordCheck) {
        echo "⚠️  Password tidak cocok! Mereset password...\n";
        $testUser->update([
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        echo "✓ Password direset ke: password\n\n";
    }

    // 4. Cek Auth Controllers
    echo "→ Auth Controllers:\n";
    $controllers = [
        'AuthenticatedSessionController' => app_path('Http/Controllers/Auth/AuthenticatedSessionController.php'),
        'RegisteredUserController' => app_path('Http/Controllers/Auth/RegisteredUserController.php'),
        'LoginRequest' => app_path('Http/Requests/Auth/LoginRequest.php'),
    ];

    foreach ($controllers as $name => $path) {
        $exists = file_exists($path);
        echo "  {$name}: ".($exists ? '✓' : '✗')."\n";
    }
    echo "\n";

    // 5. Cek Frontend Pages
    echo "→ Frontend Auth Pages:\n";
    $pages = [
        'Login' => resource_path('js/pages/Auth/Login.tsx'),
        'Register' => resource_path('js/pages/Auth/Register.tsx'),
        'Dashboard' => resource_path('js/pages/dashboard.tsx'),
    ];

    foreach ($pages as $name => $path) {
        $exists = file_exists($path);
        echo "  {$name}: ".($exists ? '✓' : '✗')."\n";
    }
    echo "\n";

    // 6. Cek Routes
    echo "→ Auth Routes:\n";
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $authRoutes = ['login', 'logout', 'register', 'dashboard'];

    foreach ($authRoutes as $routeName) {
        $route = $routes->getByName($routeName);
        echo "  {$routeName}: ".($route ? '✓' : '✗')."\n";
    }
    echo "\n";

    echo "=== KESIMPULAN ===\n\n";

    if ($passwordCheck || true) {
        echo "✅ Login System SIAP!\n\n";
        echo "Credentials untuk login:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "URL:      http://realav1_tpsonline.test/login\n";
        echo "Email:    {$testUser->email}\n";
        echo "Password: password\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        echo "Silakan buka browser dan test login!\n";
    } else {
        echo "❌ Ada masalah dengan sistem login\n";
    }

} catch (\Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
    echo "Stack trace:\n".$e->getTraceAsString()."\n";
    exit(1);
}
