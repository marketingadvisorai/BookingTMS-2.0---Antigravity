/**
 * AI Agent Service
 * CRUD operations for AI agents (organization-scoped)
 */

import { supabase } from '@/lib/supabase';
import type {
  AIAgent,
  DBAIAgent,
  AIAgentConfig,
  AIAgentWidgetConfig,
  AIAgentFilters,
  AIAgentTemplate,
} from '../types';

// ============================================================================
// Mappers
// ============================================================================

function mapDBToUI(db: DBAIAgent): AIAgent {
  return {
    id: db.id,
    organizationId: db.organization_id,
    name: db.name,
    description: db.description,
    agentType: db.agent_type,
    status: db.status,
    config: db.config,
    systemConfig: db.system_config,
    widgetConfig: db.widget_config,
    stats: db.stats || {
      totalConversations: 0,
      successfulBookings: 0,
      avgResponseTimeMs: 0,
      satisfactionScore: 0,
      totalMessages: 0,
      totalTokens: 0,
      totalCalls: 0,
      completedCalls: 0,
      avgCallDurationSec: 0,
    },
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    lastActiveAt: db.last_active_at,
  };
}

// ============================================================================
// Agent CRUD
// ============================================================================

export async function listAgents(
  organizationId: string,
  filters?: AIAgentFilters
): Promise<AIAgent[]> {
  let query = supabase
    .from('ai_agents')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.agentType) {
    query = query.eq('agent_type', filters.agentType);
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapDBToUI);
}

export async function getAgent(agentId: string): Promise<AIAgent | null> {
  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('id', agentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapDBToUI(data) : null;
}

export async function createAgent(
  organizationId: string,
  data: {
    name: string;
    description?: string;
    agentType: AIAgent['agentType'];
    config: AIAgentConfig;
    widgetConfig?: AIAgentWidgetConfig;
  }
): Promise<AIAgent> {
  const { data: agent, error } = await supabase
    .from('ai_agents')
    .insert({
      organization_id: organizationId,
      name: data.name,
      description: data.description,
      agent_type: data.agentType,
      status: 'inactive',
      config: data.config,
      system_config: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
      },
      widget_config: data.widgetConfig || {
        primaryColor: '#4f46e5',
        position: 'right',
        showBranding: true,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return mapDBToUI(agent);
}

export async function updateAgentConfig(
  agentId: string,
  config: Partial<AIAgentConfig>
): Promise<AIAgent> {
  // Get current config first
  const { data: current } = await supabase
    .from('ai_agents')
    .select('config')
    .eq('id', agentId)
    .single();

  const { data, error } = await supabase
    .from('ai_agents')
    .update({
      config: { ...current?.config, ...config },
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return mapDBToUI(data);
}

export async function updateAgentWidget(
  agentId: string,
  widgetConfig: Partial<AIAgentWidgetConfig>
): Promise<AIAgent> {
  const { data: current } = await supabase
    .from('ai_agents')
    .select('widget_config')
    .eq('id', agentId)
    .single();

  const { data, error } = await supabase
    .from('ai_agents')
    .update({
      widget_config: { ...current?.widget_config, ...widgetConfig },
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return mapDBToUI(data);
}

export async function updateAgentStatus(
  agentId: string,
  status: AIAgent['status']
): Promise<AIAgent> {
  const { data, error } = await supabase
    .from('ai_agents')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return mapDBToUI(data);
}

export async function deleteAgent(agentId: string): Promise<void> {
  const { error } = await supabase
    .from('ai_agents')
    .delete()
    .eq('id', agentId);

  if (error) throw error;
}

// ============================================================================
// Templates
// ============================================================================

export async function listTemplates(): Promise<AIAgentTemplate[]> {
  const { data, error } = await supabase
    .from('ai_agent_templates')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false });

  if (error) throw error;
  return (data || []).map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    agentType: t.agent_type,
    category: t.category,
    config: t.config,
    systemConfig: t.system_config,
    widgetConfig: t.widget_config,
    previewGreeting: t.preview_greeting,
    previewConversation: t.preview_conversation,
    isFeatured: t.is_featured,
    isActive: t.is_active,
    usageCount: t.usage_count,
  }));
}

export async function createAgentFromTemplate(
  organizationId: string,
  templateId: string,
  name: string
): Promise<AIAgent> {
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('ai_agent_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) throw templateError;

  // Create agent from template
  const { data: agent, error } = await supabase
    .from('ai_agents')
    .insert({
      organization_id: organizationId,
      name,
      description: template.description,
      agent_type: template.agent_type,
      status: 'inactive',
      config: template.config,
      system_config: template.system_config,
      widget_config: template.widget_config,
    })
    .select()
    .single();

  if (error) throw error;

  // Increment template usage
  await supabase
    .from('ai_agent_templates')
    .update({ usage_count: template.usage_count + 1 })
    .eq('id', templateId);

  return mapDBToUI(agent);
}

export const agentService = {
  listAgents,
  getAgent,
  createAgent,
  updateAgentConfig,
  updateAgentWidget,
  updateAgentStatus,
  deleteAgent,
  listTemplates,
  createAgentFromTemplate,
};
