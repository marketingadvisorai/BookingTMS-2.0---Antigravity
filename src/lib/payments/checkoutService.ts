/**
 * Checkout Service
 * Handles Stripe Checkout Sessions and Payment Links
 */

import { supabase } from '../supabase';

export interface CheckoutSessionParams {
  priceId: string;
  quantity?: number;
  customerEmail: string;
  customerName?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  clientSecret?: string;
}

export interface PaymentLinkParams {
  priceId: string;
  quantity?: number;
  metadata?: Record<string, string>;
}

export interface PaymentLinkResponse {
  id: string;
  url: string;
}

export class CheckoutService {
  /**
   * Create a Checkout Session (Stripe-hosted checkout page)
   * Use this for immediate payment flow
   */
  static async createCheckoutSession(
    params: CheckoutSessionParams
  ): Promise<CheckoutSessionResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: params,
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data || !data.url) {
        throw new Error('Invalid response from checkout session creation');
      }

      return data;
    } catch (error: any) {
      console.error('Checkout session creation failed:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  }

  /**
   * Create a Payment Link (shareable link for email/SMS)
   * Use this for "pay later" functionality
   */
  static async createPaymentLink(
    params: PaymentLinkParams
  ): Promise<PaymentLinkResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: params,
      });

      if (error) {
        console.error('Error creating payment link:', error);
        throw new Error(error.message || 'Failed to create payment link');
      }

      if (!data || !data.url) {
        throw new Error('Invalid response from payment link creation');
      }

      return data;
    } catch (error: any) {
      console.error('Payment link creation failed:', error);
      throw new Error(error.message || 'Failed to create payment link');
    }
  }

  /**
   * Create booking with Checkout Session
   * For immediate payment flow
   */
  static async createBookingWithCheckout(params: {
    venueId: string;
    gameId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    partySize: number;
    customer: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
    totalPrice: number;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    try {
      // Create booking in database first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          venue_id: params.venueId,
          game_id: params.gameId,
          booking_date: params.bookingDate,
          start_time: params.startTime,
          end_time: params.endTime,
          party_size: params.partySize,
          customer_email: params.customer.email,
          customer_name: `${params.customer.firstName} ${params.customer.lastName}`,
          customer_phone: params.customer.phone,
          total_price: params.totalPrice,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Checkout Session
      const session = await this.createCheckoutSession({
        priceId: params.priceId,
        quantity: 1,
        customerEmail: params.customer.email,
        customerName: `${params.customer.firstName} ${params.customer.lastName}`,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        metadata: {
          booking_id: booking.id,
          game_id: params.gameId,
          venue_id: params.venueId,
        },
      });

      // Update booking with session ID
      await supabase
        .from('bookings')
        .update({
          stripe_session_id: session.sessionId,
        })
        .eq('id', booking.id);

      return {
        booking,
        checkoutUrl: session.url,
        sessionId: session.sessionId,
      };
    } catch (error: any) {
      console.error('Error creating booking with checkout:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  /**
   * Create booking with Payment Link
   * For "pay later" functionality (email/SMS)
   */
  static async createBookingWithPaymentLink(params: {
    venueId: string;
    gameId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    partySize: number;
    customer: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
    totalPrice: number;
    priceId: string;
  }) {
    try {
      // Create booking in database first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          venue_id: params.venueId,
          game_id: params.gameId,
          booking_date: params.bookingDate,
          start_time: params.startTime,
          end_time: params.endTime,
          party_size: params.partySize,
          customer_email: params.customer.email,
          customer_name: `${params.customer.firstName} ${params.customer.lastName}`,
          customer_phone: params.customer.phone,
          total_price: params.totalPrice,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Payment Link
      const paymentLink = await this.createPaymentLink({
        priceId: params.priceId,
        quantity: 1,
        metadata: {
          booking_id: booking.id,
          game_id: params.gameId,
          venue_id: params.venueId,
        },
      });

      // Update booking with payment link
      await supabase
        .from('bookings')
        .update({
          payment_link: paymentLink.url,
        })
        .eq('id', booking.id);

      return {
        booking,
        paymentLink: paymentLink.url,
      };
    } catch (error: any) {
      console.error('Error creating booking with payment link:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  }
}
