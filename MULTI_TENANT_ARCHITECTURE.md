# 🏢 BookingTMS Multi-Tenant SaaS Architecture

**Version:** 1.0  
**Date:** November 16, 2025  
**Status:** Architecture Design Phase  
**Branch:** system-admin-implementation-0.1

---

## 📋 Executive Summary

BookingTMS is evolving into a **multi-tenant SaaS platform** where:
- **System Admin** manages the entire platform
- **Organizations** (tenants) manage their own venues
- **Venue Owners** manage multiple locations
- **Staff** operate within their assigned venues
- **Customers** book experiences across venues

### Multi-Tenant Strategy: **Shared Database, Row-Level Security (RLS)**

**Why this approach:**
✅ Cost-effective for small-medium tenants  
✅ Easier to maintain (one schema)  
✅ Better for analytics across tenants  
✅ Supabase RLS provides strong isolation  
✅ Simpler backups and migrations  

---

## 🎯 Multi-Tenant Strategy

### Tenant Isolation Model

```
┌─────────────────────────────────────────────────────┐
│                 PLATFORM LEVEL                       │
│  System Admin → Manages all organizations           │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼─────┐  ┌──────▼──────┐  ┌────▼──────┐
│  Org A      │  │  Org B      │  │  Org C    │
│  (Tenant 1) │  │  (Tenant 2) │  │ (Tenant 3)│
└─────────────┘  └─────────────┘  └───────────┘
```

### Resource Classification

**GLOBAL (Platform-Level):**
- System settings
- Subscription plans
- Feature flags
- Platform analytics
- System audit logs

**TENANT (Organization-Level):**
- Organizations
- Venues
- Games
- Staff
- Bookings
- Customers
- Payments
- Widgets

---

## 📊 ENTITY RELATIONSHIP DIAGRAM (ERD)

### Core Entities Visualization

