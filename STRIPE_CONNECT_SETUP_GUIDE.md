# Stripe Connect Integration - Complete Setup Guide

## Overview

Complete Stripe Connect integration for managing connected accounts, balances, payouts, disputes, subscriptions, and platform fees from the System Admin Dashboard.

---

## Quick Start

### 1. Install Backend Dependencies

```bash
cd src/backend
npm install stripe express express-validator
npm install --save-dev @types/express @types/node
```

### 2. Configure Environment Variables

Add to `.env.backend`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Backend API
API_BASE_URL=http://localhost:3001
```

### 3. Run Database Migration

```bash
# Apply the Stripe Connect schema
supabase db push
```

### 4. Start Backend Server

```bash
cd src/backend
npm run dev
```

---

## Architecture

### Backend Structure

```
src/backend/
├── services/
│   └── stripe.service.ts (480+ LOC)
│       - createConnectedAccount()
│       - getConnectedAccountBalance()
│       - createPayout()
│       - listDisputes()
│       - createSubscription()
│       - updatePayoutSchedule()
│       + 25 more methods
│
├── api/routes/
│   └── stripe-connect.routes.ts (700+ LOC)
│       - POST /accounts
│       - GET /accounts/:id/balance
│       - POST /accounts/:id/payouts
│       - GET /accounts/:id/disputes
│       + 20 more endpoints
│
└── api/server.ts
    - Registers /api/stripe-connect routes
```

### Frontend Structure

```
src/
├── services/
│   └── stripeConnectService.ts (400+ LOC)
│       - Complete typed API client
│       - Error handling
│       - Type definitions
│
└── components/systemadmin/
    ├── StripeConnectAdminPanel.tsx (800+ LOC)
    │   - Real-time data fetching
    │   - Account management UI
    │   - Payout controls
    │   - Dispute viewer
    │
    └── PaymentsSubscriptionsSection.tsx
        - Integrates Connect panel for "All Accounts" view
```

### Database Schema

```sql
-- Tables Created:
1. stripe_connected_accounts
   - Stores account IDs and metadata
   - Platform fee configuration
   - Payout settings
   - Verification status

2. stripe_account_balances
   - Cached balance data
   - Reduces API calls
   - Tracks payouts/disputes

3. stripe_transactions_log
   - Transaction history
   - Charges, payouts, refunds, disputes
   - Quick access to recent activity

-- Views:
- stripe_accounts_with_balances
  (Joined view of accounts + balances + owners)

-- Functions:
- upsert_stripe_account_balance()
  (Atomic balance updates)
```

---

## API Endpoints

### Account Management

```typescript
// Create connected account
POST /api/stripe-connect/accounts
Body: {
  type: 'express' | 'custom' | 'standard',
  email: string,
  country: string,
  businessType?: 'individual' | 'company',
  capabilities?: string[],
  metadata?: Record<string, string>
}

// List all accounts
GET /api/stripe-connect/accounts?limit=100

// Get account details
GET /api/stripe-connect/accounts/:accountId

// Update account
PUT /api/stripe-connect/accounts/:accountId

// Delete account
DELETE /api/stripe-connect/accounts/:accountId
```

### Onboarding

```typescript
// Create account link (for redirect flow)
POST /api/stripe-connect/account-links
Body: {
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
  type?: 'account_onboarding' | 'account_update'
}

// Create account session (for embedded components)
POST /api/stripe-connect/account-sessions
Body: { accountId: string }
Response: { clientSecret: string }
```

### Balances & Payouts

```typescript
// Get balance
GET /api/stripe-connect/accounts/:accountId/balance

// Create manual payout
POST /api/stripe-connect/accounts/:accountId/payouts
Body: {
  amount: number,  // in dollars
  currency?: string,
  description?: string
}

// List payouts
GET /api/stripe-connect/accounts/:accountId/payouts?status=pending

// Update payout schedule
PUT /api/stripe-connect/accounts/:accountId/payout-schedule
Body: {
  interval: 'manual' | 'daily' | 'weekly' | 'monthly',
  delayDays?: number
}
```

### Transactions & Disputes

```typescript
// List charges
GET /api/stripe-connect/accounts/:accountId/charges?limit=100

// List disputes
GET /api/stripe-connect/accounts/:accountId/disputes?status=needs_response

// Update dispute evidence
PUT /api/stripe-connect/accounts/:accountId/disputes/:disputeId
Body: {
  evidence?: { customer_name: string, ... },
  metadata?: Record<string, string>
}
```

### Subscriptions

```typescript
// List subscriptions
GET /api/stripe-connect/accounts/:accountId/subscriptions

// Create subscription
POST /api/stripe-connect/accounts/:accountId/subscriptions
Body: {
  customerId: string,
  priceId: string,
  applicationFeePercent?: number  // Platform fee %
}
```

### Transfers & Fees

```typescript
// Create transfer
POST /api/stripe-connect/transfers
Body: {
  amount: number,
  currency: string,
  destination: string,  // Connected account ID
  description?: string
}

