/**
 * useHealthStatus Hook - System health monitoring hook
 * @module error-monitoring/hooks/useHealthStatus
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { HealthSummary, SystemStatus, HealthCheck } from '../types';
import { healthCheckService } from '../services';

interface UseHealthStatusOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseHealthStatusReturn {
  systemStatus: SystemStatus | null;
  summaries: HealthSummary[];
  recentChecks: Map<string, HealthCheck[]>;
  loading: boolean;
  error: string | null;
  runChecks: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useHealthStatus(
  options: UseHealthStatusOptions = {}
): UseHealthStatusReturn {
  const { autoRefresh = true, refreshInterval = 60000 } = options;

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [summaries, setSummaries] = useState<HealthSummary[]>([]);
  const [recentChecks, setRecentChecks] = useState<Map<string, HealthCheck[]>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const [status, healthSummaries] = await Promise.all([
        healthCheckService.getSystemStatus(),
        healthCheckService.getHealthSummary(),
      ]);

      if (!mountedRef.current) return;

      setSystemStatus(status);
      setSummaries(healthSummaries);

      // Fetch recent checks for each service
      const checksMap = new Map<string, HealthCheck[]>();
      for (const summary of healthSummaries) {
        const checks = await healthCheckService.getRecentChecks(
          summary.serviceName,
          10
        );
        checksMap.set(summary.serviceName, checks);
      }

      if (!mountedRef.current) return;
      setRecentChecks(checksMap);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch health');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const runChecks = useCallback(async () => {
    try {
      setLoading(true);
      await healthCheckService.runAllChecks();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run checks');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('health_monitoring')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'health_checks' },
        () => {
          setTimeout(fetchData, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    systemStatus,
    summaries,
    recentChecks,
    loading,
    error,
    runChecks,
    refresh: fetchData,
  };
}
