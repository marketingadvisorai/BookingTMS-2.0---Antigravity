# Platform Fee System Architecture

## Overview

BookingTMS implements a transparent fee system with 1.29% platform management fee on each ticket sale, plus standard Stripe processing fees. Organizations can choose who pays these fees.

## Fee Structure

| Fee Type | Rate | Description |
|----------|------|-------------|
| **Platform Management Fee** | 1.29% | Fixed platform fee on ticket price |
| **Stripe Processing** | 2.9% + $0.30 | Standard Stripe card processing |

## Fee Payment Modes

Organizations have two options for handling fees:

### 1. Pass Fees to Customer (Default)

Customer pays the ticket price plus service fees. Organization receives 100% of ticket price.

```
Example: $100 ticket

Customer Pays:
  Ticket Price:     $100.00
  + Service Fee:    $  4.54
  ─────────────────────────
  Total:            $104.54

Breakdown:
  Platform Fee (1.29%):  $1.29
  Stripe Fee:            $3.25
  ─────────────────────────────
  Organization Receives: $100.00
```

### 2. Organization Absorbs Fees

Customer pays only the ticket price. Fees are deducted from organization payout.

```
Example: $100 ticket

Customer Pays:     $100.00

Breakdown:
  Platform Fee (1.29%):  $1.29
  Stripe Fee:            $3.20
  Total Fees:            $4.49
  ─────────────────────────────
  Organization Receives: $95.51
```

## Stripe Compliance Requirements

Per [Stripe's guidelines on fee transparency](https://stripe.com/docs/connect/statement-descriptors#fee-transparency):

### Required Disclosures

1. **Pre-Checkout Disclosure**: Fees must be clearly shown BEFORE customer enters payment info
2. **Itemized Breakdown**: Show subtotal, service fee (if applicable), and total
3. **Clear Labeling**: Use descriptive labels like "Service Fee" or "Booking Fee"
4. **No Hidden Fees**: All fees must be visible and not exceed actual costs

### Card Network Rules

- **Visa/Mastercard**: Allow passing fees in most jurisdictions with proper disclosure
- **Some restrictions**: Certain states (CA, CO, CT, FL, KS, ME, MA, NY, OK, TX) have surcharge regulations
- **Best Practice**: Use "Service Fee" terminology rather than "Credit Card Fee"

## Database Schema

### Organizations Table (Fee Columns)

```sql
-- Added by migration 085_platform_fee_system.sql

fee_payment_mode VARCHAR(20) DEFAULT 'pass_to_customer'
  -- 'absorb' | 'pass_to_customer'

platform_fee_percent NUMERIC(5,3) DEFAULT 1.29
  -- Fixed at 1.29% for platform management

stripe_fee_percent NUMERIC(5,2) DEFAULT 2.9
  -- Stripe standard processing rate

stripe_fee_fixed NUMERIC(10,2) DEFAULT 0.30
  -- Stripe fixed fee per transaction

show_fee_breakdown BOOLEAN DEFAULT true
  -- Display itemized fees to customers

fee_label VARCHAR(100) DEFAULT 'Service Fee'
  -- Customer-facing label for fees
```

### Bookings Table (Fee Tracking)

```sql
subtotal NUMERIC(10,2)
  -- Original ticket price before fees

platform_fee NUMERIC(10,2)
  -- Platform management fee amount

stripe_fee NUMERIC(10,2)
  -- Stripe processing fee amount

total_fees NUMERIC(10,2)
  -- Total fees charged

fee_payment_mode VARCHAR(20)
  -- Mode at time of booking

customer_paid_fees BOOLEAN DEFAULT false
  -- Whether customer paid the fees
```

## API Response

### Checkout Session Response

```typescript
{
  sessionId: string;
  url: string;
  // ... other fields
  
  fees: {
    feePaymentMode: 'absorb' | 'pass_to_customer';
    platformFee: number;    // Platform fee amount
    stripeFee: number;      // Stripe fee amount
    totalFees: number;      // Total fees
    customerTotal: number;  // What customer pays
    showBreakdown: boolean; // Display breakdown?
    feeLabel: string;       // Customer-facing label
  }
}
```

## UI Components

### Admin Settings (OrganizationSettingsModal)

Located in `/src/components/organizations/OrganizationSettingsModal.tsx`

**Billing Tab Features:**
- Fee payment mode selector (radio cards)
- Live fee calculation example
- Fee label customization
- Toggle for showing fee breakdown

### Checkout Widget (FeeBreakdown)

Located in `/src/components/widgets/checkout/FeeBreakdown.tsx`

**Features:**
- Itemized order summary
- Service fee display (when passed to customer)
- Tooltip explanations
- Promo/gift card discount display
- Stripe compliance notice

## Fee Calculator Utility

Located in `/src/lib/fees/feeCalculator.ts`

```typescript
import { calculateFees, FeeSettings } from '@/lib/fees';

const settings: FeeSettings = {
  feePaymentMode: 'pass_to_customer',
  platformFeePercent: 1.29,
  stripeFeePercent: 2.9,
  stripeFeeFixed: 0.30,
  showFeeBreakdown: true,
  feeLabel: 'Service Fee',
};

const result = calculateFees(100, settings);
// {
//   subtotal: 100,
//   platformFee: 1.29,
//   stripeFee: 3.25,
//   totalFees: 4.54,
//   customerTotal: 104.54,
//   orgReceives: 100,
//   feePaymentMode: 'pass_to_customer',
//   breakdown: [...]
// }
```

## Implementation Checklist

- [x] Database migration (085_platform_fee_system.sql)
- [x] Organization types updated
- [x] Fee calculator utility
- [x] Admin settings UI (Billing tab)
- [x] Edge function (create-checkout-session)
- [x] FeeBreakdown component
- [x] Documentation

## Edge Function Deployment

To deploy the updated checkout function:

```bash
supabase functions deploy create-checkout-session --project-ref qftjyjpitnoapqxlrvfs
```

## Migration Application

Apply the fee system migration:

```bash
supabase db push --project-ref qftjyjpitnoapqxlrvfs
```

Or manually in Supabase SQL Editor:

```sql
-- See: /supabase/migrations/085_platform_fee_system.sql
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 09, 2025 | Initial platform fee system with two modes |

---

*Last Updated: December 9, 2025*
