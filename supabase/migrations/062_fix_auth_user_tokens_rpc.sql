-- =====================================================
-- Migration: 062_fix_auth_user_tokens_rpc.sql
-- Description: Create RPC function to fix NULL token fields in auth.users
--              This prevents "Database error querying schema" on login
-- Created: 2025-11-30
-- 
-- Problem: Users created via admin API may have NULL token fields which
--          causes Supabase Auth's internal scanner to crash with:
--          "sql: Scan error on column index X: converting NULL to string is unsupported"
-- 
-- Solution: RPC function that sets all nullable string fields to empty strings
-- =====================================================

-- Create function to fix auth.users token fields for a specific user
-- This is called after user creation via Edge Functions
CREATE OR REPLACE FUNCTION fix_auth_user_tokens(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  UPDATE auth.users
  SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change = COALESCE(email_change, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '')
  WHERE id = user_id;
END;
$$;

-- Grant execute to authenticated users (Edge Functions run as authenticated)
GRANT EXECUTE ON FUNCTION fix_auth_user_tokens(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION fix_auth_user_tokens(UUID) TO service_role;

-- Also fix all existing users that may have NULL tokens
-- This ensures any previously created users are fixed
DO $$
BEGIN
  UPDATE auth.users
  SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change = COALESCE(email_change, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '');
  
  RAISE NOTICE 'Fixed NULL token fields in auth.users';
END;
$$;

-- Create trigger to auto-fix tokens on new user creation
-- This ensures the trigger on auth.users properly initializes all fields
CREATE OR REPLACE FUNCTION auth.fix_new_user_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  -- Ensure all token fields are empty strings, not NULL
  NEW.confirmation_token := COALESCE(NEW.confirmation_token, '');
  NEW.recovery_token := COALESCE(NEW.recovery_token, '');
  NEW.email_change_token_new := COALESCE(NEW.email_change_token_new, '');
  NEW.email_change_token_current := COALESCE(NEW.email_change_token_current, '');
  NEW.email_change := COALESCE(NEW.email_change, '');
  NEW.phone_change := COALESCE(NEW.phone_change, '');
  NEW.phone_change_token := COALESCE(NEW.phone_change_token, '');
  NEW.reauthentication_token := COALESCE(NEW.reauthentication_token, '');
  
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS fix_user_tokens_trigger ON auth.users;
CREATE TRIGGER fix_user_tokens_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auth.fix_new_user_tokens();

COMMENT ON FUNCTION fix_auth_user_tokens(UUID) IS 
  'Fixes NULL token fields in auth.users to prevent Supabase Auth scan errors';

COMMENT ON FUNCTION auth.fix_new_user_tokens() IS 
  'Trigger function to ensure new users have empty string tokens instead of NULL';
