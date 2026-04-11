<?php
function cosineSimilarity(array $a, array $b): float {
    $dot=$na=$nb=0.0;
    foreach($a as $i=>$v){$dot+=$v*$b[$i];$na+=$v*$v;$nb+=$b[$i]*$b[$i];}
    return $dot/(sqrt($na)*sqrt($nb));
}
