# 🚀 Render Deployment Guide
## Deploy BookingTMS Backend API to Render

**Branch:** `backend-render-deploy`  
**Service Type:** Web Service  
**Runtime:** Node.js  
**Plan:** Free Tier Available

---

## 📋 Prerequisites

### 1. **Render Account**
- Sign up at [render.com](https://render.com)
- Connect your GitHub account

### 2. **Required API Keys**
You'll need these secrets ready:
- ✅ Supabase URL and Service Role Key
- ✅ Stripe Secret Key, Publishable Key, Webhook Secret
- ✅ SendGrid API Key
- ✅ Twilio Account SID, Auth Token, Phone Number
- ✅ OpenAI API Key

---

## 🚀 Deployment Steps

### **Method 1: Automatic Deployment (Recommended)**

#### Step 1: Push Branch to GitHub
```bash
# Already on backend-render-deploy branch
git add -A
git commit -m "chore: Prepare backend for Render deployment"
git push origin backend-render-deploy
```

#### Step 2: Create New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select branch: **`backend-render-deploy`**

#### Step 3: Configure Service
**Basic Settings:**
- **Name:** `bookingtms-backend-api`
- **Region:** Oregon (US West) or closest to you
- **Branch:** `backend-render-deploy`
- **Runtime:** Node
- **Build Command:** `cd src/backend && npm install && npm run build`
- **Start Command:** `cd src/backend && npm start`
- **Plan:** Free

#### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

**Required Variables:**
```bash
# Server Configuration
NODE_ENV=production
PORT=3001
API_BASE_URL=https://your-service-name.onrender.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# SendGrid
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=BookingTMS

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=sk-your_openai_key
OPENAI_ORG_ID=org-your_org_id
OPENAI_MODEL=gpt-4-turbo-preview

# Security (Auto-generated)
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# CORS
ALLOWED_ORIGINS=https://your-frontend-url.com,https://your-app.netlify.app

# Rate Limiting
SESSION_TIMEOUT=3600000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Service will be available at: `https://your-service-name.onrender.com`

---

### **Method 2: Using render.yaml (Infrastructure as Code)**

The `render.yaml` file is already configured in the repository.

#### Step 1: Push to GitHub
```bash
git push origin backend-render-deploy
```

#### Step 2: Create Blueprint on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Select branch: `backend-render-deploy`
5. Render will detect `render.yaml` automatically

#### Step 3: Configure Secrets
Render will prompt you to add the required environment variables.
Add all the secrets listed above.

#### Step 4: Deploy
Click **"Apply"** and Render will deploy your service.

---

## ✅ Verify Deployment

### 1. **Health Check**
```bash
curl https://your-service-name.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-11T...",
  "uptime": 123.456,
  "environment": "production"
}
```

### 2. **API Info**
```bash
curl https://your-service-name.onrender.com/api
```

**Expected Response:**
```json
{
  "name": "BookingTMS API",
  "version": "0.1.0",
  "endpoints": {
    "config": "/api/config",
    "auth": "/api/auth",
    "payments": "/api/payments",
    ...
  }
}
```

### 3. **Configuration Status**
```bash
curl https://your-service-name.onrender.com/api/config
```

Should return configuration status for all services.

---

## 🔧 Post-Deployment Configuration

### 1. **Update Frontend**
Update your frontend to use the Render backend URL:

```typescript
// In your frontend .env file
VITE_BACKEND_API_URL=https://your-service-name.onrender.com
```

### 2. **Update CORS Origins**
In Render environment variables, update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://your-frontend-url.com,https://your-app.netlify.app
```

### 3. **Configure Stripe Webhooks**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-service-name.onrender.com/api/webhooks/stripe`
3. Copy webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## 📊 Monitoring & Logs

### **View Logs:**
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. View real-time logs

### **Monitor Health:**
- Render automatically monitors `/health` endpoint
- Service restarts if health check fails
- Email notifications on failures

### **Metrics:**
- CPU usage
- Memory usage
- Request count
- Response times

---

## 🔄 Auto-Deploy Setup

### **Enable Auto-Deploy:**
1. In Render service settings
2. Enable **"Auto-Deploy"**
3. Select branch: `backend-render-deploy`

**Now:**
- Every push to `backend-render-deploy` triggers deployment
- Automatic builds and deployments
- Zero-downtime deployments

---

## 💰 Pricing

### **Free Tier:**
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic SSL
- ✅ Custom domains
- ❌ Service spins down after 15 min inactivity
- ❌ Cold starts (30-60 seconds)

### **Starter Plan ($7/month):**
- ✅ Always on (no spin down)
- ✅ Faster builds
- ✅ More resources
- ✅ No cold starts

### **Recommendation:**
- **Development:** Free tier
- **Production:** Starter plan or higher

---

## 🛡️ Security Best Practices

### 1. **Environment Variables**
- ✅ Never commit secrets to Git
- ✅ Use Render's secret management
- ✅ Rotate keys regularly

### 2. **HTTPS**
- ✅ Automatic SSL (Let's Encrypt)
- ✅ Force HTTPS redirects
- ✅ HSTS headers enabled

### 3. **Rate Limiting**
- ✅ Configured in backend
- ✅ 100 requests per 15 minutes
- ✅ Prevents abuse

### 4. **CORS**
- ✅ Whitelist specific origins
- ✅ No wildcard (*) in production
- ✅ Update as needed

---

## 🔍 Troubleshooting

### **Build Fails:**
```bash
# Check build logs in Render dashboard
# Common issues:
- Missing dependencies → Check package.json
- TypeScript errors → Run `npm run build` locally
- Node version → Render uses Node 18 by default
```

### **Service Won't Start:**
```bash
# Check start command:
cd src/backend && npm start

# Verify dist folder exists after build
# Check environment variables are set
```

### **Health Check Fails:**
```bash
# Verify /health endpoint works locally
# Check PORT environment variable
# Ensure server listens on 0.0.0.0, not localhost
```

### **CORS Errors:**
```bash
# Update ALLOWED_ORIGINS environment variable
# Include your frontend URL
# Restart service after updating
```

---

## 📝 Useful Commands

### **Local Testing:**
```bash
# Build
cd src/backend
npm run build

# Start production mode
NODE_ENV=production npm start

# Test health endpoint
curl http://localhost:3001/health
```

### **Render CLI:**
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# List services
render services list

# View logs
render logs <service-id>

# Trigger deploy
render deploy <service-id>
```

---

## 🎯 Next Steps

### **After Deployment:**
1. ✅ Test all API endpoints
2. ✅ Configure Stripe webhooks
3. ✅ Update frontend to use backend URL
4. ✅ Set up monitoring alerts
5. ✅ Configure custom domain (optional)

### **Custom Domain:**
1. Go to service settings
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. SSL certificate auto-provisioned

---

## 📞 Support

### **Render Support:**
- Documentation: [render.com/docs](https://render.com/docs)
- Community: [community.render.com](https://community.render.com)
- Status: [status.render.com](https://status.render.com)

### **BookingTMS Backend:**
- GitHub Issues
- Documentation in repository

---

## ✅ Deployment Checklist

- [ ] GitHub repository connected to Render
- [ ] Branch `backend-render-deploy` pushed
- [ ] Web service created on Render
- [ ] All environment variables configured
- [ ] Service deployed successfully
- [ ] Health check passing
- [ ] API endpoints responding
- [ ] Frontend updated with backend URL
- [ ] CORS configured correctly
- [ ] Stripe webhooks configured
- [ ] Monitoring enabled
- [ ] Auto-deploy enabled

---

**Status:** Ready for Deployment 🚀  
**Branch:** backend-render-deploy  
**Estimated Time:** 15-20 minutes  
**Difficulty:** Easy

**Your backend is ready to deploy to Render!**
