-- Enhanced AI Agents Schema v2.0
-- Supports 3 agent types: Basic Chat, Booking Agent, Voice Agent
-- Created: Dec 12, 2025

-- Agent Types lookup table
CREATE TABLE IF NOT EXISTS ai_agent_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  capabilities JSONB DEFAULT '[]'::jsonb,
  default_model TEXT NOT NULL,
  default_max_tokens INTEGER DEFAULT 500,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default agent types
INSERT INTO ai_agent_types (name, display_name, description, tier, capabilities, default_model, default_max_tokens, icon, sort_order)
VALUES 
  ('basic_chat', 'Basic Chat Agent', 'Answers general queries, FAQs, and provides business information. Cannot process bookings.', 'free', 
   '["answer_faq", "provide_info", "collect_lead"]'::jsonb, 'gpt-4o-mini', 500, 'MessageSquare', 1),
  ('booking_agent', 'Booking Agent', 'Full-featured agent that can check availability, create bookings, and guide customers through checkout.', 'pro',
   '["answer_faq", "provide_info", "check_availability", "create_booking", "get_checkout_link", "activity_planning"]'::jsonb, 'gpt-4o', 1000, 'Calendar', 2),
  ('voice_agent', 'Voice Agent', 'Voice-enabled agent for phone calls. Can handle bookings, reminders, refunds, and rescheduling via phone.', 'enterprise',
   '["answer_faq", "voice_inbound", "voice_outbound", "booking_reminder", "process_refund", "reschedule_booking", "cancel_booking"]'::jsonb, 'gpt-4o', 800, 'Phone', 3)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities;

-- Knowledge Base table for RAG
CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('faq', 'business_info', 'pricing', 'policy', 'activity', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Agent Tools configuration
CREATE TABLE IF NOT EXISTS ai_agent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, tool_type)
);

-- Add new columns to ai_agents if not exists
DO $$ 
BEGIN
  -- Add agent_type_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'agent_type_id') THEN
    ALTER TABLE ai_agents ADD COLUMN agent_type_id UUID REFERENCES ai_agent_types(id);
  END IF;
  
  -- Add capabilities column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'capabilities') THEN
    ALTER TABLE ai_agents ADD COLUMN capabilities JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Add voice_config column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'voice_config') THEN
    ALTER TABLE ai_agents ADD COLUMN voice_config JSONB DEFAULT NULL;
  END IF;
  
  -- Add cost_config column for budget limits
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'cost_config') THEN
    ALTER TABLE ai_agents ADD COLUMN cost_config JSONB DEFAULT '{"daily_limit": null, "monthly_limit": null, "max_tokens_per_conversation": 2000}'::jsonb;
  END IF;
  
  -- Add training_status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'training_status') THEN
    ALTER TABLE ai_agents ADD COLUMN training_status TEXT DEFAULT 'ready' CHECK (training_status IN ('ready', 'training', 'failed'));
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_org ON ai_knowledge_base(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_agent ON ai_knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_base_type ON ai_knowledge_base(type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_tools_agent ON ai_agent_tools(agent_id);

-- RLS Policies
ALTER TABLE ai_agent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_tools ENABLE ROW LEVEL SECURITY;

-- Agent types are readable by all authenticated users
CREATE POLICY "ai_agent_types_read" ON ai_agent_types FOR SELECT TO authenticated USING (true);

-- Knowledge base policies
CREATE POLICY "ai_knowledge_base_org_read" ON ai_knowledge_base FOR SELECT TO authenticated
  USING (organization_id = get_my_organization_id_raw() OR is_platform_admin());

CREATE POLICY "ai_knowledge_base_org_insert" ON ai_knowledge_base FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_my_organization_id_raw() OR is_platform_admin());

CREATE POLICY "ai_knowledge_base_org_update" ON ai_knowledge_base FOR UPDATE TO authenticated
  USING (organization_id = get_my_organization_id_raw() OR is_platform_admin());

CREATE POLICY "ai_knowledge_base_org_delete" ON ai_knowledge_base FOR DELETE TO authenticated
  USING (organization_id = get_my_organization_id_raw() OR is_platform_admin());

-- Agent tools policies
CREATE POLICY "ai_agent_tools_read" ON ai_agent_tools FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ai_agents a 
    WHERE a.id = agent_id 
    AND (a.organization_id = get_my_organization_id_raw() OR is_platform_admin())
  ));

CREATE POLICY "ai_agent_tools_manage" ON ai_agent_tools FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ai_agents a 
    WHERE a.id = agent_id 
    AND (a.organization_id = get_my_organization_id_raw() OR is_platform_admin())
  ));

-- Add tables to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ai_knowledge_base;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_agent_tools;
