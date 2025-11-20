# Order System Implementation Plan

**Version:** 1.0.0  
**Date:** November 13, 2025  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the comprehensive implementation plan for a complete **Order Management System** in the Booking TMS platform. The system will track all financial transactions, manage order lifecycles, integrate with Stripe payments, and provide enterprise-grade order tracking and reporting.

---

## Current State Analysis

### ✅ What We Have

1. **Payment Infrastructure**
   - Stripe integration (products, prices, checkout sessions)
   - Multi-provider payment system (Stripe, PayPal, 2Checkout)
   - Payment configurations table
   - Checkout session creation

2. **Booking System**
   - Bookings table with comprehensive fields
   - Calendar integration
   - Customer management
   - Confirmation codes

3. **Database Foundation**
   - Multi-tenant architecture
   - RLS policies
   - Organization/venue/game relationships

### ❌ What We're Missing

1. **Order Management**
   - No dedicated `orders` table
   - No order line items tracking
   - No order status workflow
   - No refund management

2. **Financial Tracking**
   - No comprehensive transaction log
   - No payment reconciliation
   - No revenue analytics per order

3. **Order Lifecycle**
   - No order fulfillment tracking
   - No order cancellation workflow
   - No order modification history

---

## Implementation Phases

### Phase 1: Database Foundation (Priority: HIGH)

**Create Tables:**
1. `orders` - Main order tracking
2. `order_items` - Line items per order
3. `order_transactions` - Payment/refund tracking
4. `order_status_history` - Audit trail

**Key Fields for Orders Table:**
- `order_number` (unique, auto-generated)
- `status` (pending, paid, confirmed, completed, cancelled, refunded)
- `payment_status` (unpaid, paid, refunded)
- `total_amount`, `subtotal`, `tax_amount`, `discount_amount`
- `stripe_payment_intent_id`, `stripe_checkout_session_id`
- `booking_id` (link to bookings)
- `customer_id` (link to customers)

### Phase 2: Backend Services (Priority: HIGH)

**Create Services:**
1. `OrderService.ts` - CRUD operations
2. `OrderItemService.ts` - Line item management
3. `OrderTransactionService.ts` - Payment tracking

**Key Methods:**
- `createOrder()` - Create order with items
- `updateOrderStatus()` - Change order status
- `processRefund()` - Handle refunds
- `getOrderDetails()` - Fetch complete order

### Phase 3: Stripe Integration (Priority: HIGH)

**Update Checkout Flow:**
1. Create order BEFORE Stripe checkout
2. Pass `order_id` in Stripe metadata
3. Link payment_intent to order

**Webhook Handlers:**
- `checkout.session.completed` → Update order
- `payment_intent.succeeded` → Mark paid
- `charge.refunded` → Record refund

### Phase 4: Frontend Components (Priority: MEDIUM)

**Pages:**
1. Orders Dashboard (`/orders`)
2. Order Details (`/orders/:id`)

**Components:**
- `OrderCard` - List view
- `OrderStatusBadge` - Visual status
- `OrderTimeline` - Status history
- `RefundDialog` - Refund interface

### Phase 5: Reporting & Analytics (Priority: MEDIUM)

**Reports:**
- Daily/weekly/monthly revenue
- Orders by status
- Refund rate
- Average order value

---

## Database Schema (Simplified)

```sql
-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID NOT NULL,
  customer_id UUID,
  booking_id UUID,
  
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  
  subtotal DECIMAL(10, 2),
  tax_amount DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2) NOT NULL,
  
  stripe_payment_intent_id VARCHAR(255),
  stripe_checkout_session_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  game_id UUID,
  
  item_type VARCHAR(50), -- game_booking, addon, etc.
  product_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Transactions Table
CREATE TABLE order_transactions (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  
  transaction_type VARCHAR(50), -- payment, refund
  transaction_status VARCHAR(50),
  amount DECIMAL(10, 2),
  
  provider VARCHAR(50), -- stripe, paypal
  provider_transaction_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Integration Flow

### Current Booking Flow
```
1. Customer selects game/date
2. Fills customer info
3. Redirects to Stripe
4. Payment completes
5. Booking created
```

### New Order Flow
```
1. Customer selects game/date
2. Fills customer info
3. CREATE ORDER (status: pending)
4. Redirect to Stripe with order_id
5. Payment completes
6. UPDATE ORDER (status: paid)
7. CREATE BOOKING (linked to order)
8. UPDATE ORDER (status: confirmed)
```

---

## Timeline

- **Week 1:** Database schema + migrations
- **Week 2:** Backend services + Stripe integration
- **Week 3:** Frontend components
- **Week 4:** Testing + refinements
- **Week 5:** Analytics + reporting
- **Week 6:** Documentation + deployment

---

## Next Steps

1. ✅ **Review this plan** - Validate approach
2. ⏳ **Create migration file** - `024_order_management_system.sql`
3. ⏳ **Build OrderService** - Core business logic
4. ⏳ **Update checkout flow** - Integrate orders
5. ⏳ **Build UI components** - Orders dashboard
6. ⏳ **Test end-to-end** - Complete flow validation

---

## Questions to Answer

1. **Tax Calculation:** Do we need automatic tax calculation or manual entry?
2. **Refund Policy:** Full refunds only or partial refunds allowed?
3. **Order Cancellation:** Can customers cancel or admin-only?
4. **Invoice Generation:** PDF invoices required?
5. **Multi-currency:** Support multiple currencies or USD only?
6. **Gift Vouchers:** Should vouchers create orders?

---

**Status:** Ready for implementation
**Estimated Effort:** 6 weeks
**Priority:** HIGH - Critical for financial tracking
