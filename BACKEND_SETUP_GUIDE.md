# Backend API Setup Guide
## Secure Backend Implementation with Secret Management

---

## 🎯 Overview

This backend API provides secure endpoints for:
- ✅ Stripe payments (no secret keys in frontend)
- ✅ Email notifications (SendGrid)
- ✅ SMS notifications (Twilio)
- ✅ AI services (OpenAI)
- ✅ Secure booking operations

**Security:** All API keys and secrets stay on the backend. Frontend only calls secure endpoints.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase project
- Stripe account
- SendGrid account
- Twilio account (optional)
- OpenAI account (optional)

---

## 🚀 Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd src/backend
npm install
```

This installs:
- Express (web server)
- CORS, Helmet (security)
- Stripe SDK
- SendGrid SDK
- Twilio SDK
- OpenAI SDK
- JWT, bcrypt (authentication)

### Step 2: Create Environment File

```bash
# Copy the example file
cp ../../.env.backend.example ../../.env.backend

# Edit with your actual values
nano ../../.env.backend
```

### Step 3: Configure Secrets

Edit `.env.backend` with your actual API keys:

```env
# Get from Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Get from Stripe Dashboard → Developers → API Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Get from SendGrid Dashboard → Settings → API Keys
SENDGRID_API_KEY=SG....

# Get from Twilio Console
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Get from OpenAI Platform
OPENAI_API_KEY=sk-...
```

### Step 4: Generate Security Keys

```bash
# Generate JWT Secret (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add these to `.env.backend`:
```env
JWT_SECRET=<generated-jwt-secret>
ENCRYPTION_KEY=<generated-encryption-key>
```

### Step 5: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Expected output:
```
🚀 Backend API Server Started
================================
Port: 3001
Environment: development
API URL: http://localhost:3001

Configuration:
{
  "port": 3001,
  "nodeEnv": "development",
  "apiBaseUrl": "http://localhost:3001",
  ...
}
================================
```

---

## ✅ Verification

### Test Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-11T...",
  "uptime": 123.456,
  "environment": "development"
}
```

### Test API Info
```bash
curl http://localhost:3001/api
```

Expected response:
```json
{
  "name": "BookingTMS API",
  "version": "0.1.0",
  "endpoints": {
    "auth": "/api/auth",
    "payments": "/api/payments",
    ...
  }
}
```

---

## 🔐 Security Checklist

- [ ] `.env.backend` file created with all secrets
- [ ] `.env.backend` added to `.gitignore`
- [ ] JWT secret generated (32+ characters)
- [ ] Encryption key generated (32+ characters)
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] All API keys are backend-only (not in frontend)

---

## 📁 File Structure

```
src/backend/
├── api/
│   ├── server.ts              # Express server
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   └── middleware/            # Auth, validation, etc.
├── services/
│   ├── stripe/                # Stripe integration
│   ├── email/                 # Email service
│   ├── sms/                   # SMS service
│   └── ai/                    # AI service
├── config/
│   └── secrets.config.ts      # Secret management
└── package.json               # Dependencies
```

---

## 🔄 Frontend Integration

### Update Frontend .env

```env
# Frontend only needs public keys
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_API_URL=http://localhost:3001/api
```

### Frontend API Client Example

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function createPaymentIntent(amount: number) {
  const response = await fetch(`${API_URL}/payments/create-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ amount }),
  });
  
  return response.json();
}
```

---

## 🚨 Important Notes

### DO NOT:
- ❌ Commit `.env.backend` to Git
- ❌ Expose service role keys to frontend
- ❌ Use secret keys in frontend code
- ❌ Hardcode API keys anywhere

### DO:
- ✅ Keep all secrets in `.env.backend`
- ✅ Use environment variables
- ✅ Validate all inputs
- ✅ Use rate limiting
- ✅ Log all API calls

---

## 📊 Next Steps

1. ✅ Backend server running
2. ⏳ Implement Stripe service
3. ⏳ Implement Email service
4. ⏳ Implement SMS service
5. ⏳ Implement AI service
6. ⏳ Update frontend to use backend API

---

## 🐛 Troubleshooting

### Error: "Missing required environment variables"
**Solution:** Check `.env.backend` file exists and has all required variables

### Error: "CORS error"
**Solution:** Add your frontend URL to `ALLOWED_ORIGINS` in `.env.backend`

### Error: "Port 3001 already in use"
**Solution:** Change `PORT` in `.env.backend` or kill process using port 3001

### Error: "Module not found"
**Solution:** Run `npm install` in `src/backend` directory

---

**Status:** Ready to implement services  
**Security:** Enterprise-grade  
**Next:** Implement Stripe, Email, SMS, AI services
