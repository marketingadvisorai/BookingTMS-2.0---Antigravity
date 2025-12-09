# Edge Caching Architecture

## Overview

This document outlines the edge caching strategy for BookingTMS to improve loading performance and eliminate the "blank screen until reload" issue.

**Version**: 1.0.0  
**Date**: December 10, 2025  
**Status**: Implementation In Progress

---

## Problem Statement

### Current Issues

1. **Blank Screen Until Reload**: Platform occasionally shows no UI/modules until browser refresh
2. **Race Conditions**: Multiple states (`isLoading`, `checkingSupabaseSession`, `hasSupabaseSession`) get out of sync
3. **Double Session Check**: Both `App.tsx` and `AuthProvider` independently check Supabase session
4. **No QueryClient Configuration**: Default React Query settings cause unnecessary refetches
5. **No Edge Caching**: Supabase Pro plan edge caching unused

### Root Causes

```
AppContent                      AuthProvider
    │                               │
    ├─ checkingSupabaseSession     ├─ isLoading
    ├─ hasSupabaseSession          ├─ loadUserProfile
    ├─ profileError                │
    │                               │
    └─────── RACE CONDITION ────────┘
```

---

## Solution Architecture

### 1. Unified Auth State Machine

Replace multiple boolean flags with a single state machine:

```typescript
type AuthState = 
  | { status: 'initializing' }
  | { status: 'checking_session' }
  | { status: 'loading_profile'; userId: string }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }
  | { status: 'error'; error: string };
```

### 2. React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes (garbage collection)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});
```

### 3. Supabase Edge Caching

Supabase Pro includes edge caching (250 GB included). We'll leverage:

1. **API Responses**: Cache GET requests for static-ish data
2. **Edge Functions**: Add cache headers for appropriate responses
3. **Storage**: Images and media with long TTL

---

## Cache Tiers

### Tier 1: Session/Auth (No Cache)
- Auth tokens
- Session data
- Real-time subscriptions

### Tier 2: Short Cache (1-5 min)
- User profile
- Organization settings
- Venue configurations

### Tier 3: Medium Cache (15-60 min)
- Activity list
- Pricing data
- Plan configurations

### Tier 4: Long Cache (24h+)
- Static content
- Timezone data
- Plan definitions

---

## Implementation Files

### Core Files
| File | Purpose |
|------|---------|
| `/src/lib/cache/queryConfig.ts` | React Query configuration |
| `/src/lib/auth/AuthStateMachine.ts` | Unified auth state |
| `/src/lib/cache/cacheKeys.ts` | Centralized cache key management |
| `/src/lib/supabase/edgeCacheHeaders.ts` | Edge function helpers |

### Modified Files
| File | Changes |
|------|---------|
| `/src/main.tsx` | Use configured QueryClient |
| `/src/App.tsx` | Remove duplicate session checks |
| `/src/lib/auth/AuthContext.tsx` | Use state machine |
| `/supabase/functions/*/index.ts` | Add cache headers |

---

## Edge Function Caching

### Headers to Add

```typescript
// For cacheable responses (venues, activities, plans)
const cacheHeaders = {
  'Cache-Control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=60',
  'CDN-Cache-Control': 'max-age=600',
  'Surrogate-Control': 'max-age=3600',
};

// For user-specific data (no cache)
const noCacheHeaders = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate',
};
```

### Functions to Update

| Function | Cache Strategy |
|----------|----------------|
| `stripe-manage-product` | No cache (mutations) |
| `create-checkout-session` | No cache (transactions) |
| `verify-checkout-session` | Short cache (5 min) |
| `ai-agent-chat` | No cache (real-time) |
| `stripe-billing` | Short cache for reads |

---

## Local Storage Caching

### Cache Keys

```typescript
const CACHE_KEYS = {
  USER_PROFILE: 'bktms:user_profile',
  ORG_SETTINGS: 'bktms:org_settings',
  VENUES: 'bktms:venues',
  ACTIVITIES: 'bktms:activities',
  PLANS: 'bktms:plans',
  LAST_SYNC: 'bktms:last_sync',
};
```

### Cache Invalidation

- On logout: Clear all
- On mutation: Clear affected keys + refetch
- On version mismatch: Clear all

---

## Performance Targets

| Metric | Before | Target |
|--------|--------|--------|
| Initial Load | 3-5s | <1.5s |
| Profile Load | 500ms-2s | <300ms |
| Page Navigation | 200-500ms | <100ms |
| Cache Hit Rate | 0% | >80% |

---

## Migration Plan

### Phase 1: QueryClient Configuration (Immediate)
- Configure staleTime, gcTime
- Disable refetchOnWindowFocus
- Add retry limits

### Phase 2: Auth State Machine (Day 1)
- Replace boolean flags with state machine
- Remove duplicate session checks
- Add loading state management

### Phase 3: Edge Caching (Day 2)
- Add cache headers to Edge Functions
- Configure CDN caching
- Implement cache busting

### Phase 4: Local Caching (Day 3)
- Add localStorage caching for static data
- Implement background refresh
- Add cache versioning

---

## Monitoring

### Metrics to Track

1. **Cache Hit Rate**: Edge Function responses served from cache
2. **Load Time**: Time from navigation to content visible
3. **Error Rate**: Auth failures, loading timeouts
4. **Refresh Rate**: How often users need to reload

### Logging

```typescript
console.log('[Cache]', {
  key: 'USER_PROFILE',
  hit: true,
  age: '45s',
  source: 'localStorage',
});
```

---

## Rollback Plan

If issues arise:

1. Disable QueryClient configuration by reverting to defaults
2. Remove Edge Function cache headers
3. Clear all localStorage caches
4. Revert AuthContext changes

---

## References

- [Supabase Edge Caching Docs](https://supabase.com/docs/guides/platform/performance#edge-caching)
- [React Query Caching](https://tanstack.com/query/latest/docs/react/guides/caching)
- [Cache-Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
