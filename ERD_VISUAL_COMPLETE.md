# 📐 Complete Entity Relationship Diagram (ERD)
## BookingTMS Multi-Tenant SaaS Database

**Version:** 1.0  
**Date:** November 16, 2025

---

## 🎨 FULL DATABASE ERD

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    PLATFORM LAYER (Global Resources)               ┃
┃                    NO organization_id requirement                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  ┌─────────────────────────┐
  │   platform_team         │
  │─────────────────────────│
  │ id (PK, UUID)           │
  │ user_id (FK → users) 🔑 │
  │ role (system/super)     │
  │ department              │
  │ permissions (JSONB)     │
  │ is_active               │
  │ created_at, updated_at  │
  └─────────────────────────┘
             │
             │ 1:1
             ├──────────────┐
             │              │
  ┌──────────▼──────────┐   │    ┌─────────────────────┐
  │       plans         │   │    │   system_config     │
  │─────────────────────│   │    │─────────────────────│
  │ id (PK, UUID)       │   │    │ id (PK, UUID)       │
  │ name, slug          │   │    │ key (UNIQUE)        │
  │ price_monthly       │   │    │ value (JSONB)       │
  │ price_yearly        │   │    │ description         │
  │ stripe_price_id_*   │   │    │ is_public           │
  │                     │   │    │ updated_at          │
  │ ─── Limits ───      │   │    └─────────────────────┘
  │ max_venues          │   │
  │ max_staff           │   │    ┌─────────────────────┐
  │ max_bookings/month  │   │    │  feature_flags      │
  │                     │   │    │─────────────────────│
  │ ─── Features ───    │   │    │ id (PK, UUID)       │
  │ features (JSONB)    │   │    │ name, slug          │
  │  - booking_widgets  │   │    │ description         │
  │  - email_campaigns  │   │    │ is_enabled          │
  │  - ai_agents        │   │    │ rollout_percentage  │
  │  - api_access       │   │    │ created_at          │
  │  - webhooks         │   │    └─────────────────────┘
  │  - sso, etc.        │   │
  │                     │   │
  │ is_active, is_public│   │
  │ created_at          │   │
  └─────────────────────┘   │
             │              │
             │ 1:M          │
             │              │
