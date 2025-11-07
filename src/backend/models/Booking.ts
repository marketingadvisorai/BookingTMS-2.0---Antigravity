/**
 * Booking Model
 * 
 * Type definitions for booking entities
 */

export interface Booking {
  id: string;
  organization_id: string;
  booking_number: string;
  customer_id: string;
  game_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  party_size: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Relationships (from SELECT with joins)
  customer?: {
    full_name: string;
    email: string;
    phone?: string;
  };
  game?: {
    name: string;
    duration_minutes: number;
    price?: number;
  };
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partial'
  | 'refunded';

/**
 * DTO for creating a new booking
 */
export interface CreateBookingDTO {
  customer_id: string;
  game_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  party_size: number;
  duration_minutes?: number; // Optional, defaults to game duration
  notes?: string;
  promo_code?: string;
  gift_card_code?: string;
}

/**
 * DTO for updating a booking
 */
export interface UpdateBookingDTO {
  booking_date?: string;
  start_time?: string;
  party_size?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  notes?: string;
  discount_amount?: number;
}

/**
 * DTO for booking filters
 */
export interface BookingFilters {
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  date?: string;
  date_from?: string;
  date_to?: string;
  game_id?: string;
  customer_id?: string;
  search?: string; // Search by booking number or customer name
}

/**
 * DTO for booking response with pagination
 */
export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * DTO for availability check
 */
export interface AvailabilityRequest {
  game_id: string;
  date: string; // YYYY-MM-DD
  start_time?: string; // Optional, check all slots if not provided
}

export interface AvailabilityResponse {
  available: boolean;
  slots?: TimeSlot[];
}

export interface TimeSlot {
  time: string; // HH:MM
  available: boolean;
  bookings?: number; // Number of existing bookings
}

/**
 * DTO for booking statistics
 */
export interface BookingStats {
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_party_size: number;
  most_popular_game?: string;
  busiest_time_slot?: string;
}
