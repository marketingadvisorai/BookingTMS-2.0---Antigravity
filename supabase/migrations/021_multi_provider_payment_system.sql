/**
 * Multi-Provider Payment System Migration
 * 
 * Creates a flexible payment configuration system that supports multiple providers.
 * This allows games to have Stripe, PayPal, 2Checkout, and other payment providers.
 * 
 * Features:
 * - Support for multiple payment providers per game
 * - Primary and fallback provider configuration
 * - Provider-specific metadata storage
 * - Status tracking and sync timestamps
 * - RLS policies for secure access
 */

-- Create payment_configurations table
CREATE TABLE IF NOT EXISTS payment_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- Provider information
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('stripe', 'paypal', '2checkout', 'square', 'razorpay')),
  product_id VARCHAR(255), -- Provider's product ID
  price_id VARCHAR(255), -- Provider's price ID
  checkout_url TEXT, -- Direct checkout URL
  
  -- Pricing information (JSON array of price objects)
  prices JSONB DEFAULT '[]'::jsonb,
  
  -- Provider-specific metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status and configuration
  status VARCHAR(50) DEFAULT 'not_configured' CHECK (status IN ('not_configured', 'configured', 'active', 'inactive', 'error')),
  enabled BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  
  -- Sync tracking
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(game_id, provider),
  CHECK (
    -- At least one of product_id or checkout_url must be present if status is configured/active
    (status IN ('not_configured', 'inactive', 'error')) OR 
    (product_id IS NOT NULL OR checkout_url IS NOT NULL)
  )
);

-- Add comment
COMMENT ON TABLE payment_configurations IS 'Multi-provider payment configurations for games';
COMMENT ON COLUMN payment_configurations.provider IS 'Payment provider type (stripe, paypal, 2checkout, etc.)';
COMMENT ON COLUMN payment_configurations.prices IS 'JSON array of price objects from the provider';
COMMENT ON COLUMN payment_configurations.is_primary IS 'Whether this is the primary payment provider for the game';
COMMENT ON COLUMN payment_configurations.last_sync_at IS 'Last time configuration was synced with provider API';

-- Create indexes for faster queries
CREATE INDEX idx_payment_configs_game_id ON payment_configurations(game_id);
CREATE INDEX idx_payment_configs_provider ON payment_configurations(provider);
CREATE INDEX idx_payment_configs_enabled ON payment_configurations(enabled);
CREATE INDEX idx_payment_configs_status ON payment_configurations(status);
CREATE INDEX idx_payment_configs_primary ON payment_configurations(game_id, is_primary) WHERE is_primary = true;

-- Add primary_payment_provider column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS primary_payment_provider VARCHAR(50) DEFAULT 'stripe';

-- Create function to ensure only one primary provider per game
CREATE OR REPLACE FUNCTION ensure_single_primary_provider()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this as primary, unset all other primary providers for this game
  IF NEW.is_primary = true THEN
    UPDATE payment_configurations
    SET is_primary = false
    WHERE game_id = NEW.game_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for primary provider enforcement
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_provider ON payment_configurations;
CREATE TRIGGER trigger_ensure_single_primary_provider
  BEFORE INSERT OR UPDATE ON payment_configurations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_provider();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_payment_config_timestamp ON payment_configurations;
CREATE TRIGGER trigger_update_payment_config_timestamp
  BEFORE UPDATE ON payment_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_config_updated_at();

-- Migrate existing Stripe data from games table
INSERT INTO payment_configurations (
  game_id,
  provider,
  product_id,
  price_id,
  checkout_url,
  prices,
  status,
  enabled,
  is_primary,
  last_sync_at,
  created_at,
  updated_at
)
SELECT 
  id as game_id,
  'stripe' as provider,
  stripe_product_id as product_id,
  stripe_price_id as price_id,
  stripe_checkout_url as checkout_url,
  COALESCE(stripe_prices, '[]'::jsonb) as prices,
  CASE 
    WHEN stripe_product_id IS NOT NULL THEN 'configured'::VARCHAR
    ELSE 'not_configured'::VARCHAR
  END as status,
  true as enabled,
  true as is_primary,
  stripe_last_sync::TIMESTAMP WITH TIME ZONE as last_sync_at,
  created_at,
  updated_at
