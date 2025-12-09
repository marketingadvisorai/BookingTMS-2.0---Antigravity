/**
 * Calendar Widget Pro - Booking Hook
 * @module embed-pro/widgets/calendar-widget/hooks/useCalendarBooking
 * 
 * Manages checkout flow for calendar widget bookings.
 * Handles Stripe checkout session creation and preview mode.
 */

import { useState, useCallback } from 'react';
import { checkoutProService } from '../../../services';
import type { WidgetActivity, CustomerInfo } from '../../../types/widget.types';

// =====================================================
// TYPES
// =====================================================

interface UseCalendarBookingParams {
  activity: WidgetActivity | null;
  embedKey?: string;
  isPreview?: boolean;
}

interface UseCalendarBookingReturn {
  isLoading: boolean;
  error: string | null;
  showPreviewCheckout: boolean;
  previewCustomerName: string;
  handleCheckout: (params: CheckoutParams) => Promise<void>;
  closePreviewCheckout: () => void;
  clearError: () => void;
}

interface CheckoutParams {
  selectedDate: Date;
  selectedTime: string;
  partySize: number;
  childCount: number;
  customerInfo: CustomerInfo;
  sessionId?: string;
  onSuccess?: (bookingId: string) => void;
}

// =====================================================
// HOOK
// =====================================================

export function useCalendarBooking({
  activity,
  embedKey,
  isPreview = false,
}: UseCalendarBookingParams): UseCalendarBookingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewCheckout, setShowPreviewCheckout] = useState(false);
  const [previewCustomerName, setPreviewCustomerName] = useState('');

  /**
   * Handle checkout submission
   */
  const handleCheckout = useCallback(async ({
    selectedDate,
    selectedTime,
    partySize,
    childCount,
    customerInfo,
    sessionId,
    onSuccess,
  }: CheckoutParams) => {
    if (!activity) {
      setError('No activity selected');
      return;
    }

    // Preview mode - show simulated checkout
    if (isPreview) {
      setPreviewCustomerName(`${customerInfo.firstName} ${customerInfo.lastName}`);
      setShowPreviewCheckout(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[CalendarBooking] Creating checkout session:', {
        activityId: activity.id,
        date: selectedDate.toISOString(),
        time: selectedTime,
        partySize,
        childCount,
      });

      // Track booking event
      if (embedKey) {
        await checkoutProService.trackBookingStarted(embedKey);
      }

      // Create Stripe checkout session
      const { url } = await checkoutProService.createCheckoutSession({
        activity,
        date: selectedDate,
        time: selectedTime,
        partySize,
        childCount,
        customerInfo,
        organizationId: activity.organizationId,
        embedKey,
        sessionId,
      });

      // Redirect to Stripe
      checkoutProService.redirectToCheckout(url);
    } catch (err) {
      console.error('[CalendarBooking] Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout');
      setIsLoading(false);
    }
  }, [activity, embedKey, isPreview]);

  const closePreviewCheckout = useCallback(() => {
    setShowPreviewCheckout(false);
    setPreviewCustomerName('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    showPreviewCheckout,
    previewCustomerName,
    handleCheckout,
    closePreviewCheckout,
    clearError,
  };
}

export default useCalendarBooking;
