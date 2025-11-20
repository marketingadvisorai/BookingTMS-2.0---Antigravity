# Booking TMS MVP Launch Roadmap
**Version:** 1.0  
**Date:** November 18, 2025 07:40 UTC+06  
**Focus:** Escape Room Booking Engine MVP

---

## 📋 EXECUTIVE SUMMARY

### Current State Analysis
- **Project:** Booking TMS Beta v0.1.9
- **Stack:** React + Vite + TypeScript + Supabase + Stripe
- **Architecture:** Multi-tenant SaaS for escape room booking management
- **Build Status:** ✅ Clean (warnings only, non-blocking)
- **Primary Gap:** Booking engine needs simplification and focus for escape room use case

### MVP Goal
Create a **fully functional, production-ready booking engine** specifically optimized for escape room businesses to:
1. Accept online bookings for escape room games/experiences
2. Process payments via Stripe
3. Send confirmation emails with QR codes
4. Manage calendars and availability
5. Handle customer data securely

---

## 🎯 PRIORITY-ORIENTED TASK LIST

### 🔴 CRITICAL PRIORITY (Must Have for MVP - Week 1)

#### 1. **Fix Booking Engine Core Flow for Escape Rooms**
**Status:** Partially implemented, needs refinement  
**Effort:** 3-4 days  
**Dependencies:** None

**Current Issues:**
- Multiple booking widgets exist but lack clear escape room-specific UX
- Calendar availability logic is complex, needs simplification
- Payment flow has multiple paths, needs consolidation

**Tasks:**
1. **Simplify CalendarWidget for escape rooms**
   - Remove unnecessary complexity
   - Focus on: Date → Time Slot → Player Count → Payment
   - Ensure mobile responsiveness
   - File: `src/components/widgets/CalendarWidget.tsx`

2. **Consolidate booking creation logic**
   - Single source of truth for booking validation
   - Centralize in `src/core/domain/booking/Booking.entity.ts`
   - Remove duplicate validation logic from widgets

3. **Fix availability calculation**
   - Ensure time slots show correct capacity
   - Handle overlapping bookings properly
   - Implement buffer time between sessions
   - Files: 
     - `src/hooks/useBookings.ts`
     - `src/services/SupabaseBookingService.ts`

4. **Test end-to-end booking flow**
   - Customer selects game → date → time → pays → receives confirmation
   - Verify all edge cases (double booking, capacity, etc.)

**Success Criteria:**
- ✅ Customer can book escape room in <60 seconds
- ✅ No double bookings possible
- ✅ Availability updates in real-time
- ✅ Works perfectly on mobile

---

#### 2. **Payment Integration Stability**
**Status:** Implemented but needs hardening  
**Effort:** 2-3 days  
**Dependencies:** Task 1

**Current Issues:**
- Stripe integration exists but error handling needs improvement
- Payment confirmation flow unclear
- Webhook handling not production-ready

**Tasks:**
1. **Harden Stripe payment flow**
   - Add proper error handling and retry logic
   - Implement idempotency for payment requests
   - File: `src/lib/payments/checkoutService.ts`

2. **Fix payment confirmation**
   - Ensure booking is created only after payment success
   - Handle payment failures gracefully
   - Redirect user appropriately
   - Files:
     - `src/pages/BookingSuccess.tsx`
     - `src/pages/BookingCancelled.tsx`

3. **Implement Stripe webhooks (backend)**
   - Handle `payment_intent.succeeded`
   - Handle `payment_intent.payment_failed`
   - Update booking status automatically
   - File: `src/backend/api/routes/payments.routes.ts`

4. **Add payment receipt/invoice**
   - Generate PDF receipt
   - Email to customer
   - Store in Supabase Storage

**Success Criteria:**
- ✅ 100% payment success rate (no lost payments)
- ✅ Proper error messages for failed payments
- ✅ Webhooks handle all edge cases
- ✅ Customer receives payment confirmation

---

#### 3. **Email Confirmation with QR Code**
**Status:** Partially implemented  
**Effort:** 2 days  
**Dependencies:** Task 1, Task 2

**Current Issues:**
- Email service exists but templates need refinement
- QR code generation works but needs testing
- Email delivery reliability unknown

**Tasks:**
1. **Refine confirmation email template**
   - Clean, professional design
   - Include: booking details, QR code, venue info, cancellation policy
   - Mobile-friendly
   - File: `src/lib/email/templates/bookingConfirmationWithQR.ts`

2. **Test QR code generation**
   - Ensure QR codes are scannable
   - Include booking ID + confirmation code
   - Test on multiple devices
   - File: Uses `qrcode` library

3. **Implement email delivery monitoring**
   - Log all email attempts
   - Handle bounces/failures
   - Retry logic for failed sends
   - File: `src/lib/email/emailService.ts`

4. **Add reminder emails**
   - 24h before booking
   - Include QR code + directions
   - Optional: SMS reminder

**Success Criteria:**
- ✅ 100% email delivery rate
- ✅ QR codes scannable on all devices
- ✅ Emails look professional and clear
- ✅ Reminder system works automatically

---

#### 4. **Customer-Facing Booking Widget (Embeddable)**
**Status:** Exists but needs productionization  
**Effort:** 2-3 days  
**Dependencies:** Task 1

**Current Issues:**
- Widget embedding works but lacks documentation
- CSS conflicts possible with parent sites
- Performance not optimized

**Tasks:**
1. **Create production-ready embed code**
   - Generate iframe embed code
   - Or: JavaScript widget loader
   - Include CSS isolation (Shadow DOM or scoped styles)
   - File: `src/pages/Embed.tsx`

2. **Optimize widget performance**
   - Lazy load non-critical components
   - Minimize bundle size
   - Test on slow connections
   - Use code splitting

3. **Create embedding documentation**
   - Step-by-step guide for venue owners
   - Example code snippets
   - Troubleshooting section
   - File: New file `docs/WIDGET_EMBEDDING_GUIDE.md`

4. **Test widget on multiple websites**
   - WordPress
   - Wix
   - Squarespace
   - Custom HTML sites

**Success Criteria:**
- ✅ Widget works on all major platforms
- ✅ No CSS conflicts
- ✅ Loads in <2 seconds
- ✅ Clear documentation available

---

### 🟠 HIGH PRIORITY (Should Have for MVP - Week 2)

#### 5. **Admin Dashboard for Escape Room Owners**
**Status:** Partially complete  
**Effort:** 3-4 days  
**Dependencies:** Tasks 1-4

**Current Issues:**
- Dashboard shows too much data, overwhelming
- Escape room-specific metrics missing
- Mobile UX poor

**Tasks:**
1. **Simplify dashboard for escape rooms**
   - Show: Today's bookings, Revenue, Occupancy rate
   - Add: Quick actions (manual booking, view calendar, check-in)
   - Remove: Unnecessary complexity
   - File: `src/pages/Dashboard.tsx`

2. **Improve bookings management**
   - Better filtering (by date, game, status)
   - Bulk actions (cancel, confirm multiple)
   - Export to CSV/Excel
   - File: `src/pages/Bookings.tsx`

3. **Add check-in functionality**
   - Scan QR code to check-in customer
   - Mark as "In Progress" → "Completed"
   - Track no-shows
   - New file: `src/pages/CheckIn.tsx`

4. **Mobile-optimize admin views**
   - Ensure usable on tablets/phones
   - Staff can check-in customers on mobile

**Success Criteria:**
- ✅ Venue staff can manage bookings in <30 seconds
- ✅ Dashboard shows actionable insights
- ✅ Works perfectly on mobile
- ✅ QR code check-in functional

---

#### 6. **Game/Experience Management**
**Status:** Implemented but needs UX improvement  
**Effort:** 2 days  
**Dependencies:** None

**Current Issues:**
- Game setup wizard too complex
- Pricing/scheduling unclear
- Image upload needs improvement

**Tasks:**
1. **Simplify game creation flow**
   - Wizard: Basic Info → Pricing → Availability → Preview
   - Clear field labels and help text
   - File: `src/components/games/AddGameWizard.tsx`

2. **Improve game listing**
   - Card layout with images
   - Quick edit/disable toggle
   - Drag-and-drop reordering
   - File: `src/pages/Games.tsx`

3. **Add game templates**
   - Pre-filled examples for common escape room types
   - "Beginner", "Advanced", "Horror", etc.
   - Speeds up onboarding

4. **Fix image upload**
   - Compress images automatically
   - Show preview before upload
   - Support drag-and-drop

**Success Criteria:**
- ✅ New game created in <3 minutes
- ✅ Images upload reliably
- ✅ Games display beautifully
- ✅ Templates speed up onboarding

---

#### 7. **Customer Management**
**Status:** Basic implementation exists  
**Effort:** 2 days  
**Dependencies:** Task 1

**Current Issues:**
- Customer list basic, lacks search/filter
- Customer profiles minimal
- No customer communication tools

**Tasks:**
1. **Improve customer list**
   - Search by name, email, phone
   - Filter by: First-time, Returning, VIP
   - Sort by: Last visit, Total spent
   - File: `src/pages/Customers.tsx`

2. **Enhance customer profiles**
   - Show: Booking history, Total spent, Last visit
   - Add: Notes, Tags, VIP status
   - Track: Marketing preferences
   - File: `src/components/customers/CustomerDetailDialog.tsx`

3. **Add customer communication**
   - Send email to customer directly
   - Send promotional offers
   - Birthday/anniversary emails
   - Integration with email service

4. **GDPR compliance**
   - Export customer data
   - Delete customer data
   - Privacy policy acceptance

**Success Criteria:**
- ✅ Quick customer lookup (<5 seconds)
- ✅ Customer profiles useful
- ✅ Communication tools work
- ✅ GDPR compliant

---

#### 8. **Reporting & Analytics**
**Status:** Basic reports exist  
**Effort:** 2-3 days  
**Dependencies:** Tasks 1-6

**Current Issues:**
- Reports show data but lack insights
- No escape room-specific metrics
- Export functionality missing

**Tasks:**
1. **Add escape room KPIs**
   - Occupancy rate (by game, by day)
   - Average booking value
   - Revenue per available time slot
   - Most popular games/times
   - File: `src/pages/Reports.tsx`

2. **Create visual reports**
   - Charts: Revenue over time, Bookings by game
   - Heatmap: Busiest days/times
   - Use Recharts library (already installed)

3. **Add export functionality**
   - Export reports to PDF/Excel
   - Schedule automated reports (email)
   - Date range selector

4. **Add forecasting**
   - Predict busy periods based on history
   - Capacity planning recommendations
   - Revenue projections

**Success Criteria:**
- ✅ Venue owners understand their business
- ✅ Reports actionable
- ✅ Export works reliably
- ✅ Mobile-friendly

---

### 🟡 MEDIUM PRIORITY (Nice to Have - Week 3)

#### 9. **Multi-Venue Support**
**Status:** Architecture supports it, UI needs work  
**Effort:** 2 days  
**Dependencies:** Tasks 1-8

**Tasks:**
1. Venue switcher in dashboard
2. Per-venue settings and branding
3. Consolidated multi-venue reports
4. Venue-level permissions

**Files:**
- `src/pages/Venues.tsx`
- `src/lib/auth/permissions.ts`

---

#### 10. **Promotional Tools**
**Status:** Basic promo code system exists  
**Effort:** 2 days  
**Dependencies:** Task 1, Task 2

**Tasks:**
1. Discount code management
2. Gift vouchers/certificates
3. Loyalty program (basic points system)
4. Referral system

**Files:**
- `src/pages/GiftVouchers.tsx`
- `src/pages/Marketing.tsx`

---

#### 11. **Staff Management**
**Status:** User management exists  
**Effort:** 1-2 days  
**Dependencies:** None

**Tasks:**
1. Role-based permissions (admin, manager, staff)
2. Staff scheduling
3. Activity logs
4. File: `src/pages/Staff.tsx`

---

#### 12. **Waiver Management**
**Status:** Basic implementation  
**Effort:** 1 day  
**Dependencies:** Task 1

**Tasks:**
1. Digital waiver signing during booking
2. Store signed waivers
3. Waiver templates
4. File: `src/pages/Waivers.tsx`

---

### 🟢 LOW PRIORITY (Post-MVP)

#### 13. **Advanced Features (Future)**
- AI-powered chatbot for bookings
- Social media integration
- Advanced marketing automation
- Mobile app (React Native)
- Multi-language support
- Advanced inventory management

---

## 🐛 CRITICAL BUGS TO FIX

### During Audit, Fix These Immediately:

1. **PaymentsSubscriptionsSection.tsx**
   - Issue: Likely TypeScript errors or incomplete implementation
   - Priority: HIGH
   - File: `src/components/systemadmin/PaymentsSubscriptionsSection.tsx`

2. **Booking Double-Booking Prevention**
   - Issue: Need to verify race condition handling
   - Priority: CRITICAL
   - Files: `src/services/SupabaseBookingService.ts`, Database RLS

3. **Stripe Webhook Verification**
   - Issue: Webhook signature verification must be correct
   - Priority: CRITICAL
   - File: `src/backend/api/routes/payments.routes.ts`

4. **Email Delivery Failures**
   - Issue: No retry logic for failed emails
   - Priority: HIGH
   - File: `src/lib/email/emailService.ts`

5. **Mobile Widget Responsiveness**
   - Issue: Calendar widget breaks on small screens
   - Priority: HIGH
   - File: `src/components/widgets/CalendarWidget.tsx`

---

## 🏗️ CODE ARCHITECTURE IMPROVEMENTS

### Current Architecture Assessment

**✅ Strengths:**
- Clean domain-driven design (`src/core/domain/`)
- Proper TypeScript typing
- Supabase integration well-structured
- Component modularity

**⚠️ Areas for Improvement:**

1. **Service Layer Duplication**
   - Issue: Multiple booking services exist
   - Files: 
     - `src/services/SupabaseBookingService.ts`
     - `src/backend/services/BookingService.ts`
     - `src/lib/bookings/bookingService.ts`
   - Fix: Consolidate into single source of truth
   - Priority: MEDIUM

2. **State Management**
   - Issue: Mix of React Context + local state
   - Recommendation: Consider Zustand or Jotai for complex state
   - Priority: LOW (not blocking MVP)

3. **Error Handling**
   - Issue: Inconsistent error handling patterns
   - Fix: Create centralized error service
   - Priority: MEDIUM

4. **Testing Coverage**
   - Issue: No automated tests found
   - Fix: Add unit tests for critical paths (booking, payment)
   - Priority: HIGH (post-MVP Week 1)

5. **Code Splitting**
   - Issue: Large bundle size (4.07 MB)
   - Fix: Implement route-based code splitting
   - Priority: MEDIUM

6. **API Rate Limiting**
   - Issue: No rate limiting visible
   - Fix: Add rate limiting middleware
   - Priority: MEDIUM

---

## 📐 DATABASE ARCHITECTURE REVIEW

### Current Schema (from `src/types/supabase.ts`)

**✅ Well-Designed Tables:**
- `organizations` - Multi-tenant foundation
- `users` - Role-based access control
- `games` - Escape room experiences
- `customers` - Customer management
- `bookings` - Core booking entity

**Recommendations:**

1. **Add Missing Indexes**
   ```sql
   -- Performance optimization
   CREATE INDEX idx_bookings_org_date ON bookings(organization_id, booking_date);
   CREATE INDEX idx_bookings_status ON bookings(status) WHERE status != 'cancelled';
   CREATE INDEX idx_games_org_active ON games(organization_id, is_active);
   ```

2. **Add Row Level Security (RLS) Policies**
   - Ensure org data isolation
   - Prevent unauthorized access
   - Priority: CRITICAL

3. **Add Audit Tables**
   ```sql
   -- Track all booking changes
   CREATE TABLE booking_audit (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     booking_id UUID REFERENCES bookings(id),
     action TEXT NOT NULL,
     changed_by UUID REFERENCES users(id),
     old_data JSONB,
     new_data JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Add Subscription Plans Table** (for your subscription feature)
   ```sql
   CREATE TABLE subscription_plans (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     code TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     price_monthly DECIMAL(10,2),
     price_yearly DECIMAL(10,2),
     features JSONB,
     is_active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE TABLE organization_subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     organization_id UUID REFERENCES organizations(id),
     plan_id UUID REFERENCES subscription_plans(id),
     status TEXT NOT NULL,
     current_period_start TIMESTAMP,
     current_period_end TIMESTAMP,
     stripe_subscription_id TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

---

## 🎨 UX/UI IMPROVEMENTS

### Escape Room-Specific UX Enhancements

1. **Booking Widget**
   - Add game preview images
   - Show difficulty badges
   - Display "% booked" indicator for urgency
   - Add "Group size" selector with visual icons

2. **Confirmation Screen**
   - Show countdown to booking time
   - Add directions/parking info
   - Include "What to bring" checklist
   - Social share buttons

3. **Mobile Experience**
   - Bottom sheet for booking details
   - Swipe gestures for calendar navigation
   - Large touch targets (minimum 44px)
   - Simplified navigation

4. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

---

## 📦 DEPLOYMENT & DEVOPS

### Current Deployment Status
- **Frontend:** Render.com (booking-tms-beta-0.1.9 branch)
- **Backend:** Render.com (backend-render-deploy branch) - NEEDS FIX
- **Database:** Supabase
- **Storage:** Supabase Storage

### Recommendations:

1. **Fix Backend Deployment**
   - Issue: `rootDir` set to `src/backend` incorrectly
   - Fix: Change to root `/` in Render settings
   - Priority: CRITICAL

2. **Set Up CI/CD**
   - Automated tests on PR
   - Automated deployment on merge to main
   - Use GitHub Actions

3. **Environment Management**
   - Staging environment for testing
   - Production environment
   - Proper secrets management

4. **Monitoring & Logging**
   - Add Sentry for error tracking
   - Add logging service (LogRocket, Datadog)
   - Set up uptime monitoring

5. **Backup Strategy**
   - Daily database backups
   - Store in separate location
   - Test restore procedure

---

## 📚 DOCUMENTATION NEEDED

### For AI Coding Agents (You, Sonnet, ChatGPT)

1. **BOOKING_ENGINE_GUIDE.md**
   - Complete booking flow diagram
   - State machine for booking states
   - API endpoint documentation
   - Error codes reference

2. **DATABASE_SCHEMA.md**
   - ERD diagram
   - Table relationships
   - Index strategy
   - RLS policies

3. **STRIPE_INTEGRATION_GUIDE.md** ✅ EXISTS
   - Already have good docs
   - Update with webhook details

4. **WIDGET_EMBEDDING_GUIDE.md**
   - Embedding instructions
   - Configuration options
   - Styling customization
   - Troubleshooting

5. **API_REFERENCE.md**
   - All backend API endpoints
   - Request/response examples
   - Authentication
   - Rate limits

6. **TESTING_GUIDE.md**
   - How to run tests
   - Test coverage requirements
   - E2E test scenarios

---

## 🧪 TESTING STRATEGY

### Critical Test Scenarios

1. **Booking Flow End-to-End**
   - Happy path: Select game → book → pay → confirm
   - Edge cases: Double booking, capacity full, payment failure
   - Tools: Playwright or Cypress

2. **Payment Integration**
   - Successful payment
   - Failed payment
   - Webhook handling
   - Refund processing

3. **Email Delivery**
   - Confirmation email sent
   - QR code generated correctly
   - Email templates render properly

4. **Mobile Responsiveness**
   - Test on: iPhone, Android, iPad
   - Different screen sizes
   - Touch interactions

5. **Performance**
   - Page load times <3s
   - Widget load <2s
   - API response times <500ms

---

## 📊 SUCCESS METRICS FOR MVP

### Launch Criteria (Must Pass Before MVP Launch)

| Metric | Target | Status |
|--------|--------|--------|
| Booking completion rate | >85% | ⏳ Pending |
| Payment success rate | 100% | ⏳ Pending |
| Email delivery rate | 100% | ⏳ Pending |
| Mobile usability score | >90/100 | ⏳ Pending |
| Page load time | <3s | ⏳ Pending |
| Widget embed success rate | 100% | ⏳ Pending |
| Zero critical bugs | 0 | ⏳ Pending |
| Security audit passed | ✅ | ⏳ Pending |

### Post-Launch Metrics (Monitor Weekly)

- New bookings per week
- Revenue per booking
- Customer retention rate
- Average booking value
- Most popular games/times
- Cancellation rate
- Customer support tickets

---

## 🚀 IMPLEMENTATION TIMELINE

### Week 1: Core Booking Engine (Nov 18-24, 2025)
- Day 1-2: Fix booking flow (Task 1)
- Day 3-4: Payment stability (Task 2)
- Day 5: Email confirmations (Task 3)
- Day 6-7: Embeddable widget (Task 4)

### Week 2: Admin & Management (Nov 25-Dec 1, 2025)
- Day 1-2: Admin dashboard (Task 5)
- Day 3: Game management (Task 6)
- Day 4: Customer management (Task 7)
- Day 5-7: Reporting & analytics (Task 8)

### Week 3: Polish & Launch Prep (Dec 2-8, 2025)
- Day 1: Multi-venue (Task 9)
- Day 2: Promo tools (Task 10)
- Day 3: Staff management (Task 11)
- Day 4: Waivers (Task 12)
- Day 5-7: Testing, bug fixes, documentation

### Launch: December 9, 2025

---

## 🎯 IMMEDIATE NEXT STEPS (Right Now)

1. **Create Branch:** `feature/mvp-booking-engine-refactor`
2. **Start with Task 1:** Simplify CalendarWidget for escape rooms
3. **Fix Critical Bug:** PaymentsSubscriptionsSection.tsx
4. **Review & Update:** This roadmap based on findings
5. **Daily Standup:** Update progress daily

---

## 📝 NOTES FOR AI CODING AGENTS

### When Working on This Codebase:

1. **Always Read First**
   - Read related files before editing
   - Check types in `src/types/supabase.ts` and `src/core/domain/`
   - Review existing services before creating new ones

2. **Follow Existing Patterns**
   - Use existing hooks (`use*`) for data fetching
   - Follow domain-driven design in `src/core/domain/`
   - Match TypeScript strictness

3. **Test Your Changes**
   - Run `npm run build` before committing
   - Test manually in browser
   - Check mobile responsiveness

4. **Document as You Go**
   - Add JSDoc comments to functions
   - Update this roadmap when tasks complete
   - Create new docs as needed

5. **Security First**
   - Never expose API keys
   - Always validate user input
   - Use RLS policies in Supabase
   - Sanitize data before display

6. **Escape Room Focus**
   - Think about the venue owner's workflow
   - Optimize for speed of booking
   - Mobile-first for customers
   - Desktop-optimized for admin

---

## ✅ COMPLETION CHECKLIST

### Before Marking MVP "Done":

- [ ] All Critical Priority tasks (1-4) completed
- [ ] All High Priority tasks (5-8) completed
- [ ] All critical bugs fixed
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Testing completed
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Monitoring set up
- [ ] Support process defined
- [ ] Marketing materials ready

---

**This roadmap is a living document. Update it as work progresses and new insights emerge.**

**Last Updated:** 2025-11-18 07:40 UTC+06  
**Next Review:** 2025-11-19 (Daily)
