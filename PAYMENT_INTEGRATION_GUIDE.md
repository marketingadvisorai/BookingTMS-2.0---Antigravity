# Payment Integration Guide for Embed Widgets
## Complete Payment Acceptance with Validation

**Date:** November 10, 2025, 10:15 PM

---

## Overview

This guide shows how to integrate real Stripe payment processing into embed widgets with complete form validation.

---

## Components Created

### 1. Form Validation (`src/lib/validation/formValidation.ts`)

**Functions:**
- `validateEmail()` - RFC 5322 compliant email validation
- `validateName()` - First + last name validation
- `validatePhone()` - Phone number validation (10-15 digits)
- `validatePlayerCount()` - Check against game min/max
- `sanitizePhone()` - Convert to E.164 format for Stripe
- `sanitizeName()` - Trim and capitalize
- `sanitizeEmail()` - Trim and lowercase
- `validateCheckoutForm()` - Validate entire form at once
- `formatPhoneDisplay()` - Format for display

**Usage:**
```typescript
import { validateEmail, validateName, validatePhone, validateCheckoutForm } from '@/lib/validation/formValidation';

// Individual validation
const emailResult = validateEmail('user@example.com');
if (!emailResult.isValid) {
  console.error(emailResult.error);
}

// Full form validation
const result = validateCheckoutForm({
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '(555) 123-4567',
  playerCount: 4,
  minPlayers: 2,
  maxPlayers: 8
});

if (!result.isValid) {
  // Show errors: result.errors.fullName, result.errors.email, etc.
}
```

### 2. Code Validation (`src/lib/validation/codeValidation.ts`)

**Functions:**
- `validatePromoCode()` - Check promo code in database
- `validateGiftCard()` - Check gift card in database
- `applyPromoDiscount()` - Calculate discounted amount
- `applyGiftCardBalance()` - Calculate remaining after gift card
- `calculatePromoDiscount()` - Get discount amount
- `recordPromoCodeUsage()` - Track usage after payment
- `recordGiftCardUsage()` - Update balance after payment

**Usage:**
```typescript
import { validatePromoCode, validateGiftCard, applyPromoDiscount } from '@/lib/validation/codeValidation';

// Validate promo code
const promoResult = await validatePromoCode('SAVE20', 100);
if (promoResult.isValid && promoResult.discount) {
  const newAmount = applyPromoDiscount(100, promoResult.discount);
  // newAmount = 80 (if 20% off)
}

// Validate gift card
const giftResult = await validateGiftCard('GIFT-1234-5678');
if (giftResult.isValid && giftResult.balance) {
  // Apply gift card balance
  const { remainingAmount, giftCardUsed } = applyGiftCardBalance(100, giftResult.balance);
}
```

---

## Integration Steps for Widgets

### Step 1: Import Dependencies

```typescript
import { BookingService } from '@/lib/bookings/bookingService';
import { PaymentWrapper } from '@/components/payments/PaymentWrapper';
import { validateCheckoutForm, sanitizeEmail, sanitizeName, sanitizePhone } from '@/lib/validation/formValidation';
import { validatePromoCode, validateGiftCard, recordPromoCodeUsage, recordGiftCardUsage } from '@/lib/validation/codeValidation';
```

### Step 2: Add Validation State

```typescript
const [validationErrors, setValidationErrors] = useState<{
  fullName?: string;
  email?: string;
  phone?: string;
  playerCount?: string;
}>({});

const [isValidating, setIsValidating] = useState(false);
```

### Step 3: Add Real-Time Validation

```typescript
// On input change
const handleNameChange = (value: string) => {
  setContactDetails({ ...contactDetails, fullName: value });
  
  // Validate on blur or after typing stops
  const result = validateName(value);
  if (!result.isValid) {
    setValidationErrors({ ...validationErrors, fullName: result.error });
  } else {
    setValidationErrors({ ...validationErrors, fullName: undefined });
  }
};
```

### Step 4: Validate Before Payment

```typescript
const handleCompleteBooking = async () => {
  // Validate all inputs
  const validation = validateCheckoutForm({
    fullName: contactDetails.fullName,
    email: contactDetails.email,
    phone: contactDetails.phone,
    playerCount: totalPlayers,
    minPlayers: selectedGame.min_players,
    maxPlayers: selectedGame.max_players
  });

  if (!validation.isValid) {
    setValidationErrors(validation.errors);
    toast.error('Please fix the errors in the form');
    return;
  }

  // Continue with payment...
};
```

### Step 5: Integrate Booking Service

