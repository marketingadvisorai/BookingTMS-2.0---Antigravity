# Folder Structure Implementation Checklist

**Step-by-step guide to implementing the complete folder structure**

---

## 📊 Overview

**Total Folders to Add**: 11 new folders  
**Estimated Time**: 2-4 weeks  
**Priority**: High → Medium → Low

---

## ✅ Phase 1: Core Structure (Week 1) - HIGH PRIORITY

### 1. `/hooks` - Custom React Hooks

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Create `/hooks/index.ts` export file
- [ ] Move `useNotifications` from `/lib/notifications`
- [ ] Extract theme hook from `/components/layout/ThemeContext.tsx`
- [ ] Extract auth hook from `/lib/auth/AuthContext.tsx`
- [ ] Create `useLocalStorage.ts`
- [ ] Create `useDebounce.ts`
- [ ] Create `useMediaQuery.ts`
- [ ] Update all imports across codebase

**Files to Create**:
```
/hooks/index.ts
/hooks/useAuth.ts (from AuthContext)
/hooks/useTheme.ts (from ThemeContext)
/hooks/useNotifications.ts (from NotificationContext)
/hooks/useLocalStorage.ts (new)
/hooks/useDebounce.ts (new)
/hooks/useMediaQuery.ts (new)
```

**Impact**: High - Used everywhere

---

### 2. `/contexts` - React Contexts

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Create `/contexts/index.ts` export file
- [ ] Move `/lib/auth/AuthContext.tsx` → `/contexts/AuthContext.tsx`
- [ ] Move `/components/layout/ThemeContext.tsx` → `/contexts/ThemeContext.tsx`
- [ ] Move `/lib/notifications/NotificationContext.tsx` → `/contexts/NotificationContext.tsx`
- [ ] Move `/components/widgets/WidgetThemeContext.tsx` → `/contexts/WidgetThemeContext.tsx`
- [ ] Move `/components/widgets/WidgetConfigContext.tsx` → `/contexts/WidgetConfigContext.tsx`
- [ ] Create `/contexts/AppProvider.tsx` (compose all providers)
- [ ] Update all imports across codebase

**Files to Create**:
```
/contexts/index.ts
/contexts/AuthContext.tsx (moved)
/contexts/ThemeContext.tsx (moved)
/contexts/NotificationContext.tsx (moved)
/contexts/WidgetThemeContext.tsx (moved)
/contexts/WidgetConfigContext.tsx (moved)
/contexts/AppProvider.tsx (new)
```

**Impact**: High - Used everywhere

---

### 3. `/constants` - Application Constants

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Create `/constants/index.ts` export file
- [ ] Create `/constants/routes.ts` - Extract all route strings
- [ ] Create `/constants/colors.ts` - Design system colors
- [ ] Create `/constants/status.ts` - Booking/payment statuses
- [ ] Create `/constants/permissions.ts` - Move from `/lib/auth/permissions.ts`
- [ ] Create `/constants/roles.ts` - Extract role definitions
- [ ] Create `/constants/validation.ts` - Validation rules
- [ ] Create `/constants/notifications.ts` - Notification types
- [ ] Update all imports across codebase

**Files to Create**:
```
/constants/index.ts
/constants/routes.ts (new)
/constants/colors.ts (new)
/constants/status.ts (new)
/constants/permissions.ts (moved from lib/auth)
/constants/roles.ts (new)
/constants/validation.ts (new)
/constants/notifications.ts (new)
/constants/breakpoints.ts (new)
```

**Impact**: High - Improves maintainability

---

### 4. `/mocks` - Mock Data

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Create `/mocks/index.ts` export file
- [ ] Move `/lib/notifications/mockData.ts` → `/mocks/notifications.ts`
- [ ] Move `/lib/payment/mockData.ts` → `/mocks/payments.ts`
- [ ] Create `/mocks/bookings.ts` - Mock bookings
- [ ] Create `/mocks/customers.ts` - Mock customers
- [ ] Create `/mocks/games.ts` - Mock games
- [ ] Create `/mocks/users.ts` - Mock users
- [ ] Update all imports across codebase

