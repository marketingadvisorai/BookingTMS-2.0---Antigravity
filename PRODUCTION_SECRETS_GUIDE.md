# 🔐 Production Secrets Management Guide

## ⚠️ SECURITY CRITICAL - READ CAREFULLY

This guide explains how to securely manage API keys and secrets in production without committing them to GitHub.

---

## 🚫 NEVER COMMIT THESE TO GITHUB

### Files to NEVER Push:
```
.env
.env.local
.env.production
.env.*.local
secrets.json
**/secrets/**
```

### ✅ Already Protected:
Your `.gitignore` file already includes:
```
.env
.env.*
```

---

## 🔒 Access Control

### Secrets Page Access
- **Location:** Backend Dashboard → Secrets Tab
- **Required Role:** `super-admin` or `beta-owner` ONLY
- **Access Denied for:** admin, manager, staff, user roles

### Implementation:
```typescript
const isSuperAdmin = currentUser?.role === 'super-admin' || 
                      currentUser?.role === 'beta-owner';
```

---

## 📝 Secret Categories

### 1. **Stripe API Keys**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...    # Frontend (safe to expose)
STRIPE_SECRET_KEY=sk_live_...               # Backend ONLY (NEVER expose)
STRIPE_WEBHOOK_SECRET=whsec_...            # Backend webhook validation
```

**Security:**
- **Publishable Key** - Can be in frontend code
- **Secret Key** - MUST be server-side only
- **Webhook Secret** - Backend verification only

### 2. **Supabase Credentials**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...           # Public (RLS protected)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...        # Backend ONLY (full access)
```

**Security:**
- **URL & Anon Key** - Safe for frontend (RLS protects data)
- **Service Role Key** - Backend only (bypasses RLS)

### 3. **Google APIs**
```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...            # Backend ONLY
GOOGLE_API_KEY=AIza...                     # Restricted by referrer/IP
```

---

## 🚀 Production Deployment Options

### Option 1: Supabase Edge Functions (RECOMMENDED)
```bash
# Store secrets in Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set GOOGLE_CLIENT_SECRET=...

# Access in Edge Functions
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
```

**Pros:**
- ✅ Secure server-side storage
- ✅ Never exposed to client
- ✅ Easy rotation
- ✅ Automatic encryption

### Option 2: Vercel Environment Variables
```bash
# Add in Vercel Dashboard → Settings → Environment Variables
# OR via CLI:
vercel env add STRIPE_SECRET_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

**Pros:**
- ✅ Encrypted at rest
- ✅ Easy team management
- ✅ Per-environment config

### Option 3: Netlify Environment Variables
```bash
# Add in Netlify Dashboard → Site Settings → Environment Variables
# OR via CLI:
netlify env:set STRIPE_SECRET_KEY sk_live_...
```

### Option 4: AWS Systems Manager (SSM)
```bash
# Store in Parameter Store
aws ssm put-parameter \
  --name "/production/stripe/secret-key" \
  --value "sk_live_..." \
  --type "SecureString"
```

---

## 🏗️ Local Development Setup

### Step 1: Create `.env.local`
```bash
# Create file (NEVER commit this)
touch .env.local
```

### Step 2: Add Development Keys
```env
# .env.local (LOCAL DEVELOPMENT ONLY)

