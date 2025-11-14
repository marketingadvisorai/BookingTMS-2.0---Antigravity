# Deployment Workflow Guide

**Last Updated:** November 15, 2025 04:11 AM UTC+6  
**Status:** ✅ Active Production Workflow

---

## Table of Contents

1. [Overview](#overview)
2. [Current Deployment Setup](#current-deployment-setup)
3. [Daily Development Workflow](#daily-development-workflow)
4. [Deployment Procedures](#deployment-procedures)
5. [Monitoring & Verification](#monitoring--verification)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Repository                    │
│  marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-...      │
└─────────────────────────────────────────────────────────┘
                          │
                          ├── main (production ready)
                          │
         ┌────────────────┴────────────────┐
         │                                  │
         v                                  v
┌────────────────────┐          ┌────────────────────┐
│  Frontend Deploy   │          │  Backend Deploy    │
│  Branch: deploy/   │          │  Branch: deploy/   │
│  production-       │          │  production-       │
│  frontend          │          │  backend           │
└────────────────────┘          └────────────────────┘
         │                                  │
         v                                  v
┌────────────────────┐          ┌────────────────────┐
│   Render.com       │          │   Render.com       │
│   Static Site      │          │   Web Service      │
│   bookingtms-      │          │   bookingtms-      │
│   frontend         │          │   backend-api      │
└────────────────────┘          └────────────────────┘
         │                                  │
         v                                  v
┌────────────────────┐          ┌────────────────────┐
│   Production URL   │          │   Production URL   │
│   bookingtms-      │          │   bookingtms-      │
│   frontend.        │          │   backend-api.     │
│   onrender.com     │          │   onrender.com     │
└────────────────────┘          └────────────────────┘
```

### Key Principles

1. **Single Source of Truth:** `main` branch contains only production-ready code
2. **Automated Deployment:** Render auto-deploys on branch commit
3. **Independent Services:** Frontend and backend deploy separately
4. **Force Push Strategy:** Always force-push from main to deploy branches
5. **No Direct Commits:** Never commit directly to deploy branches

---

## Current Deployment Setup

### Frontend Service

| Property | Value |
|----------|-------|
| **Service Name** | bookingtms-frontend |
| **Service ID** | srv-d49lmtvdiees73aikb9g |
| **Service Type** | Static Site |
| **Deploy Branch** | deploy/production-frontend |
| **Repository Root** | `/` (entire repo) |
| **Build Command** | `npm install && npm run build` |
| **Publish Dir** | `build` |
| **Auto Deploy** | ✅ Enabled |
| **Region** | Oregon (US West) |
| **Plan** | Starter |

**Production URL:** https://bookingtms-frontend.onrender.com

**Typical Build Time:** 40-60 seconds

**What Triggers Build:**
- Changes to frontend source code (`src/components/`, `src/pages/`, etc.)
- Changes to root `package.json`
- Changes to `vite.config.ts`
- Changes to `index.html`
- Any file in root directory

**What DOESN'T Trigger:**
- Backend-only changes (files in `src/backend/` directory)

---

### Backend Service

| Property | Value |
|----------|-------|
| **Service Name** | bookingtms-backend-api |
| **Service ID** | srv-d49gml95pdvs73ctdb5g |
| **Service Type** | Web Service (Node.js) |
| **Deploy Branch** | deploy/production-backend |
| **Repository Root** | `src/backend/` |
| **Build Command** | `npm install; npm run build` |
| **Start Command** | `npm start` |
| **Auto Deploy** | ✅ Enabled |
| **Region** | Oregon (US West) |
| **Plan** | Free |

**Production URL:** https://bookingtms-backend-api.onrender.com

**Typical Build Time:** 90-120 seconds

**What Triggers Build:**
- Changes to `src/backend/` directory
- Changes to `src/backend/package.json`
- Backend source code changes

**What DOESN'T Trigger:**
- Frontend-only changes
- Root `package.json` changes (backend has its own)
- Documentation changes

---

## Daily Development Workflow

### Morning Routine

```bash
# 1. Start your day - sync with latest code
cd /path/to/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2
git checkout main
git pull origin main

# 2. Check branch status
git status
git branch -a

# 3. Start local development
npm run dev
```

### Working on a Feature

```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Example feature names:
# - feature/booking-calendar-redesign
# - feature/payment-webhook-integration
# - feature/user-dashboard-v2

# 2. Make your changes
# Edit files, write code, test locally...

# 3. Commit your work (commit often!)
git add .
git commit -m "feat: add booking calendar date picker"

# Use conventional commits:
# - feat: new feature
# - fix: bug fix
# - refactor: code refactoring
# - docs: documentation
# - style: formatting, missing semicolons
# - test: adding tests
# - chore: maintenance

# 4. Push to GitHub
git push origin feature/your-feature-name

# 5. If you need to continue tomorrow
git add .
git commit -m "wip: working on calendar integration"
git push origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to GitHub: https://github.com/marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2
2. Click "Compare & pull request" button
3. **Base branch:** `main`
4. **Compare branch:** `feature/your-feature-name`
5. Fill in PR template:
   ```markdown
   ## Changes Made
   - Added booking calendar date picker
   - Integrated with backend API
   - Added unit tests
   
   ## Testing
   - [x] Tested locally
   - [x] Checked responsive design
   - [x] Verified API integration
   
   ## Screenshots
   (Add screenshots if UI changes)
   ```
6. Click "Create pull request"

### Merging and Deploying

```bash
# After PR is approved and merged to main

# 1. Update your local main
git checkout main
git pull origin main

# 2. Delete your feature branch (cleanup)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name

# 3. Deploy to production (see deployment procedures below)
```

---

## Deployment Procedures

### Option 1: Deploy Frontend Only

**When to use:** Changes only affect frontend (UI, components, pages)

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Deploy to production
git push origin main:deploy/production-frontend --force

# 3. Monitor deployment
# Go to: https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g
# Or wait for notification email

# 4. Verify deployment (after 1-2 minutes)
curl https://bookingtms-frontend.onrender.com
# Or open in browser and check changes are live
```

**Deployment Checklist:**
- [ ] All tests passing locally
- [ ] `main` branch is up to date
- [ ] Build succeeds locally (`npm run build`)
- [ ] Pushed to deploy branch
- [ ] Monitoring Render dashboard
- [ ] Verified changes live on production URL

---

### Option 2: Deploy Backend Only

**When to use:** Changes only affect backend (API, services, database)

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Deploy to production
git push origin main:deploy/production-backend --force

# 3. Monitor deployment
# Go to: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

# 4. Verify deployment (after 2-3 minutes)
curl https://bookingtms-backend-api.onrender.com/health
# Or test API endpoints
```

**Deployment Checklist:**
- [ ] Backend tests passing
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] `main` branch is up to date
- [ ] Pushed to deploy branch
- [ ] API health check passes
- [ ] Critical endpoints tested

---

### Option 3: Deploy Full Stack (Both Services)

**When to use:** Changes affect both frontend and backend

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Deploy both services
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force

# 3. Monitor both deployments
# Frontend: https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g
# Backend:  https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

# 4. Verify both services
curl https://bookingtms-frontend.onrender.com
curl https://bookingtms-backend-api.onrender.com/health

# 5. Test integration
# Open frontend in browser
# Test features that use backend API
```

**Full Stack Deployment Checklist:**
- [ ] Frontend and backend code compatible
- [ ] API contracts match between services
- [ ] Database migrations completed (if any)
- [ ] Environment variables synced
- [ ] Both builds succeed locally
- [ ] Integration tests passing
- [ ] Both services deployed
- [ ] Both health checks pass
- [ ] End-to-end testing completed

---

### Option 4: Scheduled Deployment

**For non-urgent changes or batch deployments**

```bash
# 1. Merge all PRs to main during work hours
git checkout main
git pull origin main

# 2. Review all changes going to production
git log deploy/production-frontend..main --oneline
git log deploy/production-backend..main --oneline

# 3. Deploy at scheduled time (e.g., 5 PM)
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force

# 4. Monitor for next 30 minutes
# Check error logs, metrics, user reports
```

---

## Monitoring & Verification

### Frontend Monitoring

**Dashboard:** https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g

**What to Check:**
1. **Deploy Status** - Should show "Live" with green indicator
2. **Build Logs** - Check for errors or warnings
3. **Deploy Time** - Note when it went live
4. **Last Commit** - Verify correct commit is deployed

**Manual Verification:**
```bash
# Check site is accessible
curl -I https://bookingtms-frontend.onrender.com

# Should return: HTTP/2 200

# Open in browser and check:
# - Home page loads
# - Assets (CSS, JS) load
# - No console errors
# - Recent changes are visible
```

---

### Backend Monitoring

**Dashboard:** https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

**What to Check:**
1. **Service Status** - Should show "Running"
2. **Deploy Status** - Should show "Live"
3. **Logs** - Check for runtime errors
4. **Metrics** - CPU, memory usage normal
5. **Instance Count** - Should be 1 (free plan)

**Manual Verification:**
```bash
# Check API is responding
curl https://bookingtms-backend-api.onrender.com/health

# Should return: {"status":"ok"} or similar

# Test critical endpoints
curl https://bookingtms-backend-api.onrender.com/api/games
curl https://bookingtms-backend-api.onrender.com/api/bookings
```

---

### Deployment Timeline

**Expected Timeline for Full Deployment:**

```
0:00  - Push to deploy branches
0:10  - Render receives webhook
0:20  - Frontend build starts
0:30  - Backend build starts
1:00  - Frontend build completes (typical)
1:30  - Frontend goes live
2:00  - Backend build completes (typical)
2:30  - Backend goes live
3:00  - Both services fully operational
```

**If deployment takes longer than expected:**
- Check Render dashboard for errors
- Review build logs for issues
- Verify GitHub webhook fired correctly
- Check Render status page for platform issues

---

## Troubleshooting

### Frontend Build Fails

**Common Causes:**
1. **Dependency conflict** - `package.json` issues
2. **TypeScript errors** - Check build locally first
3. **Missing environment variables** - Configure in Render
4. **Build timeout** - Large bundle size

**Resolution:**
```bash
# 1. Test build locally
npm install
npm run build

# 2. Fix errors locally
# ... make fixes ...

# 3. Commit and push fix
git add .
git commit -m "fix: resolve build errors"
git push origin main

# 4. Redeploy
git push origin main:deploy/production-frontend --force
```

---

### Backend Build Fails

**Common Causes:**
1. **Backend package.json issues** - Check `src/backend/package.json`
2. **TypeScript compilation errors**
3. **Missing environment variables**
4. **Port binding issues**

**Resolution:**
```bash
# 1. Test backend build locally
cd src/backend
npm install
npm run build
npm start

# 2. Fix errors locally
# ... make fixes ...

# 3. Return to root and commit
cd ../..
git add .
git commit -m "fix: resolve backend build errors"
git push origin main

# 4. Redeploy
git push origin main:deploy/production-backend --force
```

---

### Site is Slow/Not Responding

**Diagnosis:**
```bash
# Check if services are running
curl -I https://bookingtms-frontend.onrender.com
curl https://bookingtms-backend-api.onrender.com/health

# Check Render dashboard
# - Look at metrics (CPU, memory)
# - Check recent logs for errors
# - Verify service is "Running"
```

**Common Causes:**
1. **Cold start** - Free tier services sleep after inactivity
2. **High traffic** - May need to upgrade plan
3. **Backend error** - Check logs
4. **Database issue** - Check Supabase connection

**Resolution:**
- Wait 30 seconds for cold start to complete
- Check error logs for specific issues
- Restart service if needed (Render dashboard)
- Consider upgrading plan if persistent

---

### Rollback Procedure

**When to Rollback:**
- Critical bug in production
- Site completely broken
- Data integrity issues
- Security vulnerability

**Quick Rollback:**
```bash
# 1. Find last known good commit
git log deploy/production-frontend --oneline -10

# 2. Rollback frontend
git checkout deploy/production-frontend
git reset --hard <good-commit-hash>
git push origin deploy/production-frontend --force

# 3. Rollback backend (if needed)
git checkout deploy/production-backend
git reset --hard <good-commit-hash>
git push origin deploy/production-backend --force

# 4. Verify rollback
curl https://bookingtms-frontend.onrender.com
curl https://bookingtms-backend-api.onrender.com/health

# 5. Return to main and fix issue
git checkout main
git checkout -b hotfix/critical-bug-fix
# ... make fixes ...
```

---

### Environment Variables Missing

**Symptoms:**
- Backend errors mentioning undefined variables
- Stripe integration not working
- Database connection failures

**Resolution:**
1. Go to Render dashboard for affected service
2. Navigate to "Environment" tab
3. Add missing variables:
   - `STRIPE_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - etc.
4. Click "Save Changes"
5. Service will automatically redeploy

**Prevention:**
- Document all required env vars in `.env.example`
- Keep Render env vars in sync with local `.env`
- Use Render's secret management

---

## Best Practices

### Pre-Deployment Checklist

Before deploying to production, always:

- [ ] All tests pass locally
- [ ] Code reviewed (PR approved)
- [ ] Build succeeds locally
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Breaking changes documented
- [ ] Backup created (if needed)

### During Deployment

- [ ] Monitor deploy in real-time
- [ ] Check build logs for warnings
- [ ] Verify deployment completes
- [ ] Don't close terminal/window
- [ ] Be available for 15 minutes post-deploy

### Post-Deployment

- [ ] Test critical user flows
- [ ] Check error monitoring
- [ ] Verify recent changes visible
- [ ] Monitor for 30 minutes
- [ ] Document deployment in changelog
- [ ] Notify team of successful deploy

---

## Useful Commands

### Check Current Production Code

```bash
# See what's currently deployed
git show deploy/production-frontend --no-patch
git show deploy/production-backend --no-patch

# Compare with main
git log deploy/production-frontend..main --oneline
git log deploy/production-backend..main --oneline
```

### Force Sync with Main

```bash
# If deploy branch gets out of sync
git checkout deploy/production-frontend
git reset --hard main
git push origin deploy/production-frontend --force
```

### View Recent Deployments

```bash
# See deployment history
git log deploy/production-frontend --oneline -10 --graph
git log deploy/production-backend --oneline -10 --graph
```

---

## Emergency Contacts

**Render Platform Issues:**
- Status: https://status.render.com
- Support: https://render.com/support

**GitHub Issues:**
- Status: https://www.githubstatus.com
- Support: https://support.github.com

**Supabase Issues:**
- Status: https://status.supabase.com
- Support: https://supabase.com/support

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-11-15 | Initial deployment workflow documentation | System |
| 2025-11-15 | Reorganized branch structure | System |

---

**Next Review:** December 15, 2025
