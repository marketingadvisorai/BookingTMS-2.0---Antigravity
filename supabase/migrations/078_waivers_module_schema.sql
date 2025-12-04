-- ============================================================================
-- Migration: Waivers Module Schema Consolidation
-- Version: 1.0.0
-- Date: 2025-12-04
-- Description: Consolidates waiver tables, adds proper RLS, and creates helper functions
-- ============================================================================

-- ============================================================================
-- 1. WAIVER TEMPLATES TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS waiver_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'liability' CHECK (type IN ('liability', 'minor', 'photo', 'medical', 'health', 'custom')),
  content TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  required_fields JSONB DEFAULT '["Full Name", "Email", "Signature"]'::JSONB,
  assigned_activities JSONB DEFAULT '[]'::JSONB,
  usage_count INTEGER DEFAULT 0,
  qr_code_enabled BOOLEAN DEFAULT true,
  qr_code_settings JSONB DEFAULT '{"includeInEmail": true, "includeBookingLink": true, "customMessage": ""}'::JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waiver_templates' AND column_name = 'qr_code_enabled') THEN
    ALTER TABLE waiver_templates ADD COLUMN qr_code_enabled BOOLEAN DEFAULT true;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'waiver_templates' AND column_name = 'qr_code_settings') THEN
    ALTER TABLE waiver_templates ADD COLUMN qr_code_settings JSONB DEFAULT '{"includeInEmail": true, "includeBookingLink": true, "customMessage": ""}'::JSONB;
  END IF;
END $$;

-- Indexes for waiver_templates
CREATE INDEX IF NOT EXISTS idx_waiver_templates_org ON waiver_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_waiver_templates_status ON waiver_templates(status);
CREATE INDEX IF NOT EXISTS idx_waiver_templates_type ON waiver_templates(type);