```
┌──────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐       ┌──────────────────┐             │
│  │  system_admins  │       │  feature_flags   │             │
│  ├─────────────────┤       ├──────────────────┤             │
│  │ id (uuid)       │       │ id (uuid)        │             │
│  │ email           │       │ name             │             │
│  │ name            │       │ enabled          │             │
│  └─────────────────┘       └──────────────────┘             │
│                                                               │
│  ┌─────────────────┐       ┌──────────────────┐             │
│  │  plans          │       │  platform_logs   │             │
│  ├─────────────────┤       ├──────────────────┤             │
│  │ id (uuid)       │       │ id (uuid)        │             │
│  │ name            │       │ action           │             │
│  │ price           │       │ user_id          │             │
│  │ features        │       │ timestamp        │             │
│  └─────────────────┘       └──────────────────┘             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  TENANT/ORGANIZATION LAYER                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────┐             │
│  │           organizations                     │             │
│  ├─────────────────────────────────────────────┤             │
│  │ id (uuid) [PK]                              │             │
│  │ name (text)                                 │             │
│  │ slug (text) [UNIQUE]                        │             │
│  │ plan_id (uuid) [FK → plans.id]              │             │
│  │ status (enum: active, suspended, trial)     │             │
│  │ owner_email (text)                          │             │
│  │ settings (jsonb)                            │             │
│  │ created_at (timestamptz)                    │             │
│  └─────────────────────────────────────────────┘             │
│                    │                                          │
│                    │ 1:M                                      │
│  ┌─────────────────▼─────────────────────────┐               │
│  │              venues                       │               │
│  ├───────────────────────────────────────────┤               │
│  │ id (uuid) [PK]                            │               │
│  │ organization_id (uuid) [FK]               │─────┐         │
│  │ name (text)                               │     │         │
│  │ slug (text)                               │     │         │
│  │ address (text)                            │     │ 1:M     │
│  │ city (text)                               │     │         │
│  │ status (enum: active, inactive)           │     │         │
│  │ settings (jsonb)                          │     │         │
│  └───────────────────────────────────────────┘     │         │
│                    │                               │         │
│                    │ 1:M                           │         │
│  ┌─────────────────▼─────────────────────────┐    │         │
│  │              games                        │    │         │
│  ├───────────────────────────────────────────┤    │         │
│  │ id (uuid) [PK]                            │    │         │
│  │ venue_id (uuid) [FK]                      │    │         │
│  │ organization_id (uuid) [FK]               │◄───┘         │
│  │ name (text)                               │              │
│  │ description (text)                        │              │
│  │ difficulty (enum)                         │              │
│  │ duration_minutes (int)                    │              │
│  │ max_players (int)                         │              │
│  │ price (decimal)                           │              │
│  │ status (enum)                             │              │
│  └───────────────────────────────────────────┘              │
│                    │                                         │
│                    │ 1:M                                     │
│  ┌─────────────────▼─────────────────────────┐              │
│  │            bookings                       │              │
│  ├───────────────────────────────────────────┤              │
│  │ id (uuid) [PK]                            │              │
│  │ organization_id (uuid) [FK]               │              │
│  │ venue_id (uuid) [FK]                      │              │
│  │ game_id (uuid) [FK]                       │              │
│  │ customer_id (uuid) [FK]                   │              │
│  │ booking_date (date)                       │              │
│  │ booking_time (time)                       │              │
│  │ status (enum)                             │              │
│  │ total_amount (decimal)                    │              │
│  │ confirmation_code (text) [UNIQUE]         │              │
│  └───────────────────────────────────────────┘              │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │            customers                      │               │
│  ├───────────────────────────────────────────┤              │
│  │ id (uuid) [PK]                            │              │
│  │ organization_id (uuid) [FK] [NULL]        │              │
│  │ email (text)                              │              │
│  │ name (text)                               │              │
│  │ phone (text)                              │              │
│  │ created_at (timestamptz)                  │              │
│  └───────────────────────────────────────────┘              │
│                                                              │
│  ┌──────────────────────────────────────────┐               │
│  │              staff                        │               │
│  ├───────────────────────────────────────────┤              │
│  │ id (uuid) [PK]                            │              │
│  │ organization_id (uuid) [FK]               │              │
│  │ venue_id (uuid) [FK] [NULL]               │              │
│  │ email (text)                              │              │
│  │ role (enum: admin, manager, staff)        │              │
│  │ permissions (text[])                      │              │
│  └───────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗂️ DETAILED ENTITY DESCRIPTIONS


### 1. Organizations (Tenants)

**Purpose:** Central tenant entity that isolates all data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique organization ID |
| name | text | NOT NULL | Organization name |
| slug | text | UNIQUE, NOT NULL | URL-safe identifier |
| plan_id | uuid | FK → plans.id | Current subscription plan |
| status | enum | NOT NULL, DEFAULT 'trial' | active, suspended, trial, cancelled |
| owner_email | text | NOT NULL | Primary contact email |
| owner_name | text | NOT NULL | Primary contact name |
| settings | jsonb | DEFAULT '{}' | Custom settings |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_status ON organizations(status);
CREATE INDEX idx_orgs_plan ON organizations(plan_id);
```

---

### 2. Venues

**Purpose:** Physical locations within an organization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique venue ID |
| organization_id | uuid | FK → organizations.id, NOT NULL | Owner organization |
| name | text | NOT NULL | Venue name |
| slug | text | NOT NULL | URL-safe identifier |
| address | text | | Street address |
| city | text | | City |
| state | text | | State/Province |
| country | text | DEFAULT 'US' | Country code |
| postal_code | text | | Postal/ZIP code |
| phone | text | | Contact phone |
| email | text | | Contact email |
| timezone | text | DEFAULT 'UTC' | Venue timezone |
| status | enum | DEFAULT 'active' | active, inactive, maintenance |
| settings | jsonb | DEFAULT '{}' | Venue-specific settings |
| created_by | uuid | FK → staff.id | Creator user ID |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_venues_org ON venues(organization_id);
CREATE INDEX idx_venues_slug ON venues(organization_id, slug);
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_city ON venues(city);
```

**Constraints:**
```sql
UNIQUE(organization_id, slug)
```

---

### 3. Games (Escape Rooms/Experiences)

**Purpose:** Bookable experiences/rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique game ID |
| organization_id | uuid | FK → organizations.id, NOT NULL | Owner organization |
| venue_id | uuid | FK → venues.id, NOT NULL | Venue location |
| name | text | NOT NULL | Game name |
| slug | text | NOT NULL | URL-safe identifier |
| description | text | | Full description |
| difficulty | enum | | easy, medium, hard, expert |
| duration_minutes | int | CHECK (duration_minutes > 0) | Expected duration |
| min_players | int | DEFAULT 2 | Minimum players |
| max_players | int | NOT NULL | Maximum players |
| price | decimal(10,2) | NOT NULL | Base price |
| status | enum | DEFAULT 'draft' | draft, active, inactive, archived |
| image_url | text | | Primary image |
| thumbnail_url | text | | Thumbnail image |
| tags | text[] | DEFAULT '{}' | Search tags |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_by | uuid | FK → staff.id | Creator user ID |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_games_org ON games(organization_id);
CREATE INDEX idx_games_venue ON games(venue_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_tags ON games USING GIN(tags);
```

