# 🚀 Phase 1 Implementation - UPDATED FOR STRIPE CONNECT
## Database + Stripe Connect Integration

**Bismillah - In the Name of God**

**Date:** November 16, 2025  
**Duration:** Week 1 (8 days)  
**Status:** 🟢 READY TO START  
**Architecture:** Stripe Connect with Stripe-Owned Pricing Model

---

## 🎯 WHAT CHANGED FROM ORIGINAL PLAN

### ❌ OLD APPROACH (Platform Stripe)
- Platform has one Stripe account
- All payments go through platform account
- Organizations don't need Stripe accounts
- Limited revenue options

### ✅ NEW APPROACH (Stripe Connect)
- Each organization has connected Stripe account
- Organizations receive payments directly
- Platform earns application fees (0.75%) + referrals (~0.25%)
- Organizations pay Stripe fees themselves
- Full dashboard access for organizations
- Industry-standard approach

---

## 📋 PHASE 1 OBJECTIVES (UPDATED)

### ✅ Database Layer (8 sections)
1. **Organizations Table** - Add Stripe Connect fields
2. **Customers Table** - Fix unique constraint bug
3. **Payments Table** - Add organization_id (critical)
4. **Platform Revenue Table** - Track our earnings (NEW)
5. **Time Slots Table** - Keep from original plan
6. **Helper Functions** - Fee calculation & tracking
7. **RLS Policies** - Update for Connect
8. **Analytics Views** - Revenue reporting

### ✅ Stripe Connect Integration
1. Organization onboarding flow
2. Connected account creation
3. Product sync to connected accounts
4. Checkout with application fees
5. Webhook handling for connected accounts
6. Revenue tracking

---

## 🗄️ DATABASE IMPLEMENTATION PLAN

### **Migration 026: Stripe Connect Architecture**

Already created: `supabase/migrations/026_stripe_connect_architecture.sql`

This migration includes:
- ✅ Organizations table updates (Connect fields)
- ✅ Customers unique constraint fix
- ✅ Payments organization_id addition
- ✅ Platform revenue tracking table
- ✅ Helper functions
- ✅ RLS policies
- ✅ Analytics views

### **Migration 025: Time Slots (Keep from Original)**

Already created: `supabase/migrations/025_improved_timeslots_stripe.sql`

This migration includes:
- ✅ Games table enhancements
- ✅ Time slots table creation
- ✅ Bookings table updates
- ✅ Helper functions for slots

---

## 🔄 COMBINED IMPLEMENTATION STRATEGY

### Phase 1A: Core Database (Day 1-2)

**Step 1: Execute Migration 026 (Stripe Connect)**
```bash
# Follow: DATABASE_MIGRATION_EXECUTION.md
# Location: Supabase Dashboard → SQL Editor

Time: 20-25 minutes
Risk: LOW (with backup)
```

**Sections to execute:**
1. Organizations table (5 min)
2. Customers table - fix bug (3 min)
3. Payments table - add org_id (5 min)
4. Platform revenue table (3 min)
5. Helper functions (3 min)
6. RLS policies (2 min)
7. Analytics views (2 min)

**Verification:**
```sql
-- Check migration success
SELECT 
  'Organizations' as table_name,
  COUNT(*) as stripe_connect_columns
FROM information_schema.columns
WHERE table_name = 'organizations'
AND column_name IN ('stripe_account_id', 'application_fee_percentage', 'stripe_charges_enabled');

-- Should return count = 3
```

**Step 2: Execute Migration 025 (Time Slots)**
```bash
# Already created, just needs execution
# Time: 15 minutes
```

This adds:
- Games enhancements for time slots
- Time slots table
- Booking updates for slots

---

### Phase 1B: Edge Functions (Day 3-5)

#### Function 1: Create Connected Account

