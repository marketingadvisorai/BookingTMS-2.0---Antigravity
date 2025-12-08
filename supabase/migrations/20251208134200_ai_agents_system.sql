-- ============================================================================
-- AI Agents System Migration
-- Supports text agents (DeepSeek, OpenAI) and voice agents (ElevenLabs)
-- Multi-tenant with role-based access (Org Admin vs System Admin)
-- ============================================================================

-- Create ENUM types
DO $$ BEGIN
  CREATE TYPE ai_agent_type AS ENUM ('text', 'voice', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_agent_status AS ENUM ('active', 'inactive', 'training', 'error');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_provider AS ENUM ('openai', 'deepseek', 'anthropic', 'elevenlabs', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE voice_call_status AS ENUM ('queued', 'ringing', 'in_progress', 'completed', 'failed', 'busy', 'no_answer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE voice_call_direction AS ENUM ('inbound', 'outbound');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 1. AI Agent Settings (Platform-level - System Admin only)
-- Stores API keys and model configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_agent_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Provider settings (encrypted API keys stored securely)
  provider ai_provider NOT NULL,
  provider_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  
  -- API Configuration (keys stored in Supabase Vault in production)
  api_key_hint VARCHAR(20), -- Last 4 chars for display: "...sk-xxxx"
  api_endpoint VARCHAR(500),
  
  -- Model Configuration
  models JSONB DEFAULT '[]'::jsonb, -- [{id: 'gpt-4o-mini', name: 'GPT-4o Mini', type: 'text', default: true}]
  default_model VARCHAR(100),
  
  -- Rate Limits
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Cost tracking
  cost_per_1k_tokens NUMERIC(10, 6) DEFAULT 0,
  monthly_budget_limit NUMERIC(10, 2),
  current_month_usage NUMERIC(10, 2) DEFAULT 0,
  
  -- Voice-specific settings (ElevenLabs)
  voice_settings JSONB DEFAULT '{}'::jsonb, -- {voices: [], default_voice: '', model_id: ''}
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(provider)
);

-- ============================================================================
-- 2. AI Agents (Organization-level)
-- Each org can have multiple agents with different purposes
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Agent Identity
  name VARCHAR(100) NOT NULL,
  description TEXT,
  agent_type ai_agent_type NOT NULL DEFAULT 'text',
  status ai_agent_status DEFAULT 'inactive',
  
  -- Configuration (visible to org admins)
  config JSONB DEFAULT '{}'::jsonb,
  -- {
  --   greeting: 'Hello! How can I help?',
  --   personality: 'friendly',
  --   knowledge_base: [],
  --   business_hours: '9am-9pm',
  --   escalate_to_human: true,
  --   auto_suggest: true,
  --   show_prices: true,
  --   collect_feedback: true
  -- }
  
  -- System settings (hidden from org admins, only system admin can change)
  system_config JSONB DEFAULT '{}'::jsonb,
  -- {
  --   provider: 'openai',
  --   model: 'gpt-4o-mini',
  --   temperature: 0.7,
  --   max_tokens: 500,
  --   system_prompt: '...',
  --   voice_id: '...',  -- for voice agents
  --   elevenlabs_agent_id: '...'
  -- }
  
  -- Widget settings
  widget_config JSONB DEFAULT '{}'::jsonb,
  -- {
  --   primary_color: '#4f46e5',
  --   position: 'right',
  --   avatar_url: '',
  --   show_branding: true
  -- }
  
  -- Stats (auto-updated)
  stats JSONB DEFAULT '{}'::jsonb,
  -- {
  --   total_conversations: 0,
  --   successful_bookings: 0,
  --   avg_response_time_ms: 0,
  --   satisfaction_score: 0,
  --   total_calls: 0,
  --   avg_call_duration_sec: 0
  -- }
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  
  UNIQUE(organization_id, name)
);

-- ============================================================================
-- 3. AI Conversations (Chat history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Session info
  session_id VARCHAR(100) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  visitor_id VARCHAR(100), -- For anonymous visitors
  
  -- Conversation state
  status VARCHAR(50) DEFAULT 'active', -- active, completed, escalated, abandoned
  booking_id UUID REFERENCES bookings(id), -- If resulted in booking
  
  -- Messages stored as JSONB array
  messages JSONB DEFAULT '[]'::jsonb,
  -- [{
  --   id: 'msg_xxx',
  --   role: 'user' | 'assistant',
  --   content: '...',
  --   timestamp: '...',
  --   intent: 'book_activity',
  --   entities: {},
  --   tokens_used: 50
  -- }]
  
  -- Booking slots collected
  booking_slots JSONB DEFAULT '{}'::jsonb,
  -- {
  --   activity_id: '',
  --   date: '',
  --   time: '',
  --   party_size: 0,
  --   customer_name: '',
  --   customer_email: '',
  --   customer_phone: ''
  -- }
  
  -- Analytics
  total_messages INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  response_times_ms JSONB DEFAULT '[]'::jsonb,
  satisfaction_rating INTEGER, -- 1-5
  feedback TEXT,
  
  -- Source tracking
  source VARCHAR(50), -- widget, api, test
  source_url TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. Voice Calls (ElevenLabs integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Call info
  call_sid VARCHAR(100), -- ElevenLabs/Twilio call ID
  direction voice_call_direction NOT NULL,
  status voice_call_status DEFAULT 'queued',
  
  -- Parties
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  customer_id UUID REFERENCES customers(id),
  
  -- Related booking
  booking_id UUID REFERENCES bookings(id),
  
  -- Call details
  purpose VARCHAR(100), -- booking_confirmation, reminder, followup, support
  
  -- Recording & Transcription
  recording_url TEXT,
  recording_duration_sec INTEGER,
  transcription JSONB DEFAULT '[]'::jsonb,
  -- [{speaker: 'agent'|'customer', text: '...', timestamp: 0}]
  
  -- Analytics
  queue_time_sec INTEGER,
  ring_time_sec INTEGER,
  talk_time_sec INTEGER,
  
  -- Outcome
  outcome VARCHAR(100), -- completed, voicemail, callback_requested, issue_resolved
  notes TEXT,
  satisfaction_rating INTEGER, -- 1-5
  
  -- Voice settings used
  voice_id VARCHAR(100),
  voice_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. AI Agent Templates (Pre-built agent configurations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  agent_type ai_agent_type NOT NULL,
  category VARCHAR(50), -- booking, support, calling, custom
  
  -- Template config
  config JSONB NOT NULL,
  system_config JSONB NOT NULL,
  widget_config JSONB DEFAULT '{}'::jsonb,
  
  -- Preview
  preview_greeting TEXT,
  preview_conversation JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_ai_agents_org ON ai_agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_agent ON ai_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org ON ai_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_customer ON ai_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_calls_agent ON ai_voice_calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_calls_org ON ai_voice_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_calls_status ON ai_voice_calls(status);
CREATE INDEX IF NOT EXISTS idx_ai_voice_calls_booking ON ai_voice_calls(booking_id);

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE ai_agent_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_templates ENABLE ROW LEVEL SECURITY;

-- AI Agent Settings (System Admin only)
CREATE POLICY "System admins can manage AI settings"
  ON ai_agent_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

-- AI Agents (Org-scoped)
CREATE POLICY "Org members can view their agents"
  ON ai_agents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
    )
  );

CREATE POLICY "System admins can manage all agents"
  ON ai_agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

CREATE POLICY "Org admins can update their agent config"
  ON ai_agents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super-admin', 'org-admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super-admin', 'org-admin')
    )
  );

