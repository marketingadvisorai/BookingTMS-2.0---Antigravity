# Complete Payment System Testing Guide
## End-to-End Testing from Venues to Payment Success

**Date:** November 10, 2025, 11:00 PM

---

## 📋 Pre-Testing Setup

### 1. Install Required Packages
```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

### 2. Set Environment Variables
Create `.env` file in project root:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Deploy Edge Functions (if not done)
```bash
npx supabase functions deploy stripe-manage-product
npx supabase functions deploy create-payment-intent
npx supabase functions deploy stripe-webhook
```

---

## 🧪 COMPLETE TESTING FLOW

### Step 1: Create a Venue (if needed)

**Go to:** Venues Page (`/venues`)

**Action:** Click "Create Venue"

**Test Data:**
```json
{
  "name": "Test Escape Room Venue",
  "type": "Escape Room",
  "description": "Testing payment integration",
  "address": "123 Test Street",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94102",
  "country": "USA",
  "phone": "(555) 123-4567",
  "email": "test@venue.com",
  "primaryColor": "#2563eb"
}
```

**Expected Result:** ✅ Venue created successfully

---

### Step 2: Create a Game

**Go to:** Venues Page → Click "Configure" on your venue

**Action:** Click "Add Experience"

**Test Data:**
```json
{
  "name": "The Mystery Room",
  "description": "Solve the mystery before time runs out!",
  "duration": 60,
  "price": 30.00,
  "difficulty": "Medium",
  "min_players": 2,
  "max_players": 8,
  "status": "active"
}
```

**Expected Results:**
- ✅ Game created in database
- ✅ Stripe Product automatically created
- ✅ Stripe Price automatically created
- ✅ Game has `stripe_product_id` and `stripe_price_id`

**Check Stripe Dashboard:**
- Go to https://dashboard.stripe.com/test/products
- You should see "The Mystery Room" product with $30.00 price

---

### Step 3: Preview the Widget

**Go to:** Venues Page → Click "Preview" on your venue

**Expected Result:** ✅ CalendarWidget opens with your game visible

---

### Step 4: Book a Game

#### 4.1 Select Game, Date, Time

**Actions:**
1. Select game: "The Mystery Room"
2. Select date: Any future date (next week)
3. Select time slot: Any available slot
4. Select party size: 4 players

**Expected Result:** ✅ All selections work, no errors

#### 4.2 Add to Cart

**Action:** Click "Add to Cart"

**Expected Result:** ✅ Moves to cart step, shows booking summary

#### 4.3 Proceed to Checkout

**Action:** Click "Proceed to Checkout"

**Expected Result:** ✅ Moves to checkout step, shows customer form

---

### Step 5: Test Form Validation

#### Test Invalid Inputs:

**A. Invalid Email:**
```
Email: test@invalid  ❌
Expected: "Please enter a valid email address"
```

**B. Single Name:**
```
Name: John  ❌
Expected: "Please enter both first and last name"
```

**C. Short Phone:**
```
Phone: 123456  ❌
Expected: "Phone number must have at least 10 digits"
```

**D. Special Characters in Name:**
```
Name: John123 Doe  ❌
Expected: "Name can only contain letters, spaces, hyphens, and apostrophes"
```

#### Test Valid Inputs:

```
✅ Name: John Doe
✅ Email: john.doe@example.com
✅ Phone: (555) 123-4567
```

**Expected Result:** ✅ All errors clear, form validates

---

### Step 6: Apply Discount Codes (Optional)

#### Test Promo Code:

**If you have promo codes in database:**
```
Code: SAVE20
Expected: 20% discount applied, total updated
```

#### Test Gift Card:

**If you have gift cards in database:**
```
Code: GIFT-1234-5678
Expected: Gift card balance applied, total updated
```

#### Test Invalid Code:

```
Code: INVALID123  ❌
Expected: "Invalid promo code"
```

---

### Step 7: Complete Payment

**Action:** Click "Complete Payment $XX"

**Expected Results:**
1. ✅ Form validates all inputs
2. ✅ Loading message: "Creating your booking..."
3. ✅ Booking created in database
4. ✅ Payment intent created in Stripe
5. ✅ Success message: "Booking created! Proceeding to payment..."
6. ✅ Moves to PAYMENT step

**Check Database:**
```sql
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;
-- Should see your booking with status='pending'
```

---

### Step 8: Enter Payment Details

**Stripe Test Cards - Use these exact numbers:**

#### ✅ **SUCCESS - Card Approved:**
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

#### ❌ **DECLINE - Card Declined:**
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123
ZIP: 12345
```

