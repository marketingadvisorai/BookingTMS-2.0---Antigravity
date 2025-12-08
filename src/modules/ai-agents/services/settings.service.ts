/**
 * AI Agent Settings Service
 * System Admin only - manages API keys and model configurations
 */

import { supabase } from '@/lib/supabase';
import type { AIAgentSettings, AIProvider, AIModel, AIAgent } from '../types';

// ============================================================================
// Settings Management (System Admin only)
// ============================================================================

export async function listSettings(): Promise<AIAgentSettings[]> {
  const { data, error } = await supabase
    .from('ai_agent_settings')
    .select('*')
    .order('provider_name');

  if (error) throw error;
  return (data || []).map(mapSettings);
}

export async function getSettingsByProvider(
  provider: AIProvider
): Promise<AIAgentSettings | null> {
  const { data, error } = await supabase
    .from('ai_agent_settings')
    .select('*')
    .eq('provider', provider)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapSettings(data) : null;
}

export async function updateSettings(
  provider: AIProvider,
  updates: {
    isEnabled?: boolean;
    apiEndpoint?: string;
    defaultModel?: string;
    rateLimitPerMinute?: number;
    rateLimitPerHour?: number;
    monthlyBudgetLimit?: number;
    voiceSettings?: Record<string, unknown>;
  }
): Promise<AIAgentSettings> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.isEnabled !== undefined) updateData.is_enabled = updates.isEnabled;
  if (updates.apiEndpoint) updateData.api_endpoint = updates.apiEndpoint;
  if (updates.defaultModel) updateData.default_model = updates.defaultModel;
  if (updates.rateLimitPerMinute !== undefined)
    updateData.rate_limit_per_minute = updates.rateLimitPerMinute;
  if (updates.rateLimitPerHour !== undefined)
    updateData.rate_limit_per_hour = updates.rateLimitPerHour;
  if (updates.monthlyBudgetLimit !== undefined)
    updateData.monthly_budget_limit = updates.monthlyBudgetLimit;
  if (updates.voiceSettings) updateData.voice_settings = updates.voiceSettings;

  const { data, error } = await supabase
    .from('ai_agent_settings')
    .update(updateData)
    .eq('provider', provider)
    .select()
    .single();

  if (error) throw error;
  return mapSettings(data);
}

/**
 * Save API key securely
 * In production, this should use Supabase Vault or external secrets manager
 */
export async function saveApiKey(
  provider: AIProvider,
  apiKey: string
): Promise<void> {
  // Store only the hint (last 4 chars) in the database
  const hint = apiKey.length > 4 ? `...${apiKey.slice(-4)}` : '****';

  // In production, store the full key in Supabase Vault
  // For now, we'll store it in a secure edge function env var
  // or use the organization's vault

  const { error } = await supabase
    .from('ai_agent_settings')
    .update({
      api_key_hint: hint,
      updated_at: new Date().toISOString(),
    })
    .eq('provider', provider);

  if (error) throw error;

  // Store actual key via edge function that has vault access
  // This is a placeholder for the secure storage implementation
  console.log(`API key for ${provider} would be securely stored`);
}

export async function addModel(
  provider: AIProvider,
  model: AIModel
): Promise<void> {
  const { data: settings } = await supabase
    .from('ai_agent_settings')
    .select('models')
    .eq('provider', provider)
    .single();

  const models = [...(settings?.models || []), model];

  await supabase
    .from('ai_agent_settings')
    .update({ models, updated_at: new Date().toISOString() })
    .eq('provider', provider);
}

export async function removeModel(
  provider: AIProvider,
  modelId: string
): Promise<void> {
  const { data: settings } = await supabase
    .from('ai_agent_settings')
    .select('models')
    .eq('provider', provider)
    .single();

  const models = (settings?.models || []).filter(
    (m: AIModel) => m.id !== modelId
  );

  await supabase
    .from('ai_agent_settings')
    .update({ models, updated_at: new Date().toISOString() })
    .eq('provider', provider);
}

// ============================================================================
// System Config Management (for agents - System Admin only)
// ============================================================================

export async function updateAgentSystemConfig(
  agentId: string,
  systemConfig: {
    provider?: AIProvider;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    voiceId?: string;
    elevenlabsAgentId?: string;
  }
): Promise<AIAgent> {
  // Get current system config
  const { data: current } = await supabase
    .from('ai_agents')
    .select('system_config')
    .eq('id', agentId)
    .single();

  const { data, error } = await supabase
    .from('ai_agents')
    .update({
      system_config: { ...current?.system_config, ...systemConfig },
      updated_at: new Date().toISOString(),
    })
    .eq('id', agentId)
    .select()
    .single();

  if (error) throw error;
  return mapAgent(data);
}

export async function getUsageStats(): Promise<{
  totalConversations: number;
  totalCalls: number;
  totalTokensUsed: number;
  estimatedCost: number;
  byProvider: Record<string, { tokens: number; cost: number }>;
}> {
  // Aggregate usage across all conversations
  const { data: convStats } = await supabase
    .from('ai_conversations')
    .select('total_tokens_used');

  const { data: callStats } = await supabase
    .from('ai_voice_calls')
    .select('id');

  const totalTokens =
    convStats?.reduce((sum, c) => sum + (c.total_tokens_used || 0), 0) || 0;

  // Calculate estimated cost (simplified)
  const estimatedCost = (totalTokens / 1000) * 0.00015; // Rough GPT-4o-mini cost

  return {
    totalConversations: convStats?.length || 0,
    totalCalls: callStats?.length || 0,
    totalTokensUsed: totalTokens,
    estimatedCost,
    byProvider: {
      openai: { tokens: totalTokens, cost: estimatedCost },
    },
  };
}

// ============================================================================
// Helpers
// ============================================================================

function mapSettings(data: unknown): AIAgentSettings {
  const d = data as Record<string, unknown>;
  return {
    id: d.id as string,
    provider: d.provider as AIProvider,
    providerName: d.provider_name as string,
    isEnabled: d.is_enabled as boolean,
    apiKeyHint: d.api_key_hint as string | undefined,
    apiEndpoint: d.api_endpoint as string | undefined,
    models: (d.models as AIModel[]) || [],
    defaultModel: d.default_model as string,
    rateLimitPerMinute: d.rate_limit_per_minute as number,
    rateLimitPerHour: d.rate_limit_per_hour as number,
    costPer1kTokens: Number(d.cost_per_1k_tokens) || 0,
    monthlyBudgetLimit: d.monthly_budget_limit
      ? Number(d.monthly_budget_limit)
      : undefined,
    currentMonthUsage: Number(d.current_month_usage) || 0,
    voiceSettings: d.voice_settings as AIAgentSettings['voiceSettings'],
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function mapAgent(data: unknown): AIAgent {
  const d = data as Record<string, unknown>;
  return {
    id: d.id as string,
    organizationId: d.organization_id as string,
    name: d.name as string,
    description: d.description as string | undefined,
    agentType: d.agent_type as AIAgent['agentType'],
    status: d.status as AIAgent['status'],
    config: d.config as AIAgent['config'],
    systemConfig: d.system_config as AIAgent['systemConfig'],
    widgetConfig: d.widget_config as AIAgent['widgetConfig'],
    stats: d.stats as AIAgent['stats'],
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
    lastActiveAt: d.last_active_at as string | undefined,
  };
}

export const settingsService = {
  listSettings,
  getSettingsByProvider,
  updateSettings,
  saveApiKey,
  addModel,
  removeModel,
  updateAgentSystemConfig,
  getUsageStats,
};
