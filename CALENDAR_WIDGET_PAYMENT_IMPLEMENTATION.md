# CalendarWidget Payment Implementation
## Adding Real Stripe Payments to Venues Calendar Widget

**Date:** November 10, 2025, 10:30 PM  
**Target:** CalendarWidget for existing games/venues

---

## Current State

**CalendarWidget** (`src/components/widgets/CalendarWidget.tsx`):
- ✅ Has booking steps: 'booking' → 'cart' → 'checkout' → 'success'
- ✅ Has customer form: name, email, phone
- ✅ Has PromoCodeInput and GiftCardInput components
- ✅ Uses SupabaseBookingService (basic database insert only)
- ❌ NO validation
- ❌ NO real payment processing
- ❌ Card fields exist but not used

---

## Implementation Plan

### Changes Needed:

#### 1. Import New Services ✅
```typescript
import { BookingService } from '../../lib/bookings/bookingService';
import { PaymentWrapper } from '../payments/PaymentWrapper';
import { validateCheckoutForm, sanitizeEmail, sanitizeName, sanitizePhone } from '../../lib/validation/formValidation';
import { validatePromoCode, validateGiftCard, recordPromoCodeUsage, recordGiftCardUsage } from '../../lib/validation/codeValidation';
```

#### 2. Add Validation State ✅
```typescript
const [validationErrors, setValidationErrors] = useState<{
  name?: string;
  email?: string;
  phone?: string;
}>({});
const [isProcessing, setIsProcessing] = useState(false);
const [clientSecret, setClientSecret] = useState<string>('');
const [bookingId, setBookingId] = useState<string>('');
```

#### 3. Add Real-Time Validation ✅
```typescript
const validateForm = () => {
  const result = validateCheckoutForm({
    fullName: customerData.name,
    email: customerData.email,
    phone: customerData.phone,
  });
  
  setValidationErrors(result.errors);
  return result.isValid;
};
```

#### 4. Update handleCompleteBooking ✅
```typescript
const handleCompleteBooking = async () => {
  // Step 1: Validate all inputs
  if (!validateForm()) {
    toast.error('Please fix the errors in the form');
    return;
  }

  // Step 2: Validate promo/gift codes
  let finalAmount = totalPrice;
  
  if (appliedPromoCode) {
    const promoValidation = await validatePromoCode(appliedPromoCode.code, finalAmount);
    if (!promoValidation.isValid) {
      toast.error(promoValidation.error);
      setAppliedPromoCode(null);
      return;
    }
  }

  // Step 3: Sanitize data
  const cleanData = {
    email: sanitizeEmail(customerData.email),
    firstName: sanitizeName(customerData.name.split(' ')[0]),
    lastName: sanitizeName(customerData.name.split(' ').slice(1).join(' ') || 'N/A'),
    phone: sanitizePhone(customerData.phone),
  };

  // Step 4: Create booking with payment
  try {
    setIsProcessing(true);
    
    const result = await BookingService.createBookingWithPayment({
      gameId: selectedGameData.id,
      venueId: config.venueId,
      date: new Date(currentYear, currentMonth, selectedDate).toISOString(),
      time: selectedTime,
      partySize: partySize,
      customer: cleanData,
      amount: finalAmount,
      promoCode: appliedPromoCode?.code,
      giftCardCode: appliedGiftCard?.code,
    });

    // Step 5: Set payment client secret
    setClientSecret(result.clientSecret);
    setBookingId(result.bookingId);
    
    // Step 6: Move to payment step
    setCurrentStep('payment'); // NEW STEP!
    
  } catch (error) {
    console.error('Booking error:', error);
    toast.error('Failed to create booking');
    setIsProcessing(false);
  }
};
```

#### 5. Add Payment Step ✅
```typescript
{currentStep === 'payment' && clientSecret && (
  <div className="max-w-4xl mx-auto p-4 md:p-8">
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount</span>
          <span className="text-2xl font-bold" style={{ color: primaryColor }}>
            ${totalPrice}
          </span>
        </div>
      </div>

      <PaymentWrapper
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </Card>
  </div>
)}
```

