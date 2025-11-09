# Stripe Payment System Architecture
## Booking TMS - Complete Payment Integration

**Version:** 1.0.0  
**Date:** November 9, 2025  
**Status:** Design Phase

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Integration](#api-integration)
5. [Payment Flows](#payment-flows)
6. [Security & Compliance](#security--compliance)
7. [Implementation Plan](#implementation-plan)
8. [Testing Strategy](#testing-strategy)

---

## Executive Summary

### Objectives
- Integrate Stripe payment processing for booking payments
- Support multiple payment methods (cards, digital wallets)
- Handle refunds, disputes, and subscription billing
- Maintain PCI compliance (Stripe handles card data)
- Track all payment transactions and reconciliation

### Key Features
- ✅ One-time booking payments
- ✅ Partial payments / deposits
- ✅ Refunds and cancellations
- ✅ Subscription billing (memberships)
- ✅ Coupon and discount codes
- ✅ Payment intent tracking
- ✅ Webhook event handling
- ✅ Invoice generation
- ✅ Payment analytics

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Booking   │  │  Payment   │  │  Customer  │           │
│  │   Form     │  │   Form     │  │  Dashboard │           │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘           │
└────────┼────────────────┼────────────────┼──────────────────┘
         │                │                │
         │                │                │
┌────────▼────────────────▼────────────────▼──────────────────┐
│              Supabase Edge Functions                        │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ create-payment   │  │ handle-webhook   │               │
│  │    -intent       │  │                  │               │
│  └────────┬─────────┘  └────────┬─────────┘               │
└───────────┼──────────────────────┼───────────────────────────┘
            │                      │
            │                      │
    ┌───────▼──────────┐   ┌──────▼──────────┐
    │  Stripe API      │   │  Stripe         │
    │  (Payments)      │   │  Webhooks       │
    └───────┬──────────┘   └──────┬──────────┘
            │                      │
            │                      │
┌───────────▼──────────────────────▼───────────────────────────┐
│                    Supabase Database                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ bookings │  │ payments │  │ refunds  │  │ invoices │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. **Frontend Layer**
- **Payment Form Component** - Stripe Elements integration
- **Booking Flow** - Multi-step booking with payment
- **Payment Status** - Real-time payment status updates
- **Customer Dashboard** - View payment history, invoices

#### 2. **Backend Layer (Supabase Edge Functions)**
- **create-payment-intent** - Initialize Stripe payment
- **confirm-payment** - Confirm payment completion
- **handle-refund** - Process refund requests
- **handle-webhook** - Process Stripe webhook events
- **generate-invoice** - Create PDF invoices

#### 3. **Stripe Integration**
- **Payment Intents API** - Secure payment processing
- **Customers API** - Customer management
- **Payment Methods API** - Saved payment methods
- **Refunds API** - Refund processing
- **Webhooks** - Event notifications
- **Invoices API** - Invoice generation

#### 4. **Database Layer**
- **payments** - Payment transaction records
- **payment_intents** - Stripe payment intent tracking
- **refunds** - Refund records
- **invoices** - Invoice records
- **payment_methods** - Saved payment methods

---

## Database Schema

### 1. payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  
  -- Stripe IDs
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_method_type VARCHAR(50),
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  CONSTRAINT valid_status CHECK (status IN (
    'pending', 'processing', 'succeeded', 
    'failed', 'canceled', 'refunded', 'partially_refunded'
  ))
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at DESC);
```

### 2. payment_intents Table

```sql
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  
  -- Intent Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  client_secret TEXT,
  
  -- Payment Method
  payment_method_id VARCHAR(255),
  payment_method_types JSONB DEFAULT '["card"]'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_intent_status CHECK (status IN (
    'requires_payment_method', 'requires_confirmation',
    'requires_action', 'processing', 'succeeded',
    'canceled'
  ))
);

CREATE INDEX idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_payment_intents_booking ON payment_intents(booking_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);
```

### 3. refunds Table

```sql
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  
  -- Stripe IDs
  stripe_refund_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  
  -- Refund Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  reason VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Who processed
  processed_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_refund_status CHECK (status IN (
    'pending', 'succeeded', 'failed', 'canceled'
  )),
  CONSTRAINT valid_refund_reason CHECK (reason IN (
    'duplicate', 'fraudulent', 'requested_by_customer', 'other'
  ))
);

CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_booking ON refunds(booking_id);
CREATE INDEX idx_refunds_stripe_id ON refunds(stripe_refund_id);
```

### 4. invoices Table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  payment_id UUID REFERENCES payments(id),
  
  -- Invoice Details
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Line Items
  line_items JSONB NOT NULL,
  
  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  
  -- PDF
  pdf_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_invoice_status CHECK (status IN (
    'draft', 'sent', 'paid', 'overdue', 'canceled', 'refunded'
  ))
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### 5. payment_methods Table

```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  
  -- Payment Method Details
  type VARCHAR(50) NOT NULL,
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  billing_details JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_payment_method_type CHECK (type IN (
    'card', 'us_bank_account', 'sepa_debit', 'ideal', 'klarna'
  ))
);

CREATE INDEX idx_payment_methods_customer ON payment_methods(customer_id);
CREATE INDEX idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(is_default) WHERE is_default = true;
```

### 6. coupons Table

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  
  -- Stripe ID
  stripe_coupon_id VARCHAR(255),
  
  -- Discount Details
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3),
  
  -- Usage Limits
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed_amount'))
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = true;
```

---

## API Integration

### Supabase Edge Functions

#### 1. create-payment-intent

**File:** `supabase/functions/create-payment-intent/index.ts`

```typescript
import Stripe from 'https://esm.sh/stripe@14.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const { bookingId, amount, currency = 'usd', customerId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customer:customers(*)')
    .eq('id', bookingId)
    .single()
  
  // Create or get Stripe customer
  let stripeCustomerId = booking.customer.stripe_customer_id
  
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: booking.customer.email,
      name: `${booking.customer.first_name} ${booking.customer.last_name}`,
      metadata: { supabase_customer_id: booking.customer.id }
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
    automatic_payment_methods: { enabled: true }
  })
  
  // Save payment intent to database
  await supabase.from('payment_intents').insert({
    stripe_payment_intent_id: paymentIntent.id,
    booking_id: bookingId,
    customer_id: booking.customer.id,
    amount,
    currency,
    status: paymentIntent.status,
    client_secret: paymentIntent.client_secret,
    metadata: { booking_id: bookingId }
  })
  
  return new Response(JSON.stringify({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### 2. handle-webhook

**File:** `supabase/functions/handle-webhook/index.ts`

```typescript
import Stripe from 'https://esm.sh/stripe@14.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
      status: 400
    })
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object, supabase)
      break
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object, supabase)
      break
    
    case 'charge.refunded':
      await handleRefund(event.data.object, supabase)
      break
    
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object, supabase)
      break
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

