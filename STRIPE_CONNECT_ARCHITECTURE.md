# Stripe Connect Architecture - Platform vs Connected Accounts

## Overview

This document explains the correct Stripe Connect architecture for the Booking TMS platform.

## Architecture Model

### Platform Account (Mother Account)
- **Your Stripe Account**: `acct_1SPfkcFajiBPZ08x`
- **Display Name**: `Booking TMS Beta Stripe V 0.1`
- **Purpose**: This is the main platform Stripe account that OWNS the Connect integration
- **Visibility**: Shows ONLY in System Admin dashboard when NO organization is selected
- **Storage**: Stored in environment variables, NOT in the database

### Connected Accounts (Organization Accounts)
- **Purpose**: Individual Stripe accounts for each organization
- **Relationship**: These accounts connect UNDER the platform account via Stripe Connect
- **Visibility**: Shows in System Admin when a specific organization IS selected
- **Storage**: Stored in `public.organizations.stripe_account_id` in Supabase

## How It Works

### 1. System Admin Dashboard - No Organization Selected
```
Account ID: acct_1SPfkcFajiBPZ08x
Account name: Booking TMS Beta Stripe V 0.1
```
This shows YOUR platform account details.

### 2. System Admin Dashboard - Organization Selected
```
Account ID: acct_XYZ123... (from organizations.stripe_account_id)
Account name: Organization Name (from organizations.name)
```
This shows the CONNECTED account for that specific organization.

### 3. Individual Organization Settings
When an organization owner logs into their own settings, they should see:
- Their OWN connected account details
- NOT the platform account
- Ability to create/link their Stripe Connect account

## Environment Variables

```bash
# Platform/Mother Account (System Admin only)
VITE_STRIPE_PLATFORM_ACCOUNT_ID=acct_1SPfkcFajiBPZ08x
VITE_STRIPE_PLATFORM_ACCOUNT_NAME=Booking TMS Beta Stripe V 0.1
```

## Database Schema

```sql
-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_account_id TEXT,  -- Connected account ID (NOT platform account)
  stripe_onboarding_status TEXT,
  -- ... other fields
);
```

## OAuth Flow

When an organization links their existing Stripe account:

1. Organization clicks "Link Existing Stripe Account"
2. OAuth flow redirects to Stripe
3. User authorizes connection
4. Backend receives `stripe_user_id` (the connected account ID)
5. Backend stores `stripe_user_id` in `organizations.stripe_account_id`
6. This connected account is now UNDER the platform account

## Payment Flow

```
Customer Payment
    ↓
Platform Account (acct_1SPfkcFajiBPZ08x)
    ↓
Connected Account (acct_XYZ123... from org)
    ↓
Organization receives funds (minus platform fee)
```

## Key Points

✅ **Correct**: Platform account shows in System Admin when no org selected
✅ **Correct**: Connected accounts show when specific org is selected
✅ **Correct**: Each organization has their own `stripe_account_id`
✅ **Correct**: All connected accounts are UNDER the platform account

❌ **Wrong**: Showing platform account in individual org settings
❌ **Wrong**: Storing platform account ID in organizations table
❌ **Wrong**: Mixing up platform account with connected accounts

## Implementation

### PaymentsSubscriptionsSection.tsx
```tsx
// Platform/Mother Account (shown when no org selected) vs Connected Accounts (shown per org)
const stripeAccountId = selectedAccount?.stripeAccountId 
  || import.meta.env.VITE_STRIPE_PLATFORM_ACCOUNT_ID 
  || 'acct_1SPfkcFajiBPZ08x';

const stripeAccountName = selectedAccount 
  ? selectedAccount.name  // Organization name when org is selected
  : (import.meta.env.VITE_STRIPE_PLATFORM_ACCOUNT_NAME 
     || 'Booking TMS Beta Stripe V 0.1'); // Platform name when no org selected
```

## Verification

Use Stripe CLI to verify:

```bash
# List all connected accounts under your platform
stripe accounts list

# View platform account details
stripe accounts retrieve acct_1SPfkcFajiBPZ08x

# View a specific connected account
stripe accounts retrieve acct_XYZ123...
```

## Summary

- **1 Platform Account** (yours): Shows in System Admin only
- **N Connected Accounts** (organizations): Each org gets their own
- **Stripe Connect Model**: Organizations connect UNDER your platform
- **Payment Processing**: Platform account routes payments to connected accounts
