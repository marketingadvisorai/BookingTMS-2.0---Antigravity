/**
 * Booking Service
 * 
 * Handles all booking-related business logic including:
 * - Creating and managing bookings
 * - Availability checking
 * - Notifications
 * - Payment coordination
 */

import type { Booking, CreateBookingDTO, UpdateBookingDTO } from '../models/Booking';

export class BookingService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  /**
   * Create a new booking
   */
  async createBooking(
    data: CreateBookingDTO,
    organizationId: string,
    userId: string
  ): Promise<Booking> {
    // Validate input
    this.validateBookingData(data);

    // Check availability
    const isAvailable = await this.checkAvailability(
      data.game_id,
      data.booking_date,
      data.start_time
    );

    if (!isAvailable) {
      throw new Error('Time slot is not available');
    }

    // Calculate end time
    const endTime = this.calculateEndTime(data.start_time, data.duration_minutes || 60);

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber();

    // Get game details for pricing
    const game = await this.getGame(data.game_id);

    // Calculate total amount
    const totalAmount = game.price * data.party_size;

    // Create booking
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({
        organization_id: organizationId,
        booking_number: bookingNumber,
        customer_id: data.customer_id,
        game_id: data.game_id,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time: endTime,
        party_size: data.party_size,
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalAmount,
        discount_amount: 0,
        final_amount: totalAmount,
        notes: data.notes || null,
        created_by: userId,
      })
      .select(`
        *,
        customer:customers(full_name, email, phone),
        game:games(name, duration_minutes)
      `)
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }

    // Send confirmation email
    await this.sendBookingConfirmation(booking);

    // Create notification
    await this.createNotification(booking, 'created');

    return booking;
  }

  /**
   * Update an existing booking
   */
  async updateBooking(
    bookingId: string,
    updates: UpdateBookingDTO,
    organizationId: string
  ): Promise<Booking> {
    // Check if booking exists and belongs to organization
    const existing = await this.getBooking(bookingId, organizationId);

    if (!existing) {
      throw new Error('Booking not found');
    }

    // If date/time changed, check availability
    if (updates.booking_date || updates.start_time) {
      const date = updates.booking_date || existing.booking_date;
      const time = updates.start_time || existing.start_time;

      const isAvailable = await this.checkAvailability(
        existing.game_id,
        date,
        time,
        bookingId // Exclude current booking
      );

      if (!isAvailable) {
        throw new Error('New time slot is not available');
      }
    }

    // Update booking
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('organization_id', organizationId)
      .select(`
        *,
        customer:customers(full_name, email, phone),
        game:games(name, duration_minutes)
      `)
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }

    // Send modification email if date/time changed
    if (updates.booking_date || updates.start_time) {
      await this.sendBookingModification(booking);
    }

    // Create notification
    await this.createNotification(booking, 'updated');

    return booking;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    organizationId: string,
    reason?: string
  ): Promise<Booking> {
    const booking = await this.updateBooking(
      bookingId,
      { 
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      },
      organizationId
    );

    // Send cancellation email
    await this.sendBookingCancellation(booking);

    // Create notification
    await this.createNotification(booking, 'cancelled');

    return booking;
  }

  /**
   * Check-in a customer
   */
  async checkIn(
    bookingId: string,
    organizationId: string
  ): Promise<Booking> {
    return await this.updateBooking(
      bookingId,
      { status: 'checked-in' },
      organizationId
    );
  }

  /**
   * Get booking by ID
   */
  async getBooking(
    bookingId: string,
    organizationId: string
  ): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(full_name, email, phone),
        game:games(name, duration_minutes, price)
      `)
      .eq('id', bookingId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }

    return data;
  }

  /**
   * List bookings with filters
   */
  async listBookings(
    organizationId: string,
    filters?: {
      status?: string;
      date?: string;
      gameId?: string;
      customerId?: string;
    }
  ): Promise<Booking[]> {
    let query = this.supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(full_name, email, phone),
        game:games(name)
      `)
      .eq('organization_id', organizationId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.date) {
      query = query.eq('booking_date', filters.date);
    }

    if (filters?.gameId) {
      query = query.eq('game_id', filters.gameId);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    query = query.order('booking_date', { ascending: false })
      .order('start_time', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error listing bookings:', error);
      throw new Error('Failed to list bookings');
    }

    return data || [];
  }

  /**
   * Check availability for a time slot
   */
  private async checkAvailability(
    gameId: string,
    date: string,
    time: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    let query = this.supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('booking_date', date)
      .eq('start_time', time)
      .neq('status', 'cancelled');

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    return (count || 0) === 0;
  }

  /**
   * Generate unique booking number
   */
  private async generateBookingNumber(): Promise<string> {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}${random}`;
  }

  /**
   * Calculate end time based on start time and duration
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Get game details
   */
  private async getGame(gameId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error || !data) {
      throw new Error('Game not found');
    }

    return data;
  }

  /**
   * Validate booking data
   */
  private validateBookingData(data: CreateBookingDTO): void {
    if (!data.game_id) {
      throw new Error('Game is required');
    }

    if (!data.customer_id) {
      throw new Error('Customer is required');
    }

    if (!data.booking_date) {
      throw new Error('Booking date is required');
    }

    if (!data.start_time) {
      throw new Error('Start time is required');
    }

    if (!data.party_size || data.party_size < 1) {
      throw new Error('Party size must be at least 1');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.booking_date)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.start_time)) {
      throw new Error('Invalid time format. Use HH:MM');
    }

    // Validate booking is not in the past
    const bookingDateTime = new Date(`${data.booking_date}T${data.start_time}`);
    if (bookingDateTime < new Date()) {
      throw new Error('Cannot book in the past');
    }
  }

  /**
   * Send booking confirmation email
   */
  private async sendBookingConfirmation(booking: Booking): Promise<void> {
    // TODO: Implement email sending with SendGrid
    console.log('Sending booking confirmation to:', booking.customer.email);
  }

  /**
   * Send booking modification email
   */
  private async sendBookingModification(booking: Booking): Promise<void> {
    // TODO: Implement email sending with SendGrid
    console.log('Sending booking modification to:', booking.customer.email);
  }

  /**
   * Send booking cancellation email
   */
  private async sendBookingCancellation(booking: Booking): Promise<void> {
    // TODO: Implement email sending with SendGrid
    console.log('Sending booking cancellation to:', booking.customer.email);
  }

  /**
   * Create notification
   */
  private async createNotification(
    booking: Booking,
    action: 'created' | 'updated' | 'cancelled'
  ): Promise<void> {
    const messages = {
      created: `New booking ${booking.booking_number} for ${booking.game.name}`,
      updated: `Booking ${booking.booking_number} has been updated`,
      cancelled: `Booking ${booking.booking_number} has been cancelled`,
    };

    await this.supabase
      .from('notifications')
      .insert({
        organization_id: booking.organization_id,
        user_id: booking.created_by,
        type: 'booking',
        priority: 'high',
        title: 'Booking Update',
        message: messages[action],
        metadata: {
          booking_id: booking.id,
          booking_number: booking.booking_number,
          action,
        },
      });
  }
}
