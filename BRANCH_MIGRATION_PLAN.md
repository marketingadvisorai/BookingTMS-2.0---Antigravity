# Branch Migration Plan - Clean Repository Structure

**Date:** November 15, 2025 04:11 AM UTC+6  
**Status:** ⚠️ Ready to Execute  
**Risk Level:** 🟡 Medium (requires Render configuration update)

---

## Problem Statement

### Current Issues

1. **Confusing Branch Names**
   - `booking-tms-beta-0.1.9` - Contains version number, suggests it's version-specific
   - `backend-render-deploy` - Inconsistent naming with frontend
   - No clear naming pattern across deployment branches

2. **Potential Conflicts**
   - Multiple branches with similar purposes
   - Version numbers in branch names cause confusion
   - No clear distinction between deployment and feature branches

3. **Technical Debt**
   - Many old/merged feature branches still exist
   - Backup branches not clearly marked
   - Dependabot branches accumulating

---

## Proposed Solution

### New Branch Structure

```
Repository Root
│
├── main                           # Production-ready code (source of truth)
│
├── deploy/
│   ├── production-frontend        # Frontend deployment to Render
│   └── production-backend         # Backend deployment to Render
│
├── feature/
│   ├── feature-name-1            # Active feature branches
│   └── feature-name-2
│
└── archive/
    ├── backup-*                  # Archived backup branches
    └── old-feature-*            # Historical branches
```

---

## Migration Steps

### Phase 1: Rename Deployment Branches ⚠️ CRITICAL

#### Step 1.1: Rename Frontend Deploy Branch

**Current:** `booking-tms-beta-0.1.9`  
**New:** `deploy/production-frontend`

```bash
# 1. Create new branch from current deploy branch
git fetch origin
git checkout -b deploy/production-frontend origin/booking-tms-beta-0.1.9

# 2. Push new branch to GitHub
git push origin deploy/production-frontend

# 3. VERIFY new branch exists on GitHub
git ls-remote --heads origin | grep deploy/production-frontend
```

**Expected Output:**
```
refs/heads/deploy/production-frontend
```

#### Step 1.2: Update Render Frontend Service

⚠️ **CRITICAL:** Do NOT delete old branch until Render is updated!

1. Go to Render Dashboard: https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g
2. Click "Settings" tab
3. Scroll to "Branch" section
4. Change from `booking-tms-beta-0.1.9` to `deploy/production-frontend`
5. Click "Save Changes"
6. **Wait for confirmation** - Render will trigger a new deploy
7. **Verify deployment succeeds** - Check dashboard status

#### Step 1.3: Delete Old Frontend Branch

⚠️ **ONLY after Render is updated and working!**

```bash
# Verify Render is using new branch (check dashboard first!)
# Then delete old branch from GitHub
git push origin --delete booking-tms-beta-0.1.9

# Delete local branch if you have it
git branch -d booking-tms-beta-0.1.9
```

---

#### Step 1.4: Rename Backend Deploy Branch

**Current:** `backend-render-deploy`  
**New:** `deploy/production-backend`

```bash
# 1. Create new branch from current deploy branch
git fetch origin
git checkout -b deploy/production-backend origin/backend-render-deploy

# 2. Push new branch to GitHub
git push origin deploy/production-backend

# 3. VERIFY new branch exists on GitHub
git ls-remote --heads origin | grep deploy/production-backend
```

#### Step 1.5: Update Render Backend Service

1. Go to Render Dashboard: https://dashboard.render.com/web/srv-d49gml95pdvs73ctdb5g
2. Click "Settings" tab
3. Scroll to "Branch" section
4. Change from `backend-render-deploy` to `deploy/production-backend`
5. Click "Save Changes"
6. **Wait for confirmation** - Render will trigger a new deploy
7. **Verify deployment succeeds** - Check dashboard status

#### Step 1.6: Delete Old Backend Branch

⚠️ **ONLY after Render is updated and working!**

```bash
# Verify Render is using new branch (check dashboard first!)
# Then delete old branch from GitHub
git push origin --delete backend-render-deploy

# Delete local branch if you have it
git branch -d backend-render-deploy
```

---

### Phase 2: Clean Up Old Feature Branches

#### Step 2.1: Identify Merged Branches

```bash
# List branches merged into main
git branch -r --merged origin/main | grep -v main | grep -v HEAD

# Expected to find:
# - stripe-api-0.1
# - stripe-integration-0.1.3
# - fixing-10.1
# - render-deploy-0.1
# - widget-design-preview-test
```

