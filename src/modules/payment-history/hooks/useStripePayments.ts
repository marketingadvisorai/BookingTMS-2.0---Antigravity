/**
 * Stripe Payments Hook
 * State management for real Stripe payment data
 * Uses React Query for caching and smooth loading
 * @module payment-history/hooks/useStripePayments
 */

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { CACHE_TIMES } from '@/lib/cache';
import {
  stripePaymentsService,
  StripeCharge,
  RevenueSummary,
  StripeBalance,
} from '../services/stripe-payments.service';

interface UseStripePaymentsOptions {
  organizationId?: string;
  autoFetch?: boolean;
}

export interface MappedTransaction {
  id: string;
  transactionRef: string;
  type: 'payment' | 'refund';
  status: string;
  amount: number;
  refundAmount: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  paymentMethod: {
    type: string;
    brand?: string;
    last4?: string;
  };
  createdAt: Date;
  bookingId?: string;
}

export function useStripePayments(options: UseStripePaymentsOptions = {}) {
  const { autoFetch = true } = options;
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = options.organizationId || currentUser?.organizationId;

  // Local state for pagination
  const [additionalTransactions, setAdditionalTransactions] = useState<MappedTransaction[]>([]);
  const [hasMore, setHasMore] = useState(false);

  // Query keys
  const transactionsKey = ['payments', 'transactions', organizationId];
  const summaryKey = ['payments', 'summary', organizationId];
  const balanceKey = ['payments', 'balance', organizationId];

  // React Query for transactions
  const transactionsQuery = useQuery({
    queryKey: transactionsKey,
    queryFn: async () => {
      const result = await stripePaymentsService.getCharges(organizationId!, 50);
      setHasMore(result.hasMore);
      return result.data.map((charge: StripeCharge) =>
        stripePaymentsService.mapChargeToTransaction(charge)
      );
    },
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.SHORT, // 1 minute for payment data
  });

  // React Query for summary
  const summaryQuery = useQuery({
    queryKey: summaryKey,
    queryFn: () => stripePaymentsService.getRevenueSummary(organizationId!),
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.SHORT,
  });

  // React Query for balance
  const balanceQuery = useQuery({
    queryKey: balanceKey,
    queryFn: () => stripePaymentsService.getBalance(organizationId!),
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.SHORT,
  });

  // Combine transactions
  const transactions = [
    ...(transactionsQuery.data || []),
    ...additionalTransactions,
  ];

  // Default summary if error
  const summary: RevenueSummary | null = summaryQuery.data || (summaryQuery.isError ? {
    totalRevenue: 0,
    totalRefunds: 0,
    netRevenue: 0,
    transactionCount: 0,
    successRate: 0,
    failedCount: 0,
    currency: 'USD',
  } : null);

  const balance = balanceQuery.data || null;
  const loading = transactionsQuery.isLoading || summaryQuery.isLoading;
  const error = transactionsQuery.error?.message || summaryQuery.error?.message || null;
  const isConnected = !error?.includes('not connected');

  // Load more transactions
  const loadMore = useCallback(async () => {
    if (!hasMore || !transactions.length || !organizationId) return;
    const lastId = transactions[transactions.length - 1]?.id;
    
    try {
      const result = await stripePaymentsService.getCharges(organizationId, 50, lastId);
      const mapped = result.data.map((charge: StripeCharge) =>
        stripePaymentsService.mapChargeToTransaction(charge)
      );
      setAdditionalTransactions((prev) => [...prev, ...mapped]);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading more:', err);
    }
  }, [hasMore, transactions, organizationId]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setAdditionalTransactions([]);
    await queryClient.invalidateQueries({ queryKey: ['payments'] });
    toast.success('Data refreshed');
  }, [queryClient]);

  return {
    transactions,
    summary,
    balance,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isConnected,
  };
}
