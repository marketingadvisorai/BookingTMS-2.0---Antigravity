/**
 * Payment Service
 * CRUD operations for payment transactions
 * @module payments/services/payment.service
 */

import { supabase } from '@/lib/supabase/client';
import {
  PaymentTransaction,
  DBPaymentTransaction,
  PaymentStats,
  ReconciliationSummary,
  PaymentFilters,
} from '../types';
import { mapDBPaymentToUI } from '../utils/mappers';

class PaymentService {
  /**
   * List payment transactions
   */
  async list(
    organizationId: string,
    filters?: PaymentFilters,
    limit = 50,
    offset = 0
  ): Promise<PaymentTransaction[]> {
    let query = (supabase.from('payment_transactions') as any)
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters?.reconciled !== undefined) {
      query = query.eq('reconciled', filters.reconciled);
    }

    if (filters?.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(error.message);
    }

    let transactions = ((data || []) as DBPaymentTransaction[]).map(mapDBPaymentToUI);

    // Client-side search filter
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.transactionRef.toLowerCase().includes(search) ||
          t.customerName?.toLowerCase().includes(search) ||
          t.customerEmail?.toLowerCase().includes(search) ||
          t.bookingId?.toLowerCase().includes(search)
      );
    }

    return transactions;
  }

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<PaymentTransaction | null> {
    const { data, error } = await (supabase.from('payment_transactions') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching transaction:', error);
      throw new Error(error.message);
    }

    return data ? mapDBPaymentToUI(data as DBPaymentTransaction) : null;
  }

  /**
   * Get payment stats
   */
  async getStats(
    organizationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentStats> {
    const { data, error } = await (supabase.rpc as any)('get_payment_stats', {
      p_organization_id: organizationId,
      p_start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      p_end_date: endDate || new Date().toISOString(),
    });

    if (error) {
      console.error('Error fetching stats:', error);
      return {
        totalRevenue: 0,
        totalRefunds: 0,
        netRevenue: 0,
        transactionCount: 0,
        avgTransactionValue: 0,
        successRate: 0,
        pendingCount: 0,
        failedCount: 0,
      };
    }

    const row = (data?.[0] || data || {}) as any;
    return {
      totalRevenue: row.total_revenue || 0,
      totalRefunds: row.total_refunds || 0,
      netRevenue: row.net_revenue || 0,
      transactionCount: row.transaction_count || 0,
      avgTransactionValue: row.avg_transaction_value || 0,
      successRate: row.success_rate || 0,
      pendingCount: row.pending_count || 0,
      failedCount: row.failed_count || 0,
    };
  }

  /**
   * Get reconciliation summary
   */
  async getReconciliationSummary(organizationId: string): Promise<ReconciliationSummary> {
    const { data, error } = await (supabase.rpc as any)('get_reconciliation_summary', {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('Error fetching reconciliation:', error);
      return {
        reconciledCount: 0,
        reconciledAmount: 0,
        unreconciledCount: 0,
        unreconciledAmount: 0,
      };
    }

    const row = (data?.[0] || data || {}) as any;
    return {
      reconciledCount: row.reconciled_count || 0,
      reconciledAmount: row.reconciled_amount || 0,
      unreconciledCount: row.unreconciled_count || 0,
      unreconciledAmount: row.unreconciled_amount || 0,
      lastReconciledDate: row.last_reconciled_date,
    };
  }

  /**
   * Mark transaction as reconciled
   */
  async reconcile(transactionId: string, userId: string): Promise<void> {
    const { error } = await (supabase.from('payment_transactions') as any)
      .update({
        reconciled: true,
        reconciled_at: new Date().toISOString(),
        reconciled_by: userId,
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Error reconciling:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Process refund (calls Edge Function)
   */
  async processRefund(
    transactionId: string,
    amount: number,
    reason: string,
    notes?: string
  ): Promise<void> {
    const { error } = await supabase.functions.invoke('process-refund', {
      body: {
        transaction_id: transactionId,
        amount,
        reason,
        notes,
      },
    });

    if (error) {
      console.error('Error processing refund:', error);
      throw new Error(error.message);
    }
  }
}

export const paymentService = new PaymentService();
