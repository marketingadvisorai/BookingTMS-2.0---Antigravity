# Stripe Connect Testing Guide

## Prerequisites

Before testing the Connected Accounts Management feature, you need to:

### 1. Enable Stripe Connect

1. Go to https://dashboard.stripe.com/test/connect/accounts/overview
2. Click "Get started with Connect" if you haven't already
3. Complete the Connect onboarding process
4. This will enable you to create connected accounts

### 2. Get Your Connect Client ID

1. Go to https://dashboard.stripe.com/test/settings/applications
2. Find your "Client ID" under "Connect settings"
3. Add it to your `.env` file:
   ```bash
   STRIPE_CONNECT_CLIENT_ID=ca_xxxxxxxxxxxxx
   ```

## Testing with Stripe CLI

### Test 1: List Connected Accounts (Currently Empty)

```bash
stripe accounts list --limit 10
```

**Expected Output:**
```json
{
  "object": "list",
  "data": [],
  "has_more": false,
  "url": "/v1/accounts"
}
```

### Test 2: Create Test Connected Accounts

**Note:** You need to enable Stripe Connect first (see Prerequisites above).

Once Connect is enabled, you can create test accounts:

```bash
# Create Express account
stripe accounts create \
  --type=express \
  --country=US \
  --email="test1@example.com" \
  --business_type=individual

# Create another Express account
stripe accounts create \
  --type=express \
  --country=US \
  --email="test2@example.com" \
  --business_type=individual
```

### Test 3: Retrieve Account Details

```bash
# Replace acct_xxx with your account ID
stripe accounts retrieve acct_xxx
```

### Test 4: Get Account Balance

```bash
# Replace acct_xxx with your account ID
stripe balance retrieve --stripe-account acct_xxx
```

### Test 5: List Payouts for an Account

```bash
# Replace acct_xxx with your account ID
stripe payouts list --stripe-account acct_xxx --limit 10
```

### Test 6: List Disputes for an Account

```bash
# Replace acct_xxx with your account ID
stripe disputes list --stripe-account acct_xxx --limit 10
```

## Testing the Backend API

### Start the Backend Server

```bash
cd src/backend
npm install
npm run build
npm start
```

The server should start on `http://localhost:3001`

### Test API Endpoints

#### 1. List All Connected Accounts

```bash
curl http://localhost:3001/api/stripe-connect-accounts/list
```

**Expected Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": "acct_xxx",
      "email": "test1@example.com",
      "balance": {
        "available": 0,
        "pending": 0,
        "currency": "usd"
      },
      "pending_payouts": {
        "amount": 0,
        "count": 0
      },
      "disputes": {
        "count": 0,
        "total": 0
      },
      "last_payout": null,
      "charges_enabled": false,
      "payouts_enabled": false
    }
  ],
  "total": 1
}
```

#### 2. Get Recent Transactions

```bash
curl http://localhost:3001/api/stripe-connect-accounts/transactions?limit=10
```

#### 3. Get Account Details

```bash
# Replace acct_xxx with your account ID
curl http://localhost:3001/api/stripe-connect-accounts/acct_xxx/details
```

#### 4. Trigger Manual Payout

```bash
# Replace acct_xxx with your account ID
curl -X POST http://localhost:3001/api/stripe-connect-accounts/acct_xxx/payout \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "usd"}'
```

## Testing the Frontend

### 1. Start the Frontend

```bash
npm install
npm run dev
```

### 2. Navigate to System Admin Dashboard

1. Open http://localhost:5173 (or your dev server URL)
2. Navigate to System Admin Dashboard
3. Select "All Accounts" from the dropdown

### 3. Verify Components Display

You should see two new sections:

#### Connected Accounts Management
- Shows all connected Stripe accounts
- Displays balances, pending payouts, disputes
- Search and filter functionality
- Sync button to refresh data
- Links to Stripe Dashboard

#### Recent Transaction Activity
- Shows recent payouts and disputes
- Clickable transactions
- Status badges
- "View All Transactions" button

## Troubleshooting

### Issue: "You can only create new accounts if you've signed up for Connect"

**Solution:**
1. Go to https://dashboard.stripe.com/test/connect/accounts/overview
2. Click "Get started with Connect"
3. Complete the onboarding process

### Issue: Backend API returns 500 error

**Check:**
1. Stripe secret key is correct in `.env`
2. Backend server is running
3. Check backend console for error messages

### Issue: Frontend shows "No connected accounts found"

**Check:**
1. Backend API is accessible
2. You have created connected accounts in Stripe
3. Check browser console for errors
4. Verify API URL in frontend `.env`

### Issue: Components not showing in dashboard

**Check:**
1. You have selected "All Accounts" (not a specific organization)
2. Components only show when no specific account is selected
3. Check browser console for errors

## Creating Test Data

### Simulate a Connected Account with Balance

1. Create a connected account
2. Create a test payment intent for that account:

```bash
stripe payment_intents create \
  --amount=5000 \
  --currency=usd \
  --stripe-account=acct_xxx \
  --payment-method=pm_card_visa \
  --confirm=true
```

3. This will add balance to the account
4. Refresh the dashboard to see the updated balance

### Simulate a Payout

```bash
stripe payouts create \
  --amount=1000 \
  --currency=usd \
  --stripe-account=acct_xxx
```

### Simulate a Dispute

```bash
# First create a charge
stripe charges create \
  --amount=2000 \
  --currency=usd \
  --source=tok_createDispute \
  --stripe-account=acct_xxx

# The dispute will be created automatically
```

## Next Steps

1. **Enable Stripe Connect** in your dashboard
2. **Create test connected accounts** using Stripe CLI
3. **Start the backend server** and test API endpoints
4. **Start the frontend** and verify components display
5. **Test search and filtering** functionality
6. **Test payout triggering** (requires account with balance)
7. **Verify Stripe Dashboard links** work correctly

## Production Deployment

Before deploying to production:

1. ✅ Ensure Stripe Connect is enabled in production
2. ✅ Add production Stripe keys to Render environment variables
3. ✅ Test OAuth flow with real connected accounts
4. ✅ Verify webhook endpoints are configured
5. ✅ Test payout functionality with real accounts
6. ✅ Set up monitoring and error tracking

## Useful Stripe CLI Commands

```bash
# View Stripe CLI help
stripe --help

# List all accounts
stripe accounts list

# View account details
stripe accounts retrieve acct_xxx

# View balance
stripe balance retrieve --stripe-account acct_xxx

# List payouts
stripe payouts list --stripe-account acct_xxx

# List disputes
stripe disputes list --stripe-account acct_xxx

# View webhook events
stripe events list --limit 10

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/payments/webhook
```

## Documentation Links

- [Stripe Connect Overview](https://stripe.com/docs/connect)
- [Creating Connected Accounts](https://stripe.com/docs/connect/accounts)
- [Testing Connect](https://stripe.com/docs/connect/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Connect API Reference](https://stripe.com/docs/api/accounts)
