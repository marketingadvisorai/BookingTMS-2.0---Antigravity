/**
 * Embed Pro 1.1 - useEmbedConfigs Hook
 * @module embed-pro/hooks/useEmbedConfigs
 * 
 * Manages embed configurations with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { embedConfigService } from '../services';
import type {
  EmbedConfigWithRelations,
  CreateEmbedConfigInput,
  UpdateEmbedConfigInput,
} from '../types';

interface UseEmbedConfigsOptions {
  organizationId?: string;
  autoFetch?: boolean;
}

interface UseEmbedConfigsReturn {
  configs: EmbedConfigWithRelations[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  create: (input: CreateEmbedConfigInput) => Promise<EmbedConfigWithRelations>;
  update: (id: string, input: UpdateEmbedConfigInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<EmbedConfigWithRelations>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
}

export function useEmbedConfigs(options: UseEmbedConfigsOptions = {}): UseEmbedConfigsReturn {
  const { organizationId, autoFetch = true } = options;
  
  const [configs, setConfigs] = useState<EmbedConfigWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch configs
  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = organizationId
        ? await embedConfigService.getByOrganization(organizationId)
        : await embedConfigService.getAll();
      
      setConfigs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch configs'));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Create config
  const create = useCallback(async (input: CreateEmbedConfigInput) => {
    const newConfig = await embedConfigService.create(input);
    await fetchConfigs();
    return newConfig as EmbedConfigWithRelations;
  }, [fetchConfigs]);

  // Update config
  const update = useCallback(async (id: string, input: UpdateEmbedConfigInput) => {
    await embedConfigService.update(id, input);
    await fetchConfigs();
  }, [fetchConfigs]);

  // Delete config
  const remove = useCallback(async (id: string) => {
    await embedConfigService.delete(id);
    setConfigs(prev => prev.filter(c => c.id !== id));
  }, []);

  // Duplicate config
  const duplicate = useCallback(async (id: string) => {
    const newConfig = await embedConfigService.duplicate(id);
    await fetchConfigs();
    return newConfig as EmbedConfigWithRelations;
  }, [fetchConfigs]);

  // Toggle active status
  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    await embedConfigService.toggleActive(id, isActive);
    setConfigs(prev => prev.map(c => 
      c.id === id ? { ...c, is_active: isActive } : c
    ));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchConfigs();
    }
  }, [autoFetch, fetchConfigs]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('embed_configs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'embed_configs' },
        () => {
          fetchConfigs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    refresh: fetchConfigs,
    create,
    update,
    remove,
    duplicate,
    toggleActive,
  };
}