---

### 4. Bookings

**Purpose:** Customer reservations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique booking ID |
| organization_id | uuid | FK → organizations.id, NOT NULL | Owner organization |
| venue_id | uuid | FK → venues.id, NOT NULL | Venue location |
| game_id | uuid | FK → games.id, NOT NULL | Booked game |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer |
| booking_date | date | NOT NULL | Booking date |
| booking_time | time | NOT NULL | Start time |
| end_time | time | NOT NULL | End time |
| players | int | CHECK (players > 0) | Number of players |
| status | enum | DEFAULT 'pending' | pending, confirmed, completed, cancelled, no-show |
| total_amount | decimal(10,2) | NOT NULL | Total price |
| deposit_amount | decimal(10,2) | DEFAULT 0 | Deposit paid |
| payment_status | enum | DEFAULT 'pending' | pending, paid, partial, refunded, failed |
| payment_method | text | | Payment method used |
| transaction_id | text | | Payment transaction ID |
| confirmation_code | text | UNIQUE, NOT NULL | 6-digit confirmation code |
| notes | text | | Customer notes |
| internal_notes | text | | Staff notes |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_by | uuid | | Creator (NULL for customer bookings) |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |
| cancelled_at | timestamptz | | Cancellation timestamp |
| cancelled_by | uuid | FK → staff.id | Canceller user ID |

**Indexes:**
```sql
CREATE INDEX idx_bookings_org ON bookings(organization_id);
CREATE INDEX idx_bookings_venue ON bookings(venue_id);
CREATE INDEX idx_bookings_game ON bookings(game_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_confirmation ON bookings(confirmation_code);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
```

---

### 5. Customers

**Purpose:** End users who book experiences

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique customer ID |
| organization_id | uuid | FK → organizations.id, NULL | Primary organization (NULL = platform-wide) |
| email | text | NOT NULL | Email address |
| name | text | NOT NULL | Full name |
| first_name | text | | First name |
| last_name | text | | Last name |
| phone | text | | Phone number |
| date_of_birth | date | | Birth date |
| preferences | jsonb | DEFAULT '{}' | Customer preferences |
| marketing_consent | boolean | DEFAULT false | Marketing emails allowed |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_at | timestamptz | DEFAULT now() | Registration date |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |
| last_booking_at | timestamptz | | Last booking date |

**Indexes:**
```sql
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_customers_phone ON customers(phone);
```

**Note:** Customers can be shared across organizations or organization-specific

---

### 6. Staff/Users

**Purpose:** Platform and organization users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique user ID |
| organization_id | uuid | FK → organizations.id, NULL | Organization (NULL = system admin) |
| venue_id | uuid | FK → venues.id, NULL | Assigned venue (NULL = all venues) |
| email | text | UNIQUE, NOT NULL | Email address |
| name | text | NOT NULL | Full name |
| role | enum | NOT NULL | system-admin, super-admin, admin, manager, staff, customer |
| permissions | text[] | DEFAULT '{}' | Specific permissions |
| status | enum | DEFAULT 'active' | active, inactive, suspended |
| avatar_url | text | | Profile picture |
| phone | text | | Phone number |
| timezone | text | DEFAULT 'UTC' | User timezone |
| last_login_at | timestamptz | | Last login timestamp |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_org ON staff(organization_id);
CREATE INDEX idx_staff_venue ON staff(venue_id);
CREATE INDEX idx_staff_role ON staff(role);
```

---

### 7. Payments

**Purpose:** Payment transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique payment ID |
| organization_id | uuid | FK → organizations.id, NOT NULL | Owner organization |
| booking_id | uuid | FK → bookings.id, NULL | Related booking |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer |
| amount | decimal(10,2) | NOT NULL | Payment amount |
| currency | text | DEFAULT 'USD' | Currency code |
| status | enum | NOT NULL | pending, completed, failed, refunded |
| payment_method | text | NOT NULL | card, cash, transfer, etc. |
| provider | text | | stripe, square, etc. |
| provider_payment_id | text | | External payment ID |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_at | timestamptz | DEFAULT now() | Payment timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_id ON payments(provider_payment_id);
```