┏━━━━━━━━━━━┷━━━━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                 TENANT LAYER (Organization-Scoped)                 ┃
┃              ALL tables MUST have organization_id                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
             │
  ┌──────────▼───────────────────────────────────────────┐
  │               organizations (TENANTS)                 │
  │───────────────────────────────────────────────────────│
  │ id (PK, UUID)                                         │
  │ name, slug (UNIQUE)                                   │
  │ plan_id (FK → plans) 🔑                              │
  │ owner_id (FK → users) 🔑 (primary admin)             │
  │                                                       │
  │ ─── Stripe Integration ───                           │
  │ stripe_customer_id (UNIQUE)                           │
  │ stripe_subscription_id (UNIQUE)                       │
  │ subscription_status (active/trialing/past_due)        │
  │ trial_ends_at                                         │
  │                                                       │
  │ ─── Usage Tracking (for plan limits) ───             │
  │ current_venues_count ↔ compares to plans.max_venues   │
  │ current_staff_count ↔ compares to plans.max_staff     │
  │ current_bookings_this_month ↔ plans.max_bookings      │
  │ last_usage_reset_at (monthly reset)                   │
  │                                                       │
  │ ─── Settings & Branding ───                          │
  │ settings (JSONB): timezone, currency, hours           │
  │ logo_url, primary_color                               │
  │                                                       │
  │ is_active, suspended_at, suspended_reason             │
  │ created_at, updated_at, created_by                    │
  └───────────────────────────────────────────────────────┘
             │
             ├───────────────────────────────┬─────────────────┬────────────────┐
             │                               │                 │                │
  ┌──────────▼────────────┐   ┌──────────────▼──────┐  ┌──────▼────────┐  ┌────▼──────────┐
  │      users            │   │     venues          │  │    games      │  │  customers    │
  │───────────────────────│   │─────────────────────│  │───────────────│  │───────────────│
  │ id (PK, UUID)         │   │ id (PK, UUID)       │  │ id (PK, UUID) │  │ id (PK, UUID) │
  │ email (UNIQUE)        │   │ organization_id 🔑  │  │ org_id 🔑     │  │ org_id 🔑     │
  │ full_name             │   │ name, slug          │  │ venue_id (FK) │  │ email         │
  │                       │   │ address, city       │  │               │  │ full_name     │
  │ role                  │   │ timezone            │  │ name, desc    │  │ phone         │
  │  - system-admin       │   │ settings (JSONB)    │  │ difficulty    │  │               │
  │  - super-admin        │   │                     │  │ duration_min  │  │ stripe_id     │
  │  - admin 🎯           │   │ logo_url            │  │ min_players   │  │ total_bookings│
  │  - manager            │   │ contact_email       │  │ max_players   │  │ total_spent   │
  │  - staff              │   │ contact_phone       │  │ price         │  │ segment       │
  │                       │   │                     │  │ image_url     │  │  - vip        │
  │ organization_id 🔑    │   │ is_active           │  │               │  │  - regular    │
  │ is_platform_team 🔑   │   │ created_at          │  │ is_active     │  │  - new        │
  │  (true = us)          │   └─────────────────────┘  │ created_at    │  │               │
  │  (false = customer)   │              │             └───────────────┘  │ notes (TEXT)  │
  │                       │              │                     │          │ created_at    │
  │ phone, avatar_url     │              │                     │          └───────────────┘
  │ is_active             │              │                     │                 │
  │ last_login_at         │              │                     │                 │
  │ created_at            │              ├─────────────────────┤                 │
  └───────────────────────┘              │                     │                 │
             │                           │                     │                 │
             │ created_by                │                     │                 │
             └───────────────────────────┼─────────────────────┼─────────────────┤
                                         │                     │                 │
                              ┌──────────▼─────────────────────▼─────────────────▼───────┐
                              │                  bookings                                 │
                              │───────────────────────────────────────────────────────────│
                              │ id (PK, UUID)                                             │
                              │ organization_id (FK → organizations) 🔑                   │
                              │ booking_number (UNIQUE, "BK-12345")                       │
                              │                                                           │
                              │ customer_id (FK → customers) 🔑                          │
                              │ game_id (FK → games) 🔑                                  │
                              │ venue_id (FK → venues) 🔑                                │
                              │                                                           │
                              │ booking_date (DATE)                                       │
                              │ start_time (TIME)                                         │
                              │ end_time (TIME)                                           │
                              │ party_size (INT)                                          │
                              │                                                           │
                              │ status (ENUM)                                             │
                              │  - pending, confirmed, checked_in, completed, cancelled   │
                              │                                                           │
                              │ ─── Pricing ───                                          │
                              │ total_amount (DECIMAL)                                    │
                              │ discount_amount (DECIMAL)                                 │
                              │ final_amount (DECIMAL)                                    │
                              │                                                           │
                              │ payment_status (ENUM)                                     │
                              │  - pending, paid, refunded, failed                        │
                              │ payment_intent_id                                         │
                              │                                                           │
                              │ notes (TEXT)                                              │
                              │ created_by (FK → users)                                   │
                              │ created_at, updated_at                                    │
                              └───────────────────────────────────────────────────────────┘
                                         │                    │
                                         │ 1:M                │ 1:M
                      ┌──────────────────┴──────┐   ┌─────────▼────────────┐
                      │     payments            │   │     waivers          │
                      │─────────────────────────│   │──────────────────────│
                      │ id (PK, UUID)           │   │ id (PK, UUID)        │
                      │ booking_id (FK) 🔑      │   │ booking_id (FK) 🔑   │
                      │                         │   │ organization_id 🔑   │
                      │ stripe_payment_intent   │   │                      │
                      │ stripe_charge_id        │   │ customer_id (FK)     │
                      │ amount, currency        │   │ waiver_type          │
                      │ status                  │   │ signed_at            │
                      │ payment_method_type     │   │ signature_data       │
                      │ last_4, card_brand      │   │ ip_address           │
                      │                         │   │ qr_code_url          │
                      │ receipt_url             │   │                      │
                      │ refund_amount           │   │ is_signed            │
                      │ failure_code            │   │ created_at           │
                      │                         │   └──────────────────────┘
                      │ metadata (JSONB)        │
                      │ created_at              │
                      └─────────────────────────┘
                                 │ 1:M
                      ┌──────────▼─────────────┐
                      │      refunds           │
                      │────────────────────────│
                      │ id (PK, UUID)          │
                      │ payment_id (FK) 🔑     │
                      │ booking_id (FK)        │
                      │                        │
                      │ stripe_refund_id       │
                      │ amount, currency       │
                      │ status                 │
                      │ reason                 │
                      │                        │
                      │ created_at             │
                      └────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    SUPPORTING TABLES (Per Tenant)                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
  │  venue_calendars       │  │   game_calendars       │  │   pricing_tiers        │
  │────────────────────────│  │────────────────────────│  │────────────────────────│
  │ id, organization_id 🔑 │  │ id, organization_id 🔑 │  │ id, organization_id 🔑 │
  │ venue_id (FK)          │  │ venue_id (FK)          │  │ game_id (FK)           │
  │ day_of_week            │  │ game_id (FK)           │  │ name, description      │
  │ open_time, close_time  │  │ day_of_week            │  │ day_type               │
  │ is_available           │  │ start_time, end_time   │  │ time_slot_start        │
  │ special_hours (JSONB)  │  │ is_available           │  │ price_modifier         │
  │ created_at             │  │ max_bookings_per_slot  │  │ min_party_size         │
  └────────────────────────┘  │ created_at             │  │ is_active              │
                              └────────────────────────┘  └────────────────────────┘

  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
  │     promo_codes        │  │   email_templates      │  │   email_campaigns      │
  │────────────────────────│  │────────────────────────│  │────────────────────────│
  │ id, organization_id 🔑 │  │ id, organization_id 🔑 │  │ id, organization_id 🔑 │
  │ code (UNIQUE)          │  │ name, slug             │  │ template_id (FK)       │
  │ discount_type          │  │ subject, body_html     │  │ name, description      │
  │ discount_value         │  │ trigger_event          │  │ status, sent_count     │
  │ min_party_size         │  │ variables (JSONB)      │  │ opened_count           │
  │ valid_from, valid_to   │  │ is_active              │  │ clicked_count          │
  │ usage_limit            │  │ created_at             │  │ scheduled_at           │
  │ current_usage          │  └────────────────────────┘  │ completed_at           │
  │ is_active              │                              └────────────────────────┘
  └────────────────────────┘

  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
  │    notifications       │  │  notification_settings │  │      audit_logs        │
  │────────────────────────│  │────────────────────────│  │────────────────────────│
  │ id, organization_id 🔑 │  │ user_id (PK, FK)       │  │ id, organization_id 🔑 │
  │ user_id (FK)           │  │ sound_enabled          │  │ user_id (FK)           │
  │ type, priority         │  │ desktop_enabled        │  │ action, entity_type    │
  │ title, message         │  │ email_enabled          │  │ entity_id              │
  │ action_url             │  │ sms_enabled            │  │ changes (JSONB)        │
  │ is_read, read_at       │  │ quiet_hours_enabled    │  │ ip_address             │
  │ created_at             │  │ updated_at             │  │ user_agent             │
  └────────────────────────┘  └────────────────────────┘  │ created_at             │
                                                          └────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    USAGE & HISTORY TRACKING                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  ┌────────────────────────────┐  ┌──────────────────────────────┐
  │   organization_usage       │  │   subscription_history       │
  │────────────────────────────│  │──────────────────────────────│
  │ id, organization_id (FK) 🔑│  │ id, organization_id (FK) 🔑  │
  │ period_start (DATE)        │  │ old_plan_id (FK → plans)     │
  │ period_end (DATE)          │  │ new_plan_id (FK → plans)     │
  │                            │  │ change_type                  │
  │ venues_count               │  │  - upgrade, downgrade        │
  │ staff_count                │  │  - trial_start, trial_end    │
  │ bookings_count             │  │  - cancelled, reactivated    │
  │ revenue_generated          │  │                              │
  │                            │  │ stripe_event_id              │
  │ has_exceeded_limits        │  │ amount_paid                  │
  │ created_at                 │  │ effective_date               │
  └────────────────────────────┘  │ created_at, created_by       │
                                  └──────────────────────────────┘

  ┌──────────────────────────────────────┐
  │       webhook_events                 │
  │──────────────────────────────────────│
  │ id (PK, UUID)                        │
  │ organization_id (FK, nullable) 🔑    │
  │ event_id (UNIQUE)                    │
  │ event_type (e.g., payment_succeeded) │
  │ payload (JSONB)                      │
  │ processed (BOOLEAN)                  │
  │ processing_error (TEXT)              │
  │ created_at, processed_at             │
  └──────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LEGEND:
