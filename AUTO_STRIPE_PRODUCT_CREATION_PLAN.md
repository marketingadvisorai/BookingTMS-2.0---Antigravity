# Automatic Stripe Product & Price Creation
## Auto-Create Stripe Products When Games Are Created

**Date:** November 10, 2025

---

## Objective

When a user creates or edits a game in a venue:
1. Automatically create a Stripe Product
2. Automatically create a Stripe Price
3. Store `stripe_product_id` and `stripe_price_id` in the games table
4. Embed widgets are immediately ready to accept payments

---

## Current Flow (Before)

```
User creates game → Game saved to database → Done
```

**Problem:** No Stripe product/price, so payments can't be processed!

---

## New Flow (After)

```
User creates/edits game
    ↓
Game data prepared
    ↓
Create Stripe Product (using Stripe MCP)
    ↓
Create Stripe Price (using Stripe MCP)
    ↓
Save game to database WITH stripe_product_id & stripe_price_id
    ↓
Embed widgets ready to accept payments! ✅
```

---

## Implementation Plan

### Step 1: Update Games Table Schema

Add Stripe fields to games table:
```sql
ALTER TABLE games
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_games_stripe_product ON games(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_games_stripe_price ON games(stripe_price_id);
```

### Step 2: Create StripeProductService

**File:** `src/lib/stripe/stripeProductService.ts`

Functions:
- `createProductForGame()` - Create Stripe product
- `createPriceForProduct()` - Create Stripe price
- `updateProductForGame()` - Update existing product
- `updatePriceForProduct()` - Create new price (prices are immutable)

### Step 3: Integrate into useGames Hook

Update `src/hooks/useGames.ts`:
- In `createGame()`: Call Stripe product/price creation BEFORE database insert
- In `updateGame()`: Update product, create new price if price changed

### Step 4: Handle Edge Cases

- Game creation fails → Delete Stripe product
- Price changes → Create new price, archive old one
- Game deletion → Archive Stripe product (don't delete)
- Network errors → Retry logic

---

## Code Structure

### StripeProductService API

```typescript
// Create product and price for new game
const { productId, priceId } = await StripeProductService.createProductAndPrice({
  name: 'Escape Room - The Vault',
  description: 'An exciting escape room experience...',
  price: 30.00,
  currency: 'usd',
  metadata: {
    game_id: 'game_123',
    venue_id: 'venue_456',
    duration: '60'
  }
});

// Update existing product
await StripeProductService.updateProduct(productId, {
  name: 'New Name',
  description: 'New Description'
});

// Create new price (when price changes)
const newPriceId = await StripeProductService.createPrice(productId, {
  amount: 35.00,
  currency: 'usd'
});
```

### Updated useGames Hook

```typescript
const createGame = async (gameData) => {
  try {
    // 1. Create Stripe product & price
    const { productId, priceId } = await StripeProductService.createProductAndPrice({
      name: gameData.name,
      description: gameData.description,
      price: gameData.price,
      currency: 'usd',
      metadata: {
        game_id: 'pending', // Will update after creation
        venue_id: gameData.venue_id,
        duration: gameData.duration.toString()
      }
    });
    
    // 2. Save to database WITH Stripe IDs
    const { data, error } = await supabase
      .from('games')
      .insert([{
        ...gameData,
        stripe_product_id: productId,
        stripe_price_id: priceId
      }])
      .select()
      .single();
    
    // 3. Update Stripe product with actual game_id
    await StripeProductService.updateProductMetadata(productId, {
      game_id: data.id
    });
    
    return data;
  } catch (error) {
    // Rollback: Delete Stripe product if database insert failed
    if (productId) {
      await StripeProductService.archiveProduct(productId);
    }
    throw error;
  }
};
```

---

## Stripe MCP Integration

Using Stripe MCP tools:

```typescript
// Create Product
await mcp3_create_product({
  name: 'Escape Room - The Vault',
  description: 'An exciting 60-minute escape room...'
});

// Create Price
await mcp3_create_price({
  product: 'prod_xxx',
  unit_amount: 3000, // $30.00 in cents
  currency: 'usd'
});
```

---

## Benefits

✅ **Automatic** - No manual Stripe setup needed
✅ **Consistent** - Every game has a product & price
✅ **Ready** - Embed widgets can accept payments immediately
✅ **Synced** - Game data matches Stripe data
✅ **Tracked** - All payments linked to correct products
✅ **Scalable** - Works for unlimited games/venues

---

## Database Schema Changes

```sql
-- Migration: Add Stripe fields to games
ALTER TABLE games
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_sync_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_last_sync TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_stripe_product ON games(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_games_stripe_price ON games(stripe_price_id);

-- Constraints
ALTER TABLE games
ADD CONSTRAINT unique_stripe_product UNIQUE (stripe_product_id);
```

---

## Error Handling

### Scenario 1: Stripe API Failure
```typescript
try {
  const { productId, priceId } = await createStripeProduct();
} catch (error) {
  toast.error('Failed to create payment product. Please try again.');
  // Don't save game to database
  return;
}
```

### Scenario 2: Database Failure After Stripe Creation
```typescript
try {
  const game = await supabase.insert(gameData);
} catch (error) {
  // Rollback: Archive the Stripe product
  await StripeProductService.archiveProduct(productId);
  toast.error('Failed to save game. Please try again.');
}
```

### Scenario 3: Price Update
```typescript
if (updates.price && updates.price !== currentGame.price) {
  // Prices are immutable in Stripe
  // Create new price, archive old one
  const newPriceId = await createPrice(productId, updates.price);
  updates.stripe_price_id = newPriceId;
  // Old price automatically archived in Stripe dashboard
}
```

---

## Testing Checklist

- [ ] Create new game → Stripe product created
- [ ] Create new game → Stripe price created
- [ ] Game saved with stripe_product_id
- [ ] Game saved with stripe_price_id
- [ ] Edit game name → Stripe product updated
- [ ] Edit game price → New Stripe price created
- [ ] Delete game → Stripe product archived
- [ ] Network error → Proper rollback
- [ ] Embed widget can process payment
- [ ] Payment links to correct product

---

## Implementation Timeline

**Phase 1: Database Migration** (15 minutes)
- Add Stripe columns to games table
- Create indexes

**Phase 2: StripeProductService** (1 hour)
- Create service file
- Implement create/update/archive methods
- Add error handling

**Phase 3: Integrate with useGames** (1 hour)
- Update createGame function
- Update updateGame function
- Add rollback logic

**Phase 4: Testing** (30 minutes)
- Test game creation
- Test game updates
- Test error scenarios

**Total: 2.5-3 hours**

---

## Next Steps

1. Run database migration (Supabase MCP)
2. Create StripeProductService
3. Update useGames hook
4. Test complete flow
5. Deploy

Ready to implement!
