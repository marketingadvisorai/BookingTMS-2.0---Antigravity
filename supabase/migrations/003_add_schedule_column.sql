-- Add schedule column to activities table
-- Missed during initial schema reconstruction

ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::JSONB;
