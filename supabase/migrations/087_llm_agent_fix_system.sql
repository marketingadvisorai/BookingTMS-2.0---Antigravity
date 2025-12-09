-- Migration: 087_llm_agent_fix_system.sql
-- Description: LLM Agent permissions and automated fix tracking system
-- Created: 2025-01-10

-- ============================================================================
-- ENUMS
-- ============================================================================

-- LLM Provider enum
CREATE TYPE llm_provider AS ENUM (
  'anthropic',    -- Claude
  'openai',       -- GPT/Codex
  'google',       -- Gemini
  'cohere',       -- Cohere
  'together',     -- Together AI
  'huggingface'   -- Hugging Face
);

-- Agent permission level
CREATE TYPE agent_permission_level AS ENUM (
  'none',         -- No access
  'read_only',    -- View errors only
  'suggest',      -- Can suggest fixes
  'minor_fix',    -- Auto-fix minor issues
  'major_fix'     -- Fix with approval
);

-- Fix category
CREATE TYPE fix_category AS ENUM (
  'auto_fixable',      -- No approval needed
  'approval_required', -- Needs admin approval
  'admin_only'         -- Only admins can fix
);

-- Fix request status
CREATE TYPE fix_request_status AS ENUM (
  'pending_analysis',  -- AI analyzing
  'pending_approval',  -- Waiting for approval
  'approved',          -- Approved, ready to execute
  'rejected',          -- Rejected by admin
  'executing',         -- Currently executing
  'completed',         -- Successfully completed
  'failed',            -- Execution failed
  'rolled_back'        -- Changes rolled back
);

-- DevOps channel
CREATE TYPE devops_channel AS ENUM (
  'github',
  'slack',
  'discord',
  'windsurf',
  'webhook',
  'email'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- LLM Agent Configurations
CREATE TABLE IF NOT EXISTS llm_agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name VARCHAR(100) NOT NULL,
  provider llm_provider NOT NULL,
  model VARCHAR(100) NOT NULL,
  api_key_ref VARCHAR(255), -- Reference to secret, not actual key
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '{
    "level": "suggest",
    "allowed_categories": ["auto_fixable"],
    "restricted_paths": [
      "src/components/",
      "supabase/migrations/",
      "**/stripe/**",
      "**/auth/**"
    ],
    "max_files_per_fix": 3,
    "max_lines_changed": 50
  }'::jsonb,
  rate_limits JSONB DEFAULT '{
    "requests_per_hour": 50,
    "fixes_per_day": 10
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add auto_fixable column to system_errors if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'system_errors' AND column_name = 'auto_fixable'
  ) THEN
    ALTER TABLE system_errors ADD COLUMN auto_fixable BOOLEAN DEFAULT false;
    ALTER TABLE system_errors ADD COLUMN fix_category fix_category DEFAULT 'admin_only';
    ALTER TABLE system_errors ADD COLUMN suggested_fix_code TEXT;
    ALTER TABLE system_errors ADD COLUMN affected_files TEXT[];
  END IF;
END $$;

