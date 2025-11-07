# Login Test - All Roles

**Date**: November 4, 2025  
**Purpose**: Verify all 4 demo accounts work correctly  
**Status**: Ready for Testing

---

## 🧪 Quick Test Instructions

### Open App
```
http://localhost:3000
```

You should see the **login page** (not dashboard).

---

## ✅ Test Each Role

### 1. Super Admin Login

**Credentials**:
```
Username: superadmin
Password: demo123
```

**Steps**:
1. Click "Super Admin Login" (purple shield icon)
2. Enter username: `superadmin`
3. Enter password: `demo123`
4. Click "Sign In"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ Success toast: "Successfully logged in as Super Admin Login"
- ✅ Dashboard appears
- ✅ Header shows "Super Admin User"
- ✅ Purple "Super Admin" badge in dropdown
- ✅ Console shows: `✅ Login successful: superadmin@bookingtms.com super-admin`

**Check Header Dropdown**:
- Click avatar (top-right)
- Should see:
  - Name: "Super Admin User"
  - Email: "superadmin@bookingtms.com"
  - Badge: Purple "Super Admin"

---

### 2. Admin Login

**Credentials**:
```
Username: admin
Password: demo123
```

**Steps**:
1. Logout if currently logged in
2. Click "Admin Login" (blue user icon)
3. Enter username: `admin`
4. Enter password: `demo123`
5. Click "Sign In"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ Success toast: "Successfully logged in as Admin Login"
- ✅ Dashboard appears
- ✅ Header shows "Admin User"
- ✅ Blue "Admin" badge in dropdown
- ✅ Console shows: `✅ Login successful: admin@bookingtms.com admin`

**Check Header Dropdown**:
- Name: "Admin User"
- Email: "admin@bookingtms.com"
- Badge: Blue "Admin"

---

### 3. Manager Login

**Credentials**:
```
Username: manager
Password: demo123
```

**Steps**:
1. Logout if currently logged in
2. Click "Manager Login" (green users icon)
3. Enter username: `manager`
4. Enter password: `demo123`
5. Click "Sign In"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ Success toast: "Successfully logged in as Manager Login"
- ✅ Dashboard appears
- ✅ Header shows "Manager User"
- ✅ Green "Manager" badge in dropdown
- ✅ Console shows: `✅ Login successful: manager@bookingtms.com manager`

**Check Header Dropdown**:
- Name: "Manager User"
- Email: "manager@bookingtms.com"
- Badge: Green "Manager"

---

### 4. Staff Login

**Credentials**:
```
Username: staff
Password: demo123
```

**Steps**:
1. Logout if currently logged in
2. Click "Staff Login" (amber user icon)
3. Enter username: `staff`
4. Enter password: `demo123`
5. Click "Sign In"

**Expected Results**:
- ✅ Loading indicator appears
- ✅ Success toast: "Successfully logged in as Staff Login"
- ✅ Dashboard appears
- ✅ Header shows "Staff User"
- ✅ Amber "Staff" badge in dropdown
- ✅ Console shows: `✅ Login successful: staff@bookingtms.com staff`

**Check Header Dropdown**:
- Name: "Staff User"
- Email: "staff@bookingtms.com"
- Badge: Amber "Staff"

---

## ❌ Test Error Cases

### Test 1: Wrong Password

**Steps**:
1. On login page
2. Click any role (e.g., Super Admin)
3. Enter username: `superadmin`
4. Enter password: `wrongpassword`
5. Click "Sign In"

**Expected**:
- ❌ Error toast: "Invalid username or password"
- ❌ Console shows: `Login failed: Invalid password for username: superadmin`
- Stay on login page

---

### Test 2: Wrong Username

**Steps**:
1. On login page
2. Click any role
3. Enter username: `wronguser`
4. Enter password: `demo123`
5. Click "Sign In"

**Expected**:
- ❌ Error toast: "Invalid username or password"
- ❌ Console shows: `Login failed: No user found for: wronguser`
- Stay on login page

---

### Test 3: Empty Fields

**Steps**:
1. On login page
2. Click any role
3. Leave username empty
4. Click "Sign In"

**Expected**:
- ❌ Validation error: "Username is required"
- Don't submit form

**Then**:
1. Enter username: `superadmin`
2. Leave password empty
3. Click "Sign In"

**Expected**:
- ❌ Validation error: "Password is required"
- Don't submit form

---

### Test 4: Short Password

**Steps**:
1. On login page
2. Click any role
3. Enter username: `superadmin`
4. Enter password: `123` (less than 6 chars)
5. Click "Sign In"

**Expected**:
- ❌ Validation error: "Password must be at least 6 characters"
- Don't submit form

---

## 🔄 Test Session Persistence

### Test 1: Stay Logged In After Refresh

**Steps**:
1. Login with any account (e.g., Super Admin)
2. Verify dashboard is showing
3. Press F5 (or Cmd+R on Mac) to refresh
4. Wait for page to reload

