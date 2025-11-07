# Document Seeding - Completed ✅

## Overview
Document seeder telah berhasil dibuat dan dijalankan. Total 8 sample documents telah ditambahkan ke database dengan berbagai status, jenis dokumen, dan metode transportasi.

## Sample Documents Created

### Document Summary by Status

| Status | Count | Description |
|--------|-------|-------------|
| **Draft** | 2 | Dokumen masih dalam tahap draft, belum disubmit |
| **Submitted** | 4 | Dokumen sudah disubmit, menunggu proses |
| **Completed** | 2 | Dokumen sudah selesai diproses, termasuk gate out |

### Document Details

#### 1. TPSO251031000001 - BC 1.1 (Submitted)
- **Status**: Submitted ✅
- **Jenis**: BC 1.1 - Pemberitahuan Pabean Impor
- **TPS**: TPS Laut
- **Angkutan**: MV. EVER GIVEN (VOY-001)
- **Gudang**: G001
- **Tanggal Entry**: 5 hari yang lalu
- **Keterangan**: Impor barang elektronik dari China
- **SPPB**: SPPB-20251031-001
- **Sent to Host**: ✅ Yes

#### 2. TPSO251031000002 - BC 1.2 (Draft)
- **Status**: Draft 📝
- **Jenis**: BC 1.2 - Impor dengan nilai > USD 5000
- **TPS**: TPS Laut
- **Angkutan**: MV. MAERSK LINE (VOY-002)
- **Gudang**: G002
- **Tanggal Entry**: 3 hari yang lalu
- **Keterangan**: Impor spare part mesin industri
- **SPPB**: Belum ada
- **Sent to Host**: ❌ No

#### 3. TPSO251031000003 - BC 2.0 (Completed)
- **Status**: Completed ✅
- **Jenis**: BC 2.0 - Pemberitahuan Ekspor Barang
- **TPS**: TPS Udara
- **Angkutan**: GARUDA INDONESIA (GA-401)
- **Gudang**: G003
- **Tanggal Entry**: 7 hari yang lalu
- **Tanggal Gate Out**: 6 hari yang lalu
- **Keterangan**: Ekspor produk tekstil ke Jepang
- **SPPB**: SPPB-EXP-20251031-001
- **Sent to Host**: ✅ Yes

#### 4. TPSO251031000004 - BC 2.3 (Submitted)
- **Status**: Submitted ✅
- **Jenis**: BC 2.3 - Pemberitahuan Ekspor Barang Penimbunan
- **TPS**: TPS Laut
- **Angkutan**: MV. CMA CGM (VOY-CMA-003)
- **Gudang**: G001
- **Tanggal Entry**: 2 hari yang lalu
- **Keterangan**: Ekspor CPO (Crude Palm Oil) ke India
- **SPPB**: SPPB-20251031-002
- **Sent to Host**: ✅ Yes

#### 5. TPSO251031000005 - BC 1.1 (Draft)
- **Status**: Draft 📝
- **Jenis**: BC 1.1 - Pemberitahuan Pabean Impor
- **TPS**: TPS Darat
- **Angkutan**: TRUCK CONTAINER (No. Pol: B 1234 XYZ)
- **Gudang**: G005
- **Tanggal Entry**: 1 hari yang lalu
- **Keterangan**: Impor barang dari Malaysia via darat
- **SPPB**: Belum ada
- **Sent to Host**: ❌ No

#### 6. TPSO251031000006 - BC 4.0 (Submitted)
- **Status**: Submitted ✅
- **Jenis**: BC 4.0 - Pemberitahuan Reekspor
- **TPS**: TPS Laut
- **Angkutan**: MV. COSCO SHIPPING (COSCO-004)
- **Gudang**: G002
- **Tanggal Entry**: Hari ini
- **Keterangan**: Reekspor barang reject quality
- **SPPB**: SPPB-RE-20251031-001
- **Sent to Host**: ✅ Yes

#### 7. TPSO251031000007 - BC 1.1 (Completed - Tangki)
- **Status**: Completed ✅
- **Jenis**: BC 1.1 - Pemberitahuan Pabean Impor
- **TPS**: TPS Laut
- **Angkutan**: MV. EVER GIVEN (VOY-005)
- **Gudang**: TANK (Gudang Tangki)
- **Tanggal Entry**: 10 hari yang lalu
- **Tanggal Gate Out**: 8 hari yang lalu
- **Keterangan**: Impor minyak mentah (crude oil) untuk refinery
- **SPPB**: SPPB-TANK-20251031-001
- **Sent to Host**: ✅ Yes
- **Note**: Dokumen ini khusus untuk barang curah cair yang menggunakan tangki

#### 8. TPSO251031000008 - BC 2.0 (Submitted)
- **Status**: Submitted ✅
- **Jenis**: BC 2.0 - Pemberitahuan Ekspor Barang
- **TPS**: TPS Udara
- **Angkutan**: LION AIR CARGO (JT-610)
- **Gudang**: G004
- **Tanggal Entry**: 1 hari yang lalu
- **Keterangan**: Ekspor kerajinan tangan ke Singapore
- **SPPB**: SPPB-AIR-20251031-001
- **Sent to Host**: ❌ No

