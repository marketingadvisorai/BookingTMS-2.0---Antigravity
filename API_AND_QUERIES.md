# 🔌 API Access Rules & Sample Queries
## BookingTMS Multi-Tenant SaaS

**Version:** 1.0  
**Date:** November 16, 2025

---

## 📡 API ACCESS RULES

### Authentication & Authorization

#### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;              // user.id
  email: string;            // user.email
  role: UserRole;           // user.role
  organization_id?: string; // user.organization_id (null for platform team)
  is_platform_team: boolean;// user.is_platform_team
  iat: number;              // issued at
  exp: number;              // expires at
}
```

#### API Request Flow
```
1. Client sends request with JWT in Authorization header
2. Supabase verifies JWT signature
3. RLS policies enforce based on auth.uid() and JWT claims
4. API returns filtered data per tenant isolation
```

---

## 🔐 ROLE-BASED API ACCESS MATRIX

| Endpoint | system-admin | super-admin | admin | manager | staff |
|----------|--------------|-------------|-------|---------|-------|
| **Organizations** |
| GET /organizations | All orgs | All orgs | Own org | Own org | Own org |
| POST /organizations | ✅ | ✅ | ❌ | ❌ | ❌ |
| PUT /organizations/:id | ✅ | ✅ | Own only | ❌ | ❌ |
| DELETE /organizations/:id | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Users** |
| GET /users | All | All | Own org | Own org | Own org |
| POST /users | ✅ | ✅ | ✅ (manager/staff) | ❌ | ❌ |
| PUT /users/:id | ✅ | ✅ | ✅ (manager/staff) | ❌ | ❌ |
| DELETE /users/:id | ✅ | ✅ | ✅ (manager/staff) | ❌ | ❌ |
| **Venues** |
| GET /venues | All | All | Own org | Own org | Own org |
| POST /venues | ✅ | ✅ | ✅ | ❌ | ❌ |
| PUT /venues/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| DELETE /venues/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Games** |
| GET /games | All | All | Own org | Own org | Own org |
| POST /games | ✅ | ✅ | ✅ | ✅ | ❌ |
| PUT /games/:id | ✅ | ✅ | ✅ | ✅ | ❌ |
| DELETE /games/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Bookings** |
| GET /bookings | All | All | Own org | Own org | Own org |
| POST /bookings | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /bookings/:id | ✅ | ✅ | ✅ | ✅ | ❌ |
| DELETE /bookings/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customers** |
| GET /customers | All | All | Own org | Own org | Own org |
| POST /customers | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /customers/:id | ✅ | ✅ | ✅ | ✅ | ❌ |
| DELETE /customers/:id | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Payments** |
| GET /payments | All | All | Own org | Own org | 👁️ |
| POST /payments | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /refunds | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reports** |
| GET /reports/* | All | All | Own org | Own org | ❌ |
| POST /reports/generate | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Platform Admin** |
| GET /admin/stats | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /admin/organizations | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /admin/feature-flags | ✅ | ❌ | ❌ | ❌ | ❌ |

Legend: ✅ Full Access | 👁️ View Only | ❌ No Access

---

## 📝 SAMPLE QUERIES

### 1. Platform Team Queries

#### 1.1 Get All Organizations with Plan Details
```sql
-- Platform team viewing all organizations
SELECT 
  o.id,
  o.name,
  o.slug,
  o.subscription_status,
  p.name as plan_name,
  p.price_monthly,
  o.current_venues_count,
  o.current_staff_count,
  o.current_bookings_this_month,
  u.full_name as owner_name,
  u.email as owner_email,
  o.created_at
