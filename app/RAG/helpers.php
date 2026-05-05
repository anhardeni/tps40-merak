<?php
if (!function_exists('cosineSimilarity')) {
    function cosineSimilarity(array $a, array $b): float {
        if (empty($a) || empty($b) || count($a) !== count($b)) return 0.0;
        $dot = $na = $nb = 0.0;
        foreach ($a as $i => $v) { $dot += $v * ($b[$i] ?? 0); $na += $v * $v; $nb += ($b[$i] ?? 0) ** 2; }
        $denom = sqrt($na) * sqrt($nb);
        return $denom > 0 ? $dot / $denom : 0.0;
    }
}
