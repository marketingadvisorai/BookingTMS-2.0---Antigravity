/**
 * Embed Pro 1.1 - useEmbedConfigs Hook
 * @module embed-pro/hooks/useEmbedConfigs
 * 
 * Manages embed configurations with real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Refs to prevent race conditions
  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Reset configs when organization changes
  useEffect(() => {
    // Clear configs immediately when organization changes to prevent stale data
    setConfigs([]);
    setLoading(true);
  }, [organizationId]);

  // Fetch configs with debounce protection
  const fetchConfigs = useCallback(async () => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }
      
      console.log('[useEmbedConfigs] Fetching configs for org:', organizationId);
      
      const data = organizationId
        ? await embedConfigService.getByOrganization(organizationId)
        : await embedConfigService.getAll();
      
      console.log('[useEmbedConfigs] Fetched configs:', data.length);
      
      if (mountedRef.current) {
        setConfigs(data);
      }
    } catch (err) {
      console.error('[useEmbedConfigs] Fetch error:', err);
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch configs'));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [organizationId]);

  // Debounced fetch for real-time updates
  const debouncedFetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchConfigs();
    }, 500); // 500ms debounce
  }, [fetchConfigs]);

  // Create config
  const create = useCallback(async (input: CreateEmbedConfigInput) => {
    const newConfig = await embedConfigService.create(input);
    await fetchConfigs();
    return newConfig as EmbedConfigWithRelations;
  }, [fetchConfigs]);

  // Update config - optimistic update + background refresh
  const update = useCallback(async (id: string, input: UpdateEmbedConfigInput) => {
    // Optimistic update - merge updates while preserving existing config/style
    setConfigs(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        ...input,
        config: { ...c.config, ...(input.config || {}) },
        style: { ...c.style, ...(input.style || {}) },
        updated_at: new Date().toISOString(),
      } as EmbedConfigWithRelations;
    }));
    
    try {
      await embedConfigService.update(id, input);
      // Background refresh to get full updated data
      debouncedFetch();
    } catch (err) {
      // Revert on error by re-fetching
      await fetchConfigs();
      throw err;
    }
  }, [fetchConfigs, debouncedFetch]);

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

  // Toggle active status - optimistic update
  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    // Optimistic update
    setConfigs(prev => prev.map(c => 
      c.id === id ? { ...c, is_active: isActive } : c
    ));
    
    try {
      await embedConfigService.toggleActive(id, isActive);
    } catch (err) {
      // Revert on error
      setConfigs(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: !isActive } : c
      ));
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchConfigs();
    }
  }, [autoFetch, fetchConfigs]);

  // Real-time subscription with debounce
  useEffect(() => {
    const channel = supabase
      .channel('embed_configs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'embed_configs' },
        () => {
          // Use debounced fetch to prevent rapid successive calls
          debouncedFetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debouncedFetch]);

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
