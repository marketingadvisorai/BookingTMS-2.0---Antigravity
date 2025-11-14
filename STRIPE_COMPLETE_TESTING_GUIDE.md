# 🧪 Stripe Payment Integration - Complete Testing Guide

## ✅ DEPLOYMENT STATUS

**Date:** November 12, 2025  
**Status:** 🟢 DEPLOYED TO PRODUCTION  
**Version:** Stripe API 0.1

---

## 📊 Deployment Summary

### Branches Updated:
- ✅ `stripe-api-0.1` - Created and pushed
- ✅ `booking-tms-beta-0.1.9` - Merged and pushed (Frontend Deploy)
- ✅ `backend-render-deploy` - Merged and pushed (Backend Deploy)

### Services Deploying:
- 🔄 **Frontend:** https://bookingtms-frontend.onrender.com
- 🔄 **Backend:** https://bookingtms-backend-api.onrender.com

**ETA:** ~5-7 minutes for both services

---

## 🎯 What's Implemented

### ✅ Complete Stripe Integration

#### 1. Product & Price Management
- ✅ Create Stripe products from game wizard
- ✅ Create Stripe prices with metadata
- ✅ Link existing Stripe products
- ✅ Sync prices from Stripe
- ✅ Product ID persistence to database

#### 2. Checkout Flow
- ✅ Stripe Checkout Sessions (hosted checkout)
- ✅ Payment Links (for email/SMS)
- ✅ Booking creation before payment
- ✅ Session ID tracking in database

#### 3. Payment States
- ✅ Success page (`/booking-success`)
- ✅ Cancelled page (`/booking-cancelled`)
- ✅ Booking status updates
- ✅ Payment status tracking

#### 4. Backend API
- ✅ Product creation endpoint
- ✅ Price creation endpoint
- ✅ Product listing endpoint
- ✅ Price listing endpoint
- ✅ Checkout session creation
- ✅ Webhook signature verification

---

## 🧪 Complete Testing Checklist

### Phase 1: Backend API Testing (5 minutes)

#### Test 1.1: Health Check ✅
```bash
curl https://bookingtms-backend-api.onrender.com/health
```
**Expected:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T...",
  "uptime": 123.45,
  "environment": "production"
}
```

#### Test 1.2: Stripe Config ✅
```bash
curl https://bookingtms-backend-api.onrender.com/api/stripe/config
```
**Expected:**
```json
{
  "success": true,
  "config": {
    "publishableKey": "pk_test_...",
    "currency": "usd",
    "country": "US"
  }
}
```

#### Test 1.3: Create Product (Optional) ✅
```bash
curl -X POST https://bookingtms-backend-api.onrender.com/api/stripe/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Game Product",
    "description": "Test product for API verification"
  }'
