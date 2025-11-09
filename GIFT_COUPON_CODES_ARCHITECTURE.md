# Gift Codes & Coupon Codes Architecture
## Complete Discount & Gift Card System

**Version:** 1.0.0  
**Date:** November 10, 2025  
**Integration:** Stripe + Booking System

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Code Types & Features](#code-types--features)
5. [User Flows](#user-flows)
6. [Implementation Plan](#implementation-plan)
7. [Stripe Integration](#stripe-integration)

---

## Executive Summary

### Objective
Implement a complete gift code and coupon code system that integrates with Stripe payments and the booking flow.

### Features
- ✅ **Gift Cards** - Purchasable, redeemable for bookings
- ✅ **Coupon Codes** - Percentage or fixed amount discounts
- ✅ **Promo Codes** - Marketing campaigns
- ✅ **Referral Codes** - Customer referral program
- ✅ **Stripe Integration** - Sync with Stripe coupons
- ✅ **Usage Tracking** - Redemption limits and analytics
- ✅ **Expiration Management** - Time-based validity

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Booking    │  │  Gift Card   │  │   Coupon     │     │
│  │   Dialog     │  │  Purchase    │  │   Manager    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         │    ┌─────────────▼──────────────┐  │             │
│         │    │   Code Validator           │  │             │
│         │    │   (Apply Discount)         │  │             │
│         │    └─────────────┬──────────────┘  │             │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
└────────────────────────────┼──────────────────────────────┘
                             │
                             │
┌────────────────────────────▼──────────────────────────────┐
│              Supabase Edge Functions                       │
│                                                            │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ validate-code    │  │ purchase-gift-   │              │
│  │                  │  │    card          │              │
│  └────────┬─────────┘  └────────┬─────────┘              │
└───────────┼──────────────────────┼────────────────────────┘
            │                      │
            │                      │
    ┌───────▼──────────┐   ┌──────▼──────────┐
    │  Database        │   │  Stripe API     │
    │  (codes table)   │   │  (coupons)      │
    └───────┬──────────┘   └──────┬──────────┘
            │                      │
            │                      │
┌───────────▼──────────────────────▼────────────────────────┐
│                  Supabase Database                         │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │gift_cards│  │ coupons  │  │code_usage│  │ bookings │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### 1. gift_cards Table

```sql
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Code Details
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'gift_card',
  
  -- Value
  initial_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Purchase Info
  purchased_by UUID REFERENCES customers(id),
  purchased_for_email VARCHAR(255),
  purchased_for_name VARCHAR(255),
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Stripe Integration
  stripe_payment_intent_id VARCHAR(255),
  
  -- Status & Validity
  status VARCHAR(20) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_gift_card_status CHECK (status IN (
    'active', 'redeemed', 'expired', 'canceled'
  ))
);

CREATE INDEX idx_gift_cards_code ON gift_cards(code);
CREATE INDEX idx_gift_cards_status ON gift_cards(status);
CREATE INDEX idx_gift_cards_purchased_by ON gift_cards(purchased_by);
CREATE INDEX idx_gift_cards_expires ON gift_cards(expires_at);
```

### 2. coupons Table

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Code Details
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  
  -- Discount Details
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Minimum Requirements
  min_purchase_amount DECIMAL(10, 2),
  
  -- Usage Limits
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  max_per_customer INTEGER DEFAULT 1,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Restrictions
  applicable_to JSONB DEFAULT '{}'::jsonb,
  excluded_items JSONB DEFAULT '{}'::jsonb,
  
  -- Stripe Integration
  stripe_coupon_id VARCHAR(255),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_coupon_type CHECK (type IN (
    'coupon', 'promo', 'referral', 'seasonal'
  )),
  CONSTRAINT valid_discount_type CHECK (discount_type IN (
    'percentage', 'fixed_amount'
  ))
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);
CREATE INDEX idx_coupons_stripe_id ON coupons(stripe_coupon_id);
```

### 3. code_usage Table

```sql
CREATE TABLE code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Code Reference
  code_type VARCHAR(20) NOT NULL,
  code_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  
  -- Usage Details
  booking_id UUID REFERENCES bookings(id),
  customer_id UUID REFERENCES customers(id),
  
  -- Discount Applied
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  used_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_code_type CHECK (code_type IN (
    'gift_card', 'coupon', 'promo', 'referral'
  ))
);

CREATE INDEX idx_code_usage_booking ON code_usage(booking_id);
CREATE INDEX idx_code_usage_customer ON code_usage(customer_id);
CREATE INDEX idx_code_usage_code ON code_usage(code);
CREATE INDEX idx_code_usage_type ON code_usage(code_type);
```

### 4. Update bookings Table

```sql
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);

CREATE INDEX IF NOT EXISTS idx_bookings_discount_code ON bookings(discount_code);
```

---

## Code Types & Features

### 1. Gift Cards

**Purpose:** Purchasable credit for future bookings

**Features:**
- Purchase for self or as gift
- Email delivery option
- Custom message
- Partial redemption (use $50 from $100 card)
- Balance tracking
- Expiration dates
- Refundable (before use)

**Use Cases:**
- Birthday gifts
- Holiday presents
- Corporate gifts
- Customer rewards

### 2. Coupon Codes

**Purpose:** Discount codes for marketing

**Types:**
- **Percentage Off** - 20% off total
- **Fixed Amount** - $10 off
- **Free Shipping** - (if applicable)
- **BOGO** - Buy one get one

**Features:**
- Usage limits (total & per customer)
- Minimum purchase requirements
- Date range validity
- Specific game/venue restrictions
- Stackable or exclusive

**Use Cases:**
- Marketing campaigns
- First-time customer discounts
- Seasonal promotions
- Abandoned cart recovery

### 3. Promo Codes

**Purpose:** Short-term promotional campaigns

**Features:**
- Limited time offers
- High discount values
- Social media campaigns
- Influencer partnerships

**Use Cases:**
- Flash sales
- Holiday promotions
- Grand opening specials
- Partnership deals

### 4. Referral Codes

**Purpose:** Customer referral program

**Features:**
- Unique code per customer
- Reward both referrer and referee
- Tiered rewards
- Tracking and analytics

**Use Cases:**
- Word-of-mouth marketing
- Customer acquisition
- Loyalty program
- Ambassador program

---

## User Flows

### Flow 1: Purchase Gift Card

```
1. User navigates to "Gift Cards" page
   ↓
2. User selects gift card amount ($25, $50, $100, Custom)
   ↓
3. User enters recipient details (optional)
   - Recipient email
   - Recipient name
   - Personal message
   - Delivery date
   ↓
4. User enters their details
   ↓
5. User proceeds to payment
   ↓
6. Stripe processes payment
   ↓
7. System generates unique gift card code
   ↓
8. Email sent to recipient with code
   ↓
9. Gift card ready for redemption
```

### Flow 2: Redeem Gift Card / Coupon

```
1. User proceeds to booking checkout
   ↓
2. User sees "Have a gift card or coupon?" section
   ↓
3. User enters code
   ↓
4. User clicks "Apply"
   ↓
5. System validates code:
   - Code exists?
   - Code active?
   - Code not expired?
   - Usage limit not exceeded?
   - Minimum purchase met?
   ↓
6. System calculates discount
   ↓
7. Price updates with discount applied
   ↓
8. User sees:
   - Original price: $100
   - Discount: -$20
   - Final price: $80
   ↓
9. User proceeds with payment
   ↓
10. System records code usage
   ↓
11. Gift card balance updated (if applicable)
```

### Flow 3: Create Coupon (Admin)

```
1. Admin navigates to Marketing → Coupons
   ↓
2. Admin clicks "Create Coupon"
   ↓
3. Admin fills form:
   - Code (auto-generate or custom)
   - Name & description
   - Discount type (% or $)
   - Discount value
   - Validity dates
   - Usage limits
   - Restrictions
   ↓
4. Admin clicks "Create"
   ↓
5. System creates coupon in database
   ↓
6. System syncs with Stripe (optional)
   ↓
7. Coupon ready for use
```

---

## Implementation Plan

### Phase 1: Database & Backend (Days 1-3)

#### Step 1.1: Create Database Tables

```sql
-- Run migrations for:
- gift_cards table
- coupons table
- code_usage table
- Update bookings table
```

#### Step 1.2: Create Code Validation Service

**File:** `src/lib/codes/codeValidationService.ts`

```typescript
export interface CodeValidationResult {
  valid: boolean;
  code?: any;
  discountAmount?: number;
  finalAmount?: number;
  error?: string;
}

export class CodeValidationService {
  /**
   * Validate and apply code
   */
  static async validateCode(
    code: string,
    originalAmount: number,
    customerId?: string
  ): Promise<CodeValidationResult> {
    // 1. Check if code is gift card
    const giftCard = await this.checkGiftCard(code);
    if (giftCard) {
      return this.applyGiftCard(giftCard, originalAmount);
    }
    
    // 2. Check if code is coupon
    const coupon = await this.checkCoupon(code);
    if (coupon) {
      return this.applyCoupon(coupon, originalAmount, customerId);
    }
    
    return {
      valid: false,
      error: 'Invalid code'
    };
  }
  
  /**
   * Check gift card
   */
  static async checkGiftCard(code: string) {
    const { data } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single();
    
    return data;
  }
  
  /**
   * Check coupon
   */
  static async checkCoupon(code: string) {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (!data) return null;
    
    // Check expiration
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return null;
    }
    
    // Check usage limit
    if (data.max_redemptions && data.times_redeemed >= data.max_redemptions) {
      return null;
    }
    
    return data;
  }
  
  /**
   * Apply gift card discount
   */
  static applyGiftCard(giftCard: any, amount: number): CodeValidationResult {
    const discountAmount = Math.min(giftCard.current_value, amount);
    const finalAmount = amount - discountAmount;
    
    return {
      valid: true,
      code: giftCard,
      discountAmount,
      finalAmount
    };
  }
  
  /**
   * Apply coupon discount
   */
  static applyCoupon(
    coupon: any,
    amount: number,
    customerId?: string
  ): CodeValidationResult {
    // Check minimum purchase
    if (coupon.min_purchase_amount && amount < coupon.min_purchase_amount) {
      return {
        valid: false,
        error: `Minimum purchase of $${coupon.min_purchase_amount} required`
      };
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (amount * coupon.discount_value) / 100;
    } else {
      discountAmount = coupon.discount_value;
    }
    
    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, amount);
    const finalAmount = amount - discountAmount;
    
    return {
      valid: true,
      code: coupon,
      discountAmount,
      finalAmount
    };
  }
  
  /**
   * Record code usage
   */
  static async recordUsage(
    codeType: string,
    codeId: string,
    code: string,
    bookingId: string,
    customerId: string,
    originalAmount: number,
    discountAmount: number,
    finalAmount: number
  ) {
    await supabase.from('code_usage').insert({
      code_type: codeType,
      code_id: codeId,
      code: code,
      booking_id: bookingId,
      customer_id: customerId,
      original_amount: originalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount
    });
    
    // Update gift card balance if applicable
    if (codeType === 'gift_card') {
      await supabase
        .from('gift_cards')
        .update({
          current_value: supabase.raw(`current_value - ${discountAmount}`),
          status: supabase.raw(`CASE 
            WHEN current_value - ${discountAmount} <= 0 
            THEN 'redeemed' 
            ELSE 'active' 
          END`)
        })
        .eq('id', codeId);
    }
    
    // Update coupon usage count
    if (codeType === 'coupon') {
      await supabase
        .from('coupons')
        .update({
          times_redeemed: supabase.raw('times_redeemed + 1')
        })
        .eq('id', codeId);
    }
  }
}
```

#### Step 1.3: Create Gift Card Service

**File:** `src/lib/codes/giftCardService.ts`

```typescript
export class GiftCardService {
  /**
   * Purchase gift card
   */
  static async purchaseGiftCard(params: {
    amount: number;
    purchasedBy: string;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
  }) {
    // 1. Generate unique code
    const code = this.generateCode();
    
    // 2. Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      amount: params.amount,
      currency: 'usd',
      metadata: {
        type: 'gift_card_purchase',
        code: code
      }
    });
    
    // 3. Create gift card record
    const { data: giftCard } = await supabase
      .from('gift_cards')
      .insert({
        code: code,
        initial_value: params.amount,
        current_value: params.amount,
        purchased_by: params.purchasedBy,
        purchased_for_email: params.recipientEmail,
        purchased_for_name: params.recipientName,
        message: params.message,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      })
      .select()
      .single();
    
    return {
      giftCard,
      clientSecret: paymentIntent.clientSecret
    };
  }
  
  /**
   * Generate unique gift card code
   */
  static generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code; // Format: XXXX-XXXX-XXXX
  }
  
  /**
   * Check gift card balance
   */
  static async checkBalance(code: string) {
    const { data } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    return data;
  }
}
```

---

## Stripe Integration

### Sync Coupons with Stripe

```typescript
// When creating coupon in database, also create in Stripe
const stripeCoupon = await stripe.coupons.create({
  id: coupon.code,
  name: coupon.name,
  percent_off: coupon.discount_type === 'percentage' ? coupon.discount_value : undefined,
  amount_off: coupon.discount_type === 'fixed_amount' ? coupon.discount_value * 100 : undefined,
  currency: 'usd',
  duration: 'once',
  max_redemptions: coupon.max_redemptions
});

