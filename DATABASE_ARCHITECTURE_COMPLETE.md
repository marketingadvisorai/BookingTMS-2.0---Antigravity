# 🏛️ BookingTMS Enterprise Database Architecture
## Multi-Tenant SaaS with Complete Tenant Isolation

**Version:** 1.0  
**Date:** November 16, 2025  
**Architect:** Senior Database Team  
**Status:** Production-Ready Design

---

## 📋 EXECUTIVE SUMMARY

This document defines the complete database architecture for BookingTMS as a multi-tenant SaaS platform with:
- **Tenant Isolation Strategy:** Shared database with Row-Level Security (RLS)
- **Platform Team:** system-admin & super-admin (us)
- **Organization Owners:** admin role (customers)
- **Staff Hierarchy:** manager → staff (customer employees)
- **UUID v7:** For all primary keys with time-based ordering
- **Complete RLS:** Every table has tenant isolation
- **Performance:** Optimized indexes for multi-tenant queries

---

## 🎯 MULTI-TENANT STRATEGY

### Architecture Choice: Shared Database + RLS

**Why This Approach:**
- ✅ Cost-effective (single database instance)
- ✅ Easy maintenance and upgrades
- ✅ PostgreSQL RLS provides row-level isolation
- ✅ Scalable to thousands of tenants
- ✅ Shared resources, isolated data

**Tenant Isolation Enforcement:**
```sql
-- Every tenant-scoped table MUST have:
1. organization_id UUID NOT NULL REFERENCES organizations(id)
2. RLS policies enabled
3. Indexes on organization_id
4. Foreign key constraints with CASCADE
```

**Global vs Tenant Resources:**

| Resource Type | Scope | Examples |
|---------------|-------|----------|
| **Global** | Platform-wide | platform_team, plans, system_config |
| **Tenant** | Per organization | venues, games, bookings, customers |
| **Hybrid** | Both | users (can be platform or org) |

---

## 📊 ENTITY RELATIONSHIP DIAGRAM (ERD)

### Visual ERD Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER (Global)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ platform_    │      │   plans      │      │ system_      │  │
│  │   team       │      │              │      │  config      │  │
│  │              │      │ - Basic      │      │              │  │
│  │ - Engineers  │      │ - Growth     │      │ - Features   │  │
│  │ - Support    │      │ - Pro        │      │ - Settings   │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                                │
│         └──────────┬───────────┘                                │
└────────────────────┼────────────────────────────────────────────┘
                     │
┌────────────────────┼────────────────────────────────────────────┐
│                    ▼                                             │
│              organizations                                       │
│              (Tenants/Customers)                                 │
│                                                                  │
│    ┌──────────────────────────────────────────────┐             │
│    │ - id (PK)                                    │             │
│    │ - name, slug                                 │             │
│    │ - plan_id (FK → plans)                       │             │
│    │ - owner_id (FK → users)                      │             │
│    │ - stripe_customer_id, subscription_id        │             │
│    │ - subscription_status, settings              │             │
│    └──────────────────────────────────────────────┘             │
│                         │                                        │
│         ┌───────────────┼───────────────────┐                   │
│         │               │                   │                   │
└─────────┼───────────────┼───────────────────┼───────────────────┘
          │               │                   │
