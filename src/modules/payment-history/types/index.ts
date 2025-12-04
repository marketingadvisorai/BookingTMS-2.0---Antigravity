/**
 * Payment History Types
 * @module payment-history/types
 */

// Re-export from existing payment types
export type {
  Transaction,
  PaymentStatus,
  PaymentMethod,
  RefundReason,
} from '../../../types/payment';

import type { PaymentStatus, PaymentMethod } from '../../../types/payment';

// Revenue metrics type
export interface RevenueMetrics {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  successRate: number;
  transactionCount: number;
}

// Reconciliation summary type
export interface ReconciliationSummary {
  reconciledTransactions: number;
  reconciledAmount: number;
  unreconciledTransactions: number;
  unreconciledAmount: number;
  lastReconciledDate: string | null;
}

// Filter state type
export interface TransactionFilters {
  searchQuery: string;
  statusFilter: PaymentStatus | 'all';
  paymentMethodFilter: PaymentMethod | 'all';
  dateFilter: 'today' | 'week' | 'month' | 'all';
}

// Export format type
export type ExportFormat = 'csv' | 'pdf';
