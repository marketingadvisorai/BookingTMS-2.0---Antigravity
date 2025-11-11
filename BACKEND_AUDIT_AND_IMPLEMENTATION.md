# Backend Audit & Implementation Plan
## BookingTMS - Comprehensive Backend Review

**Date:** 2025-01-11  
**Status:** In Progress  
**Priority:** High

---

## Executive Summary

This document outlines the comprehensive backend audit findings and implementation plan for all pages in the BookingTMS application. The audit covers database structure, API functions, security, and feature completeness.

---

## 1. Current Backend Architecture

### Database Layer (Supabase)
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime subscriptions
- **Storage:** Supabase Storage (for media)

### Core Tables
✅ **Implemented:**
- `organizations` - Multi-tenant organization management
- `users` - User profiles and roles
- `games` - Escape room games/experiences
- `customers` - Customer database
- `bookings` - Booking records
- `payments` - Payment transactions
- `notifications` - In-app notifications
- `notification_settings` - User notification preferences
- `stripe_webhook_events` - Stripe webhook logging

❌ **Missing:**
- `venues` - Physical venue locations (partially implemented)
- `waivers` - Digital waiver management
- `widgets` - Booking widget configurations
- `campaigns` - Marketing campaign tracking
- `email_templates` - Email template management
- `sms_logs` - SMS communication logs
- `media_library` - Media asset management
- `staff_schedules` - Staff scheduling
- `gift_vouchers` - Gift voucher system
- `reports_cache` - Report caching for performance

---

## 2. Page-by-Page Backend Status

### ✅ Dashboard (`/pages/Dashboard.tsx`)
**Status:** Functional with Supabase integration

**Required Functions:**
- ✅ `get_dashboard_stats()` - Overall statistics
- ✅ `get_weekly_bookings_trend()` - 8-week trend data
- ✅ `get_upcoming_bookings(limit)` - Today's upcoming bookings
- ✅ `get_todays_bookings_by_hour()` - Hourly distribution
- ✅ `get_recent_booking_activity(limit)` - Recent activity feed

**Issues Found:**
- ⚠️ Real-time subscriptions working but could be optimized
- ⚠️ No error boundary for failed RPC calls
- ⚠️ Missing venue filtering in dashboard stats

**Recommendations:**
1. Add venue filter to dashboard
2. Implement error boundaries
3. Add caching layer for heavy queries
4. Add date range selector

---

### ⚠️ Bookings (`/pages/Bookings.tsx`)
**Status:** Partially functional - needs enhancement

**Required Functions:**
- ✅ `get_bookings_with_details()` - List all bookings with joins
- ✅ `create_booking()` - Create new booking
- ✅ `cancel_booking()` - Cancel with refund logic
- ✅ `get_available_slots()` - Check availability
- ❌ `update_booking_status()` - Batch status updates
- ❌ `send_booking_reminder()` - Automated reminders
- ❌ `export_bookings()` - Export to CSV/Excel
- ❌ `get_booking_analytics()` - Booking insights

**Issues Found:**
- ⚠️ No batch operations for status changes
- ⚠️ Missing automated email notifications
- ⚠️ No SMS notification integration
- ⚠️ Export functionality not implemented
- ⚠️ No booking conflict detection
- ⚠️ Missing deposit/partial payment handling

**Recommendations:**
1. Implement batch status update function
2. Add email/SMS notification triggers
3. Create export service
4. Add conflict detection algorithm
5. Implement partial payment tracking

---

### ❌ Games (`/pages/Games.tsx`)
**Status:** Basic CRUD only - needs full implementation

**Required Functions:**
- ✅ `get_games()` - List games
- ⚠️ `create_game()` - Create game (basic)
- ⚠️ `update_game()` - Update game (basic)
- ❌ `delete_game()` - Soft delete with validation
- ❌ `duplicate_game()` - Clone game configuration
- ❌ `get_game_analytics()` - Performance metrics
- ❌ `get_game_availability_calendar()` - Calendar view
- ❌ `update_game_settings()` - Advanced settings

**Issues Found:**
- ❌ No image upload handling
- ❌ No game-venue linking
- ❌ Missing availability rules engine
- ❌ No pricing tiers/dynamic pricing
- ❌ Missing game categories/tags
- ❌ No game templates

**Recommendations:**
1. Implement full CRUD with validation
2. Add Supabase Storage integration for images
3. Create game-venue many-to-many relationship
4. Build availability rules engine
5. Add dynamic pricing system
6. Implement game templates

---

### ❌ Venues (`/pages/Venues.tsx`)
**Status:** Critical - Incomplete implementation

