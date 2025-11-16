# 🏗️ Stripe Connect Architecture - Final Design
## Stripe-Owned Pricing Model | BookingTMS

**Version:** 2.0 | **Date:** Nov 16, 2025 | **Status:** ✅ Production-Ready

---

## 💰 REVENUE MODEL (from your diagram)

```
Customer pays: $100.00
├─> Merchant pays Stripe: $1.50 (1.5% fee)
├─> Merchant pays Platform: $0.75 (0.75% app fee)
├─> Stripe pays Platform: $0.25 (0.25% referral)
└─> Merchant pays Platform: $299/month (subscription)

Platform Total Revenue = $1.00 per transaction + subscription
```

---

## 🗄️ DATABASE CHANGES

### Organizations Table
```sql
-- ADD (Stripe Connect)
stripe_account_id VARCHAR(255) UNIQUE
stripe_charges_enabled BOOLEAN DEFAULT false
stripe_payouts_enabled BOOLEAN DEFAULT false
stripe_details_submitted BOOLEAN DEFAULT false
stripe_onboarding_status VARCHAR(50)
application_fee_percentage DECIMAL(5,2) DEFAULT 0.75
total_volume_processed DECIMAL(12,2)
total_application_fees_earned DECIMAL(10,2)

-- REMOVE (no longer needed)
stripe_publishable_key
stripe_secret_key_vault_id
stripe_webhook_secret
```

### Customers Table
```sql
-- FIX unique constraint
ALTER TABLE customers DROP CONSTRAINT customers_stripe_customer_id_key;
ALTER TABLE customers ADD CONSTRAINT customers_org_stripe_unique 
  UNIQUE(organization_id, stripe_customer_id);
```

### Payments Table
```sql
-- ADD (critical fix)
organization_id UUID NOT NULL
stripe_account_id VARCHAR(255)
application_fee_amount DECIMAL(10,2)
platform_earning DECIMAL(10,2)
net_to_merchant DECIMAL(10,2)
```

### Platform Revenue Table (NEW)
```sql
CREATE TABLE platform_revenue (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  payment_id UUID,
  revenue_type VARCHAR(50), -- 'application_fee', 'referral_fee', 'subscription'
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  earned_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔐 SECURITY

### No API Keys Stored! ✅
```
OLD: Store org's secret keys in Vault
NEW: Only store account_id (acct_xxx)

Security Benefits:
✅ Zero key exposure risk
✅ No encryption/decryption overhead
✅ No key rotation complexity
✅ Stripe manages everything
```

---

## 🏗️ SYSTEM FLOW

### Onboarding
```
1. Admin clicks "Connect Stripe"
2. POST /stripe-connect/create-account
3. stripe.accounts.create({ controller: {...} })
4. POST /stripe-connect/create-account-link
5. Redirect to Stripe onboarding form
6. Stripe collects business info + bank account
7. Redirect back → charges_enabled = true ✅
```

### Payment Processing
```
1. Customer books time slot ($100)
2. POST /create-booking-checkout
   - stripeAccount: org.stripe_account_id
   - application_fee_amount: 75 (cents)
3. Customer completes payment
4. Money split:
   - Org receives: $97.75
   - Stripe fee: $1.50
   - Platform app fee: $0.75
5. Webhook: checkout.session.completed
6. Update booking → confirmed
```

---

## 💻 EDGE FUNCTIONS

### 1. create-account
```typescript
stripe.accounts.create({
  controller: {
    fees: { payer: 'account' },
    losses: { payments: 'stripe' },
    stripe_dashboard: { type: 'full' }
  }
})
```

### 2. create-account-link
```typescript
stripe.accountLinks.create({
  account: accountId,
  type: 'account_onboarding',
  return_url: '/settings/payments?success=true'
})
```

### 3. create-checkout
```typescript
stripe.checkout.sessions.create({
  line_items: [...],
  payment_intent_data: {
    application_fee_amount: 75 // $0.75
  }
}, {
  stripeAccount: org.stripe_account_id
})
```

### 4. stripe-webhook
```typescript
// Single webhook for platform
// Events: checkout.session.completed, account.updated
```

---

## 📊 REVENUE CALCULATION

```typescript
// Per $100 transaction
const applicationFee = 100 * 0.0075 = $0.75
const referralFee = 100 * 0.0025 = $0.25
const platformRevenue = $1.00

// 100 orgs × $50k/month volume
const totalVolume = $5M/month
const appFeeRevenue = $37,500/month
const referralRevenue = $12,500/month
const subscriptionRevenue = $29,900/month
TOTAL = $79,900/month = $958k/year
```

---

## ✅ MIGRATION FROM ORG-OWNED

Since not implemented yet:
- ✅ No migration needed
- ✅ Start fresh with Connect
- ✅ Faster implementation
- ✅ Better architecture

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Database (1 day)
- [ ] Update organizations table
- [ ] Fix customers unique constraint
- [ ] Add payments.organization_id
- [ ] Create platform_revenue table

### Phase 2: Edge Functions (3 days)
- [ ] create-account
- [ ] create-account-link
- [ ] get-account-status
- [ ] create-checkout (updated)
- [ ] stripe-webhook (updated)

### Phase 3: Admin UI (2 days)
- [ ] Settings > Payments page
- [ ] Connection status card
- [ ] Onboarding button
- [ ] Dashboard link

### Phase 4: Testing (2 days)
- [ ] Test onboarding flow
- [ ] Test payment processing
- [ ] Test application fees
- [ ] Test multiple orgs

**Total: 8 days**

---

## 🎯 FINAL RECOMMENDATION

**✅ ADOPT STRIPE CONNECT WITH STRIPE-OWNED PRICING**

Why:
1. **More Secure** - No API keys to manage
2. **Better UX** - Seamless onboarding
3. **Higher Revenue** - App fees + referrals + subscription
4. **Lower Risk** - Stripe handles disputes
5. **Easier Scale** - Built for platforms
6. **Industry Standard** - Used by Shopify, Square, etc.

Ready to implement? I'll create the migration files and Edge Functions.
