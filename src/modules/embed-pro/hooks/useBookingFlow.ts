/**
 * Embed Pro 2.0 - Booking Flow Hook
 * @module embed-pro/hooks/useBookingFlow
 * 
 * State machine for managing the booking flow steps.
 * Handles activity selection, date/time selection, and checkout.
 * Includes session ID tracking for availability validation.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  BookingState,
  BookingStep,
  WidgetActivity,
  CustomerInfo,
  INITIAL_BOOKING_STATE,
} from '../types/widget.types';
import { availabilityService } from '../services';

// =====================================================
// HOOK INTERFACE
// =====================================================

interface UseBookingFlowOptions {
  /** Initial activity (for single-activity embeds) */
  initialActivity?: WidgetActivity | null;
  /** Whether multiple activities are available */
  hasMultipleActivities?: boolean;
}

interface UseBookingFlowReturn {
  /** Current booking state */
  state: BookingState & { sessionId?: string };
  /** Current step name */
  currentStep: BookingStep;
  /** Whether user can go back */
  canGoBack: boolean;
  /** Whether user can proceed */
  canProceed: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether availability is being validated */
  isValidating: boolean;
  
  // Actions
  selectActivity: (activity: WidgetActivity) => void;
  selectDate: (date: Date) => void;
  selectTime: (time: string, sessionId?: string) => void;
  setPartySize: (size: number) => void;
  setChildCount: (count: number) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  goToStep: (step: BookingStep) => void;
  goBack: () => void;
  goNext: () => void;
  setBookingId: (id: string, bookingNumber?: string) => void;
  setError: (error: string | null) => void;
  validateAvailability: () => Promise<boolean>;
  reset: () => void;
}

// =====================================================
// STEP ORDER
// =====================================================

const STEP_ORDER: BookingStep[] = [
  'select-activity',
  'select-date',
  'select-time',
  'select-party',
  'checkout',
  'success',
];

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useBookingFlow(options: UseBookingFlowOptions = {}): UseBookingFlowReturn {
  const { initialActivity = null, hasMultipleActivities = false } = options;

  // Determine initial step based on whether we have an activity
  const getInitialStep = (): BookingStep => {
    if (hasMultipleActivities) return 'select-activity';
    return 'select-date';
  };

  const [state, setState] = useState<BookingState & { sessionId?: string; bookingNumber?: string }>({
    step: getInitialStep(),
    selectedActivity: initialActivity,
    selectedDate: null,
    selectedTime: null,
    partySize: 2,
    childCount: 0,
    customerInfo: null,
    bookingId: null,
    bookingNumber: undefined,
    sessionId: undefined,
    error: null,
  });

  const [isValidating, setIsValidating] = useState(false);

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  const currentStepIndex = useMemo(
    () => STEP_ORDER.indexOf(state.step),
    [state.step]
  );

  const canGoBack = useMemo(() => {
    if (state.step === 'success') return false;
    const minStep = hasMultipleActivities ? 0 : 1;
    return currentStepIndex > minStep;
  }, [currentStepIndex, hasMultipleActivities, state.step]);

  const canProceed = useMemo(() => {
    switch (state.step) {
      case 'select-activity':
        return !!state.selectedActivity;
      case 'select-date':
        return !!state.selectedDate;
      case 'select-time':
        return !!state.selectedTime;
      case 'select-party':
        return state.partySize >= 1;
      case 'checkout':
        return !!state.customerInfo;
      default:
        return false;
    }
  }, [state]);

  const progress = useMemo(() => {
    const totalSteps = hasMultipleActivities ? 5 : 4;
    const currentIndex = hasMultipleActivities ? currentStepIndex : currentStepIndex - 1;
    return Math.round((currentIndex / totalSteps) * 100);
  }, [currentStepIndex, hasMultipleActivities]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const selectActivity = useCallback((activity: WidgetActivity) => {
    setState((prev) => ({
      ...prev,
      selectedActivity: activity,
      step: 'select-date',
      error: null,
    }));
  }, []);

  const selectDate = useCallback((date: Date) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedTime: null, // Reset time when date changes
      error: null,
    }));
  }, []);

  const selectTime = useCallback((time: string, sessionId?: string) => {
    setState((prev) => ({
      ...prev,
      selectedTime: time,
      sessionId,
      error: null,
    }));
  }, []);

  const setPartySize = useCallback((size: number) => {
    setState((prev) => ({
      ...prev,
      partySize: Math.max(1, size),
      error: null,
    }));
  }, []);

  const setChildCount = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      childCount: Math.max(0, count),
      error: null,
    }));
  }, []);

  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    setState((prev) => ({
      ...prev,
      customerInfo: info,
      error: null,
    }));
  }, []);

  const goToStep = useCallback((step: BookingStep) => {
    setState((prev) => ({
      ...prev,
      step,
      error: null,
    }));
  }, []);

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    const prevIndex = Math.max(0, currentStepIndex - 1);
    setState((prev) => ({
      ...prev,
      step: STEP_ORDER[prevIndex],
      error: null,
    }));
  }, [canGoBack, currentStepIndex]);

  const goNext = useCallback(() => {
    if (!canProceed) return;
    const nextIndex = Math.min(STEP_ORDER.length - 1, currentStepIndex + 1);
    setState((prev) => ({
      ...prev,
      step: STEP_ORDER[nextIndex],
      error: null,
    }));
  }, [canProceed, currentStepIndex]);

  const setBookingId = useCallback((id: string, bookingNumber?: string) => {
    setState((prev) => ({
      ...prev,
      bookingId: id,
      bookingNumber,
      step: 'success',
      error: null,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      error,
    }));
  }, []);

  /**
   * Validate session availability before checkout
   * Returns true if available, false otherwise (sets error message)
   */
  const validateAvailability = useCallback(async (): Promise<boolean> => {
    const { sessionId, partySize, childCount } = state;
    
    // No sessionId means we're using schedule-based slots (no DB validation needed)
    if (!sessionId) return true;

    setIsValidating(true);
    try {
      const result = await availabilityService.checkSessionAvailability(
        sessionId,
        partySize + (childCount || 0)
      );

      if (!result.available) {
        setState((prev) => ({
          ...prev,
          error: result.message || 'This time slot is no longer available. Please select another time.',
        }));
        setIsValidating(false);
        return false;
      }

      setIsValidating(false);
      return true;
    } catch (error) {
      console.error('[useBookingFlow] Availability check failed:', error);
      // On error, allow proceeding (fail-open for better UX)
      setIsValidating(false);
      return true;
    }
  }, [state.sessionId, state.partySize, state.childCount]);

  const reset = useCallback(() => {
    setState({
      step: getInitialStep(),
      selectedActivity: initialActivity,
      selectedDate: null,
      selectedTime: null,
      partySize: 2,
      childCount: 0,
      customerInfo: null,
      bookingId: null,
      bookingNumber: undefined,
      sessionId: undefined,
      error: null,
    });
  }, [initialActivity, hasMultipleActivities]);

  return {
    state,
    currentStep: state.step,
    canGoBack,
    canProceed,
    progress,
    isValidating,
    selectActivity,
    selectDate,
    selectTime,
    setPartySize,
    setChildCount,
    setCustomerInfo,
    goToStep,
    goBack,
    goNext,
    setBookingId,
    setError,
    validateAvailability,
    reset,
  };
}

export default useBookingFlow;
