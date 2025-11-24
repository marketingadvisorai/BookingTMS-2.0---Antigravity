# ✅ FIX EXISTING GAMES - Add Stripe Pricing

**Purpose:** Add Stripe products and prices to all existing games that don't have them

---

## 🔧 **HOW TO RUN:**

### **Method 1: Via Browser Console** (Easiest)

1. Open your app: http://localhost:3002
2. Open browser console (F12)
3. Paste and run:

```javascript
// Fix all games without Stripe pricing
async function fixExistingGames() {
  console.log('🔧 Starting bulk Stripe product creation...');
  
  try {
    const response = await fetch(
      'https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/bulk-create-stripe-products',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    const result = await response.json();
    console.log('✅ Result:', result);
    
    if (result.successful > 0) {
      console.log(`🎉 Successfully fixed ${result.successful} games!`);
      console.log('Games:', result.results);
    }
    
    if (result.failed > 0) {
      console.error(`❌ Failed ${result.failed} games:`, result.errors);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run it
fixExistingGames();
```

---

### **Method 2: Via curl** (Terminal)

```bash
curl -X POST \
  https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/bulk-create-stripe-products \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## 📊 **WHAT IT DOES:**

1. ✅ Finds all games without `stripe_product_id` or `stripe_price_id`
2. ✅ Creates Stripe Product for each game
3. ✅ Creates Stripe Price for each game
4. ✅ Updates database with Stripe IDs
5. ✅ Returns detailed results

---

## 🧪 **VERIFY AFTER RUNNING:**

### **Check in Database:**
```sql
SELECT id, name, price, stripe_product_id, stripe_price_id
FROM games
WHERE stripe_price_id IS NOT NULL;
```

**Expected:** All games should now have Stripe IDs

---

### **Test in App:**
1. Go to any venue embed
2. Try to book a game
3. ✅ Should work without "Game pricing not configured" error

---

## 📝 **EXAMPLE OUTPUT:**

```json
{
  "message": "Processed 7 games",
  "successful": 7,
  "failed": 0,
  "results": [
    {
      "gameId": "ea825e12-1382-4af3-a883-ddab407abb01",
      "gameName": "FFFFFFF",
      "productId": "prod_xxx",
      "priceId": "price_1QKtgsP8OpXO5M2w7o5c9z5y",
      "status": "success"
    },
    ...
  ],
  "errors": []
}
```

---

## 🔄 **FOR NEW GAMES:**

**No action needed!** New games automatically get Stripe products when created via:
- `src/hooks/useGames.ts` → `createGame()`
- Already includes `StripeProductService.createProductAndPrice()`

---

## ✅ **AUTOMATED IN FUTURE:**

To make this fully automatic, you can:

### **Option 1: Add to Game Creation UI**
```typescript
// In AddGameWizard or game creation form
useEffect(() => {
  // Auto-create Stripe product when game is saved
  if (game.id && !game.stripe_price_id) {
    StripeProductService.createProductAndPrice({...});
  }
}, [game]);
```

### **Option 2: Database Trigger** (Advanced)
```sql
-- Auto-create Stripe product when game is inserted
CREATE TRIGGER auto_create_stripe_product
AFTER INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION create_stripe_product_trigger();
```

---

## 🎯 **GAMES THAT NEED FIXING:**

Currently found **7 games** without Stripe pricing:

1. **Axe Throwing Session** - $25.00
2. **Rage Room Experience** - $35.00  
3. **DDDDD** - $30.00
4. **FFFFFFF** - $30.00
5. **Advisor AI** - $30.00
6. **Zombie test** - $30.00
7. **games now** - $30.00

---

## 🚨 **IMPORTANT:**

- ✅ Edge Function is deployed
- ✅ Will only process games WITHOUT Stripe IDs
- ✅ Safe to run multiple times (won't duplicate)
- ✅ Creates real Stripe products (visible in Stripe Dashboard)
- ✅ Updates database automatically

---

## 📞 **IF ERRORS OCCUR:**

### **"Stripe key not found":**
```bash
# Set Stripe key in Supabase Dashboard
# Edge Functions → Secrets → Add STRIPE_SECRET_KEY
```

### **"Permission denied":**
```bash
# Use service role key, not anon key
# Or add RLS policy for games table
```

### **"Product already exists":**
- Game already has Stripe product (check `stripe_product_id`)
- No action needed, skip that game

---

## 🎉 **AFTER RUNNING:**

1. ✅ All existing games will have Stripe pricing
2. ✅ Widgets will work for all venues
3. ✅ No more "Game pricing not configured" errors
4. ✅ New games automatically get Stripe products
5. ✅ Payment system fully functional

---

**Run the script now to fix all existing games!** 🚀
