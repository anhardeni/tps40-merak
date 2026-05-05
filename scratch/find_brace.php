<?php
// Find all lines with { and } to locate structural problems
$code = file_get_contents(__DIR__ . '/../app/Services/CoCoTangkiService.php');
$lines = explode("\n", $code);
$depth = 0;
foreach ($lines as $i => $line) {
    $lineNum = $i + 1;
    // Only look at non-string/non-comment braces - rough count
    $stripped = preg_replace('/"[^"]*"/', '""', $line); // strip double-quoted strings
    $stripped = preg_replace("/'[^']*'/", "''", $stripped); // strip single-quoted strings
    $stripped = preg_replace('/\/\/.*$/', '', $stripped); // strip // comments
    
    $opens = substr_count($stripped, '{');
    $closes = substr_count($stripped, '}');
    $depth += $opens - $closes;
    
    if ($opens !== $closes) {
        echo "Line $lineNum (depth=$depth after): +$opens -{$closes}: " . trim($line) . "\n";
    }
}
echo "\nFinal depth: $depth\n";