**Required Functions:**
- ⚠️ `get_venues()` - List venues (basic)
- ❌ `create_venue()` - Create with embed key generation
- ❌ `update_venue()` - Update venue details
- ❌ `delete_venue()` - Soft delete
- ❌ `get_venue_analytics()` - Venue performance
- ❌ `get_venue_schedule()` - Operating hours
- ❌ `link_games_to_venue()` - Game assignments

**Issues Found:**
- ❌ Venues table schema incomplete
- ❌ No embed key generation
- ❌ Missing timezone handling
- ❌ No operating hours configuration
- ❌ Missing capacity management
- ❌ No venue-specific pricing

**Recommendations:**
1. Complete venues table schema
2. Implement embed key system
3. Add timezone support
4. Create operating hours manager
5. Build capacity tracking
6. Add venue-specific settings

---

### ⚠️ Customers (`/pages/Customers.tsx`)
**Status:** Basic functionality - needs enhancement

**Required Functions:**
- ✅ `get_customers()` - List customers
- ✅ `create_customer()` - Create customer
- ✅ `update_customer()` - Update details
- ❌ `get_customer_analytics()` - Customer insights
- ❌ `get_customer_segments()` - Segmentation
- ❌ `calculate_customer_ltv()` - Lifetime value
- ❌ `get_customer_booking_history()` - Full history
- ❌ `merge_customers()` - Duplicate handling

**Issues Found:**
- ⚠️ Segmentation logic incomplete
- ❌ No LTV calculation
- ❌ Missing RFM analysis
- ❌ No duplicate detection
- ❌ Missing customer notes/tags
- ❌ No customer communication history

**Recommendations:**
1. Implement advanced segmentation
2. Add LTV calculation
3. Build RFM analysis
4. Create duplicate detection
5. Add tagging system
6. Track communication history

---

### ❌ Staff (`/pages/Staff.tsx`)
**Status:** Critical - Needs full implementation

**Required Functions:**
- ⚠️ `get_staff()` - List staff (basic)
- ❌ `create_staff_member()` - Create with auth
- ❌ `update_staff_permissions()` - Role management
- ❌ `deactivate_staff()` - Soft delete
- ❌ `get_staff_schedule()` - Scheduling
- ❌ `log_staff_activity()` - Activity tracking
- ❌ `get_staff_performance()` - Performance metrics

**Issues Found:**
- ❌ No role-based permission system
- ❌ Missing staff scheduling
- ❌ No activity logging
- ❌ Missing performance tracking
- ❌ No staff-venue assignments
- ❌ Missing commission tracking

**Recommendations:**
1. Implement RBAC system
2. Create scheduling module
3. Add activity logging
4. Build performance dashboard
5. Add venue assignments
6. Implement commission system

---

### ❌ Marketing/Campaigns (`/pages/Marketing.tsx`, `/pages/Campaigns.tsx`)
**Status:** Critical - Not implemented

**Required Functions:**
- ❌ `create_campaign()` - Create marketing campaign
- ❌ `send_email_campaign()` - Email blast
- ❌ `send_sms_campaign()` - SMS blast
- ❌ `get_campaign_analytics()` - Campaign performance
- ❌ `create_email_template()` - Template management
- ❌ `get_audience_segments()` - Target audience
- ❌ `schedule_campaign()` - Campaign scheduling

**Issues Found:**
- ❌ No email service integration (SendGrid/Resend)
- ❌ No SMS service integration (Twilio)
- ❌ Missing campaign tracking
- ❌ No A/B testing
- ❌ Missing automation workflows
- ❌ No template editor

**Recommendations:**
1. Integrate SendGrid/Resend for email
2. Integrate Twilio for SMS
3. Build campaign tracking system
4. Implement A/B testing
5. Create automation workflows
6. Add drag-and-drop template editor

---

### ❌ AI Agents (`/pages/AIAgents.tsx`)
**Status:** Critical - Not implemented

**Required Functions:**
- ❌ `create_ai_agent()` - Create chatbot
- ❌ `train_ai_agent()` - Training data
- ❌ `get_ai_conversations()` - Chat history
- ❌ `get_ai_analytics()` - Performance metrics
- ❌ `update_ai_knowledge_base()` - Knowledge management

**Issues Found:**
- ❌ No AI service integration
- ❌ Missing conversation storage
- ❌ No training pipeline
- ❌ Missing analytics
- ❌ No knowledge base

**Recommendations:**
1. Integrate OpenAI/Anthropic API
2. Create conversation storage
3. Build training pipeline
4. Implement analytics
5. Add knowledge base management

---

### ❌ Waivers (`/pages/Waivers.tsx`)
**Status:** Critical - Not implemented