// Save Stripe coupon ID
await supabase
  .from('coupons')
  .update({ stripe_coupon_id: stripeCoupon.id })
  .eq('id', coupon.id);
```

### Apply Coupon to Payment Intent

```typescript
// When creating payment intent with coupon
const paymentIntent = await stripe.paymentIntents.create({
  amount: finalAmount * 100,
  currency: 'usd',
  metadata: {
    original_amount: originalAmount,
    discount_code: code,
    discount_amount: discountAmount
  }
});
```

---

## UI Components

### 1. Code Input Component

**File:** `src/components/codes/CodeInput.tsx`

```typescript
export function CodeInput({ onApply, originalAmount }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null);
  
  const handleApply = async () => {
    setLoading(true);
    const result = await CodeValidationService.validateCode(
      code,
      originalAmount
    );
    
    if (result.valid) {
      setApplied(result);
      onApply(result);
      toast.success('Code applied!');
    } else {
      toast.error(result.error || 'Invalid code');
    }
    setLoading(false);
  };
  
  return (
    <div className="space-y-2">
      <Label>Gift Card or Coupon Code</Label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          disabled={applied}
        />
        <Button onClick={handleApply} disabled={loading || applied}>
          {loading ? 'Validating...' : applied ? 'Applied' : 'Apply'}
        </Button>
      </div>
      
      {applied && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✓ {applied.code.name || 'Code'} applied! 
            You saved ${applied.discountAmount.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Gift card purchase flow works
- [ ] Gift card code generation is unique
- [ ] Gift card redemption works
- [ ] Gift card balance updates correctly
- [ ] Coupon validation works
- [ ] Percentage discount calculates correctly
- [ ] Fixed amount discount calculates correctly
- [ ] Usage limits enforced
- [ ] Expiration dates enforced
- [ ] Minimum purchase requirements work
- [ ] Code usage tracked in database
- [ ] Stripe integration works
- [ ] Email notifications sent

---

**Status:** Architecture Complete  
**Next:** Implement database schema and services  
**Estimated Time:** 5-7 days
