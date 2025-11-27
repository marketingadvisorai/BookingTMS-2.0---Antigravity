/**
 * Embed Pro 2.0 - Booking Verification Service
 * @module embed-pro/services/bookingVerification
 * 
 * Handles post-checkout verification and booking confirmation.
 * Called after returning from Stripe checkout.
 */

import { supabase } from '../../../lib/supabase';

// =====================================================
// TYPES
// =====================================================

export interface BookingDetails {
  id: string;
  bookingNumber: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  partySize: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface VerificationResult {
  success: boolean;
  booking?: BookingDetails;
  error?: string;
}

// =====================================================
// SERVICE
// =====================================================

class BookingVerificationService {
  private readonly functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-checkout-session`;

  /**
   * Verify a checkout session and get booking details
   */
  async verifyCheckoutSession(sessionId: string): Promise<VerificationResult> {
    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Failed to verify payment',
        };
      }

      return {
        success: true,
        booking: result.booking,
      };
    } catch (error: any) {
      console.error('[BookingVerification] Error:', error);
      return {
        success: false,
        error: error.message || 'Unable to verify booking',
      };
    }
  }

  /**
   * Get booking details by booking ID or number
   */
  async getBookingById(bookingId: string): Promise<BookingDetails | null> {
    try {
      const { data, error } = await (supabase
        .from('bookings') as any)
        .select(`
          id,
          booking_number,
          activity:activities(name),
          venue:venues(name),
          booking_date,
          booking_time,
          party_size,
          total_amount,
          customer_name,
          customer_email,
          status
        `)
        .eq('id', bookingId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        bookingNumber: data.booking_number,
        activityName: data.activity?.name || 'Activity',
        venueName: data.venue?.name || 'Venue',
        date: data.booking_date,
        time: data.booking_time,
        partySize: data.party_size,
        totalAmount: data.total_amount,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        status: data.status,
      };
    } catch (error) {
      console.error('[BookingVerification] GetById error:', error);
      return null;
    }
  }

  /**
   * Generate a booking reference number
   * Format: BK-XXXXXX-XXXX (e.g., BK-AB12CD-34EF)
   */
  generateBookingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}-${random}`;
  }

  /**
   * Extract session ID from URL query params
   */
  extractSessionIdFromUrl(): string | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('session_id');
  }
}

// Export singleton
export const bookingVerificationService = new BookingVerificationService();
