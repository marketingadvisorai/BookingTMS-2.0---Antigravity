/**
 * Price Converters
 * Utility functions for converting Stripe price formats
 * 
 * @module payment/priceConverters
 */

import { ActivityData } from '../../types';

/**
 * Convert raw Stripe prices array to structured format
 */
export const convertPricesToStructured = (
  prices: any[],
  activityData: ActivityData
): ActivityData['stripePrices'] => {
  const result: ActivityData['stripePrices'] = {
    adult: null,
    child: null,
    custom: [],
  };

  for (const price of prices) {
    const tierType = price.metadata?.tier_type || 'adult';
    const priceData = {
      price_id: price.priceId || price.id,
      lookup_key: price.lookupKey || price.lookup_key || '',
      amount: ((price.unitAmount || price.unit_amount) || 0) / 100,
      currency: price.currency || 'usd',
    };

    if (tierType === 'adult' || (!result?.adult && tierType !== 'child')) {
      result!.adult = priceData;
    } else if (tierType === 'child') {
      result!.child = priceData;
    } else if (tierType === 'custom') {
      result!.custom?.push({
        ...priceData,
        id: price.metadata?.custom_id || '',
        name: price.metadata?.display_name || 'Custom',
        min: parseInt(price.metadata?.min_quantity || '0'),
        max: parseInt(price.metadata?.max_quantity || '10'),
      });
    }
  }

  return result;
};

/**
 * Count total pricing tiers
 */
export const countPricingTiers = (prices: ActivityData['stripePrices']): number => {
  if (!prices) return 0;
  return (prices.adult ? 1 : 0) + 
         (prices.child ? 1 : 0) + 
         (prices.custom?.length || 0);
};
