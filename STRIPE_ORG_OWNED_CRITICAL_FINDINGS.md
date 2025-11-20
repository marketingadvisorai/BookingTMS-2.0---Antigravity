# 🔴 CRITICAL FINDINGS: Stripe Org-Owned Architecture
## Deep Analysis Results - November 16, 2025

**Status:** ✅ VALIDATED - APPROACH IS GOOD AND TAKEABLE  
**Required Action:** Fix critical bugs before implementing

---

## ⚡ EXECUTIVE SUMMARY

### ✅ **VERDICT: RECOMMENDED FOR IMPLEMENTATION**

Your idea to have organizations connect their own Stripe accounts is **EXCELLENT** and follows industry best practices.

**Benefits:**
- Organizations have full payment control
- Direct payouts to their bank accounts
- No platform fees or revenue sharing
- Simpler compliance
- Better scalability

**Required:** Fix 3 critical bugs and add secure key storage

---

## 🔴 CRITICAL BUGS FOUND (MUST FIX)

### **Bug #1: Customers Table Unique Constraint** 🔴 HIGH PRIORITY

**Problem:**
```sql
customers (
  stripe_customer_id VARCHAR(255) UNIQUE  -- ❌ WRONG!
)
```

- Different orgs use different Stripe accounts
- `stripe_customer_id` is only unique within each Stripe account
- Global UNIQUE constraint will cause random failures

**Fix:**
```sql
-- Drop global unique
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_stripe_customer_id_key;

-- Add compound unique per organization
ALTER TABLE customers ADD CONSTRAINT customers_org_stripe_customer_unique 
  UNIQUE(organization_id, stripe_customer_id);
```

**Impact:** Without this fix, customer creation will randomly fail when different orgs happen to have same customer ID format.

---

### **Bug #2: Payments Missing organization_id** 🔴 HIGH PRIORITY

**Problem:**
```sql
payments (
  id UUID,
  booking_id UUID,  -- Only has booking_id, no organization_id!
  ...
)
```

- Cannot query payments directly by organization
- RLS policies won't work properly
- No audit trail of which org's payment

**Fix:**
```sql
ALTER TABLE payments ADD COLUMN organization_id UUID NOT NULL REFERENCES organizations(id);
ALTER TABLE payments ADD COLUMN stripe_account_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';

CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_org_status ON payments(organization_id, status);

-- Update RLS
CREATE POLICY "org_users_view_payments"
  ON payments FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
```

**Impact:** Without this, payments queries and RLS won't work for multi-tenant.

---

### **Bug #3: Time Slots Generated Column Order** 🟡 MEDIUM PRIORITY

**Problem:**
```sql
time_slots (
  ...
  is_available BOOLEAN GENERATED ALWAYS AS (current_bookings < max_bookings AND NOT is_blocked) STORED,
  ...
  is_blocked BOOLEAN DEFAULT false,  -- Defined AFTER is_available!
)
```

- Generated column `is_available` references `is_blocked`
- But `is_blocked` is defined after `is_available`
- Postgres may reject this

**Fix:**
```sql
-- Move is_blocked BEFORE is_available
time_slots (
  ...
  is_blocked BOOLEAN DEFAULT false,
  is_available BOOLEAN GENERATED ALWAYS AS (current_bookings < max_bookings AND NOT is_blocked) STORED,
  ...
)
```

**Impact:** Migration may fail to run.

---

## 🔐 REQUIRED: Organizations Table Changes

```sql
-- Remove old platform Stripe field
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_customer_id;

-- Add org-owned Stripe fields
ALTER TABLE organizations ADD COLUMN stripe_publishable_key VARCHAR(255);
ALTER TABLE organizations ADD COLUMN stripe_secret_key_vault_id UUID REFERENCES vault.secrets(id);
ALTER TABLE organizations ADD COLUMN stripe_webhook_secret VARCHAR(255);
ALTER TABLE organizations ADD COLUMN stripe_account_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN stripe_mode VARCHAR(10) DEFAULT 'test';
ALTER TABLE organizations ADD COLUMN stripe_connected BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN stripe_connected_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN stripe_status VARCHAR(50) DEFAULT 'disconnected';
ALTER TABLE organizations ADD COLUMN default_currency VARCHAR(3) DEFAULT 'USD';

CREATE INDEX idx_org_stripe_connected ON organizations(stripe_connected);
```

**Critical:** `stripe_secret_key_vault_id` points to Supabase Vault for encryption.

---

## 📋 MODULE-BY-MODULE STATUS

