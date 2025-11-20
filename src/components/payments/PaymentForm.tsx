import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { Loader2, CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  bookingId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ 
  amount, 
  currency = 'USD', 
  bookingId, 
  onSuccess,
  onCancel 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?booking_id=${bookingId}`,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
      } else {
        // Payment succeeded - redirect will happen automatically
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(amount)}
            </p>
          </div>

          {/* Payment Element */}
          <div className="space-y-4">
            <PaymentElement 
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Lock className="w-4 h-4" />
            <span>Secured by Stripe. Your payment information is encrypted.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency,
                  }).format(amount)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
