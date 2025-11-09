# Implementation Approach - Using Existing UI/UX

## Design System Analysis

### Existing Components to Reuse:
1. **Dialog Components** - `src/components/ui/dialog.tsx`
2. **Form Components** - Input, Label, Select, Button
3. **Card Components** - Card, CardContent, CardHeader
4. **Promo/Gift Card** - PromoCodeInput, GiftCardInput (already exist!)
5. **Theme System** - Dark/light mode support

### Color Scheme:
```typescript
// Dark Mode Colors
- Background: dark:bg-[#1e1e1e]
- Card Background: dark:bg-[#161616]
- Border: dark:border-[#2a2a2a]
- Text: dark:text-white
- Muted Text: dark:text-[#737373]
- Primary: dark:bg-[#4f46e5]
- Primary Hover: dark:hover:bg-[#4338ca]
```

### Existing Booking Widgets:
1. **FareBookWidget** - Multi-step booking flow
2. **CalendarWidget** - Calendar-based booking
3. **MultiStepWidget** - Step-by-step wizard

## Updated Implementation Strategy

### Phase 2: UI Components (Revised)

Instead of creating from scratch, I'll:

1. **Reuse FareBookWidget Pattern**
   - Multi-step flow
   - Category → Game → Date → Time → Details → Payment
   - Existing theme support
   - PromoCode/GiftCard integration already built

2. **Create BookingDialog** (matching existing style)
   - Use existing Dialog component
   - Match dark mode colors
   - Integrate with existing PromoCodeInput
   - Integrate with existing GiftCardInput
   - Use existing PaymentWrapper

3. **Integrate Payment**
   - Use existing PaymentWrapper component
   - Add to existing booking flow
   - Match existing UI patterns

### Components Already Available:
✅ Dialog, AlertDialog  
✅ Button, Input, Label, Select  
✅ Card, CardContent, CardHeader  
✅ PromoCodeInput  
✅ GiftCardInput  
✅ PaymentWrapper, PaymentForm  
✅ Theme system (useTheme)  

### What Needs to be Created:
- [ ] BookingDialog (using existing components)
- [ ] Integration into Venues page
- [ ] Integration into Games page
- [ ] BookingConfirmation page

### Design Principles:
1. **Match Existing UI** - Use same colors, spacing, typography
2. **Reuse Components** - Don't reinvent the wheel
3. **Consistent Theme** - Support dark/light mode
4. **Mobile Responsive** - Match existing responsive patterns
5. **Accessibility** - Follow existing a11y patterns

## Next Steps:

1. Create BookingDialog using existing Dialog component
2. Style with existing dark mode classes
3. Integrate PromoCodeInput and GiftCardInput
4. Connect to PaymentWrapper
5. Add to Venues and Games pages

This approach will ensure consistency with the existing design system!
