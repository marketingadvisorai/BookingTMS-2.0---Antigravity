# 🚀 Deployment Guide v0.2.0 - Storage Update

**Date:** November 16, 2025  
**Version:** 0.2.0 (Storage Integration)  
**Status:** Ready for Production Deployment  

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [x] Build completes successfully (`npm run build`)
- [x] No TypeScript errors in storage implementation
- [x] All storage buckets created with RLS policies
- [x] Storage service thoroughly tested
- [x] Migration documentation complete

### ✅ Environment Variables
Ensure these are set in Render dashboard:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ohfjkcajnqvethmrpdwc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
VITE_APP_URL=https://bookingtms-frontend.onrender.com
NODE_ENV=production
```

### ✅ Supabase Migration
Run this migration in Supabase SQL Editor:

```sql
-- Already applied in production ✅
-- Migration: create_storage_buckets_and_policies
-- Creates: venue-logos, game-images, user-uploads, private-documents
-- With proper RLS policies
```

---

## 🎯 Deployment Steps

### 1. **Update Frontend (Static Site)**

**Current Service:** `bookingtms-frontend`  
**Current Branch:** `booking-tms-beta-0.1.9`  
**Target Branch:** `main` (with v0.2.0 storage update)

#### Option A: Update via Render Dashboard
1. Go to https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g
2. Settings → Branch: Change from `booking-tms-beta-0.1.9` to `main`
3. Save Changes
4. Render will auto-deploy the latest `main` commit

#### Option B: Update via CLI

```bash
# Already pushed to origin/main with tag v0.2.0-storage
# Render will auto-deploy if branch is set to 'main'
```

#### Deployment Configuration
```yaml
Service: bookingtms-frontend
Type: Static Site
Branch: main
Build Command: npm install && npm run build
Publish Directory: build
Auto-Deploy: Yes
```

---

### 2. **Backend API (Optional Update)**

**Current Service:** `bookingtms-backend-api`  
**Current Branch:** `backend-render-deploy`  
**Status:** No changes needed for storage (frontend feature)

The backend doesn't need updates unless you want to add storage-related API endpoints.

---

## 🔍 Post-Deployment Verification

### Automated Checks
1. **Build Status**
   - Check Render dashboard for successful build
   - Verify no build errors

2. **Storage Functionality**
   ```bash
   # Test uploads in production
   - Profile photo upload → Should create file in 'profile-photos' bucket
   - Venue logo upload → Should create file in 'venue-logos' bucket
   - Game image upload → Should create file in 'game-images' bucket
   ```

3. **Image Loading**
   - All images should load from `*.supabase.co/storage/v1/object/public/`
   - CDN caching should be active (check Network tab)
   - No base64 data URLs in image sources

### Manual Testing Checklist

- [ ] **Profile Settings**
  - Upload new profile photo
  - Verify it uploads to Supabase Storage
  - Check old photo is deleted
  - Confirm CDN URL is saved

- [ ] **Widget Configuration**
  - Upload venue logo in Custom Settings
  - Verify optimization (should be <2MB)
  - Check CDN delivery

- [ ] **Game Management**
  - Create new game with cover image
  - Add multiple gallery images
  - Verify all upload to `game-images` bucket
  - Test image deletion

---

## 📊 Performance Monitoring

### Expected Metrics (After Deployment)

| Metric | Before | Target | How to Check |
|--------|--------|--------|--------------|
| Database Size | ~100MB | 10-30MB | Supabase Dashboard → Database |
| Image Load Time | 2-5s | 0.3-0.5s | Chrome DevTools → Network |
| Page Load Time | 3-4s | 1.5-2s | Lighthouse/PageSpeed |
| Storage Used | 0MB | Variable | Supabase → Storage |

### Monitoring Tools

1. **Render Metrics**
   - https://dashboard.render.com/static/srv-d49lmtvdiees73aikb9g/metrics
   - Track: Bandwidth, Build times, Deploy success rate

2. **Supabase Storage**
   - https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/storage/buckets
   - Track: File count, Storage size, CDN bandwidth

3. **Application Performance**
   ```bash
   # Run Lighthouse audit
   lighthouse https://bookingtms-frontend.onrender.com --view
   ```

---

## 🔄 Migration Strategy

### For Existing Data

**Option 1: Lazy Migration (Recommended)**
- Existing base64 images continue to work
- New uploads automatically use storage
- Gradually migrate on edit/update

**Option 2: Bulk Migration**
Use the migration script in `SUPABASE_STORAGE_IMPLEMENTATION_COMPLETE.md`:

```typescript
// Run in Node.js environment with Supabase service key
npm run migrate:storage

// Or manually via Supabase dashboard
// See migration script section in docs
```

**Timeline:**
- Week 1: Deploy, monitor performance
- Week 2-3: Lazy migration via natural updates
- Week 4: Optional bulk migration of remaining data

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Symptoms:** Render build fails with TypeScript errors

**Solution:**
```bash
# Check local build
npm run build

# If successful locally but fails on Render:
# 1. Clear Render build cache
# 2. Verify Node version matches (check package.json engines)
# 3. Check environment variables are set
```

### Issue: Images Not Uploading

**Symptoms:** Upload button doesn't work, errors in console

**Solution:**
1. Check Supabase Storage buckets exist
2. Verify RLS policies are active
3. Check browser console for CORS errors
4. Verify Supabase anon key in env vars

### Issue: Old Images Still Base64

**Symptoms:** Some images load slowly, not from CDN

**Solution:**
- This is expected during migration
- Run migration script or update manually
- Images will convert on next edit/upload

---

## 📈 Rollback Plan

If issues arise, rollback procedure:

### Quick Rollback (Frontend Only)
```bash
# Option 1: Via Render Dashboard
1. Go to Deployments tab
2. Find previous stable deployment
3. Click "Rollback to this version"

# Option 2: Via Git
git checkout booking-tms-beta-0.1.9
git push origin booking-tms-beta-0.1.9 --force
# Then update Render branch setting
```

### Full Rollback (With Database)
```bash
# 1. Rollback frontend (above)

# 2. Revert Supabase migration
# In Supabase SQL Editor:
DROP POLICY "Public read access for venue logos" ON storage.objects;
DROP POLICY "Public read access for game images" ON storage.objects;
# ... (drop all storage policies)

# Delete buckets (optional, keeps uploaded files)
DELETE FROM storage.buckets WHERE id IN 
  ('venue-logos', 'game-images', 'user-uploads', 'private-documents');
```

**Note:** Uploaded files in storage will remain and need manual cleanup if rolling back permanently.

---

## 🎉 Success Criteria

Deployment is successful when:

✅ All builds complete without errors  
✅ Images upload to Supabase Storage  
✅ Images load from CDN URLs  
✅ Page load time improves by 40%+  
✅ No increase in error rate  
✅ Storage usage is tracking correctly  

---

## 📞 Support

**Documentation:**
- Storage Implementation: `SUPABASE_STORAGE_IMPLEMENTATION_COMPLETE.md`
- Storage Strategy: `SUPABASE_STORAGE_STRATEGY.md`
- Changelog: `.github/CHANGELOG.md`

**Monitoring:**
- Render Dashboard: https://dashboard.render.com
- Supabase Dashboard: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc
- GitHub: https://github.com/marketingadvisorai/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2

---

**Deployment Status:** Ready ✅  
**Recommended Deploy Time:** Non-peak hours  
**Estimated Downtime:** 0 minutes (zero-downtime deployment)  
**Rollback Time:** <5 minutes if needed
