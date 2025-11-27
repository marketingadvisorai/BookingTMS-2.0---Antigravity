/**
 * AI Booking Assistant Module
 * Conversational AI for natural language booking
 * 
 * @module ai-assistant
 * @version 0.1.45
 */

// Main component
export { BookingAssistant } from './components/BookingAssistant';
export { ChatMessage } from './components/ChatMessage';

// Hook
export { useBookingAssistant } from './hooks/useBookingAssistant';

// Services
export { intentDetectionService } from './services/intentDetection.service';
export { responseGeneratorService } from './services/responseGenerator.service';

// Types
export type {
  BookingIntent,
  BookingSlots,
  ChatMessage as ChatMessageType,
  QuickReply,
  AssistantState,
  BookingStep,
  ActivityOption,
  TimeSlotOption,
  AssistantConfig,
} from './types';