**Required Functions:**
- ❌ `create_waiver()` - Create waiver form
- ❌ `get_waiver_submissions()` - Submissions list
- ❌ `verify_waiver_signature()` - E-signature validation
- ❌ `export_waivers()` - Export for legal
- ❌ `link_waiver_to_booking()` - Booking integration

**Issues Found:**
- ❌ No waiver table
- ❌ Missing e-signature system
- ❌ No legal compliance tracking
- ❌ Missing PDF generation
- ❌ No QR code integration

**Recommendations:**
1. Create waivers table
2. Implement e-signature (DocuSign/HelloSign)
3. Add legal compliance tracking
4. Integrate PDF generation
5. Add QR code system

---

### ⚠️ Widgets (`/pages/BookingWidgets.tsx`)
**Status:** Partially functional - needs enhancement

**Required Functions:**
- ✅ `get_venue_by_embed_key()` - Widget config
- ✅ `get_venue_games()` - Available games
- ✅ `create_widget_booking()` - Public booking
- ❌ `get_widget_analytics()` - Widget performance
- ❌ `customize_widget_theme()` - Theme customization
- ❌ `generate_widget_embed_code()` - Code generation

**Issues Found:**
- ⚠️ Limited customization options
- ❌ No analytics tracking
- ❌ Missing A/B testing
- ❌ No conversion tracking
- ❌ Limited payment options

**Recommendations:**
1. Add advanced customization
2. Implement analytics tracking
3. Add A/B testing
4. Build conversion funnel
5. Expand payment options

---

### ❌ Reports (`/pages/Reports.tsx`)
**Status:** Critical - Not implemented

**Required Functions:**
- ❌ `generate_revenue_report()` - Revenue analytics
- ❌ `generate_booking_report()` - Booking analytics
- ❌ `generate_customer_report()` - Customer analytics
- ❌ `generate_staff_report()` - Staff performance
- ❌ `export_report()` - Export functionality
- ❌ `schedule_report()` - Automated reports

**Issues Found:**
- ❌ No reporting engine
- ❌ Missing data aggregation
- ❌ No scheduled reports
- ❌ Missing export formats
- ❌ No custom report builder

**Recommendations:**
1. Build reporting engine
2. Implement data aggregation
3. Add scheduled reports
4. Support multiple export formats
5. Create custom report builder

---

### ❌ Media (`/pages/Media.tsx`)
**Status:** Critical - Not implemented

**Required Functions:**
- ❌ `upload_media()` - File upload
- ❌ `get_media_library()` - List media
- ❌ `delete_media()` - Delete files
- ❌ `organize_media()` - Folders/tags
- ❌ `optimize_media()` - Image optimization

**Issues Found:**
- ❌ No Supabase Storage integration
- ❌ Missing file validation
- ❌ No image optimization
- ❌ Missing CDN integration
- ❌ No folder structure

**Recommendations:**
1. Integrate Supabase Storage
2. Add file validation
3. Implement image optimization
4. Add CDN (Cloudflare/CloudFront)
5. Create folder management

---

### ⚠️ Settings (`/pages/Settings.tsx`)
**Status:** Basic functionality - needs enhancement

**Required Functions:**
- ⚠️ `get_organization_settings()` - Org settings
- ⚠️ `update_organization_settings()` - Update settings
- ❌ `get_integration_settings()` - Third-party integrations
- ❌ `update_payment_settings()` - Payment config
- ❌ `get_email_settings()` - Email config
- ❌ `get_sms_settings()` - SMS config

**Issues Found:**
- ⚠️ Limited settings options
- ❌ No integration management
- ❌ Missing payment gateway config
- ❌ No email/SMS settings
- ❌ Missing timezone settings

**Recommendations:**
1. Expand settings options
2. Add integration management
3. Implement payment config
4. Add email/SMS settings
5. Add timezone management

---

## 3. Security Audit

### Row-Level Security (RLS)
**Status:** ⚠️ Partially implemented

**Required Policies:**
- ✅ Organizations - Basic RLS
- ✅ Users - Basic RLS
- ⚠️ Bookings - Needs organization isolation
- ⚠️ Customers - Needs organization isolation
- ❌ Payments - Missing RLS
- ❌ Notifications - Missing RLS
- ❌ Games - Needs organization isolation
- ❌ Venues - Missing table and RLS

**Critical Issues:**
1. ❌ Service role key exposed in client code
2. ⚠️ Weak RLS policies on some tables
3. ❌ No audit logging for sensitive operations
4. ❌ Missing rate limiting
5. ❌ No IP whitelisting for admin operations

