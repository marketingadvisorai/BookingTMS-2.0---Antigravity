/**
 * Widget Pricing Hook
 * 
 * React hook for real-time pricing in customer-facing widgets.
 * Automatically subscribes to price updates from admin panel.
 * 
 * @module useWidgetPricing
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  WidgetPricingService, 
  ActivityPricing, 
  BookingPriceCalculation 
} from './widgetPricingService';

interface UseWidgetPricingProps {
  activityId: string;
  enableRealTime?: boolean;
}

interface UseWidgetPricingReturn {
  pricing: ActivityPricing | null;
  loading: boolean;
  error: string | null;
  
  // Price calculation
  calculatePrice: (
    adultCount: number,
    childCount?: number,
    customTiers?: { tierId: string; quantity: number }[]
  ) => BookingPriceCalculation | null;
  
  // Get checkout price ID
  getCheckoutPriceId: (tierType?: 'adult' | 'child' | string) => string | null;
  
  // Refresh pricing
  refresh: () => Promise<void>;
}

export function useWidgetPricing({
  activityId,
  enableRealTime = true,
}: UseWidgetPricingProps): UseWidgetPricingReturn {
  const [pricing, setPricing] = useState<ActivityPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pricing
  const fetchPricing = useCallback(async () => {
    if (!activityId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await WidgetPricingService.getActivityPricing(activityId);
      
      if (result) {
        setPricing(result);
      } else {
        setError('Activity not found');
      }
    } catch (err: any) {
      console.error('[useWidgetPricing] Error:', err);
      setError(err.message || 'Failed to load pricing');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // Initial fetch
  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealTime || !activityId) return;

    console.log('[useWidgetPricing] Subscribing to real-time updates:', activityId);
    
    const unsubscribe = WidgetPricingService.subscribeToActivityPricing(
      activityId,
      (updatedPricing) => {
        console.log('[useWidgetPricing] Received pricing update:', updatedPricing);
        setPricing(updatedPricing);
      }
    );

    return () => {
      console.log('[useWidgetPricing] Unsubscribing from real-time updates');
      unsubscribe();
    };
  }, [activityId, enableRealTime]);

  // Calculate price
  const calculatePrice = useCallback(
    (
      adultCount: number,
      childCount: number = 0,
      customTiers: { tierId: string; quantity: number }[] = []
    ): BookingPriceCalculation | null => {
      if (!pricing) return null;
      return WidgetPricingService.calculateBookingPrice(
        pricing,
        adultCount,
        childCount,
        customTiers
      );
    },
    [pricing]
  );

  // Get checkout price ID
  const getCheckoutPriceId = useCallback(
    (tierType: 'adult' | 'child' | string = 'adult'): string | null => {
      if (!pricing) return null;
      return WidgetPricingService.getCheckoutPriceId(pricing, tierType);
    },
    [pricing]
  );

  return {
    pricing,
    loading,
    error,
    calculatePrice,
    getCheckoutPriceId,
    refresh: fetchPricing,
  };
}

export default useWidgetPricing;