-- ============================================================================
-- 2. SIGNED WAIVERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS signed_waivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_code VARCHAR(20) UNIQUE,
  template_id UUID NOT NULL REFERENCES waiver_templates(id) ON DELETE RESTRICT,
  template_name VARCHAR(255),
  template_type VARCHAR(50),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Participant info
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255),
  participant_phone VARCHAR(50),
  participant_dob DATE,
  participant_age INTEGER,
  is_minor BOOLEAN DEFAULT false,
  
  -- Guardian info (for minors)
  guardian_name VARCHAR(255),
  guardian_email VARCHAR(255),
  guardian_phone VARCHAR(50),
  guardian_signature TEXT,
  guardian_signed_at TIMESTAMPTZ,
  
  -- Signature
  signature_type VARCHAR(20) DEFAULT 'electronic' CHECK (signature_type IN ('electronic', 'digital')),
  signature_data TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  signed_ip INET,
  signed_user_agent TEXT,
  
  -- Waiver content
  filled_content TEXT,
  form_data JSONB DEFAULT '{}'::JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'signed' CHECK (status IN ('signed', 'pending', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ,
  check_in_count INTEGER DEFAULT 0,
  last_check_in TIMESTAMPTZ,
  
  -- Activity info (denormalized)
  activity_name VARCHAR(255),
  venue_name VARCHAR(255),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for signed_waivers
CREATE INDEX IF NOT EXISTS idx_signed_waivers_code ON signed_waivers(waiver_code);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_template ON signed_waivers(template_id);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_booking ON signed_waivers(booking_id);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_customer ON signed_waivers(customer_id);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_status ON signed_waivers(status);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_signed_at ON signed_waivers(signed_at);
CREATE INDEX IF NOT EXISTS idx_signed_waivers_email ON signed_waivers(participant_email);

-- ============================================================================
-- 3. WAIVER CHECK-INS TABLE (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS waiver_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waiver_id UUID NOT NULL REFERENCES signed_waivers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  checked_in_by UUID REFERENCES auth.users(id),
  check_in_method VARCHAR(20) CHECK (check_in_method IN ('qr_scan', 'manual', 'camera', 'upload')),
  verified BOOLEAN DEFAULT true,
  verification_notes TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_waiver_check_ins_waiver ON waiver_check_ins(waiver_id);
CREATE INDEX IF NOT EXISTS idx_waiver_check_ins_date ON waiver_check_ins(checked_in_at);

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Generate unique waiver code
CREATE OR REPLACE FUNCTION generate_waiver_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'WV-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    SELECT EXISTS(SELECT 1 FROM signed_waivers WHERE waiver_code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate waiver code on insert
CREATE OR REPLACE FUNCTION set_waiver_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.waiver_code IS NULL OR NEW.waiver_code = '' THEN
    NEW.waiver_code := generate_waiver_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_set_waiver_code ON signed_waivers;

-- Create trigger
CREATE TRIGGER trigger_set_waiver_code
  BEFORE INSERT ON signed_waivers
  FOR EACH ROW
  EXECUTE FUNCTION set_waiver_code();

-- Increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE waiver_templates
  SET usage_count = COALESCE(usage_count, 0) + 1,
      updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

ALTER TABLE waiver_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_check_ins ENABLE ROW LEVEL SECURITY;

-- Helper function for safe organization ID lookup
CREATE OR REPLACE FUNCTION get_waiver_org_id_safe()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.users
  WHERE id = auth.uid();
  RETURN org_id;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION is_waiver_platform_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  RETURN user_role = 'system-admin';
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "waiver_templates_select" ON waiver_templates;
DROP POLICY IF EXISTS "waiver_templates_insert" ON waiver_templates;
DROP POLICY IF EXISTS "waiver_templates_update" ON waiver_templates;
DROP POLICY IF EXISTS "waiver_templates_delete" ON waiver_templates;
DROP POLICY IF EXISTS "signed_waivers_select" ON signed_waivers;
DROP POLICY IF EXISTS "signed_waivers_insert_anon" ON signed_waivers;
DROP POLICY IF EXISTS "signed_waivers_insert_auth" ON signed_waivers;
DROP POLICY IF EXISTS "signed_waivers_update" ON signed_waivers;
DROP POLICY IF EXISTS "signed_waivers_delete" ON signed_waivers;

-- Waiver Templates Policies
CREATE POLICY "waiver_templates_select" ON waiver_templates
  FOR SELECT TO authenticated
  USING (
    is_waiver_platform_admin()
    OR organization_id = get_waiver_org_id_safe()
  );

CREATE POLICY "waiver_templates_insert" ON waiver_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    is_waiver_platform_admin()
    OR organization_id = get_waiver_org_id_safe()
  );

CREATE POLICY "waiver_templates_update" ON waiver_templates
  FOR UPDATE TO authenticated
  USING (
    is_waiver_platform_admin()
    OR organization_id = get_waiver_org_id_safe()
  );

CREATE POLICY "waiver_templates_delete" ON waiver_templates
  FOR DELETE TO authenticated
  USING (
    is_waiver_platform_admin()
    OR organization_id = get_waiver_org_id_safe()
  );

-- Signed Waivers Policies
CREATE POLICY "signed_waivers_select" ON signed_waivers
  FOR SELECT
  USING (true); -- Public read for QR verification

CREATE POLICY "signed_waivers_insert_anon" ON signed_waivers
  FOR INSERT TO anon
  WITH CHECK (true); -- Allow anonymous waiver submission

CREATE POLICY "signed_waivers_insert_auth" ON signed_waivers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "signed_waivers_update" ON signed_waivers
  FOR UPDATE TO authenticated
  USING (true); -- Authenticated users can update

CREATE POLICY "signed_waivers_delete" ON signed_waivers
  FOR DELETE TO authenticated
  USING (
    is_waiver_platform_admin()
    OR template_id IN (
      SELECT id FROM waiver_templates 
      WHERE organization_id = get_waiver_org_id_safe()
    )
  );

-- Check-ins Policies
DROP POLICY IF EXISTS "waiver_check_ins_select" ON waiver_check_ins;
DROP POLICY IF EXISTS "waiver_check_ins_insert" ON waiver_check_ins;

CREATE POLICY "waiver_check_ins_select" ON waiver_check_ins
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "waiver_check_ins_insert" ON waiver_check_ins
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 6. GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON waiver_templates TO authenticated;
GRANT ALL ON waiver_templates TO authenticated;
GRANT SELECT, INSERT ON signed_waivers TO anon;
GRANT ALL ON signed_waivers TO authenticated;
GRANT ALL ON waiver_check_ins TO authenticated;
GRANT EXECUTE ON FUNCTION generate_waiver_code() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_template_usage(UUID) TO authenticated;

-- ============================================================================
-- 7. REAL-TIME
-- ============================================================================

DO $$
BEGIN
  -- Enable real-time for waiver tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'waiver_templates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE waiver_templates;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'signed_waivers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE signed_waivers;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not add tables to realtime publication: %', SQLERRM;
END $$;

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================

COMMENT ON TABLE waiver_templates IS 'Waiver templates with configurable fields and QR code support';
COMMENT ON TABLE signed_waivers IS 'Signed waiver records linked to bookings and customers';
COMMENT ON TABLE waiver_check_ins IS 'Audit trail for waiver check-ins at venues';
COMMENT ON FUNCTION generate_waiver_code() IS 'Generates unique WV-XXXXXX waiver codes';
COMMENT ON FUNCTION increment_template_usage(UUID) IS 'Increments usage count for a template';