**Recommendations:**
1. Move service role key to backend only
2. Strengthen all RLS policies
3. Implement audit logging
4. Add rate limiting (Supabase Edge Functions)
5. Add IP whitelisting for super-admin

---

### Authentication & Authorization
**Status:** ⚠️ Basic implementation

**Issues:**
- ⚠️ Password requirements too weak
- ❌ No 2FA/MFA
- ❌ No session management
- ❌ No password reset flow
- ❌ No email verification
- ❌ No OAuth providers

**Recommendations:**
1. Strengthen password requirements
2. Implement 2FA (TOTP)
3. Add session management
4. Build password reset flow
5. Add email verification
6. Integrate OAuth (Google, Microsoft)

---

## 4. Missing Database Functions

### Dashboard Functions
```sql
-- Already implemented ✅
get_dashboard_stats()
get_weekly_bookings_trend()
get_upcoming_bookings(limit)
get_todays_bookings_by_hour()
get_recent_booking_activity(limit)
```

### Booking Functions
```sql
-- Need to implement ❌
create_booking(...)
update_booking_status(booking_id, status)
cancel_booking(booking_id, reason, issue_refund)
send_booking_reminder(booking_id)
export_bookings(filters)
get_booking_analytics(date_range)
check_booking_conflicts(game_id, date, time)
```

### Customer Functions
```sql
-- Need to implement ❌
get_customer_segments(org_id)
calculate_customer_ltv(customer_id)
get_customer_rfm_score(customer_id)
merge_customers(customer_id_1, customer_id_2)
get_customer_communication_history(customer_id)
```

### Game Functions
```sql
-- Need to implement ❌
duplicate_game(game_id)
get_game_analytics(game_id, date_range)
get_game_availability_calendar(game_id, month)
update_game_pricing(game_id, pricing_rules)
```

### Venue Functions
```sql
-- Need to implement ❌
create_venue(...)
update_venue(venue_id, ...)
get_venue_analytics(venue_id, date_range)
link_games_to_venue(venue_id, game_ids[])
get_venue_schedule(venue_id)
```

### Campaign Functions
```sql
-- Need to implement ❌
create_campaign(...)
send_email_campaign(campaign_id)
send_sms_campaign(campaign_id)
get_campaign_analytics(campaign_id)
schedule_campaign(campaign_id, send_at)
```

---

## 5. Implementation Priority

### Phase 1: Critical (Week 1-2)
1. **Security Hardening**
   - Fix service role key exposure
   - Strengthen RLS policies
   - Add audit logging

2. **Venues System**
   - Complete venues table
   - Implement embed key system
   - Add venue-game linking

3. **Bookings Enhancement**
   - Add batch operations
   - Implement email notifications
   - Add conflict detection

### Phase 2: High Priority (Week 3-4)
1. **Games Management**
   - Complete CRUD operations
   - Add image upload
   - Implement availability rules

2. **Customer Enhancement**
   - Add segmentation
   - Implement LTV calculation
   - Build RFM analysis

3. **Staff Management**
   - Implement RBAC
   - Add scheduling
   - Build activity logging

### Phase 3: Medium Priority (Week 5-6)
1. **Marketing/Campaigns**
   - Integrate email service
   - Integrate SMS service
   - Build campaign tracking

2. **Reports**
   - Build reporting engine
   - Add scheduled reports
   - Implement exports

3. **Media Library**
   - Integrate Supabase Storage
   - Add file management
   - Implement optimization

### Phase 4: Enhancement (Week 7-8)
1. **AI Agents**
   - Integrate AI service
   - Build conversation storage
   - Implement analytics

2. **Waivers**
   - Create waiver system
   - Add e-signature
   - Implement PDF generation

3. **Advanced Features**
   - A/B testing
   - Advanced analytics
   - Custom integrations

---

## 6. Next Steps

1. **Immediate Actions:**
   - Fix security vulnerabilities
   - Complete venues implementation
   - Enhance bookings system

2. **This Week:**
   - Create missing database functions
   - Implement RLS policies
   - Add error handling

3. **This Month:**
   - Complete Phase 1 & 2
   - Begin Phase 3
   - Conduct security audit

---

## 7. Success Metrics

- ✅ All pages fully functional
- ✅ All database functions implemented
- ✅ RLS policies on all tables
- ✅ Zero security vulnerabilities
- ✅ 100% test coverage on critical paths
- ✅ Sub-200ms API response times
- ✅ Real-time updates working
- ✅ Email/SMS notifications functional

---

**Document Status:** Living document - will be updated as implementation progresses
**Last Updated:** 2025-01-11
**Next Review:** 2025-01-12
