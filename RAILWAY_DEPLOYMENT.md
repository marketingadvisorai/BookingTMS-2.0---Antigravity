# Railway Deployment Guide
**Project:** Booking TMS - Escape Room MVP  
**Platform:** Railway.app  
**Date:** November 18, 2025

---

## 🚂 Why Railway?

✅ **Automatic deploys** from Git  
✅ **Environment variable management** built-in  
✅ **PostgreSQL** if needed (we use Supabase)  
✅ **Better pricing** than Render for our use case  
✅ **Simpler setup** - no rootDir issues  
✅ **Instant rollbacks** via Railway dashboard  

---

## 🏗️ Architecture on Railway

```
Railway Project: Booking TMS MVP
├── Frontend Service (Vite + React)
│   ├── Branch: develop/mvp-escape-room-v1.0
│   ├── Build: npm run build
│   ├── Start: npm run preview
│   └── Port: 4173
│
├── Backend Service (Node.js + Express)
│   ├── Branch: develop/mvp-escape-room-v1.0
│   ├── Root: src/backend
│   ├── Build: npm install
│   ├── Start: node dist/server.js
│   └── Port: 3001
│
└── External Services
    ├── Supabase (Database, Auth, Storage)
    ├── Stripe (Payments)
    └── SendGrid (Email)
```

---

## 📦 Setup Instructions

### 1. Create Railway Project

```bash
# Install Railway CLI (if needed)
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init
```

**Or use Railway Dashboard:**
1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

---

### 2. Configure Frontend Service

**Service Name:** `booking-tms-frontend`

**Settings:**
```yaml
Build Command: npm install && npm run build
Start Command: npm run preview -- --host 0.0.0.0 --port $PORT
Root Directory: /
Branch: develop/mvp-escape-room-v1.0
```

**Environment Variables:**
```env
NODE_ENV=production
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-pk>
VITE_API_URL=${{RAILWAY_PRIVATE_DOMAIN}}
```

**Port:** Railway auto-assigns (use `$PORT`)

---

### 3. Configure Backend Service

**Service Name:** `booking-tms-backend`

**Settings:**
```yaml
Build Command: cd src/backend && npm install && npm run build
Start Command: cd src/backend && node dist/server.js
Root Directory: /
Branch: develop/mvp-escape-room-v1.0
```

**Environment Variables:**
```env
NODE_ENV=production
PORT=$PORT
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
STRIPE_SECRET_KEY=<your-stripe-sk>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
SENDGRID_API_KEY=<your-sendgrid-key>
FRONTEND_URL=${{booking-tms-frontend.RAILWAY_PUBLIC_DOMAIN}}
```

---

### 4. Connect Services

**Frontend → Backend:**
```typescript
// In frontend .env
VITE_API_URL=https://booking-tms-backend.railway.app
```

**Backend CORS:**
```typescript
// src/backend/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

## 🔐 Environment Variables Setup

### Required Variables

#### Frontend (.env.production)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_API_URL=https://booking-tms-backend.railway.app
```

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SENDGRID_API_KEY=SG.xxxxx
FRONTEND_URL=https://booking-tms-frontend.railway.app
```

---

## 🚀 Deployment Workflow

### Automatic Deployment
```bash
# Push to develop branch
git push origin develop/mvp-escape-room-v1.0

# Railway auto-deploys both services
# ✅ Frontend rebuilds
# ✅ Backend rebuilds
# ✅ Services restart
```

### Manual Deployment via CLI
```bash
# Deploy frontend
railway up --service booking-tms-frontend

# Deploy backend
railway up --service booking-tms-backend
```

### Rollback
```bash
# Via Railway Dashboard
# → Select service
# → Deployments
# → Click on previous successful deployment
# → "Redeploy"
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Frontend logs
railway logs --service booking-tms-frontend

# Backend logs
railway logs --service booking-tms-backend

# Follow logs (real-time)
railway logs --service booking-tms-backend --follow
```

### Metrics
- CPU usage
- Memory usage
- Network traffic
- Response times

**Access:** Railway Dashboard → Service → Metrics

---

## 🔧 Custom Domains (Optional)

### Add Custom Domain
1. Railway Dashboard → Service → Settings → Domains
2. Add domain: `bookings.yourdomain.com`
3. Update DNS:
   ```
   CNAME: bookings → yourapp.railway.app
   ```

---

## 💰 Cost Estimate

### Railway Pricing (as of 2025)
- **Starter Plan:** $5/month
  - $5 free credits
  - Pay for usage beyond credits
  
### Estimated Monthly Cost
- Frontend: ~$3-5/month (static site)
- Backend: ~$5-10/month (light API traffic)
- **Total:** ~$8-15/month

### Cost Optimization
- Use Supabase for heavy lifting (included in Supabase plan)
- Keep backend lightweight
- Use Railway for routing/orchestration only

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs
railway logs --service <service-name>

# Common issues:
# 1. Missing dependencies → Check package.json
# 2. Build command wrong → Check Railway settings
# 3. Environment variables → Check Railway dashboard
```

### Service Won't Start
```bash
# Check start command
# Frontend: npm run preview -- --host 0.0.0.0 --port $PORT
# Backend: node dist/server.js

# Check port binding
# Must use process.env.PORT
```

### CORS Errors
```bash
# Ensure FRONTEND_URL is set correctly in backend
# Check CORS configuration in backend/server.ts
```

---

## 📋 Deployment Checklist

### Before First Deploy
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set up Supabase project
- [ ] Get Stripe API keys
- [ ] Get SendGrid API key
- [ ] Configure environment variables

### Each Deployment
- [ ] Test locally first
- [ ] Run build: `npm run build`
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Commit changes
- [ ] Push to develop branch
- [ ] Monitor Railway deployment
- [ ] Test deployed app
- [ ] Check logs for errors

### After Deployment
- [ ] Test booking flow end-to-end
- [ ] Test payment processing
- [ ] Test email delivery
- [ ] Check mobile responsiveness
- [ ] Monitor error rates

---

## 🔗 Useful Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Docs:** https://docs.railway.app
- **Supabase Dashboard:** https://app.supabase.com
- **Stripe Dashboard:** https://dashboard.stripe.com

---

## 🎯 Migration from Render (if needed)

### Export Environment Variables from Render
1. Render Dashboard → Service → Environment
2. Copy all variables
3. Paste into Railway Dashboard

### Update Git Branches
```bash
# Railway will deploy from develop branch
git push origin develop/mvp-escape-room-v1.0
```

### Update DNS (if using custom domain)
1. Remove old CNAME to Render
2. Add new CNAME to Railway

---

## 💡 Best Practices

1. **Use Railway Templates** for common setups
2. **Monitor costs** weekly
3. **Enable GitHub auto-deploy** for CI/CD
4. **Use Railway private networking** for service-to-service communication
5. **Set up alerting** for errors/downtime
6. **Keep backups** of environment variables

---

**Last Updated:** 2025-11-18 12:25 UTC+06  
**Status:** Ready for deployment
