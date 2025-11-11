# 🔐 Environment Variables Setup
## For Service: bookingtms-backend-api (srv-d49gml95pdvs73ctdb5g)

**Service URL:** https://bookingtms-backend-api.onrender.com

---

## 📋 How to Add Environment Variables

### **Method 1: Via Render Dashboard (Recommended)**

1. Go to your service: [bookingtms-backend-api Settings](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env)
2. Click **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"**
4. Add each variable below
5. Click **"Save Changes"**
6. Service will automatically redeploy

### **Method 2: Via Render CLI**

```bash
# Set environment variables using CLI
render env set NODE_ENV=production --service-id srv-d49gml95pdvs73ctdb5g
render env set PORT=3001 --service-id srv-d49gml95pdvs73ctdb5g
# ... (repeat for each variable)
```

---

## ✅ Required Environment Variables

### **1. Server Configuration**
```bash
Key: NODE_ENV
Value: production

Key: PORT
Value: 3001

Key: API_BASE_URL
Value: https://bookingtms-backend-api.onrender.com
```

### **2. Supabase (REQUIRED)**
```bash
Key: SUPABASE_URL
Value: [Your Supabase Project URL]
Example: https://abcdefghijk.supabase.co

Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Your Supabase Service Role Key]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to Settings → API
- Copy "Project URL" and "service_role" key

### **3. Stripe (REQUIRED)**
```bash
Key: STRIPE_SECRET_KEY
Value: [Your Stripe Secret Key]
Example: sk_test_... or sk_live_...

Key: STRIPE_PUBLISHABLE_KEY
Value: [Your Stripe Publishable Key]
Example: pk_test_... or pk_live_...

Key: STRIPE_WEBHOOK_SECRET
Value: [Your Stripe Webhook Secret]
Example: whsec_...
```

**Where to find:**
- Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- Copy your API keys
- For webhook secret: [Webhooks](https://dashboard.stripe.com/webhooks)

### **4. Security (AUTO-GENERATE)**
```bash
Key: JWT_SECRET
Value: [Click "Generate Value" button in Render]

Key: ENCRYPTION_KEY
Value: [Click "Generate Value" button in Render]
```

### **5. CORS Configuration**
```bash
Key: ALLOWED_ORIGINS
Value: https://your-frontend-url.com,http://localhost:5173
Note: Replace with your actual frontend URL
```

### **6. Rate Limiting**
```bash
Key: SESSION_TIMEOUT
Value: 3600000

Key: RATE_LIMIT_WINDOW_MS
Value: 900000

Key: RATE_LIMIT_MAX_REQUESTS
Value: 100
```

---

## 🔧 Optional Environment Variables

### **SendGrid (For Email Notifications)**
```bash
Key: SENDGRID_API_KEY
Value: SG.your_api_key

Key: SENDGRID_FROM_EMAIL
Value: noreply@yourdomain.com

Key: SENDGRID_FROM_NAME
Value: BookingTMS
```

### **Twilio (For SMS Notifications)**
```bash
Key: TWILIO_ACCOUNT_SID
Value: ACxxxxxxxxxxxxx

Key: TWILIO_AUTH_TOKEN
Value: your_auth_token

Key: TWILIO_PHONE_NUMBER
Value: +1234567890
```

### **OpenAI (For AI Features)**
```bash
Key: OPENAI_API_KEY
Value: sk-your_openai_key

Key: OPENAI_ORG_ID
Value: org-your_org_id

Key: OPENAI_MODEL
Value: gpt-4-turbo-preview
```

---

## 📝 Quick Copy-Paste Template

**For Render Dashboard:**

```
NODE_ENV=production
PORT=3001
API_BASE_URL=https://bookingtms-backend-api.onrender.com
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
JWT_SECRET=[Generate]
ENCRYPTION_KEY=[Generate]
ALLOWED_ORIGINS=https://your-frontend-url.com,http://localhost:5173
SESSION_TIMEOUT=3600000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## ✅ After Adding Variables

### **1. Save Changes**
Click "Save Changes" in Render Dashboard

### **2. Wait for Deployment**
- Service will automatically redeploy (5-10 minutes)
- Watch the logs for any errors

### **3. Verify Deployment**

**Check Health:**
```bash
curl https://bookingtms-backend-api.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-11T...",
  "uptime": 123.456,
  "environment": "production"
}
```

**Check API:**
```bash
curl https://bookingtms-backend-api.onrender.com/api
```

**Check Configuration:**
```bash
curl https://bookingtms-backend-api.onrender.com/api/config
```

---

## 🔄 Update Frontend

After backend is deployed, update your frontend:

```typescript
// In your frontend .env file
VITE_BACKEND_API_URL=https://bookingtms-backend-api.onrender.com
```

---

## 🪝 Configure Stripe Webhooks

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://bookingtms-backend-api.onrender.com/api/webhooks/stripe`
4. Select events to listen for
5. Copy webhook signing secret
6. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## 📊 Monitor Your Service

### **View Logs:**
```bash
render logs --service-id srv-d49gml95pdvs73ctdb5g
```

Or visit: [Logs Dashboard](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/logs)

### **View Metrics:**
Visit: [Metrics Dashboard](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/metrics)

---

## 🆘 Troubleshooting

### **Service Won't Start:**
1. Check all required environment variables are set
2. Check logs for errors
3. Verify Supabase and Stripe keys are correct

### **Health Check Fails:**
1. Wait for deployment to complete
2. Check PORT is set to 3001
3. Verify build completed successfully

### **CORS Errors:**
1. Update `ALLOWED_ORIGINS` with your frontend URL
2. Restart service after updating

---

## ✅ Deployment Checklist

- [ ] Add all required environment variables
- [ ] Generate JWT_SECRET and ENCRYPTION_KEY
- [ ] Update ALLOWED_ORIGINS with frontend URL
- [ ] Save changes and wait for deployment
- [ ] Test health endpoint
- [ ] Test API endpoints
- [ ] Update frontend with backend URL
- [ ] Configure Stripe webhooks
- [ ] Enable auto-deploy (optional)
- [ ] Monitor logs for errors

---

**Service ID:** srv-d49gml95pdvs73ctdb5g  
**Service URL:** https://bookingtms-backend-api.onrender.com  
**Dashboard:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

**Your backend is almost ready! Just add the environment variables and you're done!** 🚀
