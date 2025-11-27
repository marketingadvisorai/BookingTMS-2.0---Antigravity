/**
 * Embed Pro 2.0 - Group Booking Hook
 * @module embed-pro/hooks/useGroupBooking
 * 
 * Custom hook for managing group booking state.
 * Handles cart, scheduling, and checkout flow.
 */

import { useReducer, useCallback, useMemo } from 'react';
import { groupBookingService } from '../services/groupbooking.service';
import type {
  GroupBookingCart,
  GroupBookingCartItem,
  GroupBookingState,
  GroupBookingAction,
  GroupBookingCustomer,
} from '../types/groupbooking.types';

// =====================================================
// REDUCER
// =====================================================

function groupBookingReducer(
  state: GroupBookingState,
  action: GroupBookingAction
): GroupBookingState {
  switch (action.type) {
    case 'ADD_ACTIVITY':
      return {
        ...state,
        cart: groupBookingService.addToCart(state.cart, action.activity),
        error: null,
      };

    case 'REMOVE_ACTIVITY':
      return {
        ...state,
        cart: groupBookingService.removeFromCart(state.cart, action.index),
        editingIndex: null,
        error: null,
      };

    case 'UPDATE_DATE':
      return {
        ...state,
        cart: groupBookingService.updateCartItem(state.cart, action.index, {
          date: action.date,
          timeSlot: null, // Reset time when date changes
        }),
        error: null,
      };

    case 'UPDATE_TIME_SLOT':
      return {
        ...state,
        cart: groupBookingService.updateCartItem(state.cart, action.index, {
          timeSlot: action.timeSlot,
        }),
        error: null,
      };

    case 'UPDATE_PARTY_SIZE':
      return {
        ...state,
        cart: groupBookingService.updateCartItem(state.cart, action.index, {
          partySize: action.partySize,
        }),
        error: null,
      };

    case 'SET_EDITING':
      return { ...state, editingIndex: action.index };

    case 'APPLY_PROMO':
      return {
        ...state,
        cart: groupBookingService.applyPromoDiscount(state.cart, action.discount),
      };

    case 'APPLY_GIFT_CARD':
      return {
        ...state,
        cart: groupBookingService.applyGiftCard(state.cart, action.amount),
      };

    case 'NEXT_STEP': {
      const steps: GroupBookingState['step'][] = ['select', 'schedule', 'checkout', 'success'];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex < steps.length - 1) {
        return { ...state, step: steps[currentIndex + 1] };
      }
      return state;
    }

    case 'PREV_STEP': {
      const steps: GroupBookingState['step'][] = ['select', 'schedule', 'checkout', 'success'];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex > 0) {
        return { ...state, step: steps[currentIndex - 1] };
      }
      return state;
    }

    case 'SET_ERROR':
      return { ...state, error: action.error };

    case 'RESET':
      return createInitialState(state.cart.venue.id, state.cart.venue.name, state.cart.organizationId);

    default:
      return state;
  }
}

// =====================================================
// INITIAL STATE
// =====================================================

function createInitialState(
  venueId: string,
  venueName: string,
  organizationId: string
): GroupBookingState {
  return {
    step: 'select',
    cart: groupBookingService.createCart(venueId, venueName, organizationId),
    editingIndex: null,
    isLoading: false,
    error: null,
  };
}

// =====================================================
// HOOK
// =====================================================

interface UseGroupBookingOptions {
  venueId: string;
  venueName: string;
  organizationId: string;
}

export function useGroupBooking(options: UseGroupBookingOptions) {
  const { venueId, venueName, organizationId } = options;

  const [state, dispatch] = useReducer(
    groupBookingReducer,
    { venueId, venueName, organizationId },
    () => createInitialState(venueId, venueName, organizationId)
  );

  // Actions
  const addActivity = useCallback((activity: GroupBookingCartItem['activity']) => {
    dispatch({ type: 'ADD_ACTIVITY', activity });
  }, []);

  const removeActivity = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_ACTIVITY', index });
  }, []);

  const updateDate = useCallback((index: number, date: string) => {
    dispatch({ type: 'UPDATE_DATE', index, date });
  }, []);

  const updateTimeSlot = useCallback((index: number, timeSlot: GroupBookingCartItem['timeSlot']) => {
    dispatch({ type: 'UPDATE_TIME_SLOT', index, timeSlot });
  }, []);

  const updatePartySize = useCallback((index: number, partySize: number) => {
    dispatch({ type: 'UPDATE_PARTY_SIZE', index, partySize });
  }, []);

  const setEditingIndex = useCallback((index: number | null) => {
    dispatch({ type: 'SET_EDITING', index });
  }, []);

  const applyPromo = useCallback((discount: number) => {
    dispatch({ type: 'APPLY_PROMO', discount });
  }, []);

  const applyGiftCard = useCallback((amount: number) => {
    dispatch({ type: 'APPLY_GIFT_CARD', amount });
  }, []);

  const nextStep = useCallback(() => {
    // Validate before moving to next step
    if (state.step === 'select' && state.cart.items.length === 0) {
      dispatch({ type: 'SET_ERROR', error: 'Please add at least one activity' });
      return;
    }

    if (state.step === 'schedule') {
      const validation = groupBookingService.validateCart(state.cart);
      if (!validation.valid) {
        dispatch({ type: 'SET_ERROR', error: validation.errors[0] });
        return;
      }
    }

    dispatch({ type: 'NEXT_STEP' });
  }, [state.step, state.cart]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const checkout = useCallback(async (customer: GroupBookingCustomer) => {
    const result = await groupBookingService.createGroupBooking(state.cart, customer);
    if (result.success) {
      dispatch({ type: 'NEXT_STEP' });
    } else {
      dispatch({ type: 'SET_ERROR', error: result.error || 'Checkout failed' });
    }
    return result;
  }, [state.cart]);

  // Computed values
  const itemCount = state.cart.items.length;
  const totalDuration = useMemo(() => 
    groupBookingService.getTotalDuration(state.cart),
    [state.cart]
  );
  const isValid = useMemo(() => 
    groupBookingService.validateCart(state.cart).valid,
    [state.cart]
  );

  return {
    // State
    step: state.step,
    cart: state.cart,
    editingIndex: state.editingIndex,
    isLoading: state.isLoading,
    error: state.error,

    // Computed
    itemCount,
    totalDuration,
    isValid,

    // Actions
    addActivity,
    removeActivity,
    updateDate,
    updateTimeSlot,
    updatePartySize,
    setEditingIndex,
    applyPromo,
    applyGiftCard,
    nextStep,
    prevStep,
    reset,
    checkout,

    // Helpers
    formatAmount: groupBookingService.formatAmount,
    formatDuration: groupBookingService.formatDuration,
  };
}

export default useGroupBooking;
