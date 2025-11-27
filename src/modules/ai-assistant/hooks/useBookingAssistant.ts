/**
 * Booking Assistant Hook
 * Manages conversational state for AI booking assistant
 */

import { useReducer, useCallback, useEffect } from 'react';
import { intentDetectionService, responseGeneratorService } from '../services';
import type {
  AssistantState,
  ChatMessage,
  BookingSlots,
  BookingStep,
  ActivityOption,
  TimeSlotOption,
  AssistantConfig,
} from '../types';

// Initial slots
const initialSlots: BookingSlots = {
  activityId: null,
  activityName: null,
  date: null,
  time: null,
  partySize: null,
  customerName: null,
  customerEmail: null,
  customerPhone: null,
};

// Initial state
const initialState: AssistantState = {
  messages: [],
  slots: initialSlots,
  currentStep: 'greeting',
  isProcessing: false,
  error: null,
};

// Action types
type AssistantAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_SLOTS'; payload: Partial<BookingSlots> }
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Reducer
function assistantReducer(state: AssistantState, action: AssistantAction): AssistantState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_SLOTS':
      return { ...state, slots: { ...state.slots, ...action.payload } };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return { ...initialState, messages: [] };
    default:
      return state;
  }
}

// Generate unique message ID
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface UseBookingAssistantOptions {
  config?: AssistantConfig;
  activities?: ActivityOption[];
  onBookingComplete?: (slots: BookingSlots) => void;
}

export function useBookingAssistant(options: UseBookingAssistantOptions = {}) {
  const { config, activities = [], onBookingComplete } = options;
  const [state, dispatch] = useReducer(assistantReducer, initialState);

  // Initialize with greeting
  useEffect(() => {
    if (state.messages.length === 0) {
      const welcomeMessage = config?.welcomeMessage || undefined;
      sendGreeting(welcomeMessage);
    }
  }, []);

  // Send greeting message
  const sendGreeting = useCallback((customMessage?: string) => {
    const { message, suggestions } = responseGeneratorService.generateResponse({
      slots: state.slots,
      currentStep: 'greeting',
      availableActivities: activities,
    });

    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: customMessage || message,
      timestamp: new Date(),
      suggestions,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
  }, [activities, state.slots]);

  // Process user message
  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_PROCESSING', payload: true });

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    try {
      // Detect intent
      const intentResult = intentDetectionService.detectIntent(content);
      userMessage.intent = intentResult.intent;

      // Update slots based on entities
      const slotUpdates: Partial<BookingSlots> = {};
      
      if (intentResult.entities.date) {
        slotUpdates.date = String(intentResult.entities.date);
      }
      if (intentResult.entities.time) {
        slotUpdates.time = String(intentResult.entities.time);
      }
      if (intentResult.entities.partySize) {
        slotUpdates.partySize = Number(intentResult.entities.partySize);
      }
      if (intentResult.entities.email) {
        slotUpdates.customerEmail = String(intentResult.entities.email);
      }
      if (intentResult.entities.phone) {
        slotUpdates.customerPhone = String(intentResult.entities.phone);
      }
      if (intentResult.entities.name) {
        slotUpdates.customerName = String(intentResult.entities.name);
      }

      // Handle specific intents
      let newStep = state.currentStep;
      
      if (intentResult.intent === 'cancel_request') {
        dispatch({ type: 'RESET' });
        newStep = 'greeting';
      } else if (intentResult.intent === 'help') {
        // Show help without changing step
      } else if (intentResult.intent === 'confirm_booking' && state.currentStep === 'confirm') {
        newStep = 'complete';
        if (onBookingComplete) {
          onBookingComplete({ ...state.slots, ...slotUpdates });
        }
      } else if (intentResult.intent === 'book_activity' && activities.length === 1) {
        // Auto-select single activity
        slotUpdates.activityId = activities[0].id;
        slotUpdates.activityName = activities[0].name;
      }

      // Update slots if we have updates
      if (Object.keys(slotUpdates).length > 0) {
        dispatch({ type: 'UPDATE_SLOTS', payload: slotUpdates });
      }

      // Calculate next step
      const updatedSlots = { ...state.slots, ...slotUpdates };
      if (newStep !== 'greeting') {
        newStep = responseGeneratorService.getNextStep(updatedSlots, newStep);
      }
      dispatch({ type: 'SET_STEP', payload: newStep });

      // Generate mock time slots for demo
      const mockTimeSlots: TimeSlotOption[] = [
        { time: '10:00', available: true, spotsRemaining: 5 },
        { time: '11:00', available: true, spotsRemaining: 3 },
        { time: '13:00', available: true, spotsRemaining: 8 },
        { time: '14:00', available: false, spotsRemaining: 0 },
        { time: '15:00', available: true, spotsRemaining: 2 },
        { time: '16:00', available: true, spotsRemaining: 6 },
      ];

      // Generate response
      const { message, suggestions } = responseGeneratorService.generateResponse({
        slots: updatedSlots,
        currentStep: newStep,
        availableActivities: activities,
        availableTimeSlots: mockTimeSlots,
      });

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
        suggestions,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Something went wrong. Please try again.' });
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.slots, state.currentStep, activities, onBookingComplete]);

  // Reset conversation
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setTimeout(() => sendGreeting(), 100);
  }, [sendGreeting]);

  return {
    messages: state.messages,
    slots: state.slots,
    currentStep: state.currentStep,
    isProcessing: state.isProcessing,
    error: state.error,
    sendMessage,
    reset,
  };
}
