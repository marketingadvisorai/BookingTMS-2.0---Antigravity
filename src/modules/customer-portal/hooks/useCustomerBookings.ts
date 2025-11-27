/**
 * Customer Bookings Hook
 * Manages fetching and actions on customer bookings
 */

import { useState, useEffect, useCallback } from 'react';
import { customerBookingService } from '../services';
import type {
  CustomerBooking,
  CancelBookingResponse,
  RescheduleBookingResponse,
  AvailableSlot,
} from '../types';

interface UseCustomerBookingsOptions {
  customerId: string | null;
  autoFetch?: boolean;
}

export function useCustomerBookings({ customerId, autoFetch = true }: UseCustomerBookingsOptions) {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!customerId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const data = await customerBookingService.getCustomerBookings(customerId);
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && customerId) {
      fetchBookings();
    }
  }, [autoFetch, customerId, fetchBookings]);

  // Get single booking
  const getBooking = useCallback(async (bookingId: string): Promise<CustomerBooking | null> => {
    if (!customerId) return null;

    try {
      const booking = await customerBookingService.getBookingById(bookingId, customerId);
      if (booking) {
        setSelectedBooking(booking);
      }
      return booking;
    } catch (err) {
      setError('Failed to load booking details');
      return null;
    }
  }, [customerId]);

  // Cancel booking
  const cancelBooking = useCallback(async (
    bookingId: string,
    reason?: string
  ): Promise<CancelBookingResponse> => {
    if (!customerId) {
      return { success: false, refundAmount: null, refundStatus: 'none', message: 'Not authenticated' };
    }

    try {
      const result = await customerBookingService.cancelBooking(
        { bookingId, reason },
        customerId
      );
      
      if (result.success) {
        // Refresh bookings list
        await fetchBookings();
      }
      
      return result;
    } catch (err) {
      return { success: false, refundAmount: null, refundStatus: 'none', message: 'An error occurred' };
    }
  }, [customerId, fetchBookings]);

  // Get available slots for rescheduling
  const getAvailableSlots = useCallback(async (
    activityId: string,
    partySize: number,
    startDate: string,
    endDate: string
  ): Promise<AvailableSlot[]> => {
    try {
      return await customerBookingService.getAvailableSlots(
        activityId,
        partySize,
        startDate,
        endDate
      );
    } catch (err) {
      return [];
    }
  }, []);

  // Reschedule booking
  const rescheduleBooking = useCallback(async (
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<RescheduleBookingResponse> => {
    if (!customerId) {
      return { success: false, newBookingReference: null, message: 'Not authenticated' };
    }

    try {
      const result = await customerBookingService.rescheduleBooking(
        { bookingId, newDate, newStartTime, newEndTime },
        customerId
      );
      
      if (result.success) {
        // Refresh bookings list
        await fetchBookings();
      }
      
      return result;
    } catch (err) {
      return { success: false, newBookingReference: null, message: 'An error occurred' };
    }
  }, [customerId, fetchBookings]);

  // Filter helpers
  const upcomingBookings = bookings.filter(
    (b) => b.status !== 'cancelled' && b.status !== 'completed' && new Date(b.bookingDate) >= new Date()
  );

  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || new Date(b.bookingDate) < new Date()
  );

  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    selectedBooking,
    isLoading,
    error,
    fetchBookings,
    getBooking,
    cancelBooking,
    getAvailableSlots,
    rescheduleBooking,
    setSelectedBooking,
    clearError: () => setError(null),
  };
}
