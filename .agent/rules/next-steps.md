# BookingTMS 2.0 - Next Steps & Task List

> Last Updated: 2025-11-28
> Version: v0.1.49-documentation-complete

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

## Priority 8: Responsive UI/UX Enhancement ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Desktop 2-panel layout with sticky booking summary sidebar
- [x] Tablet optimizations (md: breakpoints, 4-column time grid)
- [x] Focus ring indicators for keyboard navigation
- [x] Enhanced micro-interactions and visual hierarchy
- [x] ARIA labels and form accessibility

### UI/UX Enhancements
- **Desktop**: Side-by-side 2-panel layout with sticky summary
- **Tablet**: 4-column time grid, larger spacing, 48px touch targets
- **Mobile**: Compact layout with 44px touch targets
- **Forms**: Group focus states, error indicators, security badge
- **Buttons**: hover:scale, active:scale, focus:ring
- **Inputs**: hover:border, focus:ring, aria-invalid states

### Completed Files
- `src/modules/embed-pro/widget-components/WidgetBookingSummary.tsx` - NEW
- `src/modules/embed-pro/widgets/BookingWidgetPro.tsx` - 2-panel layout
- `src/modules/embed-pro/widget-components/WidgetCalendar.tsx` - Tablet optimized
- `src/modules/embed-pro/widget-components/WidgetTimeSlots.tsx` - 4-col tablet grid
- `src/modules/embed-pro/widget-components/WidgetCheckout.tsx` - Enhanced form UX

---

## Priority 9: Accessibility ✅ COMPLETED (Nov 27, 2025)

### Tasks
- [x] Add ARIA labels to all interactive elements
- [x] Ensure keyboard navigation works (focus:ring, tabindex)
- [x] Screen reader support (aria-live, aria-atomic, sr-only)
- [x] Add focus indicators (focus:ring-2, focus:ring-offset-2)
- [x] Semantic HTML (role=grid, role=listbox, role=option, dl/dt/dd)

### ARIA Enhancements by Component
- **WidgetCalendar**: role=grid, aria-selected, aria-current=date, aria-live for month
- **WidgetTimeSlots**: role=listbox, role=option, aria-selected, aria-describedby
- **WidgetSuccess**: role=alert, aria-live=polite, dl/dt/dd for booking details
- **WidgetCheckout**: aria-label, aria-invalid, aria-describedby
- **WidgetPartySize**: aria-label on +/- buttons

### Completed Files
- `src/modules/embed-pro/widget-components/WidgetCalendar.tsx`
- `src/modules/embed-pro/widget-components/WidgetTimeSlots.tsx`
- `src/modules/embed-pro/widget-components/WidgetSuccess.tsx`
- `src/modules/embed-pro/widget-components/WidgetCheckout.tsx`

---

## Future Enhancements

### Phase 2 ✅ COMPLETE
- [x] Multi-language support (i18n) ✅ v0.1.38
- [x] Waitlist for sold-out slots ✅ v0.1.39
- [x] Group booking with multiple activities ✅ v0.1.41
- [x] Promo code / discount support ✅ v0.1.37
- [x] Gift card redemption ✅ v0.1.40

#### Group Booking System (v0.1.41)
- **Types**: GroupBooking, GroupBookingCart, GroupBookingCartItem
- **Service**: groupBookingService - cart management, validation
- **Hook**: useGroupBooking - reducer-based state management
- **Component**: WidgetGroupCart - cart UI with item management
- **Features**: Multi-activity cart, totals, promo/gift integration

#### Gift Card System (v0.1.40)
- **Types**: GiftCard, GiftCardStatus, RedeemGiftCardRequest/Response
- **Service**: giftCardService - redeem, check balance
- **Hook**: useGiftCard - state management
- **Component**: WidgetGiftCard - UI with balance display
- **Demo Cards**: GC-DEMO-1000 ($100), GC-DEMO-5000 ($50)

#### Waitlist System (v0.1.39)
- **Types**: WaitlistEntry, WaitlistStatus, JoinWaitlistRequest/Response
- **Service**: waitlistService - join, cancel, check availability
- **Component**: WidgetWaitlistModal - form + success state
- **Features**: Email notification, queue position, 24h expiry
- **Storage**: localStorage (demo) - ready for Supabase

#### Multi-Language Support (v0.1.38)
- **Languages**: English, Spanish, French (+ placeholder for 5 more)
- **Types**: SupportedLocale, WidgetTranslations, I18nContextValue
- **Provider**: I18nProvider with auto-detect browser locale
- **Hook**: useI18n() - t(), formatDate(), formatTime(), formatCurrency()
- **URL Param**: `?lang=en|es|fr` for locale override
- **Keys**: 150+ translation keys covering all widget sections

#### Promo Code System (v0.1.36-37)
- **Types**: PromoCode, PromoValidationResult, PromoCodeState
- **Service**: promoService - validation, discount calculation
- **Hook**: usePromoCode - state management
- **Component**: WidgetPromoCode - UI with expand/collapse
- **Demo Codes**: WELCOME10, SAVE20, FLAT25

### Phase 3
- [x] Calendar sync (Google, iCal) ✅ v0.1.42
- [x] SMS reminders ✅ v0.1.43
- [x] Customer portal for managing bookings ✅ v0.1.44
- [ ] Recurring bookings (deferred to v2.x)
- [ ] Membership / subscription bookings (deferred to v2.x)

