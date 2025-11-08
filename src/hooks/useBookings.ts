/**
 * Bookings Database Hook
 * Manages booking data with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  venue_id: string;
  game_id: string;
  customer_id: string;
  booking_date: string;
  booking_time: string;
  end_time: string;
  players: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  total_amount: number;
  deposit_amount: number;
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'failed';
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  customer_notes?: string;
  internal_notes?: string;
  confirmation_code: string;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  venue_name: string;
  venue_city: string;
  game_name: string;
  game_difficulty: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export function useBookings(venueId?: string) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings with details
  const fetchBookings = async (showToast = false) => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_bookings_with_details', {
          p_venue_id: venueId || null,
          p_status: null,
          p_from_date: null,
          p_to_date: null,
        });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
      if (showToast) {
        toast.error('Failed to load bookings');
      }
    }
  };

  // Create booking using the database function
  const createBooking = async (bookingData: {
    venue_id: string;
    game_id: string;
    customer_id: string;
    booking_date: string;
    booking_time: string;
    players: number;
    total_amount: number;
    notes?: string;
  }) => {
    try {
      const { data, error: createError } = await supabase
        .rpc('create_booking', {
          p_venue_id: bookingData.venue_id,
          p_game_id: bookingData.game_id,
          p_customer_id: bookingData.customer_id,
          p_booking_date: bookingData.booking_date,
          p_booking_time: bookingData.booking_time,
          p_players: bookingData.players,
          p_total_amount: bookingData.total_amount,
          p_notes: bookingData.notes || null,
        });

      if (createError) throw createError;

      toast.success('Booking created successfully!');
      await fetchBookings(); // Refresh list
      return data; // Returns booking ID
    } catch (err: any) {
      console.error('Error creating booking:', err);
      toast.error(err.message || 'Failed to create booking');
      throw err;
    }
  };

  // Update booking
  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Booking updated successfully!');
      await fetchBookings(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating booking:', err);
      toast.error(err.message || 'Failed to update booking');
      throw err;
    }
  };

  // Cancel booking
  const cancelBooking = async (id: string, reason?: string, issueRefund: boolean = false) => {
    try {
      const { data, error: cancelError } = await supabase
        .rpc('cancel_booking', {
          p_booking_id: id,
          p_reason: reason || null,
          p_issue_refund: issueRefund,
        });

      if (cancelError) throw cancelError;

      toast.success('Booking cancelled successfully!');
      await fetchBookings(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      toast.error(err.message || 'Failed to cancel booking');
      throw err;
    }
  };

  // Get booking by ID
  const getBookingById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      toast.error('Failed to load booking details');
      throw err;
    }
  };

  // Get available time slots for a game
  const getAvailableSlots = async (gameId: string, date: string) => {
    try {
      const { data, error: slotsError } = await supabase
        .rpc('get_available_slots', {
          p_game_id: gameId,
          p_date: date,
        });

      if (slotsError) throw slotsError;

      return data;
    } catch (err: any) {
      console.error('Error fetching available slots:', err);
      return [];
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchBookings();

    // Subscribe to booking changes
    const subscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Booking changed:', payload);
          fetchBookings(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  return {
    bookings,
    loading: false,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    getBookingById,
    getAvailableSlots,
    refreshBookings: fetchBookings,
  };
}
