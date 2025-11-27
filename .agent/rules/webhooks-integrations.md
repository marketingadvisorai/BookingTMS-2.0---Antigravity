# BookingTMS 2.0 - Webhooks & Integrations Reference

> Last Updated: 2025-11-27
> This document covers all external integrations and webhook handlers.

---

## Stripe Integration

### Overview
BookingTMS uses Stripe for:
- **Payments** - One-time booking payments
- **Connect** - Multi-tenant payouts to venue owners
- **Subscriptions** - Platform subscription plans (future)

### Edge Functions

| Function | Path | Purpose |
|----------|------|---------|
| `create-checkout-session` | `/functions/v1/create-checkout-session` | Create Stripe checkout |
| `create-booking-checkout` | `/functions/v1/create-booking-checkout` | Booking + checkout |
| `stripe-webhook` | `/functions/v1/stripe-webhook` | Handle Stripe events |
| `create-connect-account` | `/functions/v1/create-connect-account` | Onboard venue owner |
| `bulk-create-stripe-products` | `/functions/v1/bulk-create-stripe-products` | Sync products |

### Webhook Events

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `stripe-webhook` | Confirm booking, update payment status |
| `payment_intent.succeeded` | `stripe-webhook` | Mark payment as paid |
| `payment_intent.payment_failed` | `stripe-webhook` | Mark payment as failed |
| `account.updated` | `stripe-webhook` | Update Connect account status |
| `customer.subscription.created` | `stripe-webhook` | Activate subscription |
| `customer.subscription.deleted` | `stripe-webhook` | Cancel subscription |

### Checkout Session Payload

```typescript
// Request to create-checkout-session
interface CreateCheckoutRequest {
  activityId: string;
  sessionId?: string;
  date: string;           // ISO date
  time: string;           // HH:mm
  partySize: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  successUrl: string;
  cancelUrl: string;
}

// Response
interface CreateCheckoutResponse {
  sessionId: string;      // Stripe session ID
  url: string;            // Checkout URL
}
```

### Webhook Signature Verification

```typescript
// In edge function
const signature = req.headers.get('stripe-signature');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

---

## Supabase Edge Functions

### Directory Structure

```
supabase/functions/
├── create-booking/
│   └── index.ts
├── create-checkout-session/
│   └── index.ts
├── create-booking-checkout/
│   └── index.ts
├── stripe-webhook/
│   └── index.ts
├── create-connect-account/
│   └── index.ts
├── check-availability/
│   └── index.ts
└── _shared/
    ├── cors.ts
    ├── supabase.ts
    └── stripe.ts
```

### Shared Utilities

```typescript
// _shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// _shared/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// _shared/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});
```

### Function Template

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { /* params */ } = await req.json();

    // Business logic here

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Email Integration (Resend)

### Edge Functions

| Function | Purpose |
|----------|---------|
| `send-booking-confirmation` | Booking confirmation email |
| `send-booking-reminder` | Reminder before booking |
| `send-booking-cancelled` | Cancellation notification |

### Email Templates

```typescript
// Booking confirmation
interface BookingConfirmationData {
  customerName: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  partySize: number;
  totalAmount: number;
  bookingId: string;
}
```

---

## Realtime Subscriptions

### Supabase Realtime Channels

```typescript
// Subscribe to booking changes
const channel = supabase
  .channel('bookings-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'bookings' },
    (payload) => {
      console.log('Booking changed:', payload);
    }
  )
  .subscribe();

// Subscribe to embed config changes
const embedChannel = supabase
  .channel('embed_configs_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'embed_configs' },
    () => {
      refetchConfigs();
    }
  )
  .subscribe();
```

---

## API Endpoints Summary

### Public (No Auth)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/embed-pro?key=xxx` | Load widget by embed key |
| POST | `/functions/v1/create-checkout-session` | Create checkout |
| POST | `/functions/v1/stripe-webhook` | Stripe webhooks |

### Authenticated

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/rest/v1/activities` | List activities |
| GET | `/rest/v1/bookings` | List bookings |
| POST | `/rest/v1/bookings` | Create booking |
| PATCH | `/rest/v1/bookings?id=eq.xxx` | Update booking |
| DELETE | `/rest/v1/bookings?id=eq.xxx` | Delete booking |

---

## Environment Variables

### Edge Functions

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...

# App
APP_URL=https://app.bookingtms.com
```

### Frontend

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_URL=https://app.bookingtms.com
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Example
{
  "error": "Activity not found",
  "code": "ACTIVITY_NOT_FOUND",
  "details": { "activityId": "xxx" }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate/conflict |
| `SLOT_UNAVAILABLE` | 409 | Time slot taken |
| `PAYMENT_FAILED` | 402 | Payment error |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
```
