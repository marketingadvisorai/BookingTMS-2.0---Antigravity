/**
 * BookingCheckout - Customer information form and payment
 */
import React from 'react';
import { User, Mail, Phone, Lock, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Separator } from '../../../ui/separator';
import { BookingCheckoutProps } from './types';

export function BookingCheckout({
  gameData,
  selectedDate,
  selectedTime,
  partySize,
  customerData,
  onCustomerDataChange,
  onSubmit,
  onBack,
  primaryColor,
  isSubmitting,
  currentDate,
  totalAmount
}: BookingCheckoutProps) {
  // Format selected date
  const formattedDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedDate
  ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const isFormValid = customerData.name && customerData.email && customerData.phone;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8 bg-white shadow-lg rounded-2xl">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Information</h2>
                <p className="text-sm text-gray-500">Complete your booking details</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={customerData.name}
                  onChange={(e) => onCustomerDataChange({ name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-12"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => onCustomerDataChange({ email: e.target.value })}
                  placeholder="you@example.com"
                  className="h-12"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => onCustomerDataChange({ phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="h-12"
                  required
                />
              </div>

              <Separator />

              {/* Security Note */}
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Secure Payment</p>
                  <p className="text-xs text-green-600">
                    Your payment will be processed securely via Stripe. We never store your card details.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: primaryColor }}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${totalAmount.toFixed(2)}`
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-gray-50 rounded-2xl sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900">{gameData.name}</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
                <p className="text-sm text-gray-500">{formatTime(selectedTime)}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">${gameData.price} × {partySize} players</span>
                  <span className="text-gray-900">${(gameData.price * partySize).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BookingCheckout;
