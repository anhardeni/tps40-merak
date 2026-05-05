<?php
$code = file_get_contents(__DIR__ . '/../app/Services/CoCoTangkiService.php');
$tokens = token_get_all($code);
$depth = 0;
$lineNum = 1;
$opens = [];
foreach ($tokens as $tok) {
    if (is_array($tok)) {
        $lineNum = $tok[2];
    } else {
        if ($tok === '{') {
            $depth++;
            $opens[$depth] = $lineNum;
        } elseif ($tok === '}') {
            unset($opens[$depth]);
            $depth--;
        }
    }
}
echo "Final depth: $depth\n";
foreach ($opens as $d => $ln) {
    echo "Unclosed { at depth $d opened on line $ln\n";
}
if ($depth === 0) {
    echo "All braces are balanced!\n";
}
