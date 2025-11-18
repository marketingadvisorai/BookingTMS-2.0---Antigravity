# Git Workflow for MVP Development
**Project:** Booking TMS - Escape Room MVP  
**Date:** November 18, 2025  
**Strategy:** GitFlow + Feature Branches

---

## 🌳 Branch Structure

```
main (production-ready)
├── develop/mvp-escape-room-v1.0 (MVP integration branch)
│   ├── feature/mvp-01-booking-widget-simplification
│   ├── feature/mvp-02-payment-stability
│   ├── feature/mvp-03-email-qr-confirmation
│   ├── feature/mvp-04-embeddable-widget
│   ├── feature/mvp-05-admin-dashboard-refactor
│   ├── feature/mvp-06-game-management-ux
│   ├── feature/mvp-07-customer-management
│   ├── feature/mvp-08-reporting-analytics
│   ├── feature/mvp-09-multi-venue-support
│   ├── feature/mvp-10-promotional-tools
│   ├── feature/mvp-11-staff-management
│   └── feature/mvp-12-waiver-management
├── booking-tms-beta-0.1.9 (frontend deploy to Render)
└── backend-render-deploy (backend deploy to Render)
```

---

## 📝 Branch Naming Convention

### Development Branches
- `develop/mvp-escape-room-v1.0` - Main MVP integration branch

### Feature Branches
- `feature/mvp-{number}-{short-description}`
- Example: `feature/mvp-01-booking-widget-simplification`

### Bugfix Branches
- `bugfix/mvp-{issue-description}`
- Example: `bugfix/mvp-double-booking-prevention`

### Hotfix Branches (for production issues)
- `hotfix/{issue-description}`
- Example: `hotfix/payment-webhook-failure`

---

## 🔄 Workflow Process

### 1. Starting a New Feature

```bash
# Ensure develop branch is up to date
git checkout develop/mvp-escape-room-v1.0
git pull origin develop/mvp-escape-room-v1.0

# Create feature branch
git checkout -b feature/mvp-01-booking-widget-simplification

# Work on feature, commit regularly
git add .
git commit -m "feat(booking): simplify date selection step"

# Push to remote
git push -u origin feature/mvp-01-booking-widget-simplification
```

### 2. Completing a Feature

```bash
# Ensure feature is complete and tested
npm run build  # Verify build works
npm run dev    # Test manually

# Switch to develop branch
git checkout develop/mvp-escape-room-v1.0
git pull origin develop/mvp-escape-room-v1.0

# Merge feature branch
git merge --no-ff feature/mvp-01-booking-widget-simplification

# Push to remote
git push origin develop/mvp-escape-room-v1.0

# Delete feature branch (optional)
git branch -d feature/mvp-01-booking-widget-simplification
git push origin --delete feature/mvp-01-booking-widget-simplification
```

### 3. Releasing MVP to Production

```bash
# When MVP is complete and tested
git checkout main
git pull origin main

# Merge develop into main
git merge --no-ff develop/mvp-escape-room-v1.0

# Tag the release
git tag -a v1.0.0-mvp-escape-room -m "MVP Release: Escape Room Booking Engine"

# Push to remote
git push origin main
git push origin v1.0.0-mvp-escape-room

# Update deploy branches
git checkout booking-tms-beta-0.1.9
git merge main
git push origin booking-tms-beta-0.1.9

git checkout backend-render-deploy
git merge main
git push origin backend-render-deploy
```

---

## 📦 Commit Message Convention

Following **Conventional Commits** standard:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples
```bash
feat(booking): add 4-step booking flow for escape rooms
fix(payment): prevent double payment intent creation
docs(readme): update setup instructions for MVP
refactor(widget): extract time slot selection to separate component
perf(calendar): optimize availability query with database indexes
```

---

## 🔐 Branch Protection Rules (Recommended)

