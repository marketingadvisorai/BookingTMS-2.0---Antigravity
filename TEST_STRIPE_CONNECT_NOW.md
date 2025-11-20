# 🧪 Test Stripe Connect - Step-by-Step Guide

**Bismillah - Let's test the deployed Edge Functions!**

**Date:** November 16, 2025  
**Time:** 4:00 PM UTC+06:00  
**Status:** Ready to Test

---

## 📋 PREREQUISITES CHECKLIST

Before we start testing, let's verify you have everything:

### **1. Stripe Test Account** ✅
- [ ] Go to https://dashboard.stripe.com/test/apikeys
- [ ] Copy your **Test Secret Key** (starts with `sk_test_`)
- [ ] Keep it ready for next step

### **2. Supabase Project Access** ✅
- [ ] Project ID: `ohfjkcajnqvethmrpdwc`
- [ ] Dashboard: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc

### **3. Organization ID from Database** ✅
- [ ] We'll get this from the database in Step 1

### **4. User JWT Token** ✅
- [ ] We'll get this from Supabase in Step 2

---

## 🔧 STEP-BY-STEP TESTING

### **STEP 1: Set Environment Variables in Supabase**

#### **Option A: Via Supabase Dashboard (Easiest)** ⭐

1. **Go to Edge Functions Settings:**
   ```
   https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/functions
   ```

2. **Click "Manage secrets"**

3. **Add These Two Variables:**
   ```bash
   Name: STRIPE_SECRET_KEY
   Value: sk_test_51... (your Stripe test secret key)
   
   Name: APP_URL
   Value: https://bookingtms-backend-api.onrender.com
   ```

4. **Click "Save"**

✅ **Done! Environment variables are now set.**

#### **Option B: Via Supabase CLI** (Alternative)

```bash
# Login to Supabase
supabase login

# Link project
supabase link --project-ref ohfjkcajnqvethmrpdwc

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set APP_URL=https://bookingtms-backend-api.onrender.com
```

---

### **STEP 2: Get Organization ID**

Let's get an organization ID from your database to test with.

**Run this SQL query in Supabase SQL Editor:**

```sql
-- Get first organization
SELECT 
  id,
  name,
  stripe_account_id,
  stripe_onboarding_status
FROM organizations
ORDER BY created_at DESC
LIMIT 1;
```

**Copy the `id` value** - you'll need it for testing.

**Example Result:**
```
id: 123e4567-e89b-12d3-a456-426614174000
name: Your Organization Name
stripe_account_id: NULL (not connected yet)
stripe_onboarding_status: NULL
```

---

### **STEP 3: Get User JWT Token**

You need a JWT token for an admin user of the organization.

#### **Option A: Via Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/auth/users
2. Find a user that's an admin
3. Click the user
4. Copy the JWT token

#### **Option B: Via SQL Query**

```sql
-- Get a user profile with organization
SELECT 
  up.id as user_id,
  up.email,
  up.organization_id,
  o.name as org_name
FROM user_profiles up
JOIN organizations o ON up.organization_id = o.id
LIMIT 1;
```

Then login to your app with this user to get a fresh JWT token.

---

### **STEP 4: Test Create Stripe Connect Account**

Now let's create a Stripe Connect account!

**Command:**
```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-connect-create-account \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "organization_id": "YOUR_ORG_UUID_HERE",
    "email": "test@yourbusiness.com",
    "business_name": "Test Business",
    "country": "US"
  }'
```

**Replace:**
- `YOUR_JWT_TOKEN_HERE` - JWT token from Step 3
- `YOUR_ORG_UUID_HERE` - Organization ID from Step 2
- `YOUR_SUPABASE_ANON_KEY` - Get from Supabase Settings → API

**Expected Success Response:**
```json
{
  "success": true,
  "account_id": "acct_1Abc2Def3Ghi4Jkl",
  "account_type": "standard",
  "charges_enabled": false,
  "payouts_enabled": false,
  "details_submitted": false,
  "onboarding_required": true,
  "message": "Stripe account created. Onboarding required."
}
```

✅ **If you see this, the account was created successfully!**

---

### **STEP 5: Verify Database Was Updated**

Check that the organization was updated:

```sql
SELECT 
  id,
  name,
  stripe_account_id,
  stripe_account_type,
  stripe_onboarding_status,
  stripe_account_created_at
FROM organizations
WHERE id = 'YOUR_ORG_UUID';
```

