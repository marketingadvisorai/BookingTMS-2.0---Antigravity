# Login Troubleshooting Guide

**Last Updated**: November 4, 2025  
**Version**: 3.2.3

---

## 🚨 Common Errors & Solutions

### Error: "Invalid password for username: superadmin"

#### Possible Causes

**1. Wrong Password**
- ❌ Typing wrong password
- ❌ Extra characters
- ❌ Caps Lock on
- ❌ Copy/paste error

**Solution**:
```
✅ Password is exactly: demo123
✅ All lowercase
✅ No spaces (they're trimmed automatically now)
✅ No special characters
✅ Exactly 7 characters
```

**2. Browser Autocomplete**
- ❌ Browser filled wrong password
- ❌ Saved incorrect credentials

**Solution**:
```
✅ Clear the field
✅ Manually type: demo123
✅ Or use incognito mode
```

**3. Copy/Paste Issues**
- ❌ Copied extra whitespace
- ❌ Copied from wrong source

**Solution**:
```
✅ Copy from this guide
✅ Password: demo123
```

---

### Error: "Invalid credentials"

#### Generic Error - Multiple Causes

**1. Wrong Username**
```
❌ SuperAdmin (wrong case)
❌ super-admin (wrong format)
❌ super admin (has space)

✅ superadmin (correct)
```

**2. Wrong Password**
```
❌ Demo123 (wrong case)
❌ demo 123 (has space)
❌ demo1234 (too long)

✅ demo123 (correct)
```

**3. User Not Found**
```
Check console for:
"Login failed: No user found for: [username]"

Solution: Use correct username from list
```

---

### Error: "Username is required"

**Cause**: Empty username field

**Solution**:
```
✅ Enter username before clicking Sign In
✅ Try: superadmin
```

---

### Error: "Password is required"

**Cause**: Empty password field

**Solution**:
```
✅ Enter password before clicking Sign In
✅ Try: demo123
```

---

### Error: "Password must be at least 6 characters"

**Cause**: Password too short

**Solution**:
```
❌ Don't use: demo (4 chars)
❌ Don't use: pass (4 chars)

✅ Use: demo123 (7 chars)
```

---

## 🔍 Debugging Steps

### Step 1: Check Console

**Open DevTools**:
- Chrome/Edge: F12 or Ctrl+Shift+I
- Firefox: F12 or Ctrl+Shift+K
- Safari: Cmd+Option+I

**Look for**:
```javascript
🔐 Login attempt: {
  inputUsername: 'superadmin',
  passwordLength: 7,
  expectedPasswordLength: 7,
  credentialFound: true
}
```

**Check**:
- `inputUsername` matches what you typed
- `passwordLength` is 7
- `expectedPasswordLength` is 7
- `credentialFound` is true

---

### Step 2: Verify Credentials

**Copy these EXACT credentials**:

```
Username: superadmin
Password: demo123
```

**Paste into login form**

---

### Step 3: Check Console Output

#### ✅ Success Output
```
🔐 Login attempt: {
  inputUsername: 'superadmin',
  passwordLength: 7,
  expectedPasswordLength: 7,
  credentialFound: true
}
✅ Login successful: superadmin@bookingtms.com super-admin
```

#### ❌ Failed - Wrong Password
```
🔐 Login attempt: {
  inputUsername: 'superadmin',
  passwordLength: 8,
  expectedPasswordLength: 7,
  credentialFound: true
}
❌ Login failed: Invalid password for username: superadmin
Expected: demo123 Got: wrongpwd
```

**Fix**: Check "Got:" value, should be "demo123"

#### ❌ Failed - User Not Found
```
🔐 Login attempt: {
  inputUsername: 'wronguser',
  passwordLength: 7,
  expectedPasswordLength: 0,
  credentialFound: false
}
Login failed: No user found for: wronguser
```

**Fix**: Use correct username from demo credentials

---

### Step 4: Clear Everything

If still failing:

**1. Clear Browser Cache**
```
Chrome/Edge: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Option+E
```

**2. Hard Refresh**
```
Chrome/Edge/Firefox: Ctrl+Shift+R
Safari: Cmd+Shift+R
```

**3. Clear localStorage**
```javascript
// Open console and run:
localStorage.clear();
location.reload();
```

**4. Try Incognito/Private Mode**
```
Chrome/Edge: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
Safari: Cmd+Shift+N
```

---

## 📋 Complete Credential Reference

### Demo Accounts

All use password: **`demo123`**

| Role | Username | Email | User ID |
|------|----------|-------|---------|
| Super Admin | `superadmin` | superadmin@bookingtms.com | 1 |
| Admin | `admin` | admin@bookingtms.com | 2 |
| Manager | `manager` | manager@bookingtms.com | 3 |
| Staff | `staff` | staff@bookingtms.com | 4 |

### Copy-Paste Ready

#### Super Admin
```
superadmin
demo123
```

#### Admin
```
admin
demo123
```

#### Manager
```
manager
demo123
```

#### Staff
```
staff
demo123
```

---

## 🧪 Test Matrix

Use this to systematically test:

### Valid Credentials (Should Work ✅)

