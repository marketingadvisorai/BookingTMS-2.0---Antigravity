-- Migration: Fix organizations schema
-- Date: 2025-11-27
-- Description: Add missing columns to organizations table

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city varchar(100),
ADD COLUMN IF NOT EXISTS state varchar(100),
ADD COLUMN IF NOT EXISTS zip varchar(20),
ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS application_fee_percentage numeric(5,2) DEFAULT 0.75;

-- Migrate is_active to status
UPDATE organizations SET status = CASE WHEN is_active = true THEN 'active' ELSE 'inactive' END WHERE status IS NULL;
