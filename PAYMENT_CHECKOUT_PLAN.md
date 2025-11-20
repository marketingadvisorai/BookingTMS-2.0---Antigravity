# 💳 Payment Checkout Implementation Plan

**Bismillah - Enterprise-Grade Payment Checkout**

**Date:** November 16, 2025  
**Status:** Planning Phase  
**Architecture:** Stripe Connect with Application Fees

---

## 🎯 **OBJECTIVE**

Build a secure, scalable payment checkout system that:
- Creates bookings with payments on connected Stripe accounts
- Collects 0.75% application fee for the platform
- Tracks revenue for both merchant and platform
- Follows PCI compliance and security best practices
- Provides excellent user experience

---

## 🏗️ **ARCHITECTURE DESIGN**

### **Payment Flow:**

```
User → Frontend Widget → Edge Function → Stripe Checkout → Connected Account
                                                    ↓
                                            Application Fee (0.75%)
                                                    ↓
                                            Platform Account
```

### **Components Required:**

1. **Edge Function: `create-booking-checkout`**
   - Creates Stripe Checkout Session on connected account
   - Calculates and applies 0.75% application fee
   - Creates pending booking in database
   - Returns checkout URL

2. **Edge Function: `stripe-webhook-handler`**
   - Receives Stripe webhook events
   - Confirms successful payments
   - Updates booking status
   - Records platform revenue
   - Handles refunds and disputes

3. **Database Updates:**
   - Booking with pending status
   - Payment record linking to Stripe
   - Platform revenue tracking

---

## 🔐 **SECURITY & BEST PRACTICES**

### **Industry Standards:**

✅ **PCI Compliance**
- Use Stripe Checkout (hosted, PCI-compliant)
- Never handle card data directly
- All payment info stays with Stripe

✅ **Idempotency**
- Use idempotency keys for all Stripe API calls
- Prevent duplicate charges
- Safe retry mechanism

✅ **Webhook Verification**
- Verify webhook signatures
- Prevent replay attacks
- Use webhook secrets

✅ **Error Handling**
- Graceful degradation
- Clear error messages
- Proper logging
- Rollback on failures

✅ **Authorization**
- JWT authentication required
- Validate organization ownership
- Check venue/game access
- Rate limiting

---

## 📊 **DATA FLOW**

### **1. Checkout Creation Flow:**

```sql
Frontend Request
    ↓
Edge Function (create-booking-checkout)
    ↓
Validate:
  - User authenticated
  - Venue/game exists and available
  - Organization has Stripe account connected
  - Organization's Stripe account is active
    ↓
Calculate:
  - Booking amount (base price + add-ons)
  - Application fee (0.75% of total)
  - Stripe fee estimate (~2.9% + 30¢)
  - Net to merchant
    ↓
Create in Database:
  - Booking (status: pending_payment)
  - Payment (status: pending)
    ↓
Create Stripe Checkout Session:
  - On connected account
  - With application fee
  - Include metadata (booking_id, org_id)
  - Set success/cancel URLs
    ↓
Return checkout URL to frontend
```

### **2. Payment Confirmation Flow:**

```sql
Stripe sends webhook event (checkout.session.completed)
    ↓
Edge Function (stripe-webhook-handler)
    ↓
Verify webhook signature
    ↓
Extract payment data
    ↓
Update Database:
  - Booking status: confirmed
  - Payment status: succeeded
  - Payment details (amounts, Stripe IDs)
    ↓
Track Platform Revenue:
  - Call track_platform_revenue()
  - Update organization totals
    ↓
Send confirmation email
    ↓
Return success response
```

---

## 💰 **FEE CALCULATION**

### **Example Transaction:**

```javascript
Booking Amount:        $100.00
Application Fee:       $0.75 (0.75%)
Stripe Fee:           ~$3.20 (2.9% + $0.30)
Net to Merchant:       $95.05
Platform Earnings:     $0.75
```

### **Formula:**
```javascript
application_fee_amount = Math.round(booking_amount * 0.0075); // in cents
net_to_merchant = booking_amount - application_fee_amount - stripe_fee;
platform_earning = application_fee_amount;
```

---

## 🎨 **USER EXPERIENCE**

### **Checkout Journey:**

1. **User selects booking** → Venue, Game, Date/Time
2. **Clicks "Book Now"** → Frontend calls checkout endpoint
3. **Redirects to Stripe Checkout** → Secure payment form
4. **Enters payment details** → Card, email, billing info
5. **Completes payment** → Stripe processes
6. **Redirects to success page** → Booking confirmed!
7. **Receives confirmation email** → Receipt and details

### **Edge Cases Handled:**