```
**Expected:**
```json
{
  "success": true,
  "productId": "prod_xxxxx",
  "product": { ... }
}
```

---

### Phase 2: Game Creation with Stripe (10 minutes)

#### Test 2.1: Create New Game
**Steps:**
1. Go to: https://bookingtms-frontend.onrender.com
2. Log in to admin dashboard
3. Navigate: **Venues** → Select venue → **Games** → **Add Game**
4. Fill out wizard Steps 1-5:
   - **Step 1:** Basic Info (name, description, category)
   - **Step 2:** Capacity & Pricing (set adult price: $30)
   - **Step 3:** Game Details (duration, difficulty)
   - **Step 4:** Media Upload (add cover image)
   - **Step 5:** Schedule (operating days, times)

#### Test 2.2: Create Stripe Product
**Steps:**
1. **Step 6:** Payment Settings
2. Click **"Create New"** tab
3. Review pricing preview:
   - Product Name: [Your game name]
   - Price: $30.00
   - Currency: USD
4. Click **"Create Stripe Product & Enable Checkout"**

**Expected Results:**
- ✅ Loading toast: "Creating Stripe product..."
- ✅ Success toast: "Stripe product created successfully!"
- ✅ UI shows "Stripe Connected" badge
- ✅ Product ID displayed (starts with `prod_`)
- ✅ Price ID displayed (starts with `price_`)
- ✅ Status: "Synced" badge
- ✅ Checkout: "Connected to Checkout" badge

**If Errors:**
- ❌ "Invalid JWT" → Old code still deployed, wait 5 more minutes
- ❌ "Failed to create" → Check browser console (F12)
- ❌ No Product ID shown → Data persistence bug, report immediately

#### Test 2.3: Publish Game
**Steps:**
1. Click **"Next"** to Step 7 (Widget & Embed)
2. Click **"Next"** to Step 8 (Review & Publish)
3. Review all details
4. Click **"Publish Game"**

**Expected Results:**
- ✅ Progress indicator shows:
  - Preparing game data ✅
  - Creating Stripe product ✅ (should be already done)
  - Saving to database ✅
  - Verifying creation ✅
- ✅ Success screen appears
- ✅ Shows: "Supabase database updated"
- ✅ Shows: "Stripe product created"
- ✅ Shows: "Embed code generated"

---

### Phase 3: Verify Database (5 minutes)

#### Test 3.1: Check Game in Database
**Option A: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor** → **games** table
4. Find your newly created game
5. **Verify columns:**
   - `stripe_product_id`: Should have value like `prod_xxxxx`
   - `stripe_price_id`: Should have value like `price_xxxxx`
   - `stripe_sync_status`: Should be `synced`
   - `checkout_enabled`: Should be `true`
   - `stripe_last_sync`: Should have timestamp

**Option B: Via SQL**
```sql
SELECT 
  id,
  name,
  stripe_product_id,
  stripe_price_id,
  stripe_sync_status,
  checkout_enabled,
  stripe_last_sync
FROM games 
WHERE stripe_product_id IS NOT NULL
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
```
id: [uuid]
name: "Your Game Name"
stripe_product_id: "prod_xxxxx"
stripe_price_id: "price_xxxxx"
stripe_sync_status: "synced"
checkout_enabled: true
stripe_last_sync: "2025-11-12T..."
```

---

### Phase 4: Verify in Stripe Dashboard (5 minutes)

#### Test 4.1: Check Product
**Steps:**
1. Go to: https://dashboard.stripe.com/test/products
2. Find your product by name
3. **Verify:**
   - ✅ Product name matches game name
   - ✅ Description matches game description
   - ✅ Status: Active
   - ✅ Has at least 1 price

#### Test 4.2: Check Price
**Steps:**
1. Click on the product
2. Go to **Pricing** tab
3. **Verify:**
   - ✅ Price amount matches game price ($30.00)
   - ✅ Currency: USD
   - ✅ Billing: One time
   - ✅ Status: Active

#### Test 4.3: Check Metadata
**Steps:**
1. In product details, scroll to **Metadata** section
2. **Verify metadata includes:**
   - `venue_id`: [venue UUID]
   - `duration`: "60" (or your game duration)
   - `difficulty`: "3" (or your game difficulty)
   - `category`: [your game category]
   - `image_url`: [your game image URL]

---

### Phase 5: End-to-End Booking Flow (15 minutes)

#### Test 5.1: Access Booking Widget
**Steps:**
1. Go to your venue's booking widget
2. **Option A:** Via embed code on external site
3. **Option B:** Via direct widget URL
4. Select the game you just created
5. Choose a date and time slot

#### Test 5.2: Fill Booking Form
**Steps:**
1. Select party size (e.g., 4 adults)
2. Fill customer information:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: +1234567890
3. Review booking summary:
   - Game name
   - Date & time
   - Party size
   - Total price

#### Test 5.3: Proceed to Checkout
**Steps:**
1. Click **"Proceed to Checkout"** or **"Book Now"**
2. **Expected:**
   - ✅ Loading message: "Creating secure checkout..."
   - ✅ Success message: "Redirecting to secure checkout..."
   - ✅ Browser redirects to Stripe Checkout page
   - ✅ URL starts with: `https://checkout.stripe.com/`

