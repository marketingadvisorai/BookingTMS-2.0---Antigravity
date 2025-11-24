
-- Create user_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'manager', 'staff', 'member', 'system-admin');
    ELSE
        -- Add system-admin if missing
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'system-admin') THEN
            ALTER TYPE user_role ADD VALUE 'system-admin';
        END IF;
    END IF;
END$$;
