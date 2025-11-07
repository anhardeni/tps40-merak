<?php

use App\Models\Document;
use App\Services\CoCoTangkiService;

$service = new CoCoTangkiService;
$document = Document::with('tangki', 'nmAngkut', 'kdTps', 'kdGudang')->first();

if ($document) {
    echo 'Document found: '.$document->ref_number."\n";
    echo 'Tangki count: '.$document->tangki->count()."\n";

    try {
        $xml = $service->generateCoCoTangkiXML($document);
        echo "XML generated successfully!\n";
        echo substr($xml, 0, 500)."...\n";
    } catch (Exception $e) {
        echo 'Error generating XML: '.$e->getMessage()."\n";
    }
} else {
    echo "No document found\n";
}
