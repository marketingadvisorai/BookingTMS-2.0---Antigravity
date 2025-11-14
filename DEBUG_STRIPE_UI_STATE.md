# 🔍 Debug Stripe UI State Issue

## 🎯 Problem Description

**What Works:** ✅
- Data IS saving to database correctly
- Checkout IS working fine
- Product ID is correct in bookings

**What Doesn't Work:** ❌
- UI shows setup screen instead of "Connected" screen
- After reload/edit, it doesn't show the linked state

---

## 🛠️ Debug Logging Added

I've added comprehensive console logging to track data flow:

### **1. VenueGamesManager.tsx**
```typescript
console.log('🔄 VenueGamesManager - Converting game to wizard data:', {
  gameId, gameName,
  stripe_product_id,
  stripe_price_id,
  stripe_prices,
  stripe_checkout_url,
  stripe_sync_status,
  stripe_last_sync
});
```

### **2. Step6PaymentSettings.tsx**
```typescript
console.log('🔍 Step6PaymentSettings - gameData received:', {
  stripeProductId,
  stripePriceId,
  stripePrices,
  stripeCheckoutUrl,
  stripeSyncStatus,
  stripeLastSync
});

console.log('🎯 Step6PaymentSettings - Configuration Status:', {
  isConfigured,
  hasPrice,
  isCheckoutConnected,
  productId,
  priceId,
  syncStatus
});
```

---

## 📋 Testing Instructions

### **Step 1: Open Browser Console**
1. Open your app in browser
2. Press `F12` or `Cmd+Option+I` to open DevTools
3. Go to Console tab
4. Clear console (`Cmd+K` or click clear icon)

### **Step 2: Create/Edit Game with Stripe**

**Scenario A: Create New Game**
1. Create a new game
2. Go to Step 6 - Payment Settings
3. Configure Stripe (create or link product)
4. Check console for logs
5. Complete wizard

**Scenario B: Edit Existing Game**
1. Find game that already has Stripe configured
2. Click Edit
3. Navigate to Step 6
4. **Check console logs immediately**

---

## 🔍 What to Look For in Console

### **Expected Logs When Editing:**

```javascript
// When wizard loads the game data:
🔄 VenueGamesManager - Converting game to wizard data: {
  gameId: "xxx-xxx-xxx",
  gameName: "My Escape Room",
  stripe_product_id: "prod_TPZtEeXAvo1gGG",     // ✅ Should have value
  stripe_price_id: "price_1SSKjQFajiBPZ08...",  // ✅ Should have value
  stripe_prices: [{...}],                        // ✅ Should be array
  stripe_checkout_url: "https://...",            // ✅ May be null
  stripe_sync_status: "synced",                  // ✅ Should be "synced"
  stripe_last_sync: "2025-11-13T03:42:08Z"      // ✅ Should have timestamp
}

// When Step 6 receives the data:
🔍 Step6PaymentSettings - gameData received: {
  stripeProductId: "prod_TPZtEeXAvo1gGG",       // ✅ Should match above
  stripePriceId: "price_1SSKjQFajiBPZ08...",    // ✅ Should match above
  stripePrices: [{...}],                         // ✅ Should be array
  stripeCheckoutUrl: "https://...",              // ✅ May be null
  stripeSyncStatus: "synced",                    // ✅ Should be "synced"
  stripeLastSync: "2025-11-13T03:42:08Z"        // ✅ Should have timestamp
}

// Configuration detection:
🎯 Step6PaymentSettings - Configuration Status: {
  isConfigured: true,              // ✅ Should be TRUE
  hasPrice: true,                  // ✅ Should be TRUE
  isCheckoutConnected: true,       // ✅ Should be TRUE
  productId: "prod_TPZtEeXAvo1gGG",
  priceId: "price_1SSKjQFajiBPZ08...",
  syncStatus: "synced"
}
```

### **Problem Indicators:**