---

### 8. Widgets (Booking Widgets)

**Purpose:** Embeddable booking widgets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v7() | Unique widget ID |
| organization_id | uuid | FK → organizations.id, NOT NULL | Owner organization |
| venue_id | uuid | FK → venues.id, NULL | Specific venue (NULL = all) |
| name | text | NOT NULL | Widget name |
| embed_key | text | UNIQUE, NOT NULL | Public embed key |
| status | enum | DEFAULT 'active' | active, inactive |
| config | jsonb | DEFAULT '{}' | Widget configuration |
| style | jsonb | DEFAULT '{}' | Custom styling |
| allowed_domains | text[] | DEFAULT '{}' | Whitelisted domains |
| analytics | jsonb | DEFAULT '{}' | Usage analytics |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_widgets_embed_key ON widgets(embed_key);
CREATE INDEX idx_widgets_org ON widgets(organization_id);
CREATE INDEX idx_widgets_venue ON widgets(venue_id);
```

---

## 🔗 RELATIONSHIPS MATRIX

| Relationship | Type | Foreign Key | Description |
|--------------|------|-------------|-------------|
| organizations → plans | M:1 | plan_id | Each org has one plan |
| venues → organizations | M:1 | organization_id | Venues belong to org |
| games → organizations | M:1 | organization_id | Games belong to org |
| games → venues | M:1 | venue_id | Games at specific venue |
| bookings → organizations | M:1 | organization_id | Bookings belong to org |
| bookings → venues | M:1 | venue_id | Bookings at venue |
| bookings → games | M:1 | game_id | Bookings for game |
| bookings → customers | M:1 | customer_id | Bookings by customer |
| customers → organizations | M:1 | organization_id | Customer primary org (nullable) |
| staff → organizations | M:1 | organization_id | Staff in org (nullable for system-admin) |
| staff → venues | M:1 | venue_id | Staff assigned to venue (nullable) |
| payments → organizations | M:1 | organization_id | Payments to org |
| payments → bookings | M:1 | booking_id | Payment for booking (nullable) |
| payments → customers | M:1 | customer_id | Payment by customer |
| widgets → organizations | M:1 | organization_id | Widgets for org |
| widgets → venues | M:1 | venue_id | Widgets for venue (nullable) |


---

## 🔒 ROW-LEVEL SECURITY (RLS) POLICIES

### Policy Strategy

**All tenant tables MUST have:**
1. RLS enabled
2. organization_id in every row (except system tables)
3. Policies that check organization_id
4. Separate policies for each role

### Organizations Table

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- System admins can see all orgs
CREATE POLICY "system_admin_all_orgs" ON organizations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'system-admin');

-- Organization admins see their own org
CREATE POLICY "org_admin_own_org" ON organizations
  FOR SELECT
  USING (id = (auth.jwt() ->> 'organization_id')::uuid);

-- Organization admins can update their own org
CREATE POLICY "org_admin_update_own" ON organizations
  FOR UPDATE
  USING (id = (auth.jwt() ->> 'organization_id')::uuid);
```

### Venues Table

```sql
-- Enable RLS
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- System admins can see all venues
CREATE POLICY "system_admin_all_venues" ON venues
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'system-admin');

-- Organization users see their org's venues
CREATE POLICY "org_users_own_venues" ON venues
  FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Admins can manage venues
CREATE POLICY "org_admins_manage_venues" ON venues
  FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super-admin')
  );

-- Staff can view their assigned venue
CREATE POLICY "staff_view_assigned_venue" ON venues
  FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND (
      (auth.jwt() ->> 'venue_id')::uuid IS NULL
      OR id = (auth.jwt() ->> 'venue_id')::uuid
    )
  );
```

### Games Table

