# REF NUMBER SYSTEM DOCUMENTATION

## Format
```
TPSO + YY + MM + DD + NNNNNN
```

**Contoh:** `TPSO251025000001`
- `TPSO` = Prefix (TPS Online)
- `25` = Year (2025)
- `10` = Month (Oktober)
- `25` = Day (25)
- `000001` = Sequence number (6 digit, daily reset)

## Karakteristik

✓ **Auto-Generated**: Otomatis dibuat saat Document di-create
✓ **Unique**: Database constraint UNIQUE
✓ **Daily Reset**: Sequence number reset setiap hari (mulai dari 000001)
✓ **Fixed Length**: Total 14 karakter
✓ **Read-Only**: Tidak bisa diubah setelah dibuat (UNIQUE constraint)

## Implementasi

### 1. Database Migration
```php
$table->string('ref_number', 20)->unique();
```

### 2. Model Boot Method
```php
protected static function boot()
{
    parent::boot();
    
    static::creating(function ($model) {
        if (empty($model->ref_number)) {
            $model->ref_number = static::generateRefNumber();
        }
    });
}
```

### 3. Generator Method
```php
public static function generateRefNumber(): string
{
    $prefix = 'TPSO'; // 4 karakter
    $year = date('y'); // 2 digit tahun
    $month = date('m'); // 2 digit bulan
    $day = date('d'); // 2 digit hari
    
    // Ambil nomor urut terakhir hari ini
    $lastNumber = static::whereDate('created_at', today())
        ->where('ref_number', 'like', $prefix . $year . $month . $day . '%')
        ->count();
    
    $sequence = str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT);
    
    return $prefix . $year . $month . $day . $sequence;
}
```

## Contoh Penggunaan

### Create Document (Auto-fill)
```php
$document = Document::create([
    'kd_dok' => '1',
    'kd_tps' => 'TPSP01',
    'nm_angkut_id' => 1,
    'kd_gudang' => 'GD01',
    'tgl_entry' => now(),
    'jam_entry' => now()->format('H:i:s'),
    'created_by' => auth()->id(),
]);

// ref_number otomatis: TPSO251025000001
```

### Manual Set (Optional)
```php
$document = new Document();
$document->ref_number = 'CUSTOM123456789'; // Harus unique
$document->kd_dok = '1';
// ... field lainnya
$document->save();
```

## Sequence Examples (Same Day)

Jika ada 3 document dibuat pada 25 Oktober 2025:

1. `TPSO251025000001` (pukul 08:00)
2. `TPSO251025000002` (pukul 10:30)
3. `TPSO251025000003` (pukul 14:45)

Besok (26 Oktober 2025), sequence reset:

1. `TPSO251026000001` (pukul 09:00)

## Query Examples

### Get documents by date
```php
$date = '2025-10-25';
$docs = Document::where('ref_number', 'like', "TPSO{$year}{$month}{$day}%")
    ->get();
```

### Get today's documents
```php
$today = now()->format('ymd'); // 251025
$docs = Document::where('ref_number', 'like', "TPSO{$today}%")
    ->get();
```

### Get last ref_number for today
```php
$lastRef = Document::whereDate('created_at', today())
    ->orderBy('ref_number', 'desc')
    ->value('ref_number');
// Returns: TPSO251025000003
```

## Testing

Run test script:
```bash
php test_refnumber.php
```

## Migration/Fix Script

If old documents have wrong format:
```bash
php fix_refnumber.php
```

This will update all documents to new format based on their `created_at` date.

## Notes

⚠️ **Important:**
- Ref number TIDAK BISA diubah setelah dibuat (UNIQUE constraint)
- Jika ada error duplicate, cek apakah ada ref_number yang sama
- Sequence berdasarkan COUNT, bukan MAX, untuk menghindari gap
- Format HARUS konsisten (14 karakter)

✅ **Best Practices:**
- Biarkan sistem auto-generate
- Jangan manual set kecuali ada kebutuhan khusus
- Gunakan ref_number untuk tracking & auditing
- Include di semua export (XML, JSON, PDF)
