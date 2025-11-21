# Supabase + Stripe Architecture Guide for Booking TMS

This document outlines the strict architectural guidelines for implementing and improving the Supabase + Stripe integration for the multi-tenant Booking TMS platform.

**Core Principle**: Use ONLY the existing architecture and tech stack. Do not redesign unless absolutely necessary. Prioritize scalability, speed, and security.

## 1. Database (Supabase Postgres)
All core data must reside in Supabase Postgres.
*   **Entities**: Activities, Sessions, Bookings, Pricing, Organizations, Stripe Accounts.
*   **Stripe Fields**: Store `stripe_account_id`, `stripe_product_id`, `stripe_price_id` directly on relevant tables.
*   **Reporting**: Use DB views and aggregations for revenue summaries.

## 2. Security & Multi-Tenancy (RLS)
*   **Strict RLS**: Every table must have Row Level Security enabled.
*   **Policy**: Users can only access data belonging to their `organization_id`.
*   **Public Access**: Strictly limited to "published" activities and "available" sessions for booking widgets.

## 3. Edge Functions (Business Logic)
Move all sensitive and complex logic to Supabase Edge Functions.
*   **`stripe-webhook`**: Handle all asynchronous Stripe events.
*   **`create-booking`**: Validate inputs, check capacity, and initiate the booking transaction.
*   **`create-payment-intent`**: Securely create payment intents with correct metadata and fees.
*   **`stripe-manage-product`**: Create/Update Stripe Products and Prices (One product per activity).
*   **`process-refund`**: Handle full and partial refunds via `reverse_transfer`.

## 4. Atomic Transactions (Supabase RPC)
Use Postgres Functions (RPC) for data integrity during bookings.
*   **`create_booking_transaction`**:
    *   Lock session row (prevent race conditions).
    *   Check capacity.
    *   Insert booking record.
    *   Decrement session capacity.
    *   **All within a single transaction.**

## 5. Scheduled Tasks (Supabase Cron)
Automate maintenance tasks.
*   **`auto-cancel-unpaid`**: Cancel bookings that remain "pending" > 15 mins.
*   **`auto-close-sessions`**: Mark past sessions as "completed".
*   **`sync-subscriptions`**: Daily sync of subscription status.
*   **`generate-reports`**: Materialize views for daily/weekly reporting.

## 6. Realtime Updates
Use Supabase Realtime for live UI state.
*   **Widget**: Listen for capacity changes on `sessions` to disable fully booked slots instantly.
*   **Dashboard**: Listen for new `bookings` to alert staff.

## 7. Storage
*   **Buckets**: `activity-images`, `venue-images`, `receipts`.
*   **Security**: Public read for images; Authenticated read for receipts.

## 8. Stripe Connect (Marketplace)
*   **Account Type**: Express or Standard (per existing setup).
*   **Onboarding**: Use `accountLinks` for onboarding flow.
*   **Charges**: Use **Destination Charges** (`transfer_data: { destination: '...' }`).
*   **Fees**: Use `application_fee_amount` to monetize the platform.

## 9. Stripe Products & Prices
*   **Structure**: 1 Activity = 1 Stripe Product.
*   **Pricing**: Multiple Prices per Product (e.g., Adult, Child, VIP).
*   **Rule**: NEVER create products for individual time slots or sessions.

## 10. Payment Metadata
Every Payment Intent MUST include:
```json
{
  "organization_id": "...",
  "venue_id": "...",
  "activity_id": "...",
  "session_id": "...",
  "booking_id": "...",
  "quantity": "...",
  "price_type": "...",
  "final_price": "..."
}
```

## 11. Webhook Handlers
*   `payment_intent.succeeded`: **Confirm Booking** (Update status to 'confirmed').
*   `payment_intent.failed`: **Fail Booking** (Update status to 'failed', release capacity).
*   `charge.refunded`: **Log Refund** (Update booking payment status).
*   `account.updated`: **Update Connect Status** (Enable payouts/charges).

## 12. Refund Logic
*   **Full Refund**: Reverse transfer + Refund application fee (optional) + Refund charge.
*   **Partial Refund**: Calculate pro-rated amounts.

## 13. Reporting Engine
*   Do not compute reports in API.
*   Use SQL Views or Materialized Views for:
    *   `view_revenue_by_organization`
    *   `view_bookings_by_activity`

## Implementation Checklist
- [ ] **Consolidate Booking Service**: Ensure `src/services/booking.service.ts` is the SINGLE source of truth using RPC + Edge Functions.
- [ ] **Refactor Product Service**: Switch `StripeProductService` to use `stripe-manage-product` Edge Function.
- [ ] **Verify RPC**: Check `create_booking_transaction` handles locking correctly.
- [ ] **Setup Cron**: Verify/Create cron jobs for cleanup.
- [ ] **Audit RLS**: Ensure no data leaks between organizations.
