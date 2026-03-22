<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SoapLog;

try {
    $log = SoapLog::find(14);
    if ($log) {
        $xml = $log->request_xml;
        preg_match('/<(\w*ref\w*)>/i', $xml, $m);
        echo "Ref Tag: " . ($m[1] ?? 'NOT FOUND') . "\n";
    } else {
        echo "LOG ID 14 NOT FOUND\n";
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