FROM games
WHERE stripe_product_id IS NOT NULL
ON CONFLICT (game_id, provider) DO UPDATE
SET 
  product_id = EXCLUDED.product_id,
  price_id = EXCLUDED.price_id,
  checkout_url = EXCLUDED.checkout_url,
  prices = EXCLUDED.prices,
  status = EXCLUDED.status,
  last_sync_at = EXCLUDED.last_sync_at,
  updated_at = NOW();

-- Enable RLS
ALTER TABLE payment_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view payment configurations for games in their organization
CREATE POLICY "Users can view payment configurations for their organization's games"
  ON payment_configurations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = payment_configurations.game_id
        AND games.organization_id IN (
          SELECT organization_id FROM user_organizations
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Users can insert payment configurations for games in their organization
CREATE POLICY "Users can insert payment configurations for their organization's games"
  ON payment_configurations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = payment_configurations.game_id
        AND games.organization_id IN (
          SELECT organization_id FROM user_organizations
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Users can update payment configurations for games in their organization
CREATE POLICY "Users can update payment configurations for their organization's games"
  ON payment_configurations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = payment_configurations.game_id
        AND games.organization_id IN (
          SELECT organization_id FROM user_organizations
          WHERE user_id = auth.uid()
        )
    )
  );

-- Policy: Users can delete payment configurations for games in their organization
CREATE POLICY "Users can delete payment configurations for their organization's games"
  ON payment_configurations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = payment_configurations.game_id
        AND games.organization_id IN (
          SELECT organization_id FROM user_organizations
          WHERE user_id = auth.uid()
        )
    )
  );

-- Create helper function to get primary payment provider for a game
CREATE OR REPLACE FUNCTION get_primary_payment_provider(p_game_id UUID)
RETURNS TABLE (
  provider VARCHAR(50),
  product_id VARCHAR(255),
  price_id VARCHAR(255),
  checkout_url TEXT,
  status VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.provider,
    pc.product_id,
    pc.price_id,
    pc.checkout_url,
    pc.status
  FROM payment_configurations pc
  WHERE pc.game_id = p_game_id
    AND pc.is_primary = true
    AND pc.enabled = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get all payment providers for a game
CREATE OR REPLACE FUNCTION get_game_payment_providers(p_game_id UUID)
RETURNS TABLE (
  id UUID,
  provider VARCHAR(50),
  product_id VARCHAR(255),
  price_id VARCHAR(255),
  checkout_url TEXT,
  prices JSONB,
  status VARCHAR(50),
  enabled BOOLEAN,
  is_primary BOOLEAN,
  last_sync_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.provider,
    pc.product_id,
    pc.price_id,
    pc.checkout_url,
    pc.prices,
    pc.status,
    pc.enabled,
    pc.is_primary,
    pc.last_sync_at
  FROM payment_configurations pc
  WHERE pc.game_id = p_game_id
  ORDER BY pc.is_primary DESC, pc.provider ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION get_primary_payment_provider(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_payment_providers(UUID) TO authenticated;

-- Create view for easy querying of game payment configurations
CREATE OR REPLACE VIEW game_payment_summary AS
SELECT 
  g.id as game_id,
  g.name as game_name,
  g.price as game_price,
  g.primary_payment_provider,
  COUNT(pc.id) as total_providers,
  COUNT(pc.id) FILTER (WHERE pc.enabled = true) as enabled_providers,
  COUNT(pc.id) FILTER (WHERE pc.status = 'configured' OR pc.status = 'active') as configured_providers,
  json_agg(
    json_build_object(
      'provider', pc.provider,
      'status', pc.status,
      'enabled', pc.enabled,
      'is_primary', pc.is_primary,
      'product_id', pc.product_id,
      'price_id', pc.price_id
    ) ORDER BY pc.is_primary DESC, pc.provider ASC
  ) FILTER (WHERE pc.id IS NOT NULL) as providers
FROM games g
LEFT JOIN payment_configurations pc ON g.id = pc.game_id
GROUP BY g.id, g.name, g.price, g.primary_payment_provider;

-- Grant select on view
GRANT SELECT ON game_payment_summary TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION get_primary_payment_provider IS 'Get the primary payment provider configuration for a game';
COMMENT ON FUNCTION get_game_payment_providers IS 'Get all payment provider configurations for a game';
COMMENT ON VIEW game_payment_summary IS 'Summary view of payment configurations per game';
