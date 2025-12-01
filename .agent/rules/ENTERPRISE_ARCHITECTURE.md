# BookingTMS Enterprise Architecture Blueprint

> **Version**: 2.0.0  
> **Date**: December 1, 2025  
> **Status**: Architecture Review & Improvement Plan

---

## Executive Summary

This document outlines the enterprise-scale architecture improvements for BookingTMS, a multi-tenant booking management SaaS platform. The architecture is designed to handle:

- **10,000+ organizations** (tenants)
- **100,000+ venues** across all tenants
- **1M+ bookings/month** at peak
- **99.99% uptime** SLA
- **Sub-100ms API response times** at P95

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Enterprise ERD](#2-enterprise-erd)
3. [Scaling Bottlenecks](#3-scaling-bottlenecks)
4. [Target Architecture](#4-target-architecture)
5. [Data Isolation Strategy](#5-data-isolation-strategy)
6. [Performance Optimization](#6-performance-optimization)
7. [Security Architecture](#7-security-architecture)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. Current State Analysis

### 1.1 Entity Hierarchy (Current)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM LAYER                                     │
│  ┌─────────────────┐                                                        │
│  │   Platform      │◄─── System Admins (NULL org_id)                        │
│  │   (BookingTMS)  │     - Manages all organizations                        │
│  │                 │     - Platform billing & plans                         │
│  └────────┬────────┘     - Feature flags & rollouts                         │
│           │                                                                  │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION LAYER (Tenant)                           │
│  ┌─────────────────┐                                                        │
│  │  Organization   │◄─── Super Admin / Org Admin                            │
│  │  (Escape Room   │     - Stripe Connect account                           │
│  │   Business)     │     - Subscription plan                                │
│  └────────┬────────┘     - Billing & usage limits                           │
│           │                                                                  │
│           ├─────────────────────────────────────────┐                       │
│           │                                         │                       │
│           ▼                                         ▼                       │
│  ┌─────────────────┐                       ┌─────────────────┐              │
│  │     Venue       │                       │     Users       │              │
│  │  (Location)     │                       │   (Staff)       │              │
│  └────────┬────────┘                       └─────────────────┘              │
│           │                                                                  │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INVENTORY LAYER                                     │
│  ┌─────────────────┐                                                        │
│  │    Activity     │◄─── Bookable experiences                               │
│  │  (Escape Room)  │     - Schedule configuration                           │
│  │                 │     - Pricing tiers                                    │
│  └────────┬────────┘     - Stripe products                                  │
│           │                                                                  │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │ Activity Session│◄─── Time slots (auto-generated)                        │
│  │  (Time Slot)    │     - Capacity tracking                                │
│  │                 │     - Real-time availability                           │
│  └────────┬────────┘                                                        │
│           │                                                                  │
└───────────┼──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TRANSACTION LAYER                                    │
│  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐   │
│  │    Booking      │──────▶│    Payment      │──────▶│    Customer     │   │
│  │                 │       │                 │       │                 │   │
│  └─────────────────┘       └─────────────────┘       └─────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Current Database Statistics

| Table | Rows | RLS | Indexes | Issues |
|-------|------|-----|---------|--------|
| organizations | 4 | ✅ | 5 | Missing composite indexes |
| venues | 6 | ✅ | 4 | embed_key not indexed |
| activities | 10 | ✅ | 3 | schedule JSONB not indexed |
| activity_sessions | 2,305 | ✅ | 4 | Missing time-range index |
| bookings | 2 | ✅ | 5 | Missing status+date composite |
| customers | 6 | ✅ | 3 | Missing org+email unique |
| users | 2 | ✅ | 3 | RLS recursion risk |
| payments | 0 | ✅ | 4 | Missing org_id FK |

### 1.3 Current Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     ROLE HIERARCHY                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PLATFORM LEVEL (org_id = NULL)                                  │
│  ┌─────────────────┐                                             │
│  │  system-admin   │ ◄── Platform owner, full access             │
│  │  is_platform=T  │                                             │
│  └────────┬────────┘                                             │
│           │                                                      │
│  ORGANIZATION LEVEL (org_id = UUID)                              │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │  super-admin    │ ◄── Organization owner                      │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │   org-admin     │ ◄── Organization manager                    │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │     admin       │ ◄── Full operational access                 │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │    manager      │ ◄── Limited management                      │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │     staff       │ ◄── View only                               │
│  └─────────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Enterprise ERD

### 2.1 Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BOOKINGTMS ENTERPRISE ERD                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                    PLATFORM DOMAIN                                            │   │
│  │                                                                                               │   │
│  │   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐                │   │
│  │   │     plans       │         │  platform_team  │         │ feature_flags   │                │   │
│  │   │─────────────────│         │─────────────────│         │─────────────────│                │   │
│  │   │ id (PK)         │         │ id (PK)         │         │ id (PK)         │                │   │
│  │   │ name            │         │ user_id (FK)    │         │ name            │                │   │
│  │   │ slug (UNIQUE)   │         │ role            │         │ enabled         │                │   │
│  │   │ price_monthly   │         │ permissions     │         │ rollout_percent │                │   │
│  │   │ max_venues      │         │ is_active       │         │ org_whitelist[] │                │   │
│  │   │ max_staff       │         └─────────────────┘         └─────────────────┘                │   │
│  │   │ max_bookings    │                                                                         │   │
│  │   │ features (JSONB)│                                                                         │   │
│  │   └────────┬────────┘                                                                         │   │
│  │            │                                                                                  │   │
│  └────────────┼──────────────────────────────────────────────────────────────────────────────────┘   │
│               │ 1:N                                                                                  │
│               ▼                                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                   TENANT DOMAIN                                               │   │
│  │                                                                                               │   │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐    │   │
│  │   │                              organizations                                           │    │   │
│  │   │─────────────────────────────────────────────────────────────────────────────────────│    │   │
│  │   │ id (PK)              │ stripe_account_id (UNIQUE)  │ current_venues_count           │    │   │
│  │   │ name                 │ stripe_charges_enabled      │ current_staff_count            │    │   │
│  │   │ slug (UNIQUE)        │ stripe_payouts_enabled      │ current_bookings_this_month    │    │   │
│  │   │ plan_id (FK)         │ application_fee_percentage  │ subscription_status            │    │   │
│  │   │ owner_id (FK)        │ total_volume_processed      │ trial_ends_at                  │    │   │
│  │   │ status               │ total_application_fees      │ suspended_at                   │    │   │
│  │   └──────────┬───────────┴─────────────────────────────┴────────────────────────────────┘    │   │
│  │              │                                                                                │   │
│  │              ├───────────────────────────────────────────────────────────────┐               │   │
│  │              │                                                               │               │   │
│  │              ▼                                                               ▼               │   │
│  │   ┌─────────────────────────────────┐                       ┌─────────────────────────────┐  │   │
│  │   │           venues                │                       │           users             │  │   │
│  │   │─────────────────────────────────│                       │─────────────────────────────│  │   │
│  │   │ id (PK)                         │                       │ id (PK, FK auth.users)      │  │   │
│  │   │ organization_id (FK)            │                       │ organization_id (FK)        │  │   │
│  │   │ name                            │                       │ email                       │  │   │
│  │   │ slug                            │                       │ full_name                   │  │   │
│  │   │ embed_key (UNIQUE)              │                       │ role                        │  │   │
│  │   │ timezone                        │                       │ is_platform_team            │  │   │
│  │   │ address, city, state, zip       │                       │ is_active                   │  │   │
│  │   │ settings (JSONB)                │                       │ permissions (JSONB)         │  │   │
│  │   │ operating_hours (JSONB)         │                       └─────────────────────────────┘  │   │
│  │   │ status                          │                                                        │   │
│  │   └──────────┬──────────────────────┘                                                        │   │
│  │              │                                                                                │   │
│  └──────────────┼────────────────────────────────────────────────────────────────────────────────┘   │
│                 │ 1:N                                                                                │
│                 ▼                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                  INVENTORY DOMAIN                                             │   │
│  │                                                                                               │   │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐    │   │
│  │   │                               activities                                             │    │   │
│  │   │─────────────────────────────────────────────────────────────────────────────────────│    │   │
│  │   │ id (PK)              │ schedule (JSONB)            │ stripe_product_id              │    │   │
│  │   │ organization_id (FK) │ min_players, max_players    │ stripe_prices (JSONB)          │    │   │
│  │   │ venue_id (FK)        │ price, child_price          │ custom_capacity_fields (JSONB) │    │   │
│  │   │ name, description    │ duration                    │ is_active                      │    │   │
│  │   │ category             │ difficulty                  │ settings (JSONB)               │    │   │
│  │   └──────────┬───────────┴─────────────────────────────┴────────────────────────────────┘    │   │
│  │              │                                                                                │   │
│  │              │ 1:N                                                                            │   │
│  │              ▼                                                                                │   │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐    │   │
│  │   │                            activity_sessions                                         │    │   │
│  │   │─────────────────────────────────────────────────────────────────────────────────────│    │   │
│  │   │ id (PK)              │ start_time (TIMESTAMPTZ)    │ capacity_total                 │    │   │
│  │   │ activity_id (FK)     │ end_time (TIMESTAMPTZ)      │ capacity_remaining             │    │   │
│  │   │ venue_id (FK)        │ price_at_generation         │ is_closed                      │    │   │
│  │   │ organization_id (FK) │                             │ version (optimistic lock)      │    │   │
│  │   └──────────┬───────────┴─────────────────────────────┴────────────────────────────────┘    │   │
│  │              │                                                                                │   │
│  └──────────────┼────────────────────────────────────────────────────────────────────────────────┘   │
│                 │ 1:N                                                                                │
│                 ▼                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                                 TRANSACTION DOMAIN                                            │   │
│  │                                                                                               │   │
│  │   ┌─────────────────────────────────┐         ┌─────────────────────────────────┐            │   │
│  │   │          bookings               │         │          customers              │            │   │
│  │   │─────────────────────────────────│         │─────────────────────────────────│            │   │
│  │   │ id (PK)                         │         │ id (PK)                         │            │   │
│  │   │ organization_id (FK)            │         │ organization_id (FK)            │            │   │
│  │   │ venue_id (FK)                   │◄────────│ email (UNIQUE per org)          │            │   │
│  │   │ activity_id (FK)                │         │ first_name, last_name           │            │   │
│  │   │ session_id (FK)                 │         │ phone                           │            │   │
│  │   │ customer_id (FK)                │         │ stripe_customer_id              │            │   │
│  │   │ booking_reference (UNIQUE)      │         │ total_bookings                  │            │   │
│  │   │ status                          │         │ total_spent                     │            │   │
│  │   │ payment_status                  │         │ metadata (JSONB)                │            │   │
│  │   │ total_amount                    │         └─────────────────────────────────┘            │   │
│  │   │ guest_count                     │                                                        │   │
│  │   │ promo_code, promo_discount      │                                                        │   │
│  │   │ stripe_payment_intent_id        │                                                        │   │
│  │   └──────────┬──────────────────────┘                                                        │   │
│  │              │                                                                                │   │
│  │              │ 1:N                                                                            │   │
│  │              ▼                                                                                │   │
│  │   ┌─────────────────────────────────┐         ┌─────────────────────────────────┐            │   │
│  │   │          payments               │         │       slot_reservations         │            │   │
│  │   │─────────────────────────────────│         │─────────────────────────────────│            │   │
│  │   │ id (PK)                         │         │ id (PK)                         │            │   │
│  │   │ organization_id (FK)            │         │ session_id (FK)                 │            │   │
│  │   │ booking_id (FK)                 │         │ customer_email                  │            │   │
│  │   │ amount                          │         │ spots_reserved                  │            │   │
│  │   │ currency                        │         │ expires_at                      │            │   │
│  │   │ status                          │         │ checkout_session_id             │            │   │
│  │   │ stripe_payment_intent_id        │         └─────────────────────────────────┘            │   │
│  │   │ application_fee_amount          │                                                        │   │
│  │   │ net_to_merchant                 │                                                        │   │
│  │   └─────────────────────────────────┘                                                        │   │
│  │                                                                                               │   │
│  └───────────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘

RELATIONSHIPS SUMMARY:
══════════════════════════════════════════════════════════════════════════════════════════════════════
• plans 1:N organizations (plan_id)
• organizations 1:N venues (organization_id)
• organizations 1:N users (organization_id)
• organizations 1:N customers (organization_id)
• organizations 1:N bookings (organization_id)
• venues 1:N activities (venue_id)
• activities 1:N activity_sessions (activity_id)
• activity_sessions 1:N bookings (session_id)
• activity_sessions 1:N slot_reservations (session_id)
• customers 1:N bookings (customer_id)
• bookings 1:N payments (booking_id)
• auth.users 1:1 users (id)
```

---

## 3. Scaling Bottlenecks

### 3.1 Critical Issues Identified

| Priority | Issue | Impact | Solution |
|----------|-------|--------|----------|
| **P0** | RLS policy recursion on `users` table | Auth failures, infinite loops | Use SECURITY DEFINER helper functions |
| **P0** | No optimistic locking on `activity_sessions` | Double bookings, race conditions | Add `version` column with check |
| **P0** | Missing composite indexes | Slow queries at scale | Add strategic indexes |
| **P1** | JSONB fields not indexed | Full table scans on schedule queries | Add GIN indexes |
| **P1** | No connection pooling strategy | Connection exhaustion | Implement PgBouncer |
| **P1** | Denormalized data inconsistency | Stale org/venue names | Add triggers or remove denorm |
| **P2** | No read replicas | Single point of failure | Add read replicas |
| **P2** | No caching layer | Repeated DB hits | Add Redis caching |
| **P2** | No rate limiting | API abuse | Implement rate limits |

### 3.2 Query Performance Issues

```sql
-- SLOW: Current booking lookup (no composite index)
SELECT * FROM bookings 
WHERE organization_id = $1 
  AND booking_date BETWEEN $2 AND $3 
  AND status = 'confirmed';

-- SLOW: Session availability check (no time-range index)
SELECT * FROM activity_sessions
WHERE activity_id = $1
  AND start_time >= $2
  AND start_time <= $3
  AND capacity_remaining > 0;

-- SLOW: Customer lookup (no org+email index)
SELECT * FROM customers
WHERE organization_id = $1 AND email = $2;
```

### 3.3 Concurrency Issues

```
┌─────────────────────────────────────────────────────────────────┐
│                    RACE CONDITION SCENARIO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Customer A                        Customer B                    │
│      │                                 │                         │
│      │ 1. Check availability           │                         │
│      │    (capacity_remaining = 1)     │                         │
│      │                                 │                         │
│      │                                 │ 2. Check availability   │
│      │                                 │    (capacity_remaining=1)│
│      │                                 │                         │
│      │ 3. Create booking               │                         │
│      │    (decrement capacity)         │                         │
│      │                                 │                         │
│      │                                 │ 4. Create booking       │
│      │                                 │    (OVERBOOKING!)       │
│      ▼                                 ▼                         │
│                                                                  │
│  RESULT: Both customers booked the same slot!                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Target Architecture

### 4.1 Enterprise Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ENTERPRISE ARCHITECTURE                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                    CLIENT LAYER                                              │    │
│  │                                                                                              │    │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │    │
│  │   │   Admin     │   │   Embed     │   │  Customer   │   │   Mobile    │   │   Public    │   │    │
│  │   │  Dashboard  │   │   Widget    │   │   Portal    │   │    App      │   │   Website   │   │    │
│  │   │  (React)    │   │  (iframe)   │   │  (React)    │   │  (Future)   │   │  (Next.js)  │   │    │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │    │
│  │          │                 │                 │                 │                 │          │    │
│  └──────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼──────────┘    │
│             │                 │                 │                 │                 │               │
│             └─────────────────┴─────────────────┴─────────────────┴─────────────────┘               │
│                                              │                                                       │
│                                              ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                    API GATEWAY LAYER                                         │    │
│  │                                                                                              │    │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │    │
│  │   │                              Supabase Edge Functions                                 │   │    │
│  │   │                                                                                      │   │    │
│  │   │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │   │    │
│  │   │   │   Auth      │   │  Rate       │   │  Request    │   │  Response   │            │   │    │
│  │   │   │  Middleware │   │  Limiter    │   │  Validator  │   │  Cache      │            │   │    │
│  │   │   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘            │   │    │
│  │   │                                                                                      │   │    │
│  │   └─────────────────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                                              │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                              │                                                       │
│                                              ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                   SERVICE LAYER                                              │    │
│  │                                                                                              │    │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │    │
│  │   │  Booking    │   │  Payment    │   │  Inventory  │   │  Customer   │   │  Analytics  │   │    │
│  │   │  Service    │   │  Service    │   │  Service    │   │  Service    │   │  Service    │   │    │
│  │   │             │   │             │   │             │   │             │   │             │   │    │
│  │   │ - Create    │   │ - Checkout  │   │ - Sessions  │   │ - CRUD      │   │ - Metrics   │   │    │
│  │   │ - Update    │   │ - Refund    │   │ - Capacity  │   │ - Lookup    │   │ - Reports   │   │    │
│  │   │ - Cancel    │   │ - Webhook   │   │ - Generate  │   │ - Merge     │   │ - Export    │   │    │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   │    │
│  │          │                 │                 │                 │                 │          │    │
│  └──────────┼─────────────────┼─────────────────┼─────────────────┼─────────────────┼──────────┘    │
│             │                 │                 │                 │                 │               │
│             └─────────────────┴─────────────────┴─────────────────┴─────────────────┘               │
│                                              │                                                       │
│                                              ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                    DATA LAYER                                                │    │
│  │                                                                                              │    │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │    │
│  │   │                                  Supabase                                            │   │    │
│  │   │                                                                                      │   │    │
│  │   │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │   │    │
│  │   │   │  PostgreSQL │   │   Realtime  │   │   Storage   │   │    Auth     │            │   │    │
│  │   │   │  (Primary)  │   │  (Pub/Sub)  │   │   (Files)   │   │  (JWT)      │            │   │    │
│  │   │   │             │   │             │   │             │   │             │            │   │    │
│  │   │   │  + RLS      │   │  + Channels │   │  + Buckets  │   │  + MFA      │            │   │    │
│  │   │   │  + Triggers │   │  + Presence │   │  + CDN      │   │  + OAuth    │            │   │    │
│  │   │   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘            │   │    │
│  │   │                                                                                      │   │    │
│  │   └─────────────────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                                              │    │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │    │
│  │   │                              External Services                                       │   │    │
│  │   │                                                                                      │   │    │
│  │   │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │   │    │
│  │   │   │   Stripe    │   │   Resend    │   │   Twilio    │   │   Google    │            │   │    │
│  │   │   │  (Payments) │   │  (Email)    │   │   (SMS)     │   │  (Calendar) │            │   │    │
│  │   │   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘            │   │    │
│  │   │                                                                                      │   │    │
│  │   └─────────────────────────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                                              │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Booking Flow (Enterprise)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ENTERPRISE BOOKING FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐            │
│  │ Widget  │    │  API    │    │ Session │    │ Payment │    │ Booking │    │  Email  │            │
│  │         │    │ Gateway │    │ Service │    │ Service │    │ Service │    │ Service │            │
│  └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘            │
│       │              │              │              │              │              │                   │
│       │ 1. Select    │              │              │              │              │                   │
│       │    slot      │              │              │              │              │                   │
│       │─────────────▶│              │              │              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │ 2. Reserve   │              │              │              │                   │
│       │              │    slot      │              │              │              │                   │
│       │              │─────────────▶│              │              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │              │ 3. Lock with │              │              │                   │
│       │              │              │    version   │              │              │                   │
│       │              │              │    check     │              │              │                   │
│       │              │              │──────────────│              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │ 4. Return    │              │              │              │                   │
│       │              │    reservation_id          │              │              │                   │
│       │              │◀─────────────│              │              │              │                   │
│       │              │              │              │              │              │                   │
│       │ 5. Checkout  │              │              │              │              │                   │
│       │    form      │              │              │              │              │                   │
│       │─────────────▶│              │              │              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │ 6. Create    │              │              │              │                   │
│       │              │    checkout  │              │              │              │                   │
│       │              │─────────────────────────────▶│              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │              │              │ 7. Stripe    │              │                   │
│       │              │              │              │    session   │              │                   │
│       │              │              │              │──────────────│              │                   │
│       │              │              │              │              │              │                   │
│       │ 8. Redirect  │              │              │              │              │                   │
│       │    to Stripe │              │              │              │              │                   │
│       │◀─────────────│              │              │              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │              │              │ 9. Webhook   │              │                   │
│       │              │              │              │    success   │              │                   │
│       │              │              │              │─────────────────────────────▶│              │   │
│       │              │              │              │              │              │                   │
│       │              │              │              │              │ 10. Create   │                   │
│       │              │              │              │              │     booking  │                   │
│       │              │              │              │              │──────────────│                   │
│       │              │              │              │              │              │                   │
│       │              │              │ 11. Confirm  │              │              │                   │
│       │              │              │     capacity │              │              │                   │
│       │              │              │◀─────────────│              │              │                   │
│       │              │              │              │              │              │                   │
│       │              │              │              │              │ 12. Send     │                   │
│       │              │              │              │              │     confirm  │                   │
│       │              │              │              │              │─────────────▶│                   │
│       │              │              │              │              │              │                   │
│       │ 13. Success  │              │              │              │              │                   │
│       │     page     │              │              │              │              │                   │
│       │◀─────────────│              │              │              │              │                   │
│       │              │              │              │              │              │                   │
│       ▼              ▼              ▼              ▼              ▼              ▼                   │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Isolation Strategy

### 5.1 Multi-Tenant Isolation Levels

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA ISOLATION STRATEGY                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  LEVEL 1: ROW-LEVEL SECURITY (Current)                                                              │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  All tables have organization_id column                                                      │    │
│  │  RLS policies filter by organization_id = get_my_org_id()                                   │    │
│  │                                                                                              │    │
│  │  PROS:                                    CONS:                                              │    │
│  │  ✓ Simple implementation                  ✗ Policy overhead on every query                  │    │
│  │  ✓ Single database                        ✗ Noisy neighbor risk                             │    │
│  │  ✓ Easy migrations                        ✗ Shared connection pool                          │    │
│  │  ✓ Cost effective                         ✗ Complex RLS debugging                           │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                      │
│  LEVEL 2: SCHEMA-BASED ISOLATION (Future - Enterprise Tier)                                         │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  Each organization gets own schema: org_<uuid>                                               │    │
│  │  search_path set per connection                                                              │    │
│  │                                                                                              │    │
│  │  PROS:                                    CONS:                                              │    │
│  │  ✓ Complete data isolation                ✗ Complex migrations                              │    │
│  │  ✓ Per-tenant backups                     ✗ Higher operational cost                         │    │
│  │  ✓ Custom indexes per tenant              ✗ Connection management                           │    │
│  │  ✓ No RLS overhead                        ✗ Cross-tenant queries harder                     │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                      │
│  LEVEL 3: DATABASE-BASED ISOLATION (Future - Enterprise+ Tier)                                      │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │  Each enterprise org gets dedicated database                                                 │    │
│  │  Connection routing via tenant identifier                                                    │    │
│  │                                                                                              │    │
│  │  PROS:                                    CONS:                                              │    │
│  │  ✓ Maximum isolation                      ✗ Highest cost                                    │    │
│  │  ✓ Custom scaling per tenant              ✗ Complex infrastructure                          │    │
│  │  ✓ Regulatory compliance                  ✗ Difficult cross-tenant analytics               │    │
│  │  ✓ Independent maintenance                ✗ More DevOps overhead                            │    │
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 RLS Policy Best Practices

```sql
-- ANTI-PATTERN: Recursive policy (causes infinite loops)
CREATE POLICY "bad_policy" ON bookings
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()  -- This queries users table!
    )
  );

-- BEST PRACTICE: Use SECURITY DEFINER helper function
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

CREATE POLICY "good_policy" ON bookings
  FOR SELECT USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()  -- System admins see all
  );
```

---

## 6. Performance Optimization

### 6.1 Required Indexes

```sql
-- ============================================================================
-- CRITICAL INDEXES FOR ENTERPRISE SCALE
-- ============================================================================

-- Organizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_stripe_account 
  ON organizations(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_status_plan 
  ON organizations(status, plan_id);

-- Venues
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_org_status 
  ON venues(organization_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_embed_key 
  ON venues(embed_key) WHERE embed_key IS NOT NULL;

-- Activities
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_org_venue_active 
  ON activities(organization_id, venue_id, is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_schedule 
  ON activities USING GIN(schedule);

-- Activity Sessions (CRITICAL for availability queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_activity_time_capacity 
  ON activity_sessions(activity_id, start_time, capacity_remaining) 
  WHERE is_closed = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_org_date 
  ON activity_sessions(organization_id, start_time::date);

-- Bookings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_org_date_status 
  ON bookings(organization_id, booking_date, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_session 
  ON bookings(session_id) WHERE status != 'cancelled';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_customer 
  ON bookings(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_reference 
  ON bookings(booking_reference);

-- Customers
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_org_email 
  ON customers(organization_id, email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_stripe 
  ON customers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_org_role 
  ON users(organization_id, role) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_platform 
  ON users(is_platform_team) WHERE is_platform_team = true;
```

### 6.2 Optimistic Locking for Capacity

```sql
-- Add version column for optimistic locking
ALTER TABLE activity_sessions ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Function to safely decrement capacity with version check
CREATE OR REPLACE FUNCTION reserve_session_capacity(
  p_session_id UUID,
  p_spots INTEGER,
  p_expected_version INTEGER
) RETURNS TABLE(success BOOLEAN, new_version INTEGER, remaining INTEGER) AS $$
DECLARE
  v_current_capacity INTEGER;
  v_current_version INTEGER;
BEGIN
  -- Lock the row and check version
  SELECT capacity_remaining, version INTO v_current_capacity, v_current_version
  FROM activity_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  -- Version mismatch = concurrent modification
  IF v_current_version != p_expected_version THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity;
    RETURN;
  END IF;
  
  -- Insufficient capacity
  IF v_current_capacity < p_spots THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity;
    RETURN;
  END IF;
  
  -- Update with new version
  UPDATE activity_sessions
  SET 
    capacity_remaining = capacity_remaining - p_spots,
    version = version + 1
  WHERE id = p_session_id;
  
  RETURN QUERY SELECT true, v_current_version + 1, v_current_capacity - p_spots;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AUTHENTICATION ARCHITECTURE                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                    SUPABASE AUTH                                             │    │
│  │                                                                                              │    │
│  │   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐         ┌─────────────┐   │    │
│  │   │   Email/    │         │   OAuth     │         │    MFA      │         │   Session   │   │    │
│  │   │  Password   │         │  (Google)   │         │   (TOTP)    │         │  Management │   │    │
│  │   └──────┬──────┘         └──────┬──────┘         └──────┬──────┘         └──────┬──────┘   │    │
│  │          │                       │                       │                       │          │    │
│  │          └───────────────────────┴───────────────────────┴───────────────────────┘          │    │
│  │                                              │                                               │    │
│  │                                              ▼                                               │    │
│  │                                    ┌─────────────────┐                                       │    │
│  │                                    │   auth.users    │                                       │    │
│  │                                    │   (Supabase)    │                                       │    │
│  │                                    └────────┬────────┘                                       │    │
│  │                                             │                                                │    │
│  └─────────────────────────────────────────────┼────────────────────────────────────────────────┘    │
│                                                │                                                     │
│                                                │ Trigger: on_auth_user_created                       │
│                                                ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                    PUBLIC SCHEMA                                             │    │
│  │                                                                                              │    │
│  │                                    ┌─────────────────┐                                       │    │
│  │                                    │  public.users   │                                       │    │
│  │                                    │                 │                                       │    │
│  │                                    │  - id (FK)      │                                       │    │
│  │                                    │  - email        │                                       │    │
│  │                                    │  - role         │                                       │    │
│  │                                    │  - org_id       │                                       │    │
│  │                                    │  - permissions  │                                       │    │
│  │                                    └─────────────────┘                                       │    │
│  │                                                                                              │    │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                                      │
│  JWT CLAIMS (Custom):                                                                                │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│  {                                                                                                   │
│    "sub": "user-uuid",                                                                              │
│    "email": "user@example.com",                                                                     │
│    "role": "org-admin",                                                                             │
│    "org_id": "org-uuid",                                                                            │
│    "is_platform": false,                                                                            │
│    "permissions": ["bookings.view", "bookings.create", ...]                                         │
│  }                                                                                                   │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 API Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    API SECURITY LAYERS                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                      │
│  REQUEST ──────────────────────────────────────────────────────────────────────────────▶ DATABASE   │
│                                                                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   Layer 1   │   │   Layer 2   │   │   Layer 3   │   │   Layer 4   │   │   Layer 5   │           │
│  │             │   │             │   │             │   │             │   │             │           │
│  │    Rate     │──▶│    Auth     │──▶│  Permission │──▶│    Input    │──▶│     RLS     │           │
│  │   Limiter   │   │   Check     │   │    Check    │   │  Validation │   │   Policies  │           │
│  │             │   │             │   │             │   │             │   │             │           │
│  │ 100 req/min │   │ JWT verify  │   │ Role-based  │   │ Zod schema  │   │ org_id =    │           │
│  │ per IP      │   │ Token exp   │   │ permissions │   │ validation  │   │ get_my_org()│           │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘           │
│                                                                                                      │
│  SECURITY HEADERS:                                                                                   │
│  ════════════════════════════════════════════════════════════════════════════════════════════════   │
│  - X-Content-Type-Options: nosniff                                                                  │
│  - X-Frame-Options: DENY (except embed endpoints)                                                   │
│  - Content-Security-Policy: strict                                                                  │
│  - Strict-Transport-Security: max-age=31536000                                                      │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Roadmap

### 8.1 Phase 1: Foundation (Week 1-2)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Fix RLS policy recursion | P0 | 2h | Critical |
| Add optimistic locking to sessions | P0 | 4h | Critical |
| Add missing composite indexes | P0 | 2h | High |
| Add GIN indexes for JSONB | P1 | 1h | Medium |
| Create helper functions | P1 | 2h | High |

### 8.2 Phase 2: Performance (Week 3-4)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Implement connection pooling | P1 | 4h | High |
| Add Redis caching layer | P2 | 8h | High |
| Optimize slow queries | P1 | 4h | High |
| Add query monitoring | P2 | 2h | Medium |

### 8.3 Phase 3: Reliability (Week 5-6)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Add rate limiting | P1 | 4h | High |
| Implement circuit breakers | P2 | 4h | Medium |
| Add health checks | P2 | 2h | Medium |
| Set up alerting | P2 | 4h | High |

### 8.4 Phase 4: Scale (Week 7-8)

| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Add read replicas | P2 | 8h | High |
| Implement sharding strategy | P3 | 16h | High |
| Add CDN for static assets | P2 | 4h | Medium |
| Performance testing | P1 | 8h | Critical |

---

## Appendix A: Migration Scripts

See `/supabase/migrations/` for all database migrations.

## Appendix B: API Reference

See `/docs/API_REFERENCE.md` for complete API documentation.

## Appendix C: Monitoring Dashboard

See `/docs/MONITORING_GUIDE.md` for observability setup.

---

*Document maintained by the BookingTMS Engineering Team*
