# TPS Online - Sistem Manajemen Tempat Penimbunan Sementara

## 🚀 Overview

Aplikasi TPS (Tempat Penimbunan Sementara) Online adalah sistem manajemen dokumen untuk kepabeanan yang dibangun dengan Laravel sebagai backend dan React sebagai frontend. Sistem ini mengelola dokumen tangki dengan integrasi SOAP untuk layanan Bea Cukai.

## 🏗️ Teknologi Stack

### Backend
- **Laravel 11.x** - PHP Framework
- **MariaDB/SQLite** - Database
- **Guzzle HTTP Client** - SOAP Integration
- **Inertia.js** - SPA Bridge

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon Library
- **React Hook Form** - Form Management
- **Zod** - Validation Schema

## 📋 Fitur Utama

### ✅ Completed Features

1. **Manajemen Dokumen TPS**
   - ✅ CRUD dokumen dengan validasi lengkap
   - ✅ Multiple tangki per dokumen
   - ✅ Status workflow (Draft → Submitted → Approved/Rejected)
   - ✅ Auto-generated reference number format: AAAAYYMMDDNNNNNN

2. **UI/UX Modern**
   - ✅ Dark mode support dengan theme toggle
   - ✅ Responsive design untuk mobile & desktop
   - ✅ Form validation dengan real-time feedback
   - ✅ Professional dashboard dengan quick actions

3. **Database Structure**
   - ✅ 6 tabel referensi (kd_dok, kd_tps, nm_angkut, kd_gudang, dll)
   - ✅ Tabel dokumen dengan foreign key relationships
   - ✅ Tabel tangki dengan detail lengkap sesuai cocotanki.xml
   - ✅ Audit trail dan user tracking

4. **SOAP Integration Framework**
   - ✅ SoapClientService untuk CekDataSPPB & CekDataSPPB_TPB
   - ✅ XML/JSON Generator sesuai format cocotanki.xml
   - ✅ Comprehensive logging untuk debugging

5. **Export & Preview**
   - ✅ XML export dengan struktur DOCUMENT → COCOTANGKI → HEADER/DETIL
   - ✅ JSON export untuk API integration
   - ✅ Preview functionality dalam browser
   - ✅ Download ke file (.xml/.json)

6. **RBAC (Role-Based Access Control)**
   - ✅ Role & Permission models lengkap dengan relationships
   - ✅ Middleware authorization dengan admin bypass pattern
   - ✅ User Management UI lengkap (CRUD + role assignment)
   - ✅ Permission Management UI lengkap (CRUD)
   - ✅ Role Management UI lengkap (CRUD + permission assignment)
   - ✅ 26 protected admin routes dengan permission checks
   - ✅ 4 users, 3 roles, 3 permissions active dalam database
   - ✅ Dynamic sidebar menu berdasarkan user permissions

7. **Beacukai Credentials Management**
   - ✅ CRUD untuk mengelola SOAP/API credentials
   - ✅ Encrypted password storage dengan Laravel Crypt
   - ✅ Test connection button untuk validasi credentials
   - ✅ Support multiple service types (SOAP, REST, GraphQL)
   - ✅ Environment mode (Production/Test)
   - ✅ Usage tracking dan last tested timestamp
   - ✅ Integration dengan SoapClientService

### 🔄 In Progress Features

1. **Advanced Features**
   - 🔄 Host-to-host transmission
   - 🔄 Reporting & analytics module
   - 🔄 Batch operations
   - 🔄 Email notifications

### 📝 TODO List (Priority)

1. **🔧 Database Schema Fix**
   - 🔴 Perbaikan relasi tabel di tangki
   - Review foreign keys dan relationships
   - Optimize database constraints

2. **🎨 UI/UX Improvements**
   - 🔴 Update tampilan form tangki dengan elemen baru
   - Improve user experience untuk input data tangki
   - Add validation feedback yang lebih baik

3. **📊 Business Process Update**
   - 🔴 Review dan update workflow proses bisnis
   - Diskusi requirement baru dari stakeholder
   - Update status dan approval flow

## 🔄 Updated Business Process Flow

### Document Lifecycle with Re-submission

