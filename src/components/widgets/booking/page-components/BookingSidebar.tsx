/**
 * BookingSidebar - Booking summary and party size selection
 */
import React, { useState } from 'react';
import { ShoppingCart, Users, Clock, Tag, CreditCard, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Separator } from '../../../ui/separator';
import { PromoCodeInput } from '../../PromoCodeInput';
import { GiftCardInput } from '../../GiftCardInput';
import { BookingSidebarProps } from './types';

export function BookingSidebar({
  gameData,
  selectedDate,
  selectedTime,
  partySize,
  onPartySizeChange,
  onContinue,
  primaryColor,
  currentDate,
  appliedPromoCode,
  appliedGiftCard,
  onApplyPromoCode,
  onApplyGiftCard,
  onRemovePromoCode,
  onRemoveGiftCard
}: BookingSidebarProps) {
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);

  // Format selected date
  const formattedDate = selectedDate 
    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
        .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null;

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate pricing
  const basePrice = gameData.price * partySize;
  const promoDiscount = appliedPromoCode
    ? appliedPromoCode.type === 'percentage'
      ? (basePrice * appliedPromoCode.discount) / 100
      : appliedPromoCode.discount
    : 0;
  const giftCardAmount = appliedGiftCard?.amount || 0;
  const totalPrice = Math.max(0, basePrice - promoDiscount - giftCardAmount);

  const canContinue = selectedDate && selectedTime && partySize > 0;

  return (
    <div className="lg:sticky lg:top-4">
      <Card 
        className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl border-2 rounded-2xl"
        style={{ borderColor: `${primaryColor}20` }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b-2" style={{ borderColor: `${primaryColor}20` }}>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Booking Summary</h3>
              <p className="text-sm text-gray-500">{gameData.name}</p>
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedDate || selectedTime) && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
              {formattedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{formattedDate}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{formatTime(selectedTime)}</span>
                </div>
              )}
            </div>
          )}

          {/* Party Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Number of Players
            </label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => partySize > 1 && onPartySizeChange(partySize - 1)}
                disabled={partySize <= 1}
                className="h-10 w-10 rounded-full"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" style={{ color: primaryColor }} />
                  <span className="text-2xl font-bold text-gray-900">{partySize}</span>
                </div>
                <span className="text-xs text-gray-500">players</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPartySizeChange(partySize + 1)}
                className="h-10 w-10 rounded-full"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">${gameData.price} × {partySize} players</span>
              <span className="text-gray-900">${basePrice.toFixed(2)}</span>
            </div>
            
            {appliedPromoCode && (
              <div className="flex justify-between text-sm text-green-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{appliedPromoCode.code}</span>
                  <button onClick={onRemovePromoCode} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <span>-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            
            {appliedGiftCard && (
              <div className="flex justify-between text-sm text-blue-600">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Gift Card</span>
                  <button onClick={onRemoveGiftCard} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <span>-${giftCardAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Promo Code Toggle */}
          {!appliedPromoCode && (
            <button
              onClick={() => setShowPromoInput(!showPromoInput)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <Tag className="w-4 h-4" />
              Have a promo code?
            </button>
          )}
          {showPromoInput && !appliedPromoCode && (
            <PromoCodeInput onApply={(code, discount, type) => {
              onApplyPromoCode({ code, discount, type });
              setShowPromoInput(false);
            }} />
          )}

          {/* Gift Card Toggle */}
          {!appliedGiftCard && (
            <button
              onClick={() => setShowGiftCardInput(!showGiftCardInput)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <CreditCard className="w-4 h-4" />
              Have a gift card?
            </button>
          )}
          {showGiftCardInput && !appliedGiftCard && (
            <GiftCardInput onApply={(code, amount) => {
              onApplyGiftCard({ code, amount });
              setShowGiftCardInput(false);
            }} />
          )}

          {/* Continue Button */}
          <Button
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: primaryColor }}
            disabled={!canContinue}
            onClick={onContinue}
          >
            {canContinue ? 'Continue to Checkout' : 'Select date & time'}
          </Button>

          {!canContinue && (
            <p className="text-center text-sm text-gray-500">
              Please select a date and time to continue
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

export default BookingSidebar;
