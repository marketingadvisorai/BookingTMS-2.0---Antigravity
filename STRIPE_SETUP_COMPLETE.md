# Stripe Payment System - Setup Guide
## Complete Implementation Ready

**Status:** ✅ Code Complete - Ready for Deployment  
**Date:** November 9, 2025

---

## 📦 What's Been Created

### 1. Database Schema ✅
- **File:** `supabase/migrations/create_payment_tables.sql`
- **Tables:**
  - `payments` - Payment transaction records
  - `refunds` - Refund records
  - `customers.stripe_customer_id` - Stripe customer linking
  - `bookings` - Payment status fields
  - `games` - Stripe product/price IDs

### 2. Edge Functions ✅
- **create-payment-intent** - Initialize Stripe payments
- **stripe-webhook** - Handle Stripe events

### 3. Frontend Components ✅
- **PaymentService** - Payment API client
- **PaymentForm** - Stripe payment form
- **PaymentWrapper** - Stripe Elements wrapper

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

```bash
# Copy the SQL and run in Supabase SQL Editor
# OR use Supabase CLI:
supabase db push
```

**SQL File:** `supabase/migrations/create_payment_tables.sql`

Go to: **Supabase Dashboard → SQL Editor → New Query**
Paste the entire migration file and click **Run**.

---

### Step 2: Install Stripe Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

### Step 3: Add Environment Variables

Create/update `.env` file:

```bash
# Stripe Publishable Key (frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Supabase (if not already set)
VITE_SUPABASE_URL=https://ohfjkcajnqvethmrpdwc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

### Step 4: Deploy Edge Functions

```bash
# Deploy create-payment-intent
supabase functions deploy create-payment-intent

# Deploy stripe-webhook
supabase functions deploy stripe-webhook
```

**OR** manually in Supabase Dashboard:
1. Go to **Edge Functions**
2. Create new function: `create-payment-intent`
3. Copy code from `supabase/functions/create-payment-intent/index.ts`
4. Deploy
5. Repeat for `stripe-webhook`

---

### Step 5: Configure Stripe Webhook

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:**
   ```
   https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/stripe-webhook
   ```
4. **Select events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

---

## 💳 How to Use in Your App

### Example: Add Payment to Booking Flow

```typescript
import { PaymentWrapper } from './components/payments/PaymentWrapper';

function BookingCheckout({ booking }) {
  const handlePaymentSuccess = () => {
    toast.success('Payment successful!');
    // Navigate to confirmation page
    navigate(`/booking-confirmation?id=${booking.id}`);
  };

  return (
    <div>
      <h2>Complete Your Booking</h2>
      
      <PaymentWrapper
        bookingId={booking.id}
        amount={booking.total_price}
        currency="USD"
        onSuccess={handlePaymentSuccess}
        onCancel={() => navigate('/bookings')}
      />
    </div>
  );
}
```

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)

```
✅ Success: 4242 4242 4242 4242
❌ Decline: 4000 0000 0000 0002
🔐 3D Secure: 4000 0025 0000 3155
```

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**ZIP:** Any 5 digits

### Test Flow

1. Create a booking
2. Go to payment page
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Check:
   - ✅ Payment record created in `payments` table
   - ✅ Booking status updated to `confirmed`
   - ✅ Payment status = `paid`
   - ✅ Webhook received in Supabase logs

---

## 📊 Database Queries

### Check Payment Status

```sql
SELECT 
  b.id,
  b.booking_date,
  b.payment_status,
  p.amount,
  p.status as payment_status,
  p.paid_at
FROM bookings b
LEFT JOIN payments p ON p.booking_id = b.id
WHERE b.id = 'YOUR_BOOKING_ID';
```

### View All Payments

```sql
SELECT 
  p.*,
  c.email as customer_email,
  b.booking_date
FROM payments p
JOIN customers c ON c.id = p.customer_id
JOIN bookings b ON b.id = p.booking_id
ORDER BY p.created_at DESC
LIMIT 50;
```

### Check Refunds

```sql
SELECT 
  r.*,
  p.amount as original_amount,
  b.booking_date
FROM refunds r
JOIN payments p ON p.id = r.payment_id
JOIN bookings b ON b.id = r.booking_id
ORDER BY r.created_at DESC;
```

---

## 🔐 Security Checklist

- ✅ Stripe Secret Key stored in Supabase Secrets
- ✅ Webhook signature verification enabled
- ✅ RLS policies on payment tables
- ✅ HTTPS only (Supabase handles this)
- ✅ No card data stored in database
- ✅ PCI compliance (Stripe handles card processing)

---

## 🎯 Next Steps

### Immediate (Required)
1. ✅ Run database migration
2. ✅ Install npm packages
3. ✅ Add environment variables
4. ✅ Deploy Edge Functions
5. ✅ Configure Stripe webhook

### Optional Enhancements
- [ ] Add refund functionality in admin panel
- [ ] Create payment history page
- [ ] Add invoice generation
- [ ] Implement subscription billing
- [ ] Add coupon/discount support
- [ ] Create payment analytics dashboard

---

## 📝 Usage Examples

### Create Payment Intent

```typescript
import { PaymentService } from './lib/payments/paymentService';

const response = await PaymentService.createPaymentIntent({
  bookingId: 'booking-123',
  amount: 49.99,
  currency: 'usd'
});

console.log(response.clientSecret); // Use with Stripe Elements
```

### Get Payment Status

```typescript
const payment = await PaymentService.getPaymentByBooking('booking-123');
console.log(payment.status); // 'succeeded', 'pending', etc.
```

### Get Customer Payments

```typescript
const payments = await PaymentService.getCustomerPayments('customer-123');
console.log(payments); // Array of payment records
```

---

## 🐛 Troubleshooting

### Payment Intent Creation Fails

**Check:**
1. Stripe Secret Key is set in Supabase Secrets
2. Edge Function is deployed
3. Booking exists in database
4. Customer record exists

**Debug:**
```bash
# View Edge Function logs
supabase functions logs create-payment-intent
```

### Webhook Not Receiving Events

**Check:**
1. Webhook URL is correct
2. Webhook secret is set in Supabase
3. Events are selected in Stripe Dashboard
4. Endpoint is active (not disabled)

**Debug:**
```bash
# View webhook logs
supabase functions logs stripe-webhook
```

### Payment Succeeds but Booking Not Updated

**Check:**
1. Webhook is configured correctly
2. Check webhook logs for errors
3. Verify booking ID in payment metadata

---

## 💰 Pricing

**Stripe Fees:**
- 2.9% + $0.30 per successful card charge
- No monthly fees
- No setup fees

**Example:**
- $50 booking = $1.75 fee
- You receive: $48.25

---

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Elements](https://stripe.com/docs/stripe-js)

---

## ✅ Checklist

**Setup:**
- [ ] Database migration run
- [ ] Stripe packages installed
- [ ] Environment variables set
- [ ] Edge Functions deployed
- [ ] Webhook configured

**Testing:**
- [ ] Test payment with test card
- [ ] Verify booking status updates
- [ ] Check payment record created
- [ ] Test webhook events

**Production:**
- [ ] Switch to live Stripe keys
- [ ] Update webhook to production URL
- [ ] Test with real card (small amount)
- [ ] Monitor first transactions

---

**Status:** 🎉 Ready to Deploy!  
**Estimated Setup Time:** 30-45 minutes  
**Next:** Run database migration and deploy Edge Functions
