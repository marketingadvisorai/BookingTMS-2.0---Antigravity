# Quick Reference Guide - Booking TMS Repository

**Last Updated:** November 15, 2025 04:11 AM UTC+6

---

## 🚀 Quick Start

### Where Am I Working?

```bash
# Check your current branch
git branch

# See all branches
git branch -a

# Current branch should be: feature/your-feature-name or main
```

---

## 📋 Branch Cheat Sheet

| Branch Name | What It Is | When to Use |
|-------------|-----------|-------------|
| `main` | ✅ Production code | Pull from here to start work |
| `deploy/production-frontend` | 🚀 Frontend deploy | Never touch directly |
| `deploy/production-backend` | 🚀 Backend deploy | Never touch directly |
| `feature/*` | 🔧 Your work | Create from main, work here |

---

## 🔄 Common Workflows

### Start New Work

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Save Your Work

```bash
git add .
git commit -m "feat: what you did"
git push origin feature/your-feature-name
```

### Deploy to Production

```bash
# After merging PR to main:
git checkout main
git pull origin main

# Frontend only:
git push origin main:deploy/production-frontend --force

# Backend only:
git push origin main:deploy/production-backend --force

# Both:
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force
```

---

## 🌐 Production URLs

- **Frontend:** https://bookingtms-frontend.onrender.com
- **Backend:** https://bookingtms-backend-api.onrender.com

---

## 📊 Current Status

### Active Branches

```
main
├── deploy/production-frontend  → Render: bookingtms-frontend
├── deploy/production-backend   → Render: bookingtms-backend-api
└── feature/*                   → Your work branches
```

### What's Where

| Component | Location | Deploy Branch | Service |
|-----------|----------|---------------|---------|
| Frontend UI | Root directory | deploy/production-frontend | Static Site |
| Backend API | `src/backend/` | deploy/production-backend | Web Service |
| Database | Supabase | N/A | Cloud DB |
| Assets | `src/assets/` | deploy/production-frontend | Static files |

---

## ⚡ Quick Commands

### Daily Start
```bash
git checkout main && git pull origin main
```

### Create Feature
```bash
git checkout -b feature/my-new-feature
```

### Commit Changes
```bash
git add . && git commit -m "feat: your change"
```

### Push to GitHub
```bash
git push origin feature/my-new-feature
```

### Deploy Frontend
```bash
git push origin main:deploy/production-frontend --force
```

### Deploy Backend
```bash
git push origin main:deploy/production-backend --force
```

### Check What's Deployed
```bash
git log deploy/production-frontend --oneline -5
git log deploy/production-backend --oneline -5
```

### Cleanup Old Feature Branch
```bash
git branch -d feature/old-feature
git push origin --delete feature/old-feature
```

---

## 🚨 Emergency Commands

### Rollback Frontend
```bash
git log deploy/production-frontend --oneline -10
git push origin <good-commit>:deploy/production-frontend --force
```

### Rollback Backend
```bash
git log deploy/production-backend --oneline -10
git push origin <good-commit>:deploy/production-backend --force
```

---

## 📝 Commit Message Format

Use these prefixes:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

**Examples:**
```
feat: add booking calendar widget
fix: resolve payment validation error
docs: update API documentation
refactor: improve booking service logic
```

---

## 🔍 Checking Deployment Status

### Frontend
```bash
curl -I https://bookingtms-frontend.onrender.com
# Should return: HTTP/2 200
```

### Backend
```bash
curl https://bookingtms-backend-api.onrender.com/health
# Should return: {"status":"ok"}
```

### Via Dashboard
- Frontend: https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g
- Backend: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g

---

## 🛠️ Troubleshooting

### "Branch doesn't exist"
```bash
git fetch origin
git branch -a
```

### "Can't push - rejected"
```bash
git pull origin main
git push origin your-branch
```

### "Build failed on Render"
```bash
# Test locally first:
npm install
npm run build
```

### "Changes not showing on production"
```bash
# Wait 2-3 minutes for build
# Check Render dashboard for errors
# Hard refresh browser (Cmd+Shift+R)
```

---

## 📚 Full Documentation

- **Branch Strategy:** See `REPOSITORY_STRUCTURE.md`
- **Deployment Guide:** See `DEPLOYMENT_WORKFLOW.md`
- **Setup Guide:** See `SETUP_GUIDE.md`

---

## 🎯 Remember

1. ✅ Always work in feature branches
2. ✅ Always pull from main before starting
3. ✅ Always test locally before pushing
4. ✅ Never commit directly to main
5. ✅ Never commit directly to deploy branches
6. ✅ Always use force push for deployments
7. ✅ Always monitor deployments

---

## 📞 Need Help?

1. Check documentation first
2. Review error logs on Render
3. Check GitHub Actions (if configured)
4. Contact team lead

---

**Quick Links:**
- [Repository](https://github.com/marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2)
- [Frontend Dashboard](https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g)
- [Backend Dashboard](https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g)