```sql
-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- System admins can see all games
CREATE POLICY "system_admin_all_games" ON games
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'system-admin');

-- Organization users see their org's games
CREATE POLICY "org_users_own_games" ON games
  FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Admins and managers can manage games
CREATE POLICY "org_staff_manage_games" ON games
  FOR ALL
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super-admin', 'manager')
  );

-- Public can view active games (for booking widget)
CREATE POLICY "public_view_active_games" ON games
  FOR SELECT
  USING (status = 'active');
```

### Bookings Table

```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- System admins can see all bookings
CREATE POLICY "system_admin_all_bookings" ON bookings
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'system-admin');

-- Organization staff see their org's bookings
CREATE POLICY "org_staff_own_bookings" ON bookings
  FOR ALL
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

-- Customers see their own bookings
CREATE POLICY "customers_own_bookings" ON bookings
  FOR SELECT
  USING (customer_id = (auth.jwt() ->> 'user_id')::uuid);

-- Public can create bookings (via widget)
CREATE POLICY "public_create_bookings" ON bookings
  FOR INSERT
  WITH CHECK (true);
```

### Customers Table

```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- System admins can see all customers
CREATE POLICY "system_admin_all_customers" ON customers
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'system-admin');

-- Organization staff see their org's customers
CREATE POLICY "org_staff_own_customers" ON customers
  FOR SELECT
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    OR organization_id IS NULL
  );

-- Customers see their own profile
CREATE POLICY "customers_own_profile" ON customers
  FOR SELECT
  USING (id = (auth.jwt() ->> 'user_id')::uuid);
```

---

## 📝 TABLE NAMING CONVENTIONS

### Rules

1. **Plural nouns:** `organizations`, `venues`, `bookings`
2. **Snake_case:** `organization_id`, `created_at`
3. **Timestamps:** Always `created_at`, `updated_at`
4. **Foreign keys:** `{table}_id` (e.g., `organization_id`)
5. **Status fields:** Use enums with consistent values
6. **Soft deletes:** Use `deleted_at` (timestamptz NULL)

### Column Standards

| Purpose | Column Name | Type | Default |
|---------|-------------|------|---------|
| Primary Key | id | uuid | uuid_generate_v7() |
| Organization FK | organization_id | uuid | NOT NULL |
| Created timestamp | created_at | timestamptz | now() |
| Updated timestamp | updated_at | timestamptz | now() |
| Deleted timestamp | deleted_at | timestamptz | NULL |
| Created by user | created_by | uuid | NULL |
| Status | status | enum | depends on context |
| Settings/Config | settings | jsonb | '{}' |
| Additional data | metadata | jsonb | '{}' |

---

## 🛡️ PERMISSION & RBAC MATRIX

### Role Hierarchy

```
system-admin (Platform Owner)
    ↓
super-admin (Organization Owner)
    ↓
admin (Full operational access)
    ↓
manager (Limited management)
    ↓
staff (View + basic operations)
    ↓
customer (Own bookings only)
```

### Permissions Table

| Resource | System Admin | Super Admin | Admin | Manager | Staff | Customer |
|----------|--------------|-------------|-------|---------|-------|----------|
| **Organizations** |
| View All | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Venues** |
| View All | ✅ | ✅ | ✅ | ✅ | Own venue | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Games** |
| View All | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (active) |
| Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Bookings** |
| View All | ✅ | ✅ | ✅ | ✅ | ✅ | Own only |
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update | ✅ | ✅ | ✅ | ✅ | ✅ | Own only |
| Cancel | ✅ | ✅ | ✅ | ✅ | ✅ | Own only |
| **Customers** |
| View All | ✅ | ✅ | ✅ | ✅ | ✅ | Own only |
| Create | ✅ | ✅ | ✅ | ✅ | ✅ | Self-register |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | Own only |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Staff** |
| View All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Payments** |
| View All | ✅ | ✅ | ✅ | ✅ | ✅ | Own only |
| Process | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Refund | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Widgets** |
| View All | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📈 INDEXING PLAN

### Primary Indexes (Auto-created)

```sql
-- All tables
PRIMARY KEY (id)
```

### Foreign Key Indexes