async function handlePaymentSuccess(paymentIntent: any, supabase: any) {
  // Update payment intent status
  await supabase
    .from('payment_intents')
    .update({ status: 'succeeded', updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntent.id)
  
  // Create payment record
  await supabase.from('payments').insert({
    stripe_payment_intent_id: paymentIntent.id,
    stripe_charge_id: paymentIntent.latest_charge,
    booking_id: paymentIntent.metadata.booking_id,
    customer_id: paymentIntent.metadata.customer_id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency,
    status: 'succeeded',
    payment_method_type: paymentIntent.payment_method_types[0],
    paid_at: new Date().toISOString()
  })
  
  // Update booking status
  await supabase
    .from('bookings')
    .update({ 
      payment_status: 'paid',
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentIntent.metadata.booking_id)
}
```

---

## Payment Flows

### 1. Booking Payment Flow

```
Customer → Select Game → Choose Date/Time → Enter Details
    ↓
Create Booking (status: pending_payment)
    ↓
Call create-payment-intent Edge Function
    ↓
Stripe Creates Payment Intent
    ↓
Return client_secret to Frontend
    ↓
Display Stripe Payment Form (Stripe Elements)
    ↓
Customer Enters Payment Details
    ↓
Stripe Processes Payment
    ↓
Webhook: payment_intent.succeeded
    ↓
Update Booking (status: confirmed, payment_status: paid)
    ↓
Send Confirmation Email with QR Code
    ↓
Generate Invoice
```

### 2. Refund Flow

```
Admin → View Booking → Click Refund
    ↓
Select Refund Amount (full/partial)
    ↓
Call create-refund Edge Function
    ↓
Stripe Processes Refund
    ↓
Webhook: charge.refunded
    ↓
Update Payment (status: refunded/partially_refunded)
    ↓
Update Booking (status: canceled/modified)
    ↓
Send Refund Confirmation Email
    ↓
Update Invoice
```

---

## Security & Compliance

### PCI Compliance
- ✅ Never store card numbers
- ✅ Use Stripe Elements (PCI-compliant)
- ✅ Stripe handles all card data
- ✅ Use HTTPS for all communications

### API Security
- ✅ Stripe API keys stored in environment variables
- ✅ Webhook signature verification
- ✅ Row Level Security (RLS) on all tables
- ✅ Service role key for Edge Functions only

### Data Protection
- ✅ Encrypt sensitive data at rest
- ✅ Use Stripe Customer IDs (not raw data)
- ✅ Audit logs for all payment operations
- ✅ GDPR compliant data handling

---

## Implementation Plan

### Phase 1: Setup (Week 1)
- [ ] Create Stripe account
- [ ] Get API keys (test & live)
- [ ] Set up webhook endpoint
- [ ] Create database tables
- [ ] Deploy Edge Functions

### Phase 2: Basic Payments (Week 2)
- [ ] Implement payment intent creation
- [ ] Build payment form component
- [ ] Handle payment success/failure
- [ ] Send confirmation emails

### Phase 3: Advanced Features (Week 3)
- [ ] Implement refunds
- [ ] Add coupon support
- [ ] Generate invoices
- [ ] Payment method management

### Phase 4: Testing & Launch (Week 4)
- [ ] Test with Stripe test cards
- [ ] Security audit
- [ ] Load testing
- [ ] Go live with production keys

---

**Status:** Ready for Implementation
**Next Step:** Set up Stripe account and MCP integration
