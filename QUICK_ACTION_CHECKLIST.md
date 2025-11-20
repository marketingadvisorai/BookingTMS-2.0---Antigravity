# ✅ Quick Action Checklist

## 🎯 **Complete These Steps to Go Live**

### **Backend (Render) - 10 minutes**

- [ ] **1. Fix Start Command** (1 min)
  - Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/settings
  - Change Start Command: `yarn start` → `npm start`
  - Click "Save Changes"

- [ ] **2. Add Environment Variables** (5 min)
  - Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/env
  - Add these required variables:
    ```
    NODE_ENV=production
    PORT=3001
    SUPABASE_URL=<your-supabase-url>
    SUPABASE_SERVICE_ROLE_KEY=<your-key>
    STRIPE_SECRET_KEY=<your-stripe-key>
    STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
    JWT_SECRET=[Click Generate]
    ENCRYPTION_KEY=[Click Generate]
    ALLOWED_ORIGINS=http://localhost:5173
    ```
  - Click "Save Changes"

- [ ] **3. Wait for Deployment** (3 min)
  - Service will auto-redeploy
  - Monitor: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g/logs

- [ ] **4. Verify Backend** (1 min)
  ```bash
  curl https://bookingtms-backend-api.onrender.com/health
  ```

### **Frontend (Vercel) - 15 minutes**

- [ ] **5. Sign Up for Vercel** (2 min)
  - Go to: https://vercel.com
  - Sign in with GitHub

- [ ] **6. Import Repository** (3 min)
  - Click "Add New Project"
  - Select your GitHub repository
  - Click "Import"

- [ ] **7. Configure Build Settings** (2 min)
  - Framework Preset: Vite
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `dist`

- [ ] **8. Add Environment Variables** (3 min)
  ```
  VITE_BACKEND_API_URL=https://bookingtms-backend-api.onrender.com
  VITE_STRIPE_PUBLISHABLE_KEY=<your-publishable-key>
  ```

- [ ] **9. Deploy** (5 min)
  - Click "Deploy"
  - Wait for deployment to complete
  - Get your URL: `https://your-app.vercel.app`

- [ ] **10. Update Backend CORS** (1 min)
  - Go back to Render environment variables
  - Update `ALLOWED_ORIGINS` to include your Vercel URL:
    ```
    https://your-app.vercel.app,http://localhost:5173
    ```

### **Stripe Webhooks - 5 minutes**

- [ ] **11. Configure Stripe Webhook** (5 min)
  - Go to: https://dashboard.stripe.com/webhooks
  - Click "Add endpoint"
  - Endpoint URL: `https://bookingtms-backend-api.onrender.com/api/webhooks/stripe`
  - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
  - Click "Add endpoint"
  - Copy webhook signing secret
  - Add to Render: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🎉 **You're Live!**

**Backend:** https://bookingtms-backend-api.onrender.com  
**Frontend:** https://your-app.vercel.app  

**Total Time:** ~30 minutes  
**Cost:** $0 (all free tiers)

---

## 📝 **Quick Reference**

### **Backend URLs:**
- Health: `https://bookingtms-backend-api.onrender.com/health`
- API Info: `https://bookingtms-backend-api.onrender.com/api`
- Config: `https://bookingtms-backend-api.onrender.com/api/config`

### **Dashboard Links:**
- Render Backend: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g
- Vercel Frontend: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard
- Stripe: https://dashboard.stripe.com

### **Documentation:**
- Full Plan: `DEPLOYMENT_PLAN_AND_ARCHITECTURE.md`
- Backend Config: `FINAL_RENDER_CONFIG.md`
- Fixes Summary: `BACKEND_FINAL_FIXES_SUMMARY.md`
