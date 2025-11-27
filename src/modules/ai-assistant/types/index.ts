/**
 * AI Booking Assistant Types
 * Types for conversational booking assistant
 */

// Intent types detected from user messages
export type BookingIntent = 
  | 'greeting'
  | 'book_activity'
  | 'check_availability'
  | 'get_pricing'
  | 'select_date'
  | 'select_time'
  | 'select_party_size'
  | 'provide_contact'
  | 'confirm_booking'
  | 'cancel_request'
  | 'help'
  | 'unknown';

// Slot types for booking form
export interface BookingSlots {
  activityId: string | null;
  activityName: string | null;
  date: string | null;
  time: string | null;
  partySize: number | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
}

// Message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  intent?: BookingIntent;
  slots?: Partial<BookingSlots>;
  suggestions?: QuickReply[];
  isTyping?: boolean;
}

// Quick reply suggestions
export interface QuickReply {
  id: string;
  label: string;
  value: string;
  intent?: BookingIntent;
}

// Assistant state
export interface AssistantState {
  messages: ChatMessage[];
  slots: BookingSlots;
  currentStep: BookingStep;
  isProcessing: boolean;
  error: string | null;
}

// Booking steps
export type BookingStep = 
  | 'greeting'
  | 'select_activity'
  | 'select_date'
  | 'select_time'
  | 'select_party_size'
  | 'collect_contact'
  | 'confirm'
  | 'complete';

// Activity option for selection
export interface ActivityOption {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string | null;
}

// Time slot option
export interface TimeSlotOption {
  time: string;
  available: boolean;
  spotsRemaining: number;
}

// Assistant configuration
export interface AssistantConfig {
  venueId?: string;
  activityId?: string;
  primaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  showQuickReplies?: boolean;
}

// Intent detection result
export interface IntentResult {
  intent: BookingIntent;
  confidence: number;
  entities: Record<string, string | number>;
}

// Response generation context
export interface ResponseContext {
  slots: BookingSlots;
  currentStep: BookingStep;
  availableActivities?: ActivityOption[];
  availableDates?: string[];
  availableTimeSlots?: TimeSlotOption[];
}
