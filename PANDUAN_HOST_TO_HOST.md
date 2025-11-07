# Panduan Penggunaan Host-to-Host Transmission

**Tanggal**: 2 November 2025  
**Versi**: 1.0

## Daftar Isi

1. [Pengenalan](#pengenalan)
2. [Form dan Konfigurasi yang Dibutuhkan](#form-dan-konfigurasi-yang-dibutuhkan)
3. [Cara Menggunakan dari UI](#cara-menggunakan-dari-ui)
4. [Langkah-langkah Detail](#langkah-langkah-detail)
5. [Format Transmisi](#format-transmisi)
6. [Troubleshooting](#troubleshooting)

---

## Pengenalan

Host-to-Host Transmission adalah fitur untuk mengirim dokumen TPS ke sistem Beacukai secara otomatis. Sistem ini mendukung 2 format:

- **XML (SOAP 1.2)** - Format standar menggunakan SOAP
- **JSON (Bearer Token)** - Format modern menggunakan REST API

---

## Form dan Konfigurasi yang Dibutuhkan

### 1. **Halaman Pengaturan Credential** 

Akses: **Settings → Beacukai Credentials** (`/settings/beacukai-credentials`)

#### Form untuk XML SOAP:

| Field | Wajib | Keterangan | Contoh |
|-------|-------|------------|--------|
| **Nama Service** | ✅ | Nama identifikasi | "Host-to-Host XML" |
| **Tipe Service** | ✅ | Pilih: `soap_xml` | soap_xml |
| **Endpoint URL** | ✅ | URL endpoint SOAP | https://tpsonline.beacukai.go.id/tps/service.asmx |
| **Username** | ✅ | Username dari Beacukai | TPSDEMO |
| **Password** | ✅ | Password dari Beacukai | demo123 |
| **Status Aktif** | ✅ | Centang untuk aktifkan | ☑️ Aktif |
| **Mode Test** | ⬜ | Opsional untuk testing | ☐ Test Mode |
| **Deskripsi** | ⬜ | Keterangan tambahan | "Untuk kirim dokumen ke host" |

**Konfigurasi Tambahan** (JSON di field `additional_config`):
```json
{
    "timeout": 30,
    "ssl_cert_path": "certificates/client.pem",
    "ssl_key_path": "certificates/client.key",
    "ssl_verify": true
}
```

#### Form untuk JSON Bearer Token:

| Field | Wajib | Keterangan | Contoh |
|-------|-------|------------|--------|
| **Nama Service** | ✅ | Nama identifikasi | "Host-to-Host JSON" |
| **Tipe Service** | ✅ | Pilih: `json_bearer` | json_bearer |
| **Endpoint URL** | ✅ | URL endpoint JSON | https://tpsonline.beacukai.go.id/api/tps/json |
| **Username** | ✅ | Username dari Beacukai | TPSDEMO |
| **Password** | ✅ | Password dari Beacukai | demo123 |
| **Status Aktif** | ✅ | Centang untuk aktifkan | ☑️ Aktif |
| **Mode Test** | ⬜ | Opsional untuk testing | ☐ Test Mode |

**Konfigurasi Tambahan** (JSON di field `additional_config`):
```json
{
    "auth_endpoint": "https://tpsonline.beacukai.go.id/api/auth/login",
    "refresh_endpoint": "https://tpsonline.beacukai.go.id/api/auth/refresh",
    "token_field": "access_token",
    "refresh_token_field": "refresh_token",
    "expires_in_field": "expires_in",
    "default_expiry": 86400,
    "timeout": 30,
    "ssl_cert_path": "certificates/client.pem",
    "ssl_key_path": "certificates/client.key",
    "ssl_verify": true
}
```

### 2. **Sertifikat SSL** (Jika Diperlukan)

Letakkan file sertifikat di folder: `storage/certificates/`

```
storage/
└── certificates/
    ├── client.pem  (Sertifikat Client)
    └── client.key  (Private Key)
```

**Cara mendapatkan sertifikat:**
- Hubungi tim Beacukai untuk mendapatkan client certificate
- Biasanya berformat `.pem` dan `.key`
- Simpan dengan aman, jangan commit ke git!

---

## Cara Menggunakan dari UI

### **Halaman Detail Dokumen**

Lokasi: **Documents → [Pilih Dokumen] → Detail** (`/documents/{id}`)

#### Screenshot Tampilan:

```
┌─────────────────────────────────────────────────────────────┐
│  Document Details - REF-20231102-001                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status: APPROVED ✅                                        │
│  Ref Number: REF-20231102-001                               │
│  CAR: IDJKT                                                 │
│  Tanggal: 2023-11-02                                        │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Send to Host                                      │    │
│  │                                                    │    │
│  │  Format: [▼ XML]  atau  [▼ JSON]                 │    │
│  │                                                    │    │
│  │  [ Send to Host ]                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Langkah-langkah:

**Step 1: Pastikan Dokumen APPROVED**
- Hanya dokumen dengan status `APPROVED` yang bisa dikirim
- Status dokumen harus hijau/centang

**Step 2: Pilih Format**
- Dropdown **Format**: Pilih `XML` atau `JSON`
- **XML**: Untuk sistem lama/standar (SOAP)
- **JSON**: Untuk sistem baru/modern (REST API)

**Step 3: Klik "Send to Host"**
- Tombol akan disabled saat proses kirim
- Loading indicator muncul
- Tunggu sampai selesai (biasanya 1-3 detik)

**Step 4: Lihat Hasil**
- ✅ **Sukses**: Muncul notifikasi hijau "Document sent successfully"
- ❌ **Gagal**: Muncul notifikasi merah dengan error message

---

## Langkah-langkah Detail

### A. **Persiapan Awal**

#### 1. Setup Credentials (Admin Only)

```
Navigasi: Dashboard → Settings → Beacukai Credentials
```

**a. Tambah Credential XML:**
- Klik tombol "Add New Credential"
- Isi form:
  - Service Name: `Host-to-Host XML`
  - Service Type: Pilih `soap_xml`
  - Endpoint URL: `https://tpsonline.beacukai.go.id/tps/service.asmx`
  - Username: (dari Beacukai)
  - Password: (dari Beacukai)
  - Centang "Active"
- Klik "Save"

**b. Tambah Credential JSON:**
- Klik tombol "Add New Credential"
- Isi form:
  - Service Name: `Host-to-Host JSON`
  - Service Type: Pilih `json_bearer`
  - Endpoint URL: `https://tpsonline.beacukai.go.id/api/tps/json`
  - Username: (dari Beacukai)
  - Password: (dari Beacukai)
  - Centang "Active"
- Klik "Advanced Settings"
  - Auth Endpoint: `https://tpsonline.beacukai.go.id/api/auth/login`
  - Refresh Endpoint: `https://tpsonline.beacukai.go.id/api/auth/refresh`
- Klik "Save"

#### 2. Upload SSL Certificates (Jika Diperlukan)

```bash
# Via File Manager atau FTP
# Upload ke: storage/certificates/

client.pem
client.key
```

#### 3. Test Connection

Di halaman Beacukai Credentials:
- Klik tombol "Test Connection" pada masing-masing credential
- Pastikan status: ✅ **Connected** (hijau)

---

### B. **Mengirim Dokumen**

#### 1. Buat/Approve Dokumen

```
Navigasi: Documents → Create New Document
```

**Isi data dokumen:**
- Ref Number: (auto-generate atau manual)
- CAR: `IDJKT`
- Tanggal: (pilih tanggal)
- Upload file dokumen
- Pilih tangki (jika barang curah)
- Isi detail barang

**Approve dokumen:**
- Setelah data lengkap, klik "Submit for Approval"
- Admin approve: Documents → [Pilih dokumen] → "Approve"
- Status berubah menjadi **APPROVED** ✅

#### 2. Kirim ke Host

```
Navigasi: Documents → [Pilih dokumen APPROVED] → Detail
```

**Pilih format transmisi:**

**Untuk XML (Rekomendasi untuk sistem standar):**
1. Dropdown Format: Pilih **XML**
2. Klik "Send to Host"
3. Sistem akan:
   - Generate XML dari data dokumen
   - Wrap dalam SOAP 1.2 envelope
   - Kirim ke endpoint Beacukai
   - Parse response
   - Update status dokumen

**Untuk JSON (Untuk sistem modern):**
1. Dropdown Format: Pilih **JSON**
2. Klik "Send to Host"
3. Sistem akan:
   - Login ke Beacukai (jika belum ada token)
   - Cache token (valid 24 jam)
   - Generate JSON dari data dokumen
   - Kirim dengan Bearer token
   - Auto-refresh token jika expired
   - Update status dokumen

#### 3. Monitoring Status

Setelah pengiriman, di halaman detail dokumen akan muncul:

```
┌──────────────────────────────────────────────────────┐
│  Transmission History                                │
├──────────────────────────────────────────────────────┤
│  ✅ Sent to Host                                     │
│  Format: XML                                         │
│  Transmitter: XML SOAP 1.2 Transmitter               │
│  Response Time: 1234.56 ms                           │
│  Transmission Size: 12.34 KB                         │
│  Sent At: 2023-11-02 10:30:15                        │
│                                                      │
│  Host Response:                                      │
│  "Document received successfully"                    │
└──────────────────────────────────────────────────────┘
```

---

## Format Transmisi

### **Format XML (SOAP 1.2)**

**Kapan digunakan:**
- ✅ Sistem Beacukai standar/lama
- ✅ Requirement dari Beacukai: SOAP
- ✅ Sudah ada infrastruktur SOAP
- ✅ Kompatibilitas maksimal

**Struktur yang dikirim:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
        <CoCoTangki xmlns="http://services.beacukai.go.id/">
            <fStream><![CDATA[
                <DOCUMENT>
                    <HEADER>
                        <CAR>IDJKT</CAR>
                        <Ref_number>REF-20231102-001</Ref_number>
                        <!-- ... data lainnya ... -->
                    </HEADER>
                </DOCUMENT>
            ]]></fStream>
            <Username>TPSDEMO</Username>
            <Password>demo123</Password>
        </CoCoTangki>
    </soap12:Body>
</soap12:Envelope>
```

**Kelebihan:**
- Standar industri
- Error handling robust
- Kompatibilitas tinggi

**Kekurangan:**
- Ukuran data lebih besar
- Parsing lebih kompleks

---

### **Format JSON (Bearer Token)**

**Kapan digunakan:**
- ✅ Sistem Beacukai modern/baru
- ✅ REST API tersedia
- ✅ Performa lebih cepat
- ✅ Data lebih ringkas

**Struktur yang dikirim:**
```json
{
    "CAR": "IDJKT",
    "Ref_number": "REF-20231102-001",
    "Kd_doc": "23",
    "Kd_doc_inout": "1",
    "No_dok": "DOC001",
    "Tgl_dok": "2023-11-02",
    "containers": [
        {
            "No_cont": "CONT001",
            "Size": "20",
            "Jns_muat": "FCL"
        }
    ]
}
```

**Authentication Flow:**
1. **Login** (sekali):
   ```json
   POST /api/auth/login
   {
       "username": "TPSDEMO",
       "password": "demo123"
   }
   → Response: { "access_token": "eyJhbGc...", "refresh_token": "..." }
   ```

2. **Send Document** (dengan token):
   ```json
   POST /api/tps/json
   Headers: Authorization: Bearer eyJhbGc...
   Body: { ... data dokumen ... }
   ```

3. **Auto Refresh** (otomatis saat token expired):
   ```json
   POST /api/auth/refresh
   {
       "refresh_token": "dGhpcyBp..."
   }
   → Response: { "access_token": "new_token...", "refresh_token": "..." }
   ```

**Kelebihan:**
- Data lebih ringkas (lebih kecil 30-40%)
- Performa lebih cepat
- Modern & developer-friendly
- Token caching otomatis

**Kekurangan:**
- Butuh endpoint JSON di Beacukai
- Dependency pada token lifecycle

---

## Troubleshooting

### 1. **Error: "No active credential found"**

**Penyebab:**
- Credential belum di-setup
- Credential tidak aktif (unchecked)

**Solusi:**
```
1. Buka: Settings → Beacukai Credentials
2. Pastikan ada credential dengan service_type: soap_xml atau json_bearer
3. Pastikan checkbox "Active" tercentang ✅
4. Klik "Save"
```

---

### 2. **Error: "Only approved documents can be sent"**

**Penyebab:**
- Dokumen belum di-approve
- Status masih DRAFT atau PENDING

**Solusi:**
```
1. Buka halaman dokumen
2. Klik "Submit for Approval" (jika masih draft)
3. Admin approve dokumen
4. Status harus berubah menjadi APPROVED ✅
5. Coba kirim lagi
```

---

### 3. **Error: "Document already sent to host"**

**Penyebab:**
- Dokumen sudah pernah dikirim sebelumnya
- Field `sent_to_host` = true

**Solusi:**
```
Jika memang perlu kirim ulang (jarang):
1. Via Tinker/Database:
   UPDATE documents SET sent_to_host = 0 WHERE id = 123;
2. Atau buat dokumen baru
```

---

### 4. **Error: "SSL certificate problem"**

**Penyebab:**
- Certificate tidak ada di `storage/certificates/`
- Path salah
- Certificate expired

**Solusi:**
```
1. Pastikan file ada:
   storage/certificates/client.pem
   storage/certificates/client.key

2. Update credential config:
   {
       "ssl_cert_path": "certificates/client.pem",
       "ssl_key_path": "certificates/client.key",
       "ssl_verify": true
   }

3. Untuk testing, bisa disable verify:
   "ssl_verify": false
   (JANGAN untuk production!)
```

---

### 5. **Error: "Connection timeout"**

**Penyebab:**
- Network issue
- Endpoint tidak bisa diakses
- Firewall blocking

**Solusi:**
```
1. Check koneksi internet
2. Ping endpoint:
   ping tpsonline.beacukai.go.id
3. Check firewall/proxy settings
4. Tingkatkan timeout di config:
   "timeout": 60  (default: 30)
```

---

### 6. **Error: "401 Unauthorized" (JSON)**

**Penyebab:**
- Token expired
- Token invalid
- Username/password salah

**Solusi:**
```
OTOMATIS:
- Sistem akan auto-refresh token
- Jika gagal, akan login ulang

MANUAL (jika perlu):
Via Tinker:
$cred = BeacukaiCredential::where('service_type', 'json_bearer')->first();
$tokenManager = app(TokenManager::class);
$tokenManager->clearToken($cred);
$token = $tokenManager->getValidToken($cred);
```

---

### 7. **Error: "Invalid format"**

**Penyebab:**
- Data dokumen tidak lengkap
- Field required kosong

**Solusi:**
```
1. Pastikan data dokumen lengkap:
   - Ref Number ✅
   - CAR ✅
   - Tanggal ✅
   - Nomor Dokumen ✅
   - Detail barang ✅

2. Check validasi:
   - Tangki (untuk barang curah)
   - Container (untuk container)
   - Data harus sesuai master data
```

---

## Tips & Best Practices

### ✅ **DO's**

1. **Selalu test di mode test dulu**
   - Centang "Test Mode" di credential
   - Test dengan dokumen dummy
   - Pastikan tidak ada error

2. **Monitor logs secara berkala**
   ```bash
   # Via terminal
   tail -f storage/logs/laravel.log | grep "HostTransmission"
   ```

3. **Gunakan XML untuk kompatibilitas maksimal**
   - Lebih aman untuk sistem lama
   - Lebih tested

4. **Setup notification untuk error**
   - Email notification saat gagal kirim
   - Alert ke admin

5. **Backup credential secara aman**
   - Export credential (tanpa password)
   - Simpan di password manager

### ❌ **DON'Ts**

1. **Jangan commit certificate ke git**
   ```
   # Add to .gitignore
   storage/certificates/*.pem
   storage/certificates/*.key
   ```

2. **Jangan disable SSL verify di production**
   ```json
   // JANGAN ini di production:
   "ssl_verify": false
   ```

3. **Jangan hardcode credential**
   - Selalu gunakan database
   - Jangan di .env

4. **Jangan kirim dokumen yang sama 2x**
   - Check `sent_to_host` flag
   - Validasi di UI

---

## Alur Lengkap

```
┌─────────────────────────────────────────────────────────────┐
│  1. SETUP (Admin - Sekali Saja)                             │
├─────────────────────────────────────────────────────────────┤
│  - Buat credential XML di Settings                          │
│  - Buat credential JSON di Settings                         │
│  - Upload SSL certificates (jika perlu)                     │
│  - Test connection                                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  2. BUAT DOKUMEN (User)                                     │
├─────────────────────────────────────────────────────────────┤
│  - Isi form dokumen                                         │
│  - Upload file                                              │
│  - Pilih tangki/container                                   │
│  - Submit for approval                                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  3. APPROVE (Admin)                                         │
├─────────────────────────────────────────────────────────────┤
│  - Review dokumen                                           │
│  - Klik "Approve"                                           │
│  - Status → APPROVED ✅                                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  4. SEND TO HOST (User/Admin)                               │
├─────────────────────────────────────────────────────────────┤
│  - Buka detail dokumen                                      │
│  - Pilih format: XML atau JSON                              │
│  - Klik "Send to Host"                                      │
│  - Tunggu response (1-3 detik)                              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  5. PROSES OTOMATIS (System)                                │
├─────────────────────────────────────────────────────────────┤
│  [XML Flow]                  [JSON Flow]                    │
│  - Generate XML              - Check token cache            │
│  - Wrap in SOAP envelope     - Login if needed              │
│  - Add credentials           - Generate JSON                │
│  - Send via HTTP POST        - Send with Bearer token       │
│  - Parse SOAP response       - Auto-refresh if 401          │
│                                                             │
│  [Retry Mechanism - Both]                                   │
│  - Max 3 attempts                                           │
│  - Delays: 1s → 3s → 9s                                     │
│  - Smart retry logic                                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  6. HASIL                                                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ SUKSES:                                                 │
│     - Status dokumen updated                                │
│     - sent_to_host = true                                   │
│     - sent_at = now()                                       │
│     - host_response disimpan                                │
│     - Notifikasi hijau                                      │
│                                                             │
│  ❌ GAGAL:                                                  │
│     - Error message ditampilkan                             │
│     - Log error tersimpan                                   │
│     - Status tetap (tidak berubah)                          │
│     - Notifikasi merah                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Pertanyaan Umum (FAQ)

### Q1: Format mana yang harus saya pilih?

**A:** Tergantung requirement dari Beacukai:
- Jika Beacukai minta SOAP → Gunakan **XML**
- Jika Beacukai support REST API → Gunakan **JSON** (lebih cepat)
- Jika ragu → Gunakan **XML** (lebih universal)

### Q2: Berapa lama token JSON berlaku?

**A:** Token JSON berlaku **24 jam** (86400 detik). Sistem akan otomatis refresh 5 menit sebelum expired.

### Q3: Apakah bisa kirim ulang dokumen yang sudah terkirim?

**A:** Tidak disarankan. Tapi jika memang diperlukan, admin bisa reset flag `sent_to_host` via database.

### Q4: Bagaimana cara tahu pengiriman berhasil?

**A:** Cek di halaman detail dokumen:
- Status "Sent to Host" = ✅
- Ada info "Transmission History"
- Field `sent_at` terisi

### Q5: Apakah perlu SSL certificate?

**A:** Tergantung requirement Beacukai:
- Untuk **Mutual TLS** → Wajib SSL certificate
- Untuk testing → Bisa disable `ssl_verify`
- Untuk production → Sangat disarankan pakai SSL

---

## Kontak Support

Jika mengalami kendala:

1. **Check logs**: `storage/logs/laravel.log`
2. **Test connection**: Via halaman Beacukai Credentials
3. **Clear cache**: `php artisan cache:clear`
4. **Contact admin**: Hubungi administrator sistem

---

**Semoga panduan ini membantu!** 🚀

