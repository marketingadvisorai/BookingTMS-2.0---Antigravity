-- Initial Schema Reconstruction
-- Based on existing schema from project ohfjkcajnqvethmrpdwc

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    website TEXT,
    phone VARCHAR(255),
    owner_name VARCHAR(255),
    owner_email VARCHAR(255),
    stripe_account_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_subscription_status VARCHAR(255),
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    plan_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Additional fields found in schema
    stripe_connect_enabled BOOLEAN DEFAULT FALSE,
    stripe_charges_enabled BOOLEAN DEFAULT FALSE,
    stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
    stripe_details_submitted BOOLEAN DEFAULT FALSE,
    stripe_business_name VARCHAR(255),
    stripe_business_url TEXT,
    stripe_support_email VARCHAR(255),
    application_fee_fixed NUMERIC,
    subscription_mrr NUMERIC,
    stripe_onboarding_link_expires_at TIMESTAMPTZ,
    stripe_onboarding_completed_at TIMESTAMPTZ,
    stripe_risk_level VARCHAR(255),
    stripe_verification_status VARCHAR(255),
    stripe_disabled_reason TEXT,
    display_name VARCHAR(255),
    company_name VARCHAR(255)
);

-- Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    zip VARCHAR(255),
    country VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255),
    capacity INTEGER,
    timezone VARCHAR(255) DEFAULT 'UTC',
    status VARCHAR(255) DEFAULT 'active',
    settings JSONB DEFAULT '{}'::JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    embed_key VARCHAR(255) NOT NULL DEFAULT uuid_generate_v4(),
    primary_color VARCHAR(255),
    base_url TEXT,
    organization_name VARCHAR(255),
    company_name VARCHAR(255),
    deleted_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    staff_count INTEGER DEFAULT 0,
    location_count INTEGER DEFAULT 0,
    
    UNIQUE(organization_id, slug)
);

-- Games (Activities) Table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    duration INTEGER NOT NULL, -- in minutes
    min_players INTEGER DEFAULT 1,
    max_players INTEGER,
    price NUMERIC(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional fields
    settings JSONB DEFAULT '{}'::JSONB,
    difficulty VARCHAR(50),
    video_url TEXT,
    age_guideline VARCHAR(50),
    setup_time INTEGER DEFAULT 0,
    cleanup_time INTEGER DEFAULT 0,
    booking_cutoff_minutes INTEGER DEFAULT 0,
    cancellation_policy TEXT,
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    stripe_checkout_url TEXT,
    stripe_sync_status VARCHAR(50),
    stripe_last_sync TIMESTAMPTZ,
    stripe_metadata JSONB,
    price_lookup_key VARCHAR(255),
    active_price_id VARCHAR(255),
    
    -- Denormalized fields
    venue_name VARCHAR(255),
    organization_name VARCHAR(255)
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(255),
    zip VARCHAR(255),
    country VARCHAR(255),
    total_bookings INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(255) DEFAULT 'active',
    notes TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    stripe_customer_id VARCHAR(255),
    preferred_venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    stripe_account_id VARCHAR(255),
    created_via VARCHAR(255)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    game_id UUID REFERENCES games(id) ON DELETE SET NULL, -- Will be renamed to activity_id later
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME,
    end_time TIME,
    players INTEGER,
    status VARCHAR(255) DEFAULT 'pending',
    total_amount NUMERIC(10, 2),
    deposit_amount NUMERIC(10, 2),
    payment_status VARCHAR(255) DEFAULT 'unpaid',
    payment_method VARCHAR(255),
    transaction_id VARCHAR(255),
    notes TEXT,
    customer_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional fields
    check_in_status VARCHAR(50) DEFAULT 'pending',
    checked_in_at TIMESTAMPTZ,
    waiver_status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'direct',
    confirmation_code VARCHAR(50),
    calendar_event_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_checkout_session_id VARCHAR(255),
    refund_status VARCHAR(50),
    refund_amount NUMERIC(10, 2),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID,
    
    -- Denormalized fields (will be populated by triggers later)
    organization_name VARCHAR(255),
    venue_name VARCHAR(255),
    game_name VARCHAR(255)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_org ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(organization_id);
