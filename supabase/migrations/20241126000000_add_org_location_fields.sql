-- Add location fields to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(255),
ADD COLUMN IF NOT EXISTS state VARCHAR(255),
ADD COLUMN IF NOT EXISTS zip VARCHAR(255),
ADD COLUMN IF NOT EXISTS country VARCHAR(255);

-- Ensure metadata column exists (it should based on schema, but just in case)
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;
