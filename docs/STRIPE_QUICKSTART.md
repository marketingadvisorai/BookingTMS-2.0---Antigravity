# Stripe Integration Quick Start Guide

Get started with Stripe integration in 5 minutes!

---

## Prerequisites

- Stripe account (test mode)
- Supabase project
- Environment variables configured

---

## Step 1: Configure Stripe Keys

### Get Your Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** and **Secret key**

### Add to Environment

**Frontend (.env or environment):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Supabase Edge Function:**
```bash
# Set via Supabase CLI or dashboard
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
```

---

## Step 2: Deploy Edge Function

```bash
# Navigate to project root
cd /path/to/project

# Deploy Stripe management function
supabase functions deploy stripe-manage-product

# Verify deployment
supabase functions list
# Should show: stripe-manage-product (ACTIVE)
```

---

## Step 3: Create Your First Game

### Via Admin Dashboard

1. **Navigate** to Venues page
2. **Select** your venue (or create one)
3. **Click** "Configure Widget" or "Add Experience"
4. **Follow the 7-step wizard:**

   **Step 1 - Basic Info:**
   - Name: "My First Escape Room"
   - Description: Clear description
   - Category: Choose appropriate category

   **Step 2 - Capacity & Pricing:**
   - Adult Price: $35
   - Child Price: $25 (optional)
   - Min/Max adults: 2-8

   **Step 3 - Game Details:**
   - Duration: 60 minutes
   - Difficulty: Medium
   - Languages: English
   
   **Step 4 - Media:**
   - Upload cover image (optional)
   
   **Step 5 - Schedule:**
   - Operating days: Select days
   - Hours: 10:00 AM - 10:00 PM
   - Slot interval: 90 minutes
   
   **Step 6 - Widget:**
   - Select "Calendar Single Event"
   
   **Step 7 - Review:**
   - Review all details
   - Click "Publish Game"

5. **Watch progress:**
   - 20% - Preparing data
   - 40% - Creating Stripe product ✅
   - 70% - Saving to database
   - 90% - Verifying
   - 100% - Success!

6. **See success screen** with game details

---

## Step 4: Verify in Stripe

1. Open https://dashboard.stripe.com/test/products
2. Find your game: "My First Escape Room"
3. Click to view details
4. Check metadata includes:
   - `game_id`
   - `venue_id`
   - `adult_price`
   - `pricing_summary`

---

## Step 5: Test Booking

### Create Test Booking

1. **Get embed URL** from Step 6 of wizard
2. **Open** in browser (or embed on your site)
3. **Select date and time**
4. **Enter customer details:**
   - Name: Test User
   - Email: test@example.com
   - Phone: 555-0100

5. **Choose payment method:** "Secure Checkout"
6. **Click** "Create Booking"

### Test Payment

7. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

8. **Complete payment**
9. **Verify success** page appears
10. **Check Stripe Dashboard:**
    - https://dashboard.stripe.com/test/payments
    - Should see successful payment

---

## Common Issues & Fixes

### Issue: "Game pricing not configured"

**Cause:** Stripe integration failed during creation

**Fix:**
```sql
-- Check game status
SELECT name, stripe_price_id, stripe_sync_status 
FROM games 
WHERE name = 'My First Escape Room';

-- If stripe_price_id is NULL:
-- 1. Check Edge Function logs
-- 2. Verify Stripe API key
-- 3. Recreate game
```

### Issue: Edge Function not working

**Fix:**
```bash
# Check function status
supabase functions list

# View logs
supabase functions logs stripe-manage-product

# Redeploy
supabase functions deploy stripe-manage-product
```

### Issue: Payment redirect fails

**Fix:**
1. Check publishable key in frontend
2. Verify success/cancel URLs are correct
3. Check browser console for errors
4. Ensure Stripe price ID exists

---

## Testing Checklist

- [ ] Edge Function deployed and active
- [ ] Stripe API keys configured
- [ ] Game created with Stripe product
- [ ] Game has `stripe_price_id` in database
- [ ] Booking widget loads game
- [ ] Payment button enabled
- [ ] Test card payment succeeds
- [ ] Booking record created
- [ ] Payment appears in Stripe Dashboard

---

## Next Steps

### Production Deployment

1. **Switch to Live Keys:**
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
   ```

2. **Configure Webhooks:**
   - Endpoint: `https://[project].supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `charge.refunded`

3. **Enable Payment Methods:**
   - Credit/Debit cards (enabled by default)
   - Apple Pay / Google Pay (optional)
   - Bank transfers (optional)

4. **Set Up Monitoring:**
   - Stripe Dashboard alerts
   - Supabase logs monitoring
   - Payment failure notifications

### Advanced Features

- [ ] Add refund processing
- [ ] Implement subscription billing
- [ ] Add coupon/discount codes
- [ ] Create revenue reports
- [ ] Set up recurring payments

---

## Support Resources

- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project Docs:** `/docs/STRIPE_INTEGRATION.md`
- **Changelog:** `/CHANGELOG.md`

---

## Quick Commands Reference

```bash
# Deploy Edge Function
supabase functions deploy stripe-manage-product

# View logs
supabase functions logs stripe-manage-product --tail

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_xxx

# List secrets (names only)
supabase secrets list

# Test Edge Function
curl -X POST https://[PROJECT].supabase.co/functions/v1/stripe-manage-product \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"action":"create_product","name":"Test","description":"Test"}'
```

---

**🎉 You're all set!** Your Stripe integration is ready for bookings.

For detailed documentation, see [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)