**Expected**:
- ✅ Stay logged in (don't see login page)
- ✅ Dashboard still showing
- ✅ User info still in header
- ✅ Same role badge

---

### Test 2: Logout Clears Session

**Steps**:
1. While logged in
2. Click avatar → Logout
3. Verify login page appears
4. Press F5 to refresh
5. Wait for page to reload

**Expected**:
- ✅ Still on login page (don't auto-login)
- ✅ Need to enter credentials again

---

## 🌙 Test Dark Mode

### Test Both Themes

**Steps**:
1. On login page (light mode)
2. Check colors:
   - Modal: White background
   - Inputs: Light gray (bg-gray-100)
   - Buttons: Vibrant blue
   
3. Toggle to dark mode (if available, or check after login)
4. Logout to see login page in dark mode
5. Check colors:
   - Modal: Dark background (#1e1e1e)
   - Inputs: Darker background (#161616)
   - Buttons: Same vibrant blue

**Expected**:
- ✅ Both modes look professional
- ✅ Text is readable in both modes
- ✅ No color contrast issues

---

## 📱 Test Responsive Design

### Mobile (375px)

**Steps**:
1. Resize browser to 375px width (iPhone SE)
2. Check login page:
   - Modal fills width properly
   - Buttons are large enough (44px min)
   - Text is readable
   - Can tap all elements

### Tablet (768px)

**Steps**:
1. Resize browser to 768px width (iPad)
2. Check login page:
   - Modal is centered
   - Good spacing around elements
   - Easy to interact

### Desktop (1024px+)

**Steps**:
1. Resize browser to 1024px or larger
2. Check login page:
   - Modal is centered
   - Not too wide (max-w-md)
   - Comfortable spacing

---

## 🎯 Success Criteria

All tests should pass:

### Login Tests
- [x] Super Admin login works
- [x] Admin login works
- [x] Manager login works
- [x] Staff login works

### Error Tests
- [x] Wrong password shows error
- [x] Wrong username shows error
- [x] Empty fields show validation
- [x] Short password shows validation

### Session Tests
- [x] Session persists after refresh
- [x] Logout clears session

### UI Tests
- [x] Light mode looks good
- [x] Dark mode looks good
- [x] Mobile responsive
- [x] Tablet responsive
- [x] Desktop responsive

### User Info Tests
- [x] Correct name in header
- [x] Correct email in dropdown
- [x] Correct role badge
- [x] Correct badge color

---

## 📊 Test Results Template

Use this to track your testing:

```
Date: November 4, 2025
Tester: [Your Name]

Login Tests:
[ ] Super Admin - PASS / FAIL
[ ] Admin - PASS / FAIL
[ ] Manager - PASS / FAIL
[ ] Staff - PASS / FAIL

Error Tests:
[ ] Wrong password - PASS / FAIL
[ ] Wrong username - PASS / FAIL
[ ] Empty fields - PASS / FAIL
[ ] Short password - PASS / FAIL

Session Tests:
[ ] Persist after refresh - PASS / FAIL
[ ] Logout clears session - PASS / FAIL

UI Tests:
[ ] Light mode - PASS / FAIL
[ ] Dark mode - PASS / FAIL
[ ] Mobile (375px) - PASS / FAIL
[ ] Tablet (768px) - PASS / FAIL
[ ] Desktop (1024px+) - PASS / FAIL

User Info Tests:
[ ] Name in header - PASS / FAIL
[ ] Email in dropdown - PASS / FAIL
[ ] Role badge - PASS / FAIL
[ ] Badge color - PASS / FAIL

Overall: PASS / FAIL

Notes:
[Any issues or observations]
```

---

## 🐛 If You Find Issues

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Look for login success messages

### Expected Console Messages

**Successful login**:
```
✅ Login successful: superadmin@bookingtms.com super-admin
```

**Failed login (wrong password)**:
```
Login failed: Invalid password for username: superadmin
Login error: Error: Invalid credentials
```

**Failed login (user not found)**:
```
Login failed: No user found for: wronguser
Login error: Error: Invalid credentials
```

### Report Issues

If you find a bug, note:
1. Which role you tried to login as
2. What credentials you entered
3. What error you saw
4. What the console shows
5. Browser and OS you're using

---

## 📝 Summary

This test suite verifies:
- ✅ All 4 roles can login
- ✅ Error handling works
- ✅ Session management works
- ✅ UI looks good in both themes
- ✅ Responsive design works
- ✅ User info displays correctly

**Time to Complete**: ~15 minutes  
**Prerequisites**: App running at `http://localhost:3000`  
**Tools Needed**: Browser (Chrome/Firefox/Safari)

---

**Created**: November 4, 2025  
**Purpose**: Comprehensive login testing  
**Status**: Ready to use  
**Next**: Run these tests and verify all pass ✅