```
1. DRAFT
   └─> User creates document & tangki
   └─> Can freely edit/add/delete tangki
   └─> Submit button available
       ↓
2. PENDING_APPROVAL
   └─> Waiting for supervisor/manager approval
   └─> Read-only (cannot edit)
   └─> Can be approved or rejected
       ↓
3a. APPROVED → Ready to send to Bea Cukai
       ↓
4. SENT_TO_BEACUKAI
   └─> Transmitted via SOAP/API
   └─> Waiting for response
   └─> Read-only
       ↓
5. COMPLETED
   └─> Successfully processed by Bea Cukai
   └─> **CAN BE UNLOCKED FOR EDITING**
   └─> "Edit Tangki" button available
       ↓
6. [CYCLE REPEATS] Edit tangki → PENDING_APPROVAL → APPROVED → SENT → COMPLETED

3b. REJECTED
   └─> Back to DRAFT
   └─> User can revise and resubmit
```

### Key Features:

**✅ Post-Completion Editing**
- Documents in COMPLETED status can be unlocked for editing
- Full CRUD on tangki (create, edit, delete)
- Simple overwrite strategy (no versioning)
- Changes tracked in audit log

**✅ Approval Workflow**
- Every re-submission requires approval
- Supervisor/Manager must review changes
- Can approve or reject modifications

**✅ Unlimited Re-submissions**
- No limit on how many times document can be edited
- Each edit cycle follows same approval flow
- Full audit trail maintained

**✅ Audit Logging**
- Track all tangki changes (insert/update/delete)
- Record who made changes and when
- Store before/after values
- Maintain complete history

**❌ No Notifications**
- No email or in-app notifications
- Users check status manually

## 🗃️ Database Schema

### Core Tables

#### documents
- `ref_number` - Auto-generated AAAAYYMMDDNNNNNN
- `kd_dok`, `kd_tps`, `nm_angkut_id`, `kd_gudang` - Foreign keys ke tabel referensi
- `no_pol`, `no_voy_flight`, `tgl_entry`, `tgl_tiba`, dll - Header fields
- `status` - DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, SENT_TO_BEACUKAI, COMPLETED
- `is_locked` - Boolean flag untuk edit protection
- `last_sent_at` - Timestamp terakhir kirim ke Bea Cukai
- `completed_at` - Timestamp saat completed
- `username`, `submitted_at` - Audit fields

#### tangki (Detail per dokumen)
- `no_tangki`, `jenis_isi`, `kapasitas`, `jumlah_isi` - Core info
- `no_bl_awb`, `consignee`, `no_bc11` - Shipping details
- `pel_muat`, `pel_transit`, `pel_bongkar` - Port information
- `kondisi`, `lokasi_penempatan` - Status fields

#### Reference Tables
- `kd_dok` - Kode dokumen
- `kd_tps` - Kode TPS
- `nm_angkut` - Nama angkutan dengan call_sign
- `kd_gudang` - Kode gudang

## 📁 Struktur File Frontend

```
resources/js/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── textarea.tsx
│   └── forms/
│       └── DocumentForm.tsx   # Main document form
├── contexts/
│   └── ThemeContext.tsx       # Dark mode context
├── Pages/
│   └── Documents/
│       ├── Index.tsx          # Document listing
│       ├── Create.tsx         # Create document
│       ├── Edit.tsx           # Edit document
│       └── Show.tsx           # View document detail
└── layouts/
    └── app-layout.tsx         # Main application layout
```

## 🚀 Installation & Setup

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MariaDB/MySQL atau SQLite

### Installation Steps

1. **Clone & Install Dependencies**
```bash
# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install
```

2. **Environment Configuration**
```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

3. **Database Setup**
```bash
# Run migrations
php artisan migrate

# Seed reference data
php artisan db:seed --class=ReferenceDataSeeder

# Create demo users (optional)
php artisan db:seed --class=DemoUserSeeder
```

4. **Build Frontend**
```bash
# Development build
npm run dev

# Production build
npm run build
```

5. **Start Development Server**
```bash
# Laravel development server
php artisan serve

# Vite development server (separate terminal)
npm run dev
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tps_online
DB_USERNAME=root
DB_PASSWORD=

