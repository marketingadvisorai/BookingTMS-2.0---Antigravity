/**
 * useUserReports Hook - User error reports management
 * @module error-monitoring/hooks/useUserReports
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  UserErrorReport,
  ReportStats,
  ReportFilters,
  ReportInput,
  ReportStatus,
} from '../types';
import { userReportsService } from '../services';

interface UseUserReportsOptions {
  initialFilters?: ReportFilters;
  pageSize?: number;
  organizationId?: string;
}

interface UseUserReportsReturn {
  reports: UserErrorReport[];
  stats: ReportStats | null;
  total: number;
  page: number;
  filters: ReportFilters;
  loading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setFilters: (filters: ReportFilters) => void;
  submitReport: (input: ReportInput) => Promise<string | null>;
  updateStatus: (id: string, status: ReportStatus, notes?: string) => Promise<boolean>;
  assignTo: (id: string, userId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useUserReports(
  options: UseUserReportsOptions = {}
): UseUserReportsReturn {
  const { initialFilters = {}, pageSize = 20, organizationId } = options;

  const [reports, setReports] = useState<UserErrorReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ReportFilters>({
    ...initialFilters,
    organizationId,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reportsResult, statsResult] = await Promise.all([
        userReportsService.listReports(filters, page, pageSize),
        userReportsService.getStats(),
      ]);

      if (!mountedRef.current) return;

      setReports(reportsResult.reports);
      setTotal(reportsResult.total);
      setStats(statsResult);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, page, pageSize]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('user_reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_error_reports' },
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

  const submitReport = useCallback(
    async (input: ReportInput): Promise<string | null> => {
      return userReportsService.submitReport(input, organizationId);
    },
    [organizationId]
  );

  const updateStatus = useCallback(
    async (id: string, status: ReportStatus, notes?: string): Promise<boolean> => {
      const success = await userReportsService.updateStatus(id, status, notes);
      if (success) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
      return success;
    },
    []
  );

  const assignTo = useCallback(
    async (id: string, userId: string): Promise<boolean> => {
      const success = await userReportsService.assignTo(id, userId);
      if (success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, assignedTo: userId, status: 'in_progress' } : r
          )
        );
      }
      return success;
    },
    []
  );

  const handleSetFilters = useCallback((newFilters: ReportFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return {
    reports,
    stats,
    total,
    page,
    filters,
    loading,
    error,
    setPage,
    setFilters: handleSetFilters,
    submitReport,
    updateStatus,
    assignTo,
    refresh: fetchData,
  };
}
