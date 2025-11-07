<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "=== Check Users untuk Login ===\n\n";

try {
    $users = User::all();

    if ($users->isEmpty()) {
        echo "❌ Tidak ada user di database!\n";
        echo "→ Membuat user admin default...\n\n";

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@tpsonline.test',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // Assign admin role if exists
        if (class_exists('\Spatie\Permission\Models\Role')) {
            $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
            $admin->assignRole($adminRole);
        }

        echo "✅ User admin berhasil dibuat!\n";
        echo "   Email: admin@tpsonline.test\n";
        echo "   Password: password\n\n";
    } else {
        echo "✓ Ditemukan {$users->count()} user:\n\n";

        foreach ($users as $user) {
            echo "ID: {$user->id}\n";
            echo "Name: {$user->name}\n";
            echo "Email: {$user->email}\n";
            echo 'Email Verified: '.($user->email_verified_at ? 'Yes' : 'No')."\n";

            if (method_exists($user, 'roles')) {
                $roles = $user->roles->pluck('name')->join(', ');
                echo 'Roles: '.($roles ?: 'None')."\n";
            }

            echo "Created: {$user->created_at}\n";
            echo "\n";
        }

        echo "→ Untuk login, gunakan salah satu email di atas.\n";
        echo "→ Jika lupa password, reset dengan:\n";
        echo "   php artisan tinker\n";
        echo "   User::where('email', 'EMAIL')->update(['password' => Hash::make('PASSWORD')]);\n\n";
    }

    echo "=== Login Instructions ===\n";
    echo "1. Akses: http://realav1_tpsonline.test/login\n";
    echo "2. Gunakan credentials di atas\n";
    echo "3. Jika masih error, coba:\n";
    echo "   - php artisan config:clear\n";
    echo "   - php artisan cache:clear\n";
    echo "   - php artisan view:clear\n\n";

} catch (\Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
}
