/**
 * Pricing Service
 * 
 * Handles multi-tier pricing with real-time Stripe synchronization:
 * - Adult pricing (required)
 * - Child pricing (optional)
 * - Custom capacity pricing (e.g., VIP, Equipment Rental)
 * 
 * Uses Stripe lookup_keys for seamless price updates without changing price IDs
 * 
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
  adult: PriceTier | null;
  child: PriceTier | null;
  custom: CustomPriceTier[];
}

export interface PricingConfig {
  adultPrice: number;
  childPrice?: number;
  customCapacityFields?: Array<{
    id: string;
    name: string;
    min: number;
    max: number;
    price: number;
  }>;
  currency?: string;
}

export interface SyncPricesParams {
  activityId: string;
  productId: string;
  pricing: PricingConfig;
}

export interface CreatePricesResult {
  success: boolean;
  prices: StripePrices;
  primaryPriceId: string;
  syncedAt: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate lookup key for a price tier
 */
export const generateLookupKey = (activityId: string, tierType: string): string => {
  const cleanId = activityId.replace(/-/g, '_');
  return `activity_${cleanId}_${tierType.toLowerCase()}`;
};

/**
 * Convert amount to cents for Stripe
 */
export const toCents = (amount: number): number => Math.round(amount * 100);

/**
 * Convert cents to dollars
 */
export const fromCents = (cents: number): number => cents / 100;

// ============================================================================
// PRICING SERVICE CLASS
// ============================================================================

export class PricingService {
  /**
   * Invoke the Stripe edge function
   */
  private static async invokeStripeFunction(action: string, params: any): Promise<any> {
    console.log(`[PricingService] Invoking: ${action}`, params);
    
    const { data, error } = await supabase.functions.invoke('stripe-manage-product', {
      body: { action, ...params }
    });

    if (error) {
      console.error(`[PricingService] Error (${action}):`, error);
      throw new Error(error.message || 'Stripe operation failed');
    }

    if (data?.error) {
      console.error(`[PricingService] API Error (${action}):`, data.error);
      throw new Error(data.error);
    }

    console.log(`[PricingService] Success (${action}):`, data);
    return data;
  }

