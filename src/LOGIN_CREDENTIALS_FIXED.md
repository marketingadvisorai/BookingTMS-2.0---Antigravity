# ✅ Login Credentials - CORRECTED

## 🚨 CRITICAL: Password is `demo123` NOT `admin123`

Previous documentation incorrectly stated the password as `admin123`. This has been corrected throughout the system.

---

## 📋 Demo Login Credentials (CORRECT)

All demo accounts use the password: **`demo123`**

### Super Admin
- **Username:** `superadmin`
- **Email:** `superadmin@bookingtms.com`
- **Password:** `demo123` ✅
- **Access:** Full system access + user management

### Admin
- **Username:** `admin`
- **Email:** `admin@bookingtms.com`
- **Password:** `demo123` ✅
- **Access:** Full operational access (no user management)

### Manager
- **Username:** `manager`
- **Email:** `manager@bookingtms.com`
- **Password:** `demo123` ✅
- **Access:** View and limited edit access

### Staff
- **Username:** `staff`
- **Email:** `staff@bookingtms.com`
- **Password:** `demo123` ✅
- **Access:** Basic view-only access

---

## 🔍 Where Credentials Are Defined

### 1. **AuthContext.tsx** (Lines 316-321)
```typescript
const demoCredentials: Record<string, { username: string; password: string; role: UserRole }> = {
  'superadmin': { username: 'superadmin', password: 'demo123', role: 'super-admin' },
  'admin': { username: 'admin', password: 'demo123', role: 'admin' },
  'manager': { username: 'manager', password: 'demo123', role: 'manager' },
  'staff': { username: 'staff', password: 'demo123', role: 'staff' },
};
```

### 2. **Login.tsx** (Lines 132-137)
```typescript
const demoCredentials = {
  'super-admin': { username: 'superadmin', password: 'demo123' },
  'admin': { username: 'admin', password: 'demo123' },
  'manager': { username: 'manager', password: 'demo123' },
  'staff': { username: 'staff', password: 'demo123' },
};
```

### 3. **App.tsx DEV_MODE** (Line 50)
```typescript
await login('superadmin', 'demo123', 'super-admin');
```

---

## 📝 Documentation Files Updated

The following documentation files previously had incorrect password (`admin123`):

### ❌ Incorrect (Fixed)
- `/SUPABASE_CONNECTION_TESTING.md` - Lines 11, 287
- `/ACCOUNT_SETTINGS_ERROR_FIX.md` - Line 193

### ✅ Correct Updates Made
All documentation now correctly references `demo123` as the password.

---

## 🧪 Testing Login

### Quick Test
1. Navigate to login page
2. Select **Super Admin Login**
3. Enter credentials:
   ```
   Username: superadmin
   Password: demo123
   ```
4. Click "Sign In"
5. Should successfully login

### Test All Roles
```bash
# Super Admin
Username: superadmin | Password: demo123

# Admin
Username: admin | Password: demo123

# Manager
Username: manager | Password: demo123

# Staff
Username: staff | Password: demo123
```

---

## 🔧 DEV_MODE Auto-Login

In `App.tsx`, you can enable auto-login by setting:

```typescript
const DEV_MODE = true; // Line 37
```

This will automatically log you in as Super Admin with:
- Username: `superadmin`
- Password: `demo123`
- Role: `super-admin`

**Current Setting:** `DEV_MODE = false` (login required)

---

## 🐛 Error Resolution

### Previous Error
```
❌ Login failed: Invalid password for username: superadmin
Expected: demo123 Got: admin123
Login error: Error: Invalid credentials
```

### Root Cause
Documentation incorrectly stated password as `admin123`, causing users to enter the wrong password.

### Solution
1. ✅ Updated all documentation to use correct password: `demo123`
2. ✅ Added credential reference table to Guidelines.md
3. ✅ Created this reference document
4. ✅ Verified all code uses `demo123`

---

## 📚 Quick Reference

### Login Form
- **Step 1:** Select your role
- **Step 2:** Enter username (or email)
- **Step 3:** Enter password: `demo123`
- **Step 4:** Click "Sign In"

### Common Mistakes
- ❌ Using `admin123` (wrong!)
- ❌ Using email without @ symbol
- ❌ Entering role as username
- ✅ Use `demo123` for all accounts
- ✅ Use exact username (lowercase)

### Password Requirements (Mock Auth)
- Minimum 6 characters
- Must match: `demo123`
- Whitespace is automatically trimmed

---

## 🎯 Summary

**ONE PASSWORD FOR ALL DEMO ACCOUNTS: `demo123`**

If you see "Invalid credentials" error:
1. Verify you're using `demo123` (not `admin123`)
2. Check username is lowercase (e.g., `superadmin` not `SuperAdmin`)
3. Ensure no extra spaces in username or password
4. Try using email instead of username
5. Check browser console for detailed error messages

---

**Last Updated:** November 4, 2025  
**Status:** ✅ All Credentials Corrected  
**Password:** `demo123` (CONFIRMED)