**If Errors:**
- ❌ "Pricing not set" → Stripe IDs not saved, check Phase 3
- ❌ "Invalid price ID" → Price ID mismatch, check Stripe dashboard
- ❌ No redirect → Check browser console for errors
- ❌ Syntax error → Report with screenshot

---

### Phase 6: Test Payment Success Flow (10 minutes)

#### Test 6.1: Complete Test Payment
**On Stripe Checkout Page:**
1. **Card Number:** `4242 4242 4242 4242` (Stripe test card)
2. **Expiry:** Any future date (e.g., 12/34)
3. **CVC:** Any 3 digits (e.g., 123)
4. **Name:** Test User
5. **Email:** test@example.com
6. **Billing Address:** Any valid address
7. Click **"Pay"**

**Expected:**
- ✅ Payment processes successfully
- ✅ Redirects to: `https://bookingtms-frontend.onrender.com/booking-success?session_id=cs_test_...`
- ✅ Success page loads

#### Test 6.2: Verify Success Page
**On Success Page, verify:**
- ✅ Green checkmark icon
- ✅ "Booking Confirmed!" heading
- ✅ "Your payment was successful" message
- ✅ Booking details card shows:
  - Game name and image
  - Venue name
  - Date (formatted nicely)
  - Time slot
  - Party size
  - Total paid (in green)
  - Booking reference (UUID)
- ✅ Blue info box: "Confirmation Email Sent"
- ✅ Action buttons:
  - "Add to Calendar"
  - "Download Receipt"
- ✅ "What's Next?" section with checklist
- ✅ "Return to Home" button

#### Test 6.3: Verify Database Update
**Check Supabase:**
```sql
SELECT 
  id,
  status,
  payment_status,
  stripe_session_id,
  confirmed_at,
  customer_email,
  total_price
FROM bookings 
WHERE stripe_session_id IS NOT NULL
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected:**
```
status: "confirmed"
payment_status: "paid"
stripe_session_id: "cs_test_xxxxx"
confirmed_at: "2025-11-12T..."
customer_email: "test@example.com"
total_price: 30.00
```

#### Test 6.4: Verify in Stripe Dashboard
**Steps:**
1. Go to: https://dashboard.stripe.com/test/payments
2. Find the most recent payment
3. **Verify:**
   - ✅ Status: Succeeded
   - ✅ Amount: $30.00
   - ✅ Customer email: test@example.com
   - ✅ Metadata includes:
     - `booking_id`: [booking UUID]
     - `game_id`: [game UUID]
     - `venue_id`: [venue UUID]

---

### Phase 7: Test Payment Cancellation Flow (5 minutes)

#### Test 7.1: Start New Booking
**Steps:**
1. Go back to booking widget
2. Select same game
3. Fill booking form again
4. Click "Proceed to Checkout"
5. Wait for Stripe Checkout page to load

#### Test 7.2: Cancel Payment
**On Stripe Checkout Page:**
1. Click browser **Back button** OR
2. Click **"← Back"** link on Stripe page OR
3. Close the browser tab

**Expected:**
- ✅ Redirects to: `https://bookingtms-frontend.onrender.com/booking-cancelled`
- ✅ Cancellation page loads

#### Test 7.3: Verify Cancellation Page
**On Cancellation Page, verify:**
- ✅ Orange/red X icon
- ✅ "Payment Cancelled" heading
- ✅ "Your payment was cancelled and no charges were made" message
- ✅ Orange info box: "What happened?"
- ✅ Explanation text
- ✅ "What would you like to do?" section
- ✅ Action buttons:
  - "Try Booking Again" (blue)
  - "Return to Home" (outline)
- ✅ Blue help section: "Need Help?"
- ✅ "Common Reasons for Cancellation" list

#### Test 7.4: Test Action Buttons
**Click "Try Booking Again":**
- ✅ Returns to previous page (booking form)

**Click "Return to Home":**
- ✅ Navigates to homepage

---

### Phase 8: Test Error Scenarios (10 minutes)

