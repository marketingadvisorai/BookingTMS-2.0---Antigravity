/**
 * Embed Pro 2.0 - Preview Checkout Simulation
 * @module embed-pro/widget-components/WidgetPreviewCheckout
 * 
 * Simulates Stripe checkout experience in preview mode.
 * Shows a mock payment form to demonstrate the full booking flow.
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Lock, 
  Check, 
  Loader2,
  ShieldCheck,
  Calendar,
  Users,
} from 'lucide-react';
import type { WidgetStyle, WidgetActivity } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetPreviewCheckoutProps {
  activity: WidgetActivity;
  selectedDate: Date;
  selectedTime: string;
  partySize: number;
  childCount: number;
  customerName: string;
  style: WidgetStyle;
  onComplete: () => void;
  onBack: () => void;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetPreviewCheckout: React.FC<WidgetPreviewCheckoutProps> = ({
  activity,
  selectedDate,
  selectedTime,
  partySize,
  childCount,
  customerName,
  style,
  onComplete,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  // Calculate total
  const adultTotal = partySize * activity.price;
  const childTotal = childCount * (activity.childPrice || activity.price);
  const total = adultTotal + childTotal;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: activity.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Simulate payment processing
  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('processing');
    
    // Simulate 2 second processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('success');
    
    // Wait 1 second then complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete();
  };

  if (step === 'processing') {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-blue-50">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: style.primaryColor }} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-sm text-gray-500">Please wait while we process your payment...</p>
        <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
          Preview Mode: Simulating Stripe checkout
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="p-6 text-center">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${style.primaryColor}15` }}
        >
          <Check className="w-8 h-8" style={{ color: style.primaryColor }} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-sm text-gray-500">Redirecting to confirmation...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${style.primaryColor}15` }}
        >
          <CreditCard className="w-5 h-5" style={{ color: style.primaryColor }} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Complete Payment</h3>
          <p className="text-xs text-gray-500">Secure checkout powered by Stripe</p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{activity.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(selectedDate)} at {selectedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span>{partySize + childCount} guest{partySize + childCount > 1 ? 's' : ''}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            {partySize > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Adults × {partySize}</span>
                <span>{formatPrice(adultTotal)}</span>
              </div>
            )}
            {childCount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Children × {childCount}</span>
                <span>{formatPrice(childTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
              <span>Total</span>
              <span style={{ color: style.primaryColor }}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Card Form */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
              placeholder="4242 4242 4242 4242"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Test card: 4242 4242 4242 4242</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Expiry</label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
              placeholder="123"
            />
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-gray-400">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe</span>
        <ShieldCheck className="w-3 h-3 ml-2" />
        <span>256-bit encryption</span>
      </div>

      {/* Preview Notice */}
      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
        <p className="text-xs text-amber-700">
          <strong>Preview Mode:</strong> This simulates the Stripe checkout experience. No real charges will be made.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-medium
                     text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-[2] py-3 px-4 rounded-xl font-semibold text-white
                     transition-all flex items-center justify-center gap-2
                     hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-60"
          style={{ backgroundColor: style.primaryColor }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay {formatPrice(total)}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default WidgetPreviewCheckout;
