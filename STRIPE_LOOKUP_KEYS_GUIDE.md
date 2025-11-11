# Stripe Lookup Keys Implementation Guide

## 📚 Overview

**Stripe Lookup Keys** allow you to manage pricing changes without deploying new code. Instead of hard-coding price IDs in your application, you use human-readable keys (like `adult_escape_room` or `standard_monthly`) to reference prices dynamically.

---

## 🎯 Why Use Lookup Keys?

### **Problem Without Lookup Keys:**
```typescript
// ❌ Hard-coded price ID
const priceId = "price_1234567890ABC"; // What if price changes?
```

### **Solution With Lookup Keys:**
```typescript
// ✅ Use lookup key
const lookupKey = "adult_escape_room";
// Fetch current price dynamically
const price = await fetchPriceByLookupKey(lookupKey);
```

### **Benefits:**
1. ✅ **Change prices without code deployment**
2. ✅ **Human-readable price identifiers**
3. ✅ **Easy A/B testing of different prices**
4. ✅ **Manage seasonal pricing**
5. ✅ **Update prices across multiple products instantly**

---

## 🏗️ How Lookup Keys Work

### **Concept:**
```
Lookup Key → Price ID → Amount
"adult_escape_room" → "price_ABC123" → $30.00
```

### **When You Change Price:**
```
1. Create new price: $35.00 with lookup_key="adult_escape_room"
2. Set transfer_lookup_key=true
3. Old price loses the key, new price gets it
4. Your app automatically uses new price!
```

---

## 📋 Implementation for Booking System

### **Step 1: Define Your Lookup Key Strategy**

For an escape room booking system, use descriptive keys:

```
Pricing Type          | Lookup Key Example
---------------------|-------------------
Adult Price          | adult_escape_room
Child Price          | child_escape_room
Group Discount       | group_4_people
VIP Experience       | vip_escape_room
Weekend Premium      | weekend_premium
Holiday Special      | holiday_special
Early Bird           | early_bird_discount
```

### **Naming Convention:**
```
{category}_{type}_{variant}

Examples:
- adult_standard_weekday
- child_premium_weekend
- group_5_people_discount
- vip_haunted_library
```

---

## 🔧 Implementation Steps

### **1. Update Edge Function to Support Lookup Keys**

**File:** `supabase/functions/stripe-manage-product/index.ts`

```typescript
async function createPrice(params: {
  product: string;
  unit_amount: number;
  currency: string;
  lookup_key?: string;  // Add this
  transfer_lookup_key?: boolean;  // Add this
  metadata?: Record<string, string>;
}) {
  console.log('💰 Creating price for product:', params.product);
  
  const priceData: any = {
    product: params.product,
    unit_amount: params.unit_amount,
    currency: params.currency,
    metadata: params.metadata || {},
  };

  // Add lookup key if provided
  if (params.lookup_key) {
    priceData.lookup_key = params.lookup_key;
    console.log('🔑 Using lookup key:', params.lookup_key);
  }

  // Transfer lookup key if updating price
  if (params.transfer_lookup_key) {
    priceData.transfer_lookup_key = true;
    console.log('🔄 Transferring lookup key from old price');
  }

  const price = await stripe.prices.create(priceData);

  console.log('✅ Price created:', price.id);
  return { priceId: price.id, lookupKey: price.lookup_key };
}

// Add new function to fetch price by lookup key
async function getPriceByLookupKey(params: { lookup_key: string }) {
  console.log('🔍 Fetching price by lookup key:', params.lookup_key);
  
  const prices = await stripe.prices.list({
    lookup_keys: [params.lookup_key],
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new Error(`No price found with lookup key: ${params.lookup_key}`);
  }

  const price = prices.data[0];
  console.log('✅ Found price:', price.id, 'Amount:', price.unit_amount);
  
  return {
    priceId: price.id,
    productId: price.product,
    unitAmount: price.unit_amount,
    currency: price.currency,
    lookupKey: price.lookup_key,
  };
}
```

**Update the switch statement:**
```typescript
switch (action) {
  case 'create_product':
    result = await createProduct(params);
    break;

  case 'create_price':
    result = await createPrice(params);
    break;

  case 'get_price_by_lookup_key':  // Add this
    result = await getPriceByLookupKey(params);
    break;

  case 'update_product':
    result = await updateProduct(params);
    break;

  case 'archive_product':
    result = await archiveProduct(params);
    break;

  default:
    throw new Error(`Unknown action: ${action}`);
}
```

