/**
 * useCapacityManagement Hook
 * Hook for managing session blocking and capacity
 */

import { useState, useCallback } from 'react';
import { capacityService } from '../services/capacity.service';
import type {
  BlockedSession,
  BlockSessionRequest,
  CapacityStats,
} from '../types';

interface UseCapacityManagementState {
  blockedSessions: BlockedSession[];
  stats: CapacityStats | null;
  isLoading: boolean;
  error: string | null;
}

interface UseCapacityManagementReturn extends UseCapacityManagementState {
  blockSession: (request: BlockSessionRequest) => Promise<boolean>;
  unblockSession: (blockedSessionId: string) => Promise<boolean>;
  fetchBlockedSessions: (activityId: string, startDate?: string, endDate?: string) => Promise<void>;
  fetchStats: (activityId: string, startDate: string, endDate: string) => Promise<void>;
  setCapacityOverride: (
    activityId: string,
    date: string,
    maxCapacity: number,
    startTime?: string
  ) => Promise<boolean>;
}

export function useCapacityManagement(): UseCapacityManagementReturn {
  const [state, setState] = useState<UseCapacityManagementState>({
    blockedSessions: [],
    stats: null,
    isLoading: false,
    error: null,
  });

  const blockSession = useCallback(async (request: BlockSessionRequest): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const result = await capacityService.blockSession(request);

    if (result) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        blockedSessions: [...prev.blockedSessions, result],
      }));
      return true;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: 'Failed to block session',
    }));
    return false;
  }, []);

  const unblockSession = useCallback(async (blockedSessionId: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const success = await capacityService.unblockSession(blockedSessionId);

    if (success) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        blockedSessions: prev.blockedSessions.filter((s) => s.id !== blockedSessionId),
      }));
      return true;
    }

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: 'Failed to unblock session',
    }));
    return false;
  }, []);

  const fetchBlockedSessions = useCallback(
    async (activityId: string, startDate?: string, endDate?: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const sessions = await capacityService.getBlockedSessions(activityId, startDate, endDate);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        blockedSessions: sessions,
      }));
    },
    []
  );

  const fetchStats = useCallback(
    async (activityId: string, startDate: string, endDate: string): Promise<void> => {
      const stats = await capacityService.getCapacityStats(activityId, startDate, endDate);
      setState((prev) => ({ ...prev, stats }));
    },
    []
  );

  const setCapacityOverride = useCallback(
    async (
      activityId: string,
      date: string,
      maxCapacity: number,
      startTime?: string
    ): Promise<boolean> => {
      const result = await capacityService.setCapacityOverride(
        activityId,
        date,
        maxCapacity,
        startTime
      );
      return result !== null;
    },
    []
  );

  return {
    ...state,
    blockSession,
    unblockSession,
    fetchBlockedSessions,
    fetchStats,
    setCapacityOverride,
  };
}
