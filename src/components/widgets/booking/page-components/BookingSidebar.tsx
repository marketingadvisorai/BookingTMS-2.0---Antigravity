/**
 * BookingSidebar - Booking summary with adult/child pricing (USD)
 * Supports multi-tier Stripe pricing for adults, children, and custom fields
 */
import React, { useState, useMemo } from 'react';
import { ShoppingCart, Users, Clock, Tag, CreditCard, Minus, Plus, Trash2, Baby, User } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Separator } from '../../../ui/separator';
import { Label } from '../../../ui/label';
import { PromoCodeInput } from '../../PromoCodeInput';
import { GiftCardInput } from '../../GiftCardInput';
import { BookingSidebarProps } from './types';

export function BookingSidebar({
  gameData,
  selectedDate,
  selectedTime,
  participants,
  onParticipantsChange,
  onContinue,
  primaryColor,
  currentDate,
  appliedPromoCode,
  appliedGiftCard,
  onApplyPromoCode,
  onApplyGiftCard,
  onRemovePromoCode,
  onRemoveGiftCard,
  stripePrices
}: BookingSidebarProps) {
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);

  // Get prices from stripePrices or fallback to gameData
  const adultPrice = stripePrices?.adult?.amount || gameData.price || 0;
  const childPrice = stripePrices?.child?.amount || (gameData as any).childPrice || adultPrice;
  const hasChildPricing = childPrice !== adultPrice && childPrice > 0;

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

  // Calculate pricing breakdown
  const pricing = useMemo(() => {
    const adultTotal = adultPrice * participants.adults;
    const childTotal = childPrice * participants.children;
    const subtotal = adultTotal + childTotal;
    
    const promoDiscount = appliedPromoCode
      ? appliedPromoCode.type === 'percentage'
        ? (subtotal * appliedPromoCode.discount) / 100
        : appliedPromoCode.discount
      : 0;
    const giftCardAmount = appliedGiftCard?.amount || 0;
    const total = Math.max(0, subtotal - promoDiscount - giftCardAmount);

    return { adultTotal, childTotal, subtotal, promoDiscount, giftCardAmount, total };
  }, [adultPrice, childPrice, participants, appliedPromoCode, appliedGiftCard]);

  const totalParticipants = participants.adults + participants.children;
  const canContinue = selectedDate && selectedTime && totalParticipants > 0;

  // Participant change handlers
  const updateAdults = (delta: number) => {
    const newCount = Math.max(0, participants.adults + delta);
    onParticipantsChange({ ...participants, adults: newCount });
  };

  const updateChildren = (delta: number) => {
    const newCount = Math.max(0, participants.children + delta);
    onParticipantsChange({ ...participants, children: newCount });
  };

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

          {/* Participants Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Participants</Label>
            
            {/* Adults */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Adults</p>
                  <p className="text-sm text-gray-500">${adultPrice.toFixed(2)} each</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateAdults(-1)}
                  disabled={participants.adults <= 0}
                  className="h-8 w-8 rounded-full"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">{participants.adults}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateAdults(1)}
                  className="h-8 w-8 rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Children (only show if child pricing exists) */}
            {hasChildPricing && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Baby className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Children</p>
                    <p className="text-sm text-gray-500">${childPrice.toFixed(2)} each</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateChildren(-1)}
                    disabled={participants.children <= 0}
                    className="h-8 w-8 rounded-full"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-lg">{participants.children}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateChildren(1)}
                    className="h-8 w-8 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Total Participants */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Users className="w-5 h-5" style={{ color: primaryColor }} />
              <span className="text-lg font-semibold">{totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            {participants.adults > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Adults × {participants.adults}</span>
                <span className="text-gray-900">${pricing.adultTotal.toFixed(2)}</span>
              </div>
            )}
            {hasChildPricing && participants.children > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Children × {participants.children}</span>
                <span className="text-gray-900">${pricing.childTotal.toFixed(2)}</span>
              </div>
            )}
            
            {appliedPromoCode && (
              <div className="flex justify-between text-sm text-green-600">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{appliedPromoCode.code}</span>
                  <button onClick={onRemovePromoCode} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <span>-${pricing.promoDiscount.toFixed(2)}</span>
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
                <span>-${pricing.giftCardAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              ${pricing.total.toFixed(2)}
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
