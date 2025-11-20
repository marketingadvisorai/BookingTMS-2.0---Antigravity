# 🎯 Kings Eye Escape - Complete Stripe Integration Demo Guide

**Date:** November 12, 2025  
**Status:** ✅ READY FOR TESTING  
**Venue:** Kings Eye Escape  
**Games Created:** 3  
**Demo Orders Required:** 4

---

## ✅ COMPLETED SETUP

### 1. Stripe Products Created ✅

| Game | Stripe Product ID | Stripe Price ID | Price |
|------|-------------------|-----------------|-------|
| **The Pharaohs Curse** | `prod_TPVRqID3XeNeBU` | `price_1SSgQgFajiBPZ08xCHTy6B6K` | $40.00 |
| **Prison Break** | `prod_TPVRfGg6PoiByx` | `price_1SSgQuFajiBPZ08xJ12ye7A4` | $45.00 |
| **Zombie Apocalypse** | `prod_TPVRuc46ceWMXN` | `price_1SSgR6FajiBPZ08xgneJhcL0` | $40.00 |

### 2. Games Added to Database ✅

**Venue ID:** `61995174-88be-4022-850c-33df9fc29c69`  
**Venue Name:** Kings Eye Escape

**Game 1: The Pharaohs Curse**
- Duration: 60 minutes
- Difficulty: Medium
- Min Players: 2 | Max Players: 8
- Price: $40/person (Adult) | $30/person (Child)
- Min Age: 12
- Success Rate: 65%
- Status: Active ✅
- Stripe Sync: ✅ Synced

**Game 2: Prison Break**
- Duration: 75 minutes
- Difficulty: Hard
- Min Players: 3 | Max Players: 10
- Price: $45/person (Adult) | $35/person (Child)
- Min Age: 14
- Success Rate: 55%
- Status: Active ✅
- Stripe Sync: ✅ Synced

**Game 3: Zombie Apocalypse**
- Duration: 60 minutes
- Difficulty: Hard
- Min Players: 4 | Max Players: 12
- Price: $40/person (Adult) | $30/person (Child)
- Min Age: 16
- Success Rate: 45%
- Status: Active ✅
- Stripe Sync: ✅ Synced

### 3. Payment Flow Fixed ✅

**CRITICAL FIX Applied:**
- ❌ **REMOVED:** Embedded payment form (custom card fields)
- ❌ **REMOVED:** "Pay Here" option  
- ✅ **IMPLEMENTED:** Stripe Checkout redirect ONLY
- ✅ **FOLLOWS:** Stripe best practices
- ✅ **SECURE:** Bank-level encryption

**What Users See Now:**
1. Select game, date, time
2. Fill contact information
3. Click "Go to Secure Checkout $XX"
4. **Redirect to Stripe hosted checkout page** ← NEW
5. Complete payment on Stripe
6. Redirect to success page

---

## 🧪 4 DEMO ORDERS TO COMPLETE

### Demo Order 1: The Pharaohs Curse - Standard Booking ✅

**Test Scenario:** Basic adult booking  
**Expected Result:** Successful payment and booking confirmation

**Steps:**
1. Go to: https://bookingtms-frontend.onrender.com
2. Navigate to: Kings Eye Escape venue
3. Select: **The Pharaohs Curse**
4. Date: Tomorrow or any available date
5. Time: 2:00 PM
6. Party Size: 4 adults
7. Fill customer info:
   - Name: John Doe
   - Email: johndoe@test.com
   - Phone: +1-555-123-4567
8. Click: "Go to Secure Checkout $160"
9. **Verify:** Redirect to Stripe Checkout
10. **Use test card:** `4242 4242 4242 4242`
11. Expiry: 12/30 | CVC: 123
12. Click: "Pay"
13. **Verify:** Redirect to booking success page
14. **Check:** Confirmation email sent
15. **Check database:** Booking status = 'confirmed', payment_status = 'paid'

**Expected Total:** $160 (4 × $40)

---

### Demo Order 2: Prison Break - Mixed Adults & Children ✅

**Test Scenario:** Family booking with children  
**Expected Result:** Correct price calculation for mixed party

**Steps:**
1. Go to widget
2. Select: **Prison Break**
3. Date: Tomorrow + 1 day
4. Time: 6:00 PM
5. Party Size: 3 adults + 2 children = 5 total
6. Fill customer info:
   - Name: Sarah Johnson
   - Email: sarah.johnson@test.com
   - Phone: +1-555-234-5678