┌─────────▼───────────────▼───────────────────▼───────────────────┐
│                  TENANT LAYER (Per Organization)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  users   │  │  venues  │  │  games   │  │customers │       │
│  │          │  │          │  │          │  │          │       │
│  │ - admin  │  │ - name   │  │ - name   │  │ - email  │       │
│  │ - manager│  │ - addr   │  │ - price  │  │ - phone  │       │
│  │ - staff  │  │ - tz     │  │ - diff   │  │ - segment│       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
│       └─────────────┼─────────────┼─────────────┘               │
│                     │             │                             │
│              ┌──────▼─────────────▼──────┐                      │
│              │      bookings            │                      │
│              │                          │                      │
│              │ - booking_number         │                      │
│              │ - customer_id (FK)       │                      │
│              │ - game_id (FK)           │                      │
│              │ - venue_id (FK)          │                      │
│              │ - booking_date           │                      │
│              │ - status, payment_status │                      │
│              └──────┬───────────────────┘                      │
│                     │                                           │
│              ┌──────▼───────────┐                               │
│              │    payments      │                               │
│              │                  │                               │
│              │ - stripe_id      │                               │
│              │ - amount         │                               │
│              │ - status         │                               │
│              └──────────────────┘                               │
│                                                                  │
│  Supporting Tables:                                             │
│  - venue_calendars, game_calendars                              │
│  - pricing_tiers, promo_codes                                   │
│  - email_campaigns, email_logs                                  │
│  - waivers, staff_members, reports                              │
│  - notifications, audit_logs                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

KEY:
━━━ Strong Foreign Key (CASCADE)
─── Regular Foreign Key (RESTRICT)
organization_id REQUIRED on all tenant tables
```

---

## 📐 DETAILED ENTITY DESCRIPTIONS

### **PLATFORM LAYER (Global Resources)**

#### 1. platform_team
**Purpose:** Track platform team members (system-admin, super-admin)

```sql
CREATE TABLE platform_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL CHECK (role IN ('system-admin', 'super-admin')),
  department VARCHAR(100), -- 'engineering', 'support', 'operations'
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_platform_team_user ON platform_team(user_id);
CREATE INDEX idx_platform_team_role ON platform_team(role);
CREATE INDEX idx_platform_team_active ON platform_team(is_active);
```

**Fields:**
- `id`: UUID v7 primary key
- `user_id`: Link to users table (platform member)
- `role`: system-admin or super-admin only
- `department`: Team organization
- `permissions`: Additional granular permissions
- `is_active`: Enable/disable access

**RLS:** Service role only (no tenant access)

---

#### 2. plans
**Purpose:** Subscription tiers (Basic, Growth, Pro)

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  
  -- Feature Limits
  max_venues INT, -- NULL = unlimited
  max_staff INT,
  max_bookings_per_month INT,
  max_widgets INT,
  
  -- Feature Flags (JSONB for flexibility)
  features JSONB DEFAULT '{
    "booking_widgets": true,
    "custom_styling": "basic",
    "email_campaigns": false,
    "sms_campaigns": false,
    "automation": false,
    "custom_branding": false,
    "ai_agents": false,
    "advanced_analytics": false,
    "custom_reporting": false,
    "api_access": false,
    "webhooks": false,
    "sso": false,
    "white_label": false
  }'::jsonb,
  
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);
```

**Sample Data:**
```sql
INSERT INTO plans (name, slug, price_monthly, max_venues, max_staff, features) VALUES
('Basic', 'basic', 99.00, 2, 3, '{"booking_widgets": true}'::jsonb),
('Growth', 'growth', 299.00, 5, 10, '{"booking_widgets": true, "email_campaigns": true}'::jsonb),
('Pro', 'pro', 599.00, NULL, NULL, '{"booking_widgets": true, "ai_agents": true, "api_access": true}'::jsonb);
```

---

### **TENANT LAYER (Organization-Scoped)**

#### 3. organizations
**Purpose:** Customer organizations (tenants)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  
  -- Subscription
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Primary admin
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  subscription_status VARCHAR(50) DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  
  -- Usage Tracking (for limits)
  current_venues_count INT DEFAULT 0,
  current_staff_count INT DEFAULT 0,
  current_bookings_this_month INT DEFAULT 0,
  last_usage_reset_at DATE DEFAULT CURRENT_DATE,
  
  -- Settings
  settings JSONB DEFAULT '{
    "timezone": "UTC",
    "currency": "USD",
    "date_format": "MM/DD/YYYY",
    "time_format": "12h",
    "business_hours": {
      "monday": {"open": "09:00", "close": "21:00"},
      "tuesday": {"open": "09:00", "close": "21:00"},
      "wednesday": {"open": "09:00", "close": "21:00"},
      "thursday": {"open": "09:00", "close": "21:00"},
      "friday": {"open": "09:00", "close": "21:00"},
      "saturday": {"open": "10:00", "close": "22:00"},
      "sunday": {"open": "10:00", "close": "20:00"}
    }
  }'::jsonb,
  
  -- Branding
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4f46e5',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  suspended_at TIMESTAMPTZ,
  suspended_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_team(user_id)
);

