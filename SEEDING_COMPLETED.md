# Database Seeding - Completed ✅

## Overview
Database seeding has been successfully completed for the TPS Online application. All reference data, users, and Beacukai credentials have been populated into the MySQL database.

## Seeding Summary

### 1. Reference Data Seeder ✅
- **KdTps**: 4 TPS types (TPSL, TPSU, TPSD, TPSK)
- **KdDok**: 9 BC document codes (BC 1.1 through BC 4.1)
- **KdDokInout**: 4 inout document types (IN, OUT, SPPB, SPP)
- **KdGudang**: 6 warehouse codes (G001-G005, TANK)
- **KdSarAngkutInout**: 5 transport types (SEA, AIR, LAND, RAIL, PIPE)
- **NmAngkut**: 9 transport names (ships, planes, trucks)

### 2. User Seeder ✅
Created 3 system users with roles:

| Email | Username | Password | Role | Department | Position |
|-------|----------|----------|------|-----------|----------|
| admin@tpsonline.test | admin | password | Admin | IT | System Administrator |
| operator@tpsonline.test | operator | password | Operator | Operations | Data Entry Operator |
| supervisor@tpsonline.test | supervisor | password | Supervisor | Operations | Operations Supervisor |

**Note**: There's also a test user (test@example.com) from a previous factory creation.

### 3. Beacukai Credential Seeder ✅
Created 4 Beacukai service credentials:

| Service Name | Service Type | Endpoint | Status |
|-------------|--------------|----------|--------|
| CoCoTangki | cocotangki | https://tpsonline.beacukai.go.id/cocotangki/service.asmx | Active |
| SPPB Online | sppb | https://tpsonline.beacukai.go.id/tps/service.asmx | Active |
| BC 2.3 Online | bc23 | https://tpsonline.beacukai.go.id/bc23/service.asmx | Active |
| Gate In/Out | gate | https://tpsonline.beacukai.go.id/gate/service.asmx | Inactive |

**⚠️ IMPORTANT**: These are DEMO credentials (Username: TPSDEMO, Password: demo123). Update with real credentials from Beacukai before production use.

## Login Credentials

### Admin Access
- **URL**: https://realav1_tpsonline.test (or your local Herd URL)
- **Email**: admin@tpsonline.test
- **Password**: password
- **Permissions**: Full system access

### Operator Access
- **Email**: operator@tpsonline.test
- **Password**: password
- **Permissions**: Standard user access

### Supervisor Access
- **Email**: supervisor@tpsonline.test
- **Password**: password
- **Permissions**: Approval and supervisory access

## How to Re-run Seeders

If you need to re-run the seeders:

```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=ReferenceDataSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=BeacukaiCredentialSeeder

# Fresh migration with seeding (WARNING: This will delete all data!)
php artisan migrate:fresh --seed
```

## Files Modified/Created

### Seeders Created/Updated:
- `database/seeders/DatabaseSeeder.php` - Orchestrates all seeders
- `database/seeders/ReferenceDataSeeder.php` - Seeds all reference/master data
- `database/seeders/UserSeeder.php` - Seeds users with roles
- `database/seeders/BeacukaiCredentialSeeder.php` - Seeds API credentials
- `database/seeders/DocumentSeeder.php` - Seeds sample documents (8 documents)

### Models Updated:
- `app/Models/KdDokInout.php` - Added table name, primary key, and fillable fields
- `app/Models/KdSarAngkutInout.php` - Added table name, primary key, and fillable fields

## Verification

All seeded data has been verified in the database:
- ✅ 4 TPS types in `kd_tps` table
- ✅ 9 BC documents in `kd_dok` table
- ✅ 4 users in `users` table (including test user)
- ✅ 3 roles in `roles` table (admin, operator, supervisor)
- ✅ 4 Beacukai credentials in `beacukai_credentials` table
- ✅ 8 sample documents in `documents` table (2 draft, 4 submitted, 2 completed)

## Next Steps

1. **Test Login**: Try logging in with any of the three accounts above
2. **Update Credentials**: Update Beacukai credentials with real ones at `/settings/beacukai-credentials`
3. **Clean Test User**: Optionally remove the `test@example.com` user if not needed
4. **Add More Data**: You can add more reference data or users as needed

## Notes

- All seeders use `firstOrCreate()` pattern, making them idempotent (safe to run multiple times)
- Passwords are hashed using `Hash::make()`
- All users have verified email addresses
- Reference data includes realistic examples for testing
- The seeders follow the correct dependency order: Reference Data → Users → Credentials

---
**Generated**: <?= date('Y-m-d H:i:s') ?>
**Database**: MySQL (realav1)
**Status**: ✅ COMPLETED