7. Click: "Go to Secure Checkout"
8. **Verify:** Redirect to Stripe
9. **Use test card:** `4242 4242 4242 4242`
10. Complete payment
11. **Verify:** Success page shows correct breakdown

**Expected Total:** $205 (3 × $45 + 2 × $35)

---

### Demo Order 3: Zombie Apocalypse - Large Group ✅

**Test Scenario:** Maximum capacity booking  
**Expected Result:** System handles large party correctly

**Steps:**
1. Go to widget
2. Select: **Zombie Apocalypse**
3. Date: This weekend (Saturday)
4. Time: 8:00 PM
5. Party Size: 10 adults (near max capacity of 12)
6. Fill customer info:
   - Name: Michael Chen
   - Email: michael.chen@test.com
   - Phone: +1-555-345-6789
7. Click: "Go to Secure Checkout $400"
8. **Verify:** Redirect to Stripe
9. **Use test card:** `4242 4242 4242 4242`
10. Complete payment
11. **Verify:** Booking confirmed for large group

**Expected Total:** $400 (10 × $40)

---

### Demo Order 4: The Pharaohs Curse - Payment Failure Test ✅

**Test Scenario:** Declined card / cancelled payment  
**Expected Result:** Proper error handling and cancellation flow

**Steps:**
1. Go to widget
2. Select: **The Pharaohs Curse**
3. Date: Next week
4. Time: 4:00 PM
5. Party Size: 2 adults
6. Fill customer info:
   - Name: Test Failure
   - Email: testfail@test.com
   - Phone: +1-555-456-7890
7. Click: "Go to Secure Checkout $80"
8. **Verify:** Redirect to Stripe
9. **Option A - Cancel:** Click browser back button
10. **Option B - Decline:** Use card `4000 0000 0000 0002`
11. **Verify:** Error message shown OR
12. **Verify:** Redirect to booking-cancelled page
13. **Check database:** Booking status stays 'pending' or is cancelled

**Expected Total:** $80 (2 × $40)  
**Expected Result:** Payment NOT processed

---

## 📊 Verification Checklist

### After Each Order:

#### 1. Frontend Verification ✅
- [ ] User redirected to Stripe hosted checkout
- [ ] Correct game name displayed
- [ ] Correct date and time shown
- [ ] Correct party size displayed
- [ ] Correct total amount shown
- [ ] Stripe accepts test card
- [ ] Success page loads after payment
- [ ] Booking reference number shown

