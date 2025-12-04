/**
 * Payments Module - Main Hook
 * @module payments/hooks/usePayments
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import {
  PaymentTransaction,
  PaymentStats,
  ReconciliationSummary,
  PaymentFilters,
  DEFAULT_PAYMENT_FILTERS,
} from '../types';
import { paymentService } from '../services';

export interface UsePaymentsOptions {
  organizationId?: string;
  autoFetch?: boolean;
}

export interface UsePaymentsReturn {
  transactions: PaymentTransaction[];
  stats: PaymentStats;
  reconciliation: ReconciliationSummary;
  loading: boolean;
  error: string | null;
  filters: PaymentFilters;
  setFilters: (filters: PaymentFilters) => void;
  
  // Actions
  refreshTransactions: () => Promise<void>;
  refreshStats: () => Promise<void>;
  reconcileTransaction: (transactionId: string) => Promise<void>;
  processRefund: (transactionId: string, amount: number, reason: string, notes?: string) => Promise<void>;
}

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsReturn {
  const { autoFetch = true } = options;
  const { currentUser } = useAuth();
  const organizationId = options.organizationId || currentUser?.organizationId;

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0,
    transactionCount: 0,
    avgTransactionValue: 0,
    successRate: 0,
    pendingCount: 0,
    failedCount: 0,
  });
  const [reconciliation, setReconciliation] = useState<ReconciliationSummary>({
    reconciledCount: 0,
    reconciledAmount: 0,
    unreconciledCount: 0,
    unreconciledAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_PAYMENT_FILTERS);

  const mountedRef = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch transactions
  const refreshTransactions = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await paymentService.list(organizationId, filters);
      if (mountedRef.current) {
        setTransactions(data);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [organizationId, filters]);

  // Fetch stats
  const refreshStats = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    try {
      const [statsData, reconData] = await Promise.all([
        paymentService.getStats(organizationId),
        paymentService.getReconciliationSummary(organizationId),
      ]);

      if (mountedRef.current) {
        setStats(statsData);
        setReconciliation(reconData);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, [organizationId]);

  // Reconcile transaction
  const reconcileTransaction = useCallback(
    async (transactionId: string) => {
      if (!currentUser?.id) return;

      try {
        await paymentService.reconcile(transactionId, currentUser.id);
        toast.success('Transaction marked as reconciled');
        await Promise.all([refreshTransactions(), refreshStats()]);
      } catch (err: any) {
        console.error('Error reconciling:', err);
        toast.error('Failed to reconcile transaction');
      }
    },
    [currentUser?.id, refreshTransactions, refreshStats]
  );

  // Process refund
  const processRefund = useCallback(
    async (transactionId: string, amount: number, reason: string, notes?: string) => {
      try {
        await paymentService.processRefund(transactionId, amount, reason, notes);
        toast.success('Refund processed successfully');
        await Promise.all([refreshTransactions(), refreshStats()]);
      } catch (err: any) {
        console.error('Error processing refund:', err);
        toast.error('Failed to process refund');
      }
    },
    [refreshTransactions, refreshStats]
  );

  // Real-time subscription
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase.channel('payments-changes');

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_transactions' }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) {
            refreshTransactions();
            refreshStats();
          }
        }, 500);
      })
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [organizationId, refreshTransactions, refreshStats]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch && organizationId) {
      refreshTransactions();
      refreshStats();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, organizationId, refreshTransactions, refreshStats]);

  return {
    transactions,
    stats,
    reconciliation,
    loading,
    error,
    filters,
    setFilters,
    refreshTransactions,
    refreshStats,
    reconcileTransaction,
    processRefund,
  };
}
