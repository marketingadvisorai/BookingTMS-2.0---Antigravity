/**
 * Booking Component Types
 * 
 * Type definitions for the simplified escape room booking widget.
 * These types are used across all booking components to ensure type safety.
 * 
 * For AI Agents:
 * - All types are clearly named and documented
 * - Interfaces are preferred over types for extensibility
 * - Enums are used for fixed sets of values
 * 
 * @module components/booking/types
 */

// =============================================================================
// STEP TYPES - Defines the booking flow steps
// =============================================================================

/**
 * Booking flow steps
 * The user progresses through these steps in order
 */
export type BookingStep = 
  | 'game-selection'      // Step 1: Choose escape room game
  | 'datetime-selection'  // Step 2: Pick date and time
  | 'party-details'       // Step 3: Enter customer info and party size
  | 'payment'             // Step 4: Complete payment
  | 'confirmation';       // Step 5: Show booking confirmation

// =============================================================================
// GAME TYPES - Escape room game data
// =============================================================================

/**
 * Escape Room Game
 * Represents a single escape room game/experience
 */
export interface Game {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  duration_minutes: number;
  min_players: number;
  max_players: number;
  price: number;
  image_url: string | null;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Minimal game info for display in cards
 */
export interface GameCard {
  id: string;
  name: string;
  difficulty: Game['difficulty'];
  duration_minutes: number;
  min_players: number;
  max_players: number;
  price: number;
  image_url: string | null;
}

// =============================================================================
// TIME SLOT TYPES - Availability data
// =============================================================================

/**
 * Time Slot with Availability
 * Represents a bookable time slot for a specific date
 */
export interface TimeSlot {
  time: string;              // Format: "14:00" (24-hour)
  endTime: string;           // Format: "16:00" (24-hour)
  availableSpots: number;    // How many spots left
  totalCapacity: number;     // Total max capacity
  isAvailable: boolean;      // Can book this slot?
  price: number;             // Price for this slot
}

/**
 * Date with availability status
 */
export interface AvailableDate {
  date: Date;
  hasAvailability: boolean;
  slotsCount: number;
}

// =============================================================================
// CUSTOMER TYPES - User information
// =============================================================================

/**
 * Customer Contact Information
 * Required details to create a booking
 */
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  specialRequests?: string;  // Optional notes/requests
}

/**
 * Form validation errors for customer info
 */
export interface CustomerInfoErrors {
  name?: string;
  email?: string;
  phone?: string;
}

// =============================================================================
// BOOKING STATE TYPES - Component state management
// =============================================================================

/**
 * Complete Booking State
 * All data needed to create a booking
 */
export interface BookingState {
  // Step 1: Game Selection
  selectedGame: Game | null;
  
  // Step 2: Date & Time Selection
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  
  // Step 3: Party Details
  partySize: number;
  customerInfo: CustomerInfo;
  
  // Step 4: Payment
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  promoCode?: string;
  
  // Flow control
  currentStep: BookingStep;
  isProcessing: boolean;
  error: string | null;
}

/**
 * Booking flow actions
 * Actions that can modify the booking state
 */
export type BookingAction =
  | { type: 'SELECT_GAME'; payload: Game }
  | { type: 'SELECT_DATE'; payload: Date }
  | { type: 'SELECT_TIME_SLOT'; payload: TimeSlot }
  | { type: 'SET_PARTY_SIZE'; payload: number }
  | { type: 'UPDATE_CUSTOMER_INFO'; payload: Partial<CustomerInfo> }
  | { type: 'SET_PROMO_CODE'; payload: string }
  | { type: 'GO_TO_STEP'; payload: BookingStep }
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// =============================================================================
// API RESPONSE TYPES - Supabase responses
// =============================================================================

/**
 * Supabase RPC response for get_available_slots
 */
export interface AvailableSlotResponse {
  time_slot: string;
  end_time: string;
  available_spots: number;
  total_capacity: number;
  is_available: boolean;
  price: number;
}

/**
 * Created booking response from Supabase
 */
export interface CreatedBooking {
  id: string;
  confirmation_code: string;
  booking_date: string;
  booking_time: string;
  game_id: string;
  customer_id: string;
  players: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

/**
 * Main booking widget props
 */
export interface EscapeRoomBookingWidgetProps {
  organizationId: string;
  venueId?: string;
  onBookingComplete?: (bookingId: string) => void;
  onBookingError?: (error: Error) => void;
  primaryColor?: string;
  className?: string;
}

/**
 * Step component base props
 * All step components extend this interface
 */
export interface StepComponentProps {
  bookingState: BookingState;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (action: BookingAction) => void;
}

/**
 * Game selection step props
 */
export interface GameSelectionStepProps extends Omit<StepComponentProps, 'onBack'> {
  organizationId: string;
}

/**
 * Date/time selection step props
 */
export interface DateTimeSelectionStepProps extends StepComponentProps {
  gameId: string;
  organizationId: string;
}

/**
 * Party details step props
 */
export interface PartyDetailsStepProps extends StepComponentProps {
  minPlayers: number;
  maxPlayers: number;
  basePrice: number;
}

/**
 * Payment step props
 */
export interface PaymentStepProps extends StepComponentProps {
  onPaymentSuccess: (bookingId: string) => void;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Loading state wrapper
 */
export interface LoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Pagination params for list queries
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Sort params for list queries
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// =============================================================================
// TYPE GUARDS - Runtime type checking
// =============================================================================

/**
 * Check if a step is valid
 */
export function isValidStep(step: string): step is BookingStep {
  return [
    'game-selection',
    'datetime-selection',
    'party-details',
    'payment',
    'confirmation',
  ].includes(step);
}

/**
 * Check if booking state is ready for payment
 */
export function isReadyForPayment(state: BookingState): boolean {
  return !!(
    state.selectedGame &&
    state.selectedDate &&
    state.selectedTimeSlot &&
    state.partySize >= (state.selectedGame.min_players || 1) &&
    state.partySize <= (state.selectedGame.max_players || 10) &&
    state.customerInfo.name &&
    state.customerInfo.email &&
    state.customerInfo.phone
  );
}

/**
 * Check if customer info is complete
 */
export function isCustomerInfoComplete(info: CustomerInfo): boolean {
  return !!(
    info.name.trim() &&
    info.email.trim() &&
    info.phone.trim()
  );
}
