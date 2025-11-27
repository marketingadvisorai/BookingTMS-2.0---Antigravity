/**
 * Customer Booking Service
 * Handles fetching and managing customer bookings
 */

import { supabase } from '@/lib/supabase';
import type {
  CustomerBooking,
  CancelBookingRequest,
  CancelBookingResponse,
  RescheduleBookingRequest,
  RescheduleBookingResponse,
  AvailableSlot,
  BookingStatus,
  PaymentStatus,
} from '../types';

// Cancellation window: 24 hours before booking
const CANCELLATION_WINDOW_HOURS = 24;

// Database row types
interface BookingRow {
  id: string;
  booking_reference: string;
  status: BookingStatus;
  activity_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  total_amount: number | null;
  payment_status: PaymentStatus | null;
  created_at: string;
  activities: {
    name: string;
    cover_image: string | null;
    venues: {
      name: string;
      address: string | null;
      city: string | null;
      state: string | null;
    } | null;
  } | null;
}

interface SessionRow {
  date: string;
  start_time: string;
  end_time: string;
  capacity_remaining: number;
}

/**
 * Fetch all bookings for a customer
 */
export async function getCustomerBookings(
  customerId: string
): Promise<CustomerBooking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        status,
        activity_id,
        booking_date,
        start_time,
        end_time,
        party_size,
        total_amount,
        payment_status,
        created_at,
        activities (
          name,
          cover_image,
          venues (
            name,
            address,
            city,
            state
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    const bookings = (data || []) as unknown as BookingRow[];
    
    return bookings.map((booking) => {
      const activity = booking.activities;
      const venue = activity?.venues;
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
      const cancellationDeadline = new Date(
        bookingDateTime.getTime() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000
      );
      const canModify = 
        booking.status !== 'cancelled' &&
        booking.status !== 'completed' &&
        booking.status !== 'no_show' &&
        new Date() < cancellationDeadline;

      return {
        id: booking.id,
        bookingReference: booking.booking_reference,
        status: booking.status,
        activityId: booking.activity_id,
        activityName: activity?.name || 'Unknown Activity',
        activityImage: activity?.cover_image || null,
        venueName: venue?.name || 'Unknown Venue',
        venueAddress: venue 
          ? `${venue.address || ''}, ${venue.city || ''}, ${venue.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
          : '',
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        partySize: booking.party_size,
        totalAmount: booking.total_amount || 0,
        currency: 'USD',
        paymentStatus: booking.payment_status || 'pending',
        createdAt: booking.created_at,
        canCancel: canModify,
        canReschedule: canModify,
        cancellationDeadline: cancellationDeadline.toISOString(),
      };
    });
  } catch (error) {
    console.error('Error in getCustomerBookings:', error);
    return [];
  }
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(
  bookingId: string,
  customerId: string
): Promise<CustomerBooking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        status,
        activity_id,
        booking_date,
        start_time,
        end_time,
        party_size,
        total_amount,
        payment_status,
        created_at,
        activities (
          name,
          cover_image,
          venues (
            name,
            address,
            city,
            state
          )
        )
      `)
      .eq('id', bookingId)
      .eq('customer_id', customerId)
      .single();

    if (error || !data) return null;

    const booking = data as unknown as BookingRow;
    const activity = booking.activities;
    const venue = activity?.venues;
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const cancellationDeadline = new Date(
      bookingDateTime.getTime() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000
    );
    const canModify = 
      booking.status !== 'cancelled' &&
      booking.status !== 'completed' &&
      booking.status !== 'no_show' &&
      new Date() < cancellationDeadline;

    return {
      id: booking.id,
      bookingReference: booking.booking_reference,
      status: booking.status,
      activityId: booking.activity_id,
      activityName: activity?.name || 'Unknown Activity',
      activityImage: activity?.cover_image || null,
      venueName: venue?.name || 'Unknown Venue',
      venueAddress: venue 
        ? `${venue.address || ''}, ${venue.city || ''}, ${venue.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
        : '',
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      partySize: booking.party_size,
      totalAmount: booking.total_amount || 0,
      currency: 'USD',
      paymentStatus: booking.payment_status || 'pending',
      createdAt: booking.created_at,
      canCancel: canModify,
      canReschedule: canModify,
      cancellationDeadline: cancellationDeadline.toISOString(),
    };
  } catch (error) {
    console.error('Error in getBookingById:', error);
    return null;
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
  request: CancelBookingRequest,
  customerId: string
): Promise<CancelBookingResponse> {
  try {
    // First verify the booking belongs to the customer
    const booking = await getBookingById(request.bookingId, customerId);
    
    if (!booking) {
      return {
        success: false,
        refundAmount: null,
        refundStatus: 'none',
        message: 'Booking not found',
      };
    }

    if (!booking.canCancel) {
      return {
        success: false,
        refundAmount: null,
        refundStatus: 'none',
        message: 'This booking can no longer be cancelled',
      };
    }

    // Update booking status
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: request.reason || 'Customer requested',
      } as never)
      .eq('id', request.bookingId)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        refundAmount: null,
        refundStatus: 'none',
        message: 'Failed to cancel booking. Please try again.',
      };
    }

    // TODO: Implement Stripe refund logic
    // For now, assume full refund for paid bookings
    const refundAmount = booking.paymentStatus === 'paid' ? booking.totalAmount : null;

    return {
      success: true,
      refundAmount,
      refundStatus: refundAmount ? 'full' : 'none',
      message: refundAmount 
        ? `Booking cancelled. A refund of $${refundAmount.toFixed(2)} will be processed within 5-10 business days.`
        : 'Booking cancelled successfully.',
    };
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    return {
      success: false,
      refundAmount: null,
      refundStatus: 'none',
      message: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Get available slots for rescheduling
 */
export async function getAvailableSlots(
  activityId: string,
  partySize: number,
  startDate: string,
  endDate: string
): Promise<AvailableSlot[]> {
  try {
    const { data, error } = await supabase
      .from('activity_sessions')
      .select('date, start_time, end_time, capacity_remaining')
      .eq('activity_id', activityId)
      .gte('date', startDate)
      .lte('date', endDate)
      .gte('capacity_remaining', partySize)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }

    const sessions = (data || []) as unknown as SessionRow[];
    
    return sessions.map((session) => ({
      date: session.date,
      startTime: session.start_time,
      endTime: session.end_time,
      spotsAvailable: session.capacity_remaining,
    }));
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    return [];
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(
  request: RescheduleBookingRequest,
  customerId: string
): Promise<RescheduleBookingResponse> {
  try {
    // Verify the booking belongs to the customer
    const booking = await getBookingById(request.bookingId, customerId);
    
    if (!booking) {
      return {
        success: false,
        newBookingReference: null,
        message: 'Booking not found',
      };
    }

    if (!booking.canReschedule) {
      return {
        success: false,
        newBookingReference: null,
        message: 'This booking can no longer be rescheduled',
      };
    }

    // Update booking with new date/time
    const { error } = await supabase
      .from('bookings')
      .update({
        booking_date: request.newDate,
        start_time: request.newStartTime,
        end_time: request.newEndTime,
        rescheduled_at: new Date().toISOString(),
        rescheduled_from: `${booking.bookingDate} ${booking.startTime}`,
      } as never)
      .eq('id', request.bookingId)
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error rescheduling booking:', error);
      return {
        success: false,
        newBookingReference: null,
        message: 'Failed to reschedule booking. Please try again.',
      };
    }

    return {
      success: true,
      newBookingReference: booking.bookingReference,
      message: 'Booking rescheduled successfully!',
    };
  } catch (error) {
    console.error('Error in rescheduleBooking:', error);
    return {
      success: false,
      newBookingReference: null,
      message: 'An error occurred. Please try again.',
    };
  }
}

export const customerBookingService = {
  getCustomerBookings,
  getBookingById,
  cancelBooking,
  getAvailableSlots,
  rescheduleBooking,
};
