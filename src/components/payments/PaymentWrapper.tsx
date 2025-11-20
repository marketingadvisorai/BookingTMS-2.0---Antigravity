import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';
import { PaymentService } from '../../lib/payments/paymentService';
import { Card, CardContent } from '../ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentWrapperProps {
  bookingId: string;
  amount: number;
  currency?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PaymentWrapper({ 
  bookingId, 
  amount, 
  currency = 'USD',
  onSuccess,
  onCancel 
}: PaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    createPaymentIntent();
  }, [bookingId, amount]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await PaymentService.createPaymentIntent({
        bookingId,
        amount,
        currency: currency.toLowerCase(),
      });

      if (response.success && response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        throw new Error(response.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-[#2a2a2a]">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Initializing payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
          <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={createPaymentIntent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4f46e5',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm 
        amount={amount}
        currency={currency}
        bookingId={bookingId}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}
