# LOGIN CREDENTIALS

## ✅ Error WorkOS SUDAH DIPERBAIKI

**Masalah:** Invalid client ID workos
**Solusi:** Package `laravel/workos` sudah dihapus (tidak digunakan)

---

## 🔐 Login Credentials

### Admin
- **Email:** `admin@tpsonline.test`
- **Password:** `password`
- **Name:** Admin TPS Online

### Operator
- **Email:** `operator@tpsonline.test`
- **Password:** `password`
- **Name:** Operator TPS

---

## 🚀 Cara Login

1. **Start Development Server:**
   ```bash
   php artisan serve
   # atau akses via Laragon: http://realav1_tpsonline.test
   ```

2. **Start Frontend (Terminal Terpisah):**
   ```bash
   npm run dev
   ```

3. **Akses Login Page:**
   - URL: `http://realav1_tpsonline.test/login`
   - Atau: `http://localhost:8000/login`

4. **Masukkan Credentials:**
   - Email: `admin@tpsonline.test`
   - Password: `password`

5. **Klik Login**

---

## 🔧 Troubleshooting

### Jika Masih Error:

1. **Clear All Cache:**
   ```bash
   php artisan optimize:clear
   ```

2. **Restart Server:**
   ```bash
   # Stop server (Ctrl+C)
   php artisan serve
   ```

3. **Rebuild Frontend:**
   ```bash
   npm run build
   # atau untuk dev:
   npm run dev
   ```

4. **Check Logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Forgot Password?

Reset via command:
```bash
php reset_passwords.php
```

Atau manual via tinker:
```bash
php artisan tinker
```
```php
use Illuminate\Support\Facades\Hash;
User::where('email', 'admin@tpsonline.test')->update([
    'password' => Hash::make('newpassword')
]);
```

---

## 📝 Authentication System

- **Framework:** Laravel Breeze
- **Frontend:** React + TypeScript + Inertia.js
- **Guard:** Session-based (web)
- **Password Hashing:** bcrypt
- **RBAC:** Spatie Laravel Permission

---

## 🔒 Security Features

✅ Email verification ready
✅ Password reset functionality
✅ Session-based authentication
✅ CSRF protection
✅ Rate limiting on login
✅ Password hashing with bcrypt
✅ Role-Based Access Control (RBAC)

---

## 🎯 Next Steps After Login

1. **Dashboard:** `/dashboard`
2. **Documents:** `/documents`
3. **CoCoTangki:** `/cocotangki`
4. **Settings:** `/settings`
5. **Logs:** `/logs`

---

## ⚙️ Configuration Files Changed

1. ✅ `.env` - WorkOS variables commented out
2. ✅ `config/services.php` - WorkOS config commented out
3. ✅ `composer.json` - WorkOS package removed
4. ✅ All caches cleared

**Status:** 🟢 Authentication system ready to use!
