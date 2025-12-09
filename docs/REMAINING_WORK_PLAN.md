# Remaining Work Plan

> **Date**: December 10, 2025  
> **Status**: Active  
> **Priority**: High → Medium → Low

---

## Executive Summary

This document outlines all remaining work for the BookingTMS application, prioritized by impact and urgency.

### Current Status After Edge Cache Implementation

| Component | Status | Notes |
|-----------|--------|-------|
| Edge Cache | ✅ Complete | Upstash removed, using HTTP Cache-Control |
| Database Schema | ✅ Complete | 50+ tables, 27 edge functions |
| React Query | ✅ Configured | 5-min stale time, optimized defaults |
| Stripe Connect | ✅ Database Ready | Functions deployed |
| Performance | ⚠️ Issues Found | 36 unindexed FKs, duplicate policies |
| Security | ⚠️ Issues Found | 30+ functions need search_path fix |

---

## Phase 1: Critical Performance Fixes (Priority: HIGH)

### 1.1 Add Missing Foreign Key Indexes
**Impact**: Significant query performance improvement  
**Effort**: 30 minutes  
**Risk**: Low

```sql
-- Migration: Add indexes for unindexed foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_referrals_affiliate_id 
  ON affiliate_referrals(affiliate_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_affiliate_referrals_booking_id 
  ON affiliate_referrals(booking_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_game_id 
  ON bookings(game_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_gift_card_id 
  ON bookings(gift_card_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_conversations_booking_id 
  ON ai_conversations(booking_id);
-- ... (36 total indexes needed)
```

### 1.2 Remove Duplicate Index
**Impact**: Reduced storage, faster writes  
**Effort**: 5 minutes

```sql
DROP INDEX IF EXISTS idx_reservations_session;
-- Keep idx_slot_reservations_session
```

### 1.3 Consolidate RLS Policies
**Impact**: Faster query execution  
**Effort**: 1-2 hours  
**Tables Affected**: activities, venues, bookings, users, customers

**Current Issue**: Multiple permissive policies per table causing performance overhead.

**Solution**: Merge policies into single comprehensive policies per role/action.

---

## Phase 2: Security Hardening (Priority: HIGH)

### 2.1 Fix Function Search Paths
**Impact**: Prevent search_path injection attacks  
**Effort**: 1 hour  
**Functions**: 30+ functions need `SET search_path = public`

```sql
-- Example fix for each function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

### 2.2 Enable Leaked Password Protection
**Impact**: Enhanced auth security  
**Effort**: 5 minutes

```bash
# In Supabase Dashboard → Auth → Settings
# Enable "Leaked Password Protection"
```

### 2.3 Add RLS Policy to kv_store
**Impact**: Secure key-value storage  
**Effort**: 10 minutes

```sql
CREATE POLICY "Service role only" ON public.kv_store_8c19f58b
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Phase 3: Frontend Integration (Priority: MEDIUM)

### 3.1 Stripe Onboarding UI
**Status**: Not started  
**Effort**: 45 minutes

Components needed:
- [ ] Connect Stripe button
- [ ] Onboarding status display
- [ ] Account details view
- [ ] Requirements tracking

### 3.2 Usage Dashboard
**Status**: Not started  
**Effort**: 45 minutes

Components needed:
- [ ] Current usage vs limits
- [ ] Utilization percentages
- [ ] Exceeded limits warnings
- [ ] Usage history chart

### 3.3 Subscription Management
**Status**: Not started  
**Effort**: 45 minutes

Components needed:
- [ ] Current plan display
- [ ] Upgrade/downgrade buttons
- [ ] Plan comparison
- [ ] Billing history

### 3.4 Payment Checkout UI
**Status**: Partially complete  
**Effort**: 30 minutes

Components needed:
- [ ] Booking payment flow polish
- [ ] Success/cancel handling
- [ ] Receipt display

---

## Phase 4: Edge Function Improvements (Priority: MEDIUM)

### 4.1 Fix cleanup-reservations Syntax Error
**Impact**: Scheduled cleanup not working  
**Effort**: 15 minutes

```typescript
// Fix syntax error at line 9
// Current: $$SELECT cleanup_expired_reservations()$$
// Issue: Cron syntax error
```