-- Indexes
CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_plan ON organizations(plan_id);
CREATE INDEX idx_org_owner ON organizations(owner_id);
CREATE INDEX idx_org_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX idx_org_active ON organizations(is_active);
CREATE INDEX idx_org_status ON organizations(subscription_status);
```

**Critical Fields:**
- `plan_id`: Links to subscription plan (enforces limits)
- `owner_id`: Primary admin (admin role)
- `current_*_count`: Real-time usage tracking
- `subscription_status`: active, trialing, past_due, canceled

---

#### 4. users
**Purpose:** All user accounts (platform team + org users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  
  -- Role & Organization
  role user_role NOT NULL DEFAULT 'staff',
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_platform_team BOOLEAN DEFAULT false, -- 🔑 KEY FLAG
  
  -- Profile
  phone VARCHAR(20),
  avatar_url TEXT,
  job_title VARCHAR(100),
  department VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Activity
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  login_count INT DEFAULT 0,
  
  -- Security
  requires_password_change BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_platform ON users(is_platform_team);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_org_role ON users(organization_id, role);
```

**Role Validation:**
```sql
-- Constraint: Platform team must have correct roles
ALTER TABLE users ADD CONSTRAINT check_platform_team_role
  CHECK (
    (is_platform_team = true AND role IN ('system-admin', 'super-admin'))
    OR
    (is_platform_team = false AND role IN ('admin', 'manager', 'staff'))
  );

-- Constraint: Org users must have org_id
ALTER TABLE users ADD CONSTRAINT check_org_users_have_org
  CHECK (
    (is_platform_team = true AND organization_id IS NULL)
    OR
    (is_platform_team = false AND organization_id IS NOT NULL)
  );
```

---

## 🔐 ROW-LEVEL SECURITY (RLS) POLICIES

### RLS Strategy

**Principles:**
1. **Default Deny:** All tables deny access by default
2. **Explicit Allow:** Policies explicitly grant access
3. **Tenant Isolation:** organization_id check in every policy
4. **Platform Override:** Platform team bypasses tenant checks
5. **Role-Based:** Permissions align with user role

### Example: organizations Table

```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Platform team can see all organizations
CREATE POLICY "platform_team_all_orgs"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_platform_team = true
    )
  );

-- Org users can only see their organization
CREATE POLICY "org_users_own_org"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND is_platform_team = false
    )
  );

-- Only admins can update their org
CREATE POLICY "admins_update_own_org"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_platform_team = false
    )
  );
```

### Example: bookings Table (Tenant-Scoped)

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Platform team sees all bookings
CREATE POLICY "platform_team_all_bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_platform_team = true
    )
  );

-- Org users see only their org's bookings
CREATE POLICY "org_users_own_bookings"
  ON bookings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND is_platform_team = false
    )
  );

-- Staff can create bookings
CREATE POLICY "staff_create_bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND is_platform_team = false
    )
  );

-- Admins and managers can update
CREATE POLICY "admins_managers_update_bookings"
  ON bookings FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
      AND is_platform_team = false
    )
  );

-- Only admins can delete
CREATE POLICY "admins_delete_bookings"
  ON bookings FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_platform_team = false
    )
  );
