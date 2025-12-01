# Enterprise Scale Implementation Tasks

> **Version**: 1.0.0  
> **Date**: December 1, 2025  
> **Status**: Ready for Implementation

---

## Overview

This document contains the prioritized task list for implementing enterprise-scale improvements to BookingTMS. Tasks are organized by priority (P0 = Critical, P1 = High, P2 = Medium, P3 = Low).

**Reference Documents:**
- Architecture: `.agent/rules/ENTERPRISE_ARCHITECTURE.md`
- PRD: `.agent/rules/PRD_ENTERPRISE_SCALE.md`

**MVP legend:**
- `[MVP]` = required before first external customers use real bookings
- `[Post-MVP]` = can be implemented after initial launch once core flows are stable

---

## Phase 1: Critical Foundation (P0, MVP)

### [MVP] Task 1.1: Fix Optimistic Locking for Sessions
**Priority:** P0 - Critical  
**Effort:** 4 hours  
**Impact:** Prevents double bookings

**Problem:**
Currently, two concurrent booking requests can both succeed because there's no version check on `activity_sessions.capacity_remaining`.

**Solution:**
```sql
-- 1. Add version column
ALTER TABLE activity_sessions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 2. Create atomic reservation function
CREATE OR REPLACE FUNCTION reserve_session_capacity(
  p_session_id UUID,
  p_spots INTEGER,
  p_expected_version INTEGER
) RETURNS TABLE(success BOOLEAN, new_version INTEGER, remaining INTEGER) AS $$
DECLARE
  v_current_capacity INTEGER;
  v_current_version INTEGER;
BEGIN
  -- Lock row and check version
  SELECT capacity_remaining, version INTO v_current_capacity, v_current_version
  FROM activity_sessions WHERE id = p_session_id FOR UPDATE;
  
  -- Version mismatch = concurrent modification
  IF v_current_version != p_expected_version THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity;
    RETURN;
  END IF;
  
  -- Insufficient capacity
  IF v_current_capacity < p_spots THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity;
    RETURN;
  END IF;
  
  -- Update with new version
  UPDATE activity_sessions
  SET capacity_remaining = capacity_remaining - p_spots, version = version + 1
  WHERE id = p_session_id;
  
  RETURN QUERY SELECT true, v_current_version + 1, v_current_capacity - p_spots;
END;
$$ LANGUAGE plpgsql;
```

**Files to Modify:**
- [ ] Create migration: `supabase/migrations/070_add_optimistic_locking.sql`
- [ ] Update service: `src/services/session.service.ts`
- [ ] Update booking flow: `src/modules/embed-pro/services/checkoutPro.service.ts`

**Acceptance Criteria:**
- [ ] Version column exists on activity_sessions
- [ ] Concurrent booking attempts fail gracefully
- [ ] No double bookings in load test (100 concurrent requests)

---

### [MVP] Task 1.2: Add Critical Database Indexes
**Priority:** P0 - Critical  
**Effort:** 2 hours  
**Impact:** 10x query performance improvement

**Problem:**
Missing composite indexes cause full table scans at scale.

**Solution:**
```sql
-- Activity Sessions (availability queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_availability 
  ON activity_sessions(activity_id, start_time, capacity_remaining) 
  WHERE is_closed = false;

-- Bookings (dashboard queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_org_date_status 
  ON bookings(organization_id, booking_date, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_session 
  ON bookings(session_id) WHERE status != 'cancelled';

-- Customers (lookup queries)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_org_email 
  ON customers(organization_id, email);

-- Activities (schedule queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_schedule 
  ON activities USING GIN(schedule);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_org_venue_active 
  ON activities(organization_id, venue_id, is_active);

-- Venues
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_embed_key 
  ON venues(embed_key) WHERE embed_key IS NOT NULL;
```

**Files to Create:**
- [ ] Migration: `supabase/migrations/071_add_enterprise_indexes.sql`

**Acceptance Criteria:**
- [ ] All indexes created successfully
- [ ] Query explain plans show index usage
- [ ] P95 query time < 50ms for common queries

---

### [MVP] Task 1.3: Fix RLS Helper Functions
**Priority:** P0 - Critical  
**Effort:** 3 hours  
**Impact:** Prevents auth failures and infinite loops

**Problem:**
Current RLS policies can cause infinite recursion when querying the users table.

