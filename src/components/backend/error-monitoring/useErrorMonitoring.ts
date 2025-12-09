/**
 * Error Monitoring Hook
 * @module components/backend/error-monitoring/useErrorMonitoring
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { SystemError, FixRequest, ErrorStats } from './types';

interface UseErrorMonitoringReturn {
  errors: SystemError[];
  fixRequests: FixRequest[];
  stats: ErrorStats;
  loading: boolean;
  fetchData: () => Promise<void>;
  handleApproveFix: (fixId: string) => Promise<void>;
  handleRejectFix: (fixId: string, reason: string) => Promise<void>;
}

export function useErrorMonitoring(): UseErrorMonitoringReturn {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [fixRequests, setFixRequests] = useState<FixRequest[]>([]);
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    critical: 0,
    new_today: 0,
    resolved_today: 0,
    pending_fixes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchErrors = useCallback(async () => {
    const { data, error } = await supabase
      .from('system_errors')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setErrors(data as SystemError[]);
    }
  }, []);

  const fetchFixRequests = useCallback(async () => {
    const { data, error } = await supabase
      .from('llm_fix_requests')
      .select('*, system_errors(*)')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setFixRequests(
        data.map((d: any) => ({
          ...d,
          error: d.system_errors,
        }))
      );
    }
  }, []);

  const fetchStats = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: errorsData } = await supabase
      .from('system_errors')
      .select('severity, status, created_at')
      .gte('created_at', today);

    const { count: pendingFixes } = await supabase
      .from('llm_fix_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');

    if (errorsData) {
      setStats({
        total: errorsData.length,
        critical: errorsData.filter((e: any) => e.severity === 'critical').length,
        new_today: errorsData.filter((e: any) => e.status === 'new').length,
        resolved_today: errorsData.filter((e: any) => e.status === 'resolved').length,
        pending_fixes: pendingFixes || 0,
      });
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchErrors(), fetchFixRequests(), fetchStats()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load error monitoring data');
    } finally {
      setLoading(false);
    }
  }, [fetchErrors, fetchFixRequests, fetchStats]);

  const handleApproveFix = useCallback(
    async (fixId: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.rpc('approve_fix_request', {
          p_fix_request_id: fixId,
          p_approved_by: user?.id,
          p_approve: true,
        } as any);

        if (error) {
          toast.error('Failed to approve fix');
        } else {
          toast.success('Fix approved! Executing...');
          fetchFixRequests();
        }
      } catch (err) {
        toast.error('Failed to approve fix');
      }
    },
    [fetchFixRequests]
  );

  const handleRejectFix = useCallback(
    async (fixId: string, reason: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.rpc('approve_fix_request', {
          p_fix_request_id: fixId,
          p_approved_by: user?.id,
          p_approve: false,
          p_rejection_reason: reason,
        } as any);

        if (error) {
          toast.error('Failed to reject fix');
        } else {
          toast.success('Fix rejected');
          fetchFixRequests();
        }
      } catch (err) {
        toast.error('Failed to reject fix');
      }
    },
    [fetchFixRequests]
  );

  return {
    errors,
    fixRequests,
    stats,
    loading,
    fetchData,
    handleApproveFix,
    handleRejectFix,
  };
}