**Files to Create**:
```
/mocks/index.ts
/mocks/notifications.ts (moved)
/mocks/payments.ts (moved)
/mocks/bookings.ts (new)
/mocks/customers.ts (new)
/mocks/games.ts (new)
/mocks/users.ts (new)
```

**Impact**: Medium - Better organization

---

### 5. `/public` - Static Assets

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Create folder structure
- [ ] Add logo files (logo.png, logo-dark.png)
- [ ] Add favicon.ico and icon variations
- [ ] Add widget preview images
- [ ] Add notification sound file
- [ ] Create manifest.json for PWA
- [ ] Optimize all images

**Files to Create**:
```
/public/images/logo.png
/public/images/logo-dark.png
/public/images/placeholder.png
/public/icons/favicon.ico
/public/icons/icon-192.png
/public/icons/icon-512.png
/public/audio/notification.mp3
/public/manifest.json
```

**Impact**: Medium - UI polish

---

## ⚡ Phase 2: Services & APIs (Week 2) - HIGH PRIORITY

### 6. `/services` - Frontend API Services

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Create folder structure
- [ ] Create `/services/api/base.ts` - Base API client with axios
- [ ] Create `/services/api/bookings.ts` - Booking API client
- [ ] Create `/services/api/customers.ts` - Customer API client
- [ ] Create `/services/api/games.ts` - Games API client
- [ ] Create `/services/api/payments.ts` - Payment API client
- [ ] Create `/services/api/auth.ts` - Auth API client
- [ ] Create `/services/storage/localStorage.ts` - LocalStorage wrapper
- [ ] Create `/services/external/stripe.ts` - Stripe client
- [ ] Update hooks to use services

**Files to Create**:
```
/services/index.ts
/services/api/base.ts
/services/api/bookings.ts
/services/api/customers.ts
/services/api/games.ts
/services/api/payments.ts
/services/api/auth.ts
/services/storage/localStorage.ts
/services/external/stripe.ts
```

**Impact**: High - Clean separation

---

### 7. `/api` - Next.js API Routes

**Status**: ❌ Not created yet  
**Action Items**:
- [ ] Create folder structure
- [ ] Create `/api/bookings/index.ts` - GET/POST bookings
- [ ] Create `/api/bookings/[id].ts` - GET/PUT/DELETE by ID
- [ ] Create `/api/customers/index.ts` - Customer endpoints
- [ ] Create `/api/games/index.ts` - Game endpoints
- [ ] Create `/api/payments/intent.ts` - Create payment intent
- [ ] Create `/api/payments/webhook.ts` - Stripe webhook
- [ ] Create `/api/auth/login.ts` - Login endpoint
- [ ] Connect to backend services

**Files to Create**:
```
/api/bookings/index.ts
/api/bookings/[id].ts
/api/customers/index.ts
/api/customers/[id].ts
/api/games/index.ts
/api/games/[id].ts
/api/payments/intent.ts
/api/payments/webhook.ts
/api/auth/login.ts
/api/auth/signup.ts
```

**Impact**: High - API layer

---

### 8. `/validators` - Validation Schemas

**Status**: ❌ Not created yet  
**Action Items**:
- [ ] Install Zod: `npm install zod`
- [ ] Create `/validators/index.ts` export file
- [ ] Create `/validators/booking.ts` - Booking validation
- [ ] Create `/validators/customer.ts` - Customer validation
- [ ] Create `/validators/game.ts` - Game validation
- [ ] Create `/validators/auth.ts` - Auth validation
- [ ] Create `/validators/common.ts` - Common validators
- [ ] Integrate with forms

**Files to Create**:
```
/validators/index.ts
/validators/booking.ts
/validators/customer.ts
/validators/game.ts
/validators/auth.ts
/validators/common.ts
```

