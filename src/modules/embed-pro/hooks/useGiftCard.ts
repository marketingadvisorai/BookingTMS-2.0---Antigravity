/**
 * Embed Pro 2.0 - Gift Card Hook
 * @module embed-pro/hooks/useGiftCard
 * 
 * Custom hook for gift card state management.
 * Handles validation, application, and removal.
 */

import { useState, useCallback } from 'react';
import { giftCardService } from '../services/giftcard.service';
import type { GiftCard } from '../types/giftcard.types';

// =====================================================
// HOOK INTERFACE
// =====================================================

interface UseGiftCardOptions {
  activityId: string;
  organizationId?: string;
  subtotal: number;
  currency?: string;
}

interface UseGiftCardReturn {
  /** Current gift card code input */
  code: string;
  /** Set the code input */
  setCode: (code: string) => void;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Applied gift card (if any) */
  appliedGiftCard: GiftCard | null;
  /** Amount applied from gift card */
  amountApplied: number;
  /** Remaining balance after use */
  remainingAfter: number;
  /** Final amount after gift card */
  finalAmount: number;
  /** Error message */
  error: string | null;
  /** Apply the gift card */
  applyGiftCard: () => Promise<boolean>;
  /** Remove the applied gift card */
  removeGiftCard: () => void;
  /** Clear any error messages */
  clearError: () => void;
  /** Format amount as currency */
  formatAmount: (cents: number) => string;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useGiftCard(options: UseGiftCardOptions): UseGiftCardReturn {
  const { activityId, organizationId, subtotal, currency = 'USD' } = options;

  // State
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);
  const [amountApplied, setAmountApplied] = useState(0);
  const [remainingAfter, setRemainingAfter] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Calculate final amount
  const finalAmount = Math.max(0, subtotal - amountApplied);

  // Apply gift card
  const applyGiftCard = useCallback(async (): Promise<boolean> => {
    if (!code.trim()) {
      setError('Please enter a gift card code');
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await giftCardService.redeemGiftCard({
        code: code.trim(),
        activityId,
        organizationId,
        subtotal,
      });

      if (result.isValid && result.giftCard) {
        setAppliedGiftCard(result.giftCard);
        setAmountApplied(result.amountApplied || 0);
        setRemainingAfter(result.remainingAfter || 0);
        setError(null);
        return true;
      } else {
        setError(result.error || 'Invalid gift card');
        setAppliedGiftCard(null);
        setAmountApplied(0);
        setRemainingAfter(0);
        return false;
      }
    } catch (err) {
      console.error('[useGiftCard] Error:', err);
      setError('Unable to validate gift card');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [code, activityId, organizationId, subtotal]);

  // Remove gift card
  const removeGiftCard = useCallback(() => {
    setAppliedGiftCard(null);
    setAmountApplied(0);
    setRemainingAfter(0);
    setCode('');
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format amount
  const formatAmount = useCallback((cents: number) => {
    return giftCardService.formatAmount(cents, currency);
  }, [currency]);

  return {
    code,
    setCode,
    isValidating,
    appliedGiftCard,
    amountApplied,
    remainingAfter,
    finalAmount,
    error,
    applyGiftCard,
    removeGiftCard,
    clearError,
    formatAmount,
  };
}

export default useGiftCard;
