# Verify Login Credentials

**Quick Reference Card**  
**Date**: November 4, 2025

---

## ✅ Correct Demo Credentials

### All Accounts Use Same Password

**Password**: `demo123` (exactly 7 characters)

| Role | Username | Full User |
|------|----------|-----------|
| 🛡️ Super Admin | `superadmin` | Super Admin User |
| 👨‍💼 Admin | `admin` | Admin User |
| 👥 Manager | `manager` | Manager User |
| 👤 Staff | `staff` | Staff User |

---

## 🎯 Quick Test

### Open App
```
http://localhost:3000
```

### Try Super Admin
```
1. Click "Super Admin Login" (purple shield)
2. Username: superadmin
3. Password: demo123
4. Click "Sign In"
```

**Expected**:
- ✅ Success toast
- ✅ Dashboard appears
- ✅ Header shows "Super Admin User"

---

## 🔍 Check Console

Open Browser DevTools (F12) → Console tab

### Successful Login
```
🔐 Login attempt: {
  inputUsername: 'superadmin',
  passwordLength: 7,
  expectedPasswordLength: 7,
  credentialFound: true
}
✅ Login successful: superadmin@bookingtms.com super-admin
```

### If You See This (Failed Login)
```
❌ Login failed: Invalid password for username: superadmin
Expected: demo123 Got: [what_you_entered]
```

**Solution**: 
- Check what you typed in "Got:" field
- Make sure it's exactly "demo123"
- No extra spaces or characters

---

## 🐛 Common Issues

### Issue 1: "Invalid password"
**Cause**: Typing wrong password or extra spaces  
**Solution**: 
- Type exactly: `demo123`
- Or copy from this page
- Check console for "Expected" vs "Got"

### Issue 2: "No user found"
**Cause**: Wrong username  
**Solution**:
- Use lowercase username
- Check spelling
- Try: `superadmin` not `SuperAdmin`

### Issue 3: "Username is required"
**Cause**: Empty username field  
**Solution**: Enter a username

### Issue 4: "Password is required"
**Cause**: Empty password field  
**Solution**: Enter password

### Issue 5: "Password must be at least 6 characters"
**Cause**: Password too short  
**Solution**: Enter at least 6 characters (demo123 is 7)

---

## 📋 Copy-Paste Ready

### Super Admin
```
Username: superadmin
Password: demo123
```

### Admin
```
Username: admin
Password: demo123
```

### Manager
```
Username: manager
Password: demo123
```

### Staff
```
Username: staff
Password: demo123
```

---

## ✅ Verification Checklist

After entering credentials:

- [ ] Username is exactly as shown (lowercase)
- [ ] Password is exactly "demo123" (7 characters)
- [ ] No extra spaces before or after
- [ ] Clicked "Sign In" button
- [ ] Waited for loading indicator
- [ ] Checked console for messages

---

## 🎯 What Should Happen

### Step-by-Step Success Flow

**1. Login Page Loads**
- See 4 role options
- Clean interface
- Dark/light mode toggle

**2. Select Role**
- Click any role card
- See username/password form
- See demo credentials

**3. Enter Credentials**
- Type username (or copy from demo box)
- Type password (or copy from demo box)
- Both fields filled

**4. Click Sign In**
- Loading spinner appears
- Button says "Signing In..."
- Wait ~1.5 seconds

**5. Success!**
- Success toast appears
- Dashboard loads
- Header shows your name
- Sidebar appears
- You're logged in!

---

## 🔍 Advanced Debugging

### Console Commands

Open Console (F12) and try:

```javascript
// Check if demo credentials are defined
console.log('Demo password:', 'demo123');
console.log('Password length:', 'demo123'.length); // Should be 7

// Check what you're typing
const testPassword = 'demo123';
console.log('Test password:', testPassword);
console.log('Test length:', testPassword.length);
console.log('Matches:', testPassword === 'demo123'); // Should be true
```

---

## 📞 Need Help?

### Still Can't Login?

**Try**:
1. Clear browser cache
2. Try incognito/private mode
3. Try different browser
4. Copy credentials from this page
5. Check console for detailed error

**Report**:
1. What username you entered
2. Console output (copy the 🔐 message)
3. Browser and version
4. Screenshot of error

---

## 🎉 Summary

**Password**: `demo123` for all accounts  
**Usernames**: `superadmin`, `admin`, `manager`, `staff`  
**Case**: Lowercase  
**Spaces**: Will be trimmed automatically  

**Just copy and paste the credentials above!**

---

**Created**: November 4, 2025  
**Status**: Reference Guide  
**Updated**: After password trimming fix
