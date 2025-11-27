/**
 * Embed Pro 2.0 - Widget Gift Card Component
 * @module embed-pro/widget-components/WidgetGiftCard
 * 
 * Gift card input with validation and balance display.
 * Supports partial and full redemption.
 */

import React, { useState } from 'react';
import { Gift, Loader2, X, Check, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import type { GiftCard } from '../types/giftcard.types';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetGiftCardProps {
  /** Current gift card code input */
  code: string;
  /** Set code input */
  onCodeChange: (code: string) => void;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Applied gift card (if any) */
  appliedGiftCard: GiftCard | null;
  /** Amount applied from gift card */
  amountApplied: number;
  /** Remaining balance after use */
  remainingAfter: number;
  /** Error message */
  error: string | null;
  /** Apply the gift card */
  onApply: () => void;
  /** Remove the gift card */
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

export const WidgetGiftCard: React.FC<WidgetGiftCardProps> = ({
  code,
  onCodeChange,
  isValidating,
  appliedGiftCard,
  amountApplied,
  remainingAfter,
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

  // Handle input change with formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    onCodeChange(value);
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
        aria-controls="giftcard-panel"
      >
        <span className="flex items-center gap-2">
          <Gift className="w-4 h-4" aria-hidden="true" />
          {appliedGiftCard ? 'Gift card applied' : 'Have a gift card?'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4" aria-hidden="true" />
        )}
      </button>

      {/* Expandable Panel */}
      <div
        id="giftcard-panel"
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        {/* Applied Gift Card Display */}
        {appliedGiftCard ? (
          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {appliedGiftCard.code}
                  </p>
                  <p className="text-xs text-gray-500">Gift Card</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white hover:bg-gray-100 transition-colors border border-gray-200"
                aria-label="Remove gift card"
              >
                <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>

            {/* Balance Info */}
            <div className="flex justify-between text-sm pt-2 border-t border-purple-200">
              <div>
                <p className="text-gray-500">Applied</p>
                <p className="font-bold text-purple-600">
                  -{formatAmount(amountApplied)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Remaining</p>
                <p className="font-medium text-gray-700">
                  {formatAmount(remainingAfter)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Gift Card Input Form */
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="GC-XXXX-XXXX"
                maxLength={14}
                className={`w-full min-h-[44px] px-3 py-2 border rounded-xl text-sm font-mono
                  ${error ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  placeholder:text-gray-400`}
                style={{ ['--tw-ring-color' as string]: style.primaryColor }}
                aria-label="Gift card code"
                aria-invalid={!!error}
                aria-describedby={error ? 'giftcard-error' : undefined}
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
              aria-label="Apply gift card"
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
        {error && !appliedGiftCard && (
          <p
            id="giftcard-error"
            className="text-red-500 text-xs mt-2 flex items-center gap-1"
            role="alert"
          >
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Demo Codes Hint */}
        {!appliedGiftCard && !error && (
          <p className="text-gray-400 text-[10px] mt-2 text-center">
            Try: GC-DEMO-1000 ($100), GC-DEMO-5000 ($50)
          </p>
        )}
      </div>
    </div>
  );
};

export default WidgetGiftCard;
