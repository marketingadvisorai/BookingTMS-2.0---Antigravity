/**
 * Embed Pro 2.0 - Gift Card Types
 * @module embed-pro/types/giftcard.types
 * 
 * Type definitions for gift card redemption functionality.
 */

// =====================================================
// GIFT CARD TYPES
// =====================================================

export type GiftCardStatus = 'active' | 'partially_used' | 'fully_used' | 'expired' | 'cancelled';

export interface GiftCard {
  /** Unique identifier */
  id: string;
  /** Gift card code (e.g., "GC-XXXX-XXXX") */
  code: string;
  /** Original value in cents */
  originalValue: number;
  /** Remaining balance in cents */
  remainingBalance: number;
  /** Currency */
  currency: string;
  /** Current status */
  status: GiftCardStatus;
  /** Organization ID (if specific to org) */
  organizationId?: string;
  /** Purchaser info */
  purchaser?: GiftCardPurchaser;
  /** Recipient info */
  recipient?: GiftCardRecipient;
  /** Purchase date */
  purchasedAt: string;
  /** Expiry date */
  expiresAt?: string;
  /** Last used date */
  lastUsedAt?: string;
  /** Message from purchaser */
  message?: string;
}

export interface GiftCardPurchaser {
  name: string;
  email: string;
}

export interface GiftCardRecipient {
  name?: string;
  email: string;
  notified: boolean;
  notifiedAt?: string;
}

// =====================================================
// REDEMPTION TYPES
// =====================================================

export interface RedeemGiftCardRequest {
  /** Gift card code */
  code: string;
  /** Amount to redeem in cents (optional - defaults to full balance) */
  amount?: number;
  /** Order subtotal in cents */
  subtotal: number;
  /** Activity ID */
  activityId: string;
  /** Organization ID */
  organizationId?: string;
}

export interface RedeemGiftCardResponse {
  /** Whether redemption is valid */
  isValid: boolean;
  /** The gift card (if valid) */
  giftCard?: GiftCard;
  /** Amount being applied from gift card */
  amountApplied?: number;
  /** Remaining balance after this use */
  remainingAfter?: number;
  /** Amount still owed after gift card */
  amountOwed?: number;
  /** Error message */
  error?: string;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface GiftCardState {
  /** Input code */
  code: string;
  /** Loading state */
  isValidating: boolean;
  /** Applied gift card */
  appliedGiftCard: GiftCard | null;
  /** Amount applied from gift card */
  amountApplied: number;
  /** Error message */
  error: string | null;
}
