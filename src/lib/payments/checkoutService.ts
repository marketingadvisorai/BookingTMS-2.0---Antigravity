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
   * Update session capacity after booking
   * Decrements capacity_remaining by partySize
   */
  static async updateSessionCapacity(sessionId: string, partySize: number): Promise<void> {
    try {
      // Get current session
      const { data: session, error: fetchError } = await supabase
        .from('activity_sessions')
        .select('capacity_remaining')
        .eq('id', sessionId)
        .single() as { data: { capacity_remaining: number } | null; error: any };

      if (fetchError || !session) {
        console.error('Error fetching session for capacity update:', fetchError);
        return;
      }

      // Calculate new capacity
      const newCapacity = Math.max(0, (session.capacity_remaining ?? 0) - partySize);

      // Update session
      const { error: updateError } = await (supabase
        .from('activity_sessions') as any)
        .update({
          capacity_remaining: newCapacity,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session capacity:', updateError);
      } else {
        console.log(`[Booking] Session ${sessionId} capacity updated: ${newCapacity}`);
      }
    } catch (error) {
      console.error('Exception updating session capacity:', error);
    }
  }

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
    activityId: string;
    sessionId?: string; // Added sessionId
    bookingDate: string;
    startTime: string;
    endTime: string;
    partySize: number;
    participants?: {
      adults: number;
      children: number;
      custom: Record<string, number>;
    };
    customer: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
    totalPrice: number;
    priceId: string;
    stripePrices?: any[];
    successUrl: string;
    cancelUrl: string;
  }) {
    try {
      // Create booking in database first
      const { data: booking, error: bookingError } = await (supabase
        .from('bookings') as any)
        .insert({
          venue_id: params.venueId,
          activity_id: params.activityId,
          session_id: params.sessionId || null, // Use session_id
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
          metadata: { participants: params.participants }
        } as any)
        .select()
        .single() as any;

      if (bookingError) throw bookingError;

      // Update session capacity if sessionId is provided
      if (params.sessionId) {
        await this.updateSessionCapacity(params.sessionId, params.partySize);
      }

      // Construct line items for Stripe
      let lineItems: any[] = [];
      if (params.participants && params.stripePrices) {
        // Adult
        if (params.participants.adults > 0) {
          const adultPrice = params.stripePrices.find((p: any) => p.lookup_key === 'adult' || p.type === 'adult') || { id: params.priceId };
          lineItems.push({ price: adultPrice.id, quantity: params.participants.adults });
        }
        // Child
        if (params.participants.children > 0) {
          const childPrice = params.stripePrices.find((p: any) => p.lookup_key === 'child' || p.type === 'child');
          if (childPrice) {
            lineItems.push({ price: childPrice.id, quantity: params.participants.children });
          }
        }
        // Custom
        Object.entries(params.participants.custom).forEach(([key, count]) => {
          if (count > 0) {
            // Try to find by lookup_key (e.g., custom_0) or metadata name if needed
            // Assuming key is the ID from customCapacityFields, we might need to map it to the price
            // For now, let's assume we can find it by some property or we need to pass the price ID directly in participants
            // A better approach: stripePrices should contain the custom field ID in metadata
            const customPrice = params.stripePrices?.find((p: any) => p.metadata?.name === key || p.lookup_key === key || p.name === key); // Approximate matching
            if (customPrice) {
              lineItems.push({ price: customPrice.id, quantity: count });
            }
          }
        });
      } else {
        // Fallback to single price
        lineItems.push({ price: params.priceId, quantity: params.partySize });
      }

      // Create Checkout Session
      const session = await this.createCheckoutSession({
        // @ts-ignore - we are changing the interface dynamically here, ideally we update the interface definition
        line_items: lineItems,
        mode: 'payment',
        customerEmail: params.customer.email,
        customerName: `${params.customer.firstName} ${params.customer.lastName}`,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        metadata: {
          booking_id: booking.id,
          activity_id: params.activityId,
          venue_id: params.venueId,
          party_size: params.partySize.toString(),
        },
      } as any);

      // Update booking with session ID
      await (supabase
        .from('bookings') as any)
        .update({
          stripe_session_id: session.sessionId, // Map to stripe_session_id
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
    activityId: string;
    sessionId?: string; // Added sessionId
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
    paymentLink?: string; // Optional custom payment link
  }) {
    try {
      // Create booking in database first
      const { data: booking, error: bookingError } = await (supabase
        .from('bookings') as any)
        .insert({
          venue_id: params.venueId,
          activity_id: params.activityId,
          session_id: params.sessionId || null, // Map sessionId to session_id
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
        } as any)
        .select()
        .single() as any;

      if (bookingError) throw bookingError;

      // Update session capacity if sessionId is provided
      if (params.sessionId) {
        await this.updateSessionCapacity(params.sessionId, params.partySize);
      }

      // Create or use existing Payment Link
      let paymentLinkUrl = params.paymentLink;

      if (!paymentLinkUrl) {
        const paymentLink = await this.createPaymentLink({
          priceId: params.priceId,
          quantity: params.partySize, // Use party size as quantity for correct total
          metadata: {
            booking_id: booking.id,
            activity_id: params.activityId,
            venue_id: params.venueId,
            party_size: params.partySize.toString(),
          },
        });
        paymentLinkUrl = paymentLink.url;
      }

      // Update booking with payment link
      await (supabase
        .from('bookings') as any)
        .update({
          payment_link: paymentLinkUrl,
        })
        .eq('id', booking.id);

      return {
        booking,
        paymentLink: paymentLinkUrl,
      };
    } catch (error: any) {
      console.error('Error creating booking with payment link:', error);
      throw new Error(error.message || 'Failed to create booking');
    }
  }
}
