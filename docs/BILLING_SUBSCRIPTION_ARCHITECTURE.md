# Billing & Subscription System Architecture

## Overview

This document describes the complete billing, subscription, and credit system architecture for BookingTMS. The system integrates with Stripe for payment processing and subscription management.

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          BILLING & SUBSCRIPTION SYSTEM                           │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   organizations  │
                              │──────────────────│
                              │ id (PK)          │
                              │ name             │
                              │ stripe_customer_id│◄────┐
                              │ owner_email      │     │
                              │ created_at       │     │
                              └────────┬─────────┘     │
                                       │               │
              ┌────────────────────────┼───────────────┼─────────────────────┐
              │                        │               │                     │
              ▼                        ▼               │                     ▼
┌─────────────────────┐  ┌─────────────────────┐      │     ┌─────────────────────┐
│   subscriptions     │  │   credit_balances   │      │     │  payment_methods    │
│─────────────────────│  │─────────────────────│      │     │─────────────────────│
│ id (PK)             │  │ id (PK)             │      │     │ id (PK)             │
│ organization_id (FK)│  │ organization_id (FK)│      │     │ organization_id (FK)│
│ stripe_subscription_│  │ balance             │      │     │ stripe_payment_     │
│   id                │  │ plan_credits        │      │     │   method_id         │
│ stripe_price_id     │  │ purchased_credits   │      │     │ brand               │
│ plan_id             │  │ last_reset_date     │      │     │ last4               │
│ status              │  │ created_at          │      │     │ exp_month           │
│ current_period_start│  │ updated_at          │      │     │ exp_year            │
│ current_period_end  │  │                     │      │     │ is_default          │
│ cancel_at_period_end│  └──────────┬──────────┘      │     │ created_at          │
│ created_at          │             │                 │     └─────────────────────┘
│ updated_at          │             │                 │
└──────────┬──────────┘             │                 │
           │                        │                 │
           ▼                        ▼                 │
┌─────────────────────┐  ┌─────────────────────┐      │
│  subscription_plans │  │  credit_transactions│      │
│─────────────────────│  │─────────────────────│      │
│ id (PK)             │  │ id (PK)             │      │
│ name                │  │ organization_id (FK)│      │
│ stripe_product_id   │  │ amount (+/-)        │      │
│ stripe_price_id_    │  │ type (enum)         │      │
│   monthly           │  │ description         │      │
│ stripe_price_id_    │  │ booking_id (FK)     │      │
│   yearly            │  │ stripe_payment_     │      │
│ monthly_price       │  │   intent_id         │      │
│ yearly_price        │  │ created_at          │      │
│ features (JSONB)    │  └─────────────────────┘      │
│ limits (JSONB)      │                               │
│ is_active           │  ┌─────────────────────┐      │
│ display_order       │  │   invoices          │◄─────┘
│ created_at          │  │─────────────────────│
└─────────────────────┘  │ id (PK)             │
                         │ organization_id (FK)│
                         │ stripe_invoice_id   │
                         │ stripe_customer_id  │
                         │ amount_due          │
                         │ amount_paid         │
                         │ status              │
                         │ invoice_pdf         │
                         │ hosted_invoice_url  │
                         │ period_start        │
                         │ period_end          │
                         │ created_at          │
                         └─────────────────────┘
```

## Credit System Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           CREDIT SYSTEM FLOW                                   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Monthly    │     │   Purchase  │     │   Usage     │     │   Balance   │
│  Allocation │────►│   Credits   │────►│   Deduction │────►│   Check     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         credit_balances table                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ plan_credits │  │  purchased   │  │   balance    │  │ last_reset   │    │
│  │   (monthly)  │  │   credits    │  │   (total)    │  │    date      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      credit_transactions table                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Types:                                                                  │ │
│  │  • plan_allocation (+)  - Monthly credits from subscription            │ │
│  │  • purchase (+)         - Bought credit packages                       │ │
│  │  • booking (-)          - Extra booking beyond free tier               │ │
│  │  • waiver (-)           - Digital waiver signed                        │ │
│  │  • ai_conversation (-)  - AI chat beyond free tier                     │ │
│  │  • refund (+)           - Credits returned for cancelled booking       │ │
│  │  • adjustment (+/-)     - Manual admin adjustment                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Stripe Integration Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         STRIPE INTEGRATION                                     │
└───────────────────────────────────────────────────────────────────────────────┘

     Frontend (React)                 Backend (Supabase)              Stripe
    ┌─────────────────┐             ┌─────────────────┐         ┌─────────────┐
    │                 │             │                 │         │             │
    │  Billing Page   │────────────►│  Edge Function  │────────►│  Customers  │
    │                 │             │  stripe-billing │         │             │
    │  • Plan Select  │◄────────────│                 │◄────────│  Products   │
    │  • Buy Credits  │             │  Actions:       │         │             │
    │  • Manage Card  │             │  • create_sub   │         │  Prices     │
    │  • View Invoice │             │  • update_sub   │         │             │
    │                 │             │  • cancel_sub   │         │ Subscript-  │
    └────────┬────────┘             │  • buy_credits  │         │   ions      │
             │                      │  • sync_invoice │         │             │
             │                      │  • portal_link  │         │  Invoices   │
             │                      └────────┬────────┘         │             │
             │                               │                  │  Webhooks   │
             │                               │                  └──────┬──────┘
             │                               │                         │
             │   ┌───────────────────────────┼─────────────────────────┘
             │   │                           │
             │   ▼                           ▼
             │  ┌─────────────────────────────────────────────────────────────┐
             │  │                    Webhook Handler                          │
             │  │  stripe-webhook-billing                                     │
             │  │                                                             │
             │  │  Events:                                                    │
             │  │  • customer.subscription.created                            │
             │  │  • customer.subscription.updated                            │
             │  │  • customer.subscription.deleted                            │
             │  │  • invoice.paid                                             │
             │  │  • invoice.payment_failed                                   │
             │  │  • checkout.session.completed (for credit purchase)         │
             │  └─────────────────────────────────────────────────────────────┘
             │                           │
             └───────────────────────────┘
                  Real-time updates via Supabase subscriptions
```