━━━━━  Tenant boundary (RLS enforced)
🔑      Foreign key with cascade/restrict
(PK)    Primary key
(FK)    Foreign key
(UNIQUE) Unique constraint
JSONB   Flexible JSON storage
ENUM    Predefined values

TENANT ISOLATION RULES:
1. ALL tenant tables have organization_id
2. ALL tenant tables have RLS policies
3. Platform team bypasses RLS (is_platform_team = true)
4. Org users see only their data (organization_id match)
5. No cross-tenant foreign keys allowed
```

---

## 🔗 KEY RELATIONSHIPS

### Critical Constraints

```sql
-- Organizations MUST have a plan
organizations.plan_id → plans.id (RESTRICT)

-- Organizations should have an owner (admin)
organizations.owner_id → users.id (SET NULL)

-- Users belong to org (unless platform team)
users.organization_id → organizations.id (CASCADE)

-- All bookings tied to org
bookings.organization_id → organizations.id (CASCADE)
bookings.customer_id → customers.id (RESTRICT)
bookings.game_id → games.id (RESTRICT)
bookings.venue_id → venues.id (RESTRICT)

-- Payments tied to bookings
payments.booking_id → bookings.id (CASCADE)

-- Venues host games
games.venue_id → venues.id (CASCADE)
```

### Cascade Rules

**ON DELETE CASCADE:** When parent deleted, children deleted
- organizations → users, venues, games, bookings (all tenant data)
- bookings → payments, waivers
- users → notifications, audit_logs

**ON DELETE RESTRICT:** Prevent deletion if children exist
- plans → organizations (can't delete plan with active orgs)
- customers → bookings (can't delete customer with bookings)
- games → bookings (can't delete game with future bookings)

**ON DELETE SET NULL:** Keep child, nullify reference
- organizations.owner_id (keep org if owner deleted)

---

## 📊 DATA FLOW EXAMPLES

### 1. Customer Books a Game

```
Customer (guest) 
  → creates/finds record in customers table
  → selects game from games table
  → creates booking in bookings table
  → triggers payment in payments table
  → signs waiver in waivers table
  
All records share same organization_id
All visible only to that organization
```

### 2. Organization Upgrades Plan

```
admin user
  → views current plan in organizations.plan_id
  → selects new plan from plans table
  → Stripe webhook confirms payment
  → organizations.plan_id updated
  → subscription_history record created
  → new features unlock based on plans.features
  → organization_usage.has_exceeded_limits reset
```

### 3. Platform Team Creates Organization

```
system-admin (is_platform_team = true)
  → creates organization record
  → assigns plan_id
  → creates Stripe customer
  → creates first admin user (owner_id)
  → admin receives login credentials
  → admin can now create venues, games, bookings
```

---

**All relationships enforce tenant isolation through:**
- Foreign key constraints
- RLS policies
- Application-level checks
- Trigger validations

**Next: Migration scripts and API implementation**
