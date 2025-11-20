-- BookingTMS Database Schema
-- Version: 1.0.0
-- Description: Initial database schema for BookingTMS application
-- This migration creates all necessary tables, indexes, and Row-Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('super-admin', 'admin', 'manager', 'staff');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed', 'disputed', 'partially_refunded');
CREATE TYPE customer_segment AS ENUM ('vip', 'regular', 'new', 'inactive');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE organization_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE notification_type AS ENUM ('booking', 'payment', 'cancellation', 'message', 'staff', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan organization_plan NOT NULL DEFAULT 'free',
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- =====================================================
-- USERS TABLE (extends auth.users)
-- =====================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- GAMES TABLE
-- =====================================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  duration_minutes INTEGER NOT NULL,
  min_players INTEGER NOT NULL DEFAULT 2,
  max_players INTEGER NOT NULL DEFAULT 8,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_games_organization ON games(organization_id);
CREATE INDEX idx_games_is_active ON games(is_active);
CREATE INDEX idx_games_difficulty ON games(difficulty);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  stripe_customer_id VARCHAR(255) UNIQUE,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  segment customer_segment NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Indexes
CREATE INDEX idx_customers_organization ON customers(organization_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_customers_stripe ON customers(stripe_customer_id);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_intent_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_bookings_organization ON bookings(organization_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_game ON bookings(game_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_composite ON bookings(organization_id, booking_date, status);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_charge_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method_type VARCHAR(50),
  last_4 VARCHAR(4),
  card_brand VARCHAR(20),
  receipt_url TEXT,
  refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  refund_reason TEXT,
  failure_code VARCHAR(50),
  failure_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_composite ON notifications(user_id, is_read, created_at);

-- =====================================================
-- NOTIFICATION SETTINGS TABLE
-- =====================================================

CREATE TABLE notification_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_volume INTEGER NOT NULL DEFAULT 75,
  sound_for_bookings BOOLEAN NOT NULL DEFAULT true,
  sound_for_payments BOOLEAN NOT NULL DEFAULT true,
  sound_for_cancellations BOOLEAN NOT NULL DEFAULT true,
  sound_for_messages BOOLEAN NOT NULL DEFAULT true,
  desktop_enabled BOOLEAN NOT NULL DEFAULT true,
  desktop_for_bookings BOOLEAN NOT NULL DEFAULT true,
  desktop_for_payments BOOLEAN NOT NULL DEFAULT true,
  desktop_for_cancellations BOOLEAN NOT NULL DEFAULT true,
  desktop_for_messages BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  sms_phone_number VARCHAR(20),
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME NOT NULL DEFAULT '22:00',
  quiet_hours_end TIME NOT NULL DEFAULT '08:00',
  show_in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STRIPE WEBHOOK EVENTS TABLE
-- =====================================================

CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON stripe_webhook_events(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create notification settings for new users
CREATE OR REPLACE FUNCTION create_notification_settings_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_notification_settings
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_settings_for_user();

-- Function to update customer stats after booking
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.payment_status = 'paid') OR 
     (TG_OP = 'UPDATE' AND OLD.payment_status != 'paid' AND NEW.payment_status = 'paid') THEN
    UPDATE customers
    SET 
      total_bookings = total_bookings + 1,
      total_spent = total_spent + NEW.final_amount,
      segment = CASE
        WHEN total_spent + NEW.final_amount > 1000 THEN 'vip'::customer_segment
        WHEN total_bookings + 1 > 5 THEN 'regular'::customer_segment
        ELSE segment
      END
    WHERE id = NEW.customer_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' AND NEW.payment_status = 'refunded') THEN
    UPDATE customers
    SET 
      total_bookings = GREATEST(total_bookings - 1, 0),
      total_spent = GREATEST(total_spent - OLD.final_amount, 0)
    WHERE id = OLD.customer_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_booking_stats
  AFTER INSERT OR UPDATE OF payment_status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_stats();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Super admins can update organizations"
  ON organizations FOR UPDATE
  USING (id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role = 'super-admin'
  ));

-- Users policies
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Super admins can manage users"
  ON users FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role = 'super-admin'
  ));

-- Games policies
CREATE POLICY "Users can view games in their organization"
  ON games FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage games"
  ON games FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ));

-- Customers policies
CREATE POLICY "Users can view customers in their organization"
  ON customers FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ));

-- Bookings policies
CREATE POLICY "Users can view bookings in their organization"
  ON bookings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Staff can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins and managers can update bookings"
  ON bookings FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin', 'manager')
  ));

-- Payments policies
CREATE POLICY "Users can view payments in their organization"
  ON payments FOR SELECT
  USING (booking_id IN (
    SELECT id FROM bookings WHERE organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (booking_id IN (
    SELECT id FROM bookings WHERE organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
    )
  ));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Notification settings policies
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Stripe webhook events policies (service role only)
CREATE POLICY "Service role can manage webhook events"
  ON stripe_webhook_events FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate unique booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    new_number := 'BK-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_number = new_number) THEN
      RETURN new_number;
    END IF;
    
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique booking number after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check game availability
CREATE OR REPLACE FUNCTION check_game_availability(
  p_game_id UUID,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE game_id = p_game_id
      AND booking_date = p_booking_date
      AND status NOT IN ('cancelled', 'completed')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND (
        (start_time <= p_start_time AND end_time > p_start_time) OR
        (start_time < p_end_time AND end_time >= p_end_time) OR
        (start_time >= p_start_time AND end_time <= p_end_time)
      )
  ) INTO is_available;
  
  RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA (for development)
-- =====================================================

-- Insert default organization
INSERT INTO organizations (id, name, slug, plan) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Escape Room', 'demo-escape-room', 'pro')
ON CONFLICT (id) DO NOTHING;

-- Note: User creation should be done through Supabase Auth
-- After auth user is created, insert into users table via trigger or manual insert

-- =====================================================
-- VIEWS (for convenience)
-- =====================================================

-- Booking summary view
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
  b.id,
  b.booking_number,
  b.booking_date,
  b.start_time,
  b.status,
  b.payment_status,
  b.final_amount,
  c.full_name as customer_name,
  c.email as customer_email,
  g.name as game_name,
  u.full_name as created_by_name
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN games g ON b.game_id = g.id
JOIN users u ON b.created_by = u.id;

-- Daily revenue view
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
  organization_id,
  booking_date,
  COUNT(*) as total_bookings,
  SUM(final_amount) as total_revenue,
  AVG(final_amount) as average_booking_value
FROM bookings
WHERE payment_status = 'paid'
  AND status NOT IN ('cancelled')
GROUP BY organization_id, booking_date;

COMMENT ON TABLE organizations IS 'Organizations (tenants) in the system';
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE games IS 'Escape room games/experiences';
COMMENT ON TABLE customers IS 'Customer records and CRM data';
COMMENT ON TABLE bookings IS 'Booking records';
COMMENT ON TABLE payments IS 'Payment transactions via Stripe';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE notification_settings IS 'User notification preferences';
COMMENT ON TABLE stripe_webhook_events IS 'Stripe webhook event log';
