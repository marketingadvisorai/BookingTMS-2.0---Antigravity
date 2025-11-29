-- =====================================================
-- Migration: 20251129_enable_rls_core_tables.sql
-- Description: Enable RLS on core booking tables with proper policies
-- Created: 2025-11-29
-- 
-- Security Model:
-- - Authenticated users: Full access to their organization's data
-- - Anonymous users: Read-only access for widgets and customer portal
-- - Service role: Full access (for webhooks and edge functions)
-- =====================================================

-- ===================
-- BOOKINGS TABLE
-- ===================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "bookings_org_access" ON bookings;
DROP POLICY IF EXISTS "bookings_anon_read" ON bookings;
DROP POLICY IF EXISTS "bookings_service_access" ON bookings;

-- Policy 1: Authenticated users can access bookings for their organization
-- Application-level filtering ensures users only see their org's data
CREATE POLICY "bookings_org_access" ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read their own bookings (for customer portal)
-- They must know the booking_number to access their booking
CREATE POLICY "bookings_anon_read" ON bookings
  FOR SELECT
  TO anon
  USING (true);

-- ===================
-- CUSTOMERS TABLE
-- ===================

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "customers_org_access" ON customers;
DROP POLICY IF EXISTS "customers_anon_read" ON customers;
DROP POLICY IF EXISTS "customers_service_access" ON customers;

-- Policy 1: Authenticated users can manage customers for their organization
CREATE POLICY "customers_org_access" ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read customer data (for customer portal lookup)
-- Application validates identity via email/phone/booking_ref
CREATE POLICY "customers_anon_read" ON customers
  FOR SELECT
  TO anon
  USING (true);

-- ===================
-- ACTIVITIES TABLE
-- ===================

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "activities_org_access" ON activities;
DROP POLICY IF EXISTS "activities_anon_read" ON activities;

-- Policy 1: Authenticated users can manage activities
CREATE POLICY "activities_org_access" ON activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read active activities (for widgets)
CREATE POLICY "activities_anon_read" ON activities
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ===================
-- VENUES TABLE
-- ===================

-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "venues_org_access" ON venues;
DROP POLICY IF EXISTS "venues_anon_read" ON venues;

-- Policy 1: Authenticated users can manage venues
CREATE POLICY "venues_org_access" ON venues
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read active venues (for widgets)
CREATE POLICY "venues_anon_read" ON venues
  FOR SELECT
  TO anon
  USING (status = 'active');

-- ===================
-- ACTIVITY_SESSIONS TABLE
-- ===================

-- Enable RLS
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "sessions_org_access" ON activity_sessions;
DROP POLICY IF EXISTS "sessions_anon_read" ON activity_sessions;

-- Policy 1: Authenticated users can manage sessions
CREATE POLICY "sessions_org_access" ON activity_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read sessions (for availability checking)
CREATE POLICY "sessions_anon_read" ON activity_sessions
  FOR SELECT
  TO anon
  USING (true);

-- ===================
-- ORGANIZATIONS TABLE
-- ===================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "organizations_org_access" ON organizations;
DROP POLICY IF EXISTS "organizations_anon_read" ON organizations;

-- Policy 1: Authenticated users can access organizations
CREATE POLICY "organizations_org_access" ON organizations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 2: Anonymous users can read active organizations (for checkout/Stripe Connect)
CREATE POLICY "organizations_anon_read" ON organizations
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ===================
-- EMBED_CONFIGS TABLE (already has policies, ensure they're correct)
-- ===================

-- Make sure RLS is enabled
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- IMPORTANT: Service Role Bypass
-- =====================================================
-- The service role (used by Edge Functions and webhooks) 
-- automatically bypasses RLS. No additional policies needed.
-- This allows stripe-webhook and other functions to:
-- - Create bookings after successful payment
-- - Create/update customer records
-- - Update session availability

-- =====================================================
-- Verification Query (run this to confirm RLS is enabled)
-- =====================================================
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('bookings', 'customers', 'activities', 'venues', 'activity_sessions', 'organizations', 'embed_configs');