---

### **2. Update Frontend Service**

**File:** `src/lib/stripe/stripeProductService.ts`

Add new methods:

```typescript
/**
 * Create price with lookup key
 */
static async createPriceWithLookupKey(
  productId: string,
  params: {
    amount: number;
    currency?: string;
    lookupKey: string;
    transferLookupKey?: boolean;
    metadata?: Record<string, string>;
  }
): Promise<{ priceId: string; lookupKey: string }> {
  try {
    console.log('🔑 Creating price with lookup key:', params.lookupKey);

    const response = await fetch(`${this.STRIPE_API_URL}/stripe-manage-product`, {
      method: 'POST',
      headers: this.authHeaders,
      body: JSON.stringify({
        action: 'create_price',
        product: productId,
        unit_amount: Math.round(params.amount * 100),
        currency: params.currency || 'usd',
        lookup_key: params.lookupKey,
        transfer_lookup_key: params.transferLookupKey || false,
        metadata: params.metadata || {},
      }),
    });

    const data = await this.parseResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create price with lookup key');
    }

    console.log('✅ Price created with lookup key:', data.lookupKey);
    return { priceId: data.priceId, lookupKey: data.lookupKey };
  } catch (error) {
    console.error('❌ Error creating price with lookup key:', error);
    throw error;
  }
}

/**
 * Get price by lookup key
 */
static async getPriceByLookupKey(lookupKey: string): Promise<{
  priceId: string;
  productId: string;
  unitAmount: number;
  currency: string;
  lookupKey: string;
}> {
  try {
    console.log('🔍 Fetching price by lookup key:', lookupKey);

    const response = await fetch(`${this.STRIPE_API_URL}/stripe-manage-product`, {
      method: 'POST',
      headers: this.authHeaders,
      body: JSON.stringify({
        action: 'get_price_by_lookup_key',
        lookup_key: lookupKey,
      }),
    });

    const data = await this.parseResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch price by lookup key');
    }

    console.log('✅ Price found:', data.priceId, 'Amount:', data.unitAmount / 100);
    return data;
  } catch (error) {
    console.error('❌ Error fetching price by lookup key:', error);
    throw error;
  }
}
```

---

### **3. Update Payment Settings UI**

**File:** `src/components/games/steps/Step6PaymentSettings.tsx`

Add lookup key input field:

```typescript
const [useLookupKey, setUseLookupKey] = useState(false);
const [lookupKey, setLookupKey] = useState('');

// Generate suggested lookup key from game name
const suggestedLookupKey = useMemo(() => {
  if (!gameData.name) return '';
  return gameData.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');
}, [gameData.name]);
```

Add UI section:

```tsx
{/* Lookup Key Section */}
<Card className="border-blue-200 bg-blue-50">
  <CardContent className="p-4">
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Switch
            checked={useLookupKey}
            onCheckedChange={setUseLookupKey}
          />
          <Label className="font-semibold text-blue-900">
            Use Lookup Key (Recommended)
          </Label>
        </div>
        <p className="text-sm text-blue-800 mb-3">
          Lookup keys allow you to change prices without updating code. 
          Perfect for seasonal pricing or A/B testing.
        </p>
        
        {useLookupKey && (
          <div className="space-y-2">
            <Label>Lookup Key</Label>
            <Input
              value={lookupKey}
              onChange={(e) => setLookupKey(e.target.value)}
              placeholder={suggestedLookupKey || "adult_escape_room"}
              className="bg-white"
            />
            <p className="text-xs text-blue-700">
              Suggested: <code className="bg-blue-100 px-1 py-0.5 rounded">{suggestedLookupKey}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  </CardContent>
</Card>
```

Update create product handler:

