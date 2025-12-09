# Edge Cache Implementation Plan

> **Version**: 2.0.0  
> **Date**: December 10, 2025  
> **Status**: ✅ IMPLEMENTED  
> **Risk Level**: Low (simplified architecture)

---

## Executive Summary

This document outlines a **simplified edge caching implementation** using Supabase's built-in CDN caching (via Cache-Control headers) and React Query. 

### Key Decision: Remove Upstash Redis

**Upstash Redis is being REMOVED** because:
1. Supabase Edge Cache-Control headers provide the same caching benefit
2. Removes external dependency and associated costs
3. Simpler architecture = fewer failure points
4. CDN caching is actually faster (no Redis network hop)

### Implementation Goals:
1. **No UI/UX changes** - Only performance optimization
2. **No functionality changes** - Same behavior, faster responses
3. **Full rollback capability** - GitHub-based recovery
4. **Simplified architecture** - Remove Upstash dependency

---

## Current State Assessment

### Existing Caching Infrastructure (BEFORE)

| Component | Location | Status | Action |
|-----------|----------|--------|--------|
| Redis Cache (Upstash) | `/supabase/functions/_shared/cache.ts` | ✅ Implemented | ❌ REMOVE |
| Memory Cache | `/src/lib/cache/redis.ts` | ✅ Implemented | ❌ REMOVE |
| Widget API Cache | `/supabase/functions/widget-api/` | ✅ Has Cache-Control | ✅ KEEP |
| Cached Widget API | `/supabase/functions/cached-widget-api/` | ✅ Full Redis | ❌ REMOVE |
| React Query | `/src/main.tsx` | ⚠️ No global config | ✅ ENHANCE |

### Current Cache Headers in Use

```typescript
// widget-api/index.ts - Already has proper Cache-Control!
'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`
```

---

## Why Remove Upstash?

### Comparison: Upstash vs Edge Cache-Control

| Feature | Edge Cache (Keep) | Upstash Redis (Remove) |
|---------|-------------------|------------------------|
| Response caching | ✅ Automatic via headers | ✅ Manual get/set |
| Global CDN | ✅ Built-in Supabase | ✅ Global replication |
| Cost | **Free** (included) | $0-3/month |
| Setup | **Zero config** | Requires secrets |
| Network hops | 1 (direct to DB) | 2 (to Redis, then DB) |
| Complexity | Low | High |
| Rate limiting | ⚠️ Use Supabase limits | ✅ Custom |
| Cache invalidation | TTL-based | Manual delete |

### Request Flow Comparison

```
BEFORE (With Upstash):
Request → CDN → Edge Function → Redis Check → (miss) → DB → Redis Store → Response
                                    ↓
                              (hit) Response

AFTER (Edge Cache Only):
Request → CDN Check → (miss) → Edge Function → DB → Response + Cache-Control
              ↓
        (hit) Cached Response (no function invocation!)
```

**Key Insight**: Edge Cache-Control caching happens at the CDN level, meaning cached requests **never even hit the Edge Function**. This is faster than Upstash.

---

## Architecture Design (SIMPLIFIED)

### Cache Layers (NEW)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: React Query Cache                                  │
│  - staleTime: 5 minutes                                      │
│  - gcTime: 30 minutes                                        │
│  - Invalidation on mutations                                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: HTTP/Browser Cache                                 │
│  - Respects Cache-Control headers                            │
│  - max-age from server response                              │
├─────────────────────────────────────────────────────────────┤
│                     Supabase CDN Edge                        │
│  - Caches responses with Cache-Control headers               │
│  - s-maxage for CDN-specific caching                         │
│  - stale-while-revalidate for background refresh             │
├─────────────────────────────────────────────────────────────┤
│                  Supabase Edge Functions                     │
│  - Returns responses with Cache-Control headers              │
│  - No external dependencies                                  │
├─────────────────────────────────────────────────────────────┤
│                     Supabase Database                        │
└─────────────────────────────────────────────────────────────┘
```

**Note**: Layer 4 (Upstash Redis) has been REMOVED.

### TTL Strategy

| Cache Level | TTL | Purpose |
|-------------|-----|---------|
| NONE | 0s | Mutations, payments, real-time data |
| SHORT | 60s | Availability, sessions, dynamic content |
| MEDIUM | 300s (5m) | Activity data, venue info, configs |
| LONG | 900s (15m) | Static configs, rarely changing data |
| DAY | 86400s | Version info, static assets |