-- LLM Fix Requests
CREATE TABLE IF NOT EXISTS llm_fix_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES system_errors(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES llm_agent_configs(id) ON DELETE SET NULL,
  fix_type VARCHAR(100) NOT NULL,
  proposed_fix JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Contains: { description, code_changes: [], files_affected: [], confidence: 0-100 }
  files_affected TEXT[] DEFAULT ARRAY[]::TEXT[],
  status fix_request_status DEFAULT 'pending_analysis',
  approval_required BOOLEAN DEFAULT true,
  priority VARCHAR(20) DEFAULT 'medium',
  estimated_impact VARCHAR(50), -- 'low', 'medium', 'high'
  ai_confidence INTEGER CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  analysis_result JSONB, -- Full AI analysis
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix Approvals
CREATE TABLE IF NOT EXISTS fix_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fix_request_id UUID REFERENCES llm_fix_requests(id) ON DELETE CASCADE NOT NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approval_status VARCHAR(20) NOT NULL CHECK (approval_status IN ('approved', 'rejected', 'pending')),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fix Executions
CREATE TABLE IF NOT EXISTS fix_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fix_request_id UUID REFERENCES llm_fix_requests(id) ON DELETE CASCADE NOT NULL,
  executed_by_agent UUID REFERENCES llm_agent_configs(id),
  executed_by_user UUID REFERENCES profiles(id),
  execution_status VARCHAR(30) NOT NULL CHECK (
    execution_status IN ('started', 'in_progress', 'completed', 'failed', 'rolled_back')
  ),
  git_branch VARCHAR(255),
  git_commit_sha VARCHAR(100),
  github_pr_url TEXT,
  github_issue_url TEXT,
  files_changed JSONB DEFAULT '[]'::jsonb,
  -- Contains: [{ path, before_content, after_content, diff }]
  rollback_available BOOLEAN DEFAULT true,
  rollback_deadline TIMESTAMPTZ,
  error_message TEXT,
  execution_log TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- GitHub Integrations
CREATE TABLE IF NOT EXISTS github_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  repo_owner VARCHAR(255) NOT NULL,
  repo_name VARCHAR(255) NOT NULL,
  github_token_ref VARCHAR(255), -- Reference to encrypted token
  default_branch VARCHAR(100) DEFAULT 'main',
  auto_create_issues BOOLEAN DEFAULT true,
  auto_create_prs BOOLEAN DEFAULT false,
  issue_labels TEXT[] DEFAULT ARRAY['bug', 'auto-detected']::TEXT[],
  pr_reviewers TEXT[] DEFAULT ARRAY[]::TEXT[],
  webhook_secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, repo_owner, repo_name)
);

