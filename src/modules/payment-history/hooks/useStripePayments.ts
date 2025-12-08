/**
 * Stripe Payments Hook
 * State management for real Stripe payment data
 * @module payment-history/hooks/useStripePayments
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
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
  const organizationId = options.organizationId || currentUser?.organizationId;

  const [transactions, setTransactions] = useState<MappedTransaction[]>([]);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [balance, setBalance] = useState<StripeBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const mountedRef = useRef(true);

  // Fetch transactions
  const fetchTransactions = useCallback(async (startingAfter?: string) => {
    if (!organizationId || !mountedRef.current) return;

    if (!startingAfter) setLoading(true);
    setError(null);

    try {
      const result = await stripePaymentsService.getCharges(organizationId, 50, startingAfter);

      if (!mountedRef.current) return;

      const mapped = result.data.map((charge: StripeCharge) =>
        stripePaymentsService.mapChargeToTransaction(charge)
      );

      if (startingAfter) {
        setTransactions((prev) => [...prev, ...mapped]);
      } else {
        setTransactions(mapped);
      }
      setHasMore(result.hasMore);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      if (mountedRef.current) {
        setError(err.message);
        // Fallback to empty array if Stripe not connected
        if (err.message.includes('not connected')) {
          setTransactions([]);
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [organizationId]);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    try {
      const result = await stripePaymentsService.getRevenueSummary(organizationId);
      if (mountedRef.current) {
        setSummary(result);
      }
    } catch (err: any) {
      console.error('Error fetching summary:', err);
      // Set default summary if Stripe not connected
      if (mountedRef.current) {
        setSummary({
          totalRevenue: 0,
          totalRefunds: 0,
          netRevenue: 0,
          transactionCount: 0,
          successRate: 0,
          failedCount: 0,
          currency: 'USD',
        });
      }
    }
  }, [organizationId]);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    try {
      const result = await stripePaymentsService.getBalance(organizationId);
      if (mountedRef.current) {
        setBalance(result);
      }
    } catch (err: any) {
      console.error('Error fetching balance:', err);
    }
  }, [organizationId]);

  // Load more transactions
  const loadMore = useCallback(() => {
    if (!hasMore || !transactions.length) return;
    const lastId = transactions[transactions.length - 1]?.id;
    fetchTransactions(lastId);
  }, [hasMore, transactions, fetchTransactions]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchTransactions(),
      fetchSummary(),
      fetchBalance(),
    ]);
    toast.success('Data refreshed');
  }, [fetchTransactions, fetchSummary, fetchBalance]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch && organizationId) {
      fetchTransactions();
      fetchSummary();
      fetchBalance();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, organizationId, fetchTransactions, fetchSummary, fetchBalance]);

  return {
    transactions,
    summary,
    balance,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    isConnected: !error?.includes('not connected'),
  };
}
