<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Document;

echo "=== Fix Ref Number untuk Documents yang Sudah Ada ===\n\n";

try {
    $documents = Document::all();

    echo "→ Documents yang perlu diperbaiki:\n";
    foreach ($documents as $doc) {
        $oldRef = $doc->ref_number;

        // Skip jika sudah menggunakan format baru
        if (strpos($oldRef, 'TPSO') === 0 && strlen($oldRef) == 14) {
            echo "  ID: {$doc->id} | {$oldRef} → ✓ Already correct format\n";

            continue;
        }

        // Generate new ref_number based on created_at
        $date = $doc->created_at ?? now();
        $prefix = 'TPSO';
        $year = $date->format('y');
        $month = $date->format('m');
        $day = $date->format('d');

        // Get sequence for that day
        $count = Document::whereDate('created_at', $date->format('Y-m-d'))
            ->where('id', '<', $doc->id)
            ->count();

        $sequence = str_pad($count + 1, 6, '0', STR_PAD_LEFT);
        $newRef = $prefix.$year.$month.$day.$sequence;

        // Update without triggering events
        Document::withoutEvents(function () use ($doc, $newRef) {
            $doc->update(['ref_number' => $newRef]);
        });

        echo "  ID: {$doc->id} | {$oldRef} → {$newRef} ✓\n";
    }

    echo "\n→ Verifikasi setelah update:\n";
    $allDocs = Document::orderBy('id')->get(['id', 'ref_number', 'created_at']);
    foreach ($allDocs as $doc) {
        echo "  ID: {$doc->id} | Ref: {$doc->ref_number} | Created: {$doc->created_at->format('Y-m-d H:i:s')}\n";
    }

    echo "\n✅ Ref numbers berhasil diperbaiki!\n";

} catch (\Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
}
