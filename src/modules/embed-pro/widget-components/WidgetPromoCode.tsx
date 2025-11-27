/**
 * Embed Pro 2.0 - Widget Promo Code Component
 * @module embed-pro/widget-components/WidgetPromoCode
 * 
 * Promo code input with validation and discount display.
 * Mobile-optimized with 44px touch targets.
 */

import React, { useState } from 'react';
import { Tag, Loader2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { PromoCode } from '../types/promo.types';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetPromoCodeProps {
  /** Current promo code input */
  code: string;
  /** Set promo code input */
  onCodeChange: (code: string) => void;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Applied promo (if any) */
  appliedPromo: PromoCode | null;
  /** Discount amount in cents */
  discountAmount: number;
  /** Error message */
  error: string | null;
  /** Apply the promo code */
  onApply: () => void;
  /** Remove the promo code */
  onRemove: () => void;
  /** Clear error */
  onClearError: () => void;
  /** Widget style */
  style: WidgetStyle;
  /** Format amount helper */
  formatAmount: (cents: number) => string;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetPromoCode: React.FC<WidgetPromoCodeProps> = ({
  code,
  onCodeChange,
  isValidating,
  appliedPromo,
  discountAmount,
  error,
  onApply,
  onRemove,
  onClearError,
  style,
  formatAmount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCodeChange(e.target.value.toUpperCase());
    if (error) onClearError();
  };

  return (
    <div className="border-t border-gray-100 pt-3 mt-3">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="promo-code-panel"
      >
        <span className="flex items-center gap-2">
          <Tag className="w-4 h-4" aria-hidden="true" />
          {appliedPromo ? 'Promo code applied' : 'Have a promo code?'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        )}
      </button>

      {/* Expandable Panel */}
      <div
        id="promo-code-panel"
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Applied Promo Display */}
        {appliedPromo ? (
          <div 
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: `${style.primaryColor}10` }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${style.primaryColor}20` }}
              >
                <Check className="w-4 h-4" style={{ color: style.primaryColor }} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{appliedPromo.code}</p>
                <p className="text-xs text-gray-500">
                  {appliedPromo.description || `Save ${formatAmount(discountAmount)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span 
                className="font-bold text-sm"
                style={{ color: style.primaryColor }}
              >
                -{formatAmount(discountAmount)}
              </span>
              <button
                type="button"
                onClick={onRemove}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Remove promo code"
              >
                <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          /* Promo Code Input Form */
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="Enter code"
                className={`w-full min-h-[44px] px-3 py-2 border rounded-xl text-sm uppercase
                  ${error ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  placeholder:normal-case placeholder:text-gray-400`}
                style={{ ['--tw-ring-color' as any]: style.primaryColor }}
                aria-label="Promo code"
                aria-invalid={!!error}
                aria-describedby={error ? 'promo-error' : undefined}
                disabled={isValidating}
              />
            </div>
            <button
              type="submit"
              disabled={isValidating || !code.trim()}
              className="min-h-[44px] px-4 rounded-xl font-medium text-white transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-md active:scale-[0.98]"
              style={{ backgroundColor: style.primaryColor }}
              aria-label="Apply promo code"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                'Apply'
              )}
            </button>
          </form>
        )}

        {/* Error Message */}
        {error && !appliedPromo && (
          <p 
            id="promo-error"
            className="text-red-500 text-xs mt-2 flex items-center gap-1"
            role="alert"
          >
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Demo Codes Hint (for testing) */}
        {!appliedPromo && !error && (
          <p className="text-gray-400 text-[10px] mt-2 text-center">
            Try: WELCOME10, SAVE20, FLAT25
          </p>
        )}
      </div>
    </div>
  );
};

export default WidgetPromoCode;
