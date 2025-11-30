# Promo Code & Gift Card Integration

## Overview

This document describes the complete integration of promo codes and gift cards into the booking flow.

## Implementation Date
November 30, 2025 (v0.1.55)

---

## Features Implemented

### 1. Promo/Gift Card UI in Booking Widget

**Components Updated:**
- `src/components/widgets/PromoCodeInput.tsx` - Real backend validation
- `src/components/widgets/GiftCardInput.tsx` - Real backend validation
- `src/components/widgets/booking/page-components/BookingSidebar.tsx` - Passes organizationId and subtotal
- `src/components/widgets/booking/page-components/PromoGiftCardInput.tsx` - Combined input component

**Validation Flow:**
1. Customer enters promo code or gift card code
2. Component validates against Supabase `promotions` or `gift_cards` table
3. If valid, discount is applied to order summary
4. Code and discount amount are passed to checkout session

### 2. Stripe Webhook Updates

**File:** `supabase/functions/stripe-webhook/index.ts`

**New Features:**
- Extracts promo/gift card metadata from checkout session
- Increments promo code usage count on successful payment
- Deducts gift card balance on successful payment
- Records gift card transaction in `gift_card_transactions` table
- Sends gift card redemption notification email

**Booking Fields Added:**
```sql
promo_code VARCHAR(100)
promo_discount NUMERIC
gift_card_id UUID
gift_card_amount NUMERIC
subtotal NUMERIC
discount_total NUMERIC
```

### 3. Email Notifications

**Gift Card Redemption Email:**
- Sent to customer who used the gift card
- Shows amount used, remaining balance
- Also notifies gift card recipient/purchaser if different

**Gift Card Notifications Service:**
- `src/modules/marketing-pro/services/giftCardNotifications.service.ts`
- `sendPurchaseConfirmation()` - Notify purchaser
- `sendGiftCardToRecipient()` - Send code to recipient
- `sendRedemptionNotification()` - Notify on usage
- `sendLowBalanceWarning()` - Warn when balance low

---

## Database Migrations

### Migration 060: RPC Functions
`supabase/migrations/060_add_promo_usage_increment_rpc.sql`

**Functions:**
1. `increment_promo_usage(p_promo_code, p_organization_id)` - Safely increments usage count
2. `decrement_gift_card_balance(p_gift_card_id, p_amount, p_booking_id)` - Deducts balance atomically

---

## Checkout Flow

### Request Parameters
```typescript
{
  // ... existing params
  promoCode?: string,      // Promo code to validate
  giftCardCode?: string,   // Gift card code to validate  
  giftCardAmount?: number, // Amount to deduct from gift card
  subtotal?: number,       // Original subtotal before discounts
}
```

### Response
```typescript
{
  sessionId: string,
  url: string,
  discounts: {
    promoCode: string | null,
    promoDiscount: number,
    giftCardCode: string | null,
    giftCardAmount: number,
    subtotal: number,
    finalAmount: number,
  }
}
```

---

## Testing

### Test Cards (Stripe)
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Auth Required:** `4000 0025 0000 3155`
- Exp: Any future date | CVC: Any 3 digits

### Demo Promo Codes (Fallback)
- `SAVE10` - 10% off
- `SAVE20` - 20% off
- `WELCOME` - 15% off
- `VIP` - 25% off
- `FIRST` - $5 off

### Demo Gift Cards (Fallback)
- `GIFT50` - $50 balance
- `GIFT100` - $100 balance
- `HOLIDAY25` - $25 balance
- `BIRTHDAY75` - $75 balance

---

## Deployment Steps

### 1. Apply Migration
```bash
npx supabase migration up --project-ref qftjyjpitnoapqxlrvfs
```

### 2. Regenerate Types
```bash
npx supabase gen types typescript --project-id qftjyjpitnoapqxlrvfs > src/types/supabase.ts
```

### 3. Deploy Webhook Function
```bash
npx supabase functions deploy stripe-webhook --project-ref qftjyjpitnoapqxlrvfs
```

### 4. Deploy Checkout Function
```bash
npx supabase functions deploy create-checkout-session --project-ref qftjyjpitnoapqxlrvfs
```

---

## TypeScript Notes

The TypeScript errors about `Property 'xxx' does not exist on type 'never'` are due to:
- Supabase types not being regenerated for the new `promotions` and `gift_cards` tables
- These resolve at runtime
- Run `supabase gen types typescript` to fix them

The `Cannot find name 'Deno'` errors in edge functions are expected:
- Edge functions run in Supabase's Deno runtime
- These work correctly when deployed

---

## Files Changed

### New Files
- `src/components/widgets/booking/page-components/PromoGiftCardInput.tsx`
- `src/modules/marketing-pro/services/giftCardNotifications.service.ts`
- `supabase/migrations/060_add_promo_usage_increment_rpc.sql`
- `docs/PROMO_GIFTCARD_INTEGRATION.md`

### Modified Files
- `src/components/widgets/PromoCodeInput.tsx` - Added real validation
- `src/components/widgets/GiftCardInput.tsx` - Added real validation
- `src/components/widgets/booking/page-components/BookingSidebar.tsx` - Added organizationId prop
- `src/components/widgets/booking/page-components/index.ts` - Export PromoGiftCardInput
- `src/modules/marketing-pro/services/index.ts` - Export notification service
- `supabase/functions/stripe-webhook/index.ts` - Finalize promo/gift card
- `supabase/functions/create-checkout-session/index.ts` - Already supports promo/gift

---

## Architecture

```
Customer Enters Code in Widget
        ↓
PromoCodeInput / GiftCardInput validates against Supabase
        ↓
Discount applied to order summary
        ↓
Checkout Session created with metadata
        ↓
Customer completes Stripe payment
        ↓
Webhook receives checkout.session.completed
        ↓
→ Increment promo usage count
→ Deduct gift card balance  
→ Record gift card transaction
→ Create booking with discount fields
→ Send confirmation emails
```
