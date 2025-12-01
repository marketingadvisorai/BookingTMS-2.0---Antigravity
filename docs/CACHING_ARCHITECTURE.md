# Caching Architecture for BookingTMS

## Overview

BookingTMS uses a multi-layer caching strategy optimized for Supabase:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ React Query │  │ SWR Cache   │  │ Memory Cache (runtime)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EDGE (Supabase Functions)                      │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │ Upstash Redis       │  │ Rate Limiting (sliding window)  │   │
│  │ (Global, Serverless)│  │                                 │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (Supabase Postgres)                   │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │ Connection Pooling  │  │ Query Plan Caching              │   │
│  │ (Supavisor)         │  │ (pg_stat_statements)            │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Client-Side Caching

### Memory Cache (`src/lib/cache/redis.ts`)

In-browser cache for immediate responses:

```typescript
import { withCache, CACHE_TTL, CACHE_KEYS, buildCacheKey } from '@/lib/cache/redis'

// Cache activity data for 5 minutes
const activity = await withCache(
  buildCacheKey(CACHE_KEYS.ACTIVITY, activityId),
  () => fetchActivity(activityId),
  { ttl: CACHE_TTL.MEDIUM }
)
```

### TTL Guidelines

| Data Type | TTL | Use Case |
|-----------|-----|----------|
| `SHORT` (30s) | Session availability | Real-time capacity |
| `MEDIUM` (5min) | Activity/venue data | Semi-static content |
| `LONG` (15min) | Widget configs | Static configurations |
| `EXTENDED` (1hr) | Pricing data | Rarely changes |
| `DAY` (24hr) | Static assets | Never changes |

---

## Layer 2: Edge Caching (Upstash Redis)

### Setup Instructions

1. **Create Upstash Account**
   - Go to https://console.upstash.com
   - Create a Redis database
   - Select **Global** type (minimizes latency from all edge locations)

2. **Configure Environment Variables**
   ```bash
   # In Supabase Dashboard > Settings > Edge Functions > Secrets
   UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Or via CLI**
   ```bash
   supabase secrets set UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
   supabase secrets set UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxx
   ```

### Cached Widget API

```
GET /functions/v1/cached-widget-api?key={embedKey}&action=config
GET /functions/v1/cached-widget-api?activityId={id}&action=sessions&date=2024-01-15
GET /functions/v1/cached-widget-api?sessionId={id}&action=availability&spots=4
```

Response Headers:
- `X-Cache: HIT` or `X-Cache: MISS`
- `X-RateLimit-Remaining: 95`

---

## Layer 3: Rate Limiting

### Implementation

Using sliding window algorithm in Redis:

```typescript
import { rateLimit } from '../_shared/cache.ts'

const result = await rateLimit(clientIP, 100, 60) // 100 req/min
if (!result.allowed) {
  return new Response('Rate limit exceeded', { 
    status: 429,
    headers: { 'Retry-After': String(result.reset) }
  })
}
```

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Widget Load | 60/min | Per embed key |
| API Calls | 100/min | Per IP |
| Checkout | 10/min | Per IP |

---

## Layer 4: Database Optimization

### Connection Pooling (Built-in)

Supabase uses Supavisor for connection pooling:
- Transaction mode: `?pgbouncer=true`
- Session mode: Default

### Query Caching

PostgreSQL automatically caches query plans. Optimize with:

```sql
-- Check cache hit rate
SELECT 
  sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) as cache_hit_ratio
FROM pg_statio_user_tables;
```

---

## Cache Invalidation Strategy

### Automatic Invalidation

```typescript
// When activity is updated
invalidateCache(`activity:${activityId}`)
invalidateCache(`widget:`) // All widget configs

// When sessions change
invalidateCache(`sessions:${activityId}`)
```

### Manual Invalidation (Admin)

```bash
# Clear all caches (use sparingly)
curl -X POST https://project.supabase.co/functions/v1/cache-admin?action=clear
```

---

## Why Upstash Redis?

| Feature | Upstash | Self-hosted Redis | Supabase Built-in |
|---------|---------|-------------------|-------------------|
| Serverless | ✅ | ❌ | N/A |
| Global Edge | ✅ | ❌ | N/A |
| Free Tier | ✅ 10K req/day | ❌ | N/A |
| REST API | ✅ | ❌ | N/A |
| Works with Edge Functions | ✅ | Limited | N/A |

**Supabase does NOT have built-in Redis.** Upstash is the recommended solution.

---

## Cost Estimation

### Upstash Free Tier
- 10,000 commands/day
- 256 MB storage
- Global replication

### Upstash Pay-as-you-go
- $0.2 per 100K commands
- Typical BookingTMS usage: ~50K commands/day = ~$3/month

---

## Files Created

| File | Purpose |
|------|---------|
| `src/lib/cache/redis.ts` | Client-side memory cache |
| `supabase/functions/_shared/cache.ts` | Edge function cache utilities |
| `supabase/functions/cached-widget-api/index.ts` | Cached widget API endpoint |

---

## Next Steps

1. [ ] Create Upstash account and database
2. [ ] Add secrets to Supabase project
3. [ ] Deploy `cached-widget-api` edge function
4. [ ] Update widget to use cached API
5. [ ] Monitor cache hit rates

---

## Monitoring

### Upstash Dashboard
- Real-time command stats
- Cache hit/miss rates
- Memory usage

### Supabase Dashboard
- Edge Function logs
- Database query performance
- Connection pool stats
