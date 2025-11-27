/**
 * Embed Pro 2.0 - Data Fetching Hook
 * @module embed-pro/hooks/useEmbedProData
 * 
 * Fetches and manages widget data from Supabase.
 * Handles loading, error, and refresh states.
 */

import { useState, useEffect, useCallback } from 'react';
import { embedProDataService } from '../services/embedProData.service';
import type { WidgetData } from '../types/widget.types';

// =====================================================
// HOOK INTERFACE
// =====================================================

interface UseEmbedProDataOptions {
  /** The embed key from URL params */
  embedKey: string | null;
  /** Whether this is a preview (no real bookings) */
  isPreview?: boolean;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseEmbedProDataReturn {
  /** The fetched widget data */
  data: WidgetData | null;
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refresh data from server */
  refresh: () => Promise<void>;
  /** Whether data has been fetched at least once */
  initialized: boolean;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useEmbedProData(options: UseEmbedProDataOptions): UseEmbedProDataReturn {
  const { embedKey, isPreview = false, autoFetch = true } = options;

  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  /**
   * Fetch widget data from Supabase
   */
  const fetchData = useCallback(async () => {
    if (!embedKey) {
      setError('No embed key provided');
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useEmbedProData] Fetching data for key:', embedKey);
      const widgetData = await embedProDataService.getWidgetData(embedKey, isPreview);

      if (!widgetData) {
        setError('Widget configuration not found. Please check your embed code.');
        setData(null);
      } else if (!widgetData.activity && widgetData.activities.length === 0) {
        setError('No activities available for this widget.');
        setData(widgetData);
      } else {
        setData(widgetData);
        console.log('[useEmbedProData] Data loaded:', {
          type: widgetData.type,
          targetType: widgetData.targetType,
          activityCount: widgetData.activities.length,
        });
      }
    } catch (err) {
      console.error('[useEmbedProData] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load widget data');
      setData(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [embedKey, isPreview]);

  /**
   * Refresh data from server
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Auto-fetch on mount and when embedKey changes
  useEffect(() => {
    if (autoFetch && embedKey) {
      fetchData();
    } else if (!embedKey) {
      setInitialized(true);
    }
  }, [autoFetch, embedKey, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    initialized,
  };
}

export default useEmbedProData;
