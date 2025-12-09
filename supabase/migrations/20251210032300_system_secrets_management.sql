-- ============================================================================
-- System Secrets Management
-- SECURITY: Encrypted secrets storage with system-admin only access
-- ============================================================================

-- Create system_secrets table for encrypted secret storage
CREATE TABLE IF NOT EXISTS system_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Secret identification
    secret_key TEXT NOT NULL UNIQUE,
    secret_category TEXT NOT NULL DEFAULT 'general',
    
    -- Encrypted value (use pgcrypto for encryption)
    encrypted_value TEXT NOT NULL,
    
    -- Metadata (never contains actual secret)
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    is_configured BOOLEAN DEFAULT false,
    last_validated_at TIMESTAMPTZ,
    validation_status TEXT DEFAULT 'unknown', -- 'valid', 'invalid', 'unknown'
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create secret access log for audit
CREATE TABLE IF NOT EXISTS secret_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secret_key TEXT NOT NULL,
    action TEXT NOT NULL, -- 'read', 'write', 'delete', 'validate'
    performed_by UUID REFERENCES auth.users(id),
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_system_secrets_category ON system_secrets(secret_category);
CREATE INDEX IF NOT EXISTS idx_system_secrets_key ON system_secrets(secret_key);
CREATE INDEX IF NOT EXISTS idx_secret_access_logs_key ON secret_access_logs(secret_key);
CREATE INDEX IF NOT EXISTS idx_secret_access_logs_performed_by ON secret_access_logs(performed_by);

-- Enable RLS
ALTER TABLE system_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_access_logs ENABLE ROW LEVEL SECURITY;

-- SECURITY: Only system-admin can access secrets table
-- Using service role key for Edge Functions (bypasses RLS)
CREATE POLICY "system_admin_only_secrets"
    ON system_secrets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'system-admin'
        )
    );

CREATE POLICY "system_admin_only_secret_logs"
    ON secret_access_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'system-admin'
        )
    );

-- Function to check if user is system admin
CREATE OR REPLACE FUNCTION is_system_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role = 'system-admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely get secret (returns masked value for UI)
CREATE OR REPLACE FUNCTION get_secret_masked(p_secret_key TEXT)
RETURNS TABLE (
    secret_key TEXT,
    secret_category TEXT,
    description TEXT,
    is_configured BOOLEAN,
    is_required BOOLEAN,
    validation_status TEXT,
    masked_value TEXT,
    last_validated_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Check if caller is system admin
    IF NOT is_system_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: system-admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        s.secret_key,
        s.secret_category,
        s.description,
        s.is_configured,
        s.is_required,
        s.validation_status,
        CASE 
            WHEN s.encrypted_value IS NOT NULL AND LENGTH(s.encrypted_value) > 0 
            THEN '••••••••' || RIGHT(s.encrypted_value, 4)
            ELSE NULL
        END AS masked_value,
        s.last_validated_at,
        s.updated_at
    FROM system_secrets s
    WHERE s.secret_key = p_secret_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to list all secrets (masked for UI)
CREATE OR REPLACE FUNCTION list_secrets_masked(p_category TEXT DEFAULT NULL)
RETURNS TABLE (
    secret_key TEXT,
    secret_category TEXT,
    description TEXT,
    is_configured BOOLEAN,
    is_required BOOLEAN,
    validation_status TEXT,
    masked_value TEXT,
    last_validated_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Check if caller is system admin
    IF NOT is_system_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied: system-admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        s.secret_key,
        s.secret_category,
        s.description,
        s.is_configured,
        s.is_required,
        s.validation_status,
        CASE 
            WHEN s.encrypted_value IS NOT NULL AND LENGTH(s.encrypted_value) > 0 
            THEN '••••••••' || RIGHT(s.encrypted_value, 4)
            ELSE NULL
        END AS masked_value,
        s.last_validated_at,
        s.updated_at
    FROM system_secrets s
    WHERE p_category IS NULL OR s.secret_category = p_category
    ORDER BY s.secret_category, s.secret_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default secret placeholders
INSERT INTO system_secrets (secret_key, secret_category, description, is_required, is_configured, encrypted_value) VALUES
    ('STRIPE_SECRET_KEY', 'stripe', 'Stripe Secret API Key', true, false, ''),
    ('STRIPE_PUBLISHABLE_KEY', 'stripe', 'Stripe Publishable Key (safe for frontend)', true, false, ''),
    ('STRIPE_WEBHOOK_SECRET', 'stripe', 'Stripe Webhook Signing Secret', true, false, ''),
    ('OPENAI_API_KEY', 'llm', 'OpenAI API Key', false, false, ''),
    ('ANTHROPIC_API_KEY', 'llm', 'Anthropic Claude API Key', false, false, ''),
    ('GOOGLE_AI_API_KEY', 'llm', 'Google AI (Gemini) API Key', false, false, ''),
    ('SENDGRID_API_KEY', 'email', 'SendGrid Email API Key', false, false, ''),
    ('TWILIO_ACCOUNT_SID', 'sms', 'Twilio Account SID', false, false, ''),
    ('TWILIO_AUTH_TOKEN', 'sms', 'Twilio Auth Token', false, false, ''),
    ('TWILIO_PHONE_NUMBER', 'sms', 'Twilio Phone Number', false, false, '')
ON CONFLICT (secret_key) DO NOTHING;

COMMENT ON TABLE system_secrets IS 'Encrypted storage for system secrets. Only accessible by system-admin role.';
COMMENT ON TABLE secret_access_logs IS 'Audit log for all secret access operations.';
