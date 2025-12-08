# Stripe Connect Architecture

## Overview

BookingTMS implements a **multi-tenant payment platform** using Stripe Connect. The platform (BookingTMS) acts as a marketplace connecting booking customers with venue/activity operators (tenants/organizations).

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BOOKINGTMS PLATFORM                            │
│                         (Stripe Platform Account)                           │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Platform Admin  │  │ Edge Functions  │  │ Supabase DB     │             │
│  │ (System Admin)  │  │ (Stripe API)    │  │ (Organizations) │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
└───────────┼────────────────────┼────────────────────┼───────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
    ┌───────────────────────────────────────────────────────────────┐
    │                     STRIPE CONNECT                             │
    │  ┌──────────────────────────────────────────────────────────┐ │
    │  │              Connected Accounts (Express)                 │ │
    │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │ │
    │  │  │ Org A      │  │ Org B      │  │ Org C      │  ...    │ │
    │  │  │ acct_xxx1  │  │ acct_xxx2  │  │ acct_xxx3  │         │ │
    │  │  │ (Venue)    │  │ (Venue)    │  │ (Venue)    │         │ │
    │  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘         │ │
    │  └─────────┼───────────────┼───────────────┼───────────────┘ │
    └────────────┼───────────────┼───────────────┼─────────────────┘
                 │               │               │
                 ▼               ▼               ▼
         ┌───────────┐   ┌───────────┐   ┌───────────┐
         │ Bank Acct │   │ Bank Acct │   │ Bank Acct │
         │ (Payouts) │   │ (Payouts) │   │ (Payouts) │
         └───────────┘   └───────────┘   └───────────┘
```

---

## Payment Flow Diagram

```
┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐   ┌─────────────┐
│  Customer   │──▶│  Embed Widget   │──▶│ create-checkout  │──▶│   Stripe    │
│  (Browser)  │   │  (React App)    │   │ (Edge Function)  │   │  Checkout   │
└─────────────┘   └─────────────────┘   └──────────────────┘   └──────┬──────┘
                                                                       │
       ┌───────────────────────────────────────────────────────────────┘
       │ Payment goes to connected account with application_fee
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           STRIPE CONNECT FLOW                            │
│                                                                          │
│   Customer Payment ($100)                                                │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────────────────────────────┐                             │
│   │     Connected Account (Org/Venue)      │                             │
│   │     Receives: $100 - $2.90 (Stripe)   │                             │
│   │              - $5.00 (Platform Fee)    │                             │
│   │              = $92.10 net              │                             │
│   └───────────────────────────────────────┘                             │
│           │                                                              │
│           ▼                                                              │
│   ┌───────────────────────────────────────┐                             │
│   │     Platform Account (BookingTMS)      │                             │
│   │     Receives: $5.00 (Platform Fee)     │                             │
│   │     (application_fee_amount)           │                             │
│   └───────────────────────────────────────┘                             │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ERD - Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        organizations                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ id                         UUID PRIMARY KEY                              │
│ name                       VARCHAR(255)                                  │
│ slug                       VARCHAR(255)                                  │
│ owner_email                VARCHAR(255)                                  │
│ ─────────────────────────── STRIPE CONNECT ───────────────────────────  │
│ stripe_account_id          VARCHAR(255)  -- acct_xxxxxxxxxx             │
│ stripe_connect_enabled     BOOLEAN                                       │
│ stripe_charges_enabled     BOOLEAN                                       │
│ stripe_payouts_enabled     BOOLEAN                                       │
│ stripe_details_submitted   BOOLEAN                                       │
│ stripe_business_name       VARCHAR(255)                                  │
│ stripe_verification_status VARCHAR(255)  -- verified/pending/restricted │
│ stripe_disabled_reason     TEXT                                          │
│ stripe_onboarding_completed_at TIMESTAMPTZ                              │
│ ─────────────────────────── PLATFORM FEES ───────────────────────────── │
│ application_fee_percentage NUMERIC(5,2) DEFAULT 5.00                    │
│ application_fee_fixed      NUMERIC                                       │
│ ─────────────────────────── SUBSCRIPTION ────────────────────────────── │
│ stripe_customer_id         VARCHAR(255)  -- cus_xxx (for subscription)  │
│ stripe_subscription_id     VARCHAR(255)  -- sub_xxx                     │
│ stripe_subscription_status VARCHAR(255)                                  │
│ plan_id                    UUID REFERENCES plans(id)                     │
│ subscription_mrr           NUMERIC                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           venues                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ id                         UUID PRIMARY KEY                              │
│ organization_id            UUID REFERENCES organizations(id)             │
│ name                       VARCHAR(255)                                  │
│ embed_key                  VARCHAR(100)  -- For widget embedding         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          activities                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ id                         UUID PRIMARY KEY                              │
│ venue_id                   UUID REFERENCES venues(id)                    │
│ organization_id            UUID REFERENCES organizations(id)             │
│ ─────────────────────────── STRIPE PRICES ───────────────────────────── │
│ stripe_product_id          VARCHAR(255)  -- prod_xxx                    │
│ stripe_prices              JSONB         -- {adult: {price_id, amount}} │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           bookings                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ id                         UUID PRIMARY KEY                              │
│ activity_id                UUID REFERENCES activities(id)                │
│ organization_id            UUID REFERENCES organizations(id)             │
│ ─────────────────────────── PAYMENT DATA ────────────────────────────── │
│ stripe_checkout_session_id VARCHAR(255)                                  │
│ stripe_payment_intent_id   VARCHAR(255)                                  │
│ payment_status             VARCHAR(50)                                   │
│ total_amount               NUMERIC                                       │
│ platform_fee               NUMERIC       -- What platform received       │
│ promo_code                 VARCHAR(100)                                  │
│ promo_discount             NUMERIC                                       │
│ gift_card_id               UUID                                          │
│ gift_card_amount           NUMERIC                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Connect Account Onboarding Flow