```sql
-- Organizations
CREATE INDEX idx_orgs_plan_id ON organizations(plan_id);

-- Venues
CREATE INDEX idx_venues_org_id ON venues(organization_id);

-- Games
CREATE INDEX idx_games_org_id ON games(organization_id);
CREATE INDEX idx_games_venue_id ON games(venue_id);

-- Bookings
CREATE INDEX idx_bookings_org_id ON bookings(organization_id);
CREATE INDEX idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX idx_bookings_game_id ON bookings(game_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);

-- Customers
CREATE INDEX idx_customers_org_id ON customers(organization_id);

-- Staff
CREATE INDEX idx_staff_org_id ON staff(organization_id);
CREATE INDEX idx_staff_venue_id ON staff(venue_id);

-- Payments
CREATE INDEX idx_payments_org_id ON payments(organization_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);

-- Widgets
CREATE INDEX idx_widgets_org_id ON widgets(organization_id);
CREATE INDEX idx_widgets_venue_id ON widgets(venue_id);
```

### Query Optimization Indexes

```sql
-- Frequent queries
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_bookings_date_venue ON bookings(booking_date, venue_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);

-- Unique constraints
CREATE UNIQUE INDEX idx_orgs_slug ON organizations(slug);
CREATE UNIQUE INDEX idx_venues_org_slug ON venues(organization_id, slug);
CREATE UNIQUE INDEX idx_games_venue_slug ON games(venue_id, slug);
CREATE UNIQUE INDEX idx_bookings_confirmation ON bookings(confirmation_code);
CREATE UNIQUE INDEX idx_widgets_embed_key ON widgets(embed_key);
CREATE UNIQUE INDEX idx_staff_email ON staff(email);

-- Search indexes (GIN for arrays/jsonb)
CREATE INDEX idx_games_tags ON games USING GIN(tags);
CREATE INDEX idx_staff_permissions ON staff USING GIN(permissions);
```


---

## 📊 DATA LIFECYCLE PLAN

### Data Retention

| Data Type | Retention | Archive | Delete |
|-----------|-----------|---------|--------|
| Active bookings | Indefinite | After completion | Never (soft delete) |
| Completed bookings | 7 years | After 2 years | After 7 years |
| Cancelled bookings | 2 years | After 6 months | After 2 years |
| Customer data | While active | N/A | On request (GDPR) |
| Payment records | 7 years | After 2 years | Never (legal) |
| Audit logs | 2 years | After 6 months | After 2 years |
| Analytics data | 3 years | After 1 year | After 3 years |
| Staff records | While employed | After termination | After 7 years |

### Soft Delete Strategy

```sql
-- Add deleted_at to tables
ALTER TABLE bookings ADD COLUMN deleted_at timestamptz;
ALTER TABLE customers ADD COLUMN deleted_at timestamptz;
ALTER TABLE staff ADD COLUMN deleted_at timestamptz;

-- Update queries to exclude deleted
WHERE deleted_at IS NULL

-- Soft delete function
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ${TG_TABLE_NAME}
  SET deleted_at = now()
  WHERE id = OLD.id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Archival Process

```sql
-- Archive old bookings
CREATE TABLE bookings_archive (LIKE bookings INCLUDING ALL);

-- Archive function
CREATE OR REPLACE FUNCTION archive_old_bookings()
RETURNS void AS $$
BEGIN
  INSERT INTO bookings_archive
  SELECT * FROM bookings
  WHERE booking_date < now() - INTERVAL '2 years'
  AND status IN ('completed', 'cancelled');
  
  DELETE FROM bookings
  WHERE booking_date < now() - INTERVAL '2 years'
  AND status IN ('completed', 'cancelled');
END;
$$ LANGUAGE plpgsql;
```

---

## 🔍 SAMPLE QUERIES

### Read Queries

**1. Get all venues for an organization**
```sql
SELECT v.*, COUNT(g.id) as game_count
FROM venues v
LEFT JOIN games g ON g.venue_id = v.id AND g.status = 'active'
WHERE v.organization_id = :org_id
AND v.deleted_at IS NULL
GROUP BY v.id
ORDER BY v.name;
```

**2. Get bookings for a specific date and venue**
```sql
SELECT 
  b.*,
  g.name as game_name,
  c.name as customer_name,
  c.email as customer_email
FROM bookings b
JOIN games g ON g.id = b.game_id
JOIN customers c ON c.id = b.customer_id
WHERE b.venue_id = :venue_id
AND b.booking_date = :date
AND b.deleted_at IS NULL
ORDER BY b.booking_time;
```

**3. Get revenue by organization (for system admin)**
```sql
SELECT 
  o.id,
  o.name,
  COUNT(b.id) as total_bookings,
  SUM(b.total_amount) as total_revenue,
  SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_amount ELSE 0 END) as paid_revenue
