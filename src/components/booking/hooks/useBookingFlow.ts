/**
 * useBookingFlow Hook
 * 
 * Manages the state and flow of the booking process.
 * This is the central state management for the entire booking widget.
 * 
 * For AI Agents:
 * - Uses useReducer for predictable state management
 * - All state transitions are explicit via actions
 * - Includes validation before step transitions
 * - Provides helper methods for common operations
 * 
 * Usage:
 * ```typescript
 * const booking = useBookingFlow();
 * booking.selectGame(game);
 * booking.nextStep();
 * ```
 * 
 * @module components/booking/hooks
 */

import { useReducer, useCallback } from 'react';
import type {
  BookingState,
  BookingAction,
  BookingStep,
  Game,
  TimeSlot,
  CustomerInfo,
} from '../types';

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialCustomerInfo: CustomerInfo = {
  name: '',
  email: '',
  phone: '',
  specialRequests: '',
};

const initialState: BookingState = {
  // Step 1
  selectedGame: null,
  
  // Step 2
  selectedDate: null,
  selectedTimeSlot: null,
  
  // Step 3
  partySize: 2,  // Default to 2 players
  customerInfo: initialCustomerInfo,
  
  // Step 4
  totalAmount: 0,
  discountAmount: 0,
  finalAmount: 0,
  promoCode: undefined,
  
  // Flow
  currentStep: 'game-selection',
  isProcessing: false,
  error: null,
};

// =============================================================================
// REDUCER FUNCTION
// =============================================================================

/**
 * Booking state reducer
 * Handles all state transitions for the booking flow
 */
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    // ----- Game Selection -----
    case 'SELECT_GAME':
      return {
        ...state,
        selectedGame: action.payload,
        partySize: action.payload.min_players, // Set to min players by default
        error: null,
      };
    
    // ----- Date & Time Selection -----
    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.payload,
        selectedTimeSlot: null, // Reset time slot when date changes
        error: null,
      };
    
    case 'SELECT_TIME_SLOT':
      return {
        ...state,
        selectedTimeSlot: action.payload,
        error: null,
      };
    
    // ----- Party Details -----
    case 'SET_PARTY_SIZE': {
      const newPartySize = action.payload;
      const game = state.selectedGame;
      
      // Validate party size against game limits
      if (game) {
        if (newPartySize < game.min_players || newPartySize > game.max_players) {
          return {
            ...state,
            error: `Party size must be between ${game.min_players} and ${game.max_players}`,
          };
        }
      }
      
      // Calculate new amounts
      const basePrice = game?.price || 0;
      const totalAmount = basePrice * newPartySize;
      const finalAmount = totalAmount - state.discountAmount;
      
      return {
        ...state,
        partySize: newPartySize,
        totalAmount,
        finalAmount,
        error: null,
      };
    }
    
    case 'UPDATE_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: {
          ...state.customerInfo,
          ...action.payload,
        },
        error: null,
      };
    
    // ----- Payment -----
    case 'SET_PROMO_CODE': {
      // TODO: Validate promo code and calculate discount
      // For now, just store it
      return {
        ...state,
        promoCode: action.payload,
      };
    }
    
    // ----- Navigation -----
    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: action.payload,
        error: null,
      };
    
    case 'GO_NEXT': {
      const nextStep = getNextStep(state.currentStep);
      return {
        ...state,
        currentStep: nextStep,
        error: null,
      };
    }
    
    case 'GO_BACK': {
      const prevStep = getPreviousStep(state.currentStep);
      return {
        ...state,
        currentStep: prevStep,
        error: null,
      };
    }
    
    // ----- Processing & Errors -----
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isProcessing: false,
      };
    
    // ----- Reset -----
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the next step in the booking flow
 */
function getNextStep(currentStep: BookingStep): BookingStep {
  const steps: BookingStep[] = [
    'game-selection',
    'datetime-selection',
    'party-details',
    'payment',
    'confirmation',
  ];
  
  const currentIndex = steps.indexOf(currentStep);
  const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
  return steps[nextIndex];
}

/**
 * Get the previous step in the booking flow
 */
function getPreviousStep(currentStep: BookingStep): BookingStep {
  const steps: BookingStep[] = [
    'game-selection',
    'datetime-selection',
    'party-details',
    'payment',
    'confirmation',
  ];
  
  const currentIndex = steps.indexOf(currentStep);
  const prevIndex = Math.max(currentIndex - 1, 0);
  return steps[prevIndex];
}

/**
 * Calculate step number (1-indexed for UI display)
 */
