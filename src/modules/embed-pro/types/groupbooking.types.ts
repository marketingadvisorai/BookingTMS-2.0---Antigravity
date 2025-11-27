/**
 * Embed Pro 2.0 - Group Booking Types
 * @module embed-pro/types/groupbooking.types
 * 
 * Type definitions for group booking with multiple activities.
 * Allows customers to book multiple activities in a single transaction.
 */

// =====================================================
// GROUP BOOKING TYPES
// =====================================================

export interface GroupBookingActivity {
  /** Activity ID */
  activityId: string;
  /** Activity name */
  name: string;
  /** Selected date (ISO string) */
  date: string;
  /** Selected time slot ID */
  timeSlotId: string;
  /** Selected time (display) */
  time: string;
  /** Party size for this activity */
  partySize: number;
  /** Price per person in cents */
  pricePerPerson: number;
  /** Total price for this activity */
  totalPrice: number;
  /** Duration in minutes */
  duration: number;
  /** Activity image URL */
  imageUrl?: string;
}

export interface GroupBooking {
  /** Unique identifier */
  id: string;
  /** Organization ID */
  organizationId: string;
  /** Venue ID */
  venueId: string;
  /** Activities in the group */
  activities: GroupBookingActivity[];
  /** Customer info */
  customer: GroupBookingCustomer;
  /** Total price in cents */
  totalPrice: number;
  /** Discount amount (promo/gift) */
  discountAmount: number;
  /** Final price after discounts */
  finalPrice: number;
  /** Status */
  status: GroupBookingStatus;
  /** Booking reference */
  bookingRef: string;
  /** Created timestamp */
  createdAt: string;
  /** Notes */
  notes?: string;
}

export interface GroupBookingCustomer {
  name: string;
  email: string;
  phone?: string;
}

export type GroupBookingStatus = 
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled';

// =====================================================
// CART TYPES (for building group booking)
// =====================================================

export interface GroupBookingCartItem {
  /** Unique cart item ID */
  id: string;
  /** Activity details */
  activity: {
    id: string;
    name: string;
    imageUrl?: string;
    pricePerPerson: number;
    duration: number;
    minPlayers: number;
    maxPlayers: number;
  };
  /** Selected date */
  date: string | null;
  /** Selected time slot */
  timeSlot: {
    id: string;
    time: string;
    spotsRemaining: number;
  } | null;
  /** Party size */
  partySize: number;
}

export interface GroupBookingCart {
  /** Cart items */
  items: GroupBookingCartItem[];
  /** Venue info */
  venue: {
    id: string;
    name: string;
  };
  /** Organization ID */
  organizationId: string;
  /** Subtotal in cents */
  subtotal: number;
  /** Applied promo discount */
  promoDiscount: number;
  /** Applied gift card amount */
  giftCardAmount: number;
  /** Final total */
  total: number;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface GroupBookingState {
  /** Current step */
  step: 'select' | 'schedule' | 'checkout' | 'success';
  /** Cart */
  cart: GroupBookingCart;
  /** Currently editing item index */
  editingIndex: number | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

// =====================================================
// ACTION TYPES
// =====================================================

export type GroupBookingAction =
  | { type: 'ADD_ACTIVITY'; activity: GroupBookingCartItem['activity'] }
  | { type: 'REMOVE_ACTIVITY'; index: number }
  | { type: 'UPDATE_DATE'; index: number; date: string }
  | { type: 'UPDATE_TIME_SLOT'; index: number; timeSlot: GroupBookingCartItem['timeSlot'] }
  | { type: 'UPDATE_PARTY_SIZE'; index: number; partySize: number }
  | { type: 'SET_EDITING'; index: number | null }
  | { type: 'APPLY_PROMO'; discount: number }
  | { type: 'APPLY_GIFT_CARD'; amount: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };
