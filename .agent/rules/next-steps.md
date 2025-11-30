# BookingTMS 2.0 - Next Steps & Task List

> Last Updated: 2025-11-30 12:20 UTC+6
> Version: v0.1.68-multi-tenant-onboarding-2025-11-30

---

## MarketingPro Integration ✅ COMPLETED (Nov 30, 2025)

### Promo Code & Gift Card Complete Flow
| Task | Status |
|------|--------|
| Promo code UI in booking widget | ✅ Complete |
| Gift card UI in booking widget | ✅ Complete |
| Backend validation for promo codes | ✅ Complete |
| Backend validation for gift cards | ✅ Complete |
| Stripe webhook promo usage increment | ✅ Complete |
| Stripe webhook gift card deduction | ✅ Complete |
| Gift card redemption email notification | ✅ Complete |
| Email campaigns with promo codes | ✅ Complete |
| Campaign promo code tracking | ✅ Complete |

### Database Migrations Applied
- `add_promo_giftcard_rpc_functions` - RPC functions for atomic operations
- `add_promo_code_to_email_campaigns` - Link campaigns to promo codes

### New RPC Functions
- `increment_promo_usage(p_promo_code, p_organization_id)` - Atomically increment usage
- `decrement_gift_card_balance(p_gift_card_id, p_amount, p_booking_id)` - Atomic deduction with transaction

### Services Created
- `emailCampaignPromo.service.ts` - Send promo codes via email campaigns
- `giftCardNotifications.service.ts` - Gift card email notifications

### Google My Business Reviews → v2.0
**Decision**: Deferred to v2.0 due to complexity
- Requires OAuth 2.0 flow setup
- Google Cloud Console configuration needed
- API quota management required
- AI response generation complexity
- **Architecture Doc**: `/docs/GOOGLE_MY_BUSINESS_REVIEWS_ARCHITECTURE.md`

---

## Multi-Tenant Architecture ✅ COMPLETED (Nov 30, 2025)

### Tasks
- [x] Enable RLS on all core tables (organizations, venues, activities, bookings, customers, embed_configs, users)
- [x] Enable RLS on organization_members table
- [x] Create multi-tenant architecture documentation with ERD (`/docs/MULTI_TENANT_ARCHITECTURE.md`)
- [x] Add password reset functionality for org admins (Organizations page dropdown menu)
- [x] Create role-based redirect utility (`/src/lib/auth/redirectUtils.ts`)
- [x] Update Sidebar to hide system-level menu items for org-admin/beta-owner roles
- [x] Support real Supabase auth in BetaLogin page (email + password)
- [x] Add password visibility toggle to all login pages
- [x] Create ForgotPassword and ResetPassword pages

### Files Created/Modified
- `docs/MULTI_TENANT_ARCHITECTURE.md` - Complete architecture with ERD
- `docs/ORG_ADMIN_SETUP_GUIDE.md` - Setup and testing guide
- `src/lib/auth/redirectUtils.ts` - Role-based redirect utility
- `src/services/password.service.ts` - Password reset service
- `src/pages/ForgotPassword.tsx` - Self-service password reset request
- `src/pages/ResetPassword.tsx` - Set new password page
- `src/components/admin/UserPasswordResetModal.tsx` - Admin password reset modal
- `src/pages/Organizations.tsx` - Added Reset Password option
- `src/components/layout/Sidebar.tsx` - Role-based menu filtering

### Org Admin Portal Menu Items
| Visible | Hidden |
|---------|--------|
| Dashboard | System Admin |
| Bookings | Organizations |
| Activities | Backend Dashboard |
| Venues | Inbox |
| Booking Widgets | Campaigns |
| Embed Pro | Marketing |
| Customers | AI Agents |
| Reports | Staff |
| Waivers | Media |
| Settings | Account Settings |
| Payments | |

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

## Real Booking Implementation (v0.1.53+)

> **Goal**: Enable production-ready booking flow with real payments, customers, and confirmations.
> **Architecture Doc**: `/docs/REAL_ORDER_CUSTOMER_ARCHITECTURE.md`
> **Supabase Project**: `qftjyjpitnoapqxlrvfs` (Embed PRO | Booking TMS Beta V 0.17)

### Phase 1: Critical (Must-Have for Real Bookings)

| Status | Task | Priority | Effort |
|--------|------|----------|--------|
| [x] | **1.1 Fix Customers Page** - Remove dead mock data, verify real DB integration ✅ | 🔴 High | Done |
| [x] | **1.2 Verify Stripe Webhook** - Enhanced & deployed with checkout.session handler ✅ | 🔴 High | Done |
| [x] | **1.3 Fix Customer Portal** - Fixed DB field mismatch, added test customer ✅ | 🔴 High | Done |
| [x] | **1.4 Email Confirmation** - Integrated Resend via stripe-webhook ✅ | 🔴 High | Done |
| [x] | **1.5 Enable RLS Policies** - Secure all core tables with RLS ✅ | 🔴 High | Done |
| [x] | **1.6 Test E2E Booking Flow** - Widget → Checkout → Payment → Confirmation ✅ | 🔴 High | Done |

#### Task 1.1: Fix Customers Page ✅ COMPLETED (Nov 29, 2025)
- **Finding**: Page already used `useCustomers()` hook - mockCustomers was dead code
- **Actions Taken**:
  - Removed 107 lines of unused mock data
  - Added helpful empty state with CTA when no customers exist
  - Added documentation comment to component
- **Files Modified**: `src/pages/Customers.tsx`

#### Task 1.2: Verify Stripe Webhook ✅ COMPLETED (Nov 29, 2025)
- **Edge Function**: `stripe-webhook` (deployed to Supabase)
- **Webhook URL**: `https://qftjyjpitnoapqxlrvfs.supabase.co/functions/v1/stripe-webhook`
- **Events handled**:
  - `checkout.session.completed` (primary - widget bookings)
  - `payment_intent.succeeded` (direct payments)
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
- **⚠️ ACTION REQUIRED**: Register webhook in Stripe Dashboard
  1. Go to Stripe Dashboard → Developers → Webhooks
  2. Click "Add endpoint"
  3. Enter webhook URL above
  4. Select events listed above
  5. Copy webhook signing secret to Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`
- **Code Updates**:
  - Added `handleCheckoutCompleted()` for Stripe Checkout flow
  - Creates customer record if not exists
  - Creates booking with proper metadata from session

#### Task 1.3: Fix Customer Portal ✅ COMPLETED (Nov 29, 2025)
- **Problem 1**: Customer Portal showed "venue not found" - routing issue
- **Root Cause 1**: `/my-bookings` was caught by `/:slug` route in router.tsx
- **Fix 1**: Added explicit routes for `/my-bookings`, `/customer-portal`, `/beta-login`, `/org-login` before `/:slug` catch-all
- **Problem 2**: Database field mismatch
- **Root Cause 2**: Service used `booking_reference` but database has `booking_number`
- **Actions Taken**:
  - Fixed `router.tsx` - added public routes before `/:slug` catch-all
  - Fixed `customerBooking.service.ts` - changed `booking_reference` to `booking_number`
  - Fixed `customerAuth.service.ts` - lookup by `booking_number` with `confirmation_code` fallback
  - Added `players` field support for legacy bookings
  - Created test customer: `test@bookingtms.com`
  - Created test booking: `BK-TEST-c352` for Dec 6, 2025
- **Architecture Doc**: `/docs/CUSTOMER_PORTAL_ARCHITECTURE.md`
- **Test URL**: `http://localhost:5173/my-bookings`

#### Task 1.6: E2E Booking Flow ✅ COMPLETED (Nov 30, 2025)
- **Test Guide**: `/E2E_BOOKING_TEST_GUIDE.md`
- **Test Widget URL**: `http://localhost:3001/embed-pro?key=emb_57fdcedc75b56c818aba35ed`
- **Test Activity**: "R+ STRIPE" - $30.00
- **Flow Verified**:
  1. Widget loads with activity header ✓
  2. Calendar displays with available dates ✓
  3. Time slots appear for Dec 1, 2025 (10:00-20:00) ✓
  4. Party size selection works ✓
  5. Checkout form collects customer info ✓
  6. Stripe Checkout session created ✓
  7. Webhook handles `checkout.session.completed` ✓
  8. Booking record created in database ✓
  9. Confirmation email sent via Resend ✓
- **Test Cards**: `4242 4242 4242 4242` (success), `4000 0000 0000 0002` (decline)

#### Task 1.4: Email Confirmation ✅ COMPLETED (Nov 29, 2025)
- **Service**: Resend via `send-email` Edge Function
- **Trigger**: `stripe-webhook` → `handleCheckoutCompleted()` → `sendBookingConfirmationEmail()`
- **Email Template**: Professional HTML with booking details, venue info, arrival reminder
- **Features**:
  - Activity name and details fetched from database
  - Venue address and location
  - Formatted date/time
  - Party size and total paid
  - Arrival reminder (10-15 min early)
- **Files Modified**: `supabase/functions/stripe-webhook/index.ts`

#### Task 1.5: RLS Policies ✅ COMPLETED (Nov 29, 2025)
- **Tables with RLS enabled**: `bookings`, `customers`, `activities`, `venues`, `activity_sessions`, `organizations`, `embed_configs`
- **Policies Applied**:
  - Authenticated users: Full access (application-level org filtering)
  - Anonymous users: Read access for widgets and customer portal
  - Service role: Full bypass (for webhooks and edge functions)
- **Migration**: `20251129_enable_rls_core_tables.sql`
- **Verification**: All 7 tables confirmed with `rowsecurity = true`

### Phase 2: Important (Better UX/Operations) ✅ COMPLETED (Nov 30, 2025)

| Status | Task | Priority | Effort |
|--------|------|----------|--------|
| [x] | **2.1 QR Ticket System** - QR code generation, scanning, check-in ✅ v0.1.62 | 🔴 High | 4 hrs |
| [x] | **2.2 Admin Notification** - Email/Slack alert on new booking ✅ v0.1.63 | 🟡 Medium | 1-2 hrs |
| [x] | **2.3 Booking Receipt PDF** - Generate downloadable receipt ✅ v0.1.63 | 🟡 Medium | 2-3 hrs |
| [x] | **2.4 Capacity Management** - Block/unblock sessions from admin ✅ v0.1.63 | 🟡 Medium | 2-3 hrs |
| [x] | **2.5 Refund Processing** - Connect `create-refund` edge function ✅ v0.1.61 | 🟡 Medium | 2 hrs |
| [x] | **2.6 Customer Dedup** - Handle duplicate customer records ✅ v0.1.63 | 🟡 Medium | 2 hrs |

#### Task 2.2: Admin Notification ✅ COMPLETED (Nov 30, 2025)
- **Feature**: `/src/features/admin-notifications/`
- **Types**: AdminNotificationConfig, BookingNotificationData, AdminNotificationPayload
- **Service**: adminNotificationService - sends email/Slack alerts to org admins
- **Integration**: stripe-webhook sends notification after booking creation
- **Email Template**: Professional HTML with booking details
- **Slack Support**: Webhook-based notifications with block kit format

#### Task 2.3: Booking Receipt PDF ✅ COMPLETED (Nov 30, 2025)
- **Feature**: `/src/features/booking-receipt/`
- **Types**: ReceiptData, ReceiptConfig
- **Service**: receiptGeneratorService - generates HTML receipts
- **Hook**: useBookingReceipt - download/view receipts
- **Features**: Print-optimized, branded, status badges

#### Task 2.4: Capacity Management ✅ COMPLETED (Nov 30, 2025)
- **Feature**: `/src/features/capacity-management/`
- **Types**: BlockedSession, CapacityOverride, CapacityStats
- **Service**: capacityService - block/unblock sessions, capacity overrides
- **Hook**: useCapacityManagement - state management
- **Component**: BlockSessionModal - UI for blocking sessions
- **Migration**: `058_capacity_management_tables.sql`
- **Block Reasons**: maintenance, private_event, staff_unavailable, weather, holiday, other

#### Task 2.6: Customer Dedup ✅ COMPLETED (Nov 30, 2025)
- **Feature**: `/src/features/customer-dedup/`
- **Types**: DuplicateGroup, DuplicateCustomerMatch, MergeResult
- **Service**: customerDedupService - find/merge duplicates
- **Hook**: useCustomerDedup - scan and merge operations
- **Algorithm**: Match score based on email (100), phone (80), name (60)
- **Features**: Levenshtein distance for name similarity, booking migration

---

## Bug Fixes (Nov 30, 2025)

### Fix: Activities Not Showing Venue/Org Info ✅ COMPLETED
**Issue**: Activities created on venues weren't showing venue name and organization name on the Activities page.

**Root Cause**: `ActivityService.listActivities` only selected `*` from activities table without JOINing venues/organizations tables.

**Solution**:
1. Updated `ActivityService.listActivities` to include JOIN with `venues` and `organizations` tables
2. Added `venue_name` and `organization_name` fields to `Activity` return type
3. Updated `Game` interface in `/src/modules/inventory/types.ts` with optional venue/org name fields
4. Updated `GameCard.tsx` to display venue name with MapPin icon
5. Updated `Events.tsx` to map venue_name and organization_name to games

**Files Modified**:
- `src/modules/inventory/services/activity.service.ts` - Added JOINs
- `src/modules/inventory/types.ts` - Added venue_name, organization_name
- `src/modules/inventory/components/GameCard.tsx` - Added venue display
- `src/pages/Events.tsx` - Updated game mapping

### Fix: Embed Pro Not Showing Schedules for Venue Widgets ✅ COMPLETED
**Issue**: Venue widgets in Embed Pro weren't displaying schedules, time slots, or booking activities.

**Root Cause**: 
1. Schedule data stored in BOTH `schedule` JSONB column AND `settings.operatingDays` etc.
2. `widgetData.normalizer.extractSchedule()` only read from `settings`, ignoring `schedule` column
3. Queries didn't explicitly select the `schedule` column

**Solution**:
1. Updated `widgetData.normalizer.ts`:
   - Added `schedule` field to `RawActivity` interface
   - Modified `extractSchedule()` to read from BOTH `schedule` column AND `settings`
   - Priority: `schedule` column > `settings` > defaults
2. Updated `embedProData.service.ts`:
   - `getActivityWithVenue` - explicitly selects `schedule` column
   - `getVenueWithActivities` - explicitly selects `schedule` column for activities
   - `getMultipleActivities` - explicitly selects `schedule` column
   - Added debug logging for schedule presence
3. Updated `ActivityService.createActivity`:
   - Saves schedule to BOTH `schedule` column AND `settings` JSONB for backward compatibility

**Files Modified**:
- `src/modules/embed-pro/services/widgetData.normalizer.ts` - Dual-source schedule reading
- `src/modules/embed-pro/services/embedProData.service.ts` - Explicit schedule column selection
- `src/modules/inventory/services/activity.service.ts` - Dual-save for schedule data

### Fix: Admin Password Reset "User not allowed" Error ✅ ENHANCED (Nov 30, 2025)
**Issue**: Admin-initiated password resets showed "User not allowed" error.

**Root Cause**: 
- `supabase.auth.admin.*` methods require the **service role key**
- Client-side code only has the **anon key**
- The anon key cannot call admin auth APIs

**Solution - 3-Tier Email Delivery Strategy**:
| Strategy | Priority | Provider | When Used |
|----------|----------|----------|-----------|
| 1. Supabase SMTP | Primary | Supabase built-in | First attempt (most reliable) |
| 2. Resend API | Fallback | Resend | If Supabase SMTP fails and API key configured |
| 3. Direct Link | Last Resort | None | Returns link for admin to share manually |

**Email Delivery Flow**:
```
Send Reset Email clicked
        ↓
Try Supabase auth.resetPasswordForEmail()
        ↓ (if fails)
Generate link via auth.admin.generateLink()
        ↓
Try Resend API (if RESEND_API_KEY configured)
        ↓ (if fails or not configured)
Return reset link directly to admin
        ↓
Admin copies & shares link with user
```

**Implementation**:
1. **Edge Function** `supabase/functions/admin-password-reset/index.ts` (v2)
   - Uses service role key (secure server-side)
   - 3-tier email delivery strategy
   - Handles `send_reset` and `set_password` actions
   - Validates admin permissions before action
   - Logs all actions to `audit_logs` table
   
2. **Password Service** `src/services/password.service.ts`
   - Returns `method` and `resetLink` from API response
   - Supports fallback link display in UI

3. **Reset Modal** `src/components/admin/UserPasswordResetModal.tsx`
   - Shows fallback link with copy button when email fails
   - 24-hour expiry notice
   - Success state shows appropriate message

**Tenant Isolation**:
- Org admins only see data for their organization
- All hooks filter by `currentUser?.organizationId`
- System/Super admins can see all data (`fetchAll: true`)
- RLS policies enforce database-level isolation

**Files Modified/Created**:
- `supabase/functions/admin-password-reset/index.ts` (ENHANCED v2)
- `src/services/password.service.ts`
- `src/components/admin/UserPasswordResetModal.tsx`

**Edge Function Deployed**: v2.1.0 (Nov 30, 2025)

**Current Email Strategy (2025-11-30 12:20)**
- Primary: Supabase Auth `resetPasswordForEmail` (SMTP)
- Fallback: generate a password reset link and return it to the admin for manual sharing
- Resend API fallback is **temporarily disabled** due to deliverability issues.

**Optional Future Configuration** (when re-enabling Resend):
```bash
# Set Resend API key for branded email fallback
supabase secrets set RESEND_API_KEY=re_xxxx
```

### Phase 3: Nice-to-Have (Polish)

| Status | Task | Priority | Effort |
|--------|------|----------|--------|
| [ ] | **3.1 Booking Analytics** - Revenue, conversion rates dashboard | 🟢 Low | 3-4 hrs |
| [ ] | **3.2 SMS Confirmation** - Connect Twilio to existing SMS module | 🟢 Low | 2 hrs |
| [ ] | **3.3 Webhook Retry** - Handle failed webhook deliveries | 🟢 Low | 1 hr |
| [ ] | **3.4 Stripe Connect UX** - Better org onboarding flow | 🟢 Low | 3-4 hrs |

---

## Technical Debt

- [x] Add unit tests for embed-pro hooks ✅ v0.1.48
- [x] Add unit tests for services ✅ v0.1.50 (50 tests total)
- [x] Add E2E tests for booking flow ✅ v0.1.52
- [x] Optimize bundle size (lazy load widgets) ✅ v0.1.35
- [x] Add error boundary for widget crashes ✅ v0.1.35
- [x] Improve TypeScript strictness ✅ v0.1.50
- [x] Add Storybook for widget components ✅ v0.1.51

### Unit Testing Setup (v0.1.48 → v0.1.50)
- **Framework**: Vitest with React Testing Library
- **Config**: `vitest.config.ts` with jsdom environment
- **Scripts**: `npm run test`, `npm run test:run`, `npm run test:coverage`
- **Total Tests**: 50 passing
- **Hook Tests**:
  - `usePromoCode.test.ts` - 8 tests
  - `useGiftCard.test.ts` - 10 tests
- **Service Tests**:
  - `promo.service.test.ts` - 14 tests
  - `giftcard.service.test.ts` - 18 tests

### TypeScript Strictness (v0.1.50)
- **Enabled**: strictNullChecks, strictFunctionTypes, strictBindCallApply
- **Enabled**: noImplicitReturns, noFallthroughCasesInSwitch, noImplicitOverride
- **Enabled**: isolatedModules, forceConsistentCasingInFileNames
- **Kept off**: noImplicitAny (for legacy compatibility)

### Storybook Setup (v0.1.51)
- **Framework**: Storybook 10.1 with React Vite
- **Scripts**: `npm run storybook` (dev), `npm run build-storybook`
- **Config**: `.storybook/main.ts`, `.storybook/preview.ts`
- **Ready for**: Component documentation and visual testing

### E2E Testing Setup (v0.1.52)
- **Framework**: Playwright with Chromium
- **Scripts**: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:headed`
- **Config**: `playwright.config.ts` with auto dev server
- **Test Files**:
  - `e2e/app.spec.ts` - Application health, accessibility, SEO
  - `e2e/booking-widget.spec.ts` - Widget loading, navigation, responsive

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
