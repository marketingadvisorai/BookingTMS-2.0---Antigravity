/**
 * Embed Pro 2.0 - Checkout Service
 * @module embed-pro/services/checkoutPro
 * 
 * Handles Stripe checkout session creation for the booking widget.
 * Now includes slot reservation to prevent double bookings (MVP Task 1.4)
 */

import { supabase } from '../../../lib/supabase';
import { reservationService } from '../../../services/reservation.service';
import type { WidgetActivity, CustomerInfo } from '../types/widget.types';

// =====================================================
// TYPES
// =====================================================

interface CreateCheckoutParams {
  activity: WidgetActivity;
  date: Date;
  time: string;
  partySize: number;
  childCount: number;
  customerInfo: CustomerInfo;
  organizationId?: string;
  embedKey?: string;
  sessionId?: string; // Activity session ID for reservation
}

interface CheckoutResult {
  sessionId: string;
  url: string;
  reservationId?: string; // Slot reservation ID for tracking
}

interface ReservationResult {
  success: boolean;
  reservationId?: string;
  errorCode?: string;
}

// =====================================================
// SERVICE
// =====================================================

class CheckoutProService {
  private readonly functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;

  /**
   * Create a slot reservation before checkout (prevents double bookings)
   * @private
   */
  private async createReservation(params: {
    sessionId: string;
    organizationId: string;
    partySize: number;
    customerEmail: string;
  }): Promise<ReservationResult> {
    try {
      const result = await reservationService.createReservation({
        sessionId: params.sessionId,
        organizationId: params.organizationId,
        spots: params.partySize,
        customerEmail: params.customerEmail,
        ttlMinutes: 10, // 10-minute reservation window for checkout
      });

      if (!result.success) {
        console.warn('[CheckoutProService] Reservation failed:', result.errorCode);
        return { success: false, errorCode: result.errorCode };
      }

      return { success: true, reservationId: result.reservationId };
    } catch (error) {
      console.error('[CheckoutProService] Reservation error:', error);
      return { success: false, errorCode: 'RESERVATION_ERROR' };
    }
  }

  /**
   * Create a Stripe checkout session for the booking
   * Now includes slot reservation to prevent double bookings (MVP Task 1.4)
   */
  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    const {
      activity,
      date,
      time,
      partySize,
      childCount,
      customerInfo,
      organizationId,
      embedKey,
      sessionId,
    } = params;

    const orgId = organizationId || activity.organizationId;
    const totalPartySize = partySize + childCount;

    // Step 1: Create a slot reservation (if sessionId provided)
    let reservationId: string | undefined;
    if (sessionId && orgId) {
      const reservationResult = await this.createReservation({
        sessionId,
        organizationId: orgId,
        partySize: totalPartySize,
        customerEmail: customerInfo.email,
      });

      if (!reservationResult.success) {
        // Reservation failed - slot may be taken
        throw new Error(
          reservationResult.errorCode === 'INSUFFICIENT_CAPACITY'
            ? 'This time slot is no longer available. Please select another time.'
            : 'Unable to reserve this slot. Please try again.'
        );
      }
      reservationId = reservationResult.reservationId;
    }

    // Format date for display and storage
    const bookingDate = date.toISOString().split('T')[0];
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Calculate pricing
    const adultCount = partySize;
    const adultTotal = adultCount * activity.price;
    const childTotal = childCount * (activity.childPrice || 0);
    const totalAmount = adultTotal + childTotal;

    // Build success and cancel URLs
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = window.location.href;

    // Prepare request body
    const requestBody: Record<string, unknown> = {
      // Customer info
      customerEmail: customerInfo.email,
      customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerPhone: customerInfo.phone,
      
      // URLs
      successUrl,
      cancelUrl,
      
      // Booking data
      bookingDate,
      startTime: time,
      organizationId: organizationId || activity.organizationId,
      
      // Metadata for webhook processing
      metadata: {
        activity_id: activity.id,
        activity_name: activity.name,
        venue_name: activity.venueName || '',
        booking_date: bookingDate,
        formatted_date: formattedDate,
        start_time: time,
        party_size: String(partySize + childCount),
        adult_count: String(adultCount),
        child_count: String(childCount),
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customer_phone: customerInfo.phone,
        customer_notes: customerInfo.notes || '',
        embed_key: embedKey || '',
        source: 'embed-pro-widget',
        // MVP Task 1.4: Slot reservation tracking
        session_id: sessionId || '',
        reservation_id: reservationId || '',
      },
    };

    // Add pricing - use Stripe price IDs if available, otherwise use line items
    if (activity.stripePriceId) {
      // Use existing Stripe price
      requestBody.priceId = activity.stripePriceId;
      requestBody.quantity = partySize + childCount;
    } else {
      // Create line items with amounts (for ad-hoc pricing)
      // Note: This requires the edge function to support ad-hoc amounts
      requestBody.line_items = [
        {
          price_data: {
            currency: activity.currency?.toLowerCase() || 'usd',
            product_data: {
              name: activity.name,
              description: `${formattedDate} at ${time} - ${partySize + childCount} guests`,
            },
            unit_amount: Math.round(totalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ];
    }

    // Call edge function
    const response = await fetch(this.functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const result = await response.json();
    
    if (!result.url) {
      throw new Error('No checkout URL returned');
    }

    return {
      sessionId: result.sessionId,
      url: result.url,
      reservationId, // Include reservation ID for tracking
    };
  }

  /**
   * Cancel a reservation (if user abandons checkout)
   */
  async cancelReservation(reservationId: string): Promise<boolean> {
    try {
      return await reservationService.cancelReservation(reservationId);
    } catch (error) {
      console.error('[CheckoutProService] Cancel reservation error:', error);
      return false;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  redirectToCheckout(url: string): void {
    window.location.href = url;
  }

  /**
   * Track widget booking event (analytics)
   * Increments booking_count for the embed config
   */
  async trackBookingStarted(embedKey: string): Promise<void> {
    try {
      // First get current count
      const { data } = await supabase
        .from('embed_configs')
        .select('booking_count')
        .eq('embed_key', embedKey)
        .single() as { data: { booking_count: number } | null };
      
      if (data) {
        // Increment count
        await supabase
          .from('embed_configs')
          .update({ booking_count: (data.booking_count || 0) + 1 } as never)
          .eq('embed_key', embedKey);
      }
    } catch (error) {
      // Non-critical - don't break the flow
      console.warn('Failed to track booking event:', error);
    }
  }
}

// Export singleton
export const checkoutProService = new CheckoutProService();
