# Add Booking - Coupon Code & Discount Feature

**Date:** November 13, 2025  
**Status:** ✅ Complete

---

## Changes Made

### 1. Updated Form Interface

Added two new fields to `AddBookingFormValues`:
- `couponCode: string` - For promotional codes
- `discountPercentage: number` - For discount percentage (0-100%)

### 2. Form State Initialization

Both fields are initialized with default values:
```typescript
couponCode: '',
discountPercentage: 0,
```

### 3. Total Amount Calculation

Updated the `totalAmount` calculation to apply discounts:
```typescript
const totalAmount = useMemo(() => {
  const adultPrice = selectedGame?.price ?? 30;
  const childPrice = selectedGame?.childPrice ?? Math.max((selectedGame?.price ?? 30) * 0.7, 0);
  const subtotal = (formData.adults * adultPrice) + (formData.children * childPrice);
  const discountAmount = (subtotal * formData.discountPercentage) / 100;
  return subtotal - discountAmount;
}, [formData.adults, formData.children, selectedGame, formData.discountPercentage]);
```

### 4. Booking Summary Display

Enhanced the booking summary to show discount breakdown when applicable:
- Shows **Subtotal** (original amount)
- Shows **Discount** in green with percentage
- Shows **Total Amount** (after discount)

### 5. Input Fields Added

**Coupon Code Field:**
- Label: "Coupon Code (Optional)"
- Placeholder: "SAVE20"
- Auto-converts to uppercase
- Helper text: "Enter promotional code if available"

**Discount Percentage Field:**
- Label: "Discount Percentage"
- Type: Number input
- Range: 0-100%
- Step: 1%
- Helper text: "Enter discount percentage (0-100%)"
- Validation: Automatically clamps value between 0-100

---

## UI Layout

The fields are positioned in Step 3 (Payment & Confirmation):

```
Payment Method          Payment Status
[Credit Card ▼]        [Pending ▼]

Coupon Code            Discount Percentage
[SAVE20]              [20]
Helper text           Helper text

Deposit Amount
[0]
Helper text
```

---

## Features

### ✅ Coupon Code
- Text input that converts to uppercase automatically
- Optional field
- Stored in booking metadata
- Can be used for tracking promotional campaigns

### ✅ Discount Percentage
- Number input with validation
- Accepts values from 0 to 100
- Automatically calculates discount amount
- Updates total in real-time
- Shows discount breakdown in summary

### ✅ Real-time Calculation
- Total updates immediately when discount changes
- Shows subtotal, discount, and final total
- Green text for discount to indicate savings

### ✅ Responsive Design
- Two-column layout on desktop
- Single column on mobile
- Follows existing design patterns
- Consistent styling with other form fields

---

## Example Usage

### Scenario 1: 20% Discount
- Subtotal: $60.00
- Discount (20%): -$12.00
- **Total Amount: $48.00**

### Scenario 2: Coupon Code Only
- Coupon Code: "SAVE20"
- Discount Percentage: 20%
- Applied at checkout

### Scenario 3: No Discount
- Coupon Code: (empty)
- Discount Percentage: 0
- Total = Subtotal

---

## Technical Details

### Field Validation
- Discount percentage is clamped between 0-100
- Coupon code is converted to uppercase
- Both fields are optional
- Form can be submitted with or without discounts

### Data Flow
1. User enters discount percentage
2. `totalAmount` recalculates automatically
3. Booking summary updates in real-time
4. Values are included in form submission
5. Stored in booking record

---

## Testing Checklist

- [x] Discount percentage field accepts 0-100
- [x] Values outside range are clamped
- [x] Coupon code converts to uppercase
- [x] Total amount updates in real-time
- [x] Discount breakdown shows correctly
- [x] Fields reset when form is cleared
- [x] Responsive layout works on mobile
- [x] Form submission includes discount data

---

**Status:** Ready for use ✅
