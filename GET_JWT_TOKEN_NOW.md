# 🔑 Get JWT Token - Quick Guide

**Bismillah - Let's get your JWT token for testing!**

---

## ⚡ **FASTEST METHOD: Via Supabase Dashboard**

### **Step 1: Create a Test User (2 minutes)**

1. **Go to Supabase Auth:**
   ```
   https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/auth/users
   ```

2. **Click "Add user" button** (top right)

3. **Fill in the form:**
   ```
   Email: testadmin@test.com
   Password: TestAdmin123!
   Auto Confirm User: ✅ Check this box
   ```

4. **Click "Create user"**

5. **Copy the User ID** (it will be shown, looks like: `a1b2c3d4-...`)

---

### **Step 2: Make User an Admin (1 minute)**

**Run this in Supabase SQL Editor:**

```sql
-- Replace USER_ID_HERE with the ID from Step 1
INSERT INTO organization_members (
  organization_id, 
  user_id, 
  role, 
  status
)
VALUES (
  '64fa1946-3cdd-43af-b7de-cc4708cd4b80',  -- Default Organization
  'USER_ID_HERE',  -- Replace with actual user ID
  'admin',
  'active'
);
```

---

### **Step 3: Get JWT Token (3 options)**

#### **Option A: Via Supabase Dashboard** ⭐ EASIEST

1. **Go back to Auth Users:**
   ```
   https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/auth/users
   ```

2. **Click on the user** you just created

3. **Find "User UID"** and **"Generate JWT Token"** section

4. **Click "Generate token"** or copy the existing token

5. **Copy the JWT token** - it starts with `eyJ...`

---

#### **Option B: Via Your Frontend**

If you have a login page:

1. **Login with:**
   ```
   Email: testadmin@test.com
   Password: TestAdmin123!
   ```

2. **Open Browser DevTools** (F12)

3. **Go to Console** and run:
   ```javascript
   localStorage.getItem('sb-ohfjkcajnqvethmrpdwc-auth-token')
   ```

4. **Or check Application → Local Storage → sb-* → access_token**

5. **Copy the JWT token**

---

#### **Option C: Via API Call**

```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmprY2FqbnF2ZXRobXJwZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDE2OTEsImV4cCI6MjA3Nzc3NzY5MX0.EkzMR6RP3YiVNASU3Ppq4KiJHCP8R8lY4yQxKhs_4e8" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@test.com",
    "password": "TestAdmin123!"
  }'
```

**Response will include:**
```json
{
  "access_token": "eyJhbGc...",  ← This is your JWT token!
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {...}
}
```

---

## ✅ **WHAT A JWT TOKEN LOOKS LIKE:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYzMjg2NzQ2LCJpYXQiOjE3NjMyODMxNDYsImlzcyI6Imh0dHBzOi8vb2hmamtjYWpucXZldGhtcnBkd2Muc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6ImExYjJjM2Q0LWU1ZjYtNDdnOC04OWkwLWoxazJsMzRtNW42bzcifQ.xYzAbC123...
```

**Key characteristics:**
- Starts with `eyJ`
- Has 3 parts separated by `.` (dots)
- Very long (500+ characters)
- Contains your user info (encoded)

---

## 🚀 **ONCE YOU HAVE THE JWT TOKEN:**

**Run the test script:**

```bash
cd "/Users/muhammadtariqul/Windsurf Project/Working - bookingtms/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2/"

./AUTOMATED_TEST_SCRIPT.sh
```

**You'll be asked for:**
1. ✅ **Supabase Anon Key:** (I'll provide this)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZmprY2FqbnF2ZXRobXJwZHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDE2OTEsImV4cCI6MjA3Nzc3NzY5MX0.EkzMR6RP3YiVNASU3Ppq4KiJHCP8R8lY4yQxKhs_4e8
   ```

2. 🔑 **JWT Token:** (Get from steps above)
   ```
   eyJhbGc...your-token-here...
   ```

3. 📧 **Test Email:** (Any email)
   ```
   testadmin@test.com
   ```

---

## 🎯 **QUICK SUMMARY:**

```
1. Create test user in Supabase Auth UI        (2 min)
2. Make them admin via SQL                     (1 min)
3. Get JWT token (Option A is easiest)         (1 min)
4. Run ./AUTOMATED_TEST_SCRIPT.sh             (5 min)
5. Complete Stripe onboarding                  (5 min)

Total: 15 minutes to fully test! 🚀
```

---

## 💡 **ALTERNATIVE: SKIP JWT & USE DIRECT APPROACH**

If getting JWT is difficult, I can:

**Option D:** Create a temporary test endpoint that doesn't require auth  
**Option E:** Use Supabase service role key for testing (bypasses auth)  
**Option F:** Skip testing, move to building payment checkout  

**What would you prefer?** 🎯

---

**Bismillah - Choose the easiest path for you!**