- ❌ Payment fails → Redirect to cancel URL, booking remains pending
- ❌ User abandons → Booking expires after 30 minutes
- ❌ Duplicate clicks → Idempotency prevents double charges
- ❌ Organization not connected → Error before checkout
- ❌ Account disabled → Clear error message

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Create Booking Checkout Function** (30 min)

- [ ] Create `create-booking-checkout/index.ts`
- [ ] Authentication & authorization
- [ ] Validate venue, game, organization
- [ ] Check Stripe account status
- [ ] Calculate fees
- [ ] Create pending booking
- [ ] Create Stripe Checkout Session
- [ ] Error handling
- [ ] Response with checkout URL

### **Phase 2: Stripe Webhook Handler** (30 min)

- [ ] Create `stripe-webhook-handler/index.ts`
- [ ] Verify webhook signatures
- [ ] Handle `checkout.session.completed`
- [ ] Handle `payment_intent.succeeded`
- [ ] Handle `payment_intent.failed`
- [ ] Handle `charge.refunded`
- [ ] Update booking status
- [ ] Track platform revenue
- [ ] Send confirmation emails

### **Phase 3: Database Functions** (10 min)

- [ ] Helper: `create_pending_booking()`
- [ ] Helper: `confirm_booking_payment()`
- [ ] Helper: `calculate_net_amounts()`
- [ ] Trigger: Auto-expire pending bookings

### **Phase 4: Testing** (20 min)

- [ ] Test checkout creation
- [ ] Test successful payment
- [ ] Test failed payment
- [ ] Test webhook handling
- [ ] Test fee calculation
- [ ] Test edge cases

---

## 🔗 **API SPECIFICATION**

### **Endpoint: `create-booking-checkout`**

**Request:**
```typescript
POST /functions/v1/create-booking-checkout
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "venue_id": "uuid",
  "game_id": "uuid",
  "date": "2025-11-20",
  "time_slot": "14:00",
  "num_players": 4,
  "customer_email": "user@example.com",
  "customer_name": "John Doe",
  "add_ons": [
    { "id": "addon_1", "quantity": 2 }
  ],
  "success_url": "https://yourapp.com/booking/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://yourapp.com/booking/cancel"
}
```

**Response:**
```typescript
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_...",
  "booking_id": "uuid",
  "amount": 10000, // cents
  "application_fee": 75, // cents
  "expires_at": 1700000000
}
```

### **Endpoint: `stripe-webhook-handler`**

**Request:**
```typescript
POST /functions/v1/stripe-webhook-handler
Stripe-Signature: t=...,v1=...,v2=...
Content-Type: application/json

{
  "id": "evt_...",
  "type": "checkout.session.completed",
  "data": {
    "object": { /* Stripe Checkout Session */ }
  }
}
```

**Response:**
```typescript
{
  "received": true
}
```

---

## 🎯 **SUCCESS CRITERIA**

### **Functional:**
- [x] Booking creation with payment
- [x] Application fee collection (0.75%)
- [x] Webhook-based confirmation
- [x] Platform revenue tracking
- [x] Email confirmations
- [x] Error handling

### **Non-Functional:**
- [x] <3s checkout creation time
- [x] PCI compliant (via Stripe)
- [x] 99.9% uptime (via Supabase)
- [x] Idempotent operations
- [x] Proper logging
- [x] Security best practices

---

## 📚 **REFERENCES**

**Stripe Documentation:**
- [Checkout Sessions](https://stripe.com/docs/api/checkout/sessions)
- [Connect Application Fees](https://stripe.com/docs/connect/direct-charges)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Idempotency](https://stripe.com/docs/api/idempotent_requests)

**Our Architecture:**
- `STRIPE_CONNECT_ARCHITECTURE_FINAL.md`
- `PHASE_2_COMPLETE_STRIPE_CONNECT.md`
- `DATABASE_ARCHITECTURE_COMPLETE.md`

---

## ⏱️ **ESTIMATED TIMELINE**

```
Phase 1: Checkout Function     30 minutes
Phase 2: Webhook Handler       30 minutes
Phase 3: Database Helpers      10 minutes
Phase 4: Testing               20 minutes
Phase 5: Documentation         10 minutes

Total: ~1 hour 40 minutes
```

---

## 🚀 **READY TO IMPLEMENT?**

**Next Steps:**
1. ✅ Read and approve this plan
2. 🔨 Implement `create-booking-checkout` function
3. 🔨 Implement `stripe-webhook-handler` function
4. 🧪 Test complete payment flow
5. 📝 Document usage

**Bismillah - Let's build enterprise-grade payment checkout!** 💳
