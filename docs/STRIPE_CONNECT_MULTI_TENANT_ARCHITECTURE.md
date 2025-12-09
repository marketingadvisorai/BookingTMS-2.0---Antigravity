# Stripe Connect Multi-Tenant Architecture

## Overview

BookingTMS implements a multi-tenant Stripe Connect architecture where each organization has their own connected Stripe account. Products and prices are created on the organization's Stripe account, not the platform's account.

## Architecture Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM (BookingTMS)                              │
│                                                                              │
│  ┌──────────────────┐         ┌──────────────────────────────────────────┐  │
│  │  Platform Stripe │         │           Supabase Database               │  │
│  │  (Platform Fees) │         │                                           │  │
│  │                  │         │  ┌─────────────────────────────────────┐  │  │
│  │  - Application   │         │  │         organizations                │  │  │
│  │    fee %         │         │  │  ─────────────────────────────────   │  │  │
│  │  - Platform      │         │  │  id (PK)                             │  │  │
│  │    revenue       │         │  │  name                                │  │  │
│  │                  │         │  │  stripe_account_id ──────────────┐   │  │  │
│  └──────────────────┘         │  │  stripe_charges_enabled         │   │  │  │
│                               │  │  stripe_payouts_enabled         │   │  │  │
│                               │  │  stripe_onboarding_status       │   │  │  │
│                               │  │  stripe_account_type            │   │  │  │
│                               │  │  platform_fee_percent           │   │  │  │
│                               │  │  fee_payment_mode               │   │  │  │
│                               │  └───────────────┬─────────────────┘   │  │  │
│                               │                  │                      │  │  │
│                               │                  │ 1:N                  │  │  │
│                               │                  ▼                      │  │  │
│                               │  ┌─────────────────────────────────────┐│  │  │
│                               │  │         activities                  ││  │  │
│                               │  │  ─────────────────────────────────  ││  │  │
│                               │  │  id (PK)                            ││  │  │
│                               │  │  organization_id (FK) ──────────────┘│  │  │
│                               │  │  name                               │  │  │
│                               │  │  stripe_product_id ─────────────────┼──┼──┐
│                               │  │  stripe_price_id                    │  │  │
│                               │  │  stripe_prices (JSONB)              │  │  │
│                               │  └─────────────────────────────────────┘  │  │
│                               └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Stripe Connect
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORGANIZATION STRIPE ACCOUNTS                         │
│                                                                              │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                 │
│  │  Org A Stripe Account   │    │  Org B Stripe Account   │    ...          │
│  │  acct_xxxxxxxxx         │    │  acct_yyyyyyyyy         │                 │
│  │                         │    │                         │                 │
│  │  Products:              │    │  Products:              │                 │
│  │  - Haunted Mansion      │    │  - Prison Break         │                 │
│  │  - Zombie Apocalypse    │    │  - The Heist            │                 │
│  │                         │    │                         │                 │
│  │  Prices (USD only):     │    │  Prices (USD only):     │                 │
│  │  - Adult: $30           │    │  - Adult: $35           │                 │
│  │  - Child: $20           │    │  - Child: $25           │                 │
│  │                         │    │                         │                 │
│  │  Revenue: $10,000       │    │  Revenue: $15,000       │                 │
│  └─────────────────────────┘    └─────────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCT CREATION FLOW                                │
└──────────────────────────────────────────────────────────────────────────────┘

1. Admin opens Activity Wizard Step 6 (Payment Settings)
                    │
                    ▼
2. System checks Stripe Connect status for organization
   ┌─────────────────────────────────────────────────────────────┐
   │  SELECT stripe_account_id, stripe_charges_enabled          │
   │  FROM organizations WHERE id = :org_id                      │
   └─────────────────────────────────────────────────────────────┘
                    │
                    ▼
3. If NOT connected → Show "Connect Stripe Account" banner
   If connected but NOT charges_enabled → Show "Complete Setup" banner
   If connected AND charges_enabled → Allow product creation
                    │
                    ▼
4. Admin clicks "Create Stripe Product"
                    │
                    ▼
5. Frontend calls StripeProductService.createProductAndPrice()
   with stripeAccountId parameter
                    │
                    ▼
