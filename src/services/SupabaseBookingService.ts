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

let sessionId = '';
let matchedSession: Session | null = null;

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

export interface VenueActivity {
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
  activity_id: string;
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
  private static normalizeActivityForWidget(activity: VenueActivity) {
    const settings = activity.settings || {};
    return {
      id: activity.id,
      name: activity.name,
      slug: activity.slug,
      description: activity.description || 'An exciting experience awaits!',
      tagline: activity.tagline || '',
      difficulty: activity.difficulty || 'Medium',
      duration: activity.duration || 60,
      minPlayers: activity.min_players || 2,
      maxPlayers: activity.max_players || 8,
      min_players: activity.min_players || 2,
      max_players: activity.max_players || 8,
      price: activity.price || 0,
      childPrice: activity.child_price,
      child_price: activity.child_price,
      minAge: activity.min_age,
      successRate: activity.success_rate || 50,
      image: activity.image_url,
      imageUrl: activity.image_url,
      coverImage: activity.image_url,
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

  private static mergeWidgetConfig(venue: VenueConfig, activities: VenueActivity[]) {
    const storedConfig = (venue.settings?.widgetConfig as Record<string, any>) || {};
    // Handle both 'activities' and legacy 'games' keys
    const storedActivities = Array.isArray(storedConfig.activities)
      ? storedConfig.activities
      : (Array.isArray(storedConfig.games) ? storedConfig.games : []);

    const normalizedActivities = activities.map((activity) => this.normalizeActivityForWidget(activity));

    const mergedActivities = normalizedActivities.map((normalizedActivity) => {
      const storedActivity = storedActivities.find((activity: any) => activity.id === normalizedActivity.id);
      if (!storedActivity) {
        return normalizedActivity;
      }

      return {
        ...normalizedActivity,
        ...storedActivity,
        id: normalizedActivity.id,
      };
    });

    const mergedConfig = {
      venueId: venue.id,
      venueName: venue.name,
      primaryColor: venue.primary_color,
      baseUrl: venue.base_url,
      ...storedConfig,
      activities: mergedActivities,
      games: mergedActivities, // Keep for backward compatibility
    };

    return {
      config: mergedConfig,
      activities: normalizedActivities,
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
   * Get active activities for a venue (public access)
   */
  static async getVenueActivities(venueId: string): Promise<VenueActivity[]> {
    try {
      // Direct query to 'activities' table
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching venue activities:', error);
        return [];
      }

      return (data || []) as any as VenueActivity[];
    } catch (error) {
      console.error('Exception fetching venue activities:', error);
      return [];
    }
  }

  /**
   * Get full widget configuration for embeds (venue + normalized activities + stored widget settings)
   */
  static async getVenueWidgetConfig(embedKey: string) {
    const venue = await this.getVenueByEmbedKey(embedKey);

    if (!venue) {
      return null;
    }

    const activities = await this.getVenueActivities(venue.id);
    const { config, activities: normalizedActivities } = this.mergeWidgetConfig(venue, activities);

    return {
      venue,
      activities: normalizedActivities,
      games: normalizedActivities, // Backward compatibility
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
      const searchDate = new Date(params.booking_date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const sessions = await SessionService.listAvailableSessions(
        params.activity_id,
        searchDate,
        nextDate
      );

      // Find matching session
      let sessionId = '';
      let matchedSession: Session | null = null;

      for (const session of sessions) {
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
        throw new Error(`No available session found for ${params.start_time} on ${params.booking_date}`);
      }

      // 3. Create Booking using BookingService
      const booking = await BookingService.createBooking({
        sessionId: sessionId,
        activityId: params.activity_id,
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
          activity:activities(*),
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
          activity:activities(*),
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
          status: status,
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
  static async getBookedSlots(activityId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, players')
        .eq('activity_id', activityId)
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
