/**
 * useCustomerDedup Hook
 * Hook for managing customer deduplication
 */

import { useState, useCallback } from 'react';
import { customerDedupService } from '../services/customerDedup.service';
import type {
  DuplicateGroup,
  MergeCustomersRequest,
  MergeResult,
  DedupStats,
} from '../types';

interface UseCustomerDedupState {
  duplicateGroups: DuplicateGroup[];
  stats: DedupStats | null;
  isScanning: boolean;
  isMerging: boolean;
  error: string | null;
}

interface UseCustomerDedupReturn extends UseCustomerDedupState {
  scanForDuplicates: (organizationId?: string) => Promise<void>;
  mergeCustomers: (request: MergeCustomersRequest) => Promise<MergeResult>;
  refreshStats: (organizationId?: string) => Promise<void>;
  dismissGroup: (primaryId: string) => void;
}

export function useCustomerDedup(): UseCustomerDedupReturn {
  const [state, setState] = useState<UseCustomerDedupState>({
    duplicateGroups: [],
    stats: null,
    isScanning: false,
    isMerging: false,
    error: null,
  });

  const scanForDuplicates = useCallback(async (organizationId?: string): Promise<void> => {
    setState((prev) => ({ ...prev, isScanning: true, error: null }));

    try {
      const groups = await customerDedupService.findDuplicates(organizationId);
      const stats = await customerDedupService.getStats(organizationId);

      setState((prev) => ({
        ...prev,
        duplicateGroups: groups,
        stats,
        isScanning: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isScanning: false,
        error: error instanceof Error ? error.message : 'Failed to scan for duplicates',
      }));
    }
  }, []);

  const mergeCustomers = useCallback(async (request: MergeCustomersRequest): Promise<MergeResult> => {
    setState((prev) => ({ ...prev, isMerging: true, error: null }));

    try {
      const result = await customerDedupService.mergeCustomers(request);

      if (result.success) {
        setState((prev) => ({
          ...prev,
          isMerging: false,
          duplicateGroups: prev.duplicateGroups.filter(
            (g) => g.primaryCustomerId !== request.primaryCustomerId
          ),
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isMerging: false,
          error: result.error || 'Merge failed',
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Merge failed';
      setState((prev) => ({
        ...prev,
        isMerging: false,
        error: errorMessage,
      }));

      return {
        success: false,
        mergedCustomerId: request.primaryCustomerId,
        bookingsMoved: 0,
        duplicatesRemoved: 0,
        error: errorMessage,
      };
    }
  }, []);

  const refreshStats = useCallback(async (organizationId?: string): Promise<void> => {
    const stats = await customerDedupService.getStats(organizationId);
    setState((prev) => ({ ...prev, stats }));
  }, []);

  const dismissGroup = useCallback((primaryId: string): void => {
    setState((prev) => ({
      ...prev,
      duplicateGroups: prev.duplicateGroups.filter((g) => g.primaryCustomerId !== primaryId),
    }));
  }, []);

  return {
    ...state,
    scanForDuplicates,
    mergeCustomers,
    refreshStats,
    dismissGroup,
  };
}
