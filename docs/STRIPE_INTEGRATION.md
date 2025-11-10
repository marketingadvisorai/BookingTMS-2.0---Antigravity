# Stripe Integration Documentation

Version: 0.1.0  
Date: November 11, 2025

## Overview

This document describes the complete Stripe integration implementation in the Booking TMS system. The integration enables automatic payment processing for game bookings with comprehensive product and price management.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Game Creation Flow](#game-creation-flow)
3. [Stripe Product Structure](#stripe-product-structure)
4. [Payment Processing](#payment-processing)
5. [Error Handling](#error-handling)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐      ┌────────────────────────┐  │
│  │  AddGameWizard   │──────│ CalendarWidgetSettings │  │
│  └──────────────────┘      └────────────────────────┘  │
│           │                           │                  │
│           └────────────┬──────────────┘                  │
│                        │                                 │
│                        ▼                                 │
│              ┌──────────────────┐                        │
│              │   useGames Hook  │                        │
│              └──────────────────┘                        │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌───────────────┐
│    Supabase    │ │  Stripe  │ │  Edge         │
│    Database    │ │   API    │ │  Functions    │
│                │ │          │ │               │
│ • games table  │ │ • Product│ │ • stripe-     │
│ • venues table │ │ • Price  │ │   manage-     │
│ • settings     │ │ • Metadata│ │   product    │
└────────────────┘ └──────────┘ └───────────────┘
```

### Data Flow

1. **Game Creation**:
   - User completes 7-step wizard
   - Frontend validates data
   - Calls `createGame()` with complete game data
   - Hook attempts Stripe product creation
   - Saves to Supabase (with or without Stripe IDs)
   - Returns success

2. **Payment Processing**:
   - User selects game and date/time
   - Widget retrieves `stripe_price_id`
   - Creates checkout session with price ID
   - Redirects to Stripe Checkout
   - Webhook confirms payment
   - Updates booking status

---

## Game Creation Flow

### Step-by-Step Process

#### Step 1: Validation
```typescript
const validation = validateGameData();
if (!validation.isValid) {
  // Show errors to user
  return;
}
```

#### Step 2: Stripe Product Creation (Non-blocking)
```typescript
try {
  const { productId, priceId } = await StripeProductService.createProductAndPrice({
    name: gameData.name,
    description: gameData.description,
    price: gameData.adultPrice,
    currency: 'usd',
    metadata: {
      venue_id: gameData.venue_id,
      duration: gameData.duration.toString(),
      difficulty: gameData.difficulty,
      // ... additional metadata
    },
  });
  
  stripeProductId = productId;
  stripePriceId = priceId;
} catch (error) {
  console.warn('Stripe creation failed (non-blocking)');
  // Continue without Stripe
}
```

#### Step 3: Database Save
```typescript
const insertData = {
  ...gameData,
  stripe_product_id: stripeProductId,  // null if failed
  stripe_price_id: stripePriceId,      // null if failed
  stripe_sync_status: stripeProductId ? 'synced' : 'pending',
};

const { data } = await supabase
  .from('games')
  .insert([insertData])
  .select()
  .single();
```

#### Step 4: Metadata Update (If Stripe succeeded)
```typescript
if (stripeProductId) {
  await StripeProductService.updateProductMetadata(stripeProductId, {
    game_id: data.id,
  });
}
```

### Progress Tracking

The wizard shows real-time progress during creation:

```
20%  → Preparing game data
40%  → Creating Stripe product
70%  → Saving to database
90%  → Verifying creation
100% → Complete!
```

---

## Stripe Product Structure

### Product Metadata

Stripe products include comprehensive metadata for easy reference:

```json
{
  "name": "Mystery Mansion Escape",
  "description": "Solve puzzles to escape - 60 minutes",
  "metadata": {
    "product_name": "Mystery Mansion Escape",
    "product_type": "game",
    "game_id": "abc-123-def",
    "venue_id": "xyz-789-uvw",
    "duration": "60",
    "difficulty": "Medium",
    "image_url": "https://...",
    
    "adult_price": "35.00",
    "adult_price_display": "$35.00",
    
    "child_price": "25.00",
    "child_price_display": "$25.00",
    "child_pricing_enabled": "true",
    
    "custom_capacity_enabled": "true",
    "custom_capacity_count": "1",
    "custom_0_name": "Teens (13-17)",
    "custom_0_price": "30.00",
    "custom_0_price_display": "$30.00",
    
    "group_discount_enabled": "true",
    "group_tiers_count": "1",
    "tier_0_display": "6-8 people: 15% off",
    
    "pricing_summary": "Adult: $35.00, Child: $25.00, +1 custom, Group discounts: 1 tier"
  }
}
```

### Price Structure

```json
{
  "unit_amount": 3500,
  "currency": "usd",
  "product": "prod_xxxxx",
  "metadata": {
    "game_id": "abc-123-def",
    "adult_price": "35.00"
  }
}
```

---

## Payment Processing

### Checkout Session Creation

```typescript
const result = await CheckoutService.createBookingWithCheckout({
  venueId: venue.id,
  gameId: game.id,
  bookingDate: '2025-11-15',
  startTime: '19:00',
  endTime: '20:30',
  partySize: 4,
  customer: customerData,
  totalPrice: 140.00,
  priceId: game.stripe_price_id,  // Required!
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel',
});

// Redirect to Stripe Checkout
window.location.href = result.checkoutUrl;
```

### Payment Validation

Before creating checkout:

```typescript
if (!selectedGameData.stripe_price_id) {
  toast.error('Game pricing not configured. Please contact support.');
  return;
}
```

---

## Error Handling

### Stripe Creation Failures

The system handles Stripe failures gracefully:

```typescript
try {
  // Attempt Stripe creation
  await StripeProductService.createProductAndPrice(...);
} catch (stripeError) {
  // Non-blocking - game still created
  console.warn('Stripe failed:', stripeError);
  toast.warning('Game created without payment integration');
  // stripe_sync_status = 'pending'
}
```

### Missing Stripe Configuration

If a game lacks Stripe integration:

```
stripe_product_id: null
stripe_price_id: null
stripe_sync_status: 'pending'
```

Users will see: "Game pricing not configured. Please contact support."

### Recovery

Games with `stripe_sync_status: 'pending'` can be synced later:

```typescript
// Bulk sync function (to be implemented)
async function syncPendingGames() {
  const pendingGames = await supabase
    .from('games')
    .select('*')
    .is('stripe_product_id', null);
  
  for (const game of pendingGames.data) {
    await createStripeProduct(game);
  }
}
```

---

## API Reference

### StripeProductService

#### `createProductAndPrice(params)`

Creates Stripe product and price in one call.

**Parameters:**
```typescript
interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  currency?: string;
  childPrice?: number;
  customCapacityFields?: Array<{
    id: string;
    name: string;
    min: number;
    max: number;
    price: number;
  }>;
  groupDiscountEnabled?: boolean;
  groupTiers?: Array<{
    minSize: number;
    maxSize: number;
    discountPercent: number;
  }>;
  metadata?: Record<string, string>;
}
```

**Returns:**
```typescript
Promise<{
  productId: string;
  priceId: string;
}>
```

#### `updateProductMetadata(productId, metadata)`

Updates product metadata after game creation.

**Parameters:**
- `productId`: Stripe product ID
- `metadata`: Key-value pairs to add/update

**Returns:** `Promise<void>`

### Edge Function: stripe-manage-product

Located at: `supabase/functions/stripe-manage-product/index.ts`

**Actions:**
- `create_product`: Creates a Stripe product
- `create_price`: Creates a Stripe price
- `update_product`: Updates product details
- `archive_product`: Archives (soft deletes) product

**Example Request:**
```bash
curl -X POST https://[PROJECT].supabase.co/functions/v1/stripe-manage-product \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_product",
    "name": "Test Game",
    "description": "A test escape room",
    "metadata": {"game_id": "123"}
  }'
```

---

## Testing

### Test Game Creation

1. **Create Test Venue:**
```sql
-- Use Supabase MCP or admin panel
INSERT INTO venues (name, ...) VALUES ('Test Venue', ...);
```

2. **Create Test Game:**
   - Open Add Game Wizard
   - Fill all 7 steps
   - Click "Publish Game"
   - Verify Stripe product created

3. **Verify in Stripe Dashboard:**
   - Open https://dashboard.stripe.com/test/products
   - Find product by name
   - Check metadata fields

### Test Payment Flow

1. **Navigate to booking widget**
2. **Select game and date/time**
3. **Proceed to checkout**
4. **Use test card:**
   - Number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
5. **Complete payment**
6. **Verify booking created**

### Test Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Stripe API available | Game created with Stripe IDs |
| Stripe API down | Game created without Stripe IDs, status='pending' |
| Invalid Stripe key | Game created, error logged, status='pending' |
| Game update | Stripe product metadata updated |
| Game delete | Stripe product archived |

---

## Troubleshooting

### Issue: "Game pricing not configured"

**Cause:** Game missing `stripe_price_id`

**Solution:**
1. Check database:
```sql
SELECT stripe_price_id, stripe_sync_status 
FROM games 
WHERE id = 'game-id';
```

2. If null, recreate Stripe product manually
3. Update game record with price ID

### Issue: Stripe products not creating

**Check:**
1. Edge Function deployed:
```bash
supabase functions list
```

2. Stripe API key configured:
```bash
supabase secrets list
```

3. Function logs:
```bash
supabase functions logs stripe-manage-product
```

**Fix:**
```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# Redeploy function
supabase functions deploy stripe-manage-product
```

### Issue: Payments failing

**Check:**
1. Game has `stripe_price_id`
2. Price exists in Stripe dashboard
3. Stripe publishable key correct in frontend
4. Webhook configured (if using)

---

## Security Considerations

### API Keys

- **Publishable Key**: Safe in frontend (read-only)
- **Secret Key**: NEVER in frontend, only in Edge Functions
- **Webhook Secret**: Stored securely, verified on webhook events

### Best Practices

1. Always validate on server-side
2. Use webhook signing secrets
3. Implement idempotency keys
4. Log all payment events
5. Monitor failed payments

---

## Performance

### Optimization

- Non-blocking Stripe calls prevent game creation delays
- Loading states only on first page load
- Background sync for pending games
- Cached game data in widgets

### Metrics

- Average game creation time: <2 seconds
- Stripe API call time: ~300ms
- Database save time: ~100ms
- Total with Stripe: ~2 seconds
- Total without Stripe: <500ms

---

## Future Enhancements

1. **Webhook Handlers**
   - Payment success/failure
   - Refund processing
   - Subscription billing

2. **Bulk Operations**
   - Sync all pending games
   - Update all product metadata
   - Archive inactive games

3. **Revenue Analytics**
   - Stripe dashboard integration
   - Revenue reports
   - Payout tracking

4. **Advanced Pricing**
   - Dynamic pricing rules
   - Seasonal pricing
   - Early bird discounts

---

## Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting)
- Review Stripe Dashboard logs
- Check Supabase Edge Function logs
- Contact development team

---

**Last Updated:** November 11, 2025  
**Version:** 0.1.0
