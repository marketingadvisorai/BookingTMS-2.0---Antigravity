# Stripe OAuth Setup Instructions

**Date:** November 18, 2025  
**Account:** Booking TMS Beta Stripe V 0.1  
**Account ID:** `acct_1SPfkcFajiBPZ08x`

---

## ✅ Current Stripe Configuration

### **Account Details:**
- **Display Name:** Booking TMS Beta Stripe V 0.1
- **Account ID:** `acct_1SPfkcFajiBPZ08x`
- **Mode:** Test Mode
- **Test API Key:** `sk_test_51SPfkcFajiBPZ08x...`
- **Test Publishable Key:** `pk_test_51SPfkcFajiBPZ08x...`

### **Webhook Already Configured:**
✅ **Endpoint:** `https://bookingtms-backend-api.onrender.com/api/webhooks/stripe`  
✅ **Secret:** `whsec_uuaHiDCv2SYXGqjsH6b3TFsXv8dYu0Qq`  
✅ **Status:** Enabled  
✅ **Events:** All payment events subscribed

---

## 🔧 Required: OAuth Configuration

### **Step 1: Access Stripe Dashboard**

1. Go to: https://dashboard.stripe.com/settings/connect
2. Log in with your Stripe account
3. Navigate to **Connect** → **Settings**

### **Step 2: Configure OAuth Redirect URIs**

Add the following redirect URIs:

#### **Development:**
```
http://localhost:5173/stripe/oauth/callback
```

#### **Production:**
```
https://yourdomain.com/stripe/oauth/callback
https://bookingtms.com/stripe/oauth/callback
```

### **Step 3: Get Your Client ID**

1. In Connect Settings, find **OAuth settings**
2. Copy your **Client ID** (starts with `ca_`)
3. It should look like: `ca_xxxxxxxxxxxxxxxxxxxxx`

### **Step 4: Add Environment Variables**

#### **Frontend (.env):**
```bash
VITE_STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE
```

#### **Backend (.env):**
```bash
STRIPE_SECRET_KEY=sk_test_51SPfkcFajiBPZ08x09ntX7wnpIbGrtaGFyl4s2YcymN3aIf1XSjnNKXAavDAEZTcBlEE7QmXUoLmOTgfF2onQzCN00HjPviXsM
STRIPE_PUBLISHABLE_KEY=pk_test_51SPfkcFajiBPZ08xxXjAYSAq1LPYO1VC6msslW7eLv3vcGevwA7sQMwXjLIE2NMyBtISZaE1kuPadGav1n6rn4Pe00iTxOseZB
STRIPE_WEBHOOK_SECRET=whsec_uuaHiDCv2SYXGqjsH6b3TFsXv8dYu0Qq
```

---

## 🧪 Testing OAuth Flow

### **Using Stripe CLI:**

```bash
# Test OAuth authorization
stripe oauth authorize \
  --client-id YOUR_CLIENT_ID \
  --redirect-uri http://localhost:5173/stripe/oauth/callback

# This will output an authorization URL
# Open it in your browser to test the flow
```

### **Manual Testing:**

1. Start your frontend: `npm run dev`
2. Start your backend: `cd src/backend && npm start`
3. Navigate to System Admin Dashboard
4. Select an organization
5. Click **"Link Existing Stripe Account"**
6. OAuth popup should open
7. Log in with a test Stripe account
8. Authorize the connection
9. Should redirect to callback page
10. Should show success and redirect back

---

## 📋 OAuth Configuration Checklist

- [ ] Access Stripe Dashboard Connect Settings
- [ ] Add OAuth redirect URI for development
- [ ] Add OAuth redirect URI for production
- [ ] Copy Client ID from dashboard
- [ ] Add `VITE_STRIPE_CONNECT_CLIENT_ID` to frontend .env
- [ ] Verify webhook secret is correct
- [ ] Test OAuth flow in development
- [ ] Test OAuth flow in production
- [ ] Verify account linking works
- [ ] Test deauthorization flow

---

## 🔒 Security Notes

### **Important:**
1. **Never commit** `.env` files to Git
2. **Encrypt** OAuth access tokens in database
3. **Use HTTPS** in production for redirect URIs
4. **Validate** state parameter on callback
5. **Store** refresh tokens securely

### **Token Storage:**
When you receive OAuth tokens from the backend:
```json
{
  "stripe_user_id": "acct_xxx",
  "access_token": "sk_xxx",  // ⚠️ ENCRYPT THIS
  "refresh_token": "rt_xxx"  // ⚠️ ENCRYPT THIS
}
```

Store these in your database with encryption:
```sql
-- Example schema
CREATE TABLE user_stripe_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_account_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  livemode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Going Live

### **Before Production:**

1. **Switch to Live Mode** in Stripe Dashboard
2. **Get Live API Keys:**
   - Live Secret Key: `sk_live_xxx`
   - Live Publishable Key: `pk_live_xxx`
3. **Create Live Webhook:**
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Copy new live webhook secret
4. **Update Production Environment Variables:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_WEBHOOK_SECRET=whsec_live_xxx
   VITE_STRIPE_CONNECT_CLIENT_ID=ca_live_xxx
   ```
5. **Add Production OAuth Redirect URI** in Stripe Dashboard
6. **Test OAuth flow** with real Stripe account
7. **Monitor** webhook deliveries in Stripe Dashboard

---

## 📞 Support

### **Stripe Documentation:**
- OAuth Reference: https://docs.stripe.com/connect/oauth-reference
- Connect Settings: https://dashboard.stripe.com/settings/connect
- Webhook Guide: https://docs.stripe.com/webhooks

### **Current Setup:**
- **Webhook Endpoint:** Already configured ✅
- **OAuth Redirect:** Needs configuration ⚠️
- **Environment Variables:** Needs Client ID ⚠️

---

## ✅ Summary

**What's Already Done:**
- ✅ Stripe account configured
- ✅ Webhook endpoint created
- ✅ Webhook secret stored
- ✅ Backend OAuth routes implemented
- ✅ Frontend OAuth UI implemented
- ✅ Callback page created

**What You Need to Do:**
1. ⚠️ Add OAuth redirect URI in Stripe Dashboard
2. ⚠️ Get Client ID from Stripe Dashboard
3. ⚠️ Add `VITE_STRIPE_CONNECT_CLIENT_ID` to .env
4. ⚠️ Test OAuth flow
5. ⚠️ Implement token storage in database

**Once configured, both buttons will work:**
- **Create Stripe Connect Account** → Creates new account
- **Link Existing Stripe Account** → OAuth flow for existing accounts

---

**Ready to configure!** Follow the steps above to complete the OAuth setup.
