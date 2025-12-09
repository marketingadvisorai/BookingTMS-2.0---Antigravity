/**
 * Embed Pro Checkout Service
 * @module embed-pro/services/checkout.service
 * 
 * Handles Stripe checkout integration for embedded widgets.
 * Supports Stripe Connect for multi-tenant organizations.
 */

import { supabase } from '@/lib/supabase';
import type { WidgetActivity, WidgetVenue, CustomerInfo } from '../types/widget.types';

// =====================================================
// TYPES
// =====================================================

export interface CheckoutParams {
  // Activity & Booking Details
  activity: WidgetActivity;
  venue: WidgetVenue | null;
  selectedDate: Date;
  selectedTime: string;
  sessionId?: string;
  
  // Party
  adultCount: number;
  childCount: number;
  customCounts?: Record<string, number>;
  
  // Customer
  customerInfo: CustomerInfo;
  
  // Pricing
  subtotal: number;
  promoCode?: string;
  promoDiscount?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  
  // URLs
  successUrl: string;
  cancelUrl: string;
  
  // Organization
  organizationId: string;
  
  // Optional embed tracking
  embedKey?: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  bookingId?: string;
  error?: string;
}

export interface StripeConnectStatus {
  connected: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

// =====================================================
// CHECKOUT SERVICE
// =====================================================

export const checkoutService = {
  /**
   * Creates a Stripe Checkout Session with Connect support.
   */
  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    try {
      // Build line items from pricing
      const lineItems = this.buildLineItems(params);
      
      if (lineItems.length === 0) {
        throw new Error('No valid pricing configured for this activity');
      }

      // Calculate totals
      const totalPartySize = params.adultCount + params.childCount;
      
      // Build checkout metadata
      const metadata = this.buildMetadata(params);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          // Line items
          line_items: lineItems,
          
          // Customer info
          customerEmail: params.customerInfo.email,
          customerName: `${params.customerInfo.firstName} ${params.customerInfo.lastName}`,
          customerPhone: params.customerInfo.phone,
          
          // URLs
          successUrl: params.successUrl,
          cancelUrl: params.cancelUrl,
          
          // Organization for Stripe Connect
          organizationId: params.organizationId,
          
          // Session-specific data
          sessionId: params.sessionId,
          bookingDate: params.selectedDate.toISOString().split('T')[0],
          startTime: params.selectedTime,
          
          // Discounts
          promoCode: params.promoCode,
          giftCardCode: params.giftCardCode,
          giftCardAmount: params.giftCardAmount,
          subtotal: params.subtotal,
          
          // Metadata
          metadata,
        },
      });

      if (error) {
        console.error('[CheckoutService] Edge function error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('Invalid response from checkout creation');
      }

      // Track checkout initiation for embed analytics
      if (params.embedKey) {
        this.trackCheckoutInitiated(params.embedKey);
      }

      return {
        success: true,
        checkoutUrl: data.url,
        sessionId: data.sessionId,
      };
    } catch (error: any) {
      console.error('[CheckoutService] Checkout failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create checkout session',
      };
    }
  },

  /**
   * Builds Stripe line items from activity pricing.
   */
  buildLineItems(params: CheckoutParams): Array<{ price: string; quantity: number }> {
    const items: Array<{ price: string; quantity: number }> = [];
    const { activity, adultCount, childCount, customCounts } = params;
    const pricingTiers = activity.pricingTiers || [];
    const stripePriceId = activity.stripePriceId;

    // Check for multi-tier pricing
    if (pricingTiers.length > 0) {
      // Find adult pricing tier
      const adultTier = pricingTiers.find((t) => 
        t.name.toLowerCase() === 'adult' || t.name.toLowerCase() === 'adults'
      );
      if (adultTier?.stripePriceId && adultCount > 0) {
        items.push({ price: adultTier.stripePriceId, quantity: adultCount });
      }

      // Find child pricing tier
      const childTier = pricingTiers.find((t) => 
        t.name.toLowerCase() === 'child' || t.name.toLowerCase() === 'children'
      );
      if (childTier?.stripePriceId && childCount > 0) {
        items.push({ price: childTier.stripePriceId, quantity: childCount });
      }

      // Custom pricing tiers
      if (customCounts) {
        pricingTiers.forEach((tier) => {
          const isAdultChild = ['adult', 'adults', 'child', 'children'].includes(tier.name.toLowerCase());
          if (!isAdultChild && tier.stripePriceId) {
            const count = customCounts[tier.name] || 0;
            if (count > 0) {
              items.push({ price: tier.stripePriceId, quantity: count });
            }
          }
        });
      }
    } else if (stripePriceId) {
      // Single price mode - use adult count as quantity
      items.push({ price: stripePriceId, quantity: adultCount + childCount });
    }

    if (items.length === 0) {
      console.warn('[CheckoutService] No stripe pricing configured for activity');
    }

    return items;
  },

  /**
   * Builds metadata for the checkout session.
   */
  buildMetadata(params: CheckoutParams): Record<string, string> {
    return {
      activity_id: params.activity.id,
      activity_name: params.activity.name,
      venue_id: params.venue?.id || '',
      venue_name: params.venue?.name || '',
      organization_id: params.organizationId,
      booking_date: params.selectedDate.toISOString().split('T')[0],
      start_time: params.selectedTime,
      party_size: String(params.adultCount + params.childCount),
      adult_count: String(params.adultCount),
      child_count: String(params.childCount),
      customer_name: `${params.customerInfo.firstName} ${params.customerInfo.lastName}`,
      customer_phone: params.customerInfo.phone || '',
      session_id: params.sessionId || '',
      embed_key: params.embedKey || '',
      promo_code: params.promoCode || '',
      promo_discount: String(params.promoDiscount || 0),
      gift_card_code: params.giftCardCode || '',
      gift_card_amount: String(params.giftCardAmount || 0),
    };
  },

  /**
   * Tracks checkout initiation for analytics.
   */
  async trackCheckoutInitiated(embedKey: string): Promise<void> {
    try {
      // Increment booking count for embed analytics
      const { data, error } = await (supabase
        .from('embed_configs') as any)
        .select('booking_count')
        .eq('embed_key', embedKey)
        .single();
      
      if (!error && data) {
        await (supabase
          .from('embed_configs') as any)
          .update({ booking_count: (data.booking_count || 0) + 1 })
          .eq('embed_key', embedKey);
      }
    } catch (error) {
      console.warn('[CheckoutService] Failed to track checkout:', error);
    }
  },

  /**
   * Checks if organization has Stripe Connect configured.
   */
  async getStripeConnectStatus(organizationId: string): Promise<StripeConnectStatus> {
    try {
      const { data, error } = await (supabase
        .from('organizations') as any)
        .select('stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted')
        .eq('id', organizationId)
        .single();

      if (error || !data) {
        return { connected: false, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false };
      }

      const orgData = data as {
        stripe_account_id?: string;
        stripe_charges_enabled?: boolean;
        stripe_payouts_enabled?: boolean;
        stripe_details_submitted?: boolean;
      };

      return {
        connected: !!orgData.stripe_account_id,
        accountId: orgData.stripe_account_id,
        chargesEnabled: orgData.stripe_charges_enabled ?? false,
        payoutsEnabled: orgData.stripe_payouts_enabled ?? false,
        detailsSubmitted: orgData.stripe_details_submitted ?? false,
      };
    } catch (error) {
      console.error('[CheckoutService] Failed to get Stripe status:', error);
      return { connected: false, chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false };
    }
  },
};

export default checkoutService;