#### Test 8.1: Invalid Card
**Steps:**
1. Start new booking
2. On Stripe Checkout, use card: `4000 0000 0000 0002`
3. Complete other fields
4. Click "Pay"

**Expected:**
- ✅ Stripe shows error: "Your card was declined"
- ✅ User stays on checkout page
- ✅ Can try different card
- ✅ No booking created in database

#### Test 8.2: Insufficient Funds
**Steps:**
1. Use card: `4000 0000 0000 9995`
2. Complete payment

**Expected:**
- ✅ Stripe shows error: "Your card has insufficient funds"
- ✅ Payment fails gracefully
- ✅ User can retry

#### Test 8.3: Expired Card
**Steps:**
1. Use card: `4000 0000 0000 0069`
2. Complete payment

**Expected:**
- ✅ Stripe shows error: "Your card has expired"
- ✅ User prompted to use different card

---

## 📋 Testing Checklist Summary

### Backend (3 tests)
- [ ] Health check passes
- [ ] Stripe config returns publishable key
- [ ] Can create test product via API

### Game Creation (3 tests)
- [ ] Can create game through wizard
- [ ] Stripe product created in Step 6
- [ ] Product IDs saved to database

### Database Verification (2 tests)
- [ ] Game has Stripe product ID
- [ ] Game has Stripe price ID

### Stripe Dashboard (3 tests)
- [ ] Product exists in Stripe
- [ ] Price is correct
- [ ] Metadata is complete

### Booking Flow (3 tests)
- [ ] Can select game and fill form
- [ ] Redirects to Stripe Checkout
- [ ] Checkout page loads correctly

### Payment Success (4 tests)
- [ ] Test payment completes
- [ ] Success page loads
- [ ] Booking confirmed in database
- [ ] Payment recorded in Stripe

### Payment Cancellation (3 tests)
- [ ] Can cancel payment
- [ ] Cancellation page loads
- [ ] Action buttons work

### Error Handling (3 tests)
- [ ] Invalid card handled
- [ ] Insufficient funds handled
- [ ] Expired card handled

**Total Tests:** 24  
**Estimated Time:** 60-75 minutes

---

## 🔍 How to Check Each Component

### 1. Check if Stripe Product Was Created

**Method A: Via Admin Dashboard**
1. Edit the game
2. Go to Step 6 (Payment Settings)
3. Look for "Stripe Connected" status
4. Product ID should be visible

**Method B: Via Stripe Dashboard**
1. Go to: https://dashboard.stripe.com/test/products
2. Search for your game name
3. Product should exist with correct price

**Method C: Via Database**
```sql
SELECT name, stripe_product_id, stripe_price_id 
FROM games 
WHERE name = 'Your Game Name';
```

### 2. Check if Payment Succeeded

**Method A: Via Stripe Dashboard**
1. Go to: https://dashboard.stripe.com/test/payments
2. Look for recent payment
3. Status should be "Succeeded"

**Method B: Via Database**
```sql
SELECT * FROM bookings 
WHERE customer_email = 'test@example.com'
ORDER BY created_at DESC 
LIMIT 1;
```
Check: `payment_status` = 'paid', `status` = 'confirmed'

**Method C: Via Supabase Dashboard**
1. Go to Table Editor → bookings
2. Filter by customer_email
3. Check payment_status and status columns

### 3. Check if Booking Was Created

**Via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard
2. Select project → Table Editor → bookings
3. Look for most recent entry
4. Verify all fields are populated

