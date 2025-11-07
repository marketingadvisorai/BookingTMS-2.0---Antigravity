/**
 * Payment & Transaction Type Definitions
 * Comprehensive type system for payment management
 */

export type PaymentStatus = 
  | 'completed' 
  | 'pending' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded'
  | 'processing'
  | 'cancelled';

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'gift_card' 
  | 'bank_transfer'
  | 'paypal'
  | 'stripe'
  | 'square';

export type TransactionType = 
  | 'booking_payment' 
  | 'refund' 
  | 'partial_refund' 
  | 'cancellation_fee'
  | 'adjustment'
  | 'chargeback';

export type RefundReason = 
  | 'customer_request' 
  | 'booking_cancelled' 
  | 'duplicate_charge' 
  | 'service_issue'
  | 'overcharge'
  | 'other';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  last4?: string; // Last 4 digits for cards
  brand?: string; // Visa, Mastercard, etc.
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
}

export interface Transaction {
  id: string;
  bookingId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  
  // Transaction details
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  
  // Payment method
  paymentMethod: PaymentMethodDetails;
  
  // Timestamps
  createdAt: string;
  processedAt?: string;
  refundedAt?: string;
  
  // References
  transactionRef: string; // External payment processor reference
  invoiceNumber?: string;
  receiptUrl?: string;
  
  // Refund information
  refundAmount?: number;
  refundReason?: RefundReason;
  refundNotes?: string;
  refundedBy?: string;
  originalTransactionId?: string; // For refunds
  
  // Additional metadata
  description?: string;
  notes?: string;
  tags?: string[];
  
  // Reconciliation
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  
  // Audit trail
  createdBy: string;
  ipAddress?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: RefundReason;
  notes?: string;
  notifyCustomer: boolean;
}

export interface PaymentFilter {
  status?: PaymentStatus[];
  paymentMethod?: PaymentMethod[];
  transactionType?: TransactionType[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  customerId?: string;
  bookingId?: string;
  searchQuery?: string;
  reconciled?: boolean;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  successRate: number;
  
  // Breakdown by payment method
  byPaymentMethod: {
    method: PaymentMethod;
    amount: number;
    count: number;
    percentage: number;
  }[];
  
  // Breakdown by status
  byStatus: {
    status: PaymentStatus;
    amount: number;
    count: number;
    percentage: number;
  }[];
  
  // Time-based metrics
  dailyRevenue: {
    date: string;
    revenue: number;
    refunds: number;
    net: number;
  }[];
}

export interface ReconciliationSummary {
  totalTransactions: number;
  reconciledTransactions: number;
  unreconciledTransactions: number;
  totalAmount: number;
  reconciledAmount: number;
  unreconciledAmount: number;
  lastReconciledDate?: string;
}

export interface SavedPaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethod;
  details: PaymentMethodDetails;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}