-- DevOps Notifications
CREATE TABLE IF NOT EXISTS devops_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES system_errors(id) ON DELETE SET NULL,
  fix_request_id UUID REFERENCES llm_fix_requests(id) ON DELETE SET NULL,
  channel devops_channel NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  -- Types: error_detected, fix_proposed, approval_needed, fix_completed, fix_failed
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipient TEXT, -- Email, channel name, webhook URL
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  response JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Activity Log
CREATE TABLE IF NOT EXISTS agent_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES llm_agent_configs(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL,
  -- Types: analyze, suggest, execute, rollback
  error_id UUID REFERENCES system_errors(id) ON DELETE SET NULL,
  fix_request_id UUID REFERENCES llm_fix_requests(id) ON DELETE SET NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_llm_fix_requests_status ON llm_fix_requests(status);
CREATE INDEX IF NOT EXISTS idx_llm_fix_requests_error ON llm_fix_requests(error_id);
CREATE INDEX IF NOT EXISTS idx_llm_fix_requests_created ON llm_fix_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fix_approvals_request ON fix_approvals(fix_request_id);
CREATE INDEX IF NOT EXISTS idx_fix_approvals_status ON fix_approvals(approval_status);

CREATE INDEX IF NOT EXISTS idx_fix_executions_request ON fix_executions(fix_request_id);
CREATE INDEX IF NOT EXISTS idx_fix_executions_status ON fix_executions(execution_status);

CREATE INDEX IF NOT EXISTS idx_github_integrations_org ON github_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_devops_notifications_error ON devops_notifications(error_id);
CREATE INDEX IF NOT EXISTS idx_devops_notifications_status ON devops_notifications(status);

CREATE INDEX IF NOT EXISTS idx_agent_activity_log_agent ON agent_activity_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_log_created ON agent_activity_log(created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE llm_agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_fix_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fix_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fix_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE devops_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;

-- System admin full access
CREATE POLICY "System admins can manage agents" ON llm_agent_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

CREATE POLICY "System admins can manage fix requests" ON llm_fix_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

CREATE POLICY "System admins can manage approvals" ON fix_approvals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

CREATE POLICY "System admins can view executions" ON fix_executions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

CREATE POLICY "System admins can manage github integrations" ON github_integrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

CREATE POLICY "System admins can view notifications" ON devops_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

CREATE POLICY "System admins can view activity log" ON agent_activity_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'system-admin')
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Create fix request from error
CREATE OR REPLACE FUNCTION create_fix_request(
  p_error_id UUID,
  p_agent_id UUID,
  p_fix_type VARCHAR,
  p_proposed_fix JSONB,
  p_files_affected TEXT[],
  p_ai_confidence INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_fix_id UUID;
  v_error_category fix_category;
  v_approval_required BOOLEAN;
BEGIN
  -- Get error category
  SELECT fix_category INTO v_error_category
  FROM system_errors WHERE id = p_error_id;
  
  -- Determine if approval is required
  v_approval_required := CASE
    WHEN v_error_category = 'auto_fixable' THEN false
    WHEN v_error_category = 'approval_required' THEN true
    ELSE true -- admin_only always requires approval
  END;
  
  -- Create fix request
  INSERT INTO llm_fix_requests (
    error_id, agent_id, fix_type, proposed_fix,
    files_affected, ai_confidence, approval_required,
    status
  ) VALUES (
    p_error_id, p_agent_id, p_fix_type, p_proposed_fix,
    p_files_affected, p_ai_confidence, v_approval_required,
    CASE WHEN v_approval_required THEN 'pending_approval' ELSE 'approved' END
  ) RETURNING id INTO v_fix_id;
  
  -- Log activity
  INSERT INTO agent_activity_log (agent_id, action_type, error_id, fix_request_id)
  VALUES (p_agent_id, 'suggest', p_error_id, v_fix_id);
  
  RETURN v_fix_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve fix request
CREATE OR REPLACE FUNCTION approve_fix_request(
  p_fix_request_id UUID,
  p_approved_by UUID,
  p_approve BOOLEAN,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_status fix_request_status;
BEGIN
  -- Check current status
  SELECT status INTO v_current_status
  FROM llm_fix_requests WHERE id = p_fix_request_id;
  
  IF v_current_status != 'pending_approval' THEN
    RAISE EXCEPTION 'Fix request is not pending approval';
  END IF;
  
  -- Create approval record
  INSERT INTO fix_approvals (
    fix_request_id, approved_by, approval_status,
    approved_at, rejection_reason
  ) VALUES (
    p_fix_request_id, p_approved_by,
    CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
    NOW(), p_rejection_reason
  );
  
  -- Update fix request status
  UPDATE llm_fix_requests
  SET 
    status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
    updated_at = NOW()
  WHERE id = p_fix_request_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending approvals count
CREATE OR REPLACE FUNCTION get_pending_approvals_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM llm_fix_requests
    WHERE status = 'pending_approval'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get agent stats
CREATE OR REPLACE FUNCTION get_agent_stats(p_agent_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_analyses', COUNT(*) FILTER (WHERE action_type = 'analyze'),
      'total_suggestions', COUNT(*) FILTER (WHERE action_type = 'suggest'),
      'total_executions', COUNT(*) FILTER (WHERE action_type = 'execute'),
      'success_rate', ROUND(
        (COUNT(*) FILTER (WHERE success = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2
      ),
      'avg_latency_ms', ROUND(AVG(latency_ms)::NUMERIC, 0),
      'total_tokens', SUM(COALESCE(input_tokens, 0) + COALESCE(output_tokens, 0))
    )
    FROM agent_activity_log
    WHERE agent_id = p_agent_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Default Claude agent
INSERT INTO llm_agent_configs (
  agent_name, provider, model, permissions
) VALUES (
  'Claude Error Analyzer',
  'anthropic',
  'claude-3-5-sonnet-20241022',
  '{
    "level": "suggest",
    "allowed_categories": ["auto_fixable", "approval_required"],
    "restricted_paths": [
      "src/components/**/*.tsx",
      "supabase/migrations/**",
      "**/stripe/**",
      "**/auth/**",
      "**/*.sql"
    ],
    "max_files_per_fix": 3,
    "max_lines_changed": 50
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Default OpenAI agent
INSERT INTO llm_agent_configs (
  agent_name, provider, model, permissions
) VALUES (
  'GPT Code Fixer',
  'openai',
  'gpt-4-turbo-preview',
  '{
    "level": "minor_fix",
    "allowed_categories": ["auto_fixable"],
    "restricted_paths": [
      "src/components/**/*.tsx",
      "supabase/migrations/**",
      "**/stripe/**",
      "**/auth/**",
      "**/*.sql"
    ],
    "max_files_per_fix": 2,
    "max_lines_changed": 30
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE llm_fix_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE fix_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE devops_notifications;
