/**
 * Reservation Service
 * 
 * Handles temporary slot reservations during the checkout process.
 * Uses optimistic locking to prevent double bookings.
 * 
 * @module services/reservation.service
 * @version 1.0.0
 * @date 2025-12-01
 */

import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

// RPC function result types (not in generated types until migration is applied)
interface CreateReservationRpcResult {
  reservation_id: string | null;
  success: boolean;
  error_code: string | null;
  session_version: number;
}

interface ReserveCapacityRpcResult {
  success: boolean;
  new_version: number;
  remaining: number;
  error_code: string | null;
}

interface ReleaseCapacityRpcResult {
  success: boolean;
  new_version: number;
  remaining: number;
}

export interface SlotReservation {
  id: string;
  session_id: string;
  organization_id: string;
  customer_email: string | null;
  spots_reserved: number;
  checkout_session_id: string | null;
  session_version_at_reserve: number;
  status: 'pending' | 'converted' | 'expired' | 'cancelled';
  expires_at: string;
  created_at: string;
  converted_at: string | null;
  booking_id: string | null;
}

export interface CreateReservationParams {
  sessionId: string;
  organizationId: string;
  spots: number;
  customerEmail?: string;
  checkoutSessionId?: string;
  ttlMinutes?: number;
}

export interface CreateReservationResult {
  success: boolean;
  reservationId?: string;
  errorCode?: string;
  sessionVersion?: number;
}

export interface ReserveCapacityResult {
  success: boolean;
  newVersion: number;
  remaining: number;
  errorCode?: string;
}

// ============================================================================
// ERROR CODES
// ============================================================================

export const ReservationErrorCodes = {
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_CLOSED: 'SESSION_CLOSED',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  INSUFFICIENT_CAPACITY: 'INSUFFICIENT_CAPACITY',
  RESERVATION_NOT_FOUND: 'RESERVATION_NOT_FOUND',
  RESERVATION_EXPIRED: 'RESERVATION_EXPIRED',
  RESERVATION_ALREADY_CONVERTED: 'RESERVATION_ALREADY_CONVERTED',
} as const;

export type ReservationErrorCode = typeof ReservationErrorCodes[keyof typeof ReservationErrorCodes];

// ============================================================================
// RESERVATION SERVICE
// ============================================================================