// List platform application fees
GET /api/stripe-connect/application-fees?limit=100
```

---

## Frontend Usage

### Import the Service

```typescript
import { stripeConnectService } from '@/services/stripeConnectService';
```

### Example: Create Connected Account

```typescript
const createAccount = async () => {
  const result = await stripeConnectService.createAccount({
    type: 'express',
    email: 'merchant@example.com',
    country: 'US',
    businessType: 'company',
  });
  
  console.log('Created account:', result.accountId);
};
```

### Example: Get Account Balance

```typescript
const getBalance = async (accountId: string) => {
  const { balance } = await stripeConnectService.getBalance(accountId);
  
  const availableUSD = balance.available.find(b => b.currency === 'usd');
  console.log('Available:', availableUSD.amount / 100, 'USD');
};
```

### Example: Trigger Payout

```typescript
const triggerPayout = async (accountId: string, amount: number) => {
  await stripeConnectService.createPayout({
    accountId,
    amount,  // in dollars
    currency: 'usd',
    description: 'Weekly payout',
  });
};
```

---

## Database Operations

### Store Connected Account in Database

```typescript
// After creating Stripe account, store in Supabase
const { data, error } = await supabase
  .from('stripe_connected_accounts')
  .insert({
    owner_id: ownerId,
    stripe_account_id: stripeAccountId,
    stripe_account_type: 'express',
    account_email: 'merchant@example.com',
    account_country: 'US',
    status: 'pending',
    platform_fee_percent: 2.5,  // Your platform fee
  });
```

### Update Balance Cache

```typescript
// Use the provided function for atomic updates
const { data, error } = await supabase
  .rpc('upsert_stripe_account_balance', {
    p_stripe_account_id: accountId,
    p_available_cents: 12450,
    p_pending_cents: 5000,
    p_currency: 'usd',
    p_pending_payouts: 2,
    p_active_disputes: 0,
  });
```

### Query Connected Accounts with Balances

```typescript
const { data } = await supabase
  .from('stripe_accounts_with_balances')
  .select('*')
  .eq('owner_id', ownerId);
```

---

## Best Practices

### Security

✅ **Always use server-side API calls** - Never expose `STRIPE_SECRET_KEY` to frontend
✅ **Store account IDs securely** - Encrypt sensitive data in database
✅ **Verify webhook signatures** - Use `stripe.webhooks.constructEvent()`
✅ **Implement rate limiting** - Protect API endpoints
✅ **Use RLS policies** - Supabase row-level security enabled

### Performance

✅ **Cache balance data** - Use `stripe_account_balances` table to reduce API calls
✅ **Batch API requests** - Use `Promise.all()` for parallel fetching
✅ **Paginate large lists** - Use `limit` parameter on list endpoints
✅ **Store recent transactions** - Use `stripe_transactions_log` for quick access

### Error Handling

```typescript
try {
  const result = await stripeConnectService.createPayout(params);
  // Handle success
} catch (error: any) {
  console.error('Payout failed:', error.message);
  // Show user-friendly error message
  // Log to monitoring system
}
```

### Webhooks

Set up webhooks to receive real-time updates:

```typescript
// Listen for events:
// - account.updated
// - payout.paid
// - charge.dispute.created
// - payment_intent.succeeded

// Webhook endpoint example
router.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'account.updated':
      // Update database
      break;
    case 'payout.paid':
      // Notify merchant
      break;
  }
  
  res.json({ received: true });
});
```

---

## Testing

### Test Mode

All development uses Stripe test keys (`sk_test_...`). Real money is never processed.

### Test Cards

```
4242 4242 4242 4242 - Succeeds
4000 0000 0000 9995 - Declines
4000 0025 0000 3155 - Requires authentication
```

### Test Connected Accounts

Create test accounts in dashboard or via API with test keys.

---

## Monitoring & Analytics

### Dashboard Metrics

The admin panel displays:
- Total connected accounts
- Total available balance across all accounts
- Active disputes count
- Pending payouts count
- Recent transaction activity

### Logging

All Stripe API calls are logged with:
- Request details
- Response status
- Error messages
- Timestamp

---

## Troubleshooting

### Common Issues

**Backend errors (express/stripe not found)**
- Run `npm install` in `src/backend/`
- Install type definitions: `npm i --save-dev @types/express @types/node`

**API connection errors**
- Check `VITE_BACKEND_API_URL` environment variable
- Ensure backend server is running on port 3001
- Verify CORS settings in `server.ts`

**Stripe API errors**
- Verify `STRIPE_SECRET_KEY` is correct
- Check account has Connect enabled
- Review Stripe Dashboard logs

**Database errors**
- Run migration: `supabase db push`
- Check RLS policies
- Verify `service_role` key is used for admin operations

---

## Next Steps

1. **Deploy Backend**: Deploy Express server to production (Render/Railway/Vercel)
2. **Configure Webhooks**: Add webhook endpoint in Stripe Dashboard
3. **Set Production Keys**: Replace test keys with live keys
4. **Test OAuth Flow**: Implement account linking for existing merchants
5. **Add Fee Controls**: Build UI for per-account platform fee configuration
6. **Implement Notifications**: Email/SMS alerts for payouts and disputes
7. **Build Reports**: Export transaction data and analytics

---

## Resources

- [Stripe Connect Docs](https://docs.stripe.com/connect)
- [Stripe API Reference](https://docs.stripe.com/api)
- [Connect Embedded Components](https://docs.stripe.com/connect/get-started-connect-embedded-components)
- [Webhooks Guide](https://docs.stripe.com/webhooks)
- [Account Types Comparison](https://docs.stripe.com/connect/accounts)

---

## Support

For issues or questions:
1. Check Stripe Dashboard logs
2. Review backend console logs
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
5. Refer to this documentation