-- AI Conversations (Org-scoped)
CREATE POLICY "Org members can view conversations"
  ON ai_conversations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
    )
  );

CREATE POLICY "Agents can create conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (true); -- Public insert for widget usage

CREATE POLICY "Agents can update conversations"
  ON ai_conversations FOR UPDATE
  USING (true); -- Allow updates from widget

-- Voice Calls (Org-scoped)
CREATE POLICY "Org members can view calls"
  ON ai_voice_calls FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
    )
  );

CREATE POLICY "System can manage calls"
  ON ai_voice_calls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
    )
  );

-- Templates (Public read, System Admin write)
CREATE POLICY "Anyone can view templates"
  ON ai_agent_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "System admins can manage templates"
  ON ai_agent_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get agent stats
CREATE OR REPLACE FUNCTION get_ai_agent_stats(p_agent_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_conversations', COUNT(DISTINCT c.id),
    'successful_bookings', COUNT(DISTINCT c.booking_id),
    'avg_response_time_ms', COALESCE(
      AVG((SELECT AVG(x::int) FROM jsonb_array_elements_text(c.response_times_ms) AS x)), 0
    )::int,
    'satisfaction_score', COALESCE(AVG(c.satisfaction_rating), 0)::numeric(3,1),
    'total_messages', COALESCE(SUM(c.total_messages), 0),
    'total_tokens', COALESCE(SUM(c.total_tokens_used), 0)
  ) INTO v_stats
  FROM ai_conversations c
  WHERE c.agent_id = p_agent_id;
  
  -- Add voice stats if applicable
  SELECT v_stats || jsonb_build_object(
    'total_calls', COUNT(*),
    'completed_calls', COUNT(*) FILTER (WHERE status = 'completed'),
    'avg_call_duration_sec', COALESCE(AVG(talk_time_sec), 0)::int
  ) INTO v_stats
  FROM ai_voice_calls
  WHERE agent_id = p_agent_id;
  
  RETURN v_stats;
