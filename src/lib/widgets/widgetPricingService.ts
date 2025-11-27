/**
 * Widget Pricing Service
 * 
 * Handles real-time pricing display for customer-facing booking widgets.
 * Reads multi-tier pricing from database and provides calculated totals.
 * 
 * CRITICAL: This service is used by embed widgets on customer websites.
 * Any changes must maintain backward compatibility.
 * 
 * @module widgetPricingService
 * @version 1.0.0
 * @date 2025-11-27
 */

import { supabase } from '../supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface PriceTier {
  price_id: string;
  lookup_key: string;
  amount: number;
  currency: string;
}

export interface CustomPriceTier extends PriceTier {
  id: string;
  name: string;
  min: number;
  max: number;
}

export interface StripePrices {
  adult?: PriceTier | null;
  child?: PriceTier | null;
  custom?: CustomPriceTier[];
}

export interface ActivityPricing {
  activityId: string;
  activityName: string;
  adultPrice: number;
  childPrice: number;
  stripePrices: StripePrices | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  hasMultiTierPricing: boolean;
  customTiers: CustomPriceTier[];
}

export interface BookingPriceCalculation {
  adultCount: number;
  childCount: number;
  customTiers: { tierId: string; quantity: number }[];
  subtotal: number;
  breakdown: {
    adults: { quantity: number; unitPrice: number; total: number };
    children: { quantity: number; unitPrice: number; total: number };
    custom: { name: string; quantity: number; unitPrice: number; total: number }[];
  };
  currency: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class WidgetPricingService {
  /**
   * Get pricing for an activity
   * Used by embed widgets to display prices
   */
  static async getActivityPricing(activityId: string): Promise<ActivityPricing | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('activities')
        .select(`
          id,
          name,
          price,
          child_price,
          stripe_prices,
          stripe_price_id,
          stripe_product_id,
          custom_capacity_fields
        `)
        .eq('id', activityId)
        .single();

      if (error || !data) {
        console.error('[WidgetPricingService] Error fetching activity:', error);
        return null;
      }

      const stripePrices = data.stripe_prices as StripePrices | null;
      const customCapacityFields = data.custom_capacity_fields || [];

      // Build custom tiers from stripe_prices or custom_capacity_fields
      const customTiers: CustomPriceTier[] = stripePrices?.custom || 
        customCapacityFields.filter((f: any) => f.price > 0).map((f: any) => ({
          id: f.id,
          name: f.name,
          price_id: f.stripe_price_id || '',
          lookup_key: '',
          amount: f.price,
          min: f.min || 0,
          max: f.max || 10,
          currency: 'usd',
        }));

      return {
        activityId: data.id,
        activityName: data.name,
        adultPrice: stripePrices?.adult?.amount || data.price || 0,
        childPrice: stripePrices?.child?.amount || data.child_price || 0,
        stripePrices,
        stripePriceId: stripePrices?.adult?.price_id || data.stripe_price_id,
        stripeProductId: data.stripe_product_id,
        hasMultiTierPricing: !!(stripePrices?.adult || stripePrices?.child || stripePrices?.custom?.length),
        customTiers,
      };
    } catch (error) {
      console.error('[WidgetPricingService] Error:', error);
      return null;
    }
  }

  /**
   * Calculate total price for a booking
   * Handles multi-tier pricing with adults, children, and custom tiers
   */
  static calculateBookingPrice(
    pricing: ActivityPricing,
    adultCount: number,
    childCount: number = 0,
    customTierSelections: { tierId: string; quantity: number }[] = []
  ): BookingPriceCalculation {
    const adultTotal = pricing.adultPrice * adultCount;
    const childTotal = pricing.childPrice * childCount;

    // Calculate custom tier totals
    const customBreakdown = customTierSelections.map((selection) => {
      const tier = pricing.customTiers.find((t) => t.id === selection.tierId);
      const unitPrice = tier?.amount || 0;
      return {
        name: tier?.name || 'Custom',
        quantity: selection.quantity,
        unitPrice,
        total: unitPrice * selection.quantity,
      };
    });

    const customTotal = customBreakdown.reduce((sum, item) => sum + item.total, 0);

    return {
      adultCount,
      childCount,
      customTiers: customTierSelections,
      subtotal: adultTotal + childTotal + customTotal,
      breakdown: {
        adults: {
          quantity: adultCount,
          unitPrice: pricing.adultPrice,
          total: adultTotal,
        },
        children: {
          quantity: childCount,
          unitPrice: pricing.childPrice,
          total: childTotal,
        },
        custom: customBreakdown,
      },
      currency: pricing.stripePrices?.adult?.currency || 'usd',
    };
  }

  /**
   * Get the correct Stripe Price ID for checkout
   * Returns the adult price ID by default, or a specific tier if requested
   */
  static getCheckoutPriceId(
    pricing: ActivityPricing,
    tierType: 'adult' | 'child' | string = 'adult'
  ): string | null {
    if (tierType === 'adult') {
      return pricing.stripePrices?.adult?.price_id || pricing.stripePriceId;
    }
    if (tierType === 'child') {
      return pricing.stripePrices?.child?.price_id || null;
    }
    // Custom tier
    const customTier = pricing.customTiers.find((t) => t.id === tierType);
    return customTier?.price_id || null;
  }

  /**
   * Subscribe to real-time pricing updates
   * Widget can call this to get notified when admin changes prices
   */
  static subscribeToActivityPricing(
    activityId: string,
    callback: (pricing: ActivityPricing) => void
  ): () => void {
    const channel = supabase
      .channel(`activity-pricing-${activityId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activities',
          filter: `id=eq.${activityId}`,
        },
        async () => {
          // Fetch updated pricing
          const pricing = await this.getActivityPricing(activityId);
          if (pricing) {
            callback(pricing);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export default WidgetPricingService;
