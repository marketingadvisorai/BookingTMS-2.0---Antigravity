# Branch Strategy - Visual Guide

**Booking TMS Repository Structure**  
**Last Updated:** November 15, 2025

---

## 📊 Current Structure (After Migration)

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-...          │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                v                       v
        ┌──────────────┐       ┌──────────────┐
        │     main     │       │  feature/*   │
        │  (protected) │       │  (temporary) │
        └──────────────┘       └──────────────┘
                │                       │
                │                       └──→ PR ──→ merge
                │                                      │
                ├──────────────┬────────────┬─────────┘
                │              │            │
                v              v            v
    ┌──────────────────┐ ┌──────────────────┐
    │   deploy/        │ │   deploy/        │
    │   production-    │ │   production-    │
    │   frontend       │ │   backend        │
    └──────────────────┘ └──────────────────┘
                │              │
                v              v
    ┌──────────────────┐ ┌──────────────────┐
    │  Render Static   │ │  Render Web      │
    │  Site Service    │ │  Service         │
    └──────────────────┘ └──────────────────┘
                │              │
                v              v
    ┌──────────────────┐ ┌──────────────────┐
    │   Production     │ │   Production     │
    │   Frontend       │ │   Backend API    │
    │   Website        │ │   Endpoints      │
    └──────────────────┘ └──────────────────┘
```

---

## 🌳 Branch Hierarchy

```
Repository Root
│
├── main (protected)
│   ├── Latest production-ready code
│   ├── Always deployable
│   └── Single source of truth
│
├── deploy/
│   ├── production-frontend
│   │   ├── Auto-deploys to Render
│   │   ├── Serves: bookingtms-frontend.onrender.com
│   │   └── Force-pushed from main
│   │
│   └── production-backend
│       ├── Auto-deploys to Render
│       ├── Serves: bookingtms-backend-api.onrender.com
│       └── Force-pushed from main
│
├── feature/
│   ├── payment-integration
│   ├── booking-calendar-v2
│   ├── user-dashboard
│   └── [your-feature-name]
│
└── archive/
    ├── backup-pre-multi-tenant-20251113
    └── [historical branches]
```

---

## 🔄 Development Flow

### Standard Feature Development

```
    Developer          GitHub           Render          Production
        │                │                │                 │
        │                │                │                 │
   ┌────┴────┐           │                │                 │
   │  Start  │           │                │                 │
   │  Work   │           │                │                 │
   └────┬────┘           │                │                 │
        │                │                │                 │
        │  git checkout -b feature/name   │                 │
        ├───────────────>│                │                 │
        │                │                │                 │
        │  Code, Test,   │                │                 │
        │  Commit        │                │                 │
        │                │                │                 │
        │  git push      │                │                 │
        ├───────────────>│                │                 │
        │                │                │                 │
        │  Create PR     │                │                 │
        ├───────────────>│                │                 │
        │                │                │                 │
        │                │  Review &      │                 │
        │                │  Approve       │                 │
        │                │                │                 │
        │                │  Merge to      │                 │
        │                │  main          │                 │
        │                │                │                 │
        │  git push main:deploy/*         │                 │
        ├───────────────>├───────────────>│  Auto Deploy   │
        │                │                │                 │
        │                │                │  Build &        │
        │                │                │  Test           │
        │                │                │                 │
        │                │                │  Deploy    ────>│
        │                │                │                 │
        │  Verify                                           │
        ├───────────────────────────────────────────────────>│
        │                │                │                 │
        v                v                v                 v
     Done!           Branch            Service            Live!
                    Updated           Running
```

---

## 🎯 Branch Purposes

### `main` Branch

**Purpose:** Production-ready code  
**Lifetime:** Permanent  
**Who can push:** Pull requests only (after review)  
**When to use:** Never directly - merge PRs into it

**Rules:**
- ✅ All tests must pass
- ✅ Code must be reviewed
- ✅ Must be deployable at any time
- ❌ No direct commits
- ❌ No experimental code
- ❌ No work-in-progress

---

### `deploy/production-frontend` Branch

**Purpose:** Trigger frontend deployment  
**Lifetime:** Permanent  
**Who can push:** Automated from main (force push)  
**When to use:** Deploy frontend to production

**Rules:**
- ✅ Force-push from main only
- ✅ Triggers Render auto-deploy
- ❌ Never commit directly
- ❌ Never merge PRs to this branch
- ❌ Never branch from this

**Command:**
```bash
git push origin main:deploy/production-frontend --force
```

---

### `deploy/production-backend` Branch

**Purpose:** Trigger backend deployment  
**Lifetime:** Permanent  
**Who can push:** Automated from main (force push)  
**When to use:** Deploy backend to production

**Rules:**
- ✅ Force-push from main only
- ✅ Triggers Render auto-deploy
- ❌ Never commit directly
- ❌ Never merge PRs to this branch
- ❌ Never branch from this

**Command:**
```bash
git push origin main:deploy/production-backend --force
```

---

### `feature/*` Branches

**Purpose:** Develop new features  
**Lifetime:** Temporary (delete after merge)  
**Who can push:** Feature developer  
**When to use:** All new development work

**Rules:**
- ✅ Branch from `main`
- ✅ Name descriptively: `feature/stripe-checkout`
- ✅ Push regularly to backup work
- ✅ Create PR when ready
- ✅ Delete after merge

**Lifecycle:**
1. Create from `main`
2. Develop feature
3. Push to GitHub
4. Create pull request
5. Get review
6. Merge to `main`
7. Delete branch

---

## 🚀 Deployment Scenarios

### Scenario 1: Frontend-Only Change

```
Feature Branch → PR → main → deploy/production-frontend → Render → Live
                                     ⬆
                             Force push from main
```

**Example:** UI update, component change, styling

```bash
git checkout main
git pull origin main
git push origin main:deploy/production-frontend --force
```

---

### Scenario 2: Backend-Only Change

```
Feature Branch → PR → main → deploy/production-backend → Render → Live
                                     ⬆
                             Force push from main
```

**Example:** API endpoint, database query, service logic

```bash
git checkout main
git pull origin main
git push origin main:deploy/production-backend --force
```

---

### Scenario 3: Full-Stack Change

```
                    ┌→ deploy/production-frontend → Render → Live
                    │
Feature Branch → PR → main
                    │
                    └→ deploy/production-backend → Render → Live
```

**Example:** New feature requiring both UI and API changes

```bash
git checkout main
git pull origin main
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force
```

---

## 📋 Branch Naming Conventions

### Standard Prefixes

| Prefix | Purpose | Example | Lifetime |
|--------|---------|---------|----------|
| `feature/` | New features | `feature/stripe-checkout` | Temporary |
| `bugfix/` | Bug fixes | `bugfix/payment-validation` | Temporary |
| `hotfix/` | Urgent fixes | `hotfix/security-patch` | Temporary |
| `refactor/` | Code cleanup | `refactor/booking-service` | Temporary |
| `docs/` | Documentation | `docs/api-guide` | Temporary |
| `test/` | Testing | `test/e2e-bookings` | Temporary |
| `deploy/` | Deployment | `deploy/production-frontend` | Permanent |
| `archive/` | Historical | `archive/backup-2025-11` | Archive |

### Naming Rules

✅ **Good:**
- `feature/payment-stripe-integration`
- `bugfix/calendar-timezone-issue`
- `hotfix/critical-security-patch`
- `docs/deployment-guide`

❌ **Bad:**
- `new-stuff` (too vague)
- `fix` (not descriptive)
- `johns-branch` (use feature name)
- `v0.1.9` (use tags, not branches)
- `Frontend-Updates` (wrong case)

---

## 🔄 Workflow Examples

### Example 1: Adding Stripe Checkout

```bash
# Day 1: Start work
git checkout main
git pull origin main
git checkout -b feature/stripe-checkout-integration

# Work on feature...
git add src/components/checkout/StripeCheckout.tsx
git commit -m "feat: add Stripe checkout component"
git push origin feature/stripe-checkout-integration

# Day 2: Continue work
git add src/services/stripe.service.ts
git commit -m "feat: add Stripe service integration"
git push origin feature/stripe-checkout-integration

# Day 3: Create PR
# Go to GitHub, create PR to main

# After PR approval and merge:
git checkout main
git pull origin main
git branch -d feature/stripe-checkout-integration

# Deploy to production
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force
```

---

### Example 2: Quick Bug Fix

```bash
# Urgent bug found in production
git checkout main
git pull origin main
git checkout -b bugfix/booking-validation-error

# Fix the bug
git add src/utils/booking-validator.ts
git commit -m "fix: resolve booking date validation error"
git push origin bugfix/booking-validation-error

# Create PR, get quick review, merge

# Deploy immediately
git checkout main
git pull origin main
git push origin main:deploy/production-frontend --force
```

---

### Example 3: Hotfix in Production

```bash
# Critical issue in production
git checkout main
git pull origin main
git checkout -b hotfix/payment-processing-bug

# Fix critical bug
git add src/services/payment.service.ts
git commit -m "hotfix: fix payment processing deadlock"

# Skip PR for critical fixes - merge directly
git checkout main
git merge hotfix/payment-processing-bug
git push origin main

# Deploy immediately to both services
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force

# Clean up
git branch -d hotfix/payment-processing-bug
```

---

## 📊 Branch Status at a Glance

### Active Branches (Keep)

```
✅ main                          - Production ready code
✅ deploy/production-frontend    - Frontend deployment trigger
✅ deploy/production-backend     - Backend deployment trigger
✅ feature/*                     - Active development work
```

### Deprecated Branches (To Remove)

```
❌ booking-tms-beta-0.1.9        - Old frontend deploy (rename to deploy/production-frontend)
❌ backend-render-deploy         - Old backend deploy (rename to deploy/production-backend)
❌ stripe-api-0.1                - Merged feature
❌ stripe-integration-0.1.3      - Merged feature
❌ render-deploy-0.1             - Old deploy branch
❌ fixing-10.1                   - Old fix branch
```

---

## 🎓 Learning Resources

### Key Concepts

1. **Trunk-Based Development**
   - Single main branch as source of truth
   - Short-lived feature branches
   - Frequent integration
   - Fast deployment

2. **GitFlow Simplified**
   - No develop branch (main serves this purpose)
   - No release branches (use tags)
   - Hotfixes go through main
   - Features merge to main

3. **Deployment Branches**
   - Separate from development flow
   - Force-pushed from main
   - Trigger CI/CD pipelines
   - Never merged back

### Commands Cheat Sheet

```bash
# Check status
git status
git branch -a

# Start work
git checkout main && git pull origin main
git checkout -b feature/name

# Save work
git add . && git commit -m "message"
git push origin feature/name

# Deploy
git push origin main:deploy/production-frontend --force
git push origin main:deploy/production-backend --force

# Clean up
git branch -d feature/name
git push origin --delete feature/name
```

---

## 🔐 Branch Protection

### Recommended GitHub Settings

**For `main` branch:**
- ✅ Require pull request reviews (1+ approver)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ❌ Allow force pushes
- ❌ Allow deletions

**For `deploy/*` branches:**
- ✅ Restrict who can push (admins only)
- ✅ Allow force pushes (for deployment)
- ❌ Require pull requests
- ❌ Allow deletions

---

## 📞 Support

**Questions about branching strategy?**
1. Check this document
2. Review `REPOSITORY_STRUCTURE.md`
3. Check `DEPLOYMENT_WORKFLOW.md`
4. Contact team lead

**Useful Links:**
- [Repository](https://github.com/marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2)
- [Render Dashboard](https://dashboard.render.com)
- [Branch Strategy Guide](https://trunkbaseddevelopment.com/)

---

**Last Updated:** November 15, 2025  
**Maintained By:** Development Team  
**Review Cycle:** Monthly