```typescript
const handleCreateStripeProduct = async () => {
  // ... existing validation ...

  try {
    toast.loading('Creating Stripe product...', { id: 'stripe-create' });

    // Create product
    const productResult = await StripeProductService.createProduct({
      name: gameData.name || 'Untitled Game',
      description: gameData.description || '',
      metadata: enhancedMetadata,
    });

    // Create price with optional lookup key
    let priceResult;
    if (useLookupKey && lookupKey.trim()) {
      priceResult = await StripeProductService.createPriceWithLookupKey(
        productResult.productId,
        {
          amount: gameData.adultPrice,
          currency: 'usd',
          lookupKey: lookupKey.trim(),
          metadata: enhancedMetadata,
        }
      );
    } else {
      priceResult = await StripeProductService.createPrice(
        productResult.productId,
        {
          amount: gameData.adultPrice,
          currency: 'usd',
          metadata: enhancedMetadata,
        }
      );
    }

    // Update game data
    const updatedData = {
      ...gameData,
      stripeProductId: productResult.productId,
      stripePriceId: priceResult.priceId,
      stripeLookupKey: priceResult.lookupKey || undefined,
      stripeSyncStatus: 'synced',
      stripeLastSync: new Date().toISOString(),
      checkoutEnabled: true,
      checkoutConnectedAt: new Date().toISOString(),
    };

    onUpdate(updatedData);
    toast.success('Stripe product created successfully!', { id: 'stripe-create' });
  } catch (error: any) {
    // ... error handling ...
  }
};
```

---

## 📊 Database Schema Update

Add lookup key field to games table:

```sql
-- Add stripe_lookup_key column
ALTER TABLE games 
ADD COLUMN stripe_lookup_key TEXT;

-- Add index for faster lookups
CREATE INDEX idx_games_stripe_lookup_key 
ON games(stripe_lookup_key) 
WHERE stripe_lookup_key IS NOT NULL;
```

---

## 🎯 Usage Examples

### **Example 1: Create Price with Lookup Key**

```typescript
// When creating a new escape room game
const price = await StripeProductService.createPriceWithLookupKey(
  productId,
  {
    amount: 30.00,
    currency: 'usd',
    lookupKey: 'haunted_library_adult',
    metadata: {
      game_type: 'escape_room',
      difficulty: 'medium',
    }
  }
);
```

### **Example 2: Update Price (Transfer Lookup Key)**

```typescript
// When you want to change price from $30 to $35
const newPrice = await StripeProductService.createPriceWithLookupKey(
  productId,
  {
    amount: 35.00,
    currency: 'usd',
    lookupKey: 'haunted_library_adult',
    transferLookupKey: true,  // Transfer from old price
    metadata: {
      game_type: 'escape_room',
      difficulty: 'medium',
      price_update: 'seasonal_increase',
    }
  }
);
// Old price automatically loses the lookup key
// New price gets the lookup key
// All future bookings use new price automatically!
```

### **Example 3: Fetch Price by Lookup Key**

```typescript
// In your booking flow
const priceInfo = await StripeProductService.getPriceByLookupKey(
  'haunted_library_adult'
);

console.log('Current price:', priceInfo.unitAmount / 100); // $35.00
```

---

## 🔄 Price Update Workflow

### **Scenario: Increase Price from $30 to $35**

**Step 1: Create New Price**
```bash
# In Stripe Dashboard or via API
Product: Haunted Library
Amount: $35.00
Lookup Key: haunted_library_adult
Transfer Lookup Key: ✅ Yes
```

**Step 2: Automatic Transfer**
```
Old Price (price_ABC123):
  Amount: $30.00
  Lookup Key: [removed automatically]
  Status: Active (existing customers keep this)

New Price (price_XYZ789):
  Amount: $35.00
  Lookup Key: haunted_library_adult ✅
  Status: Active (new customers get this)
```

**Step 3: Your App Automatically Uses New Price**
```typescript
// No code changes needed!
const price = await getPriceByLookupKey('haunted_library_adult');
// Returns: $35.00 (new price)
```

---

## 🎨 Recommended Lookup Key Patterns

### **For Escape Rooms:**

```typescript
// Base pricing
const lookupKeys = {
  adult: `${gameSlug}_adult`,           // "haunted_library_adult"
  child: `${gameSlug}_child`,           // "haunted_library_child"
  group: `${gameSlug}_group_${size}`,   // "haunted_library_group_4"
  vip: `${gameSlug}_vip`,               // "haunted_library_vip"
};

// Time-based pricing
const timeBased = {
  weekday: `${gameSlug}_weekday`,       // "haunted_library_weekday"
  weekend: `${gameSlug}_weekend`,       // "haunted_library_weekend"
  holiday: `${gameSlug}_holiday`,       // "haunted_library_holiday"
};

// Promotional pricing
const promotional = {
  earlyBird: `${gameSlug}_early_bird`,  // "haunted_library_early_bird"
  lastMinute: `${gameSlug}_last_minute`, // "haunted_library_last_minute"
  seasonal: `${gameSlug}_summer_2025`,  // "haunted_library_summer_2025"
};
```

---

## ⚠️ Best Practices

