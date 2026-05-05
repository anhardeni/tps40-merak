<?php
$code = file_get_contents(__DIR__ . '/../app/Services/CoCoTangkiService.php');
$lines = explode("\n", $code);
// Print lines 38-45 with exact byte content
for ($i = 38; $i <= 45; $i++) {
    $line = $lines[$i - 1] ?? '(missing)';
    echo "Line $i (" . strlen($line) . " bytes): " . bin2hex($line) . "\n";
    echo "         => " . rtrim($line) . "\n";
}