function getStepNumber(step: BookingStep): number {
  const steps: BookingStep[] = [
    'game-selection',
    'datetime-selection',
    'party-details',
    'payment',
    'confirmation',
  ];
  return steps.indexOf(step) + 1;
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate if can proceed from game selection
 */
function canProceedFromGameSelection(state: BookingState): boolean {
  return !!state.selectedGame;
}

/**
 * Validate if can proceed from datetime selection
 */
function canProceedFromDateTimeSelection(state: BookingState): boolean {
  return !!(state.selectedDate && state.selectedTimeSlot);
}

/**
 * Validate if can proceed from party details
 */
function canProceedFromPartyDetails(state: BookingState): boolean {
  const { partySize, customerInfo, selectedGame } = state;
  
  // Check party size is within limits
  if (selectedGame) {
    if (partySize < selectedGame.min_players || partySize > selectedGame.max_players) {
      return false;
    }
  }
  
  // Check customer info is complete
  const infoComplete = !!(
    customerInfo.name.trim() &&
    customerInfo.email.trim() &&
    customerInfo.phone.trim()
  );
  
  return infoComplete;
}

/**
 * Validate if can proceed to payment
 */
function canProceedToPayment(state: BookingState): boolean {
  return (
    canProceedFromGameSelection(state) &&
    canProceedFromDateTimeSelection(state) &&
    canProceedFromPartyDetails(state)
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useBookingFlow Hook
 * 
 * Main hook for managing booking state and flow
 * 
 * @returns {Object} Booking state and control methods
 */
export function useBookingFlow() {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  
  // ----- Game Selection Methods -----
  
  const selectGame = useCallback((game: Game) => {
    dispatch({ type: 'SELECT_GAME', payload: game });
  }, []);
  
  // ----- Date & Time Selection Methods -----
  
  const selectDate = useCallback((date: Date) => {
    dispatch({ type: 'SELECT_DATE', payload: date });
  }, []);
  
  const selectTimeSlot = useCallback((timeSlot: TimeSlot) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: timeSlot });
  }, []);
  
  // ----- Party Details Methods -----
  
  const setPartySize = useCallback((size: number) => {
    dispatch({ type: 'SET_PARTY_SIZE', payload: size });
  }, []);
  
  const updateCustomerInfo = useCallback((info: Partial<CustomerInfo>) => {
    dispatch({ type: 'UPDATE_CUSTOMER_INFO', payload: info });
  }, []);
  
  // ----- Payment Methods -----
  
  const setPromoCode = useCallback((code: string) => {
    dispatch({ type: 'SET_PROMO_CODE', payload: code });
  }, []);
  
  // ----- Navigation Methods -----
  
  const nextStep = useCallback(() => {
    // Validate before proceeding
    if (state.currentStep === 'game-selection' && !canProceedFromGameSelection(state)) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select a game' });
      return;
    }
    
    if (state.currentStep === 'datetime-selection' && !canProceedFromDateTimeSelection(state)) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select date and time' });
      return;
    }
    
    if (state.currentStep === 'party-details' && !canProceedFromPartyDetails(state)) {
      dispatch({ type: 'SET_ERROR', payload: 'Please complete all required fields' });
      return;
    }
    
    dispatch({ type: 'GO_NEXT' });
  }, [state]);
  
  const backStep = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);
  
  const goToStep = useCallback((step: BookingStep) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);
  
  // ----- Processing Methods -----
  
  const setProcessing = useCallback((isProcessing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
  }, []);
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);
  
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  // ----- Computed Values -----
  
  const stepNumber = getStepNumber(state.currentStep);
  const totalSteps = 4; // Exclude confirmation step from count
  const progress = (stepNumber / totalSteps) * 100;
  
  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 'game-selection':
        return canProceedFromGameSelection(state);
      case 'datetime-selection':
        return canProceedFromDateTimeSelection(state);
      case 'party-details':
        return canProceedFromPartyDetails(state);
      case 'payment':
        return canProceedToPayment(state);
      default:
        return false;
    }
  }, [state]);
  
  // ----- Return Hook API -----
  
  return {
    // State
    state,
    
    // Game Selection
    selectGame,
    
    // Date & Time Selection
    selectDate,
    selectTimeSlot,
    
    // Party Details
    setPartySize,
    updateCustomerInfo,
    
    // Payment
    setPromoCode,
    
    // Navigation
    nextStep,
    backStep,
    goToStep,
    
    // Processing
    setProcessing,
    setError,
    reset,
    
    // Computed
    stepNumber,
    totalSteps,
    progress,
    canProceed: canProceed(),
    
    // Validation helpers (exposed for external use)
    canProceedToPayment: () => canProceedToPayment(state),
  };
}

// Export type for the hook return value
export type UseBookingFlowReturn = ReturnType<typeof useBookingFlow>;