## Document Coverage

### Jenis Dokumen Tercakup:
- ✅ BC 1.1 - Pemberitahuan Pabean Impor (3 dokumen)
- ✅ BC 1.2 - Impor dengan nilai > USD 5000 (1 dokumen)
- ✅ BC 2.0 - Pemberitahuan Ekspor Barang (2 dokumen)
- ✅ BC 2.3 - Pemberitahuan Ekspor Barang Penimbunan (1 dokumen)
- ✅ BC 4.0 - Pemberitahuan Reekspor (1 dokumen)

### Jenis TPS Tercakup:
- ✅ TPS Laut (TPSL) - 5 dokumen
- ✅ TPS Udara (TPSU) - 2 dokumen
- ✅ TPS Darat (TPSD) - 1 dokumen

### Jenis Angkutan Tercakup:
- ✅ Kapal Laut: MV. EVER GIVEN, MV. MAERSK LINE, MV. CMA CGM, MV. COSCO SHIPPING
- ✅ Pesawat: GARUDA INDONESIA, LION AIR CARGO
- ✅ Truk: TRUCK CONTAINER

### Gudang Tercakup:
- ✅ G001, G002, G003, G004, G005
- ✅ TANK (Gudang Tangki untuk curah cair)

## Data Struktur

### SPPB Data Example:
```json
{
  "no_sppb": "SPPB-20251031-001",
  "tgl_sppb": "2025-10-27",
  "npwp": "01.234.567.8-901.000",
  "nama_importir": "PT ELEKTRONIK SEJAHTERA"
}
```

### Host Response Example:
```json
{
  "status": "OK",
  "message": "Data berhasil dikirim",
  "response_code": "200"
}
```

## Reference Number Format

Format: `TPSO + YY + MM + DD + NNNNNN`
- **TPSO**: Prefix (TPS Online)
- **YY**: 2 digit tahun (25 = 2025)
- **MM**: 2 digit bulan (10 = Oktober)
- **DD**: 2 digit tanggal (31)
- **NNNNNN**: 6 digit nomor urut (000001, 000002, dst)

Contoh: `TPSO251031000001`

## How to Run

### Run Document Seeder Only:
```bash
php artisan db:seed --class=DocumentSeeder
```

### Run All Seeders (Including Documents):
```bash
php artisan db:seed
```

### Fresh Migration with All Seeds:
```bash
php artisan migrate:fresh --seed
```

## Database Verification

Verifikasi data document di database:

```sql
-- Lihat semua dokumen
SELECT ref_number, kd_dok, status, tgl_entry FROM documents;

-- Hitung berdasarkan status
SELECT status, COUNT(*) as total FROM documents GROUP BY status;

-- Lihat dengan join ke tabel lain
SELECT 
    d.ref_number, 
    d.status, 
    kd.nm_dok, 
    kt.nm_tps, 
    na.nm_angkut, 
    d.keterangan 
FROM documents d
JOIN kd_dok kd ON d.kd_dok = kd.kd_dok
JOIN kd_tps kt ON d.kd_tps = kt.kd_tps
JOIN nm_angkut na ON d.nm_angkut_id = na.id;
```

## Files Created/Modified

### Seeder Files:
- ✅ `database/seeders/DocumentSeeder.php` - Document seeder dengan 8 sample documents
- ✅ `database/seeders/DatabaseSeeder.php` - Updated to include DocumentSeeder

### Dependencies:
Seeder ini memerlukan data dari:
- ✅ `ReferenceDataSeeder` - Untuk kd_dok, kd_tps, kd_gudang, nm_angkut
- ✅ `UserSeeder` - Untuk created_by dan updated_by

## Testing Scenarios

Document yang dibuat mencakup berbagai skenario testing:

1. **Draft Documents** - Untuk test create & edit dokumen
2. **Submitted Documents** - Untuk test approval workflow
3. **Completed Documents** - Untuk test gate out & laporan
4. **Import Documents** - Untuk test alur impor barang
5. **Export Documents** - Untuk test alur ekspor barang
6. **Sea Transport** - Untuk test angkutan laut
7. **Air Transport** - Untuk test angkutan udara
8. **Land Transport** - Untuk test angkutan darat
9. **Tank Storage** - Untuk test penyimpanan curah cair di tangki
10. **SPPB Integration** - Untuk test integrasi dengan sistem SPPB

## Next Steps

1. **Test Document List**: Buka halaman documents dan verifikasi semua data tampil dengan benar
2. **Test Document Detail**: Klik salah satu dokumen untuk melihat detail lengkap
3. **Test Export**: Test export XML/JSON dari dokumen yang sudah ada
4. **Test Filters**: Test filter berdasarkan status, tanggal, jenis dokumen
5. **Create Tangki Data**: Untuk dokumen TPSO251031000007 (tangki), bisa ditambahkan data tangki

---
**Generated**: 2025-10-31
**Total Documents**: 8
**Status**: ✅ COMPLETED