#### 2. Database Verification ✅
```sql
-- Check latest bookings
SELECT 
  id,
  game_id,
  booking_date,
  start_time,
  party_size,
  customer_name,
  customer_email,
  total_price,
  status,
  payment_status,
  stripe_session_id
FROM bookings 
WHERE venue_id = '61995174-88be-4022-850c-33df9fc29c69'
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected Values:**
- `status`: 'confirmed' (for successful payments)
- `payment_status`: 'paid' (for successful payments)
- `stripe_session_id`: 'cs_test_xxxxx' (session ID present)
- `total_price`: Matches calculated amount
- `booking_date`: Correct date
- `start_time`: In HH:MM format (e.g., '14:00', not '02:30 PM:00')

#### 3. Stripe Dashboard Verification ✅
1. Go to: https://dashboard.stripe.com/test/payments
2. Find the payment by customer email
3. **Verify:**
   - Status: Succeeded
   - Amount: Matches booking total
   - Customer email: Matches form input
   - Metadata contains:
     - `booking_id`
     - `game_id`
     - `venue_id`

---

## 🎓 Test Cards Reference

### Successful Payments:
| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `5555 5555 5555 4444` | Mastercard succeeds |

### Failed Payments:
| Card Number | Scenario |
|-------------|----------|
| `4000 0000 0000 0002` | Card declined (generic) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |

**Note:** Use any future expiry date (e.g., 12/30) and any CVC (e.g., 123)

---

## 🚀 Quick Access Links

### Frontend:
- **Main App:** https://bookingtms-frontend.onrender.com
- **Kings Eye Escape Venue:** https://bookingtms-frontend.onrender.com/venues/61995174-88be-4022-850c-33df9fc29c69

### Admin:
- **Dashboard:** https://bookingtms-frontend.onrender.com/admin
- **Bookings Page:** https://bookingtms-frontend.onrender.com/bookings
- **Games Management:** https://bookingtms-frontend.onrender.com/venues/61995174-88be-4022-850c-33df9fc29c69/games

### Stripe:
- **Test Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Products:** https://dashboard.stripe.com/test/products
- **Payments:** https://dashboard.stripe.com/test/payments
- **Customers:** https://dashboard.stripe.com/test/customers

### Database:
- **Supabase Dashboard:** https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc
- **Table Editor:** https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc/editor

---

## 📸 Expected Screenshots

### 1. Game Selection
- Shows 3 games for Kings Eye Escape
- Each game has Stripe product info
- Prices displayed correctly

### 2. Booking Form
- Customer info fields
- No custom card fields (removed!)
- Blue info box explaining Stripe redirect

### 3. Checkout Button
- Text: "Go to Secure Checkout $XX"
- Blue/primary color
- Clear and prominent

### 4. Stripe Checkout Page
- Stripe branding
- Game name in header
- Correct price
- Test card fields
- Powered by Stripe footer

### 5. Success Page
- Green checkmark icon
- "Booking Confirmed!" heading
- Booking reference number
- Game details summary
- Email confirmation notice

---

## 🐛 Troubleshooting

### Issue: "Invalid input syntax for type 'line': '02:30 PM:00'"
**Status:** ✅ FIXED  
**Solution:** Widget now properly parses time to HH:MM format before sending to database

### Issue: Seeing custom card form instead of Stripe redirect
**Status:** ✅ FIXED  
**Solution:** Removed embedded payment option, now ONLY redirects to Stripe Checkout

### Issue: "Pricing not set" error
**Status:** ✅ SHOULD BE FIXED  
**Check:** Verify games have `stripe_price_id` in database
```sql
SELECT name, stripe_product_id, stripe_price_id 
FROM games 
WHERE venue_id = '61995174-88be-4022-850c-33df9fc29c69';
```

### Issue: Stripe session not created
**Check:**
1. Backend API is running
2. Supabase Edge Function is deployed
3. Stripe keys are configured in environment
4. Check browser console for errors

---

## ✅ Success Criteria

### All 4 Demo Orders Must:
1. ✅ Redirect to Stripe hosted checkout (not show custom form)
2. ✅ Display correct game information
3. ✅ Calculate total price correctly
4. ✅ Accept test card 4242 4242 4242 4242
5. ✅ Create booking in database with status 'confirmed'
6. ✅ Set payment_status to 'paid'
7. ✅ Save stripe_session_id
8. ✅ Redirect to success page
9. ✅ Show booking reference number
10. ✅ Record payment in Stripe dashboard

### Additional Validations:
- [ ] Time format correct in database (HH:MM, not 'XX:XX PM:00')
- [ ] No JavaScript errors in browser console
- [ ] Mobile responsive (test on phone if possible)
- [ ] Email confirmation sent (check Supabase logs)
- [ ] Webhook events received (if configured)

---

## 📝 Testing Template

Use this template for each demo order:

```
DEMO ORDER #_: [Game Name]
=====================================
Date/Time Tested: ___________
Tester: ___________

✅ STEPS COMPLETED:
[ ] Game selected
[ ] Date and time chosen
[ ] Party size set
[ ] Customer info filled
[ ] Clicked "Go to Secure Checkout"
[ ] Redirected to Stripe (not custom form)
[ ] Entered test card
[ ] Payment processed
[ ] Redirected to success page

✅ VERIFICATION:
[ ] Booking ID: _____________
[ ] Total Amount: $_________
[ ] Stripe Session ID: _____________
[ ] Database status: confirmed
[ ] Payment status: paid
[ ] Stripe dashboard shows payment

❌ ISSUES FOUND:
___________________________________
___________________________________

SCREENSHOTS:
[ ] Booking form
[ ] Stripe checkout page
[ ] Success page
[ ] Stripe dashboard
```

---

## 🎉 READY TO TEST!

**All systems are configured and ready for testing. Follow the 4 demo orders above and document results using the testing template.**

**After completing all 4 orders, verify:**
- 4 bookings in database (3 successful, 1 cancelled/pending)
- 3 successful payments in Stripe dashboard
- All success pages displayed correctly
- No custom payment forms shown
- All redirects to Stripe working

---

**Testing Status:** 🟡 PENDING USER TESTING  
**Next Step:** Complete 4 demo orders and report results  
**Support:** Check troubleshooting section or Stripe/Supabase logs for any issues