FROM organizations o
LEFT JOIN plans p ON o.plan_id = p.id
LEFT JOIN users u ON o.owner_id = u.id
WHERE o.is_active = true
ORDER BY o.created_at DESC;
```

#### 1.2 Platform Analytics Dashboard
```sql
-- Overall platform metrics
SELECT 
  COUNT(DISTINCT o.id) as total_organizations,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_platform_team = false) as total_users,
  COUNT(DISTINCT b.id) as total_bookings,
  SUM(p.amount) as total_revenue,
  COUNT(DISTINCT o.id) FILTER (WHERE o.subscription_status = 'active') as active_subscriptions,
  COUNT(DISTINCT o.id) FILTER (WHERE o.subscription_status = 'trialing') as trial_subscriptions
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id
LEFT JOIN bookings b ON b.organization_id = o.id
LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'paid'
WHERE o.is_active = true;
```

#### 1.3 Organizations Approaching Limits
```sql
-- Find orgs near their plan limits
SELECT 
  o.name,
  o.subscription_status,
  pl.name as plan_name,
  
  -- Venue usage
  o.current_venues_count,
  pl.max_venues,
  CASE 
    WHEN pl.max_venues IS NULL THEN 'unlimited'
    WHEN o.current_venues_count >= pl.max_venues THEN 'at_limit'
    WHEN o.current_venues_count >= pl.max_venues * 0.8 THEN 'near_limit'
    ELSE 'ok'
  END as venue_status,
  
  -- Staff usage
  o.current_staff_count,
  pl.max_staff,
  CASE 
    WHEN pl.max_staff IS NULL THEN 'unlimited'
    WHEN o.current_staff_count >= pl.max_staff THEN 'at_limit'
    WHEN o.current_staff_count >= pl.max_staff * 0.8 THEN 'near_limit'
    ELSE 'ok'
  END as staff_status,
  
  -- Booking usage
  o.current_bookings_this_month,
  pl.max_bookings_per_month,
  CASE 
    WHEN pl.max_bookings_per_month IS NULL THEN 'unlimited'
    WHEN o.current_bookings_this_month >= pl.max_bookings_per_month THEN 'at_limit'
    WHEN o.current_bookings_this_month >= pl.max_bookings_per_month * 0.8 THEN 'near_limit'
    ELSE 'ok'
  END as booking_status
  
FROM organizations o
JOIN plans pl ON o.plan_id = pl.id
WHERE o.is_active = true
  AND (
    o.current_venues_count >= pl.max_venues * 0.8
    OR o.current_staff_count >= pl.max_staff * 0.8
    OR o.current_bookings_this_month >= pl.max_bookings_per_month * 0.8
  )
ORDER BY o.name;
```

---

### 2. Organization Owner (Admin) Queries

#### 2.1 Organization Dashboard Stats
```sql
-- Current user's organization stats
-- RLS automatically filters by organization_id
SELECT 
  -- Today's stats
  COUNT(b.id) FILTER (WHERE b.booking_date = CURRENT_DATE) as bookings_today,
  SUM(b.final_amount) FILTER (WHERE b.booking_date = CURRENT_DATE AND b.payment_status = 'paid') as revenue_today,
  
  -- This week
  COUNT(b.id) FILTER (WHERE b.booking_date >= DATE_TRUNC('week', CURRENT_DATE)) as bookings_this_week,
  SUM(b.final_amount) FILTER (WHERE b.booking_date >= DATE_TRUNC('week', CURRENT_DATE) AND b.payment_status = 'paid') as revenue_this_week,
  
  -- This month
  COUNT(b.id) FILTER (WHERE b.booking_date >= DATE_TRUNC('month', CURRENT_DATE)) as bookings_this_month,
  SUM(b.final_amount) FILTER (WHERE b.booking_date >= DATE_TRUNC('month', CURRENT_DATE) AND b.payment_status = 'paid') as revenue_this_month,
  
  -- Upcoming (next 7 days)
  COUNT(b.id) FILTER (WHERE b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days') as upcoming_bookings

FROM bookings b
WHERE b.status NOT IN ('cancelled');
```

#### 2.2 Top Games by Revenue
```sql
-- Best performing games (RLS filters by org)
SELECT 
  g.id,
  g.name,
  g.difficulty,
  COUNT(b.id) as total_bookings,
  SUM(b.final_amount) FILTER (WHERE b.payment_status = 'paid') as total_revenue,
  AVG(b.final_amount) as avg_booking_value,
  COUNT(DISTINCT b.customer_id) as unique_customers
FROM games g
LEFT JOIN bookings b ON b.game_id = g.id
WHERE g.is_active = true
  AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY g.id, g.name, g.difficulty
ORDER BY total_revenue DESC NULLS LAST
LIMIT 10;
```

#### 2.3 Customer Segmentation
```sql
-- Customer segments (RLS filters by org)
SELECT 
  c.segment,
  COUNT(*) as customer_count,
  SUM(c.total_bookings) as total_bookings,
  SUM(c.total_spent) as total_revenue,
  AVG(c.total_spent) as avg_customer_value,
  
  -- Recent activity
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.customer_id = c.id 
      AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
    )
  ) as active_last_30_days

