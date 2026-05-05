<?php

$root = dirname(__DIR__);
require $root . '/vendor/autoload.php';

$app = require_once $root . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$doc = \App\Models\Document::with(['tangki', 'nmAngkut'])->latest()->first();

if (!$doc) {
    echo "No document found.\n";
    exit;
}

echo "Document: " . $doc->ref_number . "\n";
echo "Tangki count: " . $doc->tangki()->count() . "\n\n";

$svc = new \App\Services\CoCoTangkiService();
$xml = $svc->generateCoCoTangkiXML($doc);
echo $xml . "\n";
