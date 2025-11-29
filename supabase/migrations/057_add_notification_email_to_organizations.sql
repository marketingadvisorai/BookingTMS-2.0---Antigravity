-- Migration: Add notification_email to organizations
-- Date: 2025-11-30
-- Purpose: Store admin notification email for booking alerts

-- Add notification_email column to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Add owner_email column if not exists (for fallback notifications)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.organizations.notification_email IS 'Email address for booking notifications';
COMMENT ON COLUMN public.organizations.owner_email IS 'Owner email for fallback notifications';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_notification_email 
ON public.organizations(notification_email) 
WHERE notification_email IS NOT NULL;
