# 🚀 Frontend Render Deployment Guide - v0.1.9

## 📋 Branch Information

**Branch Name:** `booking-tms-beta-0.1.9`  
**Tag:** `booking-tms-beta-0.1.9`  
**Purpose:** Production frontend deployment on Render  
**Type:** Static Site (Vite + React)

---

## ✅ Pre-Deployment Checklist

### **Files Added for Render:**
- ✅ `render.yaml` - Render configuration file
- ✅ `.env.example` - Environment variables template
- ✅ This deployment guide

### **Build Configuration:**
- ✅ Build command: `npm install && npm run build`
- ✅ Output directory: `build/`
- ✅ Node version: 20.10.0
- ✅ Static site hosting

---

## 🔧 Deployment Steps on Render

### **Option 1: Using render.yaml (Recommended)**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com

2. **Create New Static Site**
   - Click "New +" → "Static Site"
   - Or use "Blueprint" to auto-detect `render.yaml`

3. **Connect Repository**
   - Repository: `marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2`
   - Branch: `booking-tms-beta-0.1.9`

4. **Render will auto-detect the configuration from render.yaml**

5. **Add Environment Variables** (in Render dashboard):
   ```bash
   VITE_SUPABASE_URL=https://ohfjkcajnqvethmrpdwc.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
   VITE_API_URL=https://bookingtms-backend-api.onrender.com
   ```

6. **Click "Create Static Site"**

---

### **Option 2: Manual Configuration**

If render.yaml doesn't auto-configure:

1. **Basic Settings:**
   - Name: `bookingtms-frontend`
   - Branch: `booking-tms-beta-0.1.9`
   - Root Directory: `.` (leave empty)

2. **Build Settings:**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

3. **Environment:**
   - Add environment variables (see above)

4. **Advanced Settings:**
   - Auto-Deploy: Yes
   - Pull Request Previews: No (optional)

---

## 🌐 Environment Variables Required

### **Critical (Must Set):**

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://bookingtms-backend-api.onrender.com` | Backend API URL |
| `VITE_SUPABASE_URL` | `https://ohfjkcajnqvethmrpdwc.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Get from Supabase | Public anonymous key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Get from Stripe | Publishable key (pk_test_...) |

### **Where to Get Keys:**

**Supabase Anon Key:**
1. Go to: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/settings/api
2. Copy "anon" / "public" key
3. Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Stripe Publishable Key:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy "Publishable key"
3. Starts with: `pk_test_...` or `pk_live_...`

---

## 🔗 Post-Deployment Configuration

### **1. Update Backend CORS**

After deployment, you'll get a URL like: `https://bookingtms-frontend.onrender.com`

Update backend environment variable:
```bash
ALLOWED_ORIGINS=https://bookingtms-frontend.onrender.com,http://localhost:5173
```

Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env

### **2. Update Stripe Webhook (if using)**

If you're using Stripe webhooks, update the return URL:
```
https://bookingtms-frontend.onrender.com/payment/success
https://bookingtms-frontend.onrender.com/payment/cancel
```

---

## 📊 Expected Build Output

### **Build Process:**
```bash
[1/4] Installing dependencies...
[2/4] Running build command...
[3/4] Optimizing build...
[4/4] Publishing to CDN...
```

### **Build Time:** ~2-3 minutes

### **Output Structure:**
```
build/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [static files]
```

---

## ✅ Verification Steps

### **1. Check Build Logs**
- Ensure build completes without errors
- Verify all assets are generated

### **2. Test Deployed Site**
```bash
# Health check (replace with your URL)
curl https://bookingtms-frontend.onrender.com

# Should return HTML page
```

### **3. Browser Test**
1. Open the Render URL in browser
2. Check browser console for errors
3. Verify API connection to backend
4. Test Supabase connection
5. Test Stripe integration

### **4. Functionality Test**
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Authentication (login/register)
- ✅ Booking system
- ✅ Payment integration
- ✅ Database connection