# Stripe Test Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Supabase Development
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Google APIs
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_API_KEY=AIza...
```

### Step 3: Verify `.gitignore`
```bash
# Check it's ignored
git check-ignore .env.local
# Should output: .env.local
```

---

## 🔄 Key Rotation Best Practices

### When to Rotate:
- ✅ Every 90 days (scheduled)
- ✅ After team member leaves
- ✅ Suspected compromise
- ✅ Found in logs/code
- ✅ Best practice audit

### How to Rotate:

#### 1. Stripe Keys
```bash
# 1. Create new key in Stripe Dashboard
# 2. Update in secrets management
# 3. Test new key
# 4. Delete old key
# 5. Monitor for errors
```

#### 2. Supabase Keys
```bash
# Generate new Service Role Key
# Update in Edge Functions secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=new_key...
# Verify functionality
```

#### 3. Google OAuth
```bash
# Create new credentials in Google Cloud Console
# Update client secret
# Revoke old credentials
```

---

## 📊 Monitoring & Alerts

### Set Up Alerts For:
- Unusual API usage patterns
- Failed authentication attempts
- Rate limit approaching
- Suspicious geographic access
- Multiple failed requests

### Stripe Monitoring:
```
Dashboard → Developers → Events
- Failed payments
- Webhook failures
- API errors
```

### Supabase Monitoring:
```
Dashboard → Database → Logs
- Auth failures
- RLS violations
- Query errors
```

---

## 🛡️ Security Checklist

### Before Production:
- [ ] All `.env` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Secrets page restricted to super-admin
- [ ] Demo passwords removed from login
- [ ] Test keys replaced with production keys
- [ ] Webhook secrets configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Monitoring/alerts set up
- [ ] Secrets rotation schedule created

### Code Review Checklist:
- [ ] No `console.log()` with sensitive data
- [ ] No secrets in comments
- [ ] No secrets in variable names
- [ ] API keys use environment variables
- [ ] Frontend only uses public keys
- [ ] Backend validates all requests

---

## 🚨 What to Do if Key is Exposed

### Immediate Actions:
1. **REVOKE THE KEY IMMEDIATELY**
   - Stripe: Dashboard → Developers → API Keys → Delete
   - Supabase: Settings → API → Regenerate
   - Google: Cloud Console → Credentials → Delete

2. **Generate new key**
3. **Update in all environments**
4. **Monitor for unauthorized usage**
5. **Review access logs**
6. **Document incident**

### Prevention:
- Use git hooks to scan for secrets
- Enable GitHub secret scanning
- Use tools like `git-secrets` or `trufflehog`
- Regular security audits

---

## 🔐 Edge Function Secrets Management

### Storing Secrets:
```bash
# Set secret
supabase secrets set API_KEY=value

# List secrets
supabase secrets list

# Unset secret
supabase secrets unset API_KEY
```

### Accessing in Edge Function:
```typescript
// supabase/functions/your-function/index.ts
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeKey) {
  return new Response('Configuration error', { status: 500 });
}

// Use the key
const stripe = new Stripe(stripeKey);
```

---

## 📱 Frontend vs Backend Keys

### ✅ Frontend (VITE_ prefix):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_CLIENT_ID=...
```
**Safe to expose** - These are public keys with limited permissions

### ❌ Backend (NO prefix):
```env
STRIPE_SECRET_KEY=sk_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_CLIENT_SECRET=GOCSPX-...
```
**NEVER expose** - These have full access and must stay server-side

---

## 🎯 Quick Reference

### Development:
```bash
# 1. Copy example file
cp .env.example .env.local

# 2. Fill in test keys
# (Use test/sandbox keys only)

# 3. Verify
npm run dev
```

### Production:
```bash
# 1. Use hosting platform's secret management
# 2. Never store in code
# 3. Use environment variables
# 4. Enable monitoring
```

### Emergency:
```bash
# 1. Revoke compromised key
# 2. Generate new key
# 3. Update immediately
# 4. Monitor logs
# 5. Document incident
```

---

## 📚 Additional Resources

- [Stripe API Security](https://stripe.com/docs/keys)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [12-Factor App Config](https://12factor.net/config)

---

## 💡 Remember

> **"The best way to keep a secret is to not have one to keep."**
> 
> Only store secrets that are absolutely necessary. Use service accounts, IAM roles, and principle of least privilege whenever possible.

---

## 🆘 Support

If you discover a security issue:
1. **DO NOT** create a public GitHub issue
2. **DO NOT** commit fixes with secret details
3. **Contact** security team immediately
4. **Follow** incident response protocol

---

**Last Updated:** November 11, 2025  
**Version:** 1.0  
**Classification:** Internal Security Documentation
