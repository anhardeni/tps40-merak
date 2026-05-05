<?php
// Fix the file: normalize line endings and apply the xmlns change cleanly
$file = dirname(__DIR__) . '/app/Services/CoCoTangkiService.php';

$content = file_get_contents($file);

// Normalize all line endings to LF
$content = str_replace("\r\n", "\n", $content);
$content = str_replace("\r", "\n", $content);

// Ensure xmlns attribute is set (add if missing)
$old = '$dom->loadXML($xml->asXML());';
$new = '$dom->loadXML($xml->asXML());' . "\n" .
       '        // Tambahkan xmlns="cocotangki.xsd" sesuai referensi schema Beacukai' . "\n" .
       '        $dom->documentElement->setAttribute(\'xmlns\', \'cocotangki.xsd\');';

if (strpos($content, '$dom->documentElement->setAttribute(\'xmlns\'') === false) {
    $content = str_replace($old, $new, $content);
    echo "xmlns attribute added.\n";
} else {
    echo "xmlns attribute already present.\n";
}

// Write back without BOM, with LF endings
file_put_contents($file, $content);
echo "File cleaned and saved.\n";

// Verify syntax
exec('php -l ' . escapeshellarg($file) . ' 2>&1', $out, $code);
echo implode("\n", $out) . "\n";
echo "Exit code: $code\n";
