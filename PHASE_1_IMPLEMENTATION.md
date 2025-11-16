# 🚀 Phase 1 Implementation - START NOW
## Database Schema + Stripe Payment Integration

**Date:** November 16, 2025  
**Duration:** Week 1 (7 days)  
**Status:** 🟢 READY TO START  

---

## 📊 SUPABASE PRO PLAN RESOURCES AVAILABLE

You have excellent limits - we'll use them efficiently:
- ✅ **500 concurrent connections** - plenty for real-time bookings
- ✅ **2M Edge Functions** - perfect for Stripe webhooks
- ✅ **250GB egress** - handle all API calls
- ✅ **100,000 MAU** - support massive user base
- ✅ **5M realtime messages** - real-time booking updates

---

## 🎯 PHASE 1 GOALS

### ✅ Database Improvements
1. Add `system-admin` role to enum
2. Create `platform_team` table
3. Add `is_platform_team` flag to users
4. Create `plans` table with 3 tiers
5. **Improve games table** for time slots
6. **Create time_slots table** for availability
7. Add Stripe fields to organizations

### ✅ Stripe Integration
1. Link games to Stripe products
2. Create payment flow for bookings
3. Handle Stripe checkout sessions
4. Process webhooks via Edge Functions
5. Update booking status on payment

---

## 📐 IMPROVED DATABASE SCHEMA

### 1. Enhanced Games Table

```sql
-- Migration: 024_improve_games_and_timeslots.sql

-- Add Stripe integration fields to games
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;

-- Add venue relationship (games belong to venues)
ALTER TABLE games ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE CASCADE;

-- Add time slot configuration
ALTER TABLE games ADD COLUMN IF NOT EXISTS time_slot_duration INT DEFAULT 60; -- minutes
ALTER TABLE games ADD COLUMN IF NOT EXISTS buffer_time INT DEFAULT 15; -- minutes between slots
ALTER TABLE games ADD COLUMN IF NOT EXISTS max_daily_slots INT; -- NULL = unlimited

-- Add dynamic pricing support
ALTER TABLE games ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(50) DEFAULT 'fixed'; -- 'fixed', 'dynamic', 'tiered'
ALTER TABLE games ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '{}'::jsonb;

-- Stripe sync status
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_sync_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_synced_at TIMESTAMPTZ;
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_sync_error TEXT;

-- Update existing price column to be base_price if not set
UPDATE games SET base_price = price WHERE base_price = 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue_id);
CREATE INDEX IF NOT EXISTS idx_games_stripe_product ON games(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_games_stripe_sync ON games(stripe_sync_status);

COMMENT ON COLUMN games.time_slot_duration IS 'Duration of each booking slot in minutes';
COMMENT ON COLUMN games.buffer_time IS 'Buffer time between slots in minutes';
COMMENT ON COLUMN games.pricing_rules IS 'JSON rules for dynamic pricing: {"peak_hours": {"multiplier": 1.5, "hours": [18,19,20]}}';
```

### 2. NEW: Time Slots Table

```sql
-- Time slots represent available booking times
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Time slot details
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Availability
  max_bookings INT DEFAULT 1, -- How many parties can book this slot
  current_bookings INT DEFAULT 0,
  is_available BOOLEAN GENERATED ALWAYS AS (current_bookings < max_bookings) STORED,
  
  -- Pricing (can override game base price)
  price DECIMAL(10,2), -- NULL means use game's base_price
  price_multiplier DECIMAL(3,2) DEFAULT 1.00, -- 1.5 for peak times
  
  -- Stripe integration
  stripe_price_id VARCHAR(255), -- Can have unique Stripe price per slot
  
  -- Status
  is_blocked BOOLEAN DEFAULT false, -- Manually block slot
  blocked_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT time_slots_valid_time CHECK (start_time < end_time),
  CONSTRAINT time_slots_valid_bookings CHECK (current_bookings <= max_bookings),
  UNIQUE(game_id, slot_date, start_time)
);

-- Indexes for performance
CREATE INDEX idx_time_slots_org ON time_slots(organization_id);
CREATE INDEX idx_time_slots_game ON time_slots(game_id);
CREATE INDEX idx_time_slots_venue ON time_slots(venue_id);
CREATE INDEX idx_time_slots_date ON time_slots(slot_date);
CREATE INDEX idx_time_slots_availability ON time_slots(slot_date, is_available) WHERE is_available = true;
CREATE INDEX idx_time_slots_composite ON time_slots(game_id, slot_date, start_time);

-- Trigger for updated_at
CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "platform_team_all_time_slots"
  ON time_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

CREATE POLICY "org_users_view_own_time_slots"
  ON time_slots FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org_admins_manage_time_slots"
  ON time_slots FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

COMMENT ON TABLE time_slots IS 'Available booking time slots for games';
COMMENT ON COLUMN time_slots.max_bookings IS 'Number of concurrent parties allowed in this slot';
COMMENT ON COLUMN time_slots.price_multiplier IS 'Multiplier for peak/off-peak pricing (1.5 = 150% of base price)';
```

