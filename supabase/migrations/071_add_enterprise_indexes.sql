-- =====================================================
-- Migration: 071_add_enterprise_indexes.sql
-- Description: Add critical indexes for enterprise-scale performance
-- Date: 2025-12-01
-- Priority: P0 - Critical
-- 
-- Problem: Missing composite indexes cause full table scans at scale.
-- Current queries can take 500ms+ with 100k+ rows.
-- 
-- Solution: Add strategic indexes for common query patterns.
-- Target: P95 query time < 50ms
-- =====================================================

-- =====================================================
-- PART 1: ACTIVITY SESSIONS INDEXES
-- Critical for availability queries (widget booking flow)
-- =====================================================

-- Primary availability index: activity + time + capacity
-- Used by: getAvailableSlots(), widget calendar
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_availability 
ON activity_sessions(activity_id, start_time, capacity_remaining) 
WHERE is_closed = false AND capacity_remaining > 0;

-- Date-based lookup for organization dashboards
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_org_date 
ON activity_sessions(organization_id, start_time::date);

-- Venue-based lookup for venue calendars
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_venue_time 
ON activity_sessions(venue_id, start_time) 
WHERE is_closed = false;

-- Time range queries (for date range filtering)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_time_range 
ON activity_sessions(start_time, end_time);

COMMENT ON INDEX idx_sessions_availability IS 
  'Primary index for availability queries - filters by activity, time, and remaining capacity';

-- =====================================================
-- PART 2: BOOKINGS INDEXES
-- Critical for dashboard and reporting queries
-- =====================================================

-- Primary booking lookup: org + date + status
-- Used by: dashboard, booking list, reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_org_date_status 
ON bookings(organization_id, booking_date, status);

