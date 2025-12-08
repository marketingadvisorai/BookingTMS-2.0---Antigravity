/**
 * useAIAgents Hook
 * Manages AI agents for an organization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { agentService } from '../services';
import type { AIAgent, AIAgentFilters, AIAgentTemplate } from '../types';

interface UseAIAgentsOptions {
  organizationId: string;
  filters?: AIAgentFilters;
}

interface UseAIAgentsReturn {
  agents: AIAgent[];
  templates: AIAgentTemplate[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createAgent: typeof agentService.createAgent;
  updateConfig: typeof agentService.updateAgentConfig;
  updateWidget: typeof agentService.updateAgentWidget;
  updateStatus: typeof agentService.updateAgentStatus;
  deleteAgent: typeof agentService.deleteAgent;
  createFromTemplate: (templateId: string, name: string) => Promise<AIAgent>;
}

export function useAIAgents(options: UseAIAgentsOptions): UseAIAgentsReturn {
  const { organizationId, filters } = options;
  
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [templates, setTemplates] = useState<AIAgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!organizationId || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const [agentsData, templatesData] = await Promise.all([
        agentService.listAgents(organizationId, filters),
        agentService.listTemplates(),
      ]);

      if (mountedRef.current) {
        setAgents(agentsData);
        setTemplates(templatesData);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [organizationId, filters]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase
      .channel(`ai_agents_${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_agents',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          // Debounce updates
          setTimeout(() => {
            if (mountedRef.current) {
              fetchData();
            }
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Wrapped methods that refresh after changes
  const createAgent = useCallback(
    async (...args: Parameters<typeof agentService.createAgent>) => {
      const result = await agentService.createAgent(...args);
      await fetchData();
      return result;
    },
    [fetchData]
  );

  const updateConfig = useCallback(
    async (...args: Parameters<typeof agentService.updateAgentConfig>) => {
      const result = await agentService.updateAgentConfig(...args);
      await fetchData();
      return result;
    },
    [fetchData]
  );

  const updateWidget = useCallback(
    async (...args: Parameters<typeof agentService.updateAgentWidget>) => {
      const result = await agentService.updateAgentWidget(...args);
      await fetchData();
      return result;
    },
    [fetchData]
  );

  const updateStatus = useCallback(
    async (...args: Parameters<typeof agentService.updateAgentStatus>) => {
      const result = await agentService.updateAgentStatus(...args);
      await fetchData();
      return result;
    },
    [fetchData]
  );

  const deleteAgent = useCallback(
    async (agentId: string) => {
      await agentService.deleteAgent(agentId);
      await fetchData();
    },
    [fetchData]
  );

  const createFromTemplate = useCallback(
    async (templateId: string, name: string) => {
      const result = await agentService.createAgentFromTemplate(
        organizationId,
        templateId,
        name
      );
      await fetchData();
      return result;
    },
    [organizationId, fetchData]
  );

  return {
    agents,
    templates,
    loading,
    error,
    refresh: fetchData,
    createAgent,
    updateConfig,
    updateWidget,
    updateStatus,
    deleteAgent,
    createFromTemplate,
  };
}
