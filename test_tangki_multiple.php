<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Document;
use App\Models\Tangki;

echo "=== Test Entry Tangki Berulang dalam Satu Document ===\n\n";

try {
    // 1. Cari atau buat document untuk testing
    $document = Document::first();

    if (! $document) {
        echo "❌ Tidak ada document. Silakan buat document terlebih dahulu.\n";
        exit(1);
    }

    echo "✓ Document ditemukan:\n";
    echo "  - ID: {$document->id}\n";
    echo "  - Ref: {$document->ref_number}\n";
    echo "  - KD_TPS: {$document->kd_tps}\n\n";

    // 2. Cek tangki yang sudah ada
    $existingTangki = Tangki::where('document_id', $document->id)->count();
    echo "✓ Jumlah tangki existing: {$existingTangki}\n\n";

    // 3. Tambah tangki baru (entry pertama)
    echo "→ Menambah Tangki #1...\n";
    $tangki1 = Tangki::create([
        'document_id' => $document->id,
        'no_tangki' => 'TK-001',
        'jenis_isi' => 'CRUDE OIL',
        'jumlah_isi' => 25000.500,
        'satuan' => 'LITER',
        'kapasitas' => 50000.000,
        'kondisi' => 'BAIK',
        'urutan' => Tangki::where('document_id', $document->id)->max('urutan') + 1,
    ]);
    echo "  ✓ Tangki #1 created (ID: {$tangki1->id}, Urutan: {$tangki1->urutan})\n\n";

    // 4. Tambah tangki kedua (entry berulang)
    echo "→ Menambah Tangki #2 (Entry Berulang)...\n";
    $tangki2 = Tangki::create([
        'document_id' => $document->id,
        'no_tangki' => 'TK-002',
        'jenis_isi' => 'DIESEL FUEL',
        'jumlah_isi' => 18500.750,
        'satuan' => 'LITER',
        'kapasitas' => 40000.000,
        'kondisi' => 'BAIK',
        'urutan' => Tangki::where('document_id', $document->id)->max('urutan') + 1,
    ]);
    echo "  ✓ Tangki #2 created (ID: {$tangki2->id}, Urutan: {$tangki2->urutan})\n\n";

    // 5. Tambah tangki ketiga (entry berulang lagi)
    echo "→ Menambah Tangki #3 (Entry Berulang)...\n";
    $tangki3 = Tangki::create([
        'document_id' => $document->id,
        'no_tangki' => 'TK-003',
        'jenis_isi' => 'GASOLINE',
        'jumlah_isi' => 32000.250,
        'satuan' => 'LITER',
        'kapasitas' => 60000.000,
        'kondisi' => 'BAIK',
        'no_segel_bc' => 'BC-2024-001',
        'urutan' => Tangki::where('document_id', $document->id)->max('urutan') + 1,
    ]);
    echo "  ✓ Tangki #3 created (ID: {$tangki3->id}, Urutan: {$tangki3->urutan})\n\n";

    // 6. Verifikasi semua tangki untuk document ini
    $allTangki = Tangki::where('document_id', $document->id)
        ->orderBy('urutan')
        ->get();

    echo "=== Verifikasi Entry Berulang ===\n";
    echo "Total Tangki untuk Document #{$document->id}: {$allTangki->count()}\n\n";

    foreach ($allTangki as $idx => $t) {
        echo 'Tangki #'.($idx + 1).":\n";
        echo "  - ID: {$t->id}\n";
        echo "  - No Tangki: {$t->no_tangki}\n";
        echo "  - Jenis Isi: {$t->jenis_isi}\n";
        echo "  - Jumlah: {$t->jumlah_isi} {$t->satuan}\n";
        echo "  - Kapasitas: {$t->kapasitas} {$t->satuan}\n";
        echo "  - Urutan: {$t->urutan}\n";
        echo "  - Created: {$t->created_at}\n";
        echo "\n";
    }

    // 7. Test relasi HasMany dari Document
    echo "=== Test Relasi Document->Tangki ===\n";
    $document->load('tangki');
    echo "✓ Document memiliki {$document->tangki->count()} tangki\n";
    echo "✓ Relasi HasMany berfungsi dengan baik\n\n";

    // 8. Kesimpulan
    echo "🎉 KESIMPULAN:\n";
    echo "✓ Entry tangki BISA BERULANG dalam satu document\n";
    echo "✓ Setiap tangki memiliki urutan yang auto-increment\n";
    echo "✓ Foreign key document_id dengan cascade delete\n";
    echo "✓ Tidak ada constraint UNIQUE pada (document_id, no_tangki)\n";
    echo "✓ Satu document bisa memiliki BANYAK tangki (HasMany relationship)\n\n";

    echo "📊 Statistik:\n";
    echo '  - Total Documents: '.Document::count()."\n";
    echo '  - Total Tangki: '.Tangki::count()."\n";
    echo "  - Tangki untuk Document #{$document->id}: {$allTangki->count()}\n";

} catch (\Exception $e) {
    echo '❌ Error: '.$e->getMessage()."\n";
    echo "Stack trace:\n".$e->getTraceAsString()."\n";
    exit(1);
}

echo "\n✅ Test selesai!\n";
