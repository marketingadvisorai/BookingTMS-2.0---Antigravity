# Stripe Secrets Configuration

## Secrets Set in Supabase Edge Functions

The following Stripe secrets have been configured in Supabase for Edge Functions to use:

| Secret Name | Purpose | Status |
|-------------|---------|--------|
| `STRIPE_SECRET_KEY` | Server-side Stripe API key for creating products/prices | ✅ Set |
| `STRIPE_PUBLISHABLE_KEY` | Client-side Stripe key (public) | ✅ Set |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | ✅ Set |

## How Secrets Were Set

Using Supabase CLI:

```bash
supabase secrets set STRIPE_SECRET_KEY="sk_test_..." --project-ref ohfjkcajnqvethmrpdwc
supabase secrets set STRIPE_PUBLISHABLE_KEY="pk_test_..." --project-ref ohfjkcajnqvethmrpdwc
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref ohfjkcajnqvethmrpdwc
```

## Verify Secrets

```bash
supabase secrets list --project-ref ohfjkcajnqvethmrpdwc
```

## Edge Functions Using These Secrets

1. **`stripe-manage-product`** - Creates/updates Stripe products and prices
   - Uses: `STRIPE_SECRET_KEY`

2. **`create-checkout-session`** - Creates Stripe Checkout Sessions
   - Uses: `STRIPE_SECRET_KEY`

3. **`verify-checkout-session`** - Verifies payment after checkout
   - Uses: `STRIPE_SECRET_KEY`

4. **`stripe-webhook`** - Handles Stripe webhook events
   - Uses: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Testing Stripe Integration

After secrets are set, test by:

1. Go to **Activities** → **Add Activity**
2. Complete all steps through **Step 6: Payment Settings**
3. Click **"Create Stripe Product & Enable Checkout"**
4. Should succeed and create product in Stripe
5. Complete **Step 8: Review & Publish**

## Source File

Secrets are stored locally in:
- `secrets.env` (gitignored, not committed to GitHub)

## Security Notes

- ✅ Secrets are encrypted in Supabase
- ✅ Only accessible to Edge Functions
- ✅ Not exposed to client-side code
- ✅ `secrets.env` is in `.gitignore`
- ⚠️ Using **test mode** keys (prefix: `sk_test_`, `pk_test_`)
- 🔴 For production, replace with **live mode** keys (prefix: `sk_live_`, `pk_live_`)

## Updating Secrets

To update a secret:

```bash
supabase secrets set SECRET_NAME="new_value" --project-ref ohfjkcajnqvethmrpdwc
```

Edge Functions will automatically use the new value on next invocation (no redeployment needed).