  /**
   * Create multi-tier prices for an activity
   * Creates adult, child, and custom prices with lookup keys
   */
  static async createMultiTierPrices(
    productId: string,
    activityId: string,
    pricing: PricingConfig
  ): Promise<CreatePricesResult> {
    try {
      console.log('📊 Creating multi-tier prices:', { productId, activityId, pricing });

      const result = await this.invokeStripeFunction('create_multi_tier_prices', {
        productId,
        activityId,
        adultPrice: pricing.adultPrice,
        childPrice: pricing.childPrice || 0,
        customPrices: pricing.customCapacityFields?.filter(f => f.price > 0) || [],
        currency: pricing.currency || 'usd',
      });

      return {
        success: true,
        prices: result.prices,
        primaryPriceId: result.primaryPriceId,
        syncedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error creating multi-tier prices:', error);
      throw error;
    }
  }

  /**
   * Sync all prices for an activity
   * Updates existing prices or creates new ones
   */
  static async syncActivityPrices(params: SyncPricesParams): Promise<CreatePricesResult> {
    try {
      console.log('🔄 Syncing activity prices:', params);

      const result = await this.invokeStripeFunction('sync_activity_prices', {
        productId: params.productId,
        activityId: params.activityId,
        adultPrice: params.pricing.adultPrice,
        childPrice: params.pricing.childPrice || 0,
        customPrices: params.pricing.customCapacityFields?.filter(f => f.price > 0) || [],
        currency: params.pricing.currency || 'usd',
      });

      return {
        success: true,
        prices: result.prices,
        primaryPriceId: result.primaryPriceId,
        syncedAt: result.syncedAt,
      };
    } catch (error) {
      console.error('❌ Error syncing prices:', error);
      throw error;
    }
  }

  /**
   * Update a single price by lookup key
   * Creates new price with same lookup key (Stripe transfers the key)
   */
  static async updatePriceByLookupKey(
    lookupKey: string,
    productId: string,
    newAmount: number,
    metadata?: Record<string, string>
  ): Promise<{ priceId: string; lookupKey: string; amount: number }> {
    try {
      console.log('💰 Updating price by lookup key:', { lookupKey, newAmount });

      const result = await this.invokeStripeFunction('update_price_by_lookup_key', {
        lookupKey,
        productId,
        newAmount,
        currency: 'usd',
        metadata,
      });

      return {
        priceId: result.priceId,
        lookupKey: result.lookupKey,
        amount: result.amount,
      };
    } catch (error) {
      console.error('❌ Error updating price:', error);
      throw error;
    }
  }

  /**
   * Get price by lookup key
   */
  static async getPriceByLookupKey(lookupKey: string): Promise<any> {
    try {
      const result = await this.invokeStripeFunction('get_price_by_lookup_key', { lookupKey });
      return result.price;
    } catch (error) {
      console.error('Error getting price by lookup key:', error);
      return null;
    }
  }

  /**
   * Save pricing to database
   */
  static async savePricingToDatabase(
    activityId: string,
    prices: StripePrices,
    primaryPriceId: string
  ): Promise<void> {
    try {
      console.log('💾 Saving pricing to database:', { activityId, prices });

      const { error } = await (supabase as any)
        .from('activities')
        .update({
          stripe_price_id: primaryPriceId,
          stripe_prices: prices,
          stripe_sync_status: 'synced',
          stripe_last_sync: new Date().toISOString(),
          pricing_needs_sync: false,
        })
        .eq('id', activityId);

      if (error) {
        console.error('Error saving pricing to database:', error);
        throw error;
      }

      console.log('✅ Pricing saved to database');
    } catch (error) {
      console.error('❌ Error saving pricing:', error);
      throw error;
    }
  }

  /**
   * Load pricing from database
   */
  static async loadPricingFromDatabase(activityId: string): Promise<StripePrices | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('activities')
        .select('stripe_prices, price, child_price, custom_capacity_fields')
        .eq('id', activityId)
        .single();

      if (error || !data) {
        console.warn('No pricing data found for activity:', activityId);
        return null;
      }

      // Return stripe_prices if exists, otherwise construct from individual fields
      if (data.stripe_prices) {
        return data.stripe_prices as StripePrices;
      }

      // Fallback: construct from individual price fields
      return {
        adult: data.price ? { 
          price_id: '', 
          lookup_key: generateLookupKey(activityId, 'adult'),
          amount: data.price,
          currency: 'usd'
        } : null,
        child: data.child_price ? {
          price_id: '',
          lookup_key: generateLookupKey(activityId, 'child'),
          amount: data.child_price,
          currency: 'usd'
        } : null,
        custom: (data.custom_capacity_fields || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          price_id: f.stripe_price_id || '',
          lookup_key: generateLookupKey(activityId, `custom_${f.id}`),
          amount: f.price,
          min: f.min || 0,
          max: f.max || 10,
          currency: 'usd',
        })),
      };
    } catch (error) {
      console.error('Error loading pricing from database:', error);
      return null;
    }
  }

  /**
   * Check if pricing needs sync
   * Compares database values with Stripe
   */
  static async checkPricingNeedsSync(activityId: string): Promise<boolean> {
    try {
      const { data, error } = await (supabase as any)
        .from('activities')
        .select('pricing_needs_sync')
        .eq('id', activityId)
        .single();

      if (error || !data) return false;
      return data.pricing_needs_sync || false;
    } catch {
      return false;
    }
  }

  /**
   * Full sync: Create/update Stripe prices and save to database
   * This is the main entry point for pricing synchronization
   */
  static async fullSync(
    activityId: string,
    productId: string,
    pricing: PricingConfig
  ): Promise<CreatePricesResult> {
    try {
      console.log('🚀 Starting full pricing sync:', { activityId, productId });

      // 1. Sync prices with Stripe
      const result = await this.syncActivityPrices({
        activityId,
        productId,
        pricing,
      });

      // 2. Save to database
      await this.savePricingToDatabase(activityId, result.prices, result.primaryPriceId);

      console.log('✅ Full pricing sync complete');
      return result;
    } catch (error) {
      console.error('❌ Full pricing sync failed:', error);
      throw error;
    }
  }
}

export default PricingService;