**Dependencies**:
```bash
npm install zod
```

**Impact**: High - Data integrity

---

## 🧪 Phase 3: Testing (Week 3) - CRITICAL

### 9. `/tests` - Testing Suite

**Status**: ✅ Folder created with README  
**Action Items**:
- [ ] Install testing dependencies
- [ ] Create `/tests/setup.ts` - Test configuration
- [ ] Create `/tests/helpers.ts` - Test utilities
- [ ] Create `/tests/fixtures.ts` - Test data
- [ ] Create unit tests for components
- [ ] Create unit tests for hooks
- [ ] Create unit tests for services
- [ ] Create integration tests for APIs
- [ ] Create E2E tests for critical flows
- [ ] Set up CI/CD for tests

**Files to Create**:
```
/tests/setup.ts
/tests/helpers.ts
/tests/fixtures.ts
/tests/unit/components/Button.test.tsx
/tests/unit/hooks/useAuth.test.ts
/tests/unit/services/bookingService.test.ts
/tests/integration/api/bookings.test.ts
/tests/e2e/booking-flow.test.ts
```

**Dependencies**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @playwright/test
```

**Impact**: Critical - Code quality

---

## 📚 Phase 4: Documentation & DevOps (Week 4) - MEDIUM PRIORITY

### 10. `/docs` - Technical Documentation

**Status**: ❌ Not created yet  
**Action Items**:
- [ ] Create folder structure
- [ ] Create `/docs/architecture/overview.md`
- [ ] Create `/docs/architecture/database-schema.md`
- [ ] Create `/docs/api/bookings.md` - API documentation
- [ ] Create `/docs/deployment/vercel.md`
- [ ] Create `/docs/integrations/stripe.md`
- [ ] Create `/docs/troubleshooting/common-errors.md`
- [ ] Create `/docs/changelog/CHANGELOG.md`

**Files to Create**:
```
/docs/README.md
/docs/architecture/overview.md
/docs/architecture/database-schema.md
/docs/api/bookings.md
/docs/deployment/vercel.md
/docs/integrations/stripe.md
```

**Impact**: Medium - Team knowledge

---

### 11. `/scripts` - Automation Scripts

**Status**: ❌ Not created yet  
**Action Items**:
- [ ] Create `/scripts/setup.sh` - Initial setup script
- [ ] Create `/scripts/seed-database.ts` - Seed test data
- [ ] Create `/scripts/generate-types.ts` - Generate TypeScript types
- [ ] Create `/scripts/migrate.ts` - Run migrations
- [ ] Create `/scripts/backup.ts` - Database backup
- [ ] Make scripts executable

**Files to Create**:
```
/scripts/setup.sh
/scripts/seed-database.ts
/scripts/generate-types.ts
/scripts/migrate.ts
/scripts/backup.ts
/scripts/test-connection.ts
```

**Impact**: Medium - Developer experience

---

### 12. `/config` - Configuration Files

**Status**: ❌ Not created yet  
**Action Items**:
- [ ] Create `/config/index.ts` - Main config
- [ ] Create `/config/app.config.ts` - App settings
- [ ] Create `/config/theme.config.ts` - Theme config
- [ ] Create `/config/api.config.ts` - API config
- [ ] Create `/config/stripe.config.ts` - Stripe settings

**Files to Create**:
```
/config/index.ts
/config/app.config.ts
/config/theme.config.ts
/config/api.config.ts
/config/stripe.config.ts
```

**Impact**: Low - Nice to have

---

### 13. `/.github` - GitHub Workflows

**Status**: ❌ Not created yet  
**Action Items**:
- [ ] Create `/.github/workflows/ci.yml` - CI pipeline
- [ ] Create `/.github/workflows/deploy.yml` - Deployment
- [ ] Create `/.github/workflows/tests.yml` - Test runner
- [ ] Create `/.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] Create `/.github/PULL_REQUEST_TEMPLATE.md`