### Option 1: Create New Stripe Account (Express)

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│  Org Admin   │───▶│  Settings Page  │───▶│ "Create Account" │
│  Dashboard   │    │  Stripe Tab     │    │    Button        │
└──────────────┘    └─────────────────┘    └────────┬─────────┘
                                                    │
                    ┌───────────────────────────────┘
                    ▼
        ┌───────────────────────┐
        │  stripe-connect-org   │  (Edge Function)
        │  action: create       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Stripe API           │
        │  accounts.create()    │
        │  type: 'express'      │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  accountLinks.create()│
        │  type: onboarding     │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Stripe Hosted        │  (User redirected)
        │  Onboarding Form      │
        │  - Business info      │
        │  - Bank account       │
        │  - Identity verify    │
        └───────────┬───────────┘
                    │
                    ▼ (Return URL)
        ┌───────────────────────┐
        │  App: Settings Page   │
        │  Account now linked!  │
        └───────────────────────┘
```

### Option 2: Link Existing Stripe Account (OAuth)

```
┌──────────────┐    ┌─────────────────┐    ┌────────────────────┐
│  Org Admin   │───▶│  Settings Page  │───▶│ "Link Existing"    │
│  Dashboard   │    │  Stripe Tab     │    │    Button          │
└──────────────┘    └─────────────────┘    └─────────┬──────────┘
                                                     │
                     ┌───────────────────────────────┘
                     ▼
        ┌────────────────────────────────────────────────────┐
        │  OAuth URL: connect.stripe.com/oauth/authorize     │
        │  - client_id: ca_xxx (Platform's Connect ID)       │
        │  - redirect_uri: /stripe/oauth/callback            │
        │  - scope: read_write                               │
        │  - state: {org_id, user_id} (Base64)               │
        └────────────────────────────┬───────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────┐
        │  Stripe OAuth Page                                 │
        │  - User logs into existing Stripe account          │
        │  - Authorizes platform connection                  │
        └────────────────────────────┬───────────────────────┘
                                     │
                                     ▼ (Redirect to callback)
        ┌────────────────────────────────────────────────────┐
        │  /stripe/oauth/callback?code=xxx&state=yyy         │
        │  - Exchange code for stripe_account_id             │
        │  - Save to organizations.stripe_account_id         │
        │  - Redirect to settings with success message       │
        └────────────────────────────────────────────────────┘
```

---

## Platform Fee Structure

| Fee Type | Rate | Description |
|----------|------|-------------|
| **Platform Management Fee** | 1.29% | Fixed platform fee on ticket sales |
| **Stripe Processing** | 2.9% + $0.30 | Standard Stripe card processing |

### Fee Payment Modes

Organizations can choose who pays the fees:

| Mode | Column | Customer Pays | Org Receives |
|------|--------|---------------|--------------|
| Pass to Customer | `fee_payment_mode = 'pass_to_customer'` | Ticket + Fees | 100% of ticket |
| Absorb Fees | `fee_payment_mode = 'absorb'` | Ticket only | Ticket - Fees |

### Fee Calculation Example (Pass to Customer)

```
Booking Total: $100.00

Customer Pays:
  Ticket Price:         $100.00
  + Service Fee:        $  4.54  (includes platform + stripe)
  ─────────────────────────────
  Total:                $104.54

Platform Receives:       $  1.29  (1.29% platform fee)
Stripe Receives:         $  3.25  (processing)
Organization Receives:   $100.00  (full ticket price)
```

### Fee Calculation Example (Absorb Fees)

```
Booking Total: $100.00

Customer Pays:          $100.00

Platform Receives:       $  1.29  (1.29% platform fee)
Stripe Receives:         $  3.20  (processing)
Organization Receives:   $ 95.51  (after fees)
```

See `/docs/PLATFORM_FEE_SYSTEM.md` for complete documentation.

---

## Edge Functions

| Function | Purpose | Actions |
|----------|---------|---------|
| `stripe-connect-org` | Account management | create_account, create_account_link, get_account, create_login_link |
| `stripe-connect-oauth` | OAuth flow | exchange_code, verify_state |
| `create-checkout-session` | Payments | Creates checkout on connected account |
| `stripe-webhook` | Event handling | account.updated, payment_intent.succeeded |

---

## Security Considerations

1. **API Keys**:
   - Platform `STRIPE_SECRET_KEY` stored in Supabase Secrets (never exposed to frontend)
   - Connected accounts don't need API keys (platform acts on their behalf)

2. **OAuth State**:
   - State parameter is Base64-encoded JSON with `org_id`, `user_id`, `timestamp`
   - Validated on callback to prevent CSRF attacks
   - State expires after 10 minutes

3. **RLS Policies**:
   - Stripe account IDs visible only to org owners/admins
   - Platform fees only editable by system admins

4. **Webhook Verification**:
   - All webhooks verified with `STRIPE_WEBHOOK_SECRET`
   - Connect webhooks verified with platform secret

---

## Configuration Required

### Platform Stripe Dashboard
1. Enable Connect in Stripe Dashboard
2. Get Connect `client_id` (ca_xxx) from Dashboard → Connect Settings
3. Set OAuth redirect URI: `https://yourdomain.com/stripe/oauth/callback`

### Supabase Secrets
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_CONNECT_CLIENT_ID=ca_xxx
```

### Environment Variables (Frontend)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_STRIPE_CONNECT_CLIENT_ID=ca_xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | Dec 08, 2025 | OAuth flow for linking existing accounts, platform fee per org |
| 1.0.0 | Nov 30, 2025 | Initial Express account creation, checkout integration |