#### Step 2.2: Delete Merged Feature Branches

```bash
# Delete old feature branches that are merged
git push origin --delete stripe-api-0.1
git push origin --delete stripe-integration-0.1.3
git push origin --delete fixing-10.1
git push origin --delete render-deploy-0.1
git push origin --delete widget-design-preview-test
git push origin --delete farebook-restructure-2.0
git push origin --delete booking-tms-beta-0.1.5

# Delete confusing branch name (typo)
git push origin --delete Coustomer-Dashboard---BookingTMS
```

---

### Phase 3: Archive Backup Branches

#### Step 3.1: Rename Backup Branches

```bash
# Rename backup branches for clarity
git fetch origin

# Backup branch 1
git checkout -b archive/backup-pre-multi-tenant-20251113 origin/backup-pre-multi-tenant-20251113-0816
git push origin archive/backup-pre-multi-tenant-20251113
git push origin --delete backup-pre-multi-tenant-20251113-0816

# Backup branch 2
git checkout -b archive/advanced-settings-backup origin/advanced-settings-backup
git push origin archive/advanced-settings-backup
git push origin --delete advanced-settings-backup
```

---

### Phase 4: Update Local Repository

#### Step 4.1: Clean Up Local Branches

```bash
# Fetch latest from origin
git fetch origin --prune

# List all local branches
git branch

# Delete old local branches
git branch -d booking-tms-beta-0.1.9
git branch -d backend-render-deploy
git branch -d stripe-api-0.1
git branch -d stripe-integration-0.1.3
# ... delete any other old branches

# Return to main
git checkout main
git pull origin main
```

#### Step 4.2: Verify Clean State

```bash
# Should only see:
git branch -a | grep -E "(main|deploy|feature|archive)"

# Expected output:
# * main
#   feature/next-phase-prep
#   remotes/origin/main
#   remotes/origin/deploy/production-frontend
#   remotes/origin/deploy/production-backend
#   remotes/origin/feature/next-phase-prep
#   remotes/origin/archive/*
```

---

### Phase 5: Update Documentation

#### Step 5.1: Update All References

Update these files to reference new branch names:
- ✅ `REPOSITORY_STRUCTURE.md` - Already updated
- ✅ `DEPLOYMENT_WORKFLOW.md` - Already updated
- ✅ `QUICK_REFERENCE.md` - Already updated
- [ ] `README.md` - Update deployment instructions
- [ ] `SETUP_GUIDE.md` - Update branch references
- [ ] `.github/workflows/*` - Update CI/CD if exists

---

## Verification Checklist

### After Phase 1 (Critical)

- [ ] New frontend deploy branch exists: `deploy/production-frontend`
- [ ] New backend deploy branch exists: `deploy/production-backend`
- [ ] Render frontend service uses new branch
- [ ] Render backend service uses new branch
- [ ] Frontend deploys successfully from new branch
- [ ] Backend deploys successfully from new branch
- [ ] Frontend URL works: https://bookingtms-frontend.onrender.com
- [ ] Backend URL works: https://bookingtms-backend-api.onrender.com
- [ ] Old branches deleted: `booking-tms-beta-0.1.9`, `backend-render-deploy`

### After Phase 2

- [ ] Old feature branches deleted from GitHub
- [ ] No confusing branch names remain
- [ ] All active work moved to proper feature branches

### After Phase 3

- [ ] Backup branches moved to `archive/` prefix
- [ ] Backup branches documented
- [ ] Old backup branches deleted

### After Phase 4

- [ ] Local repository cleaned
- [ ] Only relevant branches remain locally
- [ ] `main` is up to date

### After Phase 5

- [ ] All documentation updated
- [ ] Team notified of changes
- [ ] README reflects new structure

---

## Rollback Plan

### If Migration Fails

#### Rollback Frontend Deploy Branch

```bash
# If new branch doesn't work:
# 1. Go to Render dashboard
# 2. Change branch back to: booking-tms-beta-0.1.9
# 3. Delete problematic branch
git push origin --delete deploy/production-frontend

# 4. Verify old branch still works
curl https://bookingtms-frontend.onrender.com
```

#### Rollback Backend Deploy Branch

```bash
# If new branch doesn't work:
# 1. Go to Render dashboard
# 2. Change branch back to: backend-render-deploy
# 3. Delete problematic branch
git push origin --delete deploy/production-backend

# 4. Verify old branch still works
curl https://bookingtms-backend-api.onrender.com/health
```

---

## Timeline

### Conservative Timeline (Recommended)

