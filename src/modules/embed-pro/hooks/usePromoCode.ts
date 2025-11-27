/**
 * Embed Pro 2.0 - Promo Code Hook
 * @module embed-pro/hooks/usePromoCode
 * 
 * Custom hook for promo code state management.
 * Handles validation, application, and removal of promo codes.
 */

import { useState, useCallback } from 'react';
import { promoService } from '../services';
import type { PromoCode, PromoCodeState } from '../types/promo.types';

// =====================================================
// HOOK INTERFACE
// =====================================================

interface UsePromoCodeOptions {
  activityId: string;
  organizationId?: string;
  subtotal: number;
  currency?: string;
}

interface UsePromoCodeReturn {
  /** Current promo code input value */
  code: string;
  /** Set the promo code input value */
  setCode: (code: string) => void;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Applied promo code (if any) */
  appliedPromo: PromoCode | null;
  /** Calculated discount amount in cents */
  discountAmount: number;
  /** Final amount after discount */
  finalAmount: number;
  /** Error message (if any) */
  error: string | null;
  /** Apply the current promo code */
  applyPromo: () => Promise<boolean>;
  /** Remove the applied promo code */
  removePromo: () => void;
  /** Clear any error messages */
  clearError: () => void;
  /** Format a cents amount as currency */
  formatAmount: (cents: number) => string;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function usePromoCode(options: UsePromoCodeOptions): UsePromoCodeReturn {
  const { activityId, organizationId, subtotal, currency = 'USD' } = options;

  // State
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Calculate final amount
  const finalAmount = Math.max(0, subtotal - discountAmount);

  // Apply promo code
  const applyPromo = useCallback(async (): Promise<boolean> => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await promoService.validatePromo({
        code: code.trim(),
        activityId,
        organizationId,
        subtotal,
        currency,
      });

      if (result.isValid && result.promo && result.discountAmount !== undefined) {
        setAppliedPromo(result.promo);
        setDiscountAmount(result.discountAmount);
        setError(null);
        return true;
      } else {
        setError(result.error || 'Invalid promo code');
        setAppliedPromo(null);
        setDiscountAmount(0);
        return false;
      }
    } catch (err) {
      console.error('[usePromoCode] Error applying promo:', err);
      setError('Unable to validate promo code');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [code, activityId, organizationId, subtotal, currency]);

  // Remove applied promo
  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setCode('');
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format amount helper
  const formatAmount = useCallback((cents: number) => {
    return promoService.formatAmount(cents, currency);
  }, [currency]);

  return {
    code,
    setCode,
    isValidating,
    appliedPromo,
    discountAmount,
    finalAmount,
    error,
    applyPromo,
    removePromo,
    clearError,
    formatAmount,
  };
}

export default usePromoCode;
