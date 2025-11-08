/**
 * SupabaseBookingService - Backend service for real bookings
 * 
 * Handles all booking operations through Supabase RPCs and queries.
 * Replaces localStorage-based demo data with real database persistence.
 */

import { supabase } from '../lib/supabase';

// Feature flag to enable/disable Supabase bookings
export const USE_SUPABASE_BOOKINGS = true;

export interface VenueConfig {
  id: string;
  name: string;
  slug: string;
  embed_key: string;
  primary_color: string;
  base_url: string;
  timezone: string;
  settings: Record<string, any>;
}

export interface VenueGame {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  difficulty: string;
  duration: number;
  min_players: number;
  max_players: number;
  price: number;
  child_price: number;
  min_age: number;
  success_rate: number;
  image_url: string;
  settings: Record<string, any>;
}

export interface CreateBookingParams {
  venue_id: string;
  game_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  party_size: number;
  ticket_types: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  total_amount: number;
  final_amount: number;
  promo_code?: string;
  notes?: string;
}

export interface BookingResult {
  booking_id: string;
  confirmation_code: string;
  message: string;
}

export class SupabaseBookingService {
  /**
   * Get venue configuration by embed key (public access)
   */
  static async getVenueByEmbedKey(embedKey: string): Promise<VenueConfig | null> {
    try {
      const { data, error } = await supabase.rpc('get_venue_by_embed_key', {
        p_embed_key: embedKey,
      });

      if (error) {
        console.error('Error fetching venue by embed key:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.warn(`No venue found for embed key: ${embedKey}`);
        return null;
      }

      return data[0] as VenueConfig;
    } catch (error) {
      console.error('Exception fetching venue:', error);
      return null;
    }
  }

  /**
   * Get active games for a venue (public access)
   */
  static async getVenueGames(venueId: string): Promise<VenueGame[]> {
    try {
      const { data, error } = await supabase.rpc('get_venue_games', {
        p_venue_id: venueId,
      });

      if (error) {
        console.error('Error fetching venue games:', error);
        return [];
      }

      return (data || []) as VenueGame[];
    } catch (error) {
      console.error('Exception fetching venue games:', error);
      return [];
    }
  }

  /**
   * Create a booking from public widget (no auth required)
   */
  static async createWidgetBooking(params: CreateBookingParams): Promise<BookingResult | null> {
    try {
      const { data, error } = await supabase.rpc('create_widget_booking', {
        p_venue_id: params.venue_id,
        p_game_id: params.game_id,
        p_customer_name: params.customer_name,
        p_customer_email: params.customer_email,
        p_customer_phone: params.customer_phone,
        p_booking_date: params.booking_date,
        p_start_time: params.start_time,
        p_end_time: params.end_time,
        p_party_size: params.party_size,
        p_ticket_types: params.ticket_types,
        p_total_amount: params.total_amount,
        p_final_amount: params.final_amount,
        p_promo_code: params.promo_code || null,
        p_notes: params.notes || null,
      });

      if (error) {
        console.error('Error creating widget booking:', error);
        throw new Error(error.message || 'Failed to create booking');
      }

      if (!data || data.length === 0) {
        throw new Error('No booking data returned');
      }

      return data[0] as BookingResult;
    } catch (error: any) {
      console.error('Exception creating widget booking:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a venue (authenticated access)
   */
  static async getVenueBookings(venueId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*),
          game:games(*),
          venue:venues(*)
        `)
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching venue bookings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching venue bookings:', error);
      return [];
    }
  }

  /**
   * Get booking by confirmation code (public access for customer lookup)
   */
  static async getBookingByConfirmationCode(confirmationCode: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*),
          game:games(*),
          venue:venues(*)
        `)
        .eq('confirmation_code', confirmationCode)
        .single();

      if (error) {
        console.error('Error fetching booking by confirmation code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching booking:', error);
      return null;
    }
  }

  /**
   * Update booking status (authenticated)
   */
  static async updateBookingStatus(bookingId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating booking status:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Exception updating booking status:', error);
      throw error;
    }
  }

  /**
   * Get booked time slots for availability checking
   */
  static async getBookedSlots(gameId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_time, end_time, players')
        .eq('game_id', gameId)
        .eq('booking_date', date)
        .in('status', ['pending', 'confirmed', 'checked_in']);

      if (error) {
        console.error('Error fetching booked slots:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching booked slots:', error);
      return [];
    }
  }
}

export default SupabaseBookingService;
