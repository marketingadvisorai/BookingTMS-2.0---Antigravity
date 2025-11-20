-- =====================================================
-- EMAIL SYSTEM DATABASE SCHEMA
-- Created: Nov 9, 2025
-- Description: Complete email system with templates, campaigns, logs, workflows, and subscribers
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preheader VARCHAR(255),
  body TEXT NOT NULL,
  html_body TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  icon VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  
  CONSTRAINT valid_category CHECK (category IN ('transactional', 'marketing', 'engagement'))
);

-- Add comments
COMMENT ON TABLE email_templates IS 'Email templates for transactional and marketing emails';
COMMENT ON COLUMN email_templates.category IS 'Template category: transactional, marketing, or engagement';
COMMENT ON COLUMN email_templates.variables IS 'JSON array of available variables for template';
COMMENT ON COLUMN email_templates.usage_count IS 'Number of times this template has been used';

-- =====================================================
-- 2. EMAIL CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'))
);

-- Add comments
COMMENT ON TABLE email_campaigns IS 'Email campaigns for bulk sending';
COMMENT ON COLUMN email_campaigns.status IS 'Campaign status: draft, scheduled, sending, sent, paused, cancelled';

-- =====================================================
-- 3. EMAIL LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  customer_id UUID,
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  provider_message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'))
);

-- Add comments
COMMENT ON TABLE email_logs IS 'Individual email send logs with tracking';
COMMENT ON COLUMN email_logs.provider_message_id IS 'Message ID from email provider (Resend)';
COMMENT ON COLUMN email_logs.status IS 'Email status: pending, sent, delivered, opened, clicked, bounced, failed';

-- =====================================================
-- 4. EMAIL WORKFLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  delay_minutes INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  triggered_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_trigger CHECK (trigger_type IN ('booking_confirmed', 'booking_reminder', 'waiver_request', 'review_request', 'abandoned_cart', 'welcome', 'birthday'))
);

-- Add comments
COMMENT ON TABLE email_workflows IS 'Automated email workflows triggered by events';
COMMENT ON COLUMN email_workflows.trigger_type IS 'Event that triggers this workflow';
COMMENT ON COLUMN email_workflows.delay_minutes IS 'Delay in minutes before sending email after trigger';
COMMENT ON COLUMN email_workflows.conditions IS 'JSON conditions for workflow execution';

-- =====================================================
-- 5. EMAIL SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  is_subscribed BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, email)
);

-- Add comments
COMMENT ON TABLE email_subscribers IS 'Email subscribers and their subscription status';
COMMENT ON COLUMN email_subscribers.tags IS 'JSON array of subscriber tags for segmentation';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Email Templates
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);

-- Email Campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_org ON email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template ON email_campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE status = 'scheduled';

-- Email Logs
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_customer ON email_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_provider_id ON email_logs(provider_message_id);

-- Email Workflows
CREATE INDEX IF NOT EXISTS idx_email_workflows_trigger ON email_workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_email_workflows_active ON email_workflows(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_email_workflows_org ON email_workflows(organization_id);

-- Email Subscribers
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_subscribed ON email_subscribers(is_subscribed) WHERE is_subscribed = true;
CREATE INDEX IF NOT EXISTS idx_email_subscribers_org ON email_subscribers(organization_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats(campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    recipient_count = (SELECT COUNT(*) FROM email_logs WHERE email_logs.campaign_id = update_campaign_stats.campaign_id),
    delivered_count = (SELECT COUNT(*) FROM email_logs WHERE email_logs.campaign_id = update_campaign_stats.campaign_id AND status IN ('delivered', 'opened', 'clicked')),
    opened_count = (SELECT COUNT(*) FROM email_logs WHERE email_logs.campaign_id = update_campaign_stats.campaign_id AND status IN ('opened', 'clicked')),
    clicked_count = (SELECT COUNT(*) FROM email_logs WHERE email_logs.campaign_id = update_campaign_stats.campaign_id AND status = 'clicked'),
    bounced_count = (SELECT COUNT(*) FROM email_logs WHERE email_logs.campaign_id = update_campaign_stats.campaign_id AND status = 'bounced'),
    failed_count = (SELECT COUNT(*) FROM email_logs WHERE email_logs.campaign_id = update_campaign_stats.campaign_id AND status = 'failed'),
    updated_at = NOW()
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_workflows_updated_at BEFORE UPDATE ON email_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies will be added based on your authentication setup
-- For now, allow service role full access (Edge Functions)

-- =====================================================
-- INITIAL DATA - DEFAULT EMAIL TEMPLATES
-- =====================================================

-- Insert default booking confirmation template
INSERT INTO email_templates (name, category, subject, body, icon, description, is_active)
VALUES (
  'Booking Confirmation',
  'transactional',
  'Booking Confirmed - {{room_name}}',
  'Thank you for your booking! Your reservation for {{room_name}} on {{date}} at {{time}} has been confirmed.',
  '✅',
  'Sent immediately after successful booking',
  true
) ON CONFLICT DO NOTHING;

-- Insert default waiver reminder template
INSERT INTO email_templates (name, category, subject, body, icon, description, is_active)
VALUES (
  'Waiver Reminder',
  'transactional',
  'Complete Your Waiver - {{room_name}}',
  'Hi {{customer_name}}, please complete your waiver before your visit on {{date}}.',
  '📝',
  'Reminder to complete waiver form',
  true
) ON CONFLICT DO NOTHING;

-- Insert default booking reminder template
INSERT INTO email_templates (name, category, subject, body, icon, description, is_active)
VALUES (
  'Booking Reminder',
  'transactional',
  'Reminder: Your booking tomorrow at {{time}}',
  'Hi {{customer_name}}, this is a reminder about your booking for {{room_name}} tomorrow at {{time}}.',
  '⏰',
  'Sent 24 hours before booking',
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Email system database schema created successfully!';
  RAISE NOTICE '📊 Tables created: email_templates, email_campaigns, email_logs, email_workflows, email_subscribers';
  RAISE NOTICE '🔧 Helper functions created: increment_template_usage, update_campaign_stats';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '📝 Default templates inserted';
END $$;