| Module | Status | Changes Needed |
|--------|--------|----------------|
| **Organizations** | ❌ Needs Updates | Add Stripe connection fields |
| **Customers** | 🔴 Critical Bug | Fix unique constraint |
| **Games** | ✅ Good | Minor additions (currency) |
| **Time Slots** | 🟡 Bug Found | Fix generated column order |
| **Bookings** | ✅ Good | Add currency field |
| **Payments** | 🔴 Critical Bug | Add organization_id |
| **Venues** | ✅ No Changes | Works as-is |
| **Waivers** | ✅ No Changes | Integrate with flow |
| **Webhooks** | ❌ Needs Updates | Add organization_id |

---

## 🔐 SECURITY: Supabase Vault Required

**DO NOT store Stripe secret keys as plain text!**

```sql
-- Use Supabase Vault
CREATE EXTENSION IF NOT EXISTS vault;

-- Function to store secret
CREATE OR REPLACE FUNCTION store_org_stripe_secret(
  p_organization_id UUID,
  p_secret_key TEXT
) RETURNS UUID AS $$
DECLARE
  v_vault_id UUID;
BEGIN
  INSERT INTO vault.secrets (name, secret)
  VALUES ('stripe_secret_key_org_' || p_organization_id, p_secret_key)
  RETURNING id INTO v_vault_id;
  
  UPDATE organizations
  SET stripe_secret_key_vault_id = v_vault_id
  WHERE id = p_organization_id;
  
  RETURN v_vault_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to retrieve secret
CREATE OR REPLACE FUNCTION get_org_stripe_secret(p_organization_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_vault_id UUID;
  v_secret TEXT;
BEGIN
  SELECT stripe_secret_key_vault_id INTO v_vault_id
  FROM organizations WHERE id = p_organization_id;
  
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets WHERE id = v_vault_id;
  
  RETURN v_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🚀 EDGE FUNCTIONS: Key Changes

### 1. Connect Stripe Account
- Validates keys by calling Stripe API
- Stores publishable key as text (safe)
- Stores secret key in Vault (encrypted)
- Generates webhook secret
- Returns webhook URL

### 2. Create Checkout (UPDATED)
```typescript
// NEW: Get org's Stripe keys
const { data: secretKey } = await supabase.rpc('get_org_stripe_secret', {
  p_organization_id: timeSlot.organization_id
})

// NEW: Initialize Stripe with org's keys
const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })

// NEW: Use dynamic pricing (no need for per-slot prices)
line_items: [{
  price_data: {
    currency: 'usd',
    product_data: { name: game.name },
    unit_amount: Math.round(finalPrice * 100),
  },
  quantity: 1,
}]

// NEW: Include org_id in metadata
metadata: {
  booking_id: booking.id,
  organization_id: timeSlot.organization_id,
}
```

### 3. Stripe Webhook (UPDATED)
```typescript
// URL: /stripe-webhook/{organization_id}

// NEW: Extract org_id from URL
const organization_id = url.pathname.split('/').pop()

// NEW: Get org's webhook secret
const { data: org } = await supabase
  .from('organizations')
  .select('stripe_webhook_secret')
  .eq('id', organization_id)
  .single()

// NEW: Verify signature with org's secret
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  org.stripe_webhook_secret
)

// NEW: Verify org_id matches metadata
if (session.metadata.organization_id !== organization_id) {
  throw new Error('Organization mismatch')
}
```

---

## 💡 OPTIMIZATION: Dynamic Pricing

**Don't create Stripe Price objects for every time slot!**

- ❌ Creating thousands of Stripe Prices = expensive, slow, API limits
- ✅ Use `price_data` in checkout session for dynamic pricing

**Keep `stripe_price_id` optional for special events only.**

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1A: Fix Critical Bugs (1 day)
1. Fix customers unique constraint
2. Add organization_id to payments
3. Fix time_slots generated column order

### Phase 1B: Add Stripe Connection (2 days)
1. Update organizations table
2. Implement Vault storage functions
3. Create connect-stripe-account Edge Function
4. Create Admin UI for connection

### Phase 1C: Update Payment Flow (2 days)
1. Update create-booking-checkout function
2. Update stripe-webhook function
3. Test end-to-end flow

### Phase 1D: Testing (2 days)
1. Test with multiple orgs
2. Test key rotation
3. Test webhook verification
4. Load testing

**Total: 7 days**

---

## ✅ VERDICT

**THIS APPROACH IS EXCELLENT. PROCEED WITH IMPLEMENTATION.**

**Critical actions before starting:**
1. ✅ Fix 3 bugs identified above
2. ✅ Set up Supabase Vault
3. ✅ Implement secure key storage
4. ✅ Test with test Stripe accounts first

**This will give you:**
- ✅ 100% payment control per organization
- ✅ No platform fees
- ✅ Secure key management
- ✅ Scalable architecture
- ✅ Industry-standard approach

**Ready to proceed? Start with Phase 1A bug fixes.**