---

## Edge Function Classification

### ❌ NEVER CACHE (Critical - No exceptions)

| Function | Reason |
|----------|--------|
| `create-checkout-session` | Payment initiation |
| `create-booking` | Data mutation |
| `create-booking-checkout` | Payment flow |
| `verify-checkout-session` | Session verification |
| `stripe-webhook` | Real-time webhooks |
| `stripe-webhook-checkout` | Payment webhooks |
| `create-org-admin` | User creation |
| `create-staff-member` | User creation |
| `admin-password-reset` | Security |
| `system-secrets` | Sensitive data |
| `create-payment-intent` | Payment |
| `create-payment-link` | Payment |
| `create-refund` | Payment mutation |
| `create-stripe-customer` | Stripe mutation |
| `cleanup-reservations` | Cron job |
| `process-webhook-retries` | Background job |
| `qr-checkin` | Real-time action |

### ✅ SAFE TO CACHE (Read-Only)

| Function | Recommended TTL | Headers |
|----------|-----------------|---------|
| `widget-api` | 300s (5m) | MEDIUM |
| `cached-widget-api` | 300s (5m) | MEDIUM |
| `health` | 60s (1m) | SHORT |
| `system-health-check` | 60s (1m) | SHORT |

### ⚠️ CONDITIONAL CACHE (GET Only)

| Function | Condition | TTL |
|----------|-----------|-----|
| `stripe-connect-account-status` | GET requests only | 60s |
| `stripe-payments-data` | GET requests only | 60s |
| `stripe-manage-product` | GET action only | 300s |
| `ai-agent-chat` | GET history only | 60s |
| `stripe-billing` | GET billing_data only | 60s |

---

## Implementation Phases

### Phase 0: Pre-Implementation Checkpoint

**Duration**: 30 minutes  
**Risk**: None

#### Tasks:

1. **Create GitHub Tag**
   ```bash
   git tag -a pre-edge-cache-v2.0.0-2025-12-10 -m "Pre-edge cache - before Upstash removal"
   git push origin pre-edge-cache-v2.0.0-2025-12-10
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/edge-cache-v2-remove-upstash
   git push -u origin feature/edge-cache-v2-remove-upstash
   ```

3. **Document Current State**
   - Screenshot current widget load times
   - Note current Upstash usage (check Upstash dashboard)
   - Record baseline metrics

---

### Phase 1: Create Edge Cache Headers Module

**Duration**: 30 minutes  
**Risk**: Low  
**Rollback**: Delete file, no impact

#### Files to Create:

**`/supabase/functions/_shared/edgeCacheHeaders.ts`** (NEW - replaces cache.ts)

```typescript
/**
 * Edge Cache Headers Utility
 * 
 * Provides standardized cache headers for Edge Functions.
 * Supports bypass via client Cache-Control: no-cache header.
 * 
 * @module supabase/functions/_shared/edgeCacheHeaders
 * @version 1.0.0
 */

export const CACHE_TTL = {
  NONE: 0,
  SHORT: 60,      // 1 minute - availability, dynamic
  MEDIUM: 300,    // 5 minutes - activity/venue data
  LONG: 900,      // 15 minutes - static configs
  DAY: 86400,     // 24 hours - rarely changing
} as const;

export type CacheTTL = typeof CACHE_TTL[keyof typeof CACHE_TTL];

export interface CacheOptions {
  /** Make cache private (user-specific data) */
  private?: boolean;
  /** stale-while-revalidate duration (default: min(ttl, 60)) */
  staleWhileRevalidate?: number;
  /** Additional Vary headers */
  vary?: string[];
}

/**
 * Get standardized cache headers for a given TTL
 */
export function getCacheHeaders(
  ttlSeconds: CacheTTL,
  options: CacheOptions = {}
): Record<string, string> {
  // No caching
  if (ttlSeconds === 0) {
    return getNoCacheHeaders();
  }

  const swr = options.staleWhileRevalidate ?? Math.min(ttlSeconds, 60);
  const scope = options.private ? 'private' : 'public';
  const vary = ['Accept-Encoding', ...(options.vary || [])].join(', ');

  return {
    'Cache-Control': `${scope}, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${swr}`,
    'CDN-Cache-Control': `max-age=${ttlSeconds}`,
    'Vary': vary,
  };
}

/**
 * Get no-cache headers for mutations/sensitive data
 */
export function getNoCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Check if client requested cache bypass
 */
export function shouldBypassCache(request: Request): boolean {
  const cacheControl = request.headers.get('Cache-Control') || '';
  const pragma = request.headers.get('Pragma') || '';
  
  return (
    cacheControl.includes('no-cache') ||
    cacheControl.includes('no-store') ||
    pragma.includes('no-cache')
  );
}

/**
 * Predefined cache presets for common use cases
 */
export const CACHE_PRESETS = {
  /** No caching - for mutations, payments, sensitive data */
  NONE: getNoCacheHeaders(),
  /** 1 minute - for availability, sessions */
  SHORT: getCacheHeaders(CACHE_TTL.SHORT),
  /** 5 minutes - for activity/venue data */
  MEDIUM: getCacheHeaders(CACHE_TTL.MEDIUM),
  /** 15 minutes - for static configs */
  LONG: getCacheHeaders(CACHE_TTL.LONG),
  /** Private short cache - for user-specific dynamic data */
  PRIVATE_SHORT: getCacheHeaders(CACHE_TTL.SHORT, { private: true }),
} as const;
```