| Test | Username | Password | Result |
|------|----------|----------|--------|
| 1 | superadmin | demo123 | ✅ Pass |
| 2 | admin | demo123 | ✅ Pass |
| 3 | manager | demo123 | ✅ Pass |
| 4 | staff | demo123 | ✅ Pass |

### Invalid Credentials (Should Fail ❌)

| Test | Username | Password | Error |
|------|----------|----------|-------|
| 5 | superadmin | wrong | Invalid password |
| 6 | wronguser | demo123 | No user found |
| 7 | SuperAdmin | demo123 | No user found |
| 8 | superadmin | Demo123 | Invalid password |
| 9 | (empty) | demo123 | Username required |
| 10 | superadmin | (empty) | Password required |
| 11 | superadmin | demo | Too short |

---

## 🔧 Advanced Troubleshooting

### Issue: Password Appears Correct But Still Fails

**Check for hidden characters**:

```javascript
// In browser console:
const pwd = 'demo123';
console.log('Length:', pwd.length); // Should be 7
console.log('Chars:', Array.from(pwd)); // Should be ['d','e','m','o','1','2','3']
console.log('Hex:', pwd.split('').map(c => c.charCodeAt(0).toString(16)));
// Should be ['64','65','6d','6f','31','32','33']
```

**If length is not 7**:
- You have extra characters (spaces, newlines, etc.)
- Copy password again from this guide

**If characters don't match**:
- You're using wrong characters
- Verify: d-e-m-o-1-2-3

---

### Issue: Console Shows Nothing

**Possible causes**:
1. Console not open
2. Errors being suppressed
3. JavaScript disabled

**Solutions**:
1. Press F12 to open console
2. Refresh page
3. Try different browser
4. Check browser extensions aren't blocking

---

### Issue: Login Button Doesn't Work

**Check**:
1. Is role selected? (should show username/password form)
2. Are both fields filled?
3. Does button say "Sign In" (not "Signing In...")?
4. Any console errors?

**Try**:
1. Click back and select role again
2. Refresh page
3. Try keyboard: Enter key after typing password

---

### Issue: Page Refreshes But Stays on Login

**Possible causes**:
1. Login failed silently
2. Session not being set
3. App.tsx not detecting user

**Debug**:
```javascript
// Check localStorage
console.log('User ID:', localStorage.getItem('currentUserId'));

// If null, login didn't work
// If has value, check AuthContext
```

---

## 🎯 Success Checklist

After successful login, verify:

- [ ] Dashboard page loads (not login page)
- [ ] Header shows user name (e.g., "Super Admin User")
- [ ] Avatar in header shows initials
- [ ] Dropdown shows email and role badge
- [ ] Sidebar is visible (desktop)
- [ ] No errors in console
- [ ] Can navigate to other pages
- [ ] Can logout successfully

---

## 📊 Console Debug Commands

### Check Current State

```javascript
// Check if user is logged in
console.log('Current User ID:', localStorage.getItem('currentUserId'));

// Test password comparison
const testUsername = 'superadmin';
const testPassword = 'demo123';
console.log('Test credentials:', { 
  username: testUsername, 
  password: testPassword,
  passwordLength: testPassword.length 
});

// Verify credentials object
const demoCredentials = {
  'superadmin': { username: 'superadmin', password: 'demo123', role: 'super-admin' },
};
console.log('Demo credential:', demoCredentials['superadmin']);
console.log('Password match:', demoCredentials['superadmin'].password === 'demo123');
```

### Force Logout

```javascript
// Clear session and reload
localStorage.removeItem('currentUserId');
location.reload();
```

### View All localStorage

```javascript
// See what's stored
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(key, '=', localStorage.getItem(key));
}
```

---

## 🆘 Still Not Working?

### Gather This Information

1. **Console Output**
   - Copy entire console log
   - Include the 🔐 Login attempt message
   - Include any errors

2. **Browser Info**
   - Name and version
   - Operating system
   - Incognito mode or normal?

3. **What You Entered**
   - Username (exactly as typed)
   - Password length
   - Which role selected

4. **What Happened**
   - Error message shown
   - Console output
   - Did page reload?

### Contact Support

Provide the information above along with:
- Screenshot of error
- Network tab (any failed requests?)
- Steps to reproduce

---

## 📚 Related Documentation

- **Login System**: `/LOGIN_SYSTEM_COMPLETE.md`
- **Credential Verification**: `/VERIFY_LOGIN_CREDENTIALS.md`
- **Password Fix**: `/LOGIN_PASSWORD_FIX.md`
- **Error Fix**: `/LOGIN_ERROR_FIX.md`
- **Test Guide**: `/LOGIN_TEST_ALL_ROLES.md`

---

## 🎉 Quick Solution

**99% of issues are solved by**:

1. Using exact credentials:
   - Username: `superadmin`
   - Password: `demo123`

2. Opening console (F12) to see errors

3. Trying incognito mode

4. Clearing cache and reloading

**Just try these four steps first!**

---

**Last Updated**: November 4, 2025  
**Version**: 3.2.3  
**Status**: Complete Troubleshooting Guide
