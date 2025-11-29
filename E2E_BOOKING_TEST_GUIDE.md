# E2E Booking Flow Test Guide

> **Version**: v0.1.56 | **Date**: November 30, 2025  
> **Status**: Ready for Production Testing

---

## Quick Start

### Test URLs

| Environment | Widget URL |
|-------------|------------|
| Local | `http://localhost:3001/embed-pro?key=emb_57fdcedc75b56c818aba35ed` |
| Preview | `http://localhost:3001/embed-pro?key=emb_57fdcedc75b56c818aba35ed&preview=true` |
| Production | `https://your-domain.com/embed-pro?key=emb_57fdcedc75b56c818aba35ed` |

### Test Activity

- **Name**: R+ STRIPE
- **Price**: $30.00
- **Stripe Product**: `prod_TUtUC9ZT9YKMfF`
- **Stripe Price**: `price_1SXthWFajiBPZ08xSucjakIP`

---

## E2E Test Flow

### Step 1: Load Widget
1. Navigate to widget URL
2. ✓ Widget loads with activity header
3. ✓ Calendar displays with current month
4. ✓ Available dates are highlighted in green

### Step 2: Select Date
1. Click on an available (green) date
2. ✓ Date is selected with visual feedback
3. ✓ Time slots appear below calendar

### Step 3: Select Time
1. Click on an available time slot
2. ✓ Time is selected
3. ✓ Party size selector appears

### Step 4: Select Party Size
1. Use +/- buttons to select number of guests
2. ✓ Price updates dynamically
3. ✓ Continue button enabled

### Step 5: Enter Customer Info
1. Fill in the checkout form:
   - Full Name: `Test Customer`
   - Email: `test@example.com`
   - Phone: `555-555-5555`
2. ✓ Form validates inputs
3. ✓ "Complete Booking" button appears

### Step 6: Stripe Checkout
1. Click "Complete Booking"
2. ✓ Redirected to Stripe Checkout
3. Enter test card details:
   ```
   Card: 4242 4242 4242 4242
   Exp: 12/30
   CVC: 123
   ZIP: 12345
   ```
4. ✓ Click "Pay"
5. ✓ Redirected to success page

### Step 7: Verify Booking
1. ✓ Success page shows booking confirmation
2. ✓ Booking reference number displayed
3. ✓ Customer receives confirmation email
4. ✓ Booking appears in admin dashboard

---

## Test Cards

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | `4242 4242 4242 4242` | Payment succeeds |
| Decline | `4000 0000 0000 0002` | Payment declined |
| Auth Required | `4000 0025 0000 3155` | 3D Secure prompt |
| Insufficient Funds | `4000 0000 0000 9995` | Payment declined |

**Common Details**:
- Expiration: Any future date (e.g., `12/30`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

---

## Verification Queries

### Check New Bookings
```sql
SELECT booking_number, activity_id, customer_id, 
       booking_date, start_time, party_size,
       total_amount, status, payment_status,
       created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 5;
```

### Check New Customers
```sql
SELECT first_name, last_name, email, phone,
       total_bookings, total_spent, created_via,
       created_at
FROM customers
ORDER BY created_at DESC
LIMIT 5;
```

### Verify Stripe Session
```sql
SELECT booking_number, stripe_checkout_session_id,
       stripe_payment_intent_id, payment_status
FROM bookings
WHERE stripe_checkout_session_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

---

## Webhook Verification

### Webhook URL
```
https://qftjyjpitnoapqxlrvfs.supabase.co/functions/v1/stripe-webhook
```

### Events Handled
- `checkout.session.completed` - Creates booking from widget checkout
- `payment_intent.succeeded` - Confirms direct payments
- `payment_intent.payment_failed` - Marks booking as failed
- `payment_intent.canceled` - Cancels booking

### Stripe Dashboard Setup
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter webhook URL above
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy **Signing secret** to Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`

---

## Architecture Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Embed Widget   │────▶│ create-checkout  │────▶│ Stripe Checkout │
│  /embed-pro     │     │  (Edge Func)     │     │     Session     │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Admin Panel    │◀────│  stripe-webhook  │◀────│   Stripe API    │
│   /bookings     │     │  (Edge Func)     │     │  (Webhook POST) │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌─────────────────┐     ┌────────────────────┐
          │  Create Booking │     │ Send Confirmation  │
          │  + Customer     │     │  Email (Resend)    │
          └─────────────────┘     └────────────────────┘
```

---

## Edge Functions

| Function | Status | Purpose |
|----------|--------|---------|
| `create-checkout-session` | ✅ Active v2 | Creates Stripe Checkout session |
| `verify-checkout-session` | ✅ Active v2 | Verifies completed sessions |
| `stripe-webhook` | ✅ Active v6 | Handles payment events |
| `create-booking` | ✅ Active v4 | Creates booking records |

---

## Troubleshooting

### Widget Not Loading
- Check embed_key is valid and active
- Verify activity has Stripe price configured
- Check browser console for errors

### Checkout Not Redirecting
- Verify Stripe keys in environment
- Check `create-checkout-session` function logs
- Ensure activity has valid `stripe_price_id`

### Booking Not Created After Payment
- Check `stripe-webhook` is registered in Stripe
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook function logs in Supabase

### Email Not Sent
- Verify Resend API key is configured
- Check `send-email` edge function exists
- Review webhook function logs for email errors

---

## Current Database State

- **Total Bookings**: 2
- **Confirmed**: 2
- **Paid**: 1
- **Last Booking**: 2025-11-29

---

## Success Criteria

- [ ] Widget loads correctly
- [ ] Date/time selection works
- [ ] Stripe checkout redirects properly
- [ ] Payment processes successfully
- [ ] Webhook creates booking
- [ ] Customer record created
- [ ] Confirmation email sent
- [ ] Booking appears in admin dashboard

---

## Next Steps After Testing

1. **Production Webhook**: Ensure webhook is registered in Stripe Dashboard
2. **Domain Setup**: Configure for production domain
3. **Email Templates**: Customize confirmation email branding
4. **Monitoring**: Set up alerts for failed webhooks

---

*Generated by BookingTMS 2.0 E2E Test Suite*
