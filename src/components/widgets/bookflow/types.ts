/**
 * BookFlow Widget - Type Definitions
 * @module widgets/bookflow/types
 */

// =====================================================
// ACTIVITY & VENUE TYPES
// =====================================================

export interface BookFlowActivity {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  coverImage: string | null;
  price: number;
  childPrice: number | null;
  currency: string;
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  minAge: number | null;
  difficulty: string | null;
  schedule: BookFlowSchedule;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

export interface BookFlowVenue {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  state: string | null;
  timezone: string;
  primaryColor: string | null;
  activities: BookFlowActivity[];
}

export interface BookFlowSchedule {
  operatingDays: string[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  blockedDates?: string[];
}

// =====================================================
// BOOKING STATE TYPES
// =====================================================

export interface BookFlowState {
  step: 'activity' | 'date' | 'time' | 'players' | 'checkout' | 'confirmation';
  selectedActivityId: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  playerCount: number;
  childCount: number;
  customerInfo: CustomerInfo | null;
  promoCode: string | null;
  giftCardCode: string | null;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  remainingSpots: number;
}

// =====================================================
// WIDGET PROPS
// =====================================================

export interface BookFlowWidgetProps {
  embedKey: string;
  targetType: 'activity' | 'venue';
  targetId: string;
  config?: Partial<BookFlowConfig>;
  style?: Partial<BookFlowStyle>;
  theme?: 'light' | 'dark';
  onBookingComplete?: (booking: BookingResult) => void;
}

export interface BookFlowConfig {
  showCalendar: boolean;
  showTimeSlots: boolean;
  showPlayerCount: boolean;
  allowCoupons: boolean;
  allowGiftCards: boolean;
  redirectAfterBooking: string | null;
  buttonText: string;
  successMessage: string;
}

export interface BookFlowStyle {
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
}

// =====================================================
// BOOKING RESULT
// =====================================================

export interface BookingResult {
  bookingId: string;
  confirmationCode: string;
  activityName: string;
  date: string;
  time: string;
  playerCount: number;
  totalAmount: number;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export const DEFAULT_CONFIG: BookFlowConfig = {
  showCalendar: true,
  showTimeSlots: true,
  showPlayerCount: true,
  allowCoupons: true,
  allowGiftCards: true,
  redirectAfterBooking: null,
  buttonText: 'Book Now',
  successMessage: 'Your booking is confirmed!',
};

export const DEFAULT_STYLE: BookFlowStyle = {
  primaryColor: '#3B82F6',
  borderRadius: '12px',
  fontFamily: 'Inter, system-ui, sans-serif',
};
