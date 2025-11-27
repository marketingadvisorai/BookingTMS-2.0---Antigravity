/**
 * Customer Portal Types
 * Types for customer-facing booking management portal
 */

// Customer lookup methods
export type CustomerLookupMethod = 'email' | 'booking_reference' | 'phone';

// Customer authentication state
export interface CustomerAuthState {
  isAuthenticated: boolean;
  customer: CustomerProfile | null;
  lookupMethod: CustomerLookupMethod | null;
  sessionToken: string | null;
  expiresAt: Date | null;
}

// Customer profile from database
export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  totalBookings: number;
  createdAt: string;
}

// Customer booking with full details
export interface CustomerBooking {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  activityId: string;
  activityName: string;
  activityImage: string | null;
  venueName: string;
  venueAddress: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  canCancel: boolean;
  canReschedule: boolean;
  cancellationDeadline: string | null;
}

// Booking status types
export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Payment status types
export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'failed';

// Lookup request
export interface CustomerLookupRequest {
  method: CustomerLookupMethod;
  value: string;
}

// Lookup response
export interface CustomerLookupResponse {
  success: boolean;
  customer: CustomerProfile | null;
  sessionToken: string | null;
  expiresAt: string | null;
  error?: string;
}

// Booking cancellation request
export interface CancelBookingRequest {
  bookingId: string;
  reason?: string;
}

// Booking cancellation response
export interface CancelBookingResponse {
  success: boolean;
  refundAmount: number | null;
  refundStatus: 'full' | 'partial' | 'none';
  message: string;
}

// Reschedule request
export interface RescheduleBookingRequest {
  bookingId: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
}

// Reschedule response
export interface RescheduleBookingResponse {
  success: boolean;
  newBookingReference: string | null;
  message: string;
}

// Available slot for rescheduling
export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  spotsAvailable: number;
}

// Portal view types
export type PortalView = 'lookup' | 'dashboard' | 'booking-details' | 'reschedule';

// Portal state
export interface PortalState {
  view: PortalView;
  selectedBookingId: string | null;
  isLoading: boolean;
  error: string | null;
}