#### Verification:
- [ ] File compiles with Deno
- [ ] No syntax errors
- [ ] Exports work correctly

---

### Phase 2: React Query Configuration

**Duration**: 2 hours  
**Risk**: Medium  
**Rollback**: Revert `main.tsx` and delete config file

#### Files to Create/Modify:

**`/src/lib/cache/queryConfig.ts`** (NEW)

```typescript
/**
 * React Query Configuration
 * 
 * Centralized configuration for React Query with:
 * - Optimized stale/cache times
 * - Query key factories for consistent invalidation
 * - Performance-focused defaults
 * 
 * @module lib/cache/queryConfig
 * @version 1.0.0
 */

import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// CONFIGURATION
// ============================================================================

export const QUERY_CACHE = {
  /** Data considered fresh for 5 minutes */
  STALE_TIME: 5 * 60 * 1000,
  /** Garbage collection after 30 minutes */
  GC_TIME: 30 * 60 * 1000,
  /** Retry failed requests once */
  RETRY_COUNT: 1,
} as const;

// ============================================================================
// QUERY CLIENT
// ============================================================================

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CACHE.STALE_TIME,
        gcTime: QUERY_CACHE.GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: QUERY_CACHE.RETRY_COUNT,
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 0,
        networkMode: 'online',
      },
    },
  });
}

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Standardized query keys for consistent cache invalidation
 */
export const queryKeys = {
  // Activities
  activities: {
    all: ['activities'] as const,
    byOrg: (orgId: string) => ['activities', 'org', orgId] as const,
    byId: (id: string) => ['activities', 'detail', id] as const,
  },
  
  // Venues
  venues: {
    all: ['venues'] as const,
    byOrg: (orgId: string) => ['venues', 'org', orgId] as const,
    byId: (id: string) => ['venues', 'detail', id] as const,
    bySlug: (slug: string) => ['venues', 'slug', slug] as const,
  },
  
  // Bookings
  bookings: {
    all: ['bookings'] as const,
    byOrg: (orgId: string) => ['bookings', 'org', orgId] as const,
    byId: (id: string) => ['bookings', 'detail', id] as const,
  },
  
  // Customers
  customers: {
    all: ['customers'] as const,
    byOrg: (orgId: string) => ['customers', 'org', orgId] as const,
  },
  
  // Organizations
  organizations: {
    all: ['organizations'] as const,
    byId: (id: string) => ['organizations', 'detail', id] as const,
  },
  
  // Widget data (public, cacheable)
  widgets: {
    byEmbedKey: (key: string) => ['widgets', 'embed', key] as const,
    byActivityId: (id: string) => ['widgets', 'activity', id] as const,
  },
} as const;

// ============================================================================
// INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate all queries matching a key prefix
 */
export function invalidateQueries(
  queryClient: QueryClient,
  keys: readonly string[]
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: keys });
}

/**
 * Invalidate after a mutation (common patterns)
 */
export const invalidationPatterns = {
  afterBookingCreate: (queryClient: QueryClient, orgId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byOrg(orgId) });
  },
  
  afterActivityUpdate: (queryClient: QueryClient, orgId: string, activityId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.byOrg(orgId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.byId(activityId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.widgets.byActivityId(activityId) });
  },
};
```