#### Customer Portal System (v0.1.44)
- **Routes**: `/my-bookings`, `/customer-portal` (public, no admin auth)
- **Types**: CustomerProfile, CustomerBooking, BookingStatus, PaymentStatus
- **Services**: customerAuthService (lookup, session), customerBookingService (CRUD)
- **Hooks**: useCustomerAuth, useCustomerBookings
- **Components**: CustomerLookup, CustomerDashboard, BookingCard, BookingDetailsModal
- **Features**: Email/phone/booking-ref lookup, view/cancel/reschedule, 24h cancellation window
- **Session**: 2-hour localStorage sessions with auto-extend

#### SMS Reminder System (v0.1.43)
- **Types**: SMSReminder, SMSReminderType, SMSReminderSettings
- **Service**: smsReminderService - send, schedule, templates
- **Component**: WidgetSMSOptIn - checkbox with reminder options
- **Templates**: Confirmation, 24h, 1h, cancellation, reschedule
- **Ready for**: Twilio, Supabase Edge Function integration

#### Calendar Sync System (v0.1.42)
- **Types**: CalendarEvent, CalendarProvider, CalendarLinks
- **Service**: calendarSyncService - generate links, iCal files
- **Component**: WidgetAddToCalendar - dropdown with providers
- **Supported**: Google, Outlook, Yahoo, Apple, iCal download
- **Features**: iCal generation, reminders, timezone support

### Phase 4
- [x] AI-powered booking assistant ✅ v0.1.45
- [x] Gift Card & Promo Code Integration ✅ v0.1.46
- [ ] Dynamic pricing based on demand (deferred to v3)
- [ ] A/B testing for widget variants (deferred to v3)
- [ ] Advanced analytics with cohort analysis (deferred to v3)
- [ ] White-label solution (deferred to v3)

#### Gift Card & Promo Code Integration (v0.1.46)
- **Component**: WidgetDiscounts - Combined promo + gift card section
- **Integrated into**: BookingWidgetPro checkout step
- **Features**:
  - Subtotal calculation based on party size
  - Promo code validation with discount display
  - Gift card redemption with balance tracking
  - Total savings summary
  - Demo codes: WELCOME10, SAVE20, GC-DEMO-1000

#### AI Booking Assistant (v0.1.45)
- **Module**: `/src/modules/ai-assistant/`
- **Components**: BookingAssistant (chat UI), ChatMessage (message bubble)
- **Services**: intentDetectionService, responseGeneratorService
- **Hook**: useBookingAssistant - state management with reducer
- **Features**:
  - Natural language intent detection (12 intents)
  - Entity extraction (date, time, party size, email, phone, name)
  - Contextual response generation
  - Quick reply suggestions
  - Progress indicator with step tracking
  - Floating button or embedded mode
  - Customizable colors and bot name

---

## Technical Debt

- [x] Add unit tests for embed-pro hooks ✅ v0.1.48
- [ ] Add E2E tests for booking flow
- [x] Optimize bundle size (lazy load widgets) ✅ v0.1.35
- [x] Add error boundary for widget crashes ✅ v0.1.35
- [ ] Improve TypeScript strictness
- [ ] Add Storybook for widget components

### Unit Testing Setup (v0.1.48)
- **Framework**: Vitest with React Testing Library
- **Config**: `vitest.config.ts` with jsdom environment
- **Scripts**: `npm run test`, `npm run test:run`, `npm run test:coverage`
- **Tests Created**:
  - `usePromoCode.test.ts` - 8 tests (validation, apply, remove, error handling)
  - `useGiftCard.test.ts` - 10 tests (redemption, partial, error handling)

### Completed Technical Improvements (v0.1.35)
- **WidgetErrorBoundary** - Catches React errors, shows friendly UI, retry support
- **Lazy Loading** - React.lazy + Suspense for EmbedProContainer
- **PostMessage API** - Error reporting to parent window for embeds

---

## Documentation Needed

- [x] API documentation for edge functions ✅ v0.1.47
- [x] Widget integration guide for developers ✅ v0.1.47
- [x] Admin user guide ✅ v0.1.49
- [x] Troubleshooting guide ✅ v0.1.49
- [ ] Video tutorials (future)

### Completed Documentation (v0.1.47)
- **WIDGET_INTEGRATION_GUIDE.md** - Complete developer guide for embedding widgets
  - HTML, iframe, React, Vue, WordPress examples
  - Customization options (CSS variables, themes)
  - Events & callbacks (PostMessage API)
  - Troubleshooting common issues
- **API_REFERENCE.md** - Full API documentation
  - Checkout API (create session, verify)
  - Booking API (create, verify)
  - Widget Config API (activity, venue)
  - Stripe Integration (products, prices)
  - Error codes and rate limits
- **ADMIN_USER_GUIDE.md** - Complete admin documentation
  - Dashboard, activities, bookings management
  - Customer management, venues
  - Payment setup, widget configuration
  - Reports, user roles, keyboard shortcuts
- **TROUBLESHOOTING_GUIDE.md** - Issue resolution guide
  - Widget, payment, booking issues
  - Authentication, performance problems
  - Error codes and debug mode

---

## How to Use This File

1. Pick tasks from Priority 1 first
2. Mark tasks as `[x]` when completed
3. Move completed sections to "Completed" at top
4. Add new tasks as they arise
5. Update "Last Updated" date after changes