```typescript
// supabase/functions/stripe-connect/create-account.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    })
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    // Get organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role, organization:organizations(*)')
      .eq('id', user.id)
      .single()
    
    // Verify admin
    if (userData.role !== 'admin') {
      throw new Error('Only admins can connect Stripe')
    }
    
    // Check if already has account
    if (userData.organization.stripe_account_id) {
      throw new Error('Already connected')
    }
    
    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      controller: {
        fees: { payer: 'account' },        // Org pays Stripe fees
        losses: { payments: 'stripe' },    // Stripe handles disputes
        stripe_dashboard: { type: 'full' } // Full dashboard access
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        organization_id: userData.organization_id,
        organization_name: userData.organization.name,
      }
    })
    
    // Save account ID
    await supabase
      .from('organizations')
      .update({
        stripe_account_id: account.id,
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        stripe_details_submitted: account.details_submitted,
        stripe_onboarding_status: 'pending',
        stripe_account_created_at: new Date().toISOString(),
      })
      .eq('id', userData.organization_id)
    
    return new Response(
      JSON.stringify({
        success: true,
        account_id: account.id,
        message: 'Connected account created. Please complete onboarding.'
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Function 2: Create Account Link (Onboarding)

```typescript
// supabase/functions/stripe-connect/create-account-link.ts

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    })
    
    // Get organization's account ID
    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_account_id')
      .eq('id', organizationId)
      .single()
    
    if (!org.stripe_account_id) {
      throw new Error('No connected account found')
    }
    
    // Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: org.stripe_account_id,
      refresh_url: `${Deno.env.get('APP_URL')}/settings/payments?refresh=true`,
      return_url: `${Deno.env.get('APP_URL')}/settings/payments?success=true`,
      type: 'account_onboarding',
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        url: accountLink.url,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Function 3: Create Booking Checkout (UPDATED for Connect)