```typescript
const processBooking = async () => {
  try {
    setIsProcessingPayment(true);

    // Sanitize inputs
    const cleanedData = {
      email: sanitizeEmail(contactDetails.email),
      firstName: sanitizeName(contactDetails.fullName.split(' ')[0]),
      lastName: sanitizeName(contactDetails.fullName.split(' ').slice(1).join(' ')),
      phone: sanitizePhone(contactDetails.phone),
    };

    // Calculate final amount with discounts
    let finalAmount = totalAmount;
    
    if (appliedPromoCode && appliedPromoCode.discount) {
      finalAmount = applyPromoDiscount(finalAmount, appliedPromoCode.discount);
    }
    
    if (appliedGiftCard && appliedGiftCard.balance) {
      const result = applyGiftCardBalance(finalAmount, appliedGiftCard.balance);
      finalAmount = result.remainingAmount;
    }

    // Create booking with payment
    const result = await BookingService.createBookingWithPayment({
      gameId: selectedGame.id,
      date: selectedDate,
      time: selectedTime,
      partySize: totalPlayers,
      customer: cleanedData,
      amount: finalAmount,
      promoCode: appliedPromoCode?.code,
      giftCardCode: appliedGiftCard?.code,
    });

    // Set payment client secret
    setClientSecret(result.clientSecret);
    setBookingId(result.bookingId);
    
    // Show payment form
    setCurrentStep('payment');
    
  } catch (error) {
    console.error('Booking error:', error);
    toast.error('Failed to create booking');
    setIsProcessingPayment(false);
  }
};
```

### Step 6: Handle Payment Success

```typescript
const handlePaymentSuccess = async (paymentIntent: any) => {
  try {
    // Record code usage
    if (appliedPromoCode) {
      await recordPromoCodeUsage(appliedPromoCode.code, bookingId);
    }
    
    if (appliedGiftCard) {
      await recordGiftCardUsage(
        appliedGiftCard.code,
        giftCardUsed,
        bookingId
      );
    }

    // Show success page
    setCurrentStep('success');
    toast.success('Booking confirmed!');
    
  } catch (error) {
    console.error('Post-payment error:', error);
    // Payment succeeded, but tracking failed (non-critical)
  }
};
```

### Step 7: Replace Mock Payment with PaymentWrapper

```typescript
{currentStep === 'payment' && clientSecret && (
  <div className="space-y-6">
    <h2>Complete Payment</h2>
    
    <PaymentWrapper
      clientSecret={clientSecret}
      onSuccess={handlePaymentSuccess}
      onError={(error) => {
        console.error('Payment failed:', error);
        setCurrentStep('failed');
        toast.error('Payment failed');
      }}
    />
  </div>
)}
```

---

## Complete Flow

```
User fills form
    ↓
Real-time validation (show errors immediately)
    ↓
Click "Complete Booking"
    ↓
Validate all fields
    ↓
IF invalid → Show errors, prevent submit
    ↓
IF valid → Sanitize data
    ↓
Validate promo/gift codes (if applied)
    ↓
Calculate final amount with discounts
    ↓
Call BookingService.createBookingWithPayment()
    ↓
Get clientSecret from response
    ↓
Show PaymentWrapper with Stripe Elements
    ↓
User enters card details
    ↓
Stripe processes payment
    ↓
On success → Record code usage
    ↓
Show success page with booking details
```

---

## Validation Rules

### Email:
- ✅ Must be valid email format
- ✅ Must have @ and domain
- ✅ No spaces allowed
- ✅ Max 320 characters

### Name:
- ✅ First AND last name required
- ✅ At least 2 characters each
- ✅ Only letters, spaces, hyphens, apostrophes
- ✅ No numbers or special characters

### Phone:
- ✅ 10-15 digits required
- ✅ Formatting optional: (555) 123-4567 or 555-123-4567
- ✅ Converted to E.164 for Stripe: +15551234567

### Player Count:
- ✅ Must be integer
- ✅ >= game minimum
- ✅ <= game maximum

### Promo Code:
- ✅ Must exist in database
- ✅ Must be active
- ✅ Not expired
- ✅ Usage limit not exceeded
- ✅ Minimum purchase met

### Gift Card:
- ✅ Must exist in database
- ✅ Must be active
- ✅ Not expired
- ✅ Has remaining balance

---

## Error Handling

```typescript
try {
  // Process booking
} catch (error) {
  if (error.message.includes('email')) {
    setValidationErrors({ ...validationErrors, email: 'Invalid email' });
  } else if (error.message.includes('payment')) {
    toast.error('Payment failed. Please try again.');
    setCurrentStep('failed');
  } else {
    toast.error('An error occurred. Please try again.');
  }
}
```

---

## Testing Checklist

- [ ] Valid email accepted
- [ ] Invalid email rejected with error
- [ ] Full name required (first + last)
- [ ] Single name rejected
- [ ] Special characters in name rejected
- [ ] Valid phone formats accepted
- [ ] Short phone rejected (<10 digits)
- [ ] Player count within limits accepted
- [ ] Player count below min rejected
- [ ] Player count above max rejected
- [ ] Valid promo code applied correctly
- [ ] Invalid promo code rejected
- [ ] Expired promo code rejected
- [ ] Valid gift card applied correctly
- [ ] Invalid gift card rejected
- [ ] Payment processes successfully
- [ ] Payment failure handled gracefully
- [ ] Success page shows booking details

---

## Stripe Test Cards

**Success:**
- 4242 4242 4242 4242 (Visa)
- Expiry: Any future date
- CVC: Any 3 digits

**Decline:**
- 4000 0000 0000 0002 (Card declined)

---

## Next Steps

1. Update FareBookWidget with validation and payment
2. Update CalendarWidget with validation and payment
3. Test complete flow
4. Deploy

**Status:** Validation utilities complete ✅  
**Next:** Widget integration
