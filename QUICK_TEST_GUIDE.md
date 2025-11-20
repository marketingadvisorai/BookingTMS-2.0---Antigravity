# 🚀 Quick Test Guide - Stripe Connect

**Bismillah - Simple 3-Step Test**

---

## ✅ **PREREQUISITES (You Already Have)**

- [x] Stripe secrets set in Supabase ✅
- [x] Edge Functions deployed ✅
- [x] Organization in database ✅

**Organization to Test:**
- **ID:** `64fa1946-3cdd-43af-b7de-cc4708cd4b80`
- **Name:** Default Organization
- **Status:** Not connected to Stripe yet (perfect!)

---

## 🎯 **WHAT YOU NEED**

### **1. Supabase Anon Key**
Get it here: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/api

Look for: **"anon" "public"** key (starts with `eyJh...`)

### **2. JWT Token**
You need a logged-in user's JWT token.

**Option A: Create a test user & get token**
```sql
-- Run this in Supabase SQL Editor to create a test admin user
-- This creates both auth user and organization member

-- First, you need to sign up a user via your app or Supabase Auth UI
-- Then run this to make them an admin:

INSERT INTO organization_members (organization_id, user_id, role, status)
VALUES (
  '64fa1946-3cdd-43af-b7de-cc4708cd4b80',
  'YOUR_USER_ID_FROM_AUTH',  -- Get from auth.users table
  'admin',
  'active'
);
```

**Option B: Use existing auth** 
If you have a user logged in, get the JWT from:
- Browser DevTools → Application → Local Storage → `sb-*-auth-token`
- Or from your app's auth state

---

## 🧪 **OPTION 1: AUTOMATED TEST (Easiest)**

**Run the test script:**
```bash
cd /Users/muhammadtariqul/Windsurf\ Project/Working\ -\ bookingtms/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2/

./AUTOMATED_TEST_SCRIPT.sh
```

**It will ask you for:**
1. Supabase Anon Key
2. JWT Token
3. Test email

**Then it will automatically:**
- ✅ Create Stripe Connect account
- ✅ Get onboarding link
- ✅ Check account status

---

## 🧪 **OPTION 2: MANUAL cURL TEST**

### **Step 1: Set Your Variables**
```bash
# Replace these with your actual values:
ANON_KEY="eyJhbGc..."
JWT_TOKEN="eyJhbGc..."
TEST_EMAIL="test@yourbusiness.com"
ORG_ID="64fa1946-3cdd-43af-b7de-cc4708cd4b80"
```

### **Step 2: Create Stripe Account**
```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-connect-create-account \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"${ORG_ID}\",
    \"email\": \"${TEST_EMAIL}\",
    \"business_name\": \"Test Business\",
    \"country\": \"US\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "account_id": "acct_...",
  "onboarding_required": true
}
```

### **Step 3: Get Onboarding Link**
```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-connect-account-link \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"${ORG_ID}\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/..."
}
```

**Open the URL in browser and complete onboarding!**

### **Step 4: Check Status**
```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-connect-account-status \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"organization_id\": \"${ORG_ID}\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "charges_enabled": true,
  "payouts_enabled": true,
  "onboarding_status": "complete"
}
```

---

## 🧪 **OPTION 3: SUPER SIMPLE TEST (No Auth Required)**

**For quick testing without JWT:**

I can help you create a test endpoint that bypasses auth for testing purposes, OR you can:

1. Use Postman/Insomnia to test
2. Import the cURL commands above
3. Just need to fill in ANON_KEY and JWT_TOKEN

---

## ✅ **SUCCESS CRITERIA**

You'll know it worked when:

1. **✅ Step 1 Response:**
   ```json
   {
     "success": true,
     "account_id": "acct_xxx",
     "onboarding_required": true
   }
   ```

2. **✅ Step 2 Response:**
   ```json
   {
     "success": true,
     "url": "https://connect.stripe.com/setup/..."
   }
   ```

3. **✅ Step 3 Response (after onboarding):**
   ```json
   {
     "success": true,
     "charges_enabled": true,
     "payouts_enabled": true
   }
   ```

4. **✅ Database Check:**
   ```sql
   SELECT 
     stripe_account_id,
     stripe_charges_enabled,
     stripe_payouts_enabled,
     stripe_onboarding_status
   FROM organizations
   WHERE id = '64fa1946-3cdd-43af-b7de-cc4708cd4b80';
   ```
   
   Should show: Account ID, charges=true, payouts=true, status=complete

---

## 🚫 **TROUBLESHOOTING**

### **"Missing authorization header"**
- Check JWT_TOKEN is set correctly
- Make sure Bearer prefix is included

### **"Only organization admins can..."**
- The user needs to be an admin
- Add them to organization_members table with role='admin'

### **"Organization already has a Stripe account"**
- Account already created!
- Skip to Step 2 (get onboarding link)
- Or use a different organization

---

## 💬 **WHICH OPTION WOULD YOU LIKE?**

**A.** Run automated script (easiest) ⭐  
**B.** Manual cURL commands  
**C.** I'll help you create a test user first  
**D.** Skip testing, move to next feature  

Let me know and I'll guide you through! 🎯
