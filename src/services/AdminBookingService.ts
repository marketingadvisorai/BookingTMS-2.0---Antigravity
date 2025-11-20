/**
 * Admin Booking Service
 * Handles admin-specific booking operations including customer creation
 */

import { supabase } from '../lib/supabase';

export interface CreateAdminBookingParams {
  venue_id: string;
  game_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  adults: number;
  children: number;
  total_amount: number;
  payment_method: string;
  payment_status?: string;
  deposit_amount?: number;
  notes?: string;
  customer_notes?: string;
}

export class AdminBookingService {
  /**
   * Find or create customer by email
   */
  static async findOrCreateCustomer(
    organizationId: string,
    name: string,
    email: string,
    phone: string
  ): Promise<string> {
    try {
      // Try to find existing customer by email
      const { data: existingCustomer, error: findError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingCustomer) {
        return existingCustomer.id;
      }

      // Create new customer
      // Split name into first and last name
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          status: 'active',
        })
        .select('id')
        .single();

      if (createError) throw createError;
      if (!newCustomer) throw new Error('Failed to create customer');

      return newCustomer.id;
    } catch (error: any) {
      console.error('Error finding/creating customer:', error);
      throw error;
    }
  }

  /**
   * Create booking from admin panel
   */
  static async createAdminBooking(params: CreateAdminBookingParams): Promise<any> {
    try {
      // Verify venue exists
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .select('id')
        .eq('id', params.venue_id)
        .single();

      if (venueError || !venue) {
        throw new Error('Venue not found');
      }

      // Find or create customer (no organization_id needed)
      const customerId = await this.findOrCreateCustomer(
        '', // organizationId not used anymore
        params.customer_name,
        params.customer_email,
        params.customer_phone
      );

      // Check availability
      const { data: isAvailable, error: availError } = await supabase
        .rpc('check_game_availability', {
          p_game_id: params.game_id,
          p_booking_date: params.booking_date,
          p_start_time: params.start_time,
          p_end_time: params.end_time,
          p_exclude_booking_id: null,
        });

      if (availError) throw availError;
      if (!isAvailable) {
        throw new Error('Selected time slot is not available');
      }

      // Generate booking number
      const bookingNumber = `BK-${Math.floor(10000 + Math.random() * 90000)}`;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          venue_id: params.venue_id,
          confirmation_code: bookingNumber,
          customer_id: customerId,
          game_id: params.game_id,
          booking_date: params.booking_date,
          booking_time: params.start_time,
          end_time: params.end_time,
          players: params.adults + params.children,
          status: 'confirmed',
          total_amount: params.total_amount,
          deposit_amount: params.deposit_amount || 0,
          payment_status: params.payment_status || 'pending',
          payment_method: params.payment_method,
          notes: params.notes || null,
          customer_notes: params.customer_notes || null,
          source: 'admin',
          metadata: {
            adults: params.adults,
            children: params.children,
          },
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      return booking;
    } catch (error: any) {
      console.error('Error creating admin booking:', error);
      throw error;
    }
  }

  /**
   * Check if a time slot is available
   */
  static async checkSlotAvailability(
    gameId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_game_availability', {
          p_game_id: gameId,
          p_booking_date: date,
          p_start_time: startTime,
          p_end_time: endTime,
          p_exclude_booking_id: null,
        });

      if (error) {
        console.error('Error checking availability:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Exception checking availability:', error);
      return false;
    }
  }
}