**Solution:**
```sql
-- Safe organization ID lookup (no recursion)
CREATE OR REPLACE FUNCTION get_my_organization_id_safe()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

-- Check if user can access an organization
CREATE OR REPLACE FUNCTION can_access_organization(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      is_platform_team = true 
      OR organization_id = p_org_id
    )
  );
$$;

-- Update all RLS policies to use helper functions
-- Example for bookings table:
DROP POLICY IF EXISTS "org_users_view_bookings" ON bookings;
CREATE POLICY "org_users_view_bookings" ON bookings
  FOR SELECT USING (
    organization_id = get_my_organization_id_safe()
    OR is_platform_admin()
  );
```

**Files to Create:**
- [ ] Migration: `supabase/migrations/072_fix_rls_helper_functions.sql`

**Acceptance Criteria:**
- [ ] No RLS recursion errors in logs
- [ ] System admin can access all data
- [ ] Org users can only access their org data

---

### [MVP] Task 1.4: Add Slot Reservation System
**Priority:** P0 - Critical  
**Effort:** 6 hours  
**Impact:** Prevents abandoned checkout overbooking

**Problem:**
When a customer starts checkout but doesn't complete, the slot remains "reserved" in their session but available to others.

**Solution:**
```sql
-- Create slot_reservations table
CREATE TABLE IF NOT EXISTS slot_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,
  customer_email VARCHAR(255),
  spots_reserved INTEGER NOT NULL,
  checkout_session_id VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_spots CHECK (spots_reserved > 0)
);

CREATE INDEX idx_reservations_session ON slot_reservations(session_id);
CREATE INDEX idx_reservations_expires ON slot_reservations(expires_at);

-- Function to clean expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM slot_reservations
    WHERE expires_at < NOW()
    RETURNING session_id, spots_reserved
  )
  UPDATE activity_sessions s
  SET capacity_remaining = capacity_remaining + d.spots_reserved
  FROM deleted d
  WHERE s.id = d.session_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**Files to Create:**
- [ ] Migration: `supabase/migrations/073_add_slot_reservations.sql`
- [ ] Service: `src/services/reservation.service.ts`
- [ ] Cron job: `supabase/functions/cleanup-reservations/index.ts`

**Acceptance Criteria:**
- [ ] Reservations expire after 10 minutes
- [ ] Capacity is restored when reservation expires
- [ ] Checkout validates reservation before payment

---

## Phase 2: Performance (P1, Post-MVP)

### [Post-MVP] Task 2.1: Implement Redis Caching Layer
**Priority:** P1 - High  
**Effort:** 8 hours  
**Impact:** 50% reduction in database load

**Problem:**
Frequently accessed data (activity details, venue config) hits the database on every request.

**Solution:**
```typescript
// src/lib/cache/cacheService.ts
interface CacheConfig {
  activityTTL: 300;      // 5 minutes
  venueTTL: 300;         // 5 minutes
  sessionTTL: 30;        // 30 seconds (availability)
  permissionsTTL: 300;   // 5 minutes
}

class CacheService {
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, value: T, ttl: number): Promise<void>;
  async invalidate(pattern: string): Promise<void>;
  async invalidateOnUpdate(table: string, id: string): Promise<void>;
}
```

**Files to Create:**
- [ ] Service: `src/lib/cache/cacheService.ts`
- [ ] Hook: `src/hooks/useCache.ts`
- [ ] Update: `src/services/SupabaseBookingService.ts` (add caching)

**Acceptance Criteria:**
- [ ] Cache hit rate > 80%
- [ ] P95 latency < 50ms for cached endpoints
- [ ] Cache invalidation on data updates

---

### [Post-MVP] Task 2.2: Add Rate Limiting
**Priority:** P1 - High  
**Effort:** 4 hours  
**Impact:** Prevents API abuse

**Solution:**
```typescript
// supabase/functions/_shared/rateLimit.ts
const RATE_LIMITS = {
  public: { requests: 100, window: 60 },      // 100/min
  authenticated: { requests: 1000, window: 60 }, // 1000/min
  admin: { requests: 5000, window: 60 },      // 5000/min
};

