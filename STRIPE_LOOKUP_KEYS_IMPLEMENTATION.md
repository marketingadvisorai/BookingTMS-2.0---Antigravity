# Stripe Lookup Keys Implementation

## Overview
Implemented Stripe lookup keys for dynamic price updates across the multi-tenant platform.

## What Changed

### Database (Migration: 022_add_stripe_lookup_keys.sql)
**New columns on `games` table:**
- `price_lookup_key` (VARCHAR 255, UNIQUE) - Stable identifier for prices
- `active_price_id` (VARCHAR 255) - Currently active Stripe price
- `price_history` (JSONB) - Complete audit trail of all price changes

**Auto-generated lookup key format:**
```
{org_slug}_{venue_slug}_{game_slug}_default
```
Example: `acme-escape_downtown_haunted-mansion_default`

**New Functions:**
- `generate_price_lookup_key()` - Creates stable lookup keys
- `auto_generate_price_lookup_key()` - Trigger for auto-generation on insert
- `log_price_change()` - Tracks price history automatically
- `get_price_by_lookup_key()` - Query prices by lookup key
- `get_game_price_history()` - Get complete price change history
- `update_game_price_with_lookup()` - Update price via lookup key

### Frontend Updates

#### StripeProductService (`src/lib/stripe/stripeProductService.ts`)
**New methods:**
- `updatePriceByLookupKey(lookupKey, newAmount, productId)` - Update price via lookup key
- `getPriceByLookupKey(lookupKey)` - Retrieve price by lookup key
- `isValidLookupKey(lookupKey)` - Validate lookup key format

**Updated:**
- `CreatePriceParams` interface now includes `lookup_key` field
- `createPrice()` sends lookup_key to Stripe

#### useGames Hook (`src/hooks/useGames.ts`)
**Updated Game interface:**
```typescript
export interface Game {
  // ... existing fields
  price_lookup_key?: string;
  active_price_id?: string;
  price_history?: any[];
}
```

**createGame():**
- Generates lookup key when creating Stripe product
- Includes lookup_key in Stripe metadata
- Database trigger auto-populates price_lookup_key

**updateGame():**
- Uses lookup keys for seamless price updates
- Creates new Stripe price with same lookup key
- Stripe automatically deactivates old price
- Tracks changes in price_history

## How It Works

### Creating a Game
```typescript
const game = await createGame({
  venue_id: 'venue-uuid',
  name: 'Haunted Mansion',
  price: 35.00,
  // ... other fields
});

// Automatically:
// 1. Generates lookup key: org_venue_game_default
// 2. Creates Stripe product with lookup key
// 3. Database trigger populates price_lookup_key column
// 4. Sets active_price_id = stripe_price_id
```

### Updating Price
```typescript
const updated = await updateGame(gameId, {
  price: 40.00  // New price
});

// Automatically:
// 1. Detects price change
// 2. Uses lookup key to create new Stripe price
// 3. Stripe deactivates old price with same lookup key
// 4. Updates active_price_id in database
// 5. Logs change to price_history:
//    {
//      old_price: 35.00,
//      new_price: 40.00,
//      old_price_id: "price_old",
//      new_price_id: "price_new",
//      changed_at: "2025-01-13T...",
//      lookup_key: "org_venue_game_default"
//    }
```

### Benefits of Lookup Keys

✅ **Seamless Price Updates**: Change prices without breaking existing integrations
✅ **No Breaking Changes**: Checkout/payment flows use lookup key, always get current price
✅ **Automatic Deactivation**: Stripe handles old price deactivation
✅ **Complete Audit Trail**: price_history tracks every change
✅ **Multi-Tenant Safe**: Lookup keys include org/venue context
✅ **Frontend Simple**: Just update price field, everything else automatic

## Backend API Requirements

Your backend needs to support lookup keys in the Stripe price creation endpoint:

```typescript
// POST /api/stripe/prices
{
  productId: string,
  amount: number,
  currency: string,
  lookup_key?: string,  // NEW: Optional lookup key
  metadata?: object
}
```

## Migration Steps

### 1. Apply Database Migration
```sql
-- Run in Supabase SQL Editor
-- Copy contents from: supabase/migrations/022_add_stripe_lookup_keys.sql
```

### 2. Verify Migration
```sql
-- Check columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'games' 
  AND column_name IN ('price_lookup_key', 'active_price_id', 'price_history');

-- Should return 3 rows

-- Check lookup keys were generated
SELECT id, name, price_lookup_key, active_price_id, price
FROM games
WHERE price_lookup_key IS NOT NULL
LIMIT 5;
```

### 3. Update Backend (If Needed)
Ensure your backend Stripe price creation endpoint accepts and uses `lookup_key`:

```typescript
// In your backend/api/stripe/prices endpoint
const price = await stripe.prices.create({
  product: productId,
  unit_amount: amount,
  currency: currency,
  lookup_key: lookup_key, // Pass through from request
  metadata: metadata
});
```

### 4. Test Price Update
```typescript
// In your app
const game = await updateGame('game-id', {
  price: 45.00  // Update price
});

// Check Stripe Dashboard:
// - Old price should be inactive
// - New price should have same lookup key
// - New price should be active
```

## Price History Query

```sql
-- Get price history for a game
SELECT 
  id,
  name,
  price as current_price,
  price_history,
  price_lookup_key,
  active_price_id
FROM games
WHERE id = 'game-uuid';

-- View formatted price history
SELECT 
  id,
  name,
  jsonb_pretty(price_history) as price_changes
FROM games
WHERE price_history IS NOT NULL
  AND jsonb_array_length(price_history) > 0;
```

## Stripe Dashboard View

With lookup keys, your Stripe prices will show:
```
Price ID: price_1ABC...
Lookup Key: acme-escape_downtown_haunted-mansion_default
Amount: $40.00
Status: Active
```

Previous prices with same lookup key will show:
```
Status: Inactive (replaced by lookup key)
```

## Error Handling

The system gracefully handles:
- ✅ Games without organization_id (lookup key not generated)
- ✅ Stripe API failures (price update falls back to non-lookup-key method)
- ✅ Missing lookup keys (creates new price without lookup key)
- ✅ Duplicate lookup keys (unique constraint prevents conflicts)

## Monitoring

Check Stripe sync status:
```sql
SELECT 
  name,
  price,
  stripe_sync_status,
  stripe_last_sync,
  price_lookup_key
FROM games
WHERE stripe_product_id IS NOT NULL
ORDER BY updated_at DESC;
```

## Future Enhancements

- **Price Schedules**: Use lookup keys for scheduled price changes
- **A/B Testing**: Multiple prices with different lookup keys
- **Regional Pricing**: Lookup keys per region/currency
- **Promotional Pricing**: Temporary lookup key overrides

## Files Changed

1. `supabase/migrations/022_add_stripe_lookup_keys.sql` (NEW)
2. `src/lib/stripe/stripeProductService.ts` (UPDATED)
3. `src/hooks/useGames.ts` (UPDATED)
4. `STRIPE_LOOKUP_KEYS_IMPLEMENTATION.md` (NEW - this file)

## Deployment Checklist

- [x] Database migration created
- [x] Frontend code updated
- [x] Build successful (no errors)
- [ ] Apply migration to Supabase
- [ ] Update backend API (if needed)
- [ ] Test price update flow
- [ ] Verify Stripe Dashboard shows lookup keys
- [ ] Deploy to Render