---

## 🐛 Troubleshooting

### **Build Fails - "command not found"**
**Solution:** Ensure `package.json` has correct scripts:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

### **404 on Routes**
**Solution:** render.yaml includes SPA routing:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### **Environment Variables Not Working**
**Solution:** 
- Ensure variables start with `VITE_`
- Rebuild after adding variables
- Check Render dashboard → Environment tab

### **API Connection Failed**
**Solution:**
- Verify `VITE_API_URL` is correct
- Check backend CORS settings
- Ensure backend is running

### **White Screen / Blank Page**
**Solution:**
- Check browser console for errors
- Verify build output directory is `build`
- Check if `index.html` exists in build folder

---

## 📈 Performance Optimization

### **Already Configured:**
- ✅ Asset caching (1 year for build assets)
- ✅ Security headers (XSS, Frame options)
- ✅ Static file compression
- ✅ CDN distribution

### **Additional Optimizations:**
```yaml
# In render.yaml (already added)
headers:
  - path: /build/assets/*
    name: Cache-Control
    value: public, max-age=31536000, immutable
```

---

## 🔄 Continuous Deployment

### **Auto-Deploy Enabled:**
- Every push to `booking-tms-beta-0.1.9` triggers deployment
- Build time: ~2-3 minutes
- Zero-downtime deployment

### **Manual Deployment:**
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

---

## 📋 Branch Management

### **Development Workflow:**
```bash
# Work on main branch
git checkout main
# Make changes...
git add .
git commit -m "feat: new feature"

# When ready to deploy
git checkout booking-tms-beta-0.1.9
git merge main
git push origin booking-tms-beta-0.1.9

# Render auto-deploys
```

### **Rollback:**
```bash
# In Render dashboard
# Go to "Deploys" tab
# Click "Rollback" on a previous successful deploy
```

---

## 🎯 Success Criteria

- ✅ Build completes successfully
- ✅ Site is accessible via Render URL
- ✅ All routes work (no 404s)
- ✅ API connection established
- ✅ Supabase connection working
- ✅ Stripe integration functional
- ✅ No console errors
- ✅ Fast page load (<2s)

---

## 📱 Monitoring

### **Render Dashboard:**
- **URL:** https://dashboard.render.com
- **Metrics:** Traffic, bandwidth, build history
- **Logs:** Real-time deployment and runtime logs

### **Health Checks:**
- Render automatically monitors site uptime
- Email notifications on failures

---

## 🔗 Important Links

### **Deployment:**
- **Render Dashboard:** https://dashboard.render.com
- **This Repository:** https://github.com/marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2

### **Backend:**
- **API URL:** https://bookingtms-backend-api.onrender.com
- **Backend Service:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

### **External Services:**
- **Supabase:** https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc
- **Stripe:** https://dashboard.stripe.com

---

## 📝 Version Info

**Version:** 0.1.9  
**Branch:** booking-tms-beta-0.1.9  
**Tag:** booking-tms-beta-0.1.9  
**Framework:** Vite + React + TypeScript  
**Build Tool:** Vite 6.3.5  
**Node Version:** 20.10.0  
**Deployment:** Render Static Site  

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] All code is committed to `booking-tms-beta-0.1.9` branch
- [ ] Environment variables are ready
- [ ] Backend is deployed and working
- [ ] Supabase keys are available
- [ ] Stripe keys are available
- [ ] `render.yaml` is configured
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors: `npm run build`
- [ ] All dependencies are in `package.json`

---

## 🎉 Ready to Deploy!

Your branch is configured and ready for Render deployment.

**Next Steps:**
1. Push this branch to GitHub
2. Go to Render dashboard
3. Create new static site
4. Point to `booking-tms-beta-0.1.9` branch
5. Add environment variables
6. Deploy!

**Estimated Time to Live:** 5-10 minutes

🚀 **Happy Deploying!**