-- Session-based lookup (for capacity calculations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_session_active 
ON bookings(session_id) 
WHERE status NOT IN ('cancelled', 'no_show');

-- Customer booking history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_customer_date 
ON bookings(customer_id, booking_date DESC);

-- Payment status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_payment_status 
ON bookings(organization_id, payment_status) 
WHERE payment_status IN ('pending', 'paid');

-- Booking reference lookup (for customer portal)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_reference 
ON bookings(booking_number) 
WHERE booking_number IS NOT NULL;

-- Confirmation code lookup (alternative reference)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_confirmation 
ON bookings(confirmation_code) 
WHERE confirmation_code IS NOT NULL;

-- Recent bookings (for dashboard widgets)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_recent 
ON bookings(organization_id, created_at DESC);

COMMENT ON INDEX idx_bookings_org_date_status IS 
  'Primary index for booking queries - filters by org, date, and status';

-- =====================================================
-- PART 3: CUSTOMERS INDEXES
-- Critical for customer lookup and deduplication
-- =====================================================

-- Unique email per organization (prevents duplicates)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_org_email_unique 
ON customers(organization_id, LOWER(email));

-- Phone lookup (for customer portal)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_org_phone 
ON customers(organization_id, phone) 
WHERE phone IS NOT NULL;

-- Stripe customer lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_stripe 
ON customers(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- Customer search (name-based)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name_search 
ON customers(organization_id, LOWER(first_name), LOWER(last_name));

-- High-value customers (for marketing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_value 
ON customers(organization_id, total_spent DESC) 
WHERE total_spent > 0;

COMMENT ON INDEX idx_customers_org_email_unique IS 
  'Ensures email uniqueness per organization and enables fast email lookups';

-- =====================================================
-- PART 4: ACTIVITIES INDEXES
-- Critical for widget data loading and admin management
-- =====================================================

-- Organization + venue + active status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_org_venue_active 
ON activities(organization_id, venue_id, is_active);

-- GIN index for schedule JSONB queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_schedule_gin 
ON activities USING GIN(schedule);

-- GIN index for settings JSONB queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_settings_gin 
ON activities USING GIN(settings);

-- Stripe product lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_stripe_product 
ON activities(stripe_product_id) 
WHERE stripe_product_id IS NOT NULL;

-- Category filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_category 
ON activities(organization_id, category) 
WHERE category IS NOT NULL;

COMMENT ON INDEX idx_activities_schedule_gin IS 
  'GIN index for efficient JSONB schedule queries (operating days, hours, etc.)';

-- =====================================================
-- PART 5: VENUES INDEXES
-- Critical for widget loading and embed key lookup
-- =====================================================

-- Embed key lookup (for widget initialization)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_embed_key_unique 
ON venues(embed_key) 
WHERE embed_key IS NOT NULL;

-- Organization + status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_org_status 
ON venues(organization_id, status);

-- Slug lookup (for public venue pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_slug 
ON venues(organization_id, slug);

-- GIN index for settings JSONB
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_settings_gin 
ON venues USING GIN(settings);

COMMENT ON INDEX idx_venues_embed_key_unique IS 
  'Unique index for fast embed key lookups - critical for widget performance';

-- =====================================================
-- PART 6: ORGANIZATIONS INDEXES
-- Critical for multi-tenant queries
-- =====================================================

-- Stripe account lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_stripe_account 
ON organizations(stripe_account_id) 
WHERE stripe_account_id IS NOT NULL;

-- Status + plan filtering (for admin dashboard)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_status_plan 
ON organizations(status, plan_id);

-- Subscription status (for billing queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_subscription 
ON organizations(subscription_status) 
WHERE subscription_status IS NOT NULL;

-- Owner lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_owner 
ON organizations(owner_id) 
WHERE owner_id IS NOT NULL;

COMMENT ON INDEX idx_org_stripe_account IS 
  'Index for Stripe Connect account lookups';

-- =====================================================
-- PART 7: USERS INDEXES
-- Critical for auth and permission checks
-- =====================================================

-- Organization + role filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_org_role_active 
ON users(organization_id, role) 
WHERE is_active = true;

-- Platform team lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_platform_team 
ON users(is_platform_team) 
WHERE is_platform_team = true;

-- Email lookup (for auth)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
ON users(LOWER(email));

COMMENT ON INDEX idx_users_org_role_active IS 
  'Index for permission checks and user listing within organizations';

-- =====================================================
-- PART 8: PAYMENTS INDEXES
-- Critical for financial reporting
-- =====================================================

-- Organization + status + date (for reports)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_org_status_date 
ON payments(organization_id, status, created_at DESC);

-- Stripe payment intent lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_stripe_intent 
ON payments(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- Booking payment lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking 
ON payments(booking_id);

COMMENT ON INDEX idx_payments_org_status_date IS 
  'Primary index for payment queries and financial reporting';

-- =====================================================
-- PART 9: EMBED CONFIGS INDEXES
-- Critical for widget configuration loading
-- =====================================================

-- Embed key lookup (primary widget access)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_embed_configs_key_unique 
ON embed_configs(embed_key) 
WHERE embed_key IS NOT NULL;

-- Organization + active filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_embed_configs_org_active 
ON embed_configs(organization_id, is_active);

-- Target type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_embed_configs_target 
ON embed_configs(target_type, target_id) 
WHERE target_id IS NOT NULL;

COMMENT ON INDEX idx_embed_configs_key_unique IS 
  'Unique index for fast embed configuration lookups';

-- =====================================================
-- PART 10: AUDIT LOGS INDEXES (if table exists)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    -- Organization + date filtering
    EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_org_date 
             ON audit_logs(organization_id, created_at DESC)';
    
    -- User activity tracking
    EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_user_date 
             ON audit_logs(user_id, created_at DESC)';
    
    -- Resource lookup
    EXECUTE 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_resource 
             ON audit_logs(resource_type, resource_id)';
  END IF;
END $$;

-- =====================================================
-- PART 11: ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

-- Update statistics for query planner optimization
ANALYZE activity_sessions;
ANALYZE bookings;
ANALYZE customers;
ANALYZE activities;
ANALYZE venues;
ANALYZE organizations;
ANALYZE users;
ANALYZE payments;
ANALYZE embed_configs;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 071_add_enterprise_indexes completed successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Indexes created:';
  RAISE NOTICE '  - activity_sessions: 4 indexes (availability, org_date, venue_time, time_range)';
  RAISE NOTICE '  - bookings: 7 indexes (org_date_status, session, customer, payment, reference, confirmation, recent)';
  RAISE NOTICE '  - customers: 5 indexes (org_email, phone, stripe, name_search, value)';
  RAISE NOTICE '  - activities: 5 indexes (org_venue_active, schedule_gin, settings_gin, stripe, category)';
  RAISE NOTICE '  - venues: 4 indexes (embed_key, org_status, slug, settings_gin)';
  RAISE NOTICE '  - organizations: 4 indexes (stripe_account, status_plan, subscription, owner)';
  RAISE NOTICE '  - users: 3 indexes (org_role_active, platform_team, email)';
  RAISE NOTICE '  - payments: 3 indexes (org_status_date, stripe_intent, booking)';
  RAISE NOTICE '  - embed_configs: 3 indexes (key, org_active, target)';
  RAISE NOTICE '';
  RAISE NOTICE 'Total: 38 indexes for enterprise-scale performance';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected improvements:';
  RAISE NOTICE '  - Availability queries: 500ms → <50ms';
  RAISE NOTICE '  - Dashboard queries: 1000ms → <100ms';
  RAISE NOTICE '  - Customer lookups: 200ms → <20ms';
  RAISE NOTICE '  - Widget loading: 300ms → <50ms';
END $$;
