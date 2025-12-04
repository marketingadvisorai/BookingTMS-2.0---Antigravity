/**
 * Payments Module - Type Definitions
 * @module payments/types
 */

// ============================================================================
// Payment Transaction Types
// ============================================================================

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'
  | 'refunded' 
  | 'partially_refunded' 
  | 'disputed' 
  | 'chargeback';

export type TransactionType = 'payment' | 'refund' | 'partial_refund' | 'chargeback' | 'fee';

export interface PaymentTransaction {
  id: string;
  organizationId: string;
  bookingId?: string;
  customerId?: string;
  
  transactionRef: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  
  type: TransactionType;
  amount: number;
  currency: string;
  feeAmount: number;
  netAmount: number;
  
  refundAmount: number;
  refundReason?: string;
  refundNotes?: string;
  refundedAt?: string;
  refundedBy?: string;
  
  paymentMethod?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  
  status: PaymentStatus;
  
  customerName?: string;
  customerEmail?: string;
  
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  
  createdAt: string;
  processedAt?: string;
  updatedAt: string;
}

export interface DBPaymentTransaction {
  id: string;
  organization_id: string;
  booking_id?: string;
  customer_id?: string;
  transaction_ref: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  fee_amount: number;
  net_amount: number;
  refund_amount: number;
  refund_reason?: string;
  refund_notes?: string;
  refunded_at?: string;
  refunded_by?: string;
  payment_method?: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  status: PaymentStatus;
  customer_name?: string;
  customer_email?: string;
  invoice_number?: string;
  invoice_url?: string;
  receipt_url?: string;
  reconciled: boolean;
  reconciled_at?: string;
  reconciled_by?: string;
  metadata?: Record<string, unknown>;
  error_message?: string;
  created_at: string;
  processed_at?: string;
  updated_at: string;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface PaymentStats {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  avgTransactionValue: number;
  successRate: number;
  pendingCount: number;
  failedCount: number;
}

export interface ReconciliationSummary {
  reconciledCount: number;
  reconciledAmount: number;
  unreconciledCount: number;
  unreconciledAmount: number;
  lastReconciledDate?: string;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface PaymentFilters {
  search: string;
  status: PaymentStatus | 'all';
  type: TransactionType | 'all';
  dateRange: 'today' | 'week' | 'month' | 'all';
  reconciled?: boolean;
}

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  search: '',
  status: 'all',
  type: 'all',
  dateRange: 'all',
};

// ============================================================================
// Refund Types
// ============================================================================

export type RefundReason = 
  | 'customer_request' 
  | 'duplicate_charge' 
  | 'service_not_provided'
  | 'event_cancelled' 
  | 'other';

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: RefundReason;
  notes?: string;
  notifyCustomer: boolean;
}