FROM customers c
GROUP BY c.segment
ORDER BY 
  CASE c.segment
    WHEN 'vip' THEN 1
    WHEN 'regular' THEN 2
    WHEN 'new' THEN 3
    WHEN 'inactive' THEN 4
  END;
```

#### 2.4 Check Plan Usage & Limits
```sql
-- Show current usage vs plan limits
SELECT 
  o.name as organization,
  pl.name as plan,
  
  -- Venues
  o.current_venues_count as venues_used,
  pl.max_venues as venues_limit,
  CASE 
    WHEN pl.max_venues IS NULL THEN '∞'
    ELSE (pl.max_venues - o.current_venues_count)::text
  END as venues_remaining,
  
  -- Staff
  o.current_staff_count as staff_used,
  pl.max_staff as staff_limit,
  CASE 
    WHEN pl.max_staff IS NULL THEN '∞'
    ELSE (pl.max_staff - o.current_staff_count)::text
  END as staff_remaining,
  
  -- Bookings this month
  o.current_bookings_this_month as bookings_used,
  pl.max_bookings_per_month as bookings_limit,
  CASE 
    WHEN pl.max_bookings_per_month IS NULL THEN '∞'
    ELSE (pl.max_bookings_per_month - o.current_bookings_this_month)::text
  END as bookings_remaining,
  
  -- Available features
  pl.features as features

