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

## Priority 5: Theme Customization ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Add theme selector in embed config (light/dark/auto)
- [x] Add custom color picker for primary color (9 presets + custom)
- [x] Add font family selector (5 options)
- [x] Add border radius options (6 levels)
- [x] Preview theme changes in real-time

### Completed Files
- `src/modules/embed-pro/components/CreateEmbedModal.tsx` - Added 4-step wizard with style step

---

## Priority 6: Embed Code Generator ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Generate iframe embed code with theme parameter
- [x] Generate JavaScript snippet embed code (HTML, React, Next.js)
- [x] Add copy-to-clipboard functionality with animation
- [x] Show installation instructions
- [x] Add WordPress shortcode + PHP guide

### Features
- 5 code formats: HTML, React, Next.js, WordPress, iFrame
- Theme and color included in generated code
- Animated copy button with success state
- Format-specific installation instructions

### Completed Files
- `src/modules/embed-pro/services/codeGenerator.service.ts` - Enhanced with theme/color
- `src/modules/embed-pro/components/EmbedCodeDisplay.tsx` - Full code display
- `src/modules/embed-pro/hooks/useCodeGenerator.ts` - Code generation hook

---

## Priority 7: Mobile Optimization ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Optimize touch targets (min 44px) - All interactive elements
- [x] Improve calendar touch interaction - active:scale-95, touch-manipulation
- [x] Responsive spacing - p-3 sm:p-4, text-[10px] sm:text-xs
- [x] Time slots grid - 2 columns on mobile, 3 on desktop
- [x] Counter buttons - 44px targets with visual feedback

### Mobile-Specific Enhancements
- `touch-manipulation` CSS for faster tap response
- `active:scale-95` for visual press feedback
- `overscroll-contain` to prevent scroll bleed
- Responsive font sizes and spacing
- 2-column time slots on mobile viewport

### Completed Files
- `src/modules/embed-pro/widget-components/WidgetCalendar.tsx`
- `src/modules/embed-pro/widget-components/WidgetTimeSlots.tsx`
- `src/modules/embed-pro/widget-components/WidgetPartySize.tsx`

---

## Priority 8: Responsive UI/UX Enhancement ✅ IN PROGRESS (Nov 27, 2025)

### Tasks
- [x] Desktop 2-panel layout with sticky booking summary sidebar
- [x] Tablet optimizations (md: breakpoints, 4-column time grid)
- [x] Focus ring indicators for keyboard navigation
- [ ] Enhanced micro-interactions and visual hierarchy
- [ ] Full ARIA labels and screen reader support

### Completed Files
- `src/modules/embed-pro/widget-components/WidgetBookingSummary.tsx` - NEW
- `src/modules/embed-pro/widgets/BookingWidgetPro.tsx` - 2-panel layout
- `src/modules/embed-pro/widget-components/WidgetCalendar.tsx` - Tablet optimized
- `src/modules/embed-pro/widget-components/WidgetTimeSlots.tsx` - 4-col tablet grid

---

## Priority 9: Accessibility

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
