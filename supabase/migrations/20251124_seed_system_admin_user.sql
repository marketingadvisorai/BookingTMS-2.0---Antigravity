-- Seed System Admin User
-- Description: Inserts a system admin user into auth.users for Real Supabase Auth

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := uuid_generate_v4();
BEGIN
  -- Only insert if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'systemadmin@bookingtms.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'systemadmin@bookingtms.com',
      crypt('demo123', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "system_admin", "full_name": "System Administrator"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert into public.users
    INSERT INTO public.users (id, email, full_name, role, is_active)
    VALUES (new_user_id, 'systemadmin@bookingtms.com', 'System Administrator', 'system-admin', true);
    
  ELSE
    -- Update existing user metadata if needed
    UPDATE auth.users 
    SET raw_user_meta_data = '{"role": "system_admin", "full_name": "System Administrator"}'
    WHERE email = 'systemadmin@bookingtms.com';
    
    -- Ensure public user exists
    INSERT INTO public.users (id, email, full_name, role, is_active)
    SELECT id, email, 'System Administrator', 'system-admin', true
    FROM auth.users 
    WHERE email = 'systemadmin@bookingtms.com'
    ON CONFLICT (id) DO UPDATE SET role = 'system-admin';
  END IF;
END $$;
