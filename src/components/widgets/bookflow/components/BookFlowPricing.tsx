/**
 * BookFlow Widget - Pricing Summary Component
 * @module widgets/bookflow/components/BookFlowPricing
 */

import React from 'react';
import { Tag, Gift, ChevronRight } from 'lucide-react';
import type { BookFlowActivity } from '../types';

interface BookFlowPricingProps {
  activity: BookFlowActivity;
  playerCount: number;
  childCount: number;
  promoCode?: string | null;
  discountAmount?: number;
  onCheckout: () => void;
  primaryColor?: string;
  buttonText?: string;
  disabled?: boolean;
}

export const BookFlowPricing: React.FC<BookFlowPricingProps> = ({
  activity,
  playerCount,
  childCount,
  promoCode,
  discountAmount = 0,
  onCheckout,
  primaryColor = '#3B82F6',
  buttonText = 'Continue to Checkout',
  disabled = false,
}) => {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: activity.currency || 'USD',
    }).format(amount);
  };

  const adultTotal = playerCount * activity.price;
  const childTotal = childCount * (activity.childPrice || 0);
  const subtotal = adultTotal + childTotal;
  const total = subtotal - discountAmount;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
      <h4 className="font-medium text-gray-900 dark:text-white">Price Summary</h4>

      <div className="space-y-2 text-sm">
        {/* Adults */}
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            {playerCount} × Adults @ {formatPrice(activity.price)}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(adultTotal)}
          </span>
        </div>

        {/* Children */}
        {childCount > 0 && activity.childPrice && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {childCount} × Children @ {formatPrice(activity.childPrice)}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatPrice(childTotal)}
            </span>
          </div>
        )}

        {/* Promo discount */}
        {promoCode && discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Promo: {promoCode}
            </span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span style={{ color: primaryColor }}>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={disabled}
        className="w-full py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: primaryColor }}
      >
        {buttonText}
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Gift className="w-3 h-3" />
          Gift cards accepted
        </span>
        <span>•</span>
        <span>Secure checkout</span>
      </div>
    </div>
  );
};

export default BookFlowPricing;