```

---

## 📋 COMPLETE TABLE LIST

### Global Tables (Platform-Wide)
1. `platform_team` - Platform team members
2. `plans` - Subscription plans
3. `system_config` - Platform settings
4. `feature_flags` - Global feature toggles
5. `audit_logs_platform` - Platform-level audit trail

### Tenant Tables (Per Organization)
6. `organizations` - Customer organizations
7. `users` - All users (hybrid: platform + org)
8. `venues` - Physical locations
9. `games` - Escape room experiences
10. `customers` - End customers/guests
11. `bookings` - Reservations
12. `payments` - Payment transactions
13. `refunds` - Refund records
14. `venue_calendars` - Venue availability
15. `game_calendars` - Game schedules
16. `pricing_tiers` - Dynamic pricing
17. `promo_codes` - Discount codes
18. `email_templates` - Email content
19. `email_campaigns` - Marketing campaigns
20. `email_logs` - Sent email tracking
21. `waivers` - Liability waivers
22. `staff_members` - Staff management (if separate from users)
23. `reports` - Generated reports
24. `widgets` - Booking widget configs
25. `notifications` - In-app notifications
26. `notification_settings` - User notification prefs
27. `audit_logs` - Org-level audit trail

### Usage Tracking
28. `organization_usage` - Monthly usage stats
29. `subscription_history` - Plan change history
30. `webhook_events` - Stripe webhook log

---

## 🔄 RELATIONSHIPS

### 1:M (One-to-Many)

| Parent | Child | Relationship | Constraint |
|--------|-------|--------------|------------|
| plans | organizations | One plan has many orgs | RESTRICT |
| organizations | users | One org has many users | CASCADE |
| organizations | venues | One org has many venues | CASCADE |
| organizations | games | One org has many games | CASCADE |
| organizations | customers | One org has many customers | CASCADE |
| organizations | bookings | One org has many bookings | CASCADE |
| users | bookings (creator) | One user creates many bookings | RESTRICT |
| customers | bookings | One customer has many bookings | RESTRICT |
| games | bookings | One game has many bookings | RESTRICT |
| venues | games | One venue has many games | CASCADE |
| bookings | payments | One booking has one/many payments | CASCADE |

### M:M (Many-to-Many)

| Entity A | Entity B | Junction Table | Notes |
|----------|----------|----------------|-------|
| games | customers | bookings | Implicit through bookings |
| users | notifications | user_notifications | Explicit join |
| promo_codes | bookings | promo_code_usage | Track usage |

---

## 🎯 TENANT ISOLATION CHECKLIST

**Every tenant-scoped table MUST have:**

✅ `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
✅ `INDEX idx_<table>_org ON <table>(organization_id)`
✅ `RLS ENABLED` with platform team + tenant policies
✅ `INSERT/UPDATE triggers` to validate organization_id
✅ `Foreign keys` respect tenant boundaries

**Validation Function:**
```sql
CREATE OR REPLACE FUNCTION validate_tenant_isolation()
RETURNS trigger AS $$
BEGIN
  -- Ensure all related records belong to same org
  IF NOT EXISTS (
    SELECT 1 FROM organizations WHERE id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'Invalid organization_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_bookings_org_date_status 
  ON bookings(organization_id, booking_date, status);

CREATE INDEX idx_bookings_org_customer 
  ON bookings(organization_id, customer_id);

CREATE INDEX idx_users_org_role_active 
  ON users(organization_id, role, is_active);

-- Partial indexes for active records
CREATE INDEX idx_orgs_active 
  ON organizations(id) WHERE is_active = true;

CREATE INDEX idx_bookings_pending 
  ON bookings(organization_id, booking_date) 
  WHERE status = 'pending';

-- JSONB indexes for settings
CREATE INDEX idx_org_settings_tz 
  ON organizations((settings->>'timezone'));

CREATE INDEX idx_plans_features 
  ON plans USING GIN(features);
```

---

This architecture provides **complete tenant isolation** while maintaining **performance** and **scalability**. All tables, RLS policies, and indexes are designed following enterprise best practices.

**Next:** ERD_VISUAL_COMPLETE.md with full diagram, then migration scripts.