async function checkRateLimit(
  identifier: string,
  tier: 'public' | 'authenticated' | 'admin'
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }>;
```

**Files to Create:**
- [ ] Shared: `supabase/functions/_shared/rateLimit.ts`
- [ ] Update all edge functions to use rate limiting

**Acceptance Criteria:**
- [ ] Rate limits enforced per IP/user
- [ ] 429 response with retry-after header
- [ ] Rate limit headers in all responses

---

### [Post-MVP] Task 2.3: Optimize Slow Queries
**Priority:** P1 - High  
**Effort:** 4 hours  
**Impact:** 5x improvement on dashboard queries

**Problem:**
Dashboard and booking list queries are slow due to multiple JOINs and aggregations.

**Solution:**
```sql
-- Materialized view for dashboard stats
CREATE MATERIALIZED VIEW organization_dashboard_stats AS
SELECT 
  o.id as organization_id,
  COUNT(DISTINCT v.id) as venue_count,
  COUNT(DISTINCT a.id) as activity_count,
  COUNT(DISTINCT b.id) FILTER (WHERE b.created_at > NOW() - INTERVAL '30 days') as bookings_30d,
  SUM(b.total_amount) FILTER (WHERE b.payment_status = 'paid' AND b.created_at > NOW() - INTERVAL '30 days') as revenue_30d
FROM organizations o
LEFT JOIN venues v ON v.organization_id = o.id
LEFT JOIN activities a ON a.organization_id = o.id
LEFT JOIN bookings b ON b.organization_id = o.id
GROUP BY o.id;

CREATE UNIQUE INDEX ON organization_dashboard_stats(organization_id);