FROM organizations o
LEFT JOIN bookings b ON b.organization_id = o.id
WHERE b.created_at >= :start_date
AND b.created_at <= :end_date
GROUP BY o.id, o.name
ORDER BY total_revenue DESC;
```

**4. Get available time slots for a game**
```sql
WITH time_slots AS (
  SELECT generate_series(
    :date::date + '09:00'::time,
    :date::date + '21:00'::time,
    :interval::interval
  ) AS slot_time
),
booked_slots AS (
  SELECT booking_time
  FROM bookings
  WHERE game_id = :game_id
  AND booking_date = :date
  AND status NOT IN ('cancelled', 'no-show')
)
SELECT ts.slot_time
FROM time_slots ts
LEFT JOIN booked_slots bs ON ts.slot_time = bs.booking_time
WHERE bs.booking_time IS NULL;
```

### Write Queries

**1. Create organization**
```sql
INSERT INTO organizations (
  name,
  slug,
  plan_id,
  owner_email,
  owner_name,
  status
) VALUES (
  :name,
  :slug,
  :plan_id,
  :owner_email,
  :owner_name,
  'trial'
)
RETURNING *;
```

**2. Create booking**
```sql
INSERT INTO bookings (
  organization_id,
  venue_id,
  game_id,
  customer_id,
  booking_date,
  booking_time,
  end_time,
  players,
  total_amount,
  confirmation_code,
  status
) VALUES (
  :org_id,
  :venue_id,
  :game_id,
  :customer_id,
  :booking_date,
  :booking_time,
  :end_time,
  :players,
  :total_amount,
  generate_confirmation_code(),
  'pending'
)
RETURNING *;
```

**3. Update booking status**
```sql
UPDATE bookings
SET 
  status = :new_status,
  updated_at = now()
WHERE id = :booking_id
AND organization_id = :org_id
RETURNING *;
```

**4. Soft delete customer**
```sql
UPDATE customers
SET deleted_at = now()
WHERE id = :customer_id
AND organization_id = :org_id
RETURNING *;
```

---

## 🏗️ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   System     │  │  Organization│  │   Booking    │      │
│  │   Admin      │  │   Dashboard  │  │   Widget     │      │
│  │   Portal     │  │              │  │  (Embedded)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │        Supabase Edge Functions                 │         │
│  ├────────────────────────────────────────────────┤         │
│  │  • Authentication & Authorization              │         │
│  │  • Business Logic                              │         │
│  │  • Data Validation                             │         │
│  │  • Multi-tenant Enforcement                    │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │           PostgreSQL (Supabase)                │         │
│  ├────────────────────────────────────────────────┤         │
│  │                                                │         │
│  │  [Platform]  system_admins                     │         │
│  │             feature_flags                      │         │
│  │             plans                              │         │
│  │                                                │         │
│  │  [Tenants]   organizations ─────┐             │         │
│  │                                  │             │         │
│  │              venues ◄────────────┤             │         │
│  │              games ◄─────────────┤             │         │
│  │              bookings ◄──────────┤             │         │
│  │              customers ◄─────────┤             │         │
│  │              staff ◄─────────────┤             │         │
│  │              payments ◄──────────┤             │         │
│  │              widgets ◄───────────┘             │         │
│  │                                                │         │
│  │  [RLS Enabled on all tenant tables]           │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                INTEGRATION LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Stripe  │  │  Email   │  │  SMS     │  │  Calendar│   │
│  │  Payment │  │  Service │  │  Service │  │  Sync    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 MIGRATION PLAN

### Phase 1: Foundation (Week 1)

**Goal:** Core multi-tenant structure

1. Create UUID v7 extension
2. Create enums
3. Create `plans` table
4. Create `organizations` table
5. Enable RLS on organizations
6. Create system admin users

```sql
-- 001_foundation.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid AS $$
BEGIN
  RETURN uuid_generate_v4(); -- Placeholder, use proper v7 implementation
END;
$$ LANGUAGE plpgsql;

