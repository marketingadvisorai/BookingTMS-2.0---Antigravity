/**
 * Shared types for booking page components
 */

export interface GameData {
  name: string;
  description: string;
  price: number;
  duration: string | number;
  difficulty: string;
  difficultyLevel: number;
  players: string;
  gameType: string;
  minAge: number;
  ageRecommendation: string;
  rating: number;
  reviewCount: number;
  location: string;
  image: string;
  gallery: string[];
  highlights: string[];
  longDescription: string;
  story: string;
  whatToExpect: string[];
  requirements: string[];
  faq: Array<{ question: string; answer: string }>;
  reviews: Array<{ name: string; rating: number; date: string; comment: string }>;
  schedule: ScheduleData;
  timezone: string;
}

export interface ScheduleData {
  operatingDays: string[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  duration: number;
  advanceBooking?: number;
  customHours?: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
  customHoursEnabled?: boolean;
  customDates?: Array<{ id: string; date: string; startTime: string; endTime: string }>;
  blockedDates?: Array<{ id?: string; date: string; reason?: string }>;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVV: string;
  cardName: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  spots?: number;
  capacity?: number;
  sessionId?: string;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
}

export interface GiftCard {
  code: string;
  amount: number;
}

export type BookingStep = 'booking' | 'cart' | 'checkout' | 'success';

export interface ParticipantCounts {
  adults: number;
  children: number;
  custom: Record<string, number>;
}

export interface StripePrices {
  adult?: {
    price_id: string;
    lookup_key: string;
    amount: number;
    currency: string;
  } | null;
  child?: {
    price_id: string;
    lookup_key: string;
    amount: number;
    currency: string;
  } | null;
  custom?: Array<{
    id: string;
    name: string;
    price_id: string;
    lookup_key: string;
    amount: number;
    min: number;
    max: number;
    currency: string;
  }>;
}

export interface BookingPageState {
  currentStep: BookingStep;
  selectedDate: number;
  selectedTime: string | null;
  participants: ParticipantCounts;
  customerData: CustomerData;
  appliedPromoCode: PromoCode | null;
  appliedGiftCard: GiftCard | null;
  isSubmitting: boolean;
  bookingNumber: string;
}

export interface BookingPageProps {
  primaryColor: string;
  gameData: GameData;
  config?: any;
  activityId?: string;
  venueId?: string;
}

// Component-specific props
export interface BookingHeroProps {
  gameData: GameData;
  primaryColor: string;
  onShowDetails: () => void;
  onShowVideo: () => void;
}

export interface BookingCalendarProps {
  currentDate: Date;
  selectedDate: number;
  onDateSelect: (day: number) => void;
  onMonthChange: (newDate: Date) => void;
  primaryColor: string;
  schedule: ScheduleData;
  blockedDates: Array<{ date: string; reason?: string } | string>;
  customDates: Array<{ id: string; date: string; startTime: string; endTime: string }>;
  advanceBookingDays: number;
}

export interface BookingTimeSlotsProps {
  selectedDate: number;
  currentDate: Date;
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  primaryColor: string;
  loading?: boolean;
  timezone: string;
}

export interface BookingSidebarProps {
  gameData: GameData;
  selectedDate: number;
  selectedTime: string | null;
  participants: ParticipantCounts;
  onParticipantsChange: (participants: ParticipantCounts) => void;
  onContinue: () => void;
  primaryColor: string;
  currentDate: Date;
  appliedPromoCode: PromoCode | null;
  appliedGiftCard: GiftCard | null;
  onApplyPromoCode: (code: PromoCode) => void;
  onApplyGiftCard: (card: GiftCard) => void;
  onRemovePromoCode: () => void;
  onRemoveGiftCard: () => void;
  stripePrices?: StripePrices;
}

export interface BookingCheckoutProps {
  gameData: GameData;
  selectedDate: number;
  selectedTime: string;
  participants: ParticipantCounts;
  customerData: CustomerData;
  onCustomerDataChange: (data: Partial<CustomerData>) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  primaryColor: string;
  isSubmitting: boolean;
  currentDate: Date;
  totalAmount: number;
  stripePrices?: StripePrices;
}

export interface BookingSuccessProps {
  bookingNumber: string;
  gameData: GameData;
  selectedDate: number;
  selectedTime: string;
  participants: ParticipantCounts;
  customerData: CustomerData;
  primaryColor: string;
  currentDate: Date;
  onBookAnother: () => void;
}
