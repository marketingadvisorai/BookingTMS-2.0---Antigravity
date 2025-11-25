/**
 * Code Validation Service
 * Validates promo codes and gift cards against Supabase database
 * Applies discounts and tracks usage
 */

import { supabase } from '../supabase';
import { Database } from '../../types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

const typedSupabase = supabase as SupabaseClient<Database>;

export interface PromoCodeValidationResult {
  isValid: boolean;
  error?: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    code: string;
  };
}

export interface GiftCardValidationResult {
  isValid: boolean;
  error?: string;
  balance?: number;
  code: string;
}

/**
 * Validate promo code
 */
export async function validatePromoCode(
  code: string,
  amount: number
): Promise<PromoCodeValidationResult> {
  try {
    if (!code || code.trim().length === 0) {
      return { isValid: false, error: 'Please enter a promo code' };
    }

    const cleanCode = code.trim().toUpperCase();

    // Query promo codes table
    const { data: promoCode, error } = await (typedSupabase as any)
      .from('promo_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (error || !promoCode) {
      return { isValid: false, error: 'Invalid promo code' };
    }

    // Check expiration
    if (promoCode.expires_at) {
      const expiryDate = new Date(promoCode.expires_at);
      if (expiryDate < new Date()) {
        return { isValid: false, error: 'This promo code has expired' };
      }
    }

    // Check usage limit
    if (promoCode.max_uses && promoCode.uses_count >= promoCode.max_uses) {
      return { isValid: false, error: 'This promo code has reached its usage limit' };
    }

    // Check minimum order amount
    if (promoCode.min_purchase_amount && amount < promoCode.min_purchase_amount) {
      return {
        isValid: false,
        error: `Minimum purchase of $${promoCode.min_purchase_amount} required`,
      };
    }

    // Valid promo code
    return {
      isValid: true,
      discount: {
        type: promoCode.discount_type,
        value: promoCode.discount_value,
        code: cleanCode,
      },
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { isValid: false, error: 'Error validating promo code' };
  }
}

/**
 * Validate gift card
 */
export async function validateGiftCard(code: string): Promise<GiftCardValidationResult> {
  try {
    if (!code || code.trim().length === 0) {
      return { isValid: false, error: 'Please enter a gift card code', code };
    }

    const cleanCode = code.trim().toUpperCase();

    // Query gift cards table
    const { data: giftCard, error } = await (typedSupabase as any)
      .from('gift_cards')
      .select('*')
      .eq('code', cleanCode)
      .eq('status', 'active')
      .single();

    if (error || !giftCard) {
      return { isValid: false, error: 'Invalid gift card code', code: cleanCode };
    }

    // Check expiration
    if (giftCard.expires_at) {
      const expiryDate = new Date(giftCard.expires_at);
      if (expiryDate < new Date()) {
        return {
          isValid: false,
          error: 'This gift card has expired',
          code: cleanCode,
        };
      }
    }

    // Check if already fully used
    if (giftCard.balance <= 0) {
      return {
        isValid: false,
        error: 'This gift card has no remaining balance',
        code: cleanCode,
      };
    }

    // Valid gift card
    return {
      isValid: true,
      balance: giftCard.balance,
      code: cleanCode,
    };
  } catch (error) {
    console.error('Error validating gift card:', error);
    return { isValid: false, error: 'Error validating gift card', code };
  }
}

/**
 * Apply promo code discount to amount
 */
export function applyPromoDiscount(
  amount: number,
  discount: { type: 'percentage' | 'fixed'; value: number }
): number {
  if (discount.type === 'percentage') {
    // Percentage discount (value is 0-100)
    const discountAmount = (amount * discount.value) / 100;
    return Math.max(0, amount - discountAmount);
  } else {
    // Fixed amount discount
    return Math.max(0, amount - discount.value);
  }
}

/**
 * Apply gift card balance to amount
 * Returns the remaining amount and how much of the gift card was used
 */
export function applyGiftCardBalance(
  amount: number,
  giftCardBalance: number
): { remainingAmount: number; giftCardUsed: number } {
  if (giftCardBalance >= amount) {
    // Gift card covers full amount
    return {
      remainingAmount: 0,
      giftCardUsed: amount,
    };
  } else {
    // Gift card covers partial amount
    return {
      remainingAmount: amount - giftCardBalance,
      giftCardUsed: giftCardBalance,
    };
  }
}

/**
 * Calculate discount amount from promo code
 */
export function calculatePromoDiscount(
  amount: number,
  discount: { type: 'percentage' | 'fixed'; value: number }
): number {
  if (discount.type === 'percentage') {
    return (amount * discount.value) / 100;
  } else {
    return Math.min(discount.value, amount); // Can't discount more than total
  }
}

/**
 * Record promo code usage (call after successful payment)
 */
export async function recordPromoCodeUsage(
  code: string,
  bookingId: string,
  userId?: string
): Promise<void> {
  try {
    // Get promo code ID
    const { data: promoCode } = await (typedSupabase as any)
      .from('promo_codes')
      .select('id')
      .eq('code', code)
      .single();

    if (!promoCode) return;

    // Record usage
    await (typedSupabase as any).from('promo_code_usage').insert({
      promo_code_id: promoCode.id,
      booking_id: bookingId,
      user_id: userId,
      used_at: new Date().toISOString(),
    });

    // Increment usage count
    await (typedSupabase as any).rpc('increment_promo_usage', { code_id: promoCode.id });
  } catch (error) {
    console.error('Error recording promo code usage:', error);
  }
}

/**
 * Record gift card usage and update balance (call after successful payment)
 */
export async function recordGiftCardUsage(
  code: string,
  amountUsed: number,
  bookingId: string
): Promise<void> {
  try {
    // Get gift card
    const { data: giftCard } = await (typedSupabase as any)
      .from('gift_cards')
      .select('id, balance')
      .eq('code', code)
      .single();

    if (!giftCard) return;

    // Update balance
    const newBalance = giftCard.balance - amountUsed;

    await (typedSupabase as any)
      .from('gift_cards')
      .update({
        balance: newBalance,
        status: newBalance <= 0 ? 'used' : 'active',
      })
      .eq('id', giftCard.id);

    // Record usage
    await (typedSupabase as any).from('gift_card_usage').insert({
      gift_card_id: giftCard.id,
      booking_id: bookingId,
      amount_used: amountUsed,
      used_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording gift card usage:', error);
  }
}

/**
 * Format code for display (uppercase, add dashes if needed)
 */
export function formatCodeDisplay(code: string): string {
  const cleaned = code.trim().toUpperCase();

  // If 12+ characters, add dashes every 4 characters for readability
  if (cleaned.length >= 12 && !cleaned.includes('-')) {
    return cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
  }

  return cleaned;
}
