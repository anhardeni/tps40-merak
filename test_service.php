<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test CoCoTangki service
echo "Testing CoCoTangki Service...\n\n";

try {
    $service = app(App\Services\CoCoTangkiService::class);
    echo "✓ CoCoTangkiService initialized successfully\n";

    // Get document
    $document = App\Models\Document::with(['tangki', 'nmAngkut', 'kdTps', 'kdGudang'])->first();

    if ($document) {
        echo "✓ Document found: {$document->ref_number}\n";
        echo "✓ Tangki count: {$document->tangki->count()}\n";

        // Test XML generation
        $xml = $service->generateCoCoTangkiXML($document);
        echo "✓ XML generated successfully!\n";
        echo 'XML length: '.strlen($xml)." characters\n";

        // Show first 300 characters of XML
        echo "\nXML Preview:\n";
        echo str_repeat('-', 50)."\n";
        echo substr($xml, 0, 500)."...\n";
        echo str_repeat('-', 50)."\n";

        // Test validation
        $validation = $service->validateCoCoTangkiData($document);
        echo "\n✓ Validation completed\n";
        echo 'Valid: '.($validation['valid'] ? 'Yes' : 'No')."\n";
        if (! empty($validation['errors'])) {
            echo 'Errors ('.count($validation['errors'])."):\n";
            foreach ($validation['errors'] as $error) {
                echo "  - $error\n";
            }
        }
        if (! empty($validation['warnings'])) {
            echo 'Warnings ('.count($validation['warnings'])."):\n";
            foreach ($validation['warnings'] as $warning) {
                echo "  - $warning\n";
            }
        }

    } else {
        echo "✗ No document found in database\n";
    }

} catch (Exception $e) {
    echo '✗ Error: '.$e->getMessage()."\n";
    echo "Stack trace:\n".$e->getTraceAsString()."\n";
}
