-- =====================================================
-- Migration: 055_add_public_read_for_embed_widgets.sql
-- Description: Add public read access for activities and venues
--              to support Embed Pro 2.0 widgets without auth
-- Created: 2025-11-27
-- =====================================================

-- =====================================================
-- ACTIVITIES - Public read for active activities
-- =====================================================
-- Drop existing public policy if exists
DROP POLICY IF EXISTS "Public read active activities" ON activities;
DROP POLICY IF EXISTS "Public read: Active activities for widgets" ON activities;

-- Allow anonymous users to read active activities (for booking widgets)
-- Note: activities table uses is_active boolean, not status varchar
CREATE POLICY "Public read: Active activities for widgets" ON activities
  FOR SELECT 
  TO anon
  USING (is_active = true);

-- Grant SELECT to anon role
GRANT SELECT ON activities TO anon;

-- =====================================================
-- VENUES - Public read for active venues
-- =====================================================
-- Drop existing public policy if exists (may already exist)
DROP POLICY IF EXISTS "Public Read: Venues for booking widgets" ON venues;
DROP POLICY IF EXISTS "Public read: Active venues for widgets" ON venues;

-- Allow anonymous users to read active venues (for booking widgets)
CREATE POLICY "Public read: Active venues for widgets" ON venues
  FOR SELECT 
  TO anon
  USING (status = 'active');

-- Grant SELECT to anon role
GRANT SELECT ON venues TO anon;

-- =====================================================
-- ACTIVITY_SESSIONS - Public read for sessions
-- =====================================================
-- Drop existing public policy if exists
DROP POLICY IF EXISTS "Public read: Sessions for widgets" ON activity_sessions;

-- Allow anonymous users to read sessions (for availability check)
CREATE POLICY "Public read: Sessions for widgets" ON activity_sessions
  FOR SELECT 
  TO anon
  USING (true);

-- Grant SELECT to anon role
GRANT SELECT ON activity_sessions TO anon;

-- =====================================================
-- ORGANIZATIONS - Public read for organization name only
-- =====================================================
-- Note: Only minimal data needed for widget display
DROP POLICY IF EXISTS "Public read: Org name for widgets" ON organizations;

CREATE POLICY "Public read: Org name for widgets" ON organizations
  FOR SELECT 
  TO anon
  USING (true);

GRANT SELECT ON organizations TO anon;

-- =====================================================
-- Comment for documentation
-- =====================================================
COMMENT ON POLICY "Public read: Active activities for widgets" ON activities IS 
  'Allows anonymous users to read active activities for embedded booking widgets';
COMMENT ON POLICY "Public read: Active venues for widgets" ON venues IS 
  'Allows anonymous users to read active venues for embedded booking widgets';
COMMENT ON POLICY "Public read: Sessions for widgets" ON activity_sessions IS 
  'Allows anonymous users to read sessions for availability in widgets';
