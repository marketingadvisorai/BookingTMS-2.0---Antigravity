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

### Stripe Checkout Integration (Priority 1 - DONE)
- [x] Created `checkoutPro.service.ts` for checkout session creation
- [x] Connected `BookingWidgetPro` to checkout service
- [x] Pass booking data (activity, date, time, party size, customer info)
- [x] Handle Stripe redirect to checkout URL
- [x] Loading state during checkout creation
- [x] BookingSuccess page already exists for handling success redirect
- [x] Analytics tracking for booking started events

---

## Priority 2: Real Availability Check ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Query `activity_sessions` for actual available slots (`getAvailableSlots` method)
- [x] Check `capacity_remaining` vs `partySize` for each session
- [x] Update `WidgetTimeSlots` to show real availability with fallback
- [x] Add `checkSessionAvailability` method for pre-booking validation
- [x] Low availability badges ("X left" when <= 3 spots)
- [x] Cross-browser safe date formatting
- [x] Modular service architecture (availability.service.ts, widgetData.normalizer.ts)

### Completed Files
- `src/modules/embed-pro/services/availability.service.ts` - Standalone availability service
- `src/modules/embed-pro/services/widgetData.normalizer.ts` - Data transformation
- `src/modules/embed-pro/services/embedProData.service.ts` - Refactored to orchestrator
- `src/modules/embed-pro/widget-components/WidgetTimeSlots.tsx` - Real availability with fallback

---

## Priority 3: Booking Confirmation Flow ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Create booking record in database after payment (via verify-checkout-session)
- [x] Booking verification service for post-checkout validation
- [x] Show booking confirmation with enhanced details (animations, copy-to-clipboard)
- [x] Generate booking reference number (BK-XXXXXX-XXXX format)
- [x] Pre-checkout availability validation in useBookingFlow
- [x] Cross-browser safe date/time formatting
- [ ] Send confirmation email via Resend (future enhancement)

### Completed Files
- `src/modules/embed-pro/services/bookingVerification.service.ts` - Verify checkout sessions
- `src/modules/embed-pro/widget-components/WidgetSuccess.tsx` - Enhanced confirmation UI
- `src/modules/embed-pro/hooks/useBookingFlow.ts` - Added validateAvailability()

---

## Priority 4: Widget Analytics ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Track widget views (increment `view_count`)
- [x] Track booking conversions (increment `booking_count`)
- [x] Add analytics dashboard with charts
- [x] Track step drop-off rates (funnel analysis)
- [x] Add date range filtering (7d, 30d, 90d, all)

### Completed Files
- `src/modules/embed-pro/components/AnalyticsDashboard.tsx` - Full analytics dashboard
- `src/modules/embed-pro/services/analytics.service.ts` - Enhanced with funnel analysis

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
