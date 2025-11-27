/**
 * BookFlow Widget - Service Layer
 * @module widgets/bookflow/services
 * 
 * Handles all data fetching for BookFlow widgets
 */

import { supabase } from '../../../../lib/supabase';
import type { BookFlowActivity, BookFlowVenue, TimeSlot } from '../types';

class BookFlowService {
  /**
   * Fetch activity by ID for single activity widget
   */
  async getActivity(activityId: string): Promise<BookFlowActivity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id, name, description, tagline, cover_image,
        price, child_price, currency, duration,
        min_players, max_players, min_age, difficulty,
        schedule, stripe_product_id, stripe_price_id
      `)
      .eq('id', activityId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error fetching activity:', error);
      return null;
    }

    return this.normalizeActivity(data);
  }

  /**
   * Fetch venue with all activities
   */
  async getVenue(venueId: string): Promise<BookFlowVenue | null> {
    const { data: venueData, error: venueError } = await (supabase
      .from('venues')
      .select('id, name, slug, address, city, state, timezone, primary_color')
      .eq('id', venueId)
      .eq('status', 'active')
      .single() as any);

    if (venueError || !venueData) {
      console.error('Error fetching venue:', venueError);
      return null;
    }

    const venue = venueData as any;

    const { data: activitiesData } = await (supabase
      .from('activities')
      .select(`
        id, name, description, tagline, cover_image,
        price, child_price, currency, duration,
        min_players, max_players, min_age, difficulty,
        schedule, stripe_product_id, stripe_price_id
      `)
      .eq('venue_id', venueId)
      .eq('is_active', true)
      .order('name') as any);

    const activities = (activitiesData || []) as any[];

    return {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      timezone: venue.timezone || 'UTC',
      primaryColor: venue.primary_color,
      activities: activities.map(a => this.normalizeActivity(a)),
    };
  }

  /**
   * Get available time slots for a date
   */
  async getAvailableSlots(
    activityId: string,
    date: Date
  ): Promise<TimeSlot[]> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get activity schedule
    const { data: activityData } = await (supabase
      .from('activities')
      .select('schedule, max_players')
      .eq('id', activityId)
      .single() as any);

    const activity = activityData as { schedule: any; max_players: number } | null;
    if (!activity?.schedule) return [];

    const schedule = activity.schedule;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if this day is an operating day
    if (!schedule.operatingDays?.includes(dayName)) {
      return [];
    }

    // Check if date is blocked
    if (schedule.blockedDates?.includes(dateStr)) {
      return [];
    }

    // Get existing bookings for this date
    const { data: bookingsData } = await (supabase
      .from('bookings')
      .select('start_time, party_size')
      .eq('activity_id', activityId)
      .eq('booking_date', dateStr)
      .in('status', ['confirmed', 'pending']) as any);

    const bookings = (bookingsData || []) as { start_time: string; party_size: number }[];

    // Generate time slots
    const slots: TimeSlot[] = [];
    const startHour = parseInt(schedule.startTime?.split(':')[0] || '9');
    const endHour = parseInt(schedule.endTime?.split(':')[0] || '21');
    const interval = schedule.slotInterval || 60;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        // Check how many spots are booked at this time
        const bookedCount = bookings.filter(b => b.start_time === time)
          .reduce((sum, b) => sum + (b.party_size || 0), 0);

        const remaining = (activity.max_players || 10) - bookedCount;

        slots.push({
          time,
          available: remaining > 0,
          remainingSpots: Math.max(0, remaining),
        });
      }
    }

    return slots;
  }

  /**
   * Normalize activity data from database format
   */
  private normalizeActivity(data: any): BookFlowActivity {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      tagline: data.tagline,
      coverImage: data.cover_image,
      price: data.price || 0,
      childPrice: data.child_price,
      currency: data.currency || 'USD',
      duration: data.duration || 60,
      minPlayers: data.min_players || 1,
      maxPlayers: data.max_players || 10,
      minAge: data.min_age,
      difficulty: data.difficulty,
      schedule: data.schedule || {
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '21:00',
        slotInterval: 60,
      },
      stripeProductId: data.stripe_product_id,
      stripePriceId: data.stripe_price_id,
    };
  }
}

export const bookflowService = new BookFlowService();