#### 6. Handle Payment Success ✅
```typescript
const handlePaymentSuccess = async (paymentIntent: any) => {
  try {
    // Record code usage
    if (appliedPromoCode) {
      await recordPromoCodeUsage(appliedPromoCode.code, bookingId);
    }
    
    if (appliedGiftCard) {
      await recordGiftCardUsage(appliedGiftCard.code, appliedGiftCard.amount, bookingId);
    }

    // Set confirmation code
    setConfirmationCode(bookingId);
    
    // Move to success page
    setCurrentStep('success');
    setIsProcessing(false);
    
    toast.success('Payment successful! Booking confirmed.');
    
  } catch (error) {
    console.error('Post-payment error:', error);
    // Payment succeeded, tracking failed (non-critical)
    setCurrentStep('success');
  }
};

const handlePaymentError = (error: any) => {
  console.error('Payment error:', error);
  toast.error('Payment failed. Please try again.');
  setIsProcessing(false);
  setCurrentStep('checkout'); // Go back to checkout
};
```

#### 7. Add Validation to Form Inputs ✅
```typescript
<Input
  value={customerData.name}
  onChange={(e) => {
    setCustomerData({ ...customerData, name: e.target.value });
    // Clear error on change
    if (validationErrors.name) {
      setValidationErrors({ ...validationErrors, name: undefined });
    }
  }}
  onBlur={() => {
    const result = validateName(customerData.name);
    if (!result.isValid) {
      setValidationErrors({ ...validationErrors, name: result.error });
    }
  }}
  className={validationErrors.name ? 'border-red-500' : ''}
/>
{validationErrors.name && (
  <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
)}
```

---

## New Flow

```
User fills booking form (game, date, time, party size)
    ↓
Click "Add to Cart"
    ↓
Cart step: Review booking
    ↓
Click "Proceed to Checkout"
    ↓
Checkout step: Enter customer details (name, email, phone)
    ↓
Real-time validation shows errors
    ↓
Optional: Apply promo/gift codes
    ↓
Click "Complete Payment"
    ↓
Validate ALL fields
    ↓
IF errors → Show errors, prevent submit
    ↓
IF valid → Sanitize data
    ↓
Create booking with BookingService.createBookingWithPayment()
    ↓
Receive clientSecret
    ↓
NEW STEP: Payment (show PaymentWrapper)
    ↓
User enters card details (Stripe Elements)
    ↓
Stripe processes payment
    ↓
On success → Record code usage → Success page ✅
    ↓
On failure → Go back to checkout, show error ❌
```

---

## Code Structure

### New Step Added:
- **'booking'** - Select game, date, time
- **'cart'** - Review booking
- **'checkout'** - Enter customer details
- **'payment'** - Enter card details (NEW!)
- **'success'** - Confirmation

### State Management:
```typescript
const [currentStep, setCurrentStep] = useState<'booking' | 'cart' | 'checkout' | 'payment' | 'success'>('booking');
const [clientSecret, setClientSecret] = useState<string>('');
const [bookingId, setBookingId] = useState<string>('');
const [isProcessing, setIsProcessing] = useState(false);
const [validationErrors, setValidationErrors] = useState<{
  name?: string;
  email?: string;
  phone?: string;
}>({});
```

---

## Validation Rules

| Field | Validation | Error Message |
|-------|------------|---------------|
| **Name** | First + last name required, 2+ chars each | "Please enter both first and last name" |
| **Email** | Valid email format | "Please enter a valid email address" |
| **Phone** | 10-15 digits | "Phone number must have at least 10 digits" |
| **Game** | Must be selected | "Please select a game" |
| **Date** | Must be selected | "Please select a date" |
| **Time** | Must be selected | "Please select a time" |
| **Party Size** | Integer, within game limits | "Party size must be between X and Y" |

---

## Testing Checklist

- [ ] Valid inputs accepted
- [ ] Invalid name rejected
- [ ] Invalid email rejected
- [ ] Invalid phone rejected
- [ ] Promo code validation works
- [ ] Gift card validation works
- [ ] Payment processes successfully
- [ ] Success page shows booking details
- [ ] Payment failure handled gracefully
- [ ] Back button works
- [ ] Form validation happens real-time
- [ ] Errors clear when user fixes them

---

## Stripe Test Cards

**Success:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date (12/25)
- CVC: Any 3 digits (123)

**Decline:**
- Card: 4000 0000 0000 0002

---

## Benefits

✅ **Real Payment Processing** - Stripe integration  
✅ **Full Validation** - All inputs validated  
✅ **User Friendly** - Real-time error messages  
✅ **Secure** - PCI compliant via Stripe Elements  
✅ **Discount Support** - Promo and gift cards  
✅ **Error Handling** - Graceful failure recovery  
✅ **Works with Existing Games** - No backend changes needed  

---

## Next Steps

1. Update CalendarWidget.tsx with these changes
2. Test with existing games in Venues page
3. Test payment with Stripe test cards
4. Deploy

**Ready to implement!**
