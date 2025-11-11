/**
 * Booking Domain Types
 * Enterprise-grade type definitions for booking domain
 * @module core/domain/booking
 */

/**
 * Booking status enumeration
 * Represents all possible states of a booking
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no-show',
  IN_PROGRESS = 'in-progress',
}

/**
 * Payment status enumeration
 * Tracks payment state for bookings
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially-paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

/**
 * Booking source enumeration
 * Identifies where the booking originated
 */
export enum BookingSource {
  WIDGET = 'widget',
  ADMIN = 'admin',
  MOBILE = 'mobile',
  API = 'api',
  PHONE = 'phone',
  WALK_IN = 'walk-in',
}

/**
 * Core booking entity interface
 * Represents a booking in the system
 */
export interface IBooking {
  id: string;
  organizationId: string;
  venueId: string;
  gameId: string;
  customerId: string;
  
  // Booking details
  bookingDate: Date;
  bookingTime: string;
  endTime: string;
  players: number;
  
  // Status tracking
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  
  // Financial
  totalAmount: number;
  depositAmount: number;
  finalAmount: number;
  discountAmount?: number;
  
  // Additional info
  notes?: string;
  confirmationCode: string;
  promoCode?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking creation data transfer object
 * Used when creating a new booking
 */
export interface ICreateBookingDTO {
  organizationId: string;
  venueId: string;
  gameId: string;
  customerId: string;
  bookingDate: Date;
  bookingTime: string;
  players: number;
  totalAmount: number;
  depositAmount?: number;
  notes?: string;
  promoCode?: string;
  source?: BookingSource;
  metadata?: Record<string, any>;
}

/**
 * Booking update data transfer object
 * Used when updating an existing booking
 */
export interface IUpdateBookingDTO {
  bookingDate?: Date;
  bookingTime?: string;
  players?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Booking cancellation data transfer object
 * Used when cancelling a booking
 */
export interface ICancelBookingDTO {
  bookingId: string;
  reason: string;
  refundAmount?: number;
  cancelledBy: string;
}

/**
 * Booking availability slot
 * Represents an available time slot for booking
 */
export interface IAvailabilitySlot {
  date: Date;
  time: string;
  endTime: string;
  available: boolean;
  capacity: number;
  booked: number;
  remaining: number;
  price: number;
}

/**
 * Booking filter criteria
 * Used for querying bookings
 */
export interface IBookingFilter {
  organizationId: string;
  venueId?: string;
  gameId?: string;
  customerId?: string;
  status?: BookingStatus[];
  paymentStatus?: PaymentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  source?: BookingSource[];
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Booking statistics
 * Aggregated booking data for analytics
 */
export interface IBookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
}

/**
 * Booking conflict check result
 * Used to identify scheduling conflicts
 */
export interface IBookingConflict {
  hasConflict: boolean;
  conflictingBookings: IBooking[];
  reason?: string;
}

/**
 * Booking validation result
 * Result of booking validation checks
 */
export interface IBookingValidation {
  isValid: boolean;
  errors: IValidationError[];
  warnings: IValidationWarning[];
}

/**
 * Validation error
 */
export interface IValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation warning
 */
export interface IValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Booking notification data
 * Data for sending booking notifications
 */
export interface IBookingNotification {
  bookingId: string;
  customerId: string;
  type: BookingNotificationType;
  channel: NotificationChannel[];
  data: Record<string, any>;
}

/**
 * Booking notification type
 */
export enum BookingNotificationType {
  CONFIRMATION = 'confirmation',
  REMINDER = 'reminder',
  CANCELLATION = 'cancellation',
  UPDATE = 'update',
  PAYMENT_RECEIVED = 'payment_received',
  REFUND_PROCESSED = 'refund_processed',
}

/**
 * Notification channel
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

/**
 * Booking list response
 * Paginated list of bookings
 */
export interface IBookingListResponse {
  bookings: IBooking[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Booking details response
 * Complete booking information with related entities
 */
export interface IBookingDetailsResponse extends IBooking {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  game: {
    id: string;
    name: string;
    duration: number;
    difficulty: string;
  };
  venue: {
    id: string;
    name: string;
    address: string;
    timezone: string;
  };
  payments: IPaymentRecord[];
}

/**
 * Payment record
 */
export interface IPaymentRecord {
  id: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
}

/**
 * Type guard to check if value is a valid BookingStatus
 */
export function isBookingStatus(value: any): value is BookingStatus {
  return Object.values(BookingStatus).includes(value);
}

/**
 * Type guard to check if value is a valid PaymentStatus
 */
export function isPaymentStatus(value: any): value is PaymentStatus {
  return Object.values(PaymentStatus).includes(value);
}

/**
 * Type guard to check if value is a valid BookingSource
 */
export function isBookingSource(value: any): value is BookingSource {
  return Object.values(BookingSource).includes(value);
}
