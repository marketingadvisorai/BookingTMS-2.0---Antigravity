/**
 * Payment History Module
 * @module payment-history
 */

// Pages
export { PaymentHistoryPage } from './pages/PaymentHistoryPage';

// Stripe Components (Real Data)
export { StripeRevenueMetrics } from './components/StripeRevenueMetrics';
export { StripeTransactionFilters } from './components/StripeTransactionFilters';
export { StripeTransactionsTable } from './components/StripeTransactionsTable';

// Legacy Components (for backward compatibility)
export {
  RevenueMetricsSection,
  TransactionFilters,
  TransactionsTable,
  ReconciliationSection,
  TransactionDetailDialog,
  ExportDialog,
} from './components';

// Hooks
export { useStripePayments } from './hooks/useStripePayments';

// Services
export { stripePaymentsService } from './services/stripe-payments.service';

// Types
export type {
  Transaction,
  PaymentStatus,
  PaymentMethod,
  RefundReason,
  RevenueMetrics,
  ReconciliationSummary,
  TransactionFilters as TransactionFiltersType,
  ExportFormat,
} from './types';

export type { MappedTransaction } from './hooks/useStripePayments';
