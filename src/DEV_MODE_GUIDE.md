# Development Mode Guide

**Quick Reference for DEV_MODE Configuration**

---

## 🔧 What is DEV_MODE?

DEV_MODE is a development flag that allows you to bypass the login page and automatically log in as Super Admin. This is perfect for rapid development and testing.

---

## ⚡ Quick Setup

### Enable Auto-Login (Development)

**File:** `/App.tsx`  
**Line:** ~30

```typescript
const DEV_MODE = true;  // ← Change this to true
```

**Result:**
- ✅ Automatically logs in as Super Admin
- ✅ Bypasses login page
- ✅ Shows "Dev Mode: Auto-logging in..." screen briefly
- ✅ Perfect for development

---

### Enable Authentication (Production)

**File:** `/App.tsx`  
**Line:** ~30

```typescript
const DEV_MODE = false;  // ← Change this to false
```

**Result:**
- ✅ Requires manual login
- ✅ Shows professional login page
- ✅ Production-ready behavior
- ✅ Perfect for testing auth flow

---

## 🎯 When to Use Each Mode

### Use DEV_MODE = true When:
- ✅ Developing new features
- ✅ Testing admin functionality
- ✅ Debugging components
- ✅ Rapid iteration
- ✅ Don't want to log in repeatedly

### Use DEV_MODE = false When:
- ✅ Testing authentication flow
- ✅ Testing role-based permissions
- ✅ Demonstrating to stakeholders
- ✅ Pre-production testing
- ✅ Want production-like experience

---

## 📝 How It Works

### Behind the Scenes

When `DEV_MODE = true`:

```typescript
// In App.tsx
useEffect(() => {
  const autoLogin = async () => {
    if (DEV_MODE && !currentUser && !isLoading) {
      try {
        console.log('🔧 DEV MODE: Auto-logging in as Super Admin');
        await login('superadmin', 'demo123', 'super-admin');
      } catch (error) {
        console.error('Auto-login failed:', error);
      }
    }
  };
  autoLogin();
}, [currentUser, isLoading, login]);
```

**Flow:**
1. App loads
2. Checks if `DEV_MODE = true`
3. Checks if user is not logged in
4. Automatically calls `login()` with Super Admin credentials
5. User is logged in without seeing login page

---

## 🚀 Step-by-Step Instructions

### Method 1: Enable Auto-Login

1. Open `/App.tsx` in your code editor
2. Find line ~30: `const DEV_MODE = false;`
3. Change to: `const DEV_MODE = true;`
4. Save the file
5. Refresh your browser
6. ✅ You're automatically logged in!

### Method 2: Disable Auto-Login

1. Open `/App.tsx` in your code editor
2. Find line ~30: `const DEV_MODE = true;`
3. Change to: `const DEV_MODE = false;`
4. Save the file
5. Refresh your browser
6. ✅ Login page appears

---

## 🎓 Testing Different Roles

If you want to test different user roles, you have two options:

### Option 1: Use DEV_MODE = false

1. Set `DEV_MODE = false`
2. Reload the app
3. Click the role you want to test
4. Enter credentials (e.g., `admin` / `demo123`)
5. Test the application with that role's permissions

### Option 2: Modify DEV_MODE Auto-Login

Edit `/App.tsx` to auto-login as a different role:

```typescript
// Change this line in the useEffect:
await login('admin', 'demo123', 'admin');        // Test as Admin
await login('manager', 'demo123', 'manager');    // Test as Manager
await login('staff', 'demo123', 'staff');        // Test as Staff
```

---

## 🔐 Demo Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Super Admin | `superadmin` | `demo123` | Full access + user management |
| Admin | `admin` | `demo123` | Full operational access |
| Manager | `manager` | `demo123` | View + limited edit |
| Staff | `staff` | `demo123` | Basic view-only |

---

## 💡 Pro Tips

### Tip 1: Quick Role Switching
Instead of changing `DEV_MODE`, use the logout button and log back in with a different role.

### Tip 2: Test Permission Guards
With `DEV_MODE = false`, test different roles to see which features appear/disappear based on permissions.

### Tip 3: Console Logging
When `DEV_MODE = true`, check the browser console. You'll see:
```
🔧 DEV MODE: Auto-logging in as Super Admin
✅ Login successful: superadmin@bookingtms.com super-admin
```

### Tip 4: Mobile Testing
`DEV_MODE` works on mobile too! Set it before opening on mobile device.

---

## 🐛 Troubleshooting

### Issue: Auto-login not working

**Symptoms:**
- `DEV_MODE = true` but still seeing login page
- No auto-login happening

**Solutions:**
1. Check the browser console for errors
2. Make sure you saved `/App.tsx`
3. Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache
5. Check that AuthContext is properly configured

### Issue: Login loop

**Symptoms:**
- Page keeps reloading
- Can't stay logged in

**Solutions:**
1. Set `DEV_MODE = false`
2. Check browser console for errors
3. Clear localStorage: `localStorage.clear()`
4. Reload the page

### Issue: Wrong role logged in

**Symptoms:**
- Expected Super Admin but got different role
- Permissions don't match

**Solutions:**
1. Check the auto-login code in `/App.tsx`
2. Make sure it's calling `login('superadmin', 'demo123', 'super-admin')`
3. Logout and log back in manually
4. Check `currentUser` in React DevTools

---

## 📊 Current Configuration

**Location:** `/App.tsx` (line ~30)

**Default Setting:** `const DEV_MODE = false;`

**Current Behavior:** Production mode (requires login)

---

## 🎯 Recommended Workflow

### For Feature Development:
```
1. Set DEV_MODE = true
2. Develop your feature
3. Test with Super Admin permissions
4. Set DEV_MODE = false
5. Test with different roles
6. Commit code with DEV_MODE = false
```

### For Bug Fixing:
```
1. Reproduce bug with DEV_MODE = false
2. Set DEV_MODE = true for faster iteration
3. Fix the bug
4. Test with DEV_MODE = false
5. Verify fix works in production mode
```

### For Demos:
```
1. Set DEV_MODE = false
2. Start with login page
3. Show role selection
4. Demonstrate authentication
5. Show permission-based features
```

---

## 📚 Related Documentation

- **Authentication System**: `/lib/auth/README.md`
- **Login Page**: `/pages/Login.tsx`
- **RBAC Permissions**: `/lib/auth/permissions.ts`
- **November 4 Update**: `/NOVEMBER_4_UPDATE.md`

---

## ✅ Quick Checklist

Before committing code:
- [ ] Set `DEV_MODE = false`
- [ ] Test login flow
- [ ] Test all user roles
- [ ] Verify auto-login is disabled
- [ ] Check no console errors

---

**Last Updated**: November 4, 2025  
**File**: `/App.tsx`  
**Flag**: `DEV_MODE`  
**Default**: `false` (Production mode)

---

*Happy Coding! 🚀*
