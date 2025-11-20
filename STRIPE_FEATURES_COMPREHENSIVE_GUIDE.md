# Stripe Integration - Comprehensive Features Guide
## For Escape Room Booking System

**Version:** 2.0  
**Last Updated:** 2025-11-11  
**Target:** Booking TMS Beta V0.1

---

## 📚 Table of Contents

1. [Core Stripe Concepts](#core-stripe-concepts)
2. [Products & Prices](#products--prices)
3. [Payment Methods](#payment-methods)
4. [Checkout Sessions](#checkout-sessions)
5. [Payment Intents](#payment-intents)
6. [Subscriptions](#subscriptions)
7. [Coupons & Promotions](#coupons--promotions)
8. [Tax Management](#tax-management)
9. [Webhooks](#webhooks)
10. [Security Best Practices](#security-best-practices)
11. [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 Core Stripe Concepts

### **The Stripe Object Hierarchy**

```
Customer
├── Payment Methods (cards, bank accounts)
├── Subscriptions
│   └── Subscription Items (products/prices)
├── Payment Intents (one-time payments)
└── Invoices

Product
├── Prices (multiple pricing options)
│   ├── One-time
│   ├── Recurring (subscriptions)
│   └── Tiered/Volume pricing
└── Metadata (custom data)
```

---

## 📦 Products & Prices

### **1. Products**

**What:** Represents your escape room experiences

**Key Features:**
- Name, description, images
- Metadata for custom data
- Active/Archived status
- Tax codes for automatic tax

**For Escape Rooms:**
```typescript
{
  name: "Haunted Library",
  description: "A spooky 60-minute adventure",
  images: ["https://..."],
  metadata: {
    difficulty: "medium",
    duration: "60",
    min_players: "2",
    max_players: "8",
    category: "horror"
  },
  tax_code: "txcd_10000000" // Entertainment services
}
```

### **2. Prices**

**What:** Different pricing options for a product

**Types We Need:**

#### **A. One-Time Pricing**
```typescript
{
  product: "prod_xxx",
  unit_amount: 3000, // $30.00 in cents
  currency: "usd",
  lookup_key: "haunted_library_adult"
}
```

#### **B. Tiered Pricing (Group Discounts)**
```typescript
{
  product: "prod_xxx",
  currency: "usd",
  billing_scheme: "tiered",
  tiers_mode: "graduated",
  tiers: [
    { up_to: 2, unit_amount: 3000 },    // $30/person for 1-2
    { up_to: 4, unit_amount: 2800 },    // $28/person for 3-4
    { up_to: "inf", unit_amount: 2500 } // $25/person for 5+
  ]
}
```

#### **C. Volume Pricing**
```typescript
{
  product: "prod_xxx",
  currency: "usd",
  billing_scheme: "tiered",
  tiers_mode: "volume", // All units at same price
  tiers: [
    { up_to: 4, unit_amount: 3000 },    // $30/person if 1-4 people
    { up_to: "inf", unit_amount: 2500 } // $25/person if 5+ people
  ]
}
```

#### **D. Decimal Pricing (Precise amounts)**
```typescript
{
  product: "prod_xxx",
  currency: "usd",
  unit_amount_decimal: "2999.50", // $29.995
  // Useful for: tax-inclusive pricing, precise calculations
}
```

### **3. Lookup Keys** ⭐

**Why:** Change prices without code deployment

**Implementation:**
```typescript
// Create price with lookup key
{
  product: "prod_xxx",
  unit_amount: 3000,
  currency: "usd",
  lookup_key: "adult_escape_room"
}

// Update price (transfer key)
{
  product: "prod_xxx",
  unit_amount: 3500,
  currency: "usd",
  lookup_key: "adult_escape_room",
  transfer_lookup_key: true // Transfers from old price
}

// Fetch by lookup key
GET /v1/prices?lookup_keys[]=adult_escape_room
```

**Recommended Lookup Keys for Booking System:**

| Pricing Type | Lookup Key Pattern | Example |
|--------------|-------------------|---------|
| Adult | `{game_slug}_adult` | `haunted_library_adult` |
| Child | `{game_slug}_child` | `haunted_library_child` |
| Veterans | `{game_slug}_veteran` | `haunted_library_veteran` |
| Senior | `{game_slug}_senior` | `haunted_library_senior` |
| Student | `{game_slug}_student` | `haunted_library_student` |
| Group | `{game_slug}_group_{size}` | `haunted_library_group_6` |
| Weekend | `{game_slug}_weekend` | `haunted_library_weekend` |
| Holiday | `{game_slug}_holiday` | `haunted_library_holiday` |
| Custom Field | `{game_slug}_{field_name}` | `haunted_library_photographer` |

---

## 💳 Payment Methods

### **Supported Payment Methods**

1. **Cards** (Visa, Mastercard, Amex, Discover)
2. **Digital Wallets** (Apple Pay, Google Pay)
3. **Bank Transfers** (ACH, SEPA)
4. **Buy Now Pay Later** (Afterpay, Klarna)
5. **Cash App Pay**
6. **Link** (Stripe's one-click checkout)

### **Payment Method Configuration**

```typescript
// Enable payment methods in Checkout
{
  payment_method_types: [
    'card',
    'us_bank_account',
    'cashapp',
    'link'
  ]
}
```

---

## 🛒 Checkout Sessions

### **What:** Hosted payment page by Stripe

**Advantages:**
- ✅ PCI compliance handled by Stripe
- ✅ Mobile-optimized
- ✅ Multiple payment methods
- ✅ Automatic tax calculation
- ✅ Promotional codes
- ✅ Custom branding

### **Implementation for Escape Rooms**

```typescript
// Create checkout session
{
  mode: 'payment', // or 'subscription'
  line_items: [
    {
      price: 'price_xxx', // or price_data for dynamic
      quantity: 2, // Number of adults
    },
    {
      price: 'price_yyy', // Child price
      quantity: 1,
    }
  ],
  success_url: 'https://yoursite.com/booking/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yoursite.com/booking/cancel',
  customer_email: 'customer@example.com',
  metadata: {
    booking_id: 'book_123',
    game_id: 'game_456',
    time_slot: '2025-11-15T14:00:00Z'
  },
  // Automatic tax
  automatic_tax: { enabled: true },
  // Allow promo codes
  allow_promotion_codes: true,
  // Custom fields
  custom_fields: [
    {
      key: 'team_name',
      label: { type: 'custom', custom: 'Team Name' },
      type: 'text'
    }
  ]
}
```

### **Dynamic Pricing in Checkout**

```typescript
{
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Haunted Library - Adult',
          images: ['https://...'],
        },
        unit_amount: 3000,
      },
      quantity: 2,
    }
  ]
}
```

---

## 💰 Payment Intents

### **What:** Lower-level API for custom payment flows

**Use Cases:**
- Custom payment UI
- Split payments
- Delayed capture
- Multi-step checkout

### **Flow for Escape Room Booking**

```typescript
// 1. Create Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 6000, // $60.00
  currency: 'usd',
  payment_method_types: ['card'],
  metadata: {
    booking_id: 'book_123',
    game_id: 'game_456'
  }
});

// 2. Collect payment on frontend
// (using Stripe Elements)

// 3. Confirm payment
await stripe.paymentIntents.confirm(paymentIntent.id, {
  payment_method: 'pm_xxx'
});

// 4. Handle webhook for success
```

### **Capture Later (Hold Funds)**

```typescript
// Create with manual capture
{
  amount: 6000,
  currency: 'usd',
  capture_method: 'manual', // Hold funds
  metadata: {
    booking_id: 'book_123'
  }
}

// Capture when customer shows up
await stripe.paymentIntents.capture(paymentIntent.id);

// Or cancel if no-show
await stripe.paymentIntents.cancel(paymentIntent.id);
```

---

## 🔄 Subscriptions

### **Use Cases for Escape Rooms**

1. **Membership Programs**
   - Monthly unlimited access
   - Discounted rates for members
   
2. **Corporate Packages**
   - Recurring team-building events
   
3. **Season Passes**
   - Annual access to all games

### **Implementation**

```typescript
// Create subscription
{
  customer: 'cus_xxx',
  items: [
    {
      price: 'price_monthly_membership',
      quantity: 1
    }
  ],
  metadata: {
    membership_type: 'gold',
    venue_id: 'venue_123'
  },
  // Trial period
  trial_period_days: 7,
  // Proration behavior
  proration_behavior: 'create_prorations'
}
```

### **Usage-Based Subscriptions**

```typescript
// For "pay per game" memberships
{
  customer: 'cus_xxx',
  items: [
    {
      price: 'price_per_game',
      // Report usage later
    }
  ]
}

// Report usage
await stripe.subscriptionItems.createUsageRecord(
  'si_xxx',
  {
    quantity: 1, // One game played
    timestamp: Math.floor(Date.now() / 1000)
  }
);
```

---

## 🎟️ Coupons & Promotions

### **Types of Discounts**

#### **1. Percentage Off**
```typescript
{
  percent_off: 20, // 20% off
  duration: 'once', // or 'forever', 'repeating'
  name: 'SUMMER20'
}
```

#### **2. Amount Off**
```typescript
{
  amount_off: 500, // $5.00 off
  currency: 'usd',
  duration: 'once',
  name: 'FIRST5'
}
```

#### **3. Promotion Codes**
```typescript
// Create coupon first
const coupon = await stripe.coupons.create({
  percent_off: 15,
  duration: 'once'
});

// Create promotion code
const promoCode = await stripe.promotionCodes.create({
  coupon: coupon.id,
  code: 'ESCAPE15',
  max_redemptions: 100,
  expires_at: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
});
```

### **Restrictions**

```typescript
{
  percent_off: 25,
  duration: 'once',
  // Only for first-time customers
  applies_to: {
    products: ['prod_xxx', 'prod_yyy']
  },
  // Minimum amount
  min_amount: 5000, // $50 minimum
  min_amount_currency: 'usd'
}
```

---

## 🧾 Tax Management

### **Stripe Tax (Automatic)**

**Features:**
- Automatic tax calculation
- Tax registration monitoring
- Tax reporting
- Multi-jurisdiction support

```typescript
// Enable in Checkout
{
  automatic_tax: {
    enabled: true
  },
  // Or specify tax behavior
  line_items: [
    {
      price: 'price_xxx',
      quantity: 2,
      tax_rates: ['txr_xxx'] // Manual tax rate
    }
  ]
}
```

### **Tax Codes**

```typescript
// Set on product
{
  name: 'Escape Room Experience',
  tax_code: 'txcd_10000000' // Entertainment services
}
```

**Common Tax Codes:**
- `txcd_10000000` - Entertainment services
- `txcd_99999999` - General services
- `txcd_10103001` - Admission to events

---

## 🔔 Webhooks

### **Critical Events to Handle**

```typescript
// Payment succeeded
'payment_intent.succeeded'
'checkout.session.completed'

// Payment failed
'payment_intent.payment_failed'

// Subscription events
'customer.subscription.created'
'customer.subscription.updated'
'customer.subscription.deleted'

// Dispute events
'charge.dispute.created'
'charge.dispute.closed'

// Refund events
'charge.refunded'
```

### **Webhook Handler Example**

```typescript
// Verify webhook signature
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body,
  sig,
  webhookSecret
);

switch (event.type) {
  case 'checkout.session.completed':
    const session = event.data.object;
    // Fulfill booking
    await fulfillBooking(session.metadata.booking_id);
    break;
    
  case 'payment_intent.payment_failed':
    const paymentIntent = event.data.object;
    // Notify customer
    await sendPaymentFailedEmail(paymentIntent);
    break;
}
```

---

## 🔒 Security Best Practices

### **1. API Keys**

```typescript
// ❌ NEVER expose secret key
const stripe = require('stripe')('sk_live_xxx'); // Backend only!

// ✅ Use publishable key on frontend
const stripe = Stripe('pk_live_xxx'); // Safe for frontend
```

### **2. Idempotency**

```typescript
// Prevent duplicate charges
await stripe.paymentIntents.create(
  {
    amount: 3000,
    currency: 'usd'
  },
  {
    idempotencyKey: 'booking_123_payment' // Unique per operation
  }
);
```

### **3. Webhook Verification**

```typescript
// Always verify webhook signatures
try {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  );
} catch (err) {
  return res.status(400).send(`Webhook Error: ${err.message}`);
}
```

### **4. Metadata Security**

```typescript
// ❌ Don't store sensitive data
{
  metadata: {
    ssn: '123-45-6789', // NEVER!
    credit_card: '4242...' // NEVER!
  }
}

// ✅ Store references only
{
  metadata: {
    booking_id: 'book_123',
    customer_id: 'cust_456'
  }
}
```

---

## 🗺️ Implementation Roadmap

### **Phase 1: Basic Payment Processing** ✅

- [x] Product creation
- [x] Price management
- [x] Checkout sessions
- [x] Payment confirmation
- [x] Webhook handling

### **Phase 2: Advanced Pricing** 🚧

- [ ] Lookup keys for all pricing types
- [ ] Tiered/volume pricing for groups
- [ ] Dynamic pricing (time-based)
- [ ] Promotional codes
- [ ] Gift cards

### **Phase 3: Customer Experience** 📋

- [ ] Save payment methods
- [ ] One-click checkout (Link)
- [ ] Multiple payment methods
- [ ] Automatic tax calculation
- [ ] Invoice generation

### **Phase 4: Business Features** 📋

- [ ] Subscription memberships
- [ ] Corporate accounts
- [ ] Refund management
- [ ] Dispute handling
- [ ] Revenue analytics

### **Phase 5: Advanced Features** 📋

- [ ] Split payments (group bookings)
- [ ] Deposit + balance payments
- [ ] Recurring bookings
- [ ] Usage-based pricing
- [ ] Multi-currency support

---

## 📊 Feature Comparison Matrix

| Feature | Checkout Sessions | Payment Intents | Subscriptions |
|---------|------------------|-----------------|---------------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Customization** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **PCI Compliance** | ✅ Handled | ⚠️ Shared | ✅ Handled |
| **Mobile Optimized** | ✅ Yes | ⚠️ Custom | ✅ Yes |
| **One-Time Payments** | ✅ Yes | ✅ Yes | ❌ No |
| **Recurring Payments** | ❌ No | ❌ No | ✅ Yes |
| **Promo Codes** | ✅ Yes | ❌ No | ✅ Yes |
| **Tax Calculation** | ✅ Auto | ⚠️ Manual | ✅ Auto |

---

## 🎯 Recommended Stack for Escape Rooms

### **For Simple Bookings:**
```
Checkout Sessions + Webhooks
```

### **For Custom UI:**
```
Payment Intents + Stripe Elements + Webhooks
```

### **For Memberships:**
```
Subscriptions + Customer Portal + Webhooks
```

### **For Enterprise:**
```
Payment Intents + Subscriptions + Connect (multi-venue)
```

---

## 📚 Additional Resources

- [Stripe API Reference](https://docs.stripe.com/api)
- [Stripe Testing](https://docs.stripe.com/testing)
- [Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices)
- [Security Guide](https://docs.stripe.com/security)
- [Tax Documentation](https://docs.stripe.com/tax)

---

**Next Steps:**
1. Review this guide
2. Implement lookup keys for all pricing types
3. Set up webhook handling
4. Add promotional codes
5. Implement automatic tax

---

**Created:** 2025-11-11  
**Maintained by:** Booking TMS Development Team