**Day 1 (Today):**
- Execute Phase 1.1-1.3 (Frontend rename)
- Monitor for 2 hours
- Verify everything works

**Day 2:**
- Execute Phase 1.4-1.6 (Backend rename)
- Monitor for 2 hours
- Verify everything works

**Day 3:**
- Execute Phase 2 (Clean up feature branches)
- Execute Phase 3 (Archive backups)

**Day 4:**
- Execute Phase 4 (Clean local repo)
- Execute Phase 5 (Update docs)

### Aggressive Timeline (If Confident)

**Same Day (2-3 hours):**
- Execute all phases sequentially
- Monitor each phase for 15 minutes
- Have rollback plan ready

---

## Risk Assessment

### Phase 1: HIGH RISK ⚠️
- **Risk:** Breaking production deployments
- **Mitigation:** 
  - Keep old branches until verified
  - Update Render config carefully
  - Test each service separately
  - Have rollback plan ready

### Phase 2: LOW RISK ✅
- **Risk:** Deleting branches with unmerged work
- **Mitigation:**
  - Verify branches are merged first
  - Check with team before deleting
  - Can restore from GitHub if needed (30 days)

### Phase 3: LOW RISK ✅
- **Risk:** Losing backup data
- **Mitigation:**
  - Just renaming, not deleting
  - Backups remain accessible
  - Can undo rename easily

### Phase 4-5: MINIMAL RISK ✅
- **Risk:** Local inconsistencies
- **Mitigation:**
  - Only affects local repo
  - Can re-clone if issues arise
  - Documentation updates are reversible

---

## Success Criteria

### Must Have (MVP)

- ✅ Both Render services deploy from new branch names
- ✅ No production downtime
- ✅ URLs still work
- ✅ Old confusing branches deleted

### Should Have

- ✅ All feature branches follow naming convention
- ✅ Archive branches clearly marked
- ✅ Documentation fully updated
- ✅ Team trained on new structure

### Nice to Have

- ✅ CI/CD uses new branch names
- ✅ GitHub branch protection rules configured
- ✅ Automated branch cleanup configured

---

## Post-Migration Actions

### Update Team

1. Send team notification about branch rename
2. Share updated documentation
3. Conduct brief training session
4. Update any bookmarks/scripts

### Configure Protections

```bash
# On GitHub (via web interface):
# 1. Go to Settings > Branches
# 2. Add protection rule for `main`:
#    - Require pull request reviews
#    - Require status checks
#    - Require branches to be up to date
# 3. Add protection rule for `deploy/*`:
#    - Restrict who can push (admins only)
```

### Monitor for 1 Week

- Check deployment logs daily
- Verify team is using new branches
- Address any confusion quickly
- Update docs based on feedback

---

## Commands Summary

### Execute Full Migration (Copy-Paste Friendly)

```bash
# PHASE 1: Rename Deploy Branches
git fetch origin
git checkout -b deploy/production-frontend origin/booking-tms-beta-0.1.9
git push origin deploy/production-frontend
git checkout -b deploy/production-backend origin/backend-render-deploy
git push origin deploy/production-backend

# ⚠️ NOW UPDATE RENDER CONFIG IN DASHBOARD ⚠️
# Wait for deployments to succeed, then continue:

git push origin --delete booking-tms-beta-0.1.9
git push origin --delete backend-render-deploy

# PHASE 2: Clean Up Feature Branches
git push origin --delete stripe-api-0.1
git push origin --delete stripe-integration-0.1.3
git push origin --delete fixing-10.1
git push origin --delete render-deploy-0.1
git push origin --delete widget-design-preview-test
git push origin --delete farebook-restructure-2.0
git push origin --delete booking-tms-beta-0.1.5
git push origin --delete Coustomer-Dashboard---BookingTMS

# PHASE 3: Archive Backups
git checkout -b archive/backup-pre-multi-tenant-20251113 origin/backup-pre-multi-tenant-20251113-0816
git push origin archive/backup-pre-multi-tenant-20251113
git push origin --delete backup-pre-multi-tenant-20251113-0816

# PHASE 4: Clean Local
git fetch origin --prune
git checkout main
git branch -D deploy/production-frontend deploy/production-backend
git branch -D booking-tms-beta-0.1.9 backend-render-deploy 2>/dev/null

# DONE!
git status
git branch -a
```

---

## Notes

- Keep this document for reference during migration
- Mark checkboxes as you complete each step
- Document any issues encountered
- Update this doc with lessons learned

---

**Migration Prepared By:** System  
**Review Required:** Yes  
**Execution Authorization:** Pending