**Files to Create**:
```
/.github/workflows/ci.yml
/.github/workflows/deploy.yml
/.github/workflows/tests.yml
/.github/ISSUE_TEMPLATE/bug_report.md
/.github/PULL_REQUEST_TEMPLATE.md
```

**Impact**: Medium - CI/CD

---

## 📋 Quick Start Actions (Today)

### Immediate (Next 2 Hours)

1. **Create `/hooks/index.ts`**:
```typescript
export * from './useAuth';
export * from './useTheme';
export * from './useNotifications';
```

2. **Create `/contexts/index.ts`**:
```typescript
export * from './AuthContext';
export * from './ThemeContext';
export * from './NotificationContext';
```

3. **Create `/constants/routes.ts`**:
```typescript
export const ROUTES = {
  DASHBOARD: '/dashboard',
  BOOKINGS: '/bookings',
  // ... rest
} as const;
```

4. **Create `/mocks/index.ts`**:
```typescript
export * from './bookings';
export * from './customers';
```

5. **Add public folder with logo and favicon**

### This Week

- [ ] Complete Phase 1 (hooks, contexts, constants, mocks, public)
- [ ] Update imports across entire codebase
- [ ] Test all pages still work

### Next Week

- [ ] Complete Phase 2 (services, API routes, validators)
- [ ] Create frontend API clients
- [ ] Connect frontend to backend

### Week 3

- [ ] Complete Phase 3 (testing)
- [ ] Write unit tests for critical components
- [ ] Set up E2E testing

### Week 4

- [ ] Complete Phase 4 (docs, scripts, config)
- [ ] Set up CI/CD
- [ ] Write technical documentation

---

## 🎯 Success Metrics

### Phase 1 Complete When:
- [ ] All contexts moved to `/contexts`
- [ ] All hooks moved to `/hooks`
- [ ] All constants extracted to `/constants`
- [ ] All mocks moved to `/mocks`
- [ ] Public folder has assets
- [ ] All imports updated
- [ ] All pages working

### Phase 2 Complete When:
- [ ] All API clients in `/services`
- [ ] All API routes in `/api`
- [ ] All validators created
- [ ] Frontend using services
- [ ] Backend connected to API routes

### Phase 3 Complete When:
- [ ] 80%+ test coverage
- [ ] All critical flows tested
- [ ] CI/CD running tests
- [ ] Tests passing

### Phase 4 Complete When:
- [ ] Technical docs complete
- [ ] Scripts working
- [ ] CI/CD fully set up
- [ ] Team onboarding smooth

---

## 🚀 Updated tsconfig.json

After creating folders, update path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/pages/*": ["./pages/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/contexts/*": ["./contexts/*"],
      "@/services/*": ["./services/*"],
      "@/constants/*": ["./constants/*"],
      "@/mocks/*": ["./mocks/*"],
      "@/validators/*": ["./validators/*"],
      "@/types/*": ["./types/*"],
      "@/backend/*": ["./backend/*"],
      "@/lib/*": ["./lib/*"],
      "@/utils/*": ["./utils/*"]
    }
  }
}
```

---

## 📊 Progress Tracking

| Phase | Folders | Status | Progress |
|-------|---------|--------|----------|
| Phase 1 | hooks, contexts, constants, mocks, public | 🟡 In Progress | 20% |
| Phase 2 | services, api, validators | ⚪ Not Started | 0% |
| Phase 3 | tests | ⚪ Not Started | 0% |
| Phase 4 | docs, scripts, config, .github | ⚪ Not Started | 0% |

**Overall**: 5% Complete

---

## ✅ Completion Checklist

- [ ] All 13 folders created
- [ ] All files migrated
- [ ] All imports updated
- [ ] All tests passing
- [ ] Documentation complete
- [ ] CI/CD set up
- [ ] Team onboarded
- [ ] Production ready

---

**Last Updated**: November 4, 2025  
**Next Review**: After Phase 1 completion
