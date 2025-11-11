# 🚀 Complete Environment Variables Setup - Action Required

## ✅ What's Been Done via MCP

I've automatically added these environment variables to your Render service:

### **✅ Configured (No Action Needed):**
```bash
✅ NODE_ENV=production
✅ PORT=10000
✅ ALLOWED_ORIGINS=http://localhost:5173,https://bookingtms-backend-api.onrender.com
✅ SESSION_TIMEOUT=3600000
✅ RATE_LIMIT_WINDOW_MS=900000
✅ RATE_LIMIT_MAX_REQUESTS=100
✅ SENDGRID_FROM_NAME=BookingTMS
✅ SENDGRID_FROM_EMAIL=noreply@bookingtms.com
✅ OPENAI_MODEL=gpt-4-turbo-preview
✅ SUPABASE_URL=https://ohfjkcajnqvethmrpdwc.supabase.co
✅ JWT_SECRET=dtEl85h2Smg2zNIf5eaDqhR0qBhAAJFJvz+wbq2Yfmo=
✅ ENCRYPTION_KEY=c3+Rc/tfh99WgUZQRU+Ir1zmQzQMRGEVakNZMlUpgtI=
```

### **⚠️ Placeholder Values (Need Your Real Keys):**
```bash
⚠️ SUPABASE_SERVICE_ROLE_KEY=PLEASE_ADD_YOUR_SERVICE_ROLE_KEY_FROM_SUPABASE_DASHBOARD
⚠️ STRIPE_SECRET_KEY=PLEASE_ADD_YOUR_STRIPE_SECRET_KEY
⚠️ STRIPE_WEBHOOK_SECRET=PLEASE_ADD_YOUR_STRIPE_WEBHOOK_SECRET
⚠️ SENDGRID_API_KEY=OPTIONAL_ADD_IF_YOU_WANT_EMAIL
⚠️ TWILIO_ACCOUNT_SID=OPTIONAL_ADD_IF_YOU_WANT_SMS
⚠️ TWILIO_AUTH_TOKEN=OPTIONAL_ADD_IF_YOU_WANT_SMS
⚠️ TWILIO_PHONE_NUMBER=+1234567890
⚠️ OPENAI_API_KEY=OPTIONAL_ADD_IF_YOU_WANT_AI
```

---

## 🔴 CRITICAL: Add These 3 Keys Now

### **1. Supabase Service Role Key** (REQUIRED)

**Get it here:**
1. Go to: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/api
2. Scroll to "Project API keys"
3. Find **"service_role"** key (NOT the anon key)
4. Click "Reveal" and copy the key
5. It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Add it to Render:**
- Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
- Find `SUPABASE_SERVICE_ROLE_KEY`
- Replace the placeholder with your actual key
- Click "Save Changes"

---

### **2. Stripe Secret Key** (REQUIRED)

**Get it here:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Find **"Secret key"** (NOT the publishable key)
3. Click "Reveal test key" and copy it
4. It starts with `sk_test_...` (or `sk_live_...` for production)

**Add it to Render:**
- Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
- Find `STRIPE_SECRET_KEY`
- Replace the placeholder with your actual key
- Click "Save Changes"

---

### **3. Stripe Webhook Secret** (REQUIRED)

**Get it here:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://bookingtms-backend-api.onrender.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.created`
   - `customer.updated`
5. Click "Add endpoint"
6. Click on the newly created endpoint
7. Click "Reveal" under "Signing secret"
8. Copy the secret (starts with `whsec_...`)

**Add it to Render:**
- Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
- Find `STRIPE_WEBHOOK_SECRET`
- Replace the placeholder with your actual secret
- Click "Save Changes"

---

## 🟡 Optional Services (Add Later if Needed)

### **SendGrid (Email Notifications)**
Only add if you want to send emails:
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Create API key with "Full Access"
3. Copy the key (starts with `SG.`)
4. Update `SENDGRID_API_KEY` in Render

### **Twilio (SMS Notifications)**
Only add if you want to send SMS:
1. Go to: https://console.twilio.com/
2. Get Account SID and Auth Token from dashboard
3. Get a phone number from: https://console.twilio.com/phone-numbers
4. Update `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in Render

### **OpenAI (AI Features)**
Only add if you want AI-powered features:
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (starts with `sk-`)
4. Update `OPENAI_API_KEY` in Render

---

## 🚀 After Adding the 3 Required Keys

1. **Click "Save Changes"** in Render
2. **Service will auto-redeploy** (takes 3-5 minutes)
3. **Monitor deployment:**
   - https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/logs

4. **Test the backend:**
   ```bash
   curl https://bookingtms-backend-api.onrender.com/health
   ```

   **Expected response:**
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-11-11T...",
     "uptime": 123.456,
     "environment": "production"
   }
   ```

---

## 📊 Deployment Status

**Environment Variables:** ✅ 12/20 configured (60%)  
**Required Keys Remaining:** 🔴 3 (Supabase, Stripe x2)  
**Optional Keys:** 🟡 5 (can add later)  
**Build Status:** ✅ SUCCESS  
**Service Status:** ⏳ Waiting for required keys  

---

## 🎯 Quick Action Steps

1. **Open Render Dashboard** (2 min)
   - https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env

2. **Get Supabase Service Role Key** (1 min)
   - https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/api
   - Copy service_role key

3. **Get Stripe Keys** (2 min)
   - https://dashboard.stripe.com/test/apikeys
   - Copy secret key
   - Create webhook endpoint
   - Copy webhook secret

4. **Update Render Environment Variables** (1 min)
   - Replace 3 placeholder values
   - Click "Save Changes"

5. **Wait for Deployment** (3-5 min)
   - Monitor logs
   - Test health endpoint

**Total Time: ~10 minutes**

---

## 🔗 Quick Links

- **Render Env Vars:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
- **Render Logs:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/logs
- **Supabase API Settings:** https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/api
- **Stripe API Keys:** https://dashboard.stripe.com/test/apikeys
- **Stripe Webhooks:** https://dashboard.stripe.com/test/webhooks

---

## ✅ Success Checklist

- [ ] Added Supabase service_role key to Render
- [ ] Added Stripe secret key to Render
- [ ] Created Stripe webhook endpoint
- [ ] Added Stripe webhook secret to Render
- [ ] Clicked "Save Changes" in Render
- [ ] Waited for deployment to complete
- [ ] Tested health endpoint successfully
- [ ] Backend is fully operational

**Once complete, your backend will be live and ready to use! 🎉**