```javascript
// ❌ BAD: If stripe fields are null/undefined
stripe_product_id: null          // ❌ Problem!
stripe_price_id: null            // ❌ Problem!

// ❌ BAD: If isConfigured is false
isConfigured: false              // ❌ Problem!

// ❌ BAD: If data not reaching Step6
// Missing logs = data not flowing
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: Fields are NULL in database**
**Symptoms:**
```javascript
stripe_product_id: null
stripe_price_id: null
```

**Solution:**
- Database migration might not have been applied
- Run migration again: `DEPLOYMENT_COMPLETE_STATUS.md`
- Check Supabase dashboard for column existence

---

### **Issue 2: Data Not Loading from Database**
**Symptoms:**
```javascript
// VenueGamesManager logs show null
stripe_product_id: null
```

**Solution:**
- Check if game was saved with Stripe data
- Run SQL query in Supabase:
```sql
SELECT id, name, stripe_product_id, stripe_price_id, 
       stripe_prices, stripe_checkout_url, 
       stripe_sync_status, stripe_last_sync
FROM games
WHERE id = 'your-game-id';
```

---

### **Issue 3: Data Not Reaching Step6**
**Symptoms:**
```javascript
// VenueGamesManager shows data
stripe_product_id: "prod_xxx"

// But Step6PaymentSettings shows
stripeProductId: null  // ❌ Lost in transit!
```

**Solution:**
- Problem in `convertGameToWizardData` mapping
- Check AddGameWizard is passing `initialData` correctly

---

### **Issue 4: isConfigured Logic Issue**
**Symptoms:**
```javascript
// Data exists
stripeProductId: "prod_xxx"
stripePriceId: "price_xxx"

// But detection fails
isConfigured: false  // ❌ Logic error!
```

**Solution:**
- Check the isConfigured calculation:
```typescript
const isConfigured = !!(gameData.stripeProductId && gameData.stripePriceId);
```

---

## 🎯 Expected UI Behavior

### **When isConfigured = true:**

Should show:
```
┌────────────────────────────────────┐
│ ✓ Connected & Active              │
│ Stripe integration active          │
├────────────────────────────────────┤
│ ✓ Stripe Connected                │
│   ✓ Product created in Stripe     │
│   ✓ Price configured ($30.00)     │
│   ✓ Checkout enabled              │
├────────────────────────────────────┤
│ Payment Status       [✓ Synced]   │
│ Product ID: prod_TPZtEeXAvo1gGG   │
│ Price ID: price_1SSKjQ...         │
│ [Edit] [Re-sync] [Remove]         │
└────────────────────────────────────┘
```

Should NOT show:
- ❌ "No payment configuration yet"
- ❌ "Configure Payment" section
- ❌ Create/Link buttons

---

### **When isConfigured = false:**

Should show:
```
┌────────────────────────────────────┐
│ Payment Settings                   │
│ Create or link Stripe product     │
├────────────────────────────────────┤
│ Configure Payment                  │
│ [Create New Product]               │
│ [Link Existing Product]            │
└────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
Database (games table)
  ├─ stripe_product_id: "prod_xxx"
  ├─ stripe_price_id: "price_xxx"
  ├─ stripe_prices: [...]
  ├─ stripe_checkout_url: "https://..."
  ├─ stripe_sync_status: "synced"
  └─ stripe_last_sync: "2025-11-13..."
           ↓
useGames.fetchGames() - SELECT *
           ↓
VenueGamesManager.convertGameToWizardData()
  Maps: game.stripe_product_id → stripeProductId
           ↓
AddGameWizard (initialData prop)
           ↓
Step6PaymentSettings (gameData prop)
  Checks: isConfigured = !!(stripeProductId && stripePriceId)
           ↓
UI Renders: Connected Screen OR Setup Screen
```

---

## 🧪 Quick Test Commands

### **Check Database Directly:**
```sql
-- Via Supabase Dashboard SQL Editor:
SELECT 
  id, 
  name,
  stripe_product_id,
  stripe_price_id,
  stripe_sync_status
FROM games
ORDER BY created_at DESC
LIMIT 10;
```

### **Check if Columns Exist:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'games'
  AND column_name LIKE 'stripe%';
```

---

## 📝 Report Format

When reporting results, please provide:

1. **Console Logs:** Copy all 🔄, 🔍, and 🎯 logs
2. **Database Query:** Result of SELECT query
3. **UI Screenshot:** What you see in Step 6
4. **Expected vs Actual:**
   - Expected: Connected screen
   - Actual: Setup screen

---

## ✅ Next Steps After Testing

Once you test and provide console logs, I can:

1. ✅ Identify exact point of data loss
2. ✅ Fix the specific issue
3. ✅ Remove debug logging
4. ✅ Deploy final fix

---

**Ready to test!** 🚀

Open the app, edit a game with Stripe configured, and share the console logs!
