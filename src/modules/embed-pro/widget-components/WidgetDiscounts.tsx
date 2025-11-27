/**
 * Embed Pro 2.0 - Widget Discounts Component
 * @module embed-pro/widget-components/WidgetDiscounts
 * 
 * Combined Promo Code and Gift Card input section.
 * Shows savings summary when discounts are applied.
 */

import React from 'react';
import { Percent } from 'lucide-react';
import { WidgetPromoCode } from './WidgetPromoCode';
import { WidgetGiftCard } from './WidgetGiftCard';
import type { PromoCode } from '../types/promo.types';
import type { GiftCard } from '../types/giftcard.types';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetDiscountsProps {
  // Promo Code Props
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  isPromoValidating: boolean;
  appliedPromo: PromoCode | null;
  promoDiscountAmount: number;
  promoError: string | null;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
  onClearPromoError: () => void;

  // Gift Card Props
  giftCardCode: string;
  onGiftCardCodeChange: (code: string) => void;
  isGiftCardValidating: boolean;
  appliedGiftCard: GiftCard | null;
  giftCardAmountApplied: number;
  giftCardRemainingAfter: number;
  giftCardError: string | null;
  onApplyGiftCard: () => void;
  onRemoveGiftCard: () => void;
  onClearGiftCardError: () => void;

  // Common Props
  style: WidgetStyle;
  subtotal: number;
  formatAmount: (cents: number) => string;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetDiscounts: React.FC<WidgetDiscountsProps> = ({
  // Promo
  promoCode,
  onPromoCodeChange,
  isPromoValidating,
  appliedPromo,
  promoDiscountAmount,
  promoError,
  onApplyPromo,
  onRemovePromo,
  onClearPromoError,
  // Gift Card
  giftCardCode,
  onGiftCardCodeChange,
  isGiftCardValidating,
  appliedGiftCard,
  giftCardAmountApplied,
  giftCardRemainingAfter,
  giftCardError,
  onApplyGiftCard,
  onRemoveGiftCard,
  onClearGiftCardError,
  // Common
  style,
  subtotal,
  formatAmount,
}) => {
  const hasDiscounts = appliedPromo || appliedGiftCard;
  const totalDiscount = promoDiscountAmount + giftCardAmountApplied;
  const finalAmount = Math.max(0, subtotal - totalDiscount);

  return (
    <div className="px-4 pb-2">
      {/* Subtotal */}
      <div className="flex justify-between items-center py-2 text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-800">{formatAmount(subtotal)}</span>
      </div>

      {/* Promo Code Section */}
      <WidgetPromoCode
        code={promoCode}
        onCodeChange={onPromoCodeChange}
        isValidating={isPromoValidating}
        appliedPromo={appliedPromo}
        discountAmount={promoDiscountAmount}
        error={promoError}
        onApply={onApplyPromo}
        onRemove={onRemovePromo}
        onClearError={onClearPromoError}
        style={style}
        formatAmount={formatAmount}
      />

      {/* Gift Card Section */}
      <WidgetGiftCard
        code={giftCardCode}
        onCodeChange={onGiftCardCodeChange}
        isValidating={isGiftCardValidating}
        appliedGiftCard={appliedGiftCard}
        amountApplied={giftCardAmountApplied}
        remainingAfter={giftCardRemainingAfter}
        error={giftCardError}
        onApply={onApplyGiftCard}
        onRemove={onRemoveGiftCard}
        onClearError={onClearGiftCardError}
        style={style}
        formatAmount={formatAmount}
      />

      {/* Total Savings Summary */}
      {hasDiscounts && (
        <div 
          className="mt-3 p-3 rounded-xl"
          style={{ backgroundColor: `${style.primaryColor}08` }}
        >
          {/* Savings Line */}
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="flex items-center gap-1.5 text-gray-600">
              <Percent className="w-3.5 h-3.5" style={{ color: style.primaryColor }} />
              Total Savings
            </span>
            <span className="font-bold" style={{ color: style.primaryColor }}>
              -{formatAmount(totalDiscount)}
            </span>
          </div>

          {/* Final Total */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-800">Total Due</span>
            <span className="text-lg font-bold text-gray-900">
              {formatAmount(finalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetDiscounts;