### 3. Update Bookings Table

```sql
-- Add time_slot reference and Stripe fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_slot_id UUID REFERENCES time_slots(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_status VARCHAR(50) DEFAULT 'pending';

-- Add pricing breakdown
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price_multiplier DECIMAL(3,2) DEFAULT 1.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_charges JSONB DEFAULT '[]'::jsonb; -- Extra services, insurance, etc.

CREATE INDEX IF NOT EXISTS idx_bookings_time_slot ON bookings(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_checkout ON bookings(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_intent ON bookings(stripe_payment_intent_id);

COMMENT ON COLUMN bookings.time_slot_id IS 'Reference to pre-generated time slot';
COMMENT ON COLUMN bookings.addon_charges IS 'JSON array of additional charges: [{"name": "Insurance", "amount": 5.00}]';
```

---

## 💳 STRIPE PAYMENT INTEGRATION

### Flow: Customer Books a Time Slot

```
1. Customer selects game
2. System shows available time slots
3. Customer selects time slot
4. System creates Stripe Checkout Session
5. Customer redirected to Stripe payment page
6. Customer completes payment
7. Stripe webhook fires
8. System confirms booking
9. System sends confirmation email
10. Time slot marked as booked
```

### Implementation:

#### 1. Create Stripe Checkout Session (Edge Function)

