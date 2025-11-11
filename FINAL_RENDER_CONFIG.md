# 🎯 Final Render Configuration - Copy & Paste Ready

## ⚡ Quick Fix (5 Minutes Total)

Since Render CLI cannot update service settings, here's everything you need to copy and paste into the dashboard.

---

## 📋 Step 1: Update Service Settings (2 minutes)

### **Go to Settings:**
👉 **[Click Here to Open Settings](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/settings)**

### **Find "Build & Deploy" Section**

**Root Directory:**
```
src/backend
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Click "Save Changes"** ✅

---

## 🔐 Step 2: Add Environment Variables (3 minutes)

### **Go to Environment:**
👉 **[Click Here to Open Environment](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env)**

### **Click "Add Environment Variable" for each:**

---

### **Server Configuration:**

**Variable 1:**
```
Key: NODE_ENV
Value: production
```

**Variable 2:**
```
Key: PORT
Value: 3001
```

**Variable 3:**
```
Key: API_BASE_URL
Value: https://bookingtms-backend-api.onrender.com
```

---

### **Supabase (REQUIRED - Get from Supabase Dashboard):**

**Variable 4:**
```
Key: SUPABASE_URL
Value: [Your Supabase Project URL]
```
📍 Get from: https://supabase.com/dashboard → Your Project → Settings → API

**Variable 5:**
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: [Your Service Role Key]
```
📍 Get from: https://supabase.com/dashboard → Your Project → Settings → API → service_role key

---

### **Stripe (REQUIRED - Get from Stripe Dashboard):**

**Variable 6:**
```
Key: STRIPE_SECRET_KEY
Value: [Your Stripe Secret Key]
```
📍 Get from: https://dashboard.stripe.com/apikeys

**Variable 7:**
```
Key: STRIPE_PUBLISHABLE_KEY
Value: [Your Stripe Publishable Key]
```
📍 Get from: https://dashboard.stripe.com/apikeys

**Variable 8:**
```
Key: STRIPE_WEBHOOK_SECRET
Value: [Your Stripe Webhook Secret]
```
📍 Get from: https://dashboard.stripe.com/webhooks

---

### **Security (GENERATE in Render):**

**Variable 9:**
```
Key: JWT_SECRET
Value: [Click "Generate Value" button]
```

**Variable 10:**
```
Key: ENCRYPTION_KEY
Value: [Click "Generate Value" button]
```

---

### **CORS Configuration:**

**Variable 11:**
```
Key: ALLOWED_ORIGINS
Value: https://your-frontend-url.com,http://localhost:5173
```
⚠️ Replace `your-frontend-url.com` with your actual frontend URL

---

### **Rate Limiting:**

**Variable 12:**
```
Key: SESSION_TIMEOUT
Value: 3600000
```

**Variable 13:**
```
Key: RATE_LIMIT_WINDOW_MS
Value: 900000
```

**Variable 14:**
```
Key: RATE_LIMIT_MAX_REQUESTS
Value: 100
```

---

### **Click "Save Changes"** ✅

---

## ⏱️ Step 3: Wait for Deployment (5-10 minutes)

Service will automatically redeploy after saving changes.

### **Monitor Progress:**

**Option 1 - CLI:**
```bash
render logs --resources srv-d49gml95pdvs73ctdb5g --tail
```

**Option 2 - Dashboard:**
👉 **[View Logs](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/logs)**

### **Wait for:**
```
==> Build successful 🎉
==> Deploying...
==> Service is live 🚀
```

---

## ✅ Step 4: Verify Deployment (1 minute)

### **Test Health Endpoint:**
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

### **Test API Endpoint:**
```bash
curl https://bookingtms-backend-api.onrender.com/api
```

**Expected Response:**
```json
{
  "name": "BookingTMS API",
  "version": "0.1.0",
  "endpoints": {
    "config": "/api/config",
    ...
  }
}
```

### **Test Configuration:**
```bash
curl https://bookingtms-backend-api.onrender.com/api/config
```

---

## 🎉 Success Checklist

- [ ] Root Directory set to `src/backend`
- [ ] Build Command updated
- [ ] Start Command updated
- [ ] All 14 environment variables added
- [ ] JWT_SECRET and ENCRYPTION_KEY generated
- [ ] Saved changes
- [ ] Deployment completed successfully
- [ ] Health endpoint returns 200 OK
- [ ] API endpoint returns service info
- [ ] Configuration endpoint works

---

## 📊 Your Service URLs

**Base URL:**
```
https://bookingtms-backend-api.onrender.com
```

**Health Check:**
```
https://bookingtms-backend-api.onrender.com/health
```

**API Info:**
```
https://bookingtms-backend-api.onrender.com/api
```

**Configuration:**
```
https://bookingtms-backend-api.onrender.com/api/config
```

**Save API Keys:**
```
POST https://bookingtms-backend-api.onrender.com/api/config/save
```

---

## 🔄 After Successful Deployment

### **1. Update Frontend:**
```typescript
// In your frontend .env file
VITE_BACKEND_API_URL=https://bookingtms-backend-api.onrender.com
```

### **2. Configure Stripe Webhooks:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://bookingtms-backend-api.onrender.com/api/webhooks/stripe`
4. Select events
5. Copy webhook secret
6. Update `STRIPE_WEBHOOK_SECRET` in Render

### **3. Test from Frontend:**
Update your frontend API calls to use the new backend URL and test all functionality.

---

## 🆘 Troubleshooting

### **Build Still Failing?**
- Double-check Root Directory is exactly: `src/backend`
- Verify Build Command is: `npm install && npm run build`
- Check logs for specific errors

### **Service Won't Start?**
- Ensure all required environment variables are set
- Check Supabase URL and keys are correct
- Verify Stripe keys are valid

### **404 Errors?**
- Wait for deployment to complete (5-10 minutes)
- Check service status in dashboard
- Verify URL is correct

---

## ⏱️ Total Time Estimate

- **Step 1 (Settings):** 2 minutes
- **Step 2 (Environment):** 3 minutes
- **Step 3 (Deployment):** 5-10 minutes
- **Step 4 (Verification):** 1 minute

**Total:** ~15 minutes

---

## 🎯 Quick Links

- **Settings:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/settings
- **Environment:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
- **Logs:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/logs
- **Dashboard:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

---

**Everything is ready! Just follow the steps above and your backend will be live in ~15 minutes!** 🚀
