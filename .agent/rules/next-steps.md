# BookingTMS 2.0 - Next Steps & Task List

> Last Updated: 2025-11-27
> Version: v2.1.0-embed-pro-liquid-glass

---

## Completed (v2.1.0)

### Embed Pro 2.0
- [x] Apple Liquid Glass design for booking widget
- [x] Glassmorphism container, buttons, step indicators
- [x] WidgetActivitySelector for venue multi-game selection
- [x] Dashboard edit, duplicate, analytics, toggle actions
- [x] Migration 055: Public read access for widgets
- [x] BookingWidgetPro with smooth step transitions
- [x] WidgetPartySize with glass counters
- [x] WidgetCalendar with availability indicators
- [x] WidgetTimeSlots with time grid

---

## Priority 1: Stripe Checkout Integration

### Tasks
- [ ] Connect `WidgetCheckout` to `create-checkout-session` edge function
- [ ] Pass booking data (activity, date, time, party size, customer info)
- [ ] Handle Stripe redirect and success/cancel URLs
- [ ] Update booking status on `checkout.session.completed` webhook
- [ ] Add loading state during checkout creation

### Files to Modify
- `src/modules/embed-pro/widgets/BookingWidgetPro.tsx`
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

---

## Priority 2: Real Availability Check

### Tasks
- [ ] Query `activity_sessions` for actual available slots
- [ ] Check `booked_count` vs `capacity` for each session
- [ ] Update `WidgetTimeSlots` to show real availability
- [ ] Add `check_availability` database function
- [ ] Block booking if slot becomes unavailable

### Files to Modify
- `src/modules/embed-pro/services/embedProData.service.ts`
- `src/modules/embed-pro/widget-components/WidgetTimeSlots.tsx`
- `supabase/functions/check-availability/index.ts`

---

## Priority 3: Booking Confirmation Flow

### Tasks
- [ ] Create booking record in database after payment
- [ ] Send confirmation email via Resend
- [ ] Show booking confirmation with details
- [ ] Generate booking reference number
- [ ] Add to customer's booking history

### Files to Create/Modify
- `supabase/functions/send-booking-confirmation/index.ts`
- `src/modules/embed-pro/widget-components/WidgetSuccess.tsx`

---

## Priority 4: Widget Analytics

### Tasks
- [ ] Track widget views (increment `view_count`)
- [ ] Track booking conversions (increment `booking_count`)
- [ ] Add analytics dashboard with charts
- [ ] Track step drop-off rates
- [ ] Add date range filtering

### Files to Create
- `src/modules/embed-pro/components/AnalyticsDashboard.tsx`
- `supabase/functions/track-widget-event/index.ts`

---

## Priority 5: Theme Customization

### Tasks
- [ ] Add theme selector in embed config (light/dark/auto)
- [ ] Add custom color picker for primary color
- [ ] Add font family selector
- [ ] Add border radius options
- [ ] Preview theme changes in real-time

### Files to Modify
- `src/modules/embed-pro/components/CreateEmbedModal.tsx`
- `src/modules/embed-pro/types/embed-config.types.ts`

---

## Priority 6: Embed Code Generator

### Tasks
- [ ] Generate iframe embed code
- [ ] Generate JavaScript snippet embed code
- [ ] Add copy-to-clipboard functionality
- [ ] Show installation instructions
- [ ] Add WordPress plugin guide

### Files to Modify
- `src/modules/embed-pro/components/EmbedCodeDisplay.tsx`
- `public/embed/bookingtms.js`

---

## Priority 7: Mobile Optimization

### Tasks
- [ ] Test widget on mobile devices
- [ ] Optimize touch targets (min 44px)
- [ ] Add swipe gestures for step navigation
- [ ] Improve calendar touch interaction
- [ ] Test on iOS Safari and Android Chrome

---

## Priority 8: Accessibility

### Tasks
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Add focus indicators
- [ ] Ensure color contrast meets WCAG AA

---

## Future Enhancements

### Phase 2
- [ ] Multi-language support (i18n)
- [ ] Waitlist for sold-out slots
- [ ] Group booking with multiple activities
- [ ] Promo code / discount support
- [ ] Gift card redemption

### Phase 3
- [ ] Calendar sync (Google, iCal)
- [ ] SMS reminders
- [ ] Customer portal for managing bookings
- [ ] Recurring bookings
- [ ] Membership / subscription bookings

### Phase 4
- [ ] AI-powered booking assistant
- [ ] Dynamic pricing based on demand
- [ ] A/B testing for widget variants
- [ ] Advanced analytics with cohort analysis
- [ ] White-label solution

---

## Technical Debt

- [ ] Add unit tests for embed-pro hooks
- [ ] Add E2E tests for booking flow
- [ ] Optimize bundle size (lazy load widgets)
- [ ] Add error boundary for widget crashes
- [ ] Improve TypeScript strictness
- [ ] Add Storybook for widget components

---

## Documentation Needed

- [ ] API documentation for edge functions
- [ ] Widget integration guide for developers
- [ ] Admin user guide
- [ ] Troubleshooting guide
- [ ] Video tutorials

---

## How to Use This File

1. Pick tasks from Priority 1 first
2. Mark tasks as `[x]` when completed
3. Move completed sections to "Completed" at top
4. Add new tasks as they arise
5. Update "Last Updated" date after changes