### For `main` branch:
- Require pull request reviews before merging
- Require status checks to pass (build, tests)
- Require branches to be up to date before merging
- No direct pushes to main

### For `develop/mvp-escape-room-v1.0` branch:
- Require at least 1 approval for merges
- Require status checks to pass

---

## 🚀 Deployment Strategy

### Development Environment
- **Branch:** `develop/mvp-escape-room-v1.0`
- **Deploy:** Manual or on push (Render preview)
- **Database:** Supabase development project
- **Purpose:** Testing and validation

### Staging Environment (Optional)
- **Branch:** `staging/mvp-escape-room`
- **Deploy:** Automatic on push
- **Database:** Supabase staging project
- **Purpose:** Pre-production testing

### Production Environment
- **Branch:** `main`
- **Deploy:** Via `booking-tms-beta-0.1.9` and `backend-render-deploy`
- **Database:** Supabase production project
- **Purpose:** Live customer-facing application

---

## 📊 Current Branch Status

| Branch | Purpose | Status | Last Updated |
|--------|---------|--------|--------------|
| `main` | Production baseline | ✅ Stable | 2025-11-18 |
| `develop/mvp-escape-room-v1.0` | MVP integration | 🚧 Active | 2025-11-18 |
| `feature/mvp-01-booking-widget-simplification` | Booking widget refactor | 📋 Planned | - |
| `booking-tms-beta-0.1.9` | Frontend deploy | ✅ Live | 2025-11-18 |
| `backend-render-deploy` | Backend deploy | ⚠️ Needs fix | 2025-11-18 |

---

## 🎯 MVP Feature Tracking

### Week 1: Core Booking Engine
- [ ] `feature/mvp-01-booking-widget-simplification` (3-4 days)
- [ ] `feature/mvp-02-payment-stability` (2-3 days)
- [ ] `feature/mvp-03-email-qr-confirmation` (2 days)
- [ ] `feature/mvp-04-embeddable-widget` (2-3 days)

### Week 2: Admin & Management
- [ ] `feature/mvp-05-admin-dashboard-refactor` (3-4 days)
- [ ] `feature/mvp-06-game-management-ux` (2 days)
- [ ] `feature/mvp-07-customer-management` (2 days)
- [ ] `feature/mvp-08-reporting-analytics` (2-3 days)

### Week 3: Polish & Launch
- [ ] `feature/mvp-09-multi-venue-support` (2 days)
- [ ] `feature/mvp-10-promotional-tools` (2 days)
- [ ] `feature/mvp-11-staff-management` (1-2 days)
- [ ] `feature/mvp-12-waiver-management` (1 day)

---

## 🛠️ Quick Commands Reference

```bash
# Check current branch
git branch

# See all branches (local and remote)
git branch -a

# Switch branches
git checkout <branch-name>

# Create and switch to new branch
git checkout -b <branch-name>

# Pull latest changes
git pull origin <branch-name>

# Push changes
git push origin <branch-name>

# View commit history
git log --oneline --graph --all

# Stash changes temporarily
git stash
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

---

## 📞 For AI Coding Agents

When working on this project:

1. **Always start from develop branch:**
   ```bash
   git checkout develop/mvp-escape-room-v1.0
   git pull origin develop/mvp-escape-room-v1.0
   ```

2. **Create feature branch for your task:**
   ```bash
   git checkout -b feature/mvp-{number}-{description}
   ```

3. **Commit frequently with clear messages:**
   ```bash
   git commit -m "feat(scope): what you did"
   ```

4. **Push to remote regularly:**
   ```bash
   git push origin feature/mvp-{number}-{description}
   ```

5. **When complete, merge to develop:**
   ```bash
   git checkout develop/mvp-escape-room-v1.0
   git merge --no-ff feature/mvp-{number}-{description}
   git push origin develop/mvp-escape-room-v1.0
   ```

---

**Last Updated:** 2025-11-18 12:15 UTC+06  
**Next Review:** Daily during MVP development
