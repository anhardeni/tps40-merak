# Tangki Seeder

## Summary
TangkiSeeder berhasil dibuat dan dijalankan untuk mengisi data tangki ISO Container.

## Statistics
- **Total Tangki**: 25 records
- **Total Documents dengan Tangki**: 8 documents
- **Total Kapasitas**: 519,666 liter
- **Total Isi**: 426,688 liter
- **Average Fill Rate**: ~82%

## Data Generated
Setiap document memiliki 2-4 tangki dengan data:

### Fields Populated:
- **Identitas**: no_tangki, no_bl_awb, no_bc11
- **Consignee**: id_consignee, consignee
- **Lokasi**: pel_muat, pel_transit, pel_bongkar
- **Spesifikasi**: jenis_isi (Liquid/Gas/Chemical/Oil/Fuel), jenis_kemasan (ISO Tank/Tank Container/etc)
- **Kapasitas**: kapasitas (15,000-30,000 L), jumlah_isi (70-95% dari kapasitas)
- **Dimensi**: panjang (6.0-6.5m), lebar (2.4-2.5m), tinggi (2.4-2.6m)
- **Berat**: berat_kosong (2,500-4,000 kg), berat_isi
- **Kondisi**: Baik / Rusak Ringan / Perlu Perbaikan
- **Keamanan**: no_segel_bc, no_segel_perusahaan
- **Lokasi Penempatan**: Gudang A-F dengan nomor

## Usage
`ash
# Run individual seeder
php artisan db:seed --class=TangkiSeeder

# Run all seeders (included in DatabaseSeeder)
php artisan db:seed
`

## Integration
TangkiSeeder sudah ditambahkan ke DatabaseSeeder dengan urutan:
1. ReferenceDataSeeder
2. UserSeeder
3. BeacukaiCredentialSeeder
4. DocumentSeeder
5. **TangkiSeeder** (NEW)

Generated: 2025-10-31 16:39:40
