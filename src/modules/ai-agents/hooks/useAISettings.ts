/**
 * useAISettings Hook
 * System Admin only - manages AI provider settings
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsService } from '../services';
import type { AIAgentSettings, AIProvider, AIModel } from '../types';

interface UseAISettingsReturn {
  settings: AIAgentSettings[];
  usageStats: {
    totalConversations: number;
    totalCalls: number;
    totalTokensUsed: number;
    estimatedCost: number;
  } | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSettings: typeof settingsService.updateSettings;
  saveApiKey: typeof settingsService.saveApiKey;
  addModel: typeof settingsService.addModel;
  removeModel: typeof settingsService.removeModel;
  updateAgentSystemConfig: typeof settingsService.updateAgentSystemConfig;
}

export function useAISettings(): UseAISettingsReturn {
  const [settings, setSettings] = useState<AIAgentSettings[]>([]);
  const [usageStats, setUsageStats] = useState<UseAISettingsReturn['usageStats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const [settingsData, stats] = await Promise.all([
        settingsService.listSettings(),
        settingsService.getUsageStats(),
      ]);

      if (mountedRef.current) {
        setSettings(settingsData);
        setUsageStats(stats);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  // Wrapped methods
  const updateSettings = useCallback(
    async (...args: Parameters<typeof settingsService.updateSettings>) => {
      const result = await settingsService.updateSettings(...args);
      await fetchData();
      return result;
    },
    [fetchData]
  );

  const saveApiKey = useCallback(
    async (...args: Parameters<typeof settingsService.saveApiKey>) => {
      await settingsService.saveApiKey(...args);
      await fetchData();
    },
    [fetchData]
  );

  const addModel = useCallback(
    async (...args: Parameters<typeof settingsService.addModel>) => {
      await settingsService.addModel(...args);
      await fetchData();
    },
    [fetchData]
  );

  const removeModel = useCallback(
    async (...args: Parameters<typeof settingsService.removeModel>) => {
      await settingsService.removeModel(...args);
      await fetchData();
    },
    [fetchData]
  );

  return {
    settings,
    usageStats,
    loading,
    error,
    refresh: fetchData,
    updateSettings,
    saveApiKey,
    addModel,
    removeModel,
    updateAgentSystemConfig: settingsService.updateAgentSystemConfig,
  };
}