# SOAP Configuration
SOAP_TPS_URL=https://tpsonline.beacukai.go.id/tps/service.asmx
SOAP_USERNAME=your_soap_username
SOAP_PASSWORD=your_soap_password

# WorkOS Authentication (if using)
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
```

## 📊 API Endpoints

### Document Management
```http
GET    /documents              # List documents
POST   /documents              # Create document
GET    /documents/{id}         # Show document
PUT    /documents/{id}         # Update document
DELETE /documents/{id}         # Delete document
POST   /documents/{id}/submit  # Submit document
```

### Export API
```http
GET /api/export/documents/{id}/preview/xml   # Preview XML
GET /api/export/documents/{id}/preview/json  # Preview JSON
GET /api/export/documents/{id}/download/xml  # Download XML
GET /api/export/documents/{id}/download/json # Download JSON
```

### SOAP Integration
```http
POST /api/soap/check-sppb     # Check SPPB data
POST /api/soap/check-sppb-tpb # Check SPPB TPB data
```

## 🧪 Testing

### Frontend Testing
```bash
# Type checking
npm run type-check

# Build test
npm run build
```

### Backend Testing
```bash
# Run PHP tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

## 📋 Usage Guide

### Creating a Document

1. **Navigate to Documents**
   - Go to `/documents` or click "Lihat Semua Dokumen" from dashboard

2. **Create New Document**
   - Click "Tambah Dokumen" button
   - Fill required header information:
     - Kode Dokumen (dropdown)
     - Kode TPS (dropdown) 
     - Nama Angkutan (dropdown)
     - Kode Gudang (dropdown)
     - Tanggal & Jam Entry

3. **Add Tangki Details**
   - At least 1 tangki required
   - Fill mandatory fields: No. Tangki, Jenis Isi, Kapasitas, Jumlah Isi, Satuan
   - Optional fields: dimensions, weights, seals, dates, etc.
   - Use "Tambah Tangki" for multiple tanks

4. **Save & Submit**
   - Save as Draft for later editing
   - Submit for approval workflow

### Document Status Workflow

1. **DRAFT** - Editable, can add/remove tangki freely
2. **PENDING_APPROVAL** - Waiting for supervisor approval, read-only
3. **APPROVED** - Approved by supervisor, ready to send to Bea Cukai
4. **SENT_TO_BEACUKAI** - Transmitted to Bea Cukai, waiting response
5. **COMPLETED** - Successfully processed, can be unlocked for editing
6. **REJECTED** - Rejected by supervisor, back to DRAFT for revision

**Post-Completion Flow:**
- COMPLETED documents can be unlocked
- Edit/add/delete tangki as needed
- Re-submit → goes through approval again → can be sent again
- Cycle can repeat unlimited times
- Full audit trail maintained

### XML/JSON Export

- **Preview** - View generated format in browser
- **Download** - Save file to local system
- **XML Format** - Follows cocotanki.xml structure with DOCUMENT → COCOTANGKI → HEADER/DETIL

## 🔍 Troubleshooting

### Common Issues

1. **Migration Errors**
   ```bash
   # Reset database if needed
   php artisan migrate:fresh --seed
   ```

2. **Build Errors**
   ```bash
   # Clear caches
   npm run build
   php artisan optimize:clear
   ```

3. **Permission Issues**
   ```bash
   # Fix storage permissions (Linux/Mac)
   chmod -R 775 storage
   chmod -R 775 bootstrap/cache
   ```

## 🚀 Production Deployment

### Server Requirements
- PHP 8.2+ with extensions: mbstring, xml, gd, mysql/sqlite
- Nginx/Apache web server
- MariaDB 10.3+ or MySQL 8.0+
- Composer for dependency management

### Deployment Steps
1. Upload files to server
2. Run `composer install --no-dev --optimize-autoloader`
3. Run `npm run build` 
4. Configure web server document root to `/public`
5. Set proper file permissions for `storage/` and `bootstrap/cache/`
6. Run migrations: `php artisan migrate --force`
7. Seed reference data: `php artisan db:seed --class=ReferenceDataSeeder`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support or questions:
- Create an issue on GitHub
- Email: support@tpsonline.test

---

**Built with ❤️ using Laravel + React + TypeScript**