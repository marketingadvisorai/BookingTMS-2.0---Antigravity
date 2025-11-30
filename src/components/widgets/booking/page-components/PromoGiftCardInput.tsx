/**
 * PromoGiftCardInput - Discount code and gift card input for booking widget
 * @description Allows customers to enter promo codes and gift card codes during checkout
 */
import React, { useState } from 'react';
import { Tag, Gift, Check, X, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { cn } from '@/lib/utils';
import type { PromoCode, GiftCard } from './types';

interface PromoGiftCardInputProps {
  organizationId: string;
  subtotal: number;
  appliedPromoCode: PromoCode | null;
  appliedGiftCard: GiftCard | null;
  onApplyPromoCode: (code: PromoCode) => void;
  onApplyGiftCard: (card: GiftCard) => void;
  onRemovePromoCode: () => void;
  onRemoveGiftCard: () => void;
  primaryColor: string;
}

interface ValidationResult {
  valid: boolean;
  type?: 'promo' | 'gift_card';
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  balance?: number;
  message?: string;
  code?: string;
}

/**
 * Validate discount code against backend
 */
async function validateDiscountCode(
  organizationId: string,
  code: string,
  subtotal: number
): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/validate-discount-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, code: code.toUpperCase(), subtotal }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { valid: false, message: errorData.error || 'Invalid code' };
    }

    return await response.json();
  } catch (error) {
    // Fallback: Try Supabase direct validation if API not available
    return validateCodeDirectly(organizationId, code, subtotal);
  }
}

/**
 * Direct validation via Supabase (fallback)
 */
async function validateCodeDirectly(
  organizationId: string,
  code: string,
  subtotal: number
): Promise<ValidationResult> {
  const { supabase } = await import('@/lib/supabase');
  const upperCode = code.toUpperCase();

  // Check promotions first
  const { data: promo } = await supabase
    .from('promotions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('code', upperCode)
    .eq('is_active', true)
    .single();

  if (promo) {
    const now = new Date();
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return { valid: false, message: 'This promo code has expired' };
    }
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return { valid: false, message: 'This promo code is not yet active' };
    }
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return { valid: false, message: 'This promo code has reached its usage limit' };
    }
    if (promo.minimum_order_value && subtotal < promo.minimum_order_value) {
      return { 
        valid: false, 
        message: `Minimum order of $${promo.minimum_order_value.toFixed(2)} required` 
      };
    }

    const discount = promo.discount_type === 'percentage'
      ? (subtotal * promo.discount_value) / 100
      : promo.discount_value;

    return {
      valid: true,
      type: 'promo',
      discount,
      discountType: promo.discount_type,
      code: promo.code,
      message: `${promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`} off applied!`,
    };
  }

  // Check gift cards
  const { data: giftCard } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('code', upperCode)
    .eq('is_active', true)
    .single();

  if (giftCard) {
    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return { valid: false, message: 'This gift card has expired' };
    }
    if (giftCard.current_balance <= 0) {
      return { valid: false, message: 'This gift card has no remaining balance' };
    }

    const amount = Math.min(giftCard.current_balance, subtotal);
    return {
      valid: true,
      type: 'gift_card',
      balance: giftCard.current_balance,
      discount: amount,
      code: giftCard.code,
      message: `Gift card balance: $${giftCard.current_balance.toFixed(2)}`,
    };
  }

  return { valid: false, message: 'Invalid code. Please check and try again.' };
}

export function PromoGiftCardInput({
  organizationId,
  subtotal,
  appliedPromoCode,
  appliedGiftCard,
  onApplyPromoCode,
  onApplyGiftCard,
  onRemovePromoCode,
  onRemoveGiftCard,
  primaryColor,
}: PromoGiftCardInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateDiscountCode(organizationId, code.trim(), subtotal);

      if (!result.valid) {
        setError(result.message || 'Invalid code');
        return;
      }

      if (result.type === 'promo') {
        onApplyPromoCode({
          code: result.code || code.toUpperCase(),
          discount: result.discount || 0,
          type: result.discountType || 'fixed',
        });
      } else if (result.type === 'gift_card') {
        onApplyGiftCard({
          code: result.code || code.toUpperCase(),
          amount: result.discount || 0,
        });
      }

      setCode('');
    } catch (err) {
      setError('Failed to validate code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  const hasAppliedDiscount = appliedPromoCode || appliedGiftCard;

  return (
    <div className="space-y-3">
      {/* Applied discounts display */}
      {appliedPromoCode && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{appliedPromoCode.code}</p>
              <p className="text-xs text-green-600">
                {appliedPromoCode.type === 'percentage' 
                  ? `${appliedPromoCode.discount}% off`
                  : `-$${appliedPromoCode.discount.toFixed(2)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onRemovePromoCode}
            className="p-1 hover:bg-green-100 rounded-full transition-colors"
            aria-label="Remove promo code"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {appliedGiftCard && (
        <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800">{appliedGiftCard.code}</p>
              <p className="text-xs text-purple-600">
                -${appliedGiftCard.amount.toFixed(2)} applied
              </p>
            </div>
          </div>
          <button
            onClick={onRemoveGiftCard}
            className="p-1 hover:bg-purple-100 rounded-full transition-colors"
            aria-label="Remove gift card"
          >
            <X className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      )}

      {/* Input field */}
      {(!appliedPromoCode || !appliedGiftCard) && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={appliedPromoCode ? "Enter gift card code" : "Promo or gift card code"}
                className={cn(
                  "h-10 pr-10",
                  error && "border-red-500 focus-visible:ring-red-500"
                )}
                disabled={isValidating}
              />
              {appliedPromoCode ? (
                <Gift className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              ) : (
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
            </div>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!code.trim() || isValidating}
              className="h-10 px-4"
              style={{ backgroundColor: primaryColor }}
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      )}

      {/* Total savings display */}
      {hasAppliedDiscount && (
        <div className="text-right text-sm">
          <span className="text-gray-500">Total savings: </span>
          <span className="font-semibold text-green-600">
            ${((appliedPromoCode?.discount || 0) + (appliedGiftCard?.amount || 0)).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

export default PromoGiftCardInput;
