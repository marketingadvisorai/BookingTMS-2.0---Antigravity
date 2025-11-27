/**
 * Embed Pro 1.1 - useEmbedAnalytics Hook
 * @module embed-pro/hooks/useEmbedAnalytics
 * 
 * Manages analytics data and reporting
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '../services';
import type { EmbedAnalyticsSummary, AnalyticsChartData } from '../types';

interface UseEmbedAnalyticsOptions {
  embedConfigId: string | null;
  startDate?: string;
  endDate?: string;
  autoLoad?: boolean;
}

interface UseEmbedAnalyticsReturn {
  summary: EmbedAnalyticsSummary | null;
  loading: boolean;
  error: Error | null;
  chartData: AnalyticsChartData | null;
  refresh: () => Promise<void>;
  clearAnalytics: () => Promise<void>;
}

export function useEmbedAnalytics(options: UseEmbedAnalyticsOptions): UseEmbedAnalyticsReturn {
  const { embedConfigId, startDate, endDate, autoLoad = true } = options;
  
  const [summary, setSummary] = useState<EmbedAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch analytics summary
  const loadAnalytics = useCallback(async () => {
    if (!embedConfigId) {
      setSummary(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getSummary(embedConfigId, startDate, endDate);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load analytics'));
    } finally {
      setLoading(false);
    }
  }, [embedConfigId, startDate, endDate]);

  // Clear all analytics for this config
  const clearAnalytics = useCallback(async () => {
    if (!embedConfigId) return;
    await analyticsService.clearAnalytics(embedConfigId);
    setSummary(null);
  }, [embedConfigId]);

  // Transform summary to chart data
  const chartData = useMemo((): AnalyticsChartData | null => {
    if (!summary?.events_by_day?.length) return null;

    return {
      labels: summary.events_by_day.map(d => d.date),
      datasets: [
        {
          label: 'Views',
          data: summary.events_by_day.map(d => d.views),
          color: '#3b82f6',
        },
        {
          label: 'Interactions',
          data: summary.events_by_day.map(d => d.interactions),
          color: '#8b5cf6',
        },
        {
          label: 'Bookings',
          data: summary.events_by_day.map(d => d.bookings),
          color: '#22c55e',
        },
      ],
    };
  }, [summary]);

  // Auto-load on mount and dependency changes
  useEffect(() => {
    if (autoLoad && embedConfigId) {
      loadAnalytics();
    }
  }, [autoLoad, embedConfigId, loadAnalytics]);

  return {
    summary,
    loading,
    error,
    chartData,
    refresh: loadAnalytics,
    clearAnalytics,
  };
}
