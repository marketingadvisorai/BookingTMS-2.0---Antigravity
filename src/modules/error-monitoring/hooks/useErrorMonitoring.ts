/**
 * useErrorMonitoring Hook - Main error monitoring dashboard hook
 * @module error-monitoring/hooks/useErrorMonitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  SystemError,
  ErrorStats,
  ErrorFilters,
  ErrorStatus,
} from '../types';
import { errorStoreService } from '../services';

interface UseErrorMonitoringOptions {
  initialFilters?: ErrorFilters;
  pageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseErrorMonitoringReturn {
  errors: SystemError[];
  stats: ErrorStats | null;
  total: number;
  page: number;
  pageSize: number;
  filters: ErrorFilters;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setFilters: (filters: ErrorFilters) => void;
  updateStatus: (id: string, status: ErrorStatus) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useErrorMonitoring(
  options: UseErrorMonitoringOptions = {}
): UseErrorMonitoringReturn {
  const {
    initialFilters = {},
    pageSize = 20,
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

  const [errors, setErrors] = useState<SystemError[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ErrorFilters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Fetch errors and stats in parallel
      const [errorsResult, statsResult] = await Promise.all([
        errorStoreService.listErrors(filters, page, pageSize),
        errorStoreService.getStats(filters.timeRange || '24h'),
      ]);

      if (!mountedRef.current) return;

      setErrors(errorsResult.errors);
      setTotal(errorsResult.total);
      setStats(statsResult);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [filters, page, pageSize]);

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
      .channel('error_monitoring')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_errors' },
        () => {
          // Debounce updates
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

  const updateStatus = useCallback(
    async (id: string, status: ErrorStatus): Promise<boolean> => {
      const success = await errorStoreService.updateStatus(id, status);
      if (success) {
        setErrors((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status } : e))
        );
      }
      return success;
    },
    []
  );

  const handleSetFilters = useCallback((newFilters: ErrorFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  }, []);

  return {
    errors,
    stats,
    total,
    page,
    pageSize,
    filters,
    loading,
    error,
    setPage,
    setFilters: handleSetFilters,
    updateStatus,
    refresh: fetchData,
  };
}
