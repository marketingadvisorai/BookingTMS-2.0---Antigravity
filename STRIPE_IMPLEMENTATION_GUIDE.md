# Stripe Payment Implementation Guide
## Step-by-Step Integration with Stripe MCP

**Version:** 1.0.0  
**Date:** November 9, 2025

---

## Prerequisites

- ✅ Supabase project set up
- ✅ Stripe account (will create)
- ✅ Stripe MCP server available
- ✅ Email system configured

---

## Step 1: Create Stripe Account

1. **Sign up:** https://dashboard.stripe.com/register
2. **Verify email**
3. **Complete business profile**
4. **Get API keys:**
   - Test mode: `sk_test_...` and `pk_test_...`
   - Live mode: `sk_live_...` and `pk_live_...`

---

## Step 2: Set Up Stripe MCP

### Available Stripe MCP Tools

```typescript
// Customer Management
mcp3_create_customer({ name, email })
mcp3_list_customers({ limit, email })

// Product & Pricing
mcp3_create_product({ name, description })
mcp3_create_price({ product, unit_amount, currency })
mcp3_list_products({ limit })
mcp3_list_prices({ product, limit })

// Payment Processing
mcp3_list_payment_intents({ customer, limit })
mcp3_create_refund({ payment_intent, amount })

// Subscriptions
mcp3_list_subscriptions({ customer, status, limit })
mcp3_update_subscription({ subscription, items })
mcp3_cancel_subscription({ subscription })

// Coupons
mcp3_create_coupon({ name, percent_off, amount_off, duration })
mcp3_list_coupons({ limit })

// Payment Links
mcp3_create_payment_link({ price, quantity, redirect_url })

// Invoices
mcp3_create_invoice({ customer, days_until_due })
mcp3_create_invoice_item({ customer, price, invoice })
mcp3_finalize_invoice({ invoice })
mcp3_list_invoices({ customer, limit })

// Disputes
mcp3_list_disputes({ charge, payment_intent, limit })
mcp3_update_dispute({ dispute, evidence, submit })
```

---

## Step 3: Database Setup

Run these migrations in Supabase SQL Editor:

### Migration 1: Core Payment Tables

```sql
-- File: supabase/migrations/create_payment_tables.sql

-- 1. Add Stripe customer ID to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_method_type VARCHAR(50),
  
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  CONSTRAINT valid_payment_status CHECK (status IN (
    'pending', 'processing', 'succeeded', 
    'failed', 'canceled', 'refunded', 'partially_refunded'
  ))
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

-- 3. Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  
  stripe_refund_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  reason VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_refund_status CHECK (status IN (
    'pending', 'succeeded', 'failed', 'canceled'
  ))
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_stripe_id ON refunds(stripe_refund_id);

-- 4. Add payment fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(3) DEFAULT 'USD';

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
```

---

## Step 4: Create Stripe Products & Prices

Use Stripe MCP to create products for your escape rooms:

```typescript
// Example: Create products for each game
const games = await DataSyncService.getAllGames();

for (const game of games) {
  // Create product in Stripe
  const product = await mcp3_create_product({
    name: game.name,
    description: game.description
  });
  
  // Create price for the product
  const price = await mcp3_create_price({
    product: product.id,
    unit_amount: Math.round(game.price * 100), // Convert to cents
    currency: 'usd'
  });
  
  // Save Stripe IDs to game
  await supabase
    .from('games')
    .update({
      stripe_product_id: product.id,
      stripe_price_id: price.id
    })
    .eq('id', game.id);
}
```

---

## Step 5: Frontend Payment Component

### Install Stripe.js

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Create Payment Form Component

```typescript
// src/components/payments/PaymentForm.tsx

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface PaymentFormProps {
  amount: number;
  bookingId: string;
  onSuccess: () => void;
}

export function PaymentForm({ amount, bookingId, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?booking_id=${bookingId}`,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
        <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
      </div>

      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}
```

### Wrap with Stripe Provider

```typescript
// src/components/payments/PaymentWrapper.tsx

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from './PaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function PaymentWrapper({ clientSecret, amount, bookingId, onSuccess }) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm 
        amount={amount}
        bookingId={bookingId}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
```

---

## Step 6: Create Supabase Edge Functions

### Function 1: create-payment-intent

```bash
supabase functions new create-payment-intent
```

```typescript
// supabase/functions/create-payment-intent/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { bookingId, amount, currency = 'usd' } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get booking with customer
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      throw new Error('Booking not found')
    }

    // Create or get Stripe customer
    let stripeCustomerId = booking.customer.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: booking.customer.email,
        name: `${booking.customer.first_name} ${booking.customer.last_name}`,
        metadata: {
          supabase_customer_id: booking.customer.id
        }
      })

      stripeCustomerId = customer.id

      // Update customer with Stripe ID
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', booking.customer.id)
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      metadata: {
        booking_id: bookingId,
        customer_id: booking.customer.id
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update booking with payment info
    await supabase
      .from('bookings')
      .update({
        payment_amount: amount,
        payment_currency: currency,
        payment_status: 'pending'
      })
      .eq('id', bookingId)

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
```

### Deploy Function

```bash
supabase functions deploy create-payment-intent
```

---

## Step 7: Webhook Handler

### Create Webhook Endpoint

```bash
supabase functions new stripe-webhook
```

```typescript
// supabase/functions/stripe-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Create payment record
      await supabase.from('payments').insert({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: paymentIntent.latest_charge,
        booking_id: paymentIntent.metadata.booking_id,
        customer_id: paymentIntent.metadata.customer_id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'succeeded',
        paid_at: new Date().toISOString()
      })

      // Update booking
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('id', paymentIntent.metadata.booking_id)

      // TODO: Send confirmation email
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break

    case 'charge.refunded':
      // Handle refund
      break
  }

  return new Response(JSON.stringify({ received: true }))
})
```

### Configure Webhook in Stripe

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook signing secret
5. Add to Supabase secrets: `STRIPE_WEBHOOK_SECRET`

---

## Step 8: Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Flow

1. Create a booking
2. Initiate payment
3. Use test card
4. Verify webhook received
5. Check database updated
6. Confirm email sent

---

## Step 9: Go Live

1. **Switch to live keys**
2. **Update webhook endpoint**
3. **Test with real card (small amount)**
4. **Monitor first transactions**
5. **Set up alerts**

---

**Status:** Ready for Implementation
**Estimated Time:** 2-3 days
**Next:** Set up Stripe account and get API keys
