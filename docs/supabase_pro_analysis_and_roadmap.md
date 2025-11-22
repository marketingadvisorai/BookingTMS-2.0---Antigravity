# Supabase Pro Architecture Analysis & Roadmap

**Date:** November 22, 2025
**Status:** Strategic Analysis

## 1. Executive Summary
We have reviewed the "Supabase Pro" implementation guide against our current codebase.
**Good News:** We are already ~70% aligned with the architectural vision. We use Supabase for everything (Auth, DB, Edge Functions, Realtime, RPC) and have a solid multi-tenant foundation.
**Gaps:** The main gaps are in **Stripe Connect (Platform Fees)**, **Refund Logic**, **Reporting**, and the **Venue/Room Management** UI which is the prerequisite for the booking engine.

## 2. Comparison Matrix

| Feature | Requirement | Current Status | Gap / Action |
| :--- | :--- | :--- | :--- |
| **Database** | Postgres for all data | ✅ **Done** | None |
| **Multi-tenancy** | Strict RLS | ✅ **Done** | Continue enforcing |
| **Edge Functions** | Webhooks, Booking, Payments | ✅ **Done** | Add Refund logic |
| **Cron Jobs** | Auto-cancel, Auto-close, Sync | ⚠️ **Partial** | Only `generate-sessions` exists. Need `auto-cancel-unpaid`. |
| **Realtime** | Live updates | ✅ **Done** | Expand to Staff Dashboard later |
| **RPC** | Atomic Booking | ✅ **Done** | `create_booking_transaction` is solid |
| **Storage** | Images/Waivers | ❌ **Missing** | Need to implement for Venue/Activity images |
| **Auth** | Roles (Admin, Staff) | ✅ **Done** | Refine Role-based access in UI |
| **Stripe Connect** | Destination Charges + App Fee | ⚠️ **Partial** | Code handles `stripeAccount` but missing `application_fee_amount` logic. |
| **Stripe Products** | 1 Product / Activity | ✅ **Done** | `StripeIntegrationService` handles this well. |
| **Metadata** | Full Context (Org, Venue, etc) | ⚠️ **Partial** | Missing `venue_id`, `price_type`, `final_price` in metadata. |
| **Webhooks** | Full Lifecycle | ⚠️ **Partial** | Only `succeeded` handled. Need `failed`, `refunded`. |
| **Refunds** | Full/Partial Logic | ❌ **Missing** | Need `refund-booking` Edge Function. |
| **Reporting** | DB Aggregations | ❌ **Missing** | Future Phase. |

## 3. Strategic Roadmap

The user has explicitly requested to **"create the rooms/venues first properly to active the booking engine first."** This aligns with our need to solidify the foundation before expanding the "Pro" features.

### Phase 1: Venue & Room Foundation (Immediate Priority)
**Goal:** Ensure Venues (Rooms) are first-class citizens with proper images, settings, and availability rules.
1.  **Venue Management UI**:
    -   Update Venue Settings to support **Images** (Supabase Storage).
    -   Add **Timezone** configuration (Critical for session generation).
    -   Add **Operating Hours** per Venue (if different from Org).
2.  **Activity-Venue Linking**:
    -   Ensure Activities are correctly linked to Venues (Rooms).
    -   Validate that `generate-sessions` respects Venue operating hours.

### Phase 2: Stripe Connect & Payment Refinement
**Goal:** Monetize the platform with proper split payments.
1.  **Update `create-booking`**:
    -   Add `application_fee_amount` to Payment Intent (Platform Revenue).
    -   Add missing metadata (`venue_id`, `final_price`).
2.  **Refund System**:
    -   Create `refund-booking` Edge Function.
    -   Handle `reverse_transfer` for Connect payments.

### Phase 3: Frontend Adaptation (The Bridge)
**Goal:** Connect the new backend to the user interface.
1.  **Add Activity Wizard**: Update to save to `activities` table.
2.  **Booking Widget**: Update to fetch from `activity_sessions`.

### Phase 4: Automation & Maintenance
**Goal:** Self-driving system.
1.  **Cron**: Implement `auto-cancel-unpaid` (cancel bookings stuck in `pending_payment` > 15 mins).
2.  **Reporting**: Build the Revenue Dashboard using DB aggregations.

## 4. Immediate Plan (Next Session)
We will start with **Phase 1: Venue & Room Foundation**.
1.  Verify `venues` table schema (add `timezone`, `images`).
2.  Implement `VenueService` (CRUD).
3.  Build/Update the **Venue Settings** page to allow users to fully configure their rooms.