class ReservationService {
  /**
   * Create a temporary slot reservation with automatic capacity decrement.
   * Uses optimistic locking to prevent race conditions.
   * 
   * @param params - Reservation parameters
   * @returns Result with reservation ID on success, error code on failure
   */
  async createReservation(params: CreateReservationParams): Promise<CreateReservationResult> {
    const {
      sessionId,
      organizationId,
      spots,
      customerEmail,
      checkoutSessionId,
      ttlMinutes = 10,
    } = params;

    try {
      // Call the database function to create reservation atomically
      // Note: RPC function types will be available after migration is applied and types regenerated
      const { data, error } = await supabase.rpc('create_slot_reservation' as never, {
        p_session_id: sessionId,
        p_organization_id: organizationId,
        p_spots: spots,
        p_customer_email: customerEmail || null,
        p_checkout_session_id: checkoutSessionId || null,
        p_ttl_minutes: ttlMinutes,
      } as never);

      if (error) {
        console.error('[ReservationService] createReservation error:', error);
        return {
          success: false,
          errorCode: 'DATABASE_ERROR',
        };
      }

      // The function returns a single row with the result
      const rawResult = Array.isArray(data) ? data[0] : data;
      const result = rawResult as CreateReservationRpcResult;

      if (!result.success) {
        return {
          success: false,
          errorCode: result.error_code || undefined,
          sessionVersion: result.session_version,
        };
      }

      return {
        success: true,
        reservationId: result.reservation_id || undefined,
        sessionVersion: result.session_version,
      };
    } catch (err) {
      console.error('[ReservationService] createReservation exception:', err);
      return {
        success: false,
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Convert a pending reservation to a confirmed booking.
   * Should be called after successful payment.
   * 
   * @param reservationId - The reservation to convert
   * @param bookingId - The created booking ID
   * @returns True if conversion successful
   */
  async convertToBooking(reservationId: string, bookingId: string): Promise<boolean> {
    try {
      // Note: RPC function types will be available after migration is applied
      const { data, error } = await supabase.rpc('convert_reservation_to_booking' as never, {
        p_reservation_id: reservationId,
        p_booking_id: bookingId,
      } as never);

      if (error) {
        console.error('[ReservationService] convertToBooking error:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('[ReservationService] convertToBooking exception:', err);
      return false;
    }
  }

  /**
   * Cancel a pending reservation and release capacity.
   * 
   * @param reservationId - The reservation to cancel
   * @returns True if cancellation successful
   */
  async cancelReservation(reservationId: string): Promise<boolean> {
    try {
      // Note: RPC function types will be available after migration is applied
      const { data, error } = await supabase.rpc('cancel_slot_reservation' as never, {
        p_reservation_id: reservationId,
      } as never);

      if (error) {
        console.error('[ReservationService] cancelReservation error:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('[ReservationService] cancelReservation exception:', err);
      return false;
    }
  }

  /**
   * Get a reservation by ID.
   * 
   * @param reservationId - The reservation ID
   * @returns The reservation or null if not found
   */
  async getReservation(reservationId: string): Promise<SlotReservation | null> {
    try {
      const { data, error } = await supabase
        .from('slot_reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (error) {
        console.error('[ReservationService] getReservation error:', error);
        return null;
      }

      return data as SlotReservation;
    } catch (err) {
      console.error('[ReservationService] getReservation exception:', err);
      return null;
    }
  }

  /**
   * Get a reservation by checkout session ID.
   * 
   * @param checkoutSessionId - The Stripe checkout session ID
   * @returns The reservation or null if not found
   */
  async getReservationByCheckoutSession(checkoutSessionId: string): Promise<SlotReservation | null> {
    try {
      const { data, error } = await supabase
        .from('slot_reservations')
        .select('*')
        .eq('checkout_session_id', checkoutSessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('[ReservationService] getReservationByCheckoutSession error:', error);
        return null;
      }

      return data as SlotReservation;
    } catch (err) {
      console.error('[ReservationService] getReservationByCheckoutSession exception:', err);
      return null;
    }
  }

  /**
   * Check if a reservation is still valid (not expired).
   * 
   * @param reservationId - The reservation ID
   * @returns True if reservation is valid and pending
   */
  async isReservationValid(reservationId: string): Promise<boolean> {
    const reservation = await this.getReservation(reservationId);
    
    if (!reservation) {
      return false;
    }

    if (reservation.status !== 'pending') {
      return false;
    }

    const expiresAt = new Date(reservation.expires_at);
    if (expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Get the current version of a session (for optimistic locking).
   * 
   * @param sessionId - The session ID
   * @returns The current version or null if session not found
   */
  async getSessionVersion(sessionId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('activity_sessions')
        .select('version')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('[ReservationService] getSessionVersion error:', error);
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any)?.version ?? null;
    } catch (err) {
      console.error('[ReservationService] getSessionVersion exception:', err);
      return null;
    }
  }

  /**
   * Reserve capacity directly without creating a reservation record.
   * Use this for immediate bookings (no checkout flow).
   * 
   * @param sessionId - The session ID
   * @param spots - Number of spots to reserve
   * @param expectedVersion - Expected session version (for optimistic locking)
   * @returns Result with new version and remaining capacity
   */
  async reserveCapacity(
    sessionId: string,
    spots: number,
    expectedVersion: number
  ): Promise<ReserveCapacityResult> {
    try {
      // Note: RPC function types will be available after migration is applied
      const { data, error } = await supabase.rpc('reserve_session_capacity' as never, {
        p_session_id: sessionId,
        p_spots: spots,
        p_expected_version: expectedVersion,
      } as never);

      if (error) {
        console.error('[ReservationService] reserveCapacity error:', error);
        return {
          success: false,
          newVersion: 0,
          remaining: 0,
          errorCode: 'DATABASE_ERROR',
        };
      }

      const rawResult = Array.isArray(data) ? data[0] : data;
      const result = rawResult as ReserveCapacityRpcResult;

      return {
        success: result.success,
        newVersion: result.new_version,
        remaining: result.remaining,
        errorCode: result.error_code || undefined,
      };
    } catch (err) {
      console.error('[ReservationService] reserveCapacity exception:', err);
      return {
        success: false,
        newVersion: 0,
        remaining: 0,
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Release capacity back to the pool.
   * Use this for cancellations.
   * 
   * @param sessionId - The session ID
   * @param spots - Number of spots to release
   * @returns Result with new version and remaining capacity
   */
  async releaseCapacity(sessionId: string, spots: number): Promise<ReserveCapacityResult> {
    try {
      // Note: RPC function types will be available after migration is applied
      const { data, error } = await supabase.rpc('release_session_capacity' as never, {
        p_session_id: sessionId,
        p_spots: spots,
      } as never);

      if (error) {
        console.error('[ReservationService] releaseCapacity error:', error);
        return {
          success: false,
          newVersion: 0,
          remaining: 0,
          errorCode: 'DATABASE_ERROR',
        };
      }

      const rawResult = Array.isArray(data) ? data[0] : data;
      const result = rawResult as ReleaseCapacityRpcResult;

      return {
        success: result.success,
        newVersion: result.new_version,
        remaining: result.remaining,
      };
    } catch (err) {
      console.error('[ReservationService] releaseCapacity exception:', err);
      return {
        success: false,
        newVersion: 0,
        remaining: 0,
        errorCode: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Get pending reservations for a session.
   * Useful for checking current reserved capacity.
   * 
   * @param sessionId - The session ID
   * @returns Array of pending reservations
   */
  async getPendingReservations(sessionId: string): Promise<SlotReservation[]> {
    try {
      const { data, error } = await supabase
        .from('slot_reservations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('[ReservationService] getPendingReservations error:', error);
        return [];
      }

      return data as SlotReservation[];
    } catch (err) {
      console.error('[ReservationService] getPendingReservations exception:', err);
      return [];
    }
  }

  /**
   * Get total reserved spots for a session (pending reservations only).
   * 
   * @param sessionId - The session ID
   * @returns Total reserved spots
   */
  async getTotalReservedSpots(sessionId: string): Promise<number> {
    const reservations = await this.getPendingReservations(sessionId);
    return reservations.reduce((total, r) => total + r.spots_reserved, 0);
  }
}

// Export singleton instance
export const reservationService = new ReservationService();

// Export class for testing
export { ReservationService };
