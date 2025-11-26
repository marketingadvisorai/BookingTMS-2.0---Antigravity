/**
 * Stripe Checkout Page
 * 
 * A secure, modern checkout page using Stripe Checkout Sessions.
 * Collects customer info and redirects to Stripe's hosted checkout.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  Lock, CreditCard, Shield, Calendar, Clock, Users,
  MapPin, ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  Mail, Phone, User, ArrowRight, Sparkles
} from 'lucide-react';
import { CheckoutService } from '../../lib/payments/checkoutService';
// cn utility - conditional classnames
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface BookingDetails {
  activityId: string;
  activityName: string;
  activityImage?: string;
  venueName: string;
  venueAddress?: string;
  date: string;
  time: string;
  duration: number;
  partySize: number;
  pricePerPerson: number;
  stripePriceId?: string;
  promoCode?: string;
  promoDiscount?: number;
  giftCardCode?: string;
  giftCardCredit?: number;
}

interface StripeCheckoutPageProps {
  booking: BookingDetails;
  primaryColor?: string;
  onBack?: () => void;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
  theme?: 'light' | 'dark';
}

export function StripeCheckoutPage({
  booking,
  primaryColor = '#2563eb',
  onBack,
  onSuccess,
  onCancel,
  theme = 'light'
}: StripeCheckoutPageProps) {
  const isDark = theme === 'dark';
  
  // Customer form state
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Calculate pricing
  const subtotal = booking.pricePerPerson * booking.partySize;
  const promoDiscount = booking.promoDiscount || 0;
  const giftCardCredit = booking.giftCardCredit || 0;
  const tax = Math.round((subtotal - promoDiscount) * 0.08); // 8% tax
  const total = Math.max(0, subtotal - promoDiscount - giftCardCredit + tax);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!customerData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!customerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!customerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-+()]{10,}$/.test(customerData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setCheckoutError(null);
    
    try {
      // Build success/cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.activityId}`;
      const cancelUrl = `${baseUrl}/booking/cancel?activity_id=${booking.activityId}`;
      
      // Create metadata for the booking
      const metadata = {
        activity_id: booking.activityId,
        activity_name: booking.activityName,
        venue_name: booking.venueName,
        booking_date: booking.date,
        booking_time: booking.time,
        party_size: String(booking.partySize),
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        promo_code: booking.promoCode || '',
        gift_card: booking.giftCardCode || '',
      };
      
      // If we have a Stripe Price ID, use it
      if (booking.stripePriceId) {
        const response = await CheckoutService.createCheckoutSession({
          priceId: booking.stripePriceId,
          quantity: booking.partySize,
          customerEmail: customerData.email,
          customerName: customerData.name,
          successUrl,
          cancelUrl,
          metadata,
        });
        
        // Redirect to Stripe Checkout
        if (response.url) {
          window.location.href = response.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } else {
        // Create payment link for dynamic pricing
        const response = await CheckoutService.createPaymentLink({
          priceId: 'price_dynamic', // Will be handled by edge function
          quantity: booking.partySize,
          metadata,
        });
        
        if (response.url) {
          window.location.href = response.url;
        } else {
          throw new Error('No payment link URL returned');
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = customerData.name && customerData.email && customerData.phone;

  return (
    <div className={cn(
      "min-h-screen",
      isDark ? "bg-[#0a0a0a]" : "bg-gray-50"
    )}>
      {/* Header */}
      <div className={cn(
        "border-b sticky top-0 z-10",
        isDark ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200"
      )}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className={isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-500" />
            <span className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
              Secure Checkout
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side - Customer Info */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-8">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                1
              </div>
              <div className="flex-1 h-1 rounded" style={{ backgroundColor: `${primaryColor}30` }}>
                <div className="h-full w-1/2 rounded" style={{ backgroundColor: primaryColor }} />
              </div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                isDark ? "bg-[#2a2a2a] text-gray-500" : "bg-gray-200 text-gray-500"
              )}>
                2
              </div>
            </div>

            {/* Customer Information Card */}
            <Card className={cn(
              "shadow-lg",
              isDark ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200"
            )}>
              <CardHeader>
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  <User className="w-5 h-5" style={{ color: primaryColor }} />
                  Contact Information
                </CardTitle>
                <CardDescription className={isDark ? "text-gray-400" : "text-gray-600"}>
                  We'll send your booking confirmation to this email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      placeholder="John Doe"
                      className={cn(
                        "pl-10 h-12",
                        isDark ? "bg-[#0a0a0a] border-[#2a2a2a] text-white" : "",
                        errors.name && "border-red-500"
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      placeholder="john@example.com"
                      className={cn(
                        "pl-10 h-12",
                        isDark ? "bg-[#0a0a0a] border-[#2a2a2a] text-white" : "",
                        errors.email && "border-red-500"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? "text-gray-300" : "text-gray-700"}>
                    Phone Number *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className={cn(
                        "pl-10 h-12",
                        isDark ? "bg-[#0a0a0a] border-[#2a2a2a] text-white" : "",
                        errors.phone && "border-red-500"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className={cn(
              "flex items-start gap-3 p-4 rounded-lg",
              isDark ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
            )}>
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-green-400" : "text-green-800")}>
                  Secure Payment with Stripe
                </p>
                <p className={cn("text-xs mt-1", isDark ? "text-green-400/70" : "text-green-700")}>
                  Your payment is processed securely through Stripe. We never store your card details.
                </p>
              </div>
            </div>

            {checkoutError && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Checkout Error</p>
                  <p className="text-xs mt-1 text-red-700">{checkoutError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <Card className={cn(
                "shadow-lg",
                isDark ? "bg-[#161616] border-[#2a2a2a]" : "bg-white border-gray-200"
              )}>
                <CardHeader className="pb-4">
                  <CardTitle className={cn(
                    "text-lg",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Activity Info */}
                  <div className="flex gap-4">
                    {booking.activityImage && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={booking.activityImage} 
                          alt={booking.activityName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-semibold",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {booking.activityName}
                      </h3>
                      <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        {booking.venueName}
                      </p>
                    </div>
                  </div>

                  <Separator className={isDark ? "bg-[#2a2a2a]" : ""} />

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                        <Calendar className="w-4 h-4" />
                        Date
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {booking.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                        <Clock className="w-4 h-4" />
                        Time
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {booking.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                        <Users className="w-4 h-4" />
                        Guests
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {booking.partySize} people
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                        <Clock className="w-4 h-4" />
                        Duration
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {booking.duration} minutes
                      </span>
                    </div>
                  </div>

                  <Separator className={isDark ? "bg-[#2a2a2a]" : ""} />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        ${booking.pricePerPerson} × {booking.partySize} guests
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Promo ({booking.promoCode})
                        </span>
                        <span className="text-green-500">-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {giftCardCredit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-500">Gift Card</span>
                        <span className="text-blue-500">-${giftCardCredit.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>Tax</span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator className={isDark ? "bg-[#2a2a2a]" : ""} />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      Total
                    </span>
                    <span 
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={!canProceed || isLoading}
                    className="w-full h-14 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                    style={{ 
                      backgroundColor: canProceed && !isLoading ? primaryColor : undefined,
                      opacity: canProceed && !isLoading ? 1 : 0.5
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Redirecting to Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Proceed to Payment
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Payment Methods */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/visa.svg" alt="Visa" className="h-6" />
                    <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/mastercard.svg" alt="Mastercard" className="h-6" />
                    <img src="https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/amex.svg" alt="Amex" className="h-6" />
                    <span className={cn("text-xs ml-2", isDark ? "text-gray-500" : "text-gray-400")}>
                      Powered by Stripe
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StripeCheckoutPage;