**Expected Results:**
```
stripe_account_id: acct_1Abc2Def3Ghi4Jkl
stripe_account_type: standard
stripe_onboarding_status: pending
stripe_account_created_at: 2025-11-16 16:00:00+00
```

✅ **Database updated correctly!**

---

### **STEP 6: Get Onboarding Link**

Now let's get the Stripe onboarding URL:

**Command:**
```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-connect-account-link \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "organization_id": "YOUR_ORG_UUID_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/setup/s/...",
  "expires_at": 1700000000,
  "onboarding_status": "pending"
}
```

**Copy the `url` value!**

---

### **STEP 7: Complete Stripe Onboarding**

1. **Open the URL** from Step 6 in your browser
2. **Fill out the Stripe onboarding form** (you can use test data)
3. **Submit the form**
4. **Stripe will redirect** you back to your return_url

✅ **Onboarding complete!**

---

### **STEP 8: Check Account Status**

Finally, let's sync the account status:

**Command:**
```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-connect-account-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "organization_id": "YOUR_ORG_UUID_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "account_id": "acct_1Abc2Def3Ghi4Jkl",
  "charges_enabled": true,
  "payouts_enabled": true,
  "details_submitted": true,
  "onboarding_status": "complete",
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "past_due": []
  },
  "capabilities": {
    "card_payments": "active",
    "transfers": "active"
  }
}
```

✅ **Account is fully activated!**

---

### **STEP 9: Final Database Verification**

Check that everything was synced:

```sql
SELECT 
  id,
  name,
  stripe_account_id,
  stripe_charges_enabled,
  stripe_payouts_enabled,
  stripe_details_submitted,
  stripe_onboarding_status,
  stripe_account_updated_at
FROM organizations
WHERE id = 'YOUR_ORG_UUID';
```

**Expected Final State:**
```
stripe_account_id: acct_1Abc2Def3Ghi4Jkl
stripe_charges_enabled: true
stripe_payouts_enabled: true
stripe_details_submitted: true
stripe_onboarding_status: complete
stripe_account_updated_at: 2025-11-16 16:05:00+00
```

---

## ✅ SUCCESS CRITERIA

### **You've successfully tested if:**
- [x] Environment variables set in Supabase
- [x] Created Stripe Connect account via API
- [x] Organization database record updated
- [x] Got onboarding link
- [x] Completed Stripe onboarding form
- [x] Account status synced back to database
- [x] charges_enabled = true
- [x] payouts_enabled = true
- [x] Organization ready to accept payments!

---

## 🎉 WHAT THIS MEANS

**If all steps passed, you now have:**

✅ **Working Stripe Connect Integration**
- Organizations can connect their Stripe accounts
- Onboarding flow works end-to-end
- Database automatically syncs with Stripe
- Ready to process payments with application fees

✅ **Validated Architecture**
- Edge Functions working correctly
- Authentication & authorization working
- Database integration working
- Stripe API integration working

✅ **Production Ready Backend**
- All 3 Edge Functions deployed & tested
- Revenue tracking ready
- Application fee calculation ready
- Platform earnings tracking ready

---

## 🚫 TROUBLESHOOTING

### **Error: Missing authorization header**
- Make sure you're including the JWT token
- Format: `Authorization: Bearer YOUR_TOKEN`

### **Error: Only organization admins can...**
- The user must be an admin of the organization
- Check organization_members table

### **Error: Organization already has a Stripe account**
- The organization already connected Stripe
- Use a different organization or skip Step 4

### **Error: Failed to create Stripe account**
- Check STRIPE_SECRET_KEY is set correctly
- Make sure it's a test key (sk_test_)
- Check Supabase Edge Functions logs

### **Error: Organization does not have a Stripe account**
- Run Step 4 first (create account)
- Verify account was created in database

---

## 📝 QUICK REFERENCE

### **Your Endpoints:**
```
Base: https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/

POST /stripe-connect-create-account
POST /stripe-connect-account-link
POST /stripe-connect-account-status
```

### **Required Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
apikey: YOUR_SUPABASE_ANON_KEY
```

### **Get Supabase Anon Key:**
1. Go to: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/api
2. Copy "anon public" key

---

## 💬 AFTER TESTING

Once testing is complete, let me know the results and we can:

**Option A:** Build the payment checkout function (40 min)  
**Option B:** Build the webhook handler (20 min)  
**Option C:** Start frontend integration (3 hours)  
**Option D:** Deploy to production

---

**Bismillah - Let's test this! 🚀**

**Expected Time:** 15 minutes  
**Difficulty:** Easy (follow steps)  
**Value:** HIGH (validates entire backend!)
