-- Migration: Fix user trigger and constraints
-- Date: 2025-11-27
-- Description: Update handle_new_user trigger and add org-admin role

-- Add org-admin to allowed roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_platform_team_role;
ALTER TABLE public.users ADD CONSTRAINT check_platform_team_role CHECK (
  ((is_platform_team = true) AND (role IN ('system-admin', 'super-admin'))) OR
  ((is_platform_team = false) AND (role IN ('super-admin', 'admin', 'org-admin', 'manager', 'staff', 'member')))
);

-- Update handle_new_user trigger to properly set organization_id and is_platform_team
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
  v_org_id uuid;
  v_is_platform_team boolean;
BEGIN
  -- Get role from metadata, default to 'staff'
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');
  
  -- Get organization_id from metadata
  v_org_id := (NEW.raw_user_meta_data->>'organization_id')::uuid;
  
  -- Determine if platform team member (only system-admin and super-admin without org)
  v_is_platform_team := v_role IN ('system-admin') OR (v_role = 'super-admin' AND v_org_id IS NULL);
  
  -- If not platform team and no org_id, skip insert (constraint would fail)
  IF v_is_platform_team OR v_org_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, full_name, role, organization_id, is_platform_team, is_active)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
      v_role,
      v_org_id,
      v_is_platform_team,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      organization_id = COALESCE(EXCLUDED.organization_id, public.users.organization_id),
      is_platform_team = EXCLUDED.is_platform_team,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;
