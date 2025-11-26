/**
 * Pricing Types
 * Multi-tier pricing and promo code system
 */

// Pricing Tier Types
export type PricingTierType = 'adult' | 'child' | 'veteran' | 'senior' | 'student' | 'group' | 'custom';

export interface PricingTier {
  id: string;
  organization_id: string;
  activity_id: string; // Renamed from game_id
  game_id?: string; // Deprecated - use activity_id
  
  // Tier details
  tier_type: PricingTierType;
  tier_name: string;
  tier_description?: string;
  
  // Pricing
  price: number;
  currency: string;
  
  // Stripe
  stripe_price_id?: string;
  price_lookup_key?: string;
  
  // Eligibility
  min_age?: number;
  max_age?: number;
  requires_verification: boolean;
  verification_type?: string;
  
  // Display
  display_order: number;
  is_active: boolean;
  is_default: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePricingTierDTO {
  organization_id: string;
  activity_id: string; // Renamed from game_id
  tier_type: PricingTierType;
  tier_name: string;
  tier_description?: string;
  price: number;
  min_age?: number;
  max_age?: number;
  requires_verification?: boolean;
  verification_type?: string;
  display_order?: number;
}

// Promo Code Types
export type DiscountType = 'percentage' | 'fixed_amount' | 'free_game';
export type AppliesTo = 'all' | 'specific_games' | 'specific_venues';

export interface PromoCode {
  id: string;
  organization_id: string;
  
  // Code details
  code: string;
  name: string;
  description?: string;
  
  // Discount
  discount_type: DiscountType;
  discount_value: number;
  currency: string;
  
  // Stripe
  stripe_coupon_id?: string;
  stripe_promotion_code_id?: string;
  
  // Applicability
  applies_to: AppliesTo;
  game_ids?: string[];
  venue_ids?: string[];
  tier_types?: PricingTierType[];
  
  // Usage limits
  max_uses?: number;
  uses_count: number;
  max_uses_per_customer: number;
  min_purchase_amount?: number;
  
  // Validity
  valid_from: string;
  valid_until?: string;
  
  // Status
  is_active: boolean;
  is_archived: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreatePromoCodeDTO {
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  applies_to?: AppliesTo;
  game_ids?: string[];
  venue_ids?: string[];
  tier_types?: PricingTierType[];
  max_uses?: number;
  max_uses_per_customer?: number;
  min_purchase_amount?: number;
  valid_from?: string;
  valid_until?: string;
}

export interface PromoCodeValidation {
  is_valid: boolean;
  promo_code_id?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  discount_amount?: number;
  message: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  organization_id: string;
  customer_id?: string;
  booking_id?: string;
  discount_applied: number;
  original_amount: number;
  final_amount: number;
  metadata?: Record<string, any>;
  used_at: string;
}

// Pricing Breakdown for Bookings
export interface PricingBreakdown {
  tier_type: PricingTierType;
  tier_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface BookingPricing {
  tiers: PricingBreakdown[];
  subtotal: number;
  promo_code?: string;
  discount_amount: number;
  tax_amount?: number;
  total: number;
}

// Helper Functions
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function calculateDiscount(
  amount: number,
  discountType: DiscountType,
  discountValue: number
): number {
  switch (discountType) {
    case 'percentage':
      return Math.round((amount * discountValue / 100) * 100) / 100;
    case 'fixed_amount':
      return Math.min(discountValue, amount);
    case 'free_game':
      return amount;
    default:
      return 0;
  }
}

export function isPricingTierEligible(
  tier: PricingTier,
  age?: number
): boolean {
  if (!tier.is_active) return false;
  
  if (age !== undefined) {
    if (tier.min_age && age < tier.min_age) return false;
    if (tier.max_age && age > tier.max_age) return false;
  }
  
  return true;
}
