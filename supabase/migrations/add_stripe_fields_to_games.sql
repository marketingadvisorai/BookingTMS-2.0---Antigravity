-- Migration: Add Stripe Prices and Checkout URL to Games Table
-- Ensures stripe_prices and stripe_checkout_url columns exist for persistent Stripe configuration

-- Add stripe_prices column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='games' AND column_name='stripe_prices'
    ) THEN
        ALTER TABLE games 
        ADD COLUMN stripe_prices JSONB DEFAULT NULL;
        
        COMMENT ON COLUMN games.stripe_prices IS 'Array of all Stripe prices for this game (stored as JSONB)';
    END IF;
END $$;

-- Add stripe_checkout_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='games' AND column_name='stripe_checkout_url'
    ) THEN
        ALTER TABLE games 
        ADD COLUMN stripe_checkout_url TEXT DEFAULT NULL;
        
        COMMENT ON COLUMN games.stripe_checkout_url IS 'Custom Stripe checkout URL for direct payment links';
    END IF;
END $$;

-- Ensure stripe_product_id column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='games' AND column_name='stripe_product_id'
    ) THEN
        ALTER TABLE games 
        ADD COLUMN stripe_product_id TEXT DEFAULT NULL;
        
        COMMENT ON COLUMN games.stripe_product_id IS 'Stripe Product ID for payment processing';
    END IF;
END $$;

-- Ensure stripe_price_id column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='games' AND column_name='stripe_price_id'
    ) THEN
        ALTER TABLE games 
        ADD COLUMN stripe_price_id TEXT DEFAULT NULL;
        
        COMMENT ON COLUMN games.stripe_price_id IS 'Primary Stripe Price ID for this game';
    END IF;
END $$;

-- Ensure stripe_sync_status column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='games' AND column_name='stripe_sync_status'
    ) THEN
        ALTER TABLE games 
        ADD COLUMN stripe_sync_status TEXT DEFAULT 'not_synced';
        
        COMMENT ON COLUMN games.stripe_sync_status IS 'Sync status: not_synced, pending, synced, error';
    END IF;
END $$;

-- Ensure stripe_last_sync column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='games' AND column_name='stripe_last_sync'
    ) THEN
        ALTER TABLE games 
        ADD COLUMN stripe_last_sync TIMESTAMPTZ DEFAULT NULL;
        
        COMMENT ON COLUMN games.stripe_last_sync IS 'Last time Stripe product was synced';
    END IF;
END $$;

-- Create index for faster Stripe product lookups
CREATE INDEX IF NOT EXISTS idx_games_stripe_product_id ON games(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_stripe_sync_status ON games(stripe_sync_status) WHERE stripe_sync_status IS NOT NULL;