END;
$$;

-- Update agent stats trigger
CREATE OR REPLACE FUNCTION update_agent_stats_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ai_agents
  SET 
    stats = get_ai_agent_stats(NEW.agent_id),
    last_active_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.agent_id;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_agent_stats_conversation ON ai_conversations;
CREATE TRIGGER trigger_update_agent_stats_conversation
  AFTER INSERT OR UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_stats_trigger();

DROP TRIGGER IF EXISTS trigger_update_agent_stats_call ON ai_voice_calls;
CREATE TRIGGER trigger_update_agent_stats_call
  AFTER INSERT OR UPDATE ON ai_voice_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_stats_trigger();

-- ============================================================================
-- Seed default AI settings
-- ============================================================================
INSERT INTO ai_agent_settings (provider, provider_name, is_enabled, models, default_model, cost_per_1k_tokens)
VALUES 
  ('openai', 'OpenAI', true, 
   '[
     {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "type": "text", "context_window": 128000, "default": true},
     {"id": "gpt-4o", "name": "GPT-4o", "type": "text", "context_window": 128000},
     {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "type": "text", "context_window": 128000},
     {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "type": "text", "context_window": 16385}
   ]'::jsonb, 
   'gpt-4o-mini', 0.000150),
   
  ('deepseek', 'DeepSeek', true, 
   '[
     {"id": "deepseek-chat", "name": "DeepSeek Chat", "type": "text", "context_window": 64000, "default": true},
     {"id": "deepseek-coder", "name": "DeepSeek Coder", "type": "text", "context_window": 64000}
   ]'::jsonb, 
   'deepseek-chat', 0.000140),
   
  ('elevenlabs', 'ElevenLabs', true, 
   '[
     {"id": "eleven_turbo_v2_5", "name": "Turbo v2.5", "type": "voice", "default": true},
     {"id": "eleven_multilingual_v2", "name": "Multilingual v2", "type": "voice"}
   ]'::jsonb, 
   'eleven_turbo_v2_5', 0.000300)
ON CONFLICT (provider) DO NOTHING;

-- Seed default templates
INSERT INTO ai_agent_templates (name, description, agent_type, category, config, system_config, widget_config, preview_greeting, is_featured)
VALUES 
  ('Booking Assistant', 
   'AI assistant that helps customers book activities, check availability, and manage reservations',
   'text', 'booking',
   '{
     "greeting": "Hi there! 👋 I''m your booking assistant. I can help you find and book the perfect activity. What would you like to do today?",
     "personality": "friendly",
     "auto_suggest": true,
     "show_prices": true,
     "collect_feedback": true,
     "escalate_to_human": true
   }'::jsonb,
   '{
     "provider": "openai",
     "model": "gpt-4o-mini",
     "temperature": 0.7,
     "max_tokens": 500
   }'::jsonb,
   '{
     "primary_color": "#4f46e5",
     "position": "right"
   }'::jsonb,
   'Hi there! 👋 I''m your booking assistant. How can I help you today?',
   true),
   
  ('Customer Support', 
   'AI support agent that answers FAQs, handles inquiries, and provides customer assistance',
   'text', 'support',
   '{
     "greeting": "Hello! I''m here to help with any questions you might have. How can I assist you?",
     "personality": "professional",
     "auto_suggest": true,
     "escalate_to_human": true
   }'::jsonb,
   '{
     "provider": "openai",
     "model": "gpt-4o-mini",
     "temperature": 0.5,
     "max_tokens": 500
   }'::jsonb,
   '{
     "primary_color": "#10b981",
     "position": "right"
   }'::jsonb,
   'Hello! I''m here to help. What can I assist you with today?',
   true),
   
  ('Voice Agent', 
   'AI phone agent for booking confirmations, reminders, and customer follow-ups',
   'voice', 'calling',
   '{
     "greeting": "Hello, this is your booking assistant calling from",
     "personality": "professional",
     "purposes": ["booking_confirmation", "reminder", "followup"]
   }'::jsonb,
   '{
     "provider": "elevenlabs",
     "voice_id": "rachel",
     "model": "eleven_turbo_v2_5"
   }'::jsonb,
   '{}'::jsonb,
   'Hello, this is your booking assistant.',
   true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Enable realtime
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ai_agents;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_voice_calls;

COMMENT ON TABLE ai_agent_settings IS 'Platform-level AI provider settings (System Admin only)';
COMMENT ON TABLE ai_agents IS 'Organization-level AI agents with config and stats';
COMMENT ON TABLE ai_conversations IS 'Chat conversation history for text agents';
COMMENT ON TABLE ai_voice_calls IS 'Voice call logs for ElevenLabs integration';
COMMENT ON TABLE ai_agent_templates IS 'Pre-built agent templates for quick setup';