**`/src/lib/cache/index.ts`** (UPDATE)

```typescript
/**
 * Cache Module Exports
 */

export * from './redis';
export * from './queryConfig';
```

**`/src/main.tsx`** (MODIFY)

```typescript
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./lib/cache/queryConfig";
import { router } from "./router";
import "./index.css";

// Create query client with optimized defaults
const queryClient = createQueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
```

#### Verification:
- [ ] App loads without errors
- [ ] Data fetching works correctly
- [ ] No console errors
- [ ] Mutations still work

---

### Phase 3: Remove Upstash from Edge Functions

**Duration**: 1 hour  
**Risk**: Medium  
**Rollback**: Revert using git tag

#### Files to DELETE:

**`/supabase/functions/cached-widget-api/`** (entire directory)
- This function is redundant since `widget-api` already has Cache-Control headers
- Check if any client code calls this endpoint before deleting

#### Files to MODIFY:

**`/supabase/functions/_shared/cache.ts`** → REPLACE entire content with:

```typescript
/**
 * Cache Utilities for Edge Functions
 * 
 * NOTE: Upstash Redis has been REMOVED.
 * Using HTTP Cache-Control headers for CDN caching instead.
 * 
 * For rate limiting: Rely on Supabase platform limits.
 * 
 * @module supabase/functions/_shared/cache
 * @version 2.0.0 - No Redis
 * @deprecated Use edgeCacheHeaders.ts instead
 */

// Re-export edge cache headers for backward compatibility
export * from './edgeCacheHeaders.ts';

// Legacy TTL constants (for reference only)
export const LEGACY_TTL = {
  SHORT: 30,
  MEDIUM: 300,
  LONG: 900,
  HOUR: 3600,
  DAY: 86400,
};

// Legacy cache key builders (no-op, for reference)
export const CacheKeys = {
  widgetConfig: (embedKey: string) => `widget:${embedKey}`,
  activityWidget: (activityId: string) => `activity:widget:${activityId}`,
  sessionAvailability: (sessionId: string) => `session:avail:${sessionId}`,
  activitySessions: (activityId: string, date: string) => 
    `activity:sessions:${activityId}:${date}`,
};

// No-op functions for backward compatibility
export async function cacheGet<T>(_key: string): Promise<T | null> {
  console.warn('cacheGet: Redis removed, using HTTP cache instead');
  return null;
}

export async function cacheSet<T>(_key: string, _value: T, _ttl?: number): Promise<boolean> {
  console.warn('cacheSet: Redis removed, using HTTP cache instead');
  return false;
}

export async function cacheDelete(_key: string): Promise<boolean> {
  console.warn('cacheDelete: Redis removed, using HTTP cache instead');
  return false;
}

export async function rateLimit(_key: string, _limit?: number, _window?: number) {
  // No rate limiting without Redis - rely on Supabase platform limits
  return { allowed: true, remaining: 100, reset: 0 };
}
```

**`/supabase/functions/health/index.ts`**

Remove or stub out the Redis health check:

```typescript
// Replace checkRedis() function with:
async function checkRedis(): Promise<ComponentHealth> {
  return {
    name: 'redis',
    status: 'degraded',
    latency_ms: 0,
    message: 'Redis removed - using HTTP edge caching',
  };
}
```

#### Verification:
- [ ] `widget-api` still works
- [ ] `health` endpoint responds (shows Redis as removed)
- [ ] No errors in Supabase logs

---

### Phase 4: Remove Client-Side Upstash Code

**Duration**: 30 minutes  
**Risk**: Low

#### Files to MODIFY:

**`/src/lib/cache/redis.ts`** → REPLACE with minimal version:

