# Super Admin Login Fix - Task List

**Issue**: After logging in as super admin, the app shows "Loading your profile..." indefinitely.

**Root Cause**: RLS policy on `users` table fails for users without `organization_id`, causing `loadUserProfile()` to return null silently.

---

## Tasks

### Phase 1: Database Fixes (Priority: Critical)
- [x] Task 1.1: Create migration to fix RLS policies for system-admin users ✅
- [x] Task 1.2: Add helper function for platform user detection ✅
- [x] Task 1.3: Verify system-admin user exists in public.users table ✅

### Phase 2: Frontend Auth Fixes (Priority: Critical)
- [x] Task 2.1: Add error handling in loadUserProfile with proper logging ✅
- [x] Task 2.2: Add timeout mechanism for profile loading ✅
- [x] Task 2.3: Show meaningful error message instead of infinite loading ✅
- [x] Task 2.4: Add retry mechanism for failed profile loads ✅

### Phase 3: Architecture Improvements (Priority: High)
- [x] Task 3.1: Create architecture documentation with ERD ✅
- [x] Task 3.2: Add proper role-based dashboard routing ✅
- [x] Task 3.3: Ensure system-admin redirects to /system-admin after login ✅

### Phase 4: Testing & Validation (Priority: High)
- [x] Task 4.1: Apply migration 053 to database ✅
- [x] Task 4.2: Verify RLS policies correctly applied ✅
- [ ] Task 4.3: Test system-admin login flow (user testing)
- [ ] Task 4.4: Test super-admin (org owner) login flow (user testing)

### Verified RLS Policies
```
✓ Users can read own profile: auth.uid() = id
✓ Platform admins can read all users: is_platform_admin()
✓ Org members can view same org users: org_id match with null check
✓ Service role full access: auth.role() = 'service_role'
```

## Login Credentials

### System Admin (Platform Owner)
| Field | Value |
|-------|-------|
| **Login URL** | http://localhost:3006/system-admin-login |
| **Username** | `sysadmin` |
| **Email** | `marketingadvisorai@gmail.com` |
| **Password** | (your existing password) |
| **Redirects to** | `/system-admin` |

### Super Admin (Organization Owner)
| Field | Value |
|-------|-------|
| **Login URL** | http://localhost:3006/system-admin-login |
| **Username** | `superadmin` |
| **Email** | `superadmin@bookingtms.com` |
| **Password** | `Test123!` |
| **Organization** | Test Organization |
| **Redirects to** | `/dashboard` |

### Org Admin (Organization Manager)
| Field | Value |
|-------|-------|
| **Login URL** | http://localhost:3006/org-login |
| **Username** | `orgadmin` |
| **Email** | `orgadmin@bookingtms.com` |
| **Password** | `Test123!` |
| **Organization** | Test Organization |
| **Redirects to** | `/dashboard` |

### Admin (General Admin)
| Field | Value |
|-------|-------|
| **Login URL** | http://localhost:3006/org-login |
| **Username** | `admin` |
| **Email** | `admin@bookingtms.com` |
| **Password** | `Test123!` |
| **Organization** | Test Organization |
| **Redirects to** | `/dashboard` |

### Login Methods Supported
- ✅ Email login
- ✅ Username login (new feature)

---

## Technical Details

### Current Flow (Broken)
```
Login → Supabase Auth → Session Created → loadUserProfile() 
                                              ↓
                                    RLS blocks query (NULL org_id)
                                              ↓
                                    Profile = null
                                              ↓
                                    Infinite "Loading your profile..."
```

### Fixed Flow
```
Login → Supabase Auth → Session Created → loadUserProfile()
                                              ↓
                                    RLS allows self-lookup
                                              ↓
                                    Profile loaded ✓
                                              ↓
                                    Redirect to appropriate dashboard
                                    (system-admin → /system-admin)
                                    (others → /dashboard)
```

---

## Files to Modify

1. `supabase/migrations/053_fix_system_admin_rls.sql` - New migration
2. `src/lib/auth/AuthContext.tsx` - Add error handling
3. `src/App.tsx` - Add proper routing after login

---

## Progress Log

- **Nov 30, 2025 09:45**: Issue identified - RLS policy blocking system-admin profile query
- **Nov 30, 2025 09:50**: Architecture document created
- **Nov 30, 2025 10:00**: Task list created, starting implementation
