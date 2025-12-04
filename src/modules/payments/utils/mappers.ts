/**
 * Payments Module - Data Mappers
 * @module payments/utils/mappers
 */

import { PaymentTransaction, DBPaymentTransaction, PaymentStatus } from '../types';

export function mapDBPaymentToUI(db: DBPaymentTransaction): PaymentTransaction {
  return {
    id: db.id,
    organizationId: db.organization_id,
    bookingId: db.booking_id,
    customerId: db.customer_id,
    transactionRef: db.transaction_ref,
    stripePaymentIntentId: db.stripe_payment_intent_id,
    stripeChargeId: db.stripe_charge_id,
    type: db.type,
    amount: db.amount,
    currency: db.currency || 'USD',
    feeAmount: db.fee_amount || 0,
    netAmount: db.net_amount || db.amount,
    refundAmount: db.refund_amount || 0,
    refundReason: db.refund_reason,
    refundNotes: db.refund_notes,
    refundedAt: db.refunded_at,
    refundedBy: db.refunded_by,
    paymentMethod: db.payment_method,
    cardBrand: db.card_brand,
    cardLast4: db.card_last4,
    cardExpMonth: db.card_exp_month,
    cardExpYear: db.card_exp_year,
    status: db.status,
    customerName: db.customer_name,
    customerEmail: db.customer_email,
    invoiceNumber: db.invoice_number,
    invoiceUrl: db.invoice_url,
    receiptUrl: db.receipt_url,
    reconciled: db.reconciled ?? false,
    reconciledAt: db.reconciled_at,
    reconciledBy: db.reconciled_by,
    metadata: db.metadata,
    errorMessage: db.error_message,
    createdAt: db.created_at,
    processedAt: db.processed_at,
    updatedAt: db.updated_at,
  };
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getStatusColor(status: PaymentStatus, isDark: boolean): string {
  const colors: Record<PaymentStatus, { light: string; dark: string }> = {
    completed: {
      light: 'bg-green-100 text-green-700 border-green-200',
      dark: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    pending: {
      light: 'bg-amber-100 text-amber-700 border-amber-200',
      dark: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    processing: {
      light: 'bg-blue-100 text-blue-700 border-blue-200',
      dark: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    failed: {
      light: 'bg-red-100 text-red-700 border-red-200',
      dark: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    cancelled: {
      light: 'bg-gray-100 text-gray-700 border-gray-200',
      dark: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    },
    refunded: {
      light: 'bg-purple-100 text-purple-700 border-purple-200',
      dark: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
    partially_refunded: {
      light: 'bg-orange-100 text-orange-700 border-orange-200',
      dark: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    disputed: {
      light: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      dark: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    chargeback: {
      light: 'bg-red-100 text-red-700 border-red-200',
      dark: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };

  const color = colors[status] || colors.pending;
  return isDark ? color.dark : color.light;
}

export function getPaymentMethodDisplay(method?: string, brand?: string, last4?: string): string {
  if (brand && last4) {
    return `${brand} •••• ${last4}`;
  }
  if (method) {
    return method.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
  return 'Unknown';
}
