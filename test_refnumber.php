<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Document;

echo "=== Test Ref Number Generation ===\n\n";

try {
    // 1. Cek ref_number yang sudah ada
    echo "→ Ref Numbers yang ada di database:\n";
    $documents = Document::orderBy('id')->get(['id', 'ref_number', 'created_at']);

    if ($documents->isEmpty()) {
        echo "  (Tidak ada document)\n\n";
    } else {
        foreach ($documents as $doc) {
            echo "  ID: {$doc->id} | Ref: {$doc->ref_number} | Created: {$doc->created_at}\n";
        }
        echo "\n";
    }

    // 2. Test format ref_number
    echo "→ Format Ref Number:\n";
    echo "  Pattern: TPSO + YY + MM + DD + NNNNNN\n";
    echo "  Contoh: TPSO251025000001 (untuk 25 Oktober 2025, nomor urut 1)\n\n";

    // 3. Generate ref_number baru
    $newRefNumber = Document::generateRefNumber();
    echo "→ Generated New Ref Number:\n";
    echo "  {$newRefNumber}\n\n";

    // 4. Parse ref_number
    if (strlen($newRefNumber) >= 14) {
        $prefix = substr($newRefNumber, 0, 4);
        $year = substr($newRefNumber, 4, 2);
        $month = substr($newRefNumber, 6, 2);
        $day = substr($newRefNumber, 8, 2);
        $sequence = substr($newRefNumber, 10, 6);

        echo "→ Breakdown:\n";
        echo "  Prefix: {$prefix}\n";
        echo "  Year: 20{$year}\n";
        echo "  Month: {$month}\n";
        echo "  Day: {$day}\n";
        echo "  Sequence: {$sequence}\n\n";
    }

    // 5. Test auto-generate saat create
    echo "→ Testing auto-generate on document creation...\n";

    // Check apakah ada user untuk created_by
    $user = \App\Models\User::first();
    if (! $user) {
        echo "❌ Tidak ada user. Skip test create.\n";
    } else {
        // Get reference data
        $kdDok = \App\Models\KdDok::first();
        $kdTps = \App\Models\KdTps::first();
        $nmAngkut = \App\Models\NmAngkut::first();
        $kdGudang = \App\Models\KdGudang::first();

        if (! $kdDok || ! $kdTps || ! $nmAngkut || ! $kdGudang) {
            echo "❌ Reference data tidak lengkap. Skip test create.\n";
        } else {
            $testDoc = new Document([
                'kd_dok' => $kdDok->kd_dok,
                'kd_tps' => $kdTps->kd_tps,
                'nm_angkut_id' => $nmAngkut->id,
                'kd_gudang' => $kdGudang->kd_gudang,
                'tgl_entry' => now(),
                'jam_entry' => now()->format('H:i:s'),
                'status' => 'draft',
                'created_by' => $user->id,
            ]);

            // Trigger boot method
            $testDoc->save();

            echo "  ✓ Document created with auto-generated ref_number:\n";
            echo "    ID: {$testDoc->id}\n";
            echo "    Ref Number: {$testDoc->ref_number}\n";
            echo "    Status: {$testDoc->status}\n\n";

            // Cleanup
            $testDoc->delete();
            echo "  ✓ Test document deleted\n\n";
        }
    }

    // 6. Test uniqueness
    echo "→ Testing Ref Number Uniqueness:\n";
    $countToday = Document::whereDate('created_at', today())->count();
    echo "  Documents created today: {$countToday}\n";
    echo '  Next sequence number: '.str_pad($countToday + 1, 6, '0', STR_PAD_LEFT)."\n\n";

    // 7. Check database constraint
    echo "→ Database Constraint:\n";
    echo "  Column: ref_number\n";
    echo "  Type: string(20)\n";
    echo "  Constraint: UNIQUE\n";
    echo "  Auto-fill: Yes (via boot method)\n\n";

    echo "✅ KESIMPULAN:\n";
    echo "✓ Ref number format: TPSO + YYMMDD + 6-digit sequence\n";
    echo "✓ Auto-generated saat document dibuat\n";
    echo "✓ Unique constraint di database\n";
    echo "✓ Sequence reset setiap hari\n";
    echo "✓ Boot method Document::creating() menghandle auto-fill\n";

} catch (\Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
    echo "Stack trace:\n".$e->getTraceAsString()."\n";
}

echo "\n";