### **DO:**
✅ Use descriptive, human-readable keys
✅ Include game/product identifier in key
✅ Use underscores for readability
✅ Keep keys unique across your account
✅ Document your lookup key strategy
✅ Use `transfer_lookup_key=true` when updating prices

### **DON'T:**
❌ Use spaces or special characters
❌ Reuse lookup keys across different products
❌ Hard-code price IDs alongside lookup keys
❌ Delete prices that have active subscriptions
❌ Change lookup keys frequently (defeats the purpose)

---

## 🧪 Testing Lookup Keys

### **Test Scenario 1: Create Price with Lookup Key**

```typescript
// 1. Create product
const product = await createProduct({
  name: 'Test Escape Room',
  description: 'Test game for lookup keys',
});

// 2. Create price with lookup key
const price = await createPriceWithLookupKey(product.id, {
  amount: 25.00,
  lookupKey: 'test_escape_room_adult',
});

// 3. Verify lookup key
const fetched = await getPriceByLookupKey('test_escape_room_adult');
console.assert(fetched.priceId === price.priceId);
console.assert(fetched.unitAmount === 2500); // $25.00 in cents
```

### **Test Scenario 2: Transfer Lookup Key**

```typescript
// 1. Create initial price
const price1 = await createPriceWithLookupKey(productId, {
  amount: 20.00,
  lookupKey: 'test_game_price',
});

// 2. Create new price and transfer key
const price2 = await createPriceWithLookupKey(productId, {
  amount: 25.00,
  lookupKey: 'test_game_price',
  transferLookupKey: true,
});

// 3. Verify transfer
const current = await getPriceByLookupKey('test_game_price');
console.assert(current.priceId === price2.priceId); // Should be new price
console.assert(current.unitAmount === 2500); // $25.00
```

---

## 📈 Advanced Use Cases

### **1. A/B Testing Prices**

```typescript
// Create two prices for same product
const priceA = await createPriceWithLookupKey(productId, {
  amount: 30.00,
  lookupKey: 'escape_room_test_a',
});

const priceB = await createPriceWithLookupKey(productId, {
  amount: 35.00,
  lookupKey: 'escape_room_test_b',
});

// In your app, randomly assign users
const testGroup = Math.random() < 0.5 ? 'a' : 'b';
const lookupKey = `escape_room_test_${testGroup}`;
const price = await getPriceByLookupKey(lookupKey);
```

### **2. Dynamic Seasonal Pricing**

```typescript
// Get current season
const season = getCurrentSeason(); // 'summer', 'winter', etc.
const lookupKey = `haunted_library_${season}_2025`;

try {
  const price = await getPriceByLookupKey(lookupKey);
  // Use seasonal price
} catch (error) {
  // Fallback to standard price
  const price = await getPriceByLookupKey('haunted_library_standard');
}
```

### **3. Time-Based Pricing**

```typescript
// Get day of week
const dayOfWeek = new Date().getDay();
const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

const lookupKey = isWeekend 
  ? 'escape_room_weekend'
  : 'escape_room_weekday';

const price = await getPriceByLookupKey(lookupKey);
```

---

## 🚀 Deployment Checklist

- [ ] Update Edge Function with lookup key support
- [ ] Deploy Edge Function to Supabase
- [ ] Add `stripe_lookup_key` column to database
- [ ] Update frontend service with new methods
- [ ] Add lookup key UI to Payment Settings
- [ ] Test creating price with lookup key
- [ ] Test transferring lookup key
- [ ] Test fetching price by lookup key
- [ ] Document your lookup key naming convention
- [ ] Train team on lookup key usage

---

## 📚 Additional Resources

- [Stripe Lookup Keys Documentation](https://docs.stripe.com/products-prices/manage-prices#lookup-keys)
- [Stripe API - Create Price](https://docs.stripe.com/api/prices/create)
- [Stripe API - List Prices](https://docs.stripe.com/api/prices/list)
- [Stripe Dashboard - Products](https://dashboard.stripe.com/products)

---

## 🆘 Troubleshooting

### **Issue: "No price found with lookup key"**
**Solution:** Verify the lookup key exists in Stripe Dashboard

### **Issue: "Lookup key already exists"**
**Solution:** Use `transfer_lookup_key=true` to transfer from old price

### **Issue: Multiple prices with same lookup key**
**Solution:** Only one active price can have a lookup key at a time

---

**Created:** 2025-11-11  
**Last Updated:** 2025-11-11  
**Version:** 1.0
