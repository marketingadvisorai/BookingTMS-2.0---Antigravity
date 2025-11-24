/**
 * SupabaseBookingService - Backend service for real bookings
 * 
 * Handles all booking operations through Supabase RPCs and queries.
 * Replaces localStorage-based demo data with real database persistence.
 */

import { supabase } from '../lib/supabase';
import { BookingService } from './booking.service';
import { SessionService, Session } from './session.service';

// Feature flag to enable/disable Supabase bookings
export const USE_SUPABASE_BOOKINGS = true;

// ... (rest of the file)

let sessionId = '';
let matchedSession: Session | null = null;

// Simple check: if we have sessions, try to match the time part?

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
  private static normalizeGameForWidget(game: VenueGame) {
    const settings = game.settings || {};
    return {
      id: game.id,
      name: game.name,
      slug: game.slug,
      description: game.description || 'An exciting experience awaits!',
      tagline: game.tagline || '',
      difficulty: game.difficulty || 'Medium',
      duration: game.duration || 60,
      minPlayers: game.min_players || 2,
      maxPlayers: game.max_players || 8,
      min_players: game.min_players || 2,
      max_players: game.max_players || 8,
      price: game.price || 0,
      childPrice: game.child_price,
      child_price: game.child_price,
      minAge: game.min_age,
      successRate: game.success_rate || 50,
      image: game.image_url,
      imageUrl: game.image_url,
      coverImage: game.image_url,
      status: 'active',
      settings,
      blockedDates: settings.blockedDates || [],
      availability: settings.availability || {},
      operatingDays:
        settings.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: settings.startTime || '09:00',
      endTime: settings.endTime || '21:00',
      slotInterval: settings.slotInterval || 60,
      advanceBooking: settings.advanceBooking || 30,
      requiresWaiver: settings.requiresWaiver || false,
      selectedWaiver: settings.selectedWaiver || null,
      cancellationWindow: settings.cancellationWindow || 24,
      specialInstructions: settings.specialInstructions || '',
      galleryImages: settings.galleryImages || [],
      videos: settings.videos || [],
      language: settings.language || ['English'],
      minChildren: settings.minChildren || 0,
      maxChildren: settings.maxChildren || 0,
      location: settings.location || '',
      faqs: settings.faqs || [],
      cancellationPolicies: settings.cancellationPolicies || [],
    };
  }

  private static mergeWidgetConfig(venue: VenueConfig, games: VenueGame[]) {
    const storedConfig = (venue.settings?.widgetConfig as Record<string, any>) || {};
    const storedGames = Array.isArray(storedConfig.games) ? storedConfig.games : [];

    const normalizedGames = games.map((game) => this.normalizeGameForWidget(game));

    const mergedGames = normalizedGames.map((normalizedGame) => {
      const storedGame = storedGames.find((game: any) => game.id === normalizedGame.id);
      if (!storedGame) {
        return normalizedGame;
      }

      return {
        ...normalizedGame,
        ...storedGame,
        id: normalizedGame.id,
      };
    });

    const mergedConfig = {
      venueId: venue.id,
      venueName: venue.name,
      primaryColor: venue.primary_color,
      baseUrl: venue.base_url,
      ...storedConfig,
      games: mergedGames,
    };

    return {
      config: mergedConfig,
      games: normalizedGames,
    };
  }

  /**
   * Get venue configuration by embed key (public access)
   */
  static async getVenueByEmbedKey(embedKey: string): Promise<VenueConfig | null> {
    try {
      const { data, error } = await (supabase as any)
        .rpc('get_venue_by_embed_key', {
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
      const { data, error } = await (supabase as any)
        .rpc('get_venue_games', {
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
   * Get full widget configuration for embeds (venue + normalized games + stored widget settings)
   */
  static async getVenueWidgetConfig(embedKey: string) {
    const venue = await this.getVenueByEmbedKey(embedKey);

    if (!venue) {
      return null;
    }

    const games = await this.getVenueGames(venue.id);
    const { config, games: normalizedGames } = this.mergeWidgetConfig(venue, games);

    return {
      venue,
      games: normalizedGames,
      widgetConfig: config,
    };
  }

  /**
   * Create a booking from public widget (no auth required)
   */
  static async createWidgetBooking(params: CreateBookingParams): Promise<BookingResult | null> {
    try {
      // 1. Fetch Venue to get Timezone
      const { data: venue, error: venueError } = await (supabase as any)
        .from('venues')
        .select('timezone, organization_id')
        .eq('id', params.venue_id)
        .single();

      if (venueError || !venue) {
        throw new Error('Venue not found');
      }

      // 2. Resolve Session
      // We need to convert the input date/time to the stored session start_time (UTC ISO)
      // This requires knowing how sessions were generated.
      // For now, let's assume we can find it by matching the start time.
      // Ideally, the widget should pass the session_id if it fetched sessions.
      // If the widget is legacy, we try to find a matching session.

      // Construct a timestamp. This part is tricky without date-fns-tz.
      // We'll try to find a session that starts at the requested time on the requested date.
      // We can use a range query on activity_sessions if exact match fails.

      // Let's try to find a session that overlaps or starts at this time.
      // We'll search for sessions on this date for this activity.

      // Construct search range for the day (in UTC? No, we need to be careful).
      // Let's use the date string and time string to construct a local ISO-like string
      // and let the database handle the timezone comparison if possible, OR
      // just fetch all sessions for the day and match in code.

      const searchDate = new Date(params.booking_date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const sessions = await SessionService.listAvailableSessions(
        params.game_id,
        searchDate,
        nextDate
      );

      // Find matching session
      // We need to match params.start_time (HH:MM) to session.start_time (ISO)
      // We need to convert session.start_time to Venue Time to compare.
      // This is complex without a library on the client side if we don't trust the input.
      // BUT, if we assume the widget logic is consistent with how we display times...

      // Let's try to match loosely:
      // session.start_time is UTC.
      // We need to see if that UTC time corresponds to params.start_time in venue.timezone.

      let sessionId = '';
      let matchedSession: Session | null = null;

      // Simple check: if we have sessions, try to match the time part?
      // Or better: The widget SHOULD be updated to pass session_id.
      // But for backward compatibility/refactoring step 1:

      // We will iterate and check.
      for (const session of sessions) {
        // Convert session UTC to Venue Time
        // We can use the Intl API as we did in SessionService (but that was for generation).
        // Here we just want to check if the time matches.

        const sessionDate = new Date(session.start_time);
        const timeString = sessionDate.toLocaleTimeString('en-US', {
          timeZone: venue.timezone || 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });

        if (timeString === params.start_time) {
          sessionId = session.id;
          matchedSession = session;
          break;
        }
      }

      if (!sessionId) {
        // Fallback: If no session found, maybe it's a legacy game without sessions?
        // But we migrated everything.
        // If we can't find a session, we can't use the new BookingService fully.
        // However, we can try to create a booking with just activity_id if we relax constraints,
        // but BookingService requires sessionId.

        // If we are in "Open Time" mode (no specific slots), we might need a "Day Session" or similar.
        // For now, throw error to enforce slots.
        throw new Error(`No available session found for ${params.start_time} on ${params.booking_date}`);
      }

      // 3. Create Booking using BookingService
      const booking = await BookingService.createBooking({
        sessionId: sessionId,
        activityId: params.game_id,
        venueId: params.venue_id,
        customer: {
          firstName: params.customer_name.split(' ')[0],
          lastName: params.customer_name.split(' ').slice(1).join(' ') || 'Customer',
          email: params.customer_email,
          phone: params.customer_phone
        },
        partySize: params.party_size
      });

      return {
        booking_id: booking.id,
        confirmation_code: booking.booking_number,
        message: 'Booking confirmed successfully'
      };

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
          game:activities(*),
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
          game:activities(*),
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
      const { data, error } = await (supabase as any)
        .from('bookings')
        .update({
          status: status, // Assuming 'updates.status' was a typo and meant the 'status' parameter
          updated_at: new Date().toISOString()
        }).eq('id', bookingId)
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
        .select('start_time, end_time, players')
        .eq('activity_id', gameId)
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