```typescript
/**
 * Cache Utilities (Client-Side)
 * 
 * NOTE: Redis/Upstash has been REMOVED.
 * Using React Query for client-side caching instead.
 * 
 * @module lib/cache/redis
 * @version 2.0.0 - No Redis
 */

// TTL constants kept for reference
export const CACHE_TTL = {
  SHORT: 30,
  MEDIUM: 300,
  LONG: 900,
  EXTENDED: 3600,
  DAY: 86400,
} as const;

// Cache key prefixes (for reference)
export const CACHE_KEYS = {
  SESSION_AVAILABILITY: 'session:avail',
  SESSION_CAPACITY: 'session:cap',
  ACTIVITY: 'activity',
  ACTIVITY_SESSIONS: 'activity:sessions',
  VENUE: 'venue',
  VENUE_ACTIVITIES: 'venue:activities',
  WIDGET_CONFIG: 'widget:config',
  EMBED_CONFIG: 'embed:config',
} as const;

/**
 * Simple in-memory cache (still useful for client-side)
 */
class MemoryCache {
  private cache: Map<string, { value: unknown; expires: number }> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
```

**`/src/lib/cache/index.ts`** → UPDATE to remove redis export:

```typescript
/**
 * Cache Module Exports
 */

// React Query config (primary caching)
export * from './queryConfig';

// Legacy memory cache (for backward compatibility)
export { memoryCache, CACHE_TTL, CACHE_KEYS } from './redis';
```

#### Verification:
- [ ] App compiles without errors
- [ ] No runtime errors in console
- [ ] Widgets still load data

---

### Phase 5: Remove Upstash Secrets

**Duration**: 15 minutes  
**Risk**: Low

#### Commands to Run:

```bash
# Remove Upstash secrets from Supabase
supabase secrets unset UPSTASH_REDIS_REST_URL --project-ref qftjyjpitnoapqxlrvfs
supabase secrets unset UPSTASH_REDIS_REST_TOKEN --project-ref qftjyjpitnoapqxlrvfs
```

#### Verification:
- [ ] Run `supabase secrets list` to confirm removal
- [ ] Edge functions still work (they handle missing secrets gracefully)

---

### Phase 6: Widget Endpoints Enhancement

**Duration**: 30 minutes  
**Risk**: Low  
**Rollback**: Revert edge function changes

#### Files to Modify:

**`/supabase/functions/widget-api/index.ts`**

Import the new headers module:
```typescript
import { getCacheHeaders, shouldBypassCache, CACHE_TTL } from '../_shared/edgeCacheHeaders.ts';
```

Replace hardcoded headers with standardized ones. Widget-api already has caching, just needs cleanup.

#### Verification:
- [ ] Widgets load correctly
- [ ] Cache headers present in response
- [ ] Bypass works with `Cache-Control: no-cache`

---

### Phase 7: Deploy & Monitor

**Duration**: 2 hours  
**Risk**: Medium

1. **Deploy Edge Functions**
   ```bash
   supabase functions deploy --project-ref qftjyjpitnoapqxlrvfs
   ```

2. **Test All Critical Flows**
   - [ ] Widget booking flow
   - [ ] Payment checkout
   - [ ] Admin dashboard
   - [ ] Login/logout

3. **Monitor for 24 hours**
   - Check Supabase logs for errors
   - Verify widget performance

4. **Create Success Tag**
   ```bash
   git tag -a edge-cache-v2.0.0-2025-12-10 -m "Edge cache without Upstash"
   git push origin edge-cache-v2.0.0-2025-12-10
   ```

5. **Merge to main if successful**

---

## Rollback Procedures

### Emergency Rollback (< 5 minutes)

```bash
# 1. Revert to pre-cache tag (restores Upstash code)
git checkout pre-edge-cache-v2.0.0-2025-12-10

# 2. Force push to main (if needed)
git push --force origin main

# 3. Re-add Upstash secrets (if needed)
supabase secrets set UPSTASH_REDIS_REST_URL=<your-url> --project-ref qftjyjpitnoapqxlrvfs
supabase secrets set UPSTASH_REDIS_REST_TOKEN=<your-token> --project-ref qftjyjpitnoapqxlrvfs

# 4. Redeploy edge functions
supabase functions deploy --project-ref qftjyjpitnoapqxlrvfs
```

### Partial Rollback (Edge Functions Only)

```bash
# Revert specific edge function
git checkout pre-edge-cache-v2.0.0-2025-12-10 -- supabase/functions/

# Redeploy
supabase functions deploy --project-ref qftjyjpitnoapqxlrvfs
```