#### 🔄 **REQUIRES AUTHENTICATION - 3D Secure:**
```
Card Number: 4000 0025 0000 3155
Expiry: 12/25
CVC: 123
ZIP: 12345
```

#### ❌ **INSUFFICIENT FUNDS:**
```
Card Number: 4000 0000 0000 9995
Expiry: 12/25
CVC: 123
ZIP: 12345
```

---

### Step 9: Test Successful Payment

**Use:** 4242 4242 4242 4242

**Actions:**
1. Enter card details above
2. Click "Pay $XX"

**Expected Results:**
1. ✅ Button shows "Processing Payment..."
2. ✅ Stripe processes payment
3. ✅ Payment succeeds
4. ✅ Webhook updates booking status to 'confirmed'
5. ✅ Promo/gift code usage recorded
6. ✅ Success message: "Payment successful! Booking confirmed."
7. ✅ Moves to SUCCESS step

**Check Database:**
```sql
SELECT * FROM bookings WHERE id = 'your-booking-id';
-- status should be 'confirmed'
-- payment_status should be 'paid'

SELECT * FROM payments WHERE booking_id = 'your-booking-id';
-- Should see payment record with status='succeeded'
```

**Check Stripe Dashboard:**
- Go to https://dashboard.stripe.com/test/payments
- You should see your payment with status "Succeeded"

---

### Step 10: Verify Success Page

**Expected Display:**
```
✓ Booking Confirmed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Number: BK-XXXXX
Game: The Mystery Room
Date & Time: Nov 15, 2025 at 6:00 PM
Players: 4 people
Total Paid: $120
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 A confirmation email has been sent to john.doe@example.com
```

**Expected Results:**
- ✅ Confirmation code displayed
- ✅ All booking details correct
- ✅ Email sent (check logs)
- ✅ "Book Another Experience" button works

---

## 🧪 TEST SCENARIOS

### Scenario 1: Happy Path (All Valid)
```
Flow: Game → Date → Time → Cart → Checkout → Valid Data → Payment → Success
Result: ✅ Booking confirmed, payment successful
```

### Scenario 2: Invalid Form Data
```
Flow: Game → Date → Time → Cart → Checkout → Invalid Email → Fix → Payment → Success
Result: ✅ Validation catches errors, allows correction
```

### Scenario 3: Payment Declined
```
Flow: Game → Date → Time → Cart → Checkout → Valid Data → Payment → Card 4000 0000 0000 0002
Result: ❌ Payment fails, stays on checkout, shows error
```

### Scenario 4: With Promo Code
```
Flow: Game → Date → Time → Cart → Checkout → Apply "SAVE20" → Payment → Success
Result: ✅ 20% discount applied, lower price charged
```

### Scenario 5: With Gift Card
```
Flow: Game → Date → Time → Cart → Checkout → Apply Gift Card → Payment → Success
Result: ✅ Gift card balance applied, reduced price or $0
```

### Scenario 6: Back Navigation
```
Flow: Game → Date → Time → Cart → Checkout → Payment → Back to Checkout
Result: ✅ Can go back, data preserved
```

---

## 📊 VALIDATION TESTING MATRIX

| Field | Valid Input | Invalid Input | Expected Error |
|-------|-------------|---------------|----------------|
| **Name** | John Doe | John | "Please enter both first and last name" |
| **Name** | Mary Jane | Mary123 | "Name can only contain letters..." |
| **Email** | john@example.com | john@invalid | "Please enter a valid email address" |
| **Email** | test@test.com | test@ | "Please enter a valid email address" |
| **Phone** | (555) 123-4567 | 12345 | "Phone number must have at least 10 digits" |
| **Phone** | 555-123-4567 | abc-def-ghij | "Phone number must have at least 10 digits" |

