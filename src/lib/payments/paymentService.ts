import { supabase } from '../supabase';

export interface CreatePaymentIntentParams {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  error?: string;
}

export class PaymentService {
  private static supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private static supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  /**
   * Create a payment intent for a booking
   */
  static async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<PaymentIntentResponse> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
          },
          body: JSON.stringify({
            bookingId: params.bookingId,
            amount: params.amount,
            currency: params.currency || 'usd',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Get payment details for a booking
   */
  static async getPaymentByBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching payment:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all payments for a customer
   */
  static async getCustomerPayments(customerId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          *,
          game:games(name, description)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer payments:', error);
      return [];
    }

    return data;
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentIntentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('status, paid_at')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }

    return data;
  }

  /**
   * Request a refund (admin only)
   */
  static async requestRefund(paymentId: string, amount?: number, reason?: string) {
    try {
      // This would call a refund Edge Function
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/create-refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
          },
          body: JSON.stringify({
            paymentId,
            amount,
            reason: reason || 'requested_by_customer',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      return data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  }

  /**
   * Get refunds for a payment
   */
  static async getPaymentRefunds(paymentId: string) {
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching refunds:', error);
      return [];
    }

    return data;
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get payment status badge color
   */
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      succeeded: 'green',
      paid: 'green',
      pending: 'yellow',
      processing: 'blue',
      failed: 'red',
      canceled: 'gray',
      refunded: 'orange',
      partially_refunded: 'orange',
    };

    return colors[status] || 'gray';
  }

  /**
   * Get payment status label
   */
  static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      succeeded: 'Paid',
      paid: 'Paid',
      pending: 'Pending',
      processing: 'Processing',
      failed: 'Failed',
      canceled: 'Canceled',
      refunded: 'Refunded',
      partially_refunded: 'Partially Refunded',
    };

    return labels[status] || status;
  }
}
