/**
 * Pricing Calculator Utility
 * Handles complex pricing calculations including:
 * - Adult and child pricing
 * - Custom capacity field pricing
 * - Group discounts
 * - Promo codes
 * - Gift cards
 */

export interface PricingBreakdown {
  adults: number;
  children: number;
  customFields: Array<{ name: string; count: number; price: number }>;
  subtotal: number;
  groupDiscount: number;
  promoDiscount: number;
  giftCardAmount: number;
  total: number;
  savings: number;
}

export interface GamePricing {
  adultPrice: number;
  childPrice?: number;
  customCapacityFields?: Array<{
    id: string;
    name: string;
    min: number;
    max: number;
    price: number;
  }>;
  groupDiscount?: boolean;
  groupTiers?: Array<{
    minSize: number;
    maxSize: number;
    discountPercent: number;
  }>;
}

export interface PartyComposition {
  adults: number;
  children: number;
  customFields?: Array<{ fieldId: string; count: number }>;
}

/**
 * Calculate base price before discounts
 */
export function calculateBasePrice(
  gamePricing: GamePricing,
  party: PartyComposition
): number {
  let basePrice = 0;

  // Adult pricing
  basePrice += party.adults * gamePricing.adultPrice;

  // Child pricing
  if (party.children > 0 && gamePricing.childPrice) {
    basePrice += party.children * gamePricing.childPrice;
  }

  // Custom capacity field pricing
  if (party.customFields && gamePricing.customCapacityFields) {
    party.customFields.forEach(customField => {
      const fieldDef = gamePricing.customCapacityFields?.find(f => f.id === customField.fieldId);
      if (fieldDef) {
        basePrice += customField.count * fieldDef.price;
      }
    });
  }

  return basePrice;
}

/**
 * Calculate group discount based on total party size
 */
export function calculateGroupDiscount(
  basePrice: number,
  totalPartySize: number,
  groupTiers?: Array<{ minSize: number; maxSize: number; discountPercent: number }>
): number {
  if (!groupTiers || groupTiers.length === 0) {
    return 0;
  }

  // Find applicable tier
  const applicableTier = groupTiers.find(
    tier => totalPartySize >= tier.minSize && totalPartySize <= tier.maxSize
  );

  if (!applicableTier) {
    return 0;
  }

  return basePrice * (applicableTier.discountPercent / 100);
}

/**
 * Calculate total party size
 */
export function calculateTotalPartySize(party: PartyComposition): number {
  let total = party.adults + party.children;
  
  if (party.customFields) {
    party.customFields.forEach(field => {
      total += field.count;
    });
  }
  
  return total;
}

/**
 * Calculate complete pricing breakdown
 */
export function calculatePricing(
  gamePricing: GamePricing,
  party: PartyComposition,
  promoCode?: { code: string; discount: number; type: 'percentage' | 'fixed' },
  giftCard?: { code: string; amount: number }
): PricingBreakdown {
  // Calculate base price
  const subtotal = calculateBasePrice(gamePricing, party);
  
  // Calculate total party size
  const totalPartySize = calculateTotalPartySize(party);
  
  // Calculate group discount
  let groupDiscount = 0;
  if (gamePricing.groupDiscount && gamePricing.groupTiers) {
    groupDiscount = calculateGroupDiscount(subtotal, totalPartySize, gamePricing.groupTiers);
  }
  
  // Apply group discount
  let priceAfterGroupDiscount = subtotal - groupDiscount;
  
  // Calculate promo discount
  let promoDiscount = 0;
  if (promoCode) {
    if (promoCode.type === 'percentage') {
      promoDiscount = priceAfterGroupDiscount * (promoCode.discount / 100);
    } else {
      promoDiscount = Math.min(promoCode.discount, priceAfterGroupDiscount);
    }
  }
  
  // Apply promo discount
  let priceAfterPromo = priceAfterGroupDiscount - promoDiscount;
  
  // Apply gift card
  let giftCardAmount = 0;
  if (giftCard) {
    giftCardAmount = Math.min(giftCard.amount, priceAfterPromo);
  }
  
  // Calculate final total
  const total = Math.max(0, priceAfterPromo - giftCardAmount);
  
  // Calculate total savings
  const savings = groupDiscount + promoDiscount + giftCardAmount;
  
  // Build custom fields breakdown
  const customFieldsBreakdown: Array<{ name: string; count: number; price: number }> = [];
  if (party.customFields && gamePricing.customCapacityFields) {
    party.customFields.forEach(customField => {
      const fieldDef = gamePricing.customCapacityFields?.find(f => f.id === customField.fieldId);
      if (fieldDef) {
        customFieldsBreakdown.push({
          name: fieldDef.name,
          count: customField.count,
          price: fieldDef.price
        });
      }
    });
  }
  
  return {
    adults: party.adults,
    children: party.children,
    customFields: customFieldsBreakdown,
    subtotal,
    groupDiscount,
    promoDiscount,
    giftCardAmount,
    total,
    savings
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Get applicable group discount tier
 */
export function getApplicableGroupTier(
  totalPartySize: number,
  groupTiers?: Array<{ minSize: number; maxSize: number; discountPercent: number }>
): { minSize: number; maxSize: number; discountPercent: number } | null {
  if (!groupTiers || groupTiers.length === 0) {
    return null;
  }

  return groupTiers.find(
    tier => totalPartySize >= tier.minSize && totalPartySize <= tier.maxSize
  ) || null;
}
