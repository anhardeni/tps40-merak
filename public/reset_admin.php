<?php

use App\Models\User;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::where('email', 'admin@tpsonline.com')->first();
if ($user) {
    $user->password = 'password';
    $user->save();
    echo "SUCCESS: Admin password has been updated to 'password'\n";
} else {
    // Let's create the admin user if they don't exist
    $user = User::create([
        'name' => 'Super Administrator',
        'email' => 'admin@tpsonline.com',
        'password' => 'password',
        'username' => 'admin',
        'employee_id' => 'ADMIN001',
        'department' => 'IT',
        'position' => 'System Administrator',
        'is_active' => true,
        'email_verified_at' => now(),
        'workos_id' => 'admin-'.Str::random(10),
        'avatar' => '',
    ]);
    
    $role = App\Models\Role::where('name', 'super-admin')->first();
    if ($role) {
        $user->assignRole($role);
    }
    echo "SUCCESS: Created default admin user with password 'password'\n";
}