**Via SQL:**
```sql
SELECT 
  b.id,
  b.status,
  b.payment_status,
  b.customer_name,
  b.customer_email,
  b.total_price,
  b.stripe_session_id,
  g.name as game_name,
  v.name as venue_name
FROM bookings b
LEFT JOIN games g ON b.game_id = g.id
LEFT JOIN venues v ON b.venue_id = v.id
ORDER BY b.created_at DESC
LIMIT 5;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Invalid JWT" Error
**Symptoms:** Error when creating Stripe product in Step 6

**Causes:**
- Old code still deployed
- Browser cache not cleared

**Solutions:**
1. Wait 5-10 minutes for deployment to complete
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check deployment status on Render dashboard
4. Verify latest commit is deployed

### Issue 2: "Pricing Not Set" Error
**Symptoms:** Error when clicking "Proceed to Checkout"

**Causes:**
- Stripe product IDs not saved to database
- Data persistence bug

**Solutions:**
1. Check database for `stripe_product_id` and `stripe_price_id`
2. If NULL, re-create the game
3. Verify Step 6 shows "Stripe Connected" before publishing
4. Check browser console for errors

### Issue 3: Checkout Page Doesn't Load
**Symptoms:** Redirect fails or blank page

**Causes:**
- Invalid price ID
- Stripe keys misconfigured
- CORS issues

**Solutions:**
1. Check browser console for errors
2. Verify Stripe keys in Render environment variables
3. Check network tab for failed requests
4. Verify price ID exists in Stripe dashboard

### Issue 4: Success Page Shows "Booking Not Found"
**Symptoms:** Payment succeeds but success page shows error

**Causes:**
- Session ID not saved to booking
- Database update failed
- Timing issue

**Solutions:**
1. Check if booking exists in database
2. Verify `stripe_session_id` column has value
3. Check Supabase logs for errors
4. Try refreshing the page

---

## 📊 Expected Results Summary

### After Game Creation:
```
✅ Game created in database
✅ Stripe product created
✅ Stripe price created
✅ Product ID saved to game
✅ Price ID saved to game
✅ Checkout enabled
```

### After Successful Payment:
```
✅ Booking created with status "confirmed"
✅ Payment status "paid"
✅ Stripe session ID recorded
✅ Payment recorded in Stripe
✅ Success page displayed
✅ Confirmation email sent (if configured)
```

### After Cancelled Payment:
```
✅ Booking not confirmed (stays "pending" or deleted)
✅ No payment in Stripe
✅ Cancellation page displayed
✅ User can retry
```

---

## 🎯 Success Criteria

### Minimum Requirements (Must Pass):
- [ ] Backend API is accessible
- [ ] Can create game with Stripe product
- [ ] Product IDs saved to database
- [ ] Can complete test payment
- [ ] Success page loads correctly
- [ ] Booking confirmed in database

### Full Success (All Should Pass):
- [ ] All 24 tests pass
- [ ] No console errors
- [ ] All pages load within 3 seconds
- [ ] Mobile responsive
- [ ] Error messages are user-friendly
- [ ] Can handle payment failures gracefully

---

## 📞 Support & Troubleshooting

### If Tests Fail:

1. **Check Deployment Status:**
   - Go to Render dashboard
   - Verify both services are "Live"
   - Check build logs for errors

2. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for red errors
   - Screenshot and report

3. **Check Network Tab:**
   - Press F12 → Network tab
   - Try the action again
   - Look for failed requests (red)
   - Check request/response details

4. **Provide Details:**
   - Which test failed?
   - Error message (exact text)
   - Screenshot of error
   - Browser console logs
   - Network tab screenshot

---

## ✅ Final Verification

After completing all tests, verify:

1. **Game Creation:** ✅
   - Game exists in database
   - Has Stripe product ID
   - Has Stripe price ID
   - Checkout enabled

2. **Stripe Integration:** ✅
   - Product in Stripe dashboard
   - Price is correct
   - Metadata complete

3. **Booking Flow:** ✅
   - Can select game
   - Redirects to checkout
   - Payment processes

4. **Success Flow:** ✅
   - Success page loads
   - Booking confirmed
   - Payment recorded

5. **Cancellation Flow:** ✅
   - Cancellation page loads
   - Can retry booking
   - No charges made

---

**Status:** 🟢 READY FOR TESTING  
**Estimated Testing Time:** 60-75 minutes  
**Deployment ETA:** ~5-7 minutes from now

**Once deployment completes, start with Phase 1 (Backend API Testing) and work through each phase sequentially. Good luck! 🚀**
