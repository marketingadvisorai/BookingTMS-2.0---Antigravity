# 🎯 Stripe Connect Research & Recommendation
## November 16, 2025

**Decision:** ✅ **ADOPT STRIPE CONNECT IMMEDIATELY**

---

## 📊 **COMPARISON: Org Keys vs Stripe Connect**

| Factor | Org-Owned Keys | Stripe Connect |
|--------|----------------|----------------|
| Security | Store keys in Vault | No keys needed ✅ |
| Onboarding | Manual setup | Account Links ✅ |
| Compliance | Org responsible | Stripe handles ✅ |
| Revenue | Subscription | Sub + Fees + Revenue share ✅ |
| Liability | Org liable | Stripe liable ✅ |
| Support | We support | Stripe supports ✅ |
| Scalability | Custom | Built for platforms ✅ |

**Winner:** Stripe Connect on ALL counts

---

## 💰 **REVENUE MODEL**

### Example: 100 Organizations
- **Subscription:** $299/month × 100 = $29,900/month
- **Transaction Volume:** $5M/month total
- **App Fee (2.5%):** $125,000/month
- **Total:** **$154,900/month revenue**

Plus: Potential revenue share from Stripe

---

## 🔐 **KEY BENEFITS**

1. **No API Keys** - Nothing to store or manage
2. **Seamless Onboarding** - Click button → Stripe form → Done
3. **Stripe Compliance** - KYC/AML handled automatically
4. **Application Fees** - Automatic revenue per transaction
5. **Full Dashboard** - Orgs get complete Stripe access
6. **Dispute Handling** - Stripe handles all disputes
7. **Direct Support** - Stripe supports connected accounts

---

## 🏗️ **ARCHITECTURE CHANGES**

### Database - Organizations Table
```sql
-- Add
stripe_account_id VARCHAR(255)           -- acct_xxx
stripe_charges_enabled BOOLEAN           -- Can accept payments
stripe_payouts_enabled BOOLEAN           -- Can receive payouts
stripe_onboarding_status VARCHAR(50)     -- pending/complete
application_fee_percentage DECIMAL(5,2)  -- Our fee %

-- Remove (no longer needed!)
stripe_publishable_key
stripe_secret_key_vault_id
stripe_webhook_secret
```

### Flow: Create Connected Account
```
1. Admin clicks "Connect Stripe"
2. POST /connect/create-account
3. stripe.accounts.create({ controller: {...} })
4. Store account_id in database
5. Return success
```

### Flow: Onboard Account
```
1. Admin clicks "Complete Setup"
2. POST /connect/create-account-link
3. stripe.accountLinks.create()
4. Redirect to Stripe onboarding
5. Org fills business info
6. Redirected back to our app
7. Account charges_enabled = true
```

### Flow: Create Checkout
```typescript
stripe.checkout.sessions.create({
  line_items: [...],
  payment_intent_data: {
    application_fee_amount: 250, // Our $2.50 fee
  },
  mode: 'payment',
}, {
  stripeAccount: org.stripe_account_id, // Connected account
})
```

---

## 📋 **IMPLEMENTATION PLAN**

### Phase 1: Setup (2 days)
- [ ] Create Stripe Connect application
- [ ] Get approved by Stripe
- [ ] Update organizations table
- [ ] Create Edge Functions

### Phase 2: Core Functions (3 days)
- [ ] create-account function
- [ ] create-account-link function
- [ ] get-account-status function
- [ ] create-product function
- [ ] create-checkout function (updated)
- [ ] webhook function (simplified)

### Phase 3: UI (2 days)
- [ ] Settings > Payments page
- [ ] Connection status card
- [ ] Onboarding button
- [ ] Dashboard link
- [ ] Game sync button

### Phase 4: Testing (2 days)
- [ ] Test account creation
- [ ] Test onboarding flow
- [ ] Test payment processing
- [ ] Test application fees
- [ ] Test webhooks

**Total: 9 days to production**

---

## 🔄 **MIGRATION FROM ORG-OWNED**

Since we haven't implemented org-owned yet:
- ✅ No migration needed
- ✅ Start fresh with Connect
- ✅ Cleaner implementation
- ✅ Faster time to market

---

## 📚 **KEY DIFFERENCES**

### Controller Pattern (NEW)
```javascript
stripe.accounts.create({
  controller: {
    fees: { payer: 'account' },      // Org pays Stripe
    losses: { payments: 'stripe' },  // Stripe handles disputes
    stripe_dashboard: { type: 'full' } // Full dashboard access
  }
})
```

**Never use:**
- ❌ type: 'express'
- ❌ type: 'standard'
- ❌ type: 'custom'

### Connected Account Header
```javascript
// Create product on connected account
stripe.products.create({
  name: 'Escape Room',
  default_price_data: {...}
}, {
  stripeAccount: accountId // THIS IS THE KEY
})
```

### Application Fee
```javascript
payment_intent_data: {
  application_fee_amount: 250 // $2.50 in cents
}
```

Money flow:
- Customer pays $100
- Organization receives $97.50
- We receive $2.50

---

## ✅ **FINAL RECOMMENDATION**

**ADOPT STRIPE CONNECT NOW**

Why:
1. Industry standard for SaaS platforms
2. More secure (no key management)
3. Better UX (seamless onboarding)
4. Multiple revenue streams
5. Lower liability
6. Easier to scale
7. Better support

**Next Steps:**
1. Create Stripe Connect application
2. Update database schema
3. Implement Edge Functions
4. Build Admin UI
5. Test end-to-end
6. Launch to production

**Estimated Time:** 9 days

**ROI:** Higher revenue + Lower risk + Better UX = ✅ Clear winner