```typescript
// supabase/functions/create-booking-checkout/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { 
      time_slot_id, 
      customer_email, 
      customer_name,
      party_size,
      addons = []
    } = await req.json()
    
    // Get time slot details with game
    const { data: timeSlot, error } = await supabase
      .from('time_slots')
      .select(`
        *,
        game:games (*),
        venue:venues (*)
      `)
      .eq('id', time_slot_id)
      .single()
    
    if (error || !timeSlot) {
      throw new Error('Time slot not found')
    }
    
    // Check availability
    if (!timeSlot.is_available) {
      throw new Error('Time slot no longer available')
    }
    
    // Calculate price
    const basePrice = timeSlot.price || timeSlot.game.base_price
    const finalPrice = basePrice * timeSlot.price_multiplier * party_size
    
    // Calculate addons
    const addonTotal = addons.reduce((sum, addon) => sum + addon.amount, 0)
    const totalAmount = finalPrice + addonTotal
    
    // Create or get Stripe customer
    let stripeCustomerId = null
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('email', customer_email)
      .eq('organization_id', timeSlot.organization_id)
      .single()
    
    if (customer?.stripe_customer_id) {
      stripeCustomerId = customer.stripe_customer_id
    } else {
      // Create Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        metadata: {
          organization_id: timeSlot.organization_id,
        }
      })
      stripeCustomerId = stripeCustomer.id
      
      // Save to database
      await supabase
        .from('customers')
        .upsert({
          organization_id: timeSlot.organization_id,
          email: customer_email,
          full_name: customer_name,
          stripe_customer_id: stripeCustomerId,
        })
    }
    
    // Create pending booking
    const { data: booking, error: bookingError } = await supabase
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
        stripe_payment_status: 'pending',
      })
      .select()
      .single()
    
    if (bookingError) {
      throw new Error('Failed to create booking')
    }
    
    // Create Stripe Checkout Session
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
            unit_amount: Math.round(finalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
        ...addons.map(addon => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: addon.name,
            },
            unit_amount: Math.round(addon.amount * 100),
          },
          quantity: 1,
        }))
      ],
      mode: 'payment',
      success_url: `${Deno.env.get('APP_URL')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Deno.env.get('APP_URL')}/booking/cancelled`,
      metadata: {
        booking_id: booking.id,
        organization_id: timeSlot.organization_id,
        time_slot_id: time_slot_id,
      },
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
        session_id: session.id,
        checkout_url: session.url,
        booking_id: booking.id,
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

#### 2. Handle Stripe Webhooks

```typescript
// supabase/functions/handle-stripe-webhooks/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const bookingId = session.metadata.booking_id
        const timeSlotId = session.metadata.time_slot_id
        
        // Update booking to confirmed
        await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', bookingId)
        
        // Increment time slot booking count
        await supabase.rpc('increment_time_slot_bookings', {
          slot_id: timeSlotId
        })
        
        // Create payment record
        await supabase
          .from('payments')
          .insert({
            booking_id: bookingId,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: 'paid',
            payment_method_type: session.payment_method_types[0],
          })
        
        // TODO: Send confirmation email
        
        break
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object
        const bookingId = session.metadata.booking_id
        
        // Cancel booking
        await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            stripe_payment_status: 'expired',
          })
          .eq('id', bookingId)
        
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        
        // Find booking and update
        await supabase
          .from('bookings')
          .update({
            stripe_payment_status: 'failed',
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        break
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

#### 3. Database Function: Increment Time Slot Bookings

```sql
-- Function to safely increment time slot booking count
CREATE OR REPLACE FUNCTION increment_time_slot_bookings(slot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE time_slots
  SET current_bookings = current_bookings + 1
  WHERE id = slot_id
  AND current_bookings < max_bookings; -- Atomic check
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Time slot is full or not found';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement (when booking cancelled)
CREATE OR REPLACE FUNCTION decrement_time_slot_bookings(slot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE time_slots
  SET current_bookings = GREATEST(current_bookings - 1, 0)
  WHERE id = slot_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 MIGRATION EXECUTION ORDER

Run these in sequence:

```bash
# 1. Platform team and plans
supabase migration new 024_platform_team_and_plans
# (Use SQL from MIGRATION_PLAN_COMPLETE.md Phase 1)

# 2. Improve games and add time slots
supabase migration new 025_improve_games_and_timeslots
# (Use SQL from above)

# 3. Deploy Edge Functions
supabase functions deploy create-booking-checkout
supabase functions deploy handle-stripe-webhooks

# 4. Set environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set APP_URL=https://yourdomain.com
```

---

## ✅ PHASE 1 TASKS (This Week)

### Day 1-2: Database Setup
- [ ] Create migration 024_platform_team_and_plans.sql
- [ ] Create migration 025_improve_games_and_timeslots.sql
- [ ] Run migrations on staging
- [ ] Verify all tables created
- [ ] Test RLS policies

### Day 3-4: Stripe Integration
- [ ] Create Edge Functions
- [ ] Set up Stripe webhooks
- [ ] Test checkout flow end-to-end
- [ ] Verify webhook processing

### Day 5-6: Testing
- [ ] Test time slot availability
- [ ] Test concurrent bookings
- [ ] Test payment flow
- [ ] Test cancellation flow
- [ ] Load testing

### Day 7: Documentation & Handoff
- [ ] Document API endpoints
- [ ] Create frontend integration guide
- [ ] Test on production-like data
- [ ] Prepare for Phase 2

---

## 🔥 QUICK START COMMANDS

```bash
# 1. Create migrations
cd supabase/migrations
touch 024_platform_team_and_plans.sql
touch 025_improve_games_and_timeslots.sql

# 2. Apply migrations
supabase db reset # On local/staging
supabase migration up

# 3. Create Edge Functions
mkdir -p supabase/functions/create-booking-checkout
mkdir -p supabase/functions/handle-stripe-webhooks

# 4. Deploy
supabase functions deploy create-booking-checkout --no-verify-jwt
supabase functions deploy handle-stripe-webhooks --no-verify-jwt

# 5. Test
curl -X POST https://your-project.supabase.co/functions/v1/create-booking-checkout \
  -H "Content-Type: application/json" \
  -d '{"time_slot_id": "...", "customer_email": "test@test.com"}'
```

---

**Status:** 🟢 READY TO IMPLEMENT  
**Next:** Execute Day 1-2 tasks  
**Support:** Supabase Pro Plan fully utilized