6. Edge Function receives request with stripeAccountId
   ┌─────────────────────────────────────────────────────────────┐
   │  stripe.products.create({...}, { stripeAccount: acct_xxx }) │
   │  stripe.prices.create({...}, { stripeAccount: acct_xxx })   │
   └─────────────────────────────────────────────────────────────┘
                    │
                    ▼
7. Product/Price created on ORGANIZATION'S Stripe account
                    │
                    ▼
8. Save stripe_product_id to activities table
```

## Database Schema

### organizations table (Stripe Connect fields)

| Column | Type | Description |
|--------|------|-------------|
| `stripe_account_id` | VARCHAR(255) | Connected Stripe account ID (e.g., `acct_xxx`) |
| `stripe_charges_enabled` | BOOLEAN | Can accept payments |
| `stripe_payouts_enabled` | BOOLEAN | Can receive payouts |
| `stripe_onboarding_status` | VARCHAR(20) | `not_started`, `incomplete`, `complete` |
| `stripe_account_type` | VARCHAR(20) | Account type (standard, express, custom) |
| `platform_fee_percent` | NUMERIC(5,3) | Platform fee percentage (default: 1.29%) |
| `fee_payment_mode` | VARCHAR(20) | `absorb` or `pass_to_customer` |

### activities table (Stripe product fields)

| Column | Type | Description |
|--------|------|-------------|
| `stripe_product_id` | VARCHAR(255) | Stripe Product ID (on org's account) |
| `stripe_price_id` | VARCHAR(255) | Primary Stripe Price ID |
| `stripe_prices` | JSONB | Multi-tier pricing structure |

## Key Files

### Frontend
- `/src/components/events/steps/payment/usePaymentSettings.ts` - Stripe Connect status checking
- `/src/components/events/steps/payment/StripeConnectBanner.tsx` - Connect status UI
- `/src/lib/stripe/stripeProductService.ts` - Product creation with Connect support

### Edge Functions
- `/supabase/functions/stripe-manage-product/index.ts` - Multi-tenant product/price creation

### Types
- `/src/components/events/steps/payment/types.ts` - StripeConnectStatus type

## API Changes

### Edge Function: stripe-manage-product

**Request Body** (new field):
```json
{
  "action": "create_product",
  "name": "Zombie Apocalypse",
  "description": "...",
  "stripeAccountId": "acct_xxx"  // NEW: Connected account ID
}
```

**Stripe API Call**:
```typescript
// Creates product on connected account
const product = await stripe.products.create(
  { name, description, metadata },
  { stripeAccount: stripeAccountId }  // Stripe Connect header
);
```

## Currency Enforcement

Currently, the system enforces **USD only** for all pricing:

```typescript
// In stripeProductService.ts
currency: 'usd', // Force USD for now

// In stripe-manage-product/index.ts
currency: 'usd', // Force USD for now
```

Future enhancement: Allow organizations to select their currency in Settings.

## Security Considerations

1. **Account Verification**: Always verify `stripe_charges_enabled` before creating products
2. **Multi-Tenant Isolation**: Products are created on org's account, not platform
3. **Masked Logging**: Account IDs are masked in logs (`acct_***xxxx`)
4. **RLS Policies**: All queries scoped by `organization_id`

## User Experience

### Before Stripe Connect
1. Banner shows "Stripe Account Not Connected"
2. Button: "Connect Stripe Account" → redirects to Settings → Stripe Connect
3. Product creation disabled

### After Stripe Connect
1. Banner shows "Stripe Connected" with masked account ID
2. Badge shows "USD Only"
3. Product creation enabled
4. Products appear on organization's Stripe dashboard

## Testing

### Test Stripe Connect Flow
1. Create a new organization
2. Go to Settings → Stripe Connect
3. Connect a Stripe test account
4. Create an activity with Step 6 Payment Settings
5. Verify product appears in connected Stripe account (not platform)

### Verify Multi-Tenant Isolation
1. Connect Org A to Stripe Account A
2. Connect Org B to Stripe Account B
3. Create products for both orgs
4. Verify products appear in correct accounts

---

*Document Version: 1.0.0*
*Last Updated: December 10, 2025*