---

## 🎨 UI/UX TESTING

### Dark Mode:
- [ ] Switch to dark mode
- [ ] All colors render correctly
- [ ] Form inputs visible
- [ ] Payment form styled correctly

### Mobile Responsive:
- [ ] Open on mobile device
- [ ] All steps work
- [ ] Payment form usable
- [ ] Buttons accessible

### Loading States:
- [ ] "Creating your booking..." shows
- [ ] "Processing Payment..." shows
- [ ] Spinner animates
- [ ] Buttons disabled during processing

---

## 🔍 DEBUGGING CHECKLIST

### If Stripe packages not found:
```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

### If payment fails:
1. Check Stripe API keys in `.env`
2. Check Edge Functions deployed
3. Check Supabase database permissions
4. Check browser console for errors
5. Check Stripe Dashboard → Logs

### If webhook not working:
1. Check webhook endpoint configured in Stripe
2. Check webhook secret in environment
3. Check Edge Function logs
4. Test webhook manually

### If booking not created:
1. Check database schema (tables exist)
2. Check RLS policies
3. Check Supabase logs
4. Check browser network tab

---

## 📝 DEMO TEST DATA SUMMARY

### ✅ Valid Customer Data:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "(555) 123-4567"
}
```

### 💳 Stripe Test Cards:

**SUCCESS:**
```
4242 4242 4242 4242
Exp: 12/25 | CVC: 123
```

**DECLINE:**
```
4000 0000 0000 0002
Exp: 12/25 | CVC: 123
```

### 🎟️ Promo Codes (if in database):
```
SAVE20 - 20% off
SUMMER50 - 50% off
TEST10 - $10 off
```

### 🎁 Gift Cards (if in database):
```
GIFT-1234-5678-9012 - $50 balance
GIFT-ABCD-EFGH-IJKL - $100 balance
```

---

## ✅ SUCCESS CRITERIA

### Payment System is Working if:
- [ ] Form validation catches all errors
- [ ] Valid data passes validation
- [ ] Booking created in database
- [ ] Payment intent created in Stripe
- [ ] Test card 4242... completes payment
- [ ] Webhook updates booking status
- [ ] Success page shows correctly
- [ ] Email sent (in logs)
- [ ] Stripe Dashboard shows payment
- [ ] Database shows confirmed booking

---

## 🚀 PRODUCTION CHECKLIST

### Before going live:
- [ ] Switch to live Stripe keys
- [ ] Update webhook URL to production
- [ ] Test with real (small) payment
- [ ] Set up email service (SendGrid/etc)
- [ ] Monitor first few bookings
- [ ] Set up Stripe alerts
- [ ] Configure refund policies
- [ ] Test mobile thoroughly
- [ ] Load test payment flow
- [ ] Document for support team

---

## 📞 SUPPORT INFORMATION

### If issues occur:

1. **Check Console Logs**
   - Browser DevTools → Console
   - Look for red errors

2. **Check Stripe Dashboard**
   - Logs → View all logs
   - Find your payment attempt

3. **Check Supabase Logs**
   - Edge Functions → stripe-webhook → Logs
   - Look for errors

4. **Test Cards Not Working?**
   - Verify Stripe test mode enabled
   - Check API keys are test keys (start with pk_test_)
   - Try different test card

---

## 🎯 QUICK START TEST (5 Minutes)

1. **Install Packages:**
   ```bash
   npm install @stripe/react-stripe-js @stripe/stripe-js
   ```

2. **Go to Venues → Preview**

3. **Select Game, Date, Time (any)**

4. **Enter:**
   - Name: `John Doe`
   - Email: `test@example.com`
   - Phone: `5551234567`

5. **Click "Complete Payment"**

6. **Enter:**
   - Card: `4242 4242 4242 4242`
   - Exp: `12/25`
   - CVC: `123`

7. **Click "Pay"**

8. **See Success Page** ✅

---

**Happy Testing! 🎉**

If you encounter any issues, check the debugging section above or review the console logs for specific error messages.
