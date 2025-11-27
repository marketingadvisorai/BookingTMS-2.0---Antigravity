/**
 * Embed Pro 2.0 - Gift Card Service
 * @module embed-pro/services/giftcard.service
 * 
 * Service for validating and redeeming gift cards.
 * 
 * NOTE: Uses demo data for now. Connect to Supabase for production.
 */

import type {
  GiftCard,
  RedeemGiftCardRequest,
  RedeemGiftCardResponse,
} from '../types/giftcard.types';

// =====================================================
// DEMO GIFT CARDS
// =====================================================

const DEMO_GIFT_CARDS: Record<string, Omit<GiftCard, 'id' | 'purchasedAt'>> = {
  'GC-DEMO-1000': {
    code: 'GC-DEMO-1000',
    originalValue: 10000, // $100
    remainingBalance: 10000,
    currency: 'USD',
    status: 'active',
    message: 'Enjoy your experience!',
  },
  'GC-DEMO-5000': {
    code: 'GC-DEMO-5000',
    originalValue: 5000, // $50
    remainingBalance: 5000,
    currency: 'USD',
    status: 'active',
  },
  'GC-HALF-2500': {
    code: 'GC-HALF-2500',
    originalValue: 5000, // $50
    remainingBalance: 2500, // $25 remaining
    currency: 'USD',
    status: 'partially_used',
    lastUsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'GC-EMPTY-0000': {
    code: 'GC-EMPTY-0000',
    originalValue: 5000,
    remainingBalance: 0,
    currency: 'USD',
    status: 'fully_used',
  },
};

// =====================================================
// SERVICE CLASS
// =====================================================

class GiftCardService {
  /**
   * Validate and apply a gift card
   */
  async redeemGiftCard(request: RedeemGiftCardRequest): Promise<RedeemGiftCardResponse> {
    const { code, subtotal, amount } = request;

    try {
      // Normalize code
      const normalizedCode = code.trim().toUpperCase();

      if (!normalizedCode) {
        return { isValid: false, error: 'Please enter a gift card code' };
      }

      // Look up gift card
      const cardData = DEMO_GIFT_CARDS[normalizedCode];

      if (!cardData) {
        console.log('[GiftCardService] Card not found:', normalizedCode);
        return { isValid: false, error: 'Invalid gift card code' };
      }

      // Build full gift card object
      const giftCard: GiftCard = {
        ...cardData,
        id: `gc_${normalizedCode}`,
        purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Validate status
      const statusError = this.validateStatus(giftCard);
      if (statusError) {
        return { isValid: false, error: statusError };
      }

      // Calculate amount to apply
      const amountToApply = this.calculateAmountToApply(
        giftCard.remainingBalance,
        subtotal,
        amount
      );

      // Calculate remaining values
      const remainingAfter = giftCard.remainingBalance - amountToApply;
      const amountOwed = Math.max(0, subtotal - amountToApply);

      return {
        isValid: true,
        giftCard,
        amountApplied: amountToApply,
        remainingAfter,
        amountOwed,
      };
    } catch (err) {
      console.error('[GiftCardService] Error:', err);
      return { isValid: false, error: 'Unable to validate gift card' };
    }
  }

  /**
   * Check gift card balance
   */
  async checkBalance(code: string): Promise<{ balance: number; error?: string }> {
    const normalizedCode = code.trim().toUpperCase();
    const cardData = DEMO_GIFT_CARDS[normalizedCode];

    if (!cardData) {
      return { balance: 0, error: 'Gift card not found' };
    }

    return { balance: cardData.remainingBalance };
  }

  /**
   * Validate gift card status
   */
  private validateStatus(giftCard: GiftCard): string | null {
    switch (giftCard.status) {
      case 'fully_used':
        return 'This gift card has been fully used';
      case 'expired':
        return 'This gift card has expired';
      case 'cancelled':
        return 'This gift card has been cancelled';
      default:
        if (giftCard.remainingBalance <= 0) {
          return 'This gift card has no remaining balance';
        }
        return null;
    }
  }

  /**
   * Calculate how much of gift card to apply
   */
  private calculateAmountToApply(
    balance: number,
    subtotal: number,
    requestedAmount?: number
  ): number {
    // If specific amount requested, validate and use it
    if (requestedAmount !== undefined) {
      return Math.min(requestedAmount, balance, subtotal);
    }

    // Otherwise, apply as much as possible up to subtotal
    return Math.min(balance, subtotal);
  }

  /**
   * Format gift card code for display
   */
  formatCode(code: string): string {
    // Format as GC-XXXX-XXXX
    const clean = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 10)}`;
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

// Export singleton
export const giftCardService = new GiftCardService();
export default giftCardService;