-- Enums
CREATE TYPE organization_status AS ENUM ('active', 'suspended', 'trial', 'cancelled');
CREATE TYPE venue_status AS ENUM ('active', 'inactive', 'maintenance');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no-show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'refunded', 'failed');
CREATE TYPE user_role AS ENUM ('system-admin', 'super-admin', 'admin', 'manager', 'staff', 'customer');

-- Plans table
CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price decimal(10,2) NOT NULL,
  features jsonb DEFAULT '{}',
  limits jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan_id uuid REFERENCES plans(id),
  status organization_status DEFAULT 'trial',
  owner_email text NOT NULL,
  owner_name text NOT NULL,
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
```

### Phase 2: Core Entities (Week 2)

1. Create `venues` table
2. Create `games` table
3. Create `customers` table
4. Create `staff` table
5. Enable RLS on all tables

### Phase 3: Booking System (Week 3)

1. Create `bookings` table
2. Create `payments` table
3. Create booking functions (create, update, cancel)
4. Create availability functions
5. Enable RLS

### Phase 4: Widgets & Integrations (Week 4)

1. Create `widgets` table
2. Create widget embed system
3. Set up Stripe integration
4. Enable RLS

### Phase 5: Testing & Optimization (Week 5)

1. Add all indexes
2. Test RLS policies
3. Performance testing
4. Data migration (if applicable)

---

## ✅ VALIDATION RULES

### Organization Level

- Slug must be unique and URL-safe
- Email must be valid format
- Plan must exist
- Status must be valid enum

### Venue Level

- Must belong to valid organization
- Slug unique within organization
- Timezone must be valid IANA timezone
- Phone must be valid format (if provided)

### Game Level

- Must belong to valid venue
- Duration > 0
- max_players >= min_players
- Price >= 0
- Status must be valid enum

### Booking Level

- Must belong to valid organization, venue, game
- booking_date >= today
- players between game.min_players and game.max_players
- total_amount >= 0
- Confirmation code must be unique
- No overlapping bookings for same game/time

### Customer Level

- Email must be unique
- Phone must be valid format (if provided)
- Email must be valid format

### Payment Level

- Amount > 0
- Currency must be valid ISO code
- Status must be valid enum
- If booking_id provided, must be valid booking

---

## 🧪 TESTING CHECKLIST

### Unit Tests

- [ ] UUID v7 generation
- [ ] Confirmation code generation
- [ ] Email validation
- [ ] Phone validation
- [ ] Slug generation
- [ ] Timezone validation

### Integration Tests

- [ ] Create organization
- [ ] Create venue with organization_id
- [ ] Create game with venue_id
- [ ] Create booking with all FKs
- [ ] Update booking status
- [ ] Cancel booking
- [ ] Create payment
- [ ] Process refund

### RLS Tests

- [ ] System admin sees all organizations
- [ ] Org admin sees only own org
- [ ] Org admin cannot see other orgs
- [ ] Staff sees only assigned venue
- [ ] Customer sees only own bookings
- [ ] Public cannot access staff data

### Performance Tests

- [ ] 1000 concurrent bookings
- [ ] Query performance with 100k bookings
- [ ] Index usage verification
- [ ] RLS policy performance

### Security Tests

- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] JWT token validation
- [ ] RLS bypass attempts

---

## 📚 NEXT STEPS

1. **Review & Approve Architecture**
   - Stakeholder review
   - Technical review
   - Security review

2. **Create Detailed Migration Scripts**
   - Write SQL migrations
   - Test on staging
   - Create rollback scripts

3. **Implement Backend Functions**
   - Supabase Edge Functions
   - Business logic
   - Validation

4. **Update Frontend**
   - Update API calls
   - Add organization context
   - Test all flows

5. **Data Migration (if needed)**
   - Export existing data
   - Transform to new schema
   - Import and verify

6. **Testing**
   - Run all test suites
   - Performance testing
   - Security audit

7. **Deploy**
   - Deploy to staging
   - User acceptance testing
   - Deploy to production

---

## 📞 SUPPORT & DOCUMENTATION

- **Architecture Document:** This file
- **Migration Scripts:** `/supabase/migrations/`
- **API Documentation:** `/docs/API.md`
- **RLS Policies:** `/docs/RLS_POLICIES.md`
- **Testing Guide:** `/docs/TESTING.md`

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Status:** Ready for Review ✅