```typescript
// supabase/functions/create-booking-checkout/index.ts
// UPDATED: Now uses Stripe Connect

serve(async (req) => {
  try {
    const { time_slot_id, customer_email, customer_name, party_size, addons = [] } = await req.json()
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-11-20.acacia',
    })
    
    // Get time slot with organization
    const { data: timeSlot } = await supabase
      .from('time_slots')
      .select(`
        *,
        game:games (*),
        venue:venues (*),
        organization:organizations (*)
      `)
      .eq('id', time_slot_id)
      .single()
    
    // CRITICAL: Verify organization has Stripe Connect
    if (!timeSlot.organization.stripe_account_id) {
      throw new Error('Organization has not connected Stripe')
    }
    
    if (!timeSlot.organization.stripe_charges_enabled) {
      throw new Error('Organization must complete Stripe onboarding')
    }
    
    // Check availability
    if (!timeSlot.is_available) {
      throw new Error('Time slot no longer available')
    }
    
    // Calculate pricing
    const basePrice = timeSlot.price || timeSlot.game.base_price
    const finalPrice = basePrice * timeSlot.price_multiplier * party_size
    const addonTotal = addons.reduce((sum, addon) => sum + addon.amount, 0)
    const totalAmount = finalPrice + addonTotal
    
    // Calculate application fee (our revenue)
    const appFeePercentage = timeSlot.organization.application_fee_percentage || 0.75
    const applicationFeeAmount = Math.round(totalAmount * (appFeePercentage / 100) * 100) // in cents
    
    // Create or get customer on CONNECTED ACCOUNT (not platform!)
    let stripeCustomerId
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('email', customer_email)
      .eq('organization_id', timeSlot.organization_id)
      .single()
    
    if (customer?.stripe_customer_id) {
      stripeCustomerId = customer.stripe_customer_id
    } else {
      // Create customer on connected account
      const stripeCustomer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        metadata: {
          organization_id: timeSlot.organization_id,
        }
      }, {
        stripeAccount: timeSlot.organization.stripe_account_id, // Connected account!
      })
      
      stripeCustomerId = stripeCustomer.id
      
      // Save customer
      await supabase
        .from('customers')
        .upsert({
          organization_id: timeSlot.organization_id,
          email: customer_email,
          full_name: customer_name,
          stripe_customer_id: stripeCustomerId,
          stripe_account_id: timeSlot.organization.stripe_account_id,
        })
    }
    
    // Create pending booking
    const { data: booking } = await supabase
      .from('bookings')
      .insert({
        organization_id: timeSlot.organization_id,
        booking_number: `BK-${Date.now()}`,
        customer_id: customer.id,
        game_id: timeSlot.game_id,
        venue_id: timeSlot.venue_id,
        time_slot_id: time_slot_id,
        booking_date: timeSlot.slot_date,
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        party_size: party_size,
        base_price: basePrice,
        price_multiplier: timeSlot.price_multiplier,
        addon_charges: addons,
        total_amount: totalAmount,
        final_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()
    
    // Create Stripe Checkout Session on CONNECTED ACCOUNT with APPLICATION FEE
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${timeSlot.game.name} - ${timeSlot.slot_date} ${timeSlot.start_time}`,
              description: `Party of ${party_size} at ${timeSlot.venue.name}`,
              images: timeSlot.game.image_url ? [timeSlot.game.image_url] : [],
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
        ...addons.map(addon => ({
          price_data: {
            currency: 'usd',
            product_data: { name: addon.name },
            unit_amount: Math.round(addon.amount * 100),
          },
          quantity: 1,
        }))
      ],
      payment_intent_data: {
        // THIS IS OUR APPLICATION FEE!
        application_fee_amount: applicationFeeAmount,
        metadata: {
          booking_id: booking.id,
          organization_id: timeSlot.organization_id,
        }
      },
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/booking/cancelled`,
      metadata: {
        booking_id: booking.id,
        organization_id: timeSlot.organization_id,
        time_slot_id: time_slot_id,
      },
    }, {
      stripeAccount: timeSlot.organization.stripe_account_id, // CRITICAL: Connected account
    })
    
    // Update booking with session ID
    await supabase
      .from('bookings')
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq('id', booking.id)
    
    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        checkout_url: session.url,
        booking_id: booking.id,
        application_fee: applicationFeeAmount / 100,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### Function 4: Stripe Webhook (SIMPLIFIED for Connect)

```typescript
// supabase/functions/stripe-webhook/index.ts
// UPDATED: Single platform webhook handles all connected account events

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-11-20.acacia',
  })
  
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()
  
  try {
    // Verify webhook signature (single platform webhook)
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
    
    // Check idempotency
    const { data: existing } = await supabase
      .from('stripe_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single()
    
    if (existing) {
      return new Response(JSON.stringify({ received: true }))
    }
    
    // Store event
    await supabase
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        type: event.type,
        data: event.data.object,
        processed: false,
      })
    
    // Process event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const bookingId = session.metadata.booking_id
        const organizationId = session.metadata.organization_id
        const timeSlotId = session.metadata.time_slot_id
        
        // Update booking
        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', bookingId)
        
        // Increment time slot
        await supabase.rpc('increment_time_slot_bookings', {
          slot_id: timeSlotId
        })
        
        // Create payment record with application fee
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
          { stripeAccount: session.account } // Get from connected account
        )
        
        await supabase
          .from('payments')
          .insert({
            organization_id: organizationId,
            booking_id: bookingId,
            stripe_payment_intent_id: session.payment_intent,
            stripe_account_id: session.account,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'paid',
            application_fee_amount: paymentIntent.application_fee_amount / 100,
            platform_earning: (paymentIntent.application_fee_amount / 100) + 0.25, // + estimated referral
            net_to_merchant: (session.amount_total - paymentIntent.application_fee_amount - 150) / 100, // - Stripe fee
          })
        
        break
      }
      
      case 'account.updated': {
        // Connected account status changed
        const account = event.data.object
        const organizationId = account.metadata.organization_id
        
        if (organizationId) {
          await supabase
            .from('organizations')
            .update({
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
              stripe_details_submitted: account.details_submitted,
              stripe_onboarding_status: account.details_submitted ? 'complete' : 'pending',
            })
            .eq('id', organizationId)
        }
        break
      }
    }
    
    // Mark as processed
    await supabase
      .from('stripe_webhook_events')
      .update({ processed: true })
      .eq('event_id', event.id)
    
    return new Response(JSON.stringify({ received: true }))
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})
```

---

## 📅 UPDATED WEEK 1 SCHEDULE

### **Day 1-2: Database Implementation**
- [ ] Execute Migration 026 (Stripe Connect) - 25 min
- [ ] Execute Migration 025 (Time Slots) - 15 min
- [ ] Run all verification queries
- [ ] Test helper functions
- [ ] Verify RLS policies

### **Day 3: Stripe Connect Functions**
- [ ] Create `stripe-connect/create-account.ts`
- [ ] Create `stripe-connect/create-account-link.ts`
- [ ] Create `stripe-connect/get-account-status.ts`
- [ ] Deploy functions
- [ ] Test onboarding flow

### **Day 4-5: Payment Flow Functions**
- [ ] Update `create-booking-checkout` for Connect
- [ ] Update `stripe-webhook` for Connect
- [ ] Test with test Stripe account
- [ ] Verify application fees
- [ ] Test webhook processing

### **Day 6: Admin UI**
- [ ] Settings > Payments page
- [ ] "Connect Stripe" button
- [ ] Onboarding status display
- [ ] Dashboard link button

### **Day 7-8: Testing & Documentation**
- [ ] End-to-end payment test
- [ ] Multi-organization test
- [ ] Application fee verification
- [ ] Revenue tracking test
- [ ] Document APIs

---

## 🚀 EXECUTION STEPS (START NOW)

### **Step 1: Execute Database Migrations**

```bash
# Open DATABASE_MIGRATION_EXECUTION.md
# Follow step-by-step guide
# Estimated time: 40 minutes total
```

1. Go to Supabase Dashboard
2. SQL Editor
3. Create backup
4. Execute Migration 026 (sections 1-7)
5. Execute Migration 025
6. Run verification queries

### **Step 2: Set Up Stripe Account**

```bash
# Get platform Stripe keys
1. Go to https://dashboard.stripe.com
2. Developers → API keys
3. Copy Secret key (sk_live_xxx or sk_test_xxx)
4. Copy Publishable key (pk_live_xxx or pk_test_xxx)
```

### **Step 3: Create Edge Functions**

```bash
# Create function directories
mkdir -p supabase/functions/stripe-connect/create-account
mkdir -p supabase/functions/stripe-connect/create-account-link
mkdir -p supabase/functions/stripe-connect/get-account-status
mkdir -p supabase/functions/create-booking-checkout
mkdir -p supabase/functions/stripe-webhook