FROM organizations o
JOIN plans pl ON o.plan_id = pl.id
WHERE o.id IN (
  SELECT organization_id FROM users WHERE id = auth.uid()
);
```

---

### 3. Common Operational Queries

#### 3.1 Create Booking with Availability Check
```sql
-- Function to check availability and create booking
CREATE OR REPLACE FUNCTION create_booking_with_check(
  p_customer_id UUID,
  p_game_id UUID,
  p_venue_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_party_size INT
)
RETURNS TABLE (
  booking_id UUID,
  booking_number TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_organization_id UUID;
  v_end_time TIME;
  v_game_duration INT;
  v_is_available BOOLEAN;
  v_booking_number TEXT;
  v_new_booking_id UUID;
  v_plan_limit INT;
  v_current_count INT;
BEGIN
  -- Get organization_id from current user
  SELECT organization_id INTO v_organization_id
  FROM users WHERE id = auth.uid();
  
  -- Get game duration
  SELECT duration_minutes INTO v_game_duration
  FROM games WHERE id = p_game_id AND organization_id = v_organization_id;
  
  IF v_game_duration IS NULL THEN
    RETURN QUERY SELECT NULL, NULL, false, 'Game not found';
    RETURN;
  END IF;
  
  -- Calculate end time
  v_end_time := p_start_time + (v_game_duration || ' minutes')::INTERVAL;
  
  -- Check availability
  SELECT check_game_availability(
    p_game_id,
    p_booking_date,
    p_start_time,
    v_end_time
  ) INTO v_is_available;
  
  IF NOT v_is_available THEN
    RETURN QUERY SELECT NULL, NULL, false, 'Time slot not available';
    RETURN;
  END IF;
  
  -- Check plan limits
  SELECT 
    pl.max_bookings_per_month,
    o.current_bookings_this_month
  INTO v_plan_limit, v_current_count
  FROM organizations o
  JOIN plans pl ON o.plan_id = pl.id
  WHERE o.id = v_organization_id;
  
  IF v_plan_limit IS NOT NULL AND v_current_count >= v_plan_limit THEN
    RETURN QUERY SELECT NULL, NULL, false, 'Monthly booking limit reached';
    RETURN;
  END IF;
  
  -- Generate booking number
  v_booking_number := generate_booking_number();
  
  -- Create booking
  INSERT INTO bookings (
    organization_id,
    booking_number,
    customer_id,
    game_id,
    venue_id,
    booking_date,
    start_time,
    end_time,
    party_size,
    status,
    created_by
  ) VALUES (
    v_organization_id,
    v_booking_number,
    p_customer_id,
    p_game_id,
    p_venue_id,
    p_booking_date,
    p_start_time,
    v_end_time,
    p_party_size,
    'pending',
    auth.uid()
  )
  RETURNING id INTO v_new_booking_id;
  
  -- Update organization booking count
  UPDATE organizations
  SET current_bookings_this_month = current_bookings_this_month + 1
  WHERE id = v_organization_id;
  
  RETURN QUERY SELECT v_new_booking_id, v_booking_number, true, 'Booking created successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3.2 Get Available Time Slots
```sql
-- Get available time slots for a game on a specific date
CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_game_id UUID,
  p_date DATE
)
RETURNS TABLE (
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_organization_id UUID;
  v_duration INT;
  v_venue_id UUID;
  v_open_time TIME;
  v_close_time TIME;
  v_current_time TIME;
BEGIN
  -- Get user's organization
  SELECT organization_id INTO v_organization_id
  FROM users WHERE id = auth.uid();
  
  -- Get game details
  SELECT duration_minutes, venue_id 
  INTO v_duration, v_venue_id
  FROM games 
  WHERE id = p_game_id AND organization_id = v_organization_id;
  
  -- Get venue hours for the date
  SELECT 
    (settings->'business_hours'->LOWER(TO_CHAR(p_date, 'Day'))->>'open')::TIME,
    (settings->'business_hours'->LOWER(TO_CHAR(p_date, 'Day'))->>'close')::TIME
  INTO v_open_time, v_close_time
  FROM organizations
  WHERE id = v_organization_id;
  
  -- Generate time slots
  v_current_time := v_open_time;
  
  WHILE v_current_time + (v_duration || ' minutes')::INTERVAL <= v_close_time LOOP
    RETURN QUERY SELECT
      v_current_time,
      v_current_time + (v_duration || ' minutes')::INTERVAL,
      check_game_availability(
        p_game_id,
        p_date,
        v_current_time,
        v_current_time + (v_duration || ' minutes')::INTERVAL
      );
    
    -- Move to next slot (add duration + 15 min buffer)
    v_current_time := v_current_time + ((v_duration + 15) || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage
SELECT * FROM get_available_time_slots(
  '<game_id>', 
  '2025-11-20'::DATE
);
```

#### 3.3 Monthly Revenue Report
```sql
-- Monthly revenue breakdown by game
SELECT 
  DATE_TRUNC('month', b.booking_date) as month,
  g.name as game_name,
  COUNT(b.id) as total_bookings,
  SUM(b.party_size) as total_guests,
  SUM(b.final_amount) FILTER (WHERE b.payment_status = 'paid') as revenue,
  AVG(b.final_amount) as avg_booking_value,
  COUNT(DISTINCT b.customer_id) as unique_customers
FROM bookings b
JOIN games g ON b.game_id = g.id
WHERE b.booking_date >= DATE_TRUNC('year', CURRENT_DATE)
  AND b.status != 'cancelled'
GROUP BY DATE_TRUNC('month', b.booking_date), g.id, g.name
ORDER BY month DESC, revenue DESC NULLS LAST;
```

---

### 4. Performance Optimization Queries

#### 4.1 Optimized Booking List with Joins
```sql
-- Efficient booking list with all related data
SELECT 
  b.id,
  b.booking_number,
  b.booking_date,
  b.start_time,
  b.status,
  b.payment_status,
  b.final_amount,
  
  -- Customer info (single join)
  jsonb_build_object(
    'id', c.id,
    'name', c.full_name,
    'email', c.email,
    'phone', c.phone,
    'segment', c.segment
  ) as customer,
  
  -- Game info
  jsonb_build_object(
    'id', g.id,
    'name', g.name,
    'difficulty', g.difficulty,
    'duration', g.duration_minutes
  ) as game,
  
  -- Venue info
  jsonb_build_object(
    'id', v.id,
    'name', v.name
  ) as venue,
  
  -- Created by user
  jsonb_build_object(
    'id', u.id,
    'name', u.full_name
  ) as created_by

FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN games g ON b.game_id = g.id
LEFT JOIN venues v ON b.venue_id = v.id
LEFT JOIN users u ON b.created_by = u.id

WHERE b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY b.booking_date DESC, b.start_time DESC
LIMIT 100;

-- Index to optimize this query
CREATE INDEX idx_bookings_date_desc ON bookings(booking_date DESC, start_time DESC);
```

#### 4.2 Cached Dashboard Stats (Materialized View)
```sql
-- Create materialized view for dashboard stats
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  o.id as organization_id,
  
  -- Current period stats
  COUNT(b.id) FILTER (WHERE b.booking_date >= CURRENT_DATE) as upcoming_bookings,
  COUNT(b.id) FILTER (WHERE b.booking_date = CURRENT_DATE) as today_bookings,
  SUM(b.final_amount) FILTER (WHERE b.booking_date >= DATE_TRUNC('month', CURRENT_DATE) AND b.payment_status = 'paid') as month_revenue,
  
  -- Customer stats
  COUNT(DISTINCT c.id) as total_customers,
  COUNT(DISTINCT c.id) FILTER (WHERE c.segment = 'vip') as vip_customers,
  
  -- Resource counts
  COUNT(DISTINCT v.id) as total_venues,
  COUNT(DISTINCT g.id) as total_games,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_platform_team = false) as total_staff,
  
  NOW() as last_refreshed

FROM organizations o
LEFT JOIN bookings b ON b.organization_id = o.id
LEFT JOIN customers c ON c.organization_id = o.id
LEFT JOIN venues v ON v.organization_id = o.id
LEFT JOIN games g ON g.organization_id = o.id
LEFT JOIN users u ON u.organization_id = o.id

WHERE o.is_active = true
GROUP BY o.id;

-- Create unique index
CREATE UNIQUE INDEX idx_dashboard_stats_org ON dashboard_stats(organization_id);

-- Refresh every 5 minutes (via cron job or pg_cron)
-- SELECT cron.schedule('refresh-dashboard-stats', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats');

-- Query the materialized view (fast!)
SELECT * FROM dashboard_stats WHERE organization_id = '<org_id>';
```

---

## 🔒 TENANT ISOLATION VALIDATION QUERIES

```sql
-- 1. Check for cross-tenant foreign keys
SELECT 
  b.id as booking_id,
  b.organization_id as booking_org,
  c.organization_id as customer_org
FROM bookings b
JOIN customers c ON b.customer_id = c.id
WHERE b.organization_id != c.organization_id;
-- Should return 0 rows

-- 2. Verify all RLS policies are enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'organizations', 'users', 'venues', 'games', 
    'customers', 'bookings', 'payments'
  )
  AND rowsecurity = false;
-- Should return 0 rows

-- 3. Test tenant isolation
SET SESSION "request.jwt.claims.sub" = '<user_id_org_a>';
SELECT COUNT(*) FROM bookings; -- Should only see org A bookings

SET SESSION "request.jwt.claims.sub" = '<user_id_org_b>';
SELECT COUNT(*) FROM bookings; -- Should only see org B bookings
```

---

**All queries are optimized for:**
- Multi-tenant isolation via RLS
- Performance with proper indexing
- Security through role-based filtering
- Scalability with pagination and limits
