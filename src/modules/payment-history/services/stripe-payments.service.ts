/**
 * Stripe Payments Service
 * Fetches real payment data from Stripe via edge function
 * @module payment-history/services/stripe-payments.service
 */

import { supabase } from '@/lib/supabase/client';

export interface StripeCharge {
  id: string;
  amount: number;
  amountRefunded: number;
  currency: string;
  status: string;
  created: number;
  description: string | null;
  metadata: Record<string, string>;
  customer: string | null;
  receiptEmail: string | null;
  refunded: boolean;
  paymentIntent: string | null;
  paymentMethodDetails: {
    type: string;
    card: {
      brand: string;
      last4: string;
      expMonth: number;
      expYear: number;
    } | null;
  };
}

export interface StripeRefund {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  reason: string | null;
  chargeId: string;
  paymentIntentId: string | null;
}

export interface StripeBalance {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
}

export interface StripePayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  arrivalDate: number;
  method: string;
  type: string;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  successRate: number;
  failedCount: number;
  currency: string;
}

class StripePaymentsService {
  private async callEdgeFunction<T>(action: string, params: Record<string, any> = {}): Promise<T> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.access_token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-payments-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ action, ...params }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch data');
    }

    return response.json();
  }

  /**
   * Get charges (transactions) from Stripe
   */
  async getCharges(
    organizationId: string,
    limit = 50,
    startingAfter?: string
  ): Promise<{ data: StripeCharge[]; hasMore: boolean }> {
    return this.callEdgeFunction('list_charges', { organizationId, limit, startingAfter });
  }

  /**
   * Get refunds from Stripe
   */
  async getRefunds(
    organizationId: string,
    limit = 50,
    startingAfter?: string
  ): Promise<{ data: StripeRefund[]; hasMore: boolean }> {
    return this.callEdgeFunction('list_refunds', { organizationId, limit, startingAfter });
  }

  /**
   * Get balance from Stripe
   */
  async getBalance(organizationId: string): Promise<StripeBalance> {
    return this.callEdgeFunction('get_balance', { organizationId });
  }

  /**
   * Get payouts from Stripe
   */
  async getPayouts(
    organizationId: string,
    limit = 50,
    startingAfter?: string
  ): Promise<{ data: StripePayout[]; hasMore: boolean }> {
    return this.callEdgeFunction('list_payouts', { organizationId, limit, startingAfter });
  }

  /**
   * Get revenue summary from Stripe
   */
  async getRevenueSummary(organizationId: string): Promise<RevenueSummary> {
    return this.callEdgeFunction('get_revenue_summary', { organizationId });
  }

  /**
   * Convert Stripe charge to our Transaction format
   */
  mapChargeToTransaction(charge: StripeCharge): {
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
  } {
    return {
      id: charge.id,
      transactionRef: charge.id,
      type: 'payment',
      status: charge.status === 'succeeded' ? 'completed' : charge.status,
      amount: charge.amount / 100,
      refundAmount: charge.amountRefunded / 100,
      currency: charge.currency.toUpperCase(),
      customerEmail: charge.receiptEmail,
      customerName: charge.metadata?.customer_name || null,
      paymentMethod: {
        type: charge.paymentMethodDetails?.type || 'card',
        brand: charge.paymentMethodDetails?.card?.brand,
        last4: charge.paymentMethodDetails?.card?.last4,
      },
      createdAt: new Date(charge.created * 1000),
      bookingId: charge.metadata?.booking_id,
    };
  }
}

export const stripePaymentsService = new StripePaymentsService();