### 4.2 Deploy All Updated Functions
**Status**: Partially deployed  
**Effort**: 20 minutes

Functions needing deployment:
- [ ] cleanup-reservations (fix syntax first)
- [ ] widget-api (update with new cache headers)
- [ ] All functions using _shared/cache.ts

---

## Phase 5: Testing & QA (Priority: HIGH)

### 5.1 Multi-Tenant Isolation Tests
**Effort**: 30 minutes

- [ ] Create 2 test organizations
- [ ] Verify data isolation
- [ ] Test RLS policies
- [ ] Confirm no data leaks

### 5.2 Payment Flow E2E Tests
**Effort**: 45 minutes

- [ ] Create booking with payment
- [ ] Verify Stripe checkout
- [ ] Test webhook handling
- [ ] Verify application fees

### 5.3 Widget/Embed Tests
**Effort**: 30 minutes

- [ ] Test widget loading speed (should be faster with edge cache)
- [ ] Verify Cache-Control headers
- [ ] Test booking flow from widget
- [ ] Check CORS handling

### 5.4 Performance Benchmarks
**Effort**: 30 minutes

Before/After metrics:
- [ ] Widget load time
- [ ] Dashboard load time
- [ ] Booking creation time
- [ ] Session availability check

---

## Phase 6: Documentation (Priority: LOW)

### 6.1 API Documentation
**Effort**: 1 hour

- [ ] Edge function endpoints
- [ ] Request/response formats
- [ ] Error codes
- [ ] Rate limits

### 6.2 Deployment Guide
**Effort**: 30 minutes

- [ ] Environment variables
- [ ] Supabase secrets
- [ ] Edge function deployment
- [ ] Rollback procedures

### 6.3 User Guides
**Effort**: 1 hour

- [ ] Organization onboarding
- [ ] Stripe Connect setup
- [ ] Widget embedding
- [ ] Booking management

---

## Recommended Execution Order

### Week 1: Critical Fixes
| Day | Task | Time |
|-----|------|------|
| 1 | Add FK indexes (migration) | 30 min |
| 1 | Fix function search_paths | 1 hour |
| 1 | Enable password protection | 5 min |
| 2 | Fix cleanup-reservations | 15 min |
| 2 | Deploy all edge functions | 20 min |
| 2 | Run performance benchmarks | 30 min |

### Week 2: Frontend & Testing
| Day | Task | Time |
|-----|------|------|
| 1 | Stripe Onboarding UI | 45 min |
| 1 | Usage Dashboard | 45 min |
| 2 | Subscription Management | 45 min |
| 2 | Payment Checkout polish | 30 min |
| 3 | E2E Testing | 2 hours |
| 3 | Bug fixes from testing | 1 hour |

### Week 3: Polish & Launch
| Day | Task | Time |
|-----|------|------|
| 1 | Consolidate RLS policies | 2 hours |
| 2 | Documentation | 2.5 hours |
| 3 | Production deployment | 1 hour |
| 3 | Final testing | 1 hour |

---

## Quick Wins (Do First)

1. **Enable leaked password protection** (5 min) - Security improvement
2. **Remove duplicate index** (5 min) - Performance improvement
3. **Add kv_store RLS policy** (10 min) - Security fix
4. **Deploy cached-widget-api** (already done ✅)

---

## Estimated Total Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| Performance Fixes | 2-3 hours | HIGH |
| Security Hardening | 1.5 hours | HIGH |
| Frontend Integration | 3 hours | MEDIUM |
| Edge Function Fixes | 35 min | MEDIUM |
| Testing & QA | 2 hours | HIGH |
| Documentation | 2.5 hours | LOW |

**Total**: ~12-14 hours of focused work

---

## Success Metrics

- [ ] All FK indexes added (query performance)
- [ ] All functions have fixed search_path (security)
- [ ] Password protection enabled (security)
- [ ] Widget load time < 500ms (performance)
- [ ] All E2E tests passing (quality)
- [ ] Documentation complete (maintainability)
- [ ] Production deployment successful (delivery)

---

## Notes

- Edge cache implementation complete as of December 10, 2025
- Upstash Redis successfully removed
- Health check confirms: "Redis removed - using HTTP edge caching"
- Backup available: `pre-edge-cache-v2.0.0-2025-12-10`