-- Refresh function (call via cron every 5 min)
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY organization_dashboard_stats;
END;
$$ LANGUAGE plpgsql;
```

**Files to Create:**
- [ ] Migration: `supabase/migrations/074_add_materialized_views.sql`
- [ ] Cron: `supabase/functions/refresh-stats/index.ts`

**Acceptance Criteria:**
- [ ] Dashboard loads in < 500ms
- [ ] Stats refresh every 5 minutes
- [ ] No impact on write operations

---

### [Post-MVP] Task 2.4: Connection Pooling Configuration
**Priority:** P1 - High  
**Effort:** 2 hours  
**Impact:** Prevents connection exhaustion

**Problem:**
Under high load, the database can run out of connections.

**Solution:**
```typescript
// Update Supabase client configuration
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-connection-pool': 'transaction', // Use transaction pooling
    },
  },
});
```

**Files to Modify:**
- [ ] `src/lib/supabase.ts` - Add pooling config
- [ ] Supabase dashboard - Configure PgBouncer

**Acceptance Criteria:**
- [ ] Connection pool configured
- [ ] No connection exhaustion under load
- [ ] Proper connection release

---

## Phase 3: Security (P1, Post-MVP)

### [Post-MVP] Task 3.1: Add Audit Logging
**Priority:** P1 - High  
**Effort:** 6 hours  
**Impact:** Compliance and security monitoring

**Solution:**
```sql
-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_org_date ON audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Trigger function for automatic logging
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, organization_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (
    auth.uid(),
    COALESCE(NEW.organization_id, OLD.organization_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Files to Create:**
- [ ] Migration: `supabase/migrations/075_add_audit_logging.sql`
- [ ] Service: `src/services/audit.service.ts`
- [ ] UI: `src/pages/AuditLogs.tsx`

**Acceptance Criteria:**
- [ ] All admin actions logged
- [ ] Audit logs queryable by org/user/resource
- [ ] 90-day retention policy

---

### [Post-MVP] Task 3.2: Implement API Key Scoping
**Priority:** P1 - High  
**Effort:** 4 hours  
**Impact:** Better API security

**Solution:**
```sql
-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for identification
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
```

**Files to Create:**
- [ ] Migration: `supabase/migrations/076_add_api_keys.sql`
- [ ] Service: `src/services/apiKey.service.ts`
- [ ] UI: `src/pages/APIKeys.tsx`

**Acceptance Criteria:**
- [ ] API keys scoped to organization
- [ ] Configurable permissions per key
- [ ] Key rotation support

---

## Phase 4: Scale Preparation (P2, Post-MVP)

### [Post-MVP] Task 4.1: Add Read Replica Support
**Priority:** P2 - Medium  
**Effort:** 8 hours  
**Impact:** Horizontal read scaling

**Solution:**
```typescript
// src/lib/supabase.ts
const primaryClient = createClient(PRIMARY_URL, KEY);
const replicaClient = createClient(REPLICA_URL, KEY);

export function getClient(operation: 'read' | 'write') {
  return operation === 'read' ? replicaClient : primaryClient;
}
```

**Files to Modify:**
- [ ] `src/lib/supabase.ts` - Add replica support
- [ ] All services - Use appropriate client

**Acceptance Criteria:**
- [ ] Read queries go to replica
- [ ] Write queries go to primary
- [ ] Graceful fallback if replica unavailable

---

### [Post-MVP] Task 4.2: Implement Health Checks
**Priority:** P2 - Medium  
**Effort:** 2 hours  
**Impact:** Better monitoring and alerting

**Solution:**
```typescript
// supabase/functions/health/index.ts
interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: { status: string; latency: number };
    stripe: { status: string; latency: number };
    redis: { status: string; latency: number };
  };
  timestamp: string;
}
```

**Files to Create:**
- [ ] Edge function: `supabase/functions/health/index.ts`
- [ ] Monitoring: Configure uptime checks

**Acceptance Criteria:**
- [ ] Health endpoint responds in < 1s
- [ ] All dependencies checked
- [ ] Alerts on degraded status

---

### [Post-MVP] Task 4.3: Load Testing Suite
**Priority:** P2 - Medium  
**Effort:** 8 hours  
**Impact:** Confidence in scale readiness

**Solution:**
```typescript
// tests/load/booking-flow.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 1000 }, // Spike to 1000
    { duration: '5m', target: 1000 }, // Stay at 1000
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};
```

**Files to Create:**
- [ ] `tests/load/booking-flow.ts`
- [ ] `tests/load/availability-check.ts`
- [ ] `tests/load/dashboard-load.ts`

**Acceptance Criteria:**
- [ ] Handle 1000 concurrent users
- [ ] P95 latency < 200ms under load
- [ ] Error rate < 1%

---

## Task Execution Order

### Week 1-2: Critical Foundation (MVP)
1. [ ] Task 1.1: Optimistic Locking (4h)
2. [ ] Task 1.2: Database Indexes (2h)
3. [ ] Task 1.3: RLS Helper Functions (3h)
4. [ ] Task 1.4: Slot Reservations (6h)

### Week 3-4: Performance (Post-MVP)
5. [ ] Task 2.1: Redis Caching (8h)
6. [ ] Task 2.2: Rate Limiting (4h)
7. [ ] Task 2.3: Query Optimization (4h)
8. [ ] Task 2.4: Connection Pooling (2h)

### Week 5-6: Security (Post-MVP)
9. [ ] Task 3.1: Audit Logging (6h)
10. [ ] Task 3.2: API Key Scoping (4h)

### Week 7-8: Scale Preparation (Post-MVP)
11. [ ] Task 4.1: Read Replicas (8h)
12. [ ] Task 4.2: Health Checks (2h)
13. [ ] Task 4.3: Load Testing (8h)

---

## Progress Tracking

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| Foundation | 4 | 4 | 100% ✅ |
| Performance | 4 | 2 | 50% |
| Security | 2 | 0 | 0% |
| Scale | 3 | 0 | 0% |
| **Total** | **13** | **6** | **46%** |

### MVP Tasks Status (Dec 1, 2025)
- [x] Task 1.1: Optimistic Locking - `070_add_optimistic_locking.sql` applied
- [x] Task 1.2: Database Indexes - `071_add_enterprise_indexes.sql` applied (38 indexes)
- [x] Task 1.3: RLS Helper Functions - `072_fix_rls_helper_functions.sql` applied
- [x] Task 1.4: Slot Reservations - Edge functions deployed, pg_cron scheduled

### Phase 2 Tasks Status (Dec 2, 2025)
- [x] Task 2.1: Redis Caching - Upstash Redis integration created
  - `src/lib/cache/redis.ts` - Client-side memory cache
  - `supabase/functions/_shared/cache.ts` - Edge function cache utilities
  - `supabase/functions/cached-widget-api/index.ts` - Cached API endpoint
- [x] Task 2.2: Rate Limiting - Implemented in cached-widget-api
- [ ] Task 2.3: Connection Pooling - Using Supavisor (built-in)
- [ ] Task 2.4: Query Optimization - Ongoing

### Action Required
1. Create Upstash account at https://console.upstash.com
2. Create Global Redis database
3. Add secrets to Supabase:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy `cached-widget-api` edge function

---

## Notes

- All migrations should be tested on a staging environment first
- Load testing should be done during off-peak hours
- Security changes require review before deployment
- Document all changes in CHANGELOG.md

---

*Last Updated: December 1, 2025*
