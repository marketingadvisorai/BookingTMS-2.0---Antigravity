/**
 * Embed Pro 2.0 - Promo Code Service
 * @module embed-pro/services/promo.service
 * 
 * Service for validating and applying promo codes.
 * Supports percentage and fixed amount discounts.
 * 
 * NOTE: This service uses local validation for demo purposes.
 * For production, connect to a promo_codes table in Supabase.
 */

import type { 
  PromoCode, 
  PromoValidationResult, 
  ApplyPromoRequest 
} from '../types/promo.types';

// =====================================================
// DEMO PROMO CODES (Replace with Supabase in production)
// =====================================================

const DEMO_PROMOS: Record<string, Omit<PromoCode, 'id' | 'createdAt'>> = {
  'WELCOME10': {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    description: '10% off your first booking',
    isActive: true,
    currentUses: 0,
    maxUses: 1000,
  },
  'SAVE20': {
    code: 'SAVE20',
    discountType: 'percentage',
    discountValue: 20,
    description: '20% off (max $50)',
    maxDiscountAmount: 5000, // $50 in cents
    isActive: true,
    currentUses: 0,
  },
  'FLAT25': {
    code: 'FLAT25',
    discountType: 'fixed_amount',
    discountValue: 2500, // $25 in cents
    description: '$25 off your booking',
    minOrderAmount: 5000, // Min $50 order
    isActive: true,
    currentUses: 0,
  },
};

// =====================================================
// SERVICE CLASS
// =====================================================

class PromoService {
  /**
   * Validate and apply a promo code
   */
  async validatePromo(request: ApplyPromoRequest): Promise<PromoValidationResult> {
    const { code, activityId, subtotal } = request;

    try {
      // Normalize code (uppercase, trim)
      const normalizedCode = code.trim().toUpperCase();

      if (!normalizedCode) {
        return { isValid: false, error: 'Please enter a promo code' };
      }

      // Look up promo code (using demo data for now)
      const promoData = DEMO_PROMOS[normalizedCode];

      if (!promoData) {
        console.log('[PromoService] Promo not found:', normalizedCode);
        return { isValid: false, error: 'Invalid promo code' };
      }

      // Build full promo code object
      const promoCode: PromoCode = {
        ...promoData,
        id: `demo_${normalizedCode}`,
        createdAt: new Date().toISOString(),
      };

      // Validate promo code rules
      const validationError = this.validatePromoRules(promoCode, activityId, subtotal);
      if (validationError) {
        return { isValid: false, error: validationError };
      }

      // Calculate discount
      const discountAmount = this.calculateDiscount(promoCode, subtotal);
      const finalAmount = Math.max(0, subtotal - discountAmount);

      return {
        isValid: true,
        promo: promoCode,
        discountAmount,
        originalAmount: subtotal,
        finalAmount,
      };
    } catch (err) {
      console.error('[PromoService] Validation error:', err);
      return { isValid: false, error: 'Unable to validate promo code' };
    }
  }

  /**
   * Validate promo code business rules
   */
  private validatePromoRules(
    promo: PromoCode, 
    activityId: string, 
    subtotal: number
  ): string | null {
    const now = new Date();

    // Check date validity
    if (promo.validFrom && new Date(promo.validFrom) > now) {
      return 'This promo code is not yet active';
    }

    if (promo.validUntil && new Date(promo.validUntil) < now) {
      return 'This promo code has expired';
    }

    // Check usage limit
    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      return 'This promo code has reached its usage limit';
    }

    // Check minimum order amount
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      const minAmount = (promo.minOrderAmount / 100).toFixed(2);
      return `Minimum order of $${minAmount} required for this promo`;
    }

    // Check activity eligibility
    if (promo.activityIds && promo.activityIds.length > 0) {
      if (!promo.activityIds.includes(activityId)) {
        return 'This promo code is not valid for this activity';
      }
    }

    return null;
  }

  /**
   * Calculate discount amount in cents
   */
  private calculateDiscount(promo: PromoCode, subtotal: number): number {
    let discount = 0;

    if (promo.discountType === 'percentage') {
      // Calculate percentage discount
      discount = Math.round(subtotal * (promo.discountValue / 100));
      
      // Apply max discount cap if set
      if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
        discount = promo.maxDiscountAmount;
      }
    } else if (promo.discountType === 'fixed_amount') {
      // Fixed amount discount
      discount = promo.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    return Math.min(discount, subtotal);
  }

  /**
   * Increment promo code usage count
   * NOTE: Stub for demo - implement with Supabase in production
   */
  async incrementUsage(promoId: string): Promise<void> {
    console.log('[PromoService] Would increment usage for:', promoId);
    // TODO: Implement with Supabase when promo_codes table is created
    // const { error } = await supabase.rpc('increment_promo_usage', { promo_id: promoId });
  }

  /**
   * Format discount for display
   */
  formatDiscount(promo: PromoCode): string {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}% off`;
    } else {
      const amount = (promo.discountValue / 100).toFixed(2);
      return `$${amount} off`;
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(cents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  }
}

// Export singleton instance
export const promoService = new PromoService();
export default promoService;