## Subscription Plans

| Plan | Monthly | Yearly | Free Bookings | Free AI | Credits/mo | Rooms | Staff |
|------|---------|--------|---------------|---------|------------|-------|-------|
| Free | $0 | $0 | Unlimited (3.9% fee) | 0 | 0 | 3 | 3 |
| Starter | $49 | $470 | 30 | 30 | 100 | 5 | 5 |
| Professional | $99 | $950 | 60 | 60 | 200 | 15 | 25 |
| Enterprise | Custom | Custom | Unlimited | Unlimited | Custom | ∞ | ∞ |

## Credit Pricing

| Package | Credits | Price | Per Credit |
|---------|---------|-------|------------|
| Small | 100 | $9.99 | $0.10 |
| Medium | 250 | $19.99 | $0.08 |
| Large | 500 | $34.99 | $0.07 |
| XLarge | 1000 | $59.99 | $0.06 |

## Credit Costs

| Action | Credits |
|--------|---------|
| Extra Booking | 2 |
| Waiver Signed | 2 |
| Extra AI Conversation | 2 |

## API Endpoints (Edge Functions)

### stripe-billing

```typescript
// POST /functions/v1/stripe-billing
{
  action: 'create_subscription' | 'update_subscription' | 'cancel_subscription' 
        | 'buy_credits' | 'get_portal_link' | 'sync_invoices',
  organization_id: string,
  // ... action-specific params
}
```

### stripe-webhook-billing

```typescript
// POST /functions/v1/stripe-webhook-billing
// Stripe webhook signature verification
// Handles subscription and invoice events
```

## Security Considerations

1. **PCI Compliance**: Never store raw card numbers - use Stripe Elements
2. **Webhook Security**: Verify Stripe webhook signatures
3. **RLS Policies**: Organizations can only see their own billing data
4. **Audit Trail**: Log all credit transactions for accountability

## Module Structure

```
/src/modules/billing/
├── index.ts                    - Module exports
├── pages/
│   └── BillingPage.tsx        - Main billing page
├── components/
│   ├── CurrentPlanCard.tsx    - Active subscription display
│   ├── PlanSelector.tsx       - Plan comparison & selection
│   ├── CreditBalance.tsx      - Credit balance display
│   ├── CreditPurchase.tsx     - Buy credits dialog
│   ├── PaymentMethods.tsx     - Saved payment methods
│   ├── InvoiceHistory.tsx     - Past invoices
│   └── StripeElements.tsx     - Secure card inputs
├── hooks/
│   ├── useBilling.ts          - Main billing state
│   ├── useSubscription.ts     - Subscription management
│   └── useCredits.ts          - Credit balance & transactions
├── services/
│   └── billing.service.ts     - API calls to edge functions
└── types/
    └── index.ts               - TypeScript interfaces
```

## Implementation Checklist

- [ ] Create database tables (migration 084)
- [ ] Create Stripe products for subscription plans
- [ ] Create Stripe prices (monthly/yearly)
- [ ] Create credit package products/prices
- [ ] Implement stripe-billing edge function
- [ ] Implement stripe-webhook-billing edge function
- [ ] Create BillingPage and modular components
- [ ] Create billing service and hooks
- [ ] Set up Stripe webhook endpoint
- [ ] Test subscription lifecycle
- [ ] Test credit purchase flow
- [ ] Test webhook handling

---

*Last Updated: December 8, 2025*
*Version: 1.0.0*
