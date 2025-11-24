import { supabase } from '../supabase';
import { PaymentService } from '../payments/paymentService';

export interface CreateBookingParams {
  venueId: string;
  activityId: string;
  sessionId?: string; // Added sessionId
  bookingDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  totalPrice: number;
}

export interface BookingWithPayment {
  bookingId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export class BookingService {
  /**
   * Create booking and payment intent in one transaction
   */
  static async createBookingWithPayment(
    params: CreateBookingParams
  ): Promise<BookingWithPayment> {
    try {
      // 1. Find or create customer
      const customer = await this.findOrCreateCustomer(params.customer);

      // 2. Create booking record
      const booking = await this.createBooking({
        venueId: params.venueId,
        activityId: params.activityId,
        sessionId: params.sessionId, // Pass sessionId
        customerId: customer.id,
        bookingDate: params.bookingDate,
        startTime: params.startTime,
        endTime: params.endTime,
        partySize: params.partySize,
        totalPrice: params.totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
      });

      // 3. Create payment intent
      const paymentIntent = await PaymentService.createPaymentIntent({
        bookingId: booking.id,
        amount: params.totalPrice,
        currency: 'usd',
      });

      return {
        bookingId: booking.id,
        clientSecret: paymentIntent.clientSecret,
        amount: params.totalPrice,
        currency: 'USD',
      };
    } catch (error) {
      console.error('Error creating booking with payment:', error);
      throw error;
    }
  }

  /**
   * Find existing customer or create new one
   */
  static async findOrCreateCustomer(customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    // Check if customer exists
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerData.email)
      .single();

    if (existing) {
      return existing;
    }

    // Create new customer
    const { data: newCustomer, error } = await (supabase
      .from('customers') as any)
      .insert({
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    return newCustomer;
  }

  /**
   * Create booking record
   */
  static async createBooking(data: {
    venueId: string;
    activityId: string;
    sessionId?: string; // Added sessionId
    customerId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    partySize: number;
    totalPrice: number;
    status: string;
    paymentStatus: string;
  }) {
    const { data: booking, error } = await (supabase
      .from('bookings') as any)
      .insert({
        venue_id: data.venueId,
        activity_id: data.activityId,
        session_id: data.sessionId || null, // Use session_id
        customer_id: data.customerId,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: data.endTime,
        party_size: data.partySize,
        total_price: data.totalPrice,
        status: data.status,
        payment_status: data.paymentStatus,
        payment_amount: data.totalPrice,
        payment_currency: 'USD',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return booking;
  }

  /**
   * Get booking by ID with all related data
   */
  static async getBooking(bookingId: string) {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select(`
        *,
        venue:venues(*),
        activity:activities(*),
        customer:customers(*),
        payment:payments(*)
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all bookings for a customer
   */
  static async getCustomerBookings(customerId: string) {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .select(`
        *,
        venue:venues(name),
        activity:activities(name, description),
        payment:payments(status, amount)
      `)
      .eq('customer_id', customerId)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching customer bookings:', error);
      return [];
    }

    return data;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string, reason?: string) {
    const { data, error } = await (supabase
      .from('bookings') as any)
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    bookingId: string,
    status: string,
    paymentStatus?: string
  ) {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    const { data, error } = await (supabase
      .from('bookings') as any)
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }

    return data;
  }
}