# Copy function code from above
# Deploy functions
supabase functions deploy stripe-connect/create-account
supabase functions deploy stripe-connect/create-account-link
supabase functions deploy create-booking-checkout
supabase functions deploy stripe-webhook
```

### **Step 4: Configure Environment Variables**

```bash
# Set Stripe keys
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set APP_URL=https://yourdomain.com
```

---

## ✅ SUCCESS CRITERIA

After Phase 1 completion, you should have:

- [ ] ✅ Database with Stripe Connect support
- [ ] ✅ Organizations can connect their Stripe accounts
- [ ] ✅ Seamless onboarding flow
- [ ] ✅ Payment processing with application fees
- [ ] ✅ Revenue tracking working
- [ ] ✅ Webhook handling operational
- [ ] ✅ Time slots system functional
- [ ] ✅ Complete booking flow working

---

## 💰 REVENUE MODEL IN ACTION

After implementation:
```
Customer books $100 escape room
  ↓
Organization receives: $97.75
Stripe keeps: $1.50
Platform earns: $0.75 (app fee) + ~$0.25 (referral)
  ↓
Total platform revenue: ~$1.00 per transaction
+ Monthly subscription: $299/org
```

**With 100 organizations @ $50k/month volume:**
- Transaction fees: $37,500/month
- Referral fees: $12,500/month
- Subscriptions: $29,900/month
- **TOTAL: $79,900/month = $958k/year**

---

**Status:** 🟢 Ready to execute  
**First Step:** Database migration (40 minutes)  
**Next:** Edge Functions (Day 3)

**Bismillah - Let's build this! 🚀**
