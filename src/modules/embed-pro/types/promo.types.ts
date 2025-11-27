/**
 * Embed Pro 2.0 - Promo Code Types
 * @module embed-pro/types/promo.types
 * 
 * Type definitions for promo code / discount functionality.
 */

// =====================================================
// PROMO CODE TYPES
// =====================================================

export type PromoDiscountType = 'percentage' | 'fixed_amount';

export interface PromoCode {
  /** Unique identifier */
  id: string;
  /** The promo code string (e.g., "SUMMER20") */
  code: string;
  /** Type of discount */
  discountType: PromoDiscountType;
  /** Discount value (percentage 0-100 or fixed amount in cents) */
  discountValue: number;
  /** Currency for fixed amount discounts */
  currency?: string;
  /** Maximum discount amount (for percentage discounts) */
  maxDiscountAmount?: number;
  /** Minimum order amount required */
  minOrderAmount?: number;
  /** Organization this promo belongs to */
  organizationId?: string;
  /** Specific activity IDs this promo applies to (empty = all) */
  activityIds?: string[];
  /** Start date (ISO string) */
  validFrom?: string;
  /** End date (ISO string) */
  validUntil?: string;
  /** Maximum number of uses */
  maxUses?: number;
  /** Current number of uses */
  currentUses: number;
  /** Whether the promo is active */
  isActive: boolean;
  /** Description shown to user */
  description?: string;
  /** Created timestamp */
  createdAt: string;
}

// =====================================================
// VALIDATION TYPES
// =====================================================

export interface PromoValidationResult {
  /** Whether the promo code is valid */
  isValid: boolean;
  /** Validated promo code details (if valid) */
  promo?: PromoCode;
  /** Error message (if invalid) */
  error?: string;
  /** Calculated discount amount in cents */
  discountAmount?: number;
  /** Original amount before discount */
  originalAmount?: number;
  /** Final amount after discount */
  finalAmount?: number;
}

export interface ApplyPromoRequest {
  /** The promo code to validate */
  code: string;
  /** Activity ID to check eligibility */
  activityId: string;
  /** Organization ID */
  organizationId?: string;
  /** Order subtotal in cents */
  subtotal: number;
  /** Currency */
  currency?: string;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface PromoCodeState {
  /** Input value */
  code: string;
  /** Loading state */
  isValidating: boolean;
  /** Applied promo (if any) */
  appliedPromo: PromoCode | null;
  /** Discount amount */
  discountAmount: number;
  /** Error message */
  error: string | null;
}