### React Query Rollback

```bash
# Revert main.tsx to simple config
git checkout pre-edge-cache-v2.0.0-2025-12-10 -- src/main.tsx
git checkout pre-edge-cache-v2.0.0-2025-12-10 -- src/lib/cache/

# Rebuild and deploy
npm run build
```

### Restore Upstash Only (If Needed Later)

```bash
# Get Upstash secrets from Upstash dashboard
# Re-add to Supabase
supabase secrets set UPSTASH_REDIS_REST_URL=<url> --project-ref qftjyjpitnoapqxlrvfs
supabase secrets set UPSTASH_REDIS_REST_TOKEN=<token> --project-ref qftjyjpitnoapqxlrvfs

# Redeploy functions
supabase functions deploy --project-ref qftjyjpitnoapqxlrvfs
```

---

## Monitoring & Validation

### Metrics to Track

| Metric | Tool | Threshold |
|--------|------|-----------|
| Widget load time | Browser DevTools | < 500ms |
| Edge function latency | Supabase Dashboard | < 200ms |
| Cache hit rate | Response headers | > 70% |
| Error rate | Error monitoring | < 0.1% |

### Health Checks

```bash
# Check widget API response headers
curl -I "https://qftjyjpitnoapqxlrvfs.supabase.co/functions/v1/widget-api?activityId=xxx"

# Verify Cache-Control header present
# Expected: Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=60
```

---

## Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stale booking data | Low | High | Never cache booking mutations |
| Payment errors | Very Low | Critical | Never cache payment functions |
| Widget shows old data | Medium | Low | 5-min TTL acceptable |
| Admin dashboard lag | Low | Low | Acceptable trade-off |
| Auth issues | Very Low | High | Never cache auth responses |

---

## Checklist Before Implementation

- [ ] Created GitHub tag: `pre-edge-cache-v2.0.0-YYYY-MM-DD`
- [ ] Created feature branch: `feature/edge-cache-v2-remove-upstash`
- [ ] Verified current app works correctly
- [ ] Noted current Upstash credentials (for rollback)
- [ ] Tested rollback procedure
- [ ] Reviewed all edge functions for cache eligibility
- [ ] Confirmed no payment functions will be cached
- [ ] Team notified of changes

---

## Post-Implementation Checklist

- [ ] All widgets load faster (or same speed)
- [ ] Booking flow works correctly
- [ ] Payments process correctly
- [ ] Admin dashboard updates
- [ ] No console errors
- [ ] Cache headers visible in DevTools
- [ ] Upstash secrets removed from Supabase
- [ ] `cached-widget-api` function removed
- [ ] Created GitHub tag: `edge-cache-v2.0.0-YYYY-MM-DD`
- [ ] Updated documentation
- [ ] Merged to main
- [ ] (Optional) Cancel Upstash account if no longer needed

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `/supabase/functions/_shared/edgeCacheHeaders.ts` | Edge cache headers utility |
| `/src/lib/cache/queryConfig.ts` | React Query configuration |
| `/docs/EDGE_CACHE_IMPLEMENTATION_PLAN.md` | This document |

### Modified Files
| File | Changes |
|------|---------|
| `/src/main.tsx` | Use createQueryClient() |
| `/src/lib/cache/index.ts` | Updated exports |
| `/src/lib/cache/redis.ts` | Simplified, no Redis |
| `/supabase/functions/_shared/cache.ts` | No-op stubs, deprecated |
| `/supabase/functions/widget-api/index.ts` | Standardized headers |
| `/supabase/functions/health/index.ts` | Redis check stubbed |

### Deleted Files
| File | Reason |
|------|--------|
| `/supabase/functions/cached-widget-api/` | Redundant (widget-api has caching) |

### Removed Secrets
| Secret | Reason |
|--------|--------|
| `UPSTASH_REDIS_REST_URL` | No longer using Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | No longer using Upstash |

---

## Cost Savings

| Item | Before | After |
|------|--------|-------|
| Upstash Redis | $0-3/month | $0 |
| External dependencies | 1 (Upstash) | 0 |
| Network hops per request | 2 | 1 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Dec 10, 2025 | AI | Initial plan with Upstash |
| 2.0.0 | Dec 10, 2025 | AI | Simplified: Remove Upstash, use Edge Cache only |
