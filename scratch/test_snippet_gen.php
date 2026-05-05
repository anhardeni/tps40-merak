<?php
// Verify PHP can parse just the parseSoapResponse function
$code = file_get_contents(__DIR__ . '/../app/Services/CoCoTangkiService.php');
$lines = explode("\n", $code);
// Extract lines 341-391
$snippet = "<?php\nclass X {\n";
for ($i = 340; $i < 391; $i++) {
    $snippet .= $lines[$i] . "\n";
}
$snippet .= "}\n";
file_put_contents(__DIR__ . '/test_snippet.php', $snippet);
echo "Written snippet.php\n";

// Check syntax
exec('php -l ' . __DIR__ . '/test_snippet.php 2>&1', $out);
echo implode("\n", $out) . "\n";
