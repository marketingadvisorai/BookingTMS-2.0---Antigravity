# 🚀 Complete Migration Plan
## From Current System to Multi-Tenant Architecture

**Version:** 1.0  
**Date:** November 16, 2025  
**Estimated Duration:** 6 weeks  
**Risk Level:** Medium (requires careful data migration)

---

## 📋 MIGRATION OVERVIEW

### Current State
- ✅ Database with 4 roles: super-admin, admin, manager, staff
- ✅ Basic multi-tenant structure with organization_id
- ✅ RLS policies on core tables
- ✅ 32 UI pages working
- ✅ Stripe integration started

### Target State
- ✅ 5 roles: system-admin, super-admin, admin, manager, staff
- ✅ Platform team separated from organization owners
- ✅ Plan-based feature access
- ✅ Complete tenant isolation
- ✅ Usage tracking and limits

---

## 🎯 MIGRATION PHASES

### **PHASE 1: Database Schema Updates** (Week 1)

#### 1.1 Add Missing Enum Values
```sql
-- Migration: 024_add_system_admin_role.sql

-- Add system-admin to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'system-admin';

-- Verify
SELECT unnest(enum_range(NULL::user_role));
-- Expected: system-admin, super-admin, admin, manager, staff
```

#### 1.2 Create Platform Team Table
```sql
-- Create platform_team table
CREATE TABLE platform_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL CHECK (role IN ('system-admin', 'super-admin')),
  department VARCHAR(100),
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_team_user ON platform_team(user_id);
CREATE INDEX idx_platform_team_role ON platform_team(role);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_team_updated_at
  BEFORE UPDATE ON platform_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE platform_team ENABLE ROW LEVEL SECURITY;

-- Only service role can manage platform team
CREATE POLICY "service_role_platform_team"
  ON platform_team FOR ALL
  USING (auth.role() = 'service_role');
```

#### 1.3 Add Platform Team Flag to Users
```sql
-- Add is_platform_team column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_platform_team BOOLEAN DEFAULT false;

-- Create index
CREATE INDEX idx_users_is_platform_team ON users(is_platform_team);

-- Add constraints
ALTER TABLE users ADD CONSTRAINT check_platform_team_role
  CHECK (
    (is_platform_team = true AND role IN ('system-admin', 'super-admin'))
    OR
    (is_platform_team = false AND role IN ('admin', 'manager', 'staff'))
  );

ALTER TABLE users ADD CONSTRAINT check_org_users_have_org
  CHECK (
    (is_platform_team = true AND organization_id IS NULL)
    OR
    (is_platform_team = false AND organization_id IS NOT NULL)
  );
```

#### 1.4 Create Plans Table
```sql
-- Migration: 025_create_plans_table.sql

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  
  -- Limits (NULL = unlimited)
  max_venues INT,
  max_staff INT,
  max_bookings_per_month INT,
  max_widgets INT,
  
  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{
    "booking_widgets": true,
    "custom_styling": "none",
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
  
  -- Display
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);
CREATE INDEX idx_plans_features ON plans USING GIN(features);

-- Trigger
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default plans
INSERT INTO plans (name, slug, price_monthly, max_venues, max_staff, max_bookings_per_month, features) VALUES
('Basic', 'basic', 99.00, 2, 3, 200, '{
  "booking_widgets": true,
  "custom_styling": "basic",
  "email_campaigns": false
}'::jsonb),
('Growth', 'growth', 299.00, 5, 10, 1000, '{
  "booking_widgets": true,
  "custom_styling": "advanced",
  "email_campaigns": true,
  "sms_campaigns": true,
  "automation": true,
  "custom_branding": true
}'::jsonb),
('Pro', 'pro', 599.00, NULL, NULL, NULL, '{
  "booking_widgets": true,
  "custom_styling": "advanced",
  "email_campaigns": true,
  "sms_campaigns": true,
  "automation": true,
  "custom_branding": true,
  "ai_agents": true,
  "advanced_analytics": true,
  "custom_reporting": true,
  "api_access": true,
  "webhooks": true
}'::jsonb);
```

#### 1.5 Update Organizations Table
```sql
-- Migration: 026_update_organizations_for_plans.sql

-- Add plan_id and usage tracking
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Usage tracking
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_venues_count INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_staff_count INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_bookings_this_month INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_usage_reset_at DATE DEFAULT CURRENT_DATE;

-- Branding
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#4f46e5';

-- Suspension
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES platform_team(user_id);

-- Indexes
CREATE INDEX idx_org_plan ON organizations(plan_id);
CREATE INDEX idx_org_owner ON organizations(owner_id);
CREATE INDEX idx_org_status ON organizations(subscription_status);

-- Set default plan for existing orgs
UPDATE organizations 
SET plan_id = (SELECT id FROM plans WHERE slug = 'basic' LIMIT 1)
WHERE plan_id IS NULL;

-- Make plan_id required going forward
ALTER TABLE organizations ALTER COLUMN plan_id SET NOT NULL;
```

#### 1.6 Create Usage Tracking Tables
```sql
-- Migration: 027_create_usage_tracking.sql

CREATE TABLE organization_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Counts
  venues_count INT DEFAULT 0,
  staff_count INT DEFAULT 0,
  bookings_count INT DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  has_exceeded_limits BOOLEAN DEFAULT false,
  exceeded_limits_details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, period_start)
);

CREATE INDEX idx_org_usage_org ON organization_usage(organization_id);
CREATE INDEX idx_org_usage_period ON organization_usage(period_start, period_end);

CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  old_plan_id UUID REFERENCES plans(id),
  new_plan_id UUID REFERENCES plans(id),
  change_type VARCHAR(50) NOT NULL,
  
  stripe_event_id VARCHAR(255),
  amount_paid DECIMAL(10,2),
  effective_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_sub_history_org ON subscription_history(organization_id);
CREATE INDEX idx_sub_history_date ON subscription_history(effective_date DESC);

-- Enable RLS
ALTER TABLE organization_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Platform team can see all
CREATE POLICY "platform_team_all_usage"
  ON organization_usage FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

CREATE POLICY "platform_team_all_sub_history"
  ON subscription_history FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

-- Org admins can see their own
CREATE POLICY "org_users_own_usage"
  ON organization_usage FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org_users_own_sub_history"
  ON subscription_history FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
```

---

### **PHASE 2: Update RLS Policies** (Week 2)

#### 2.1 Update Organizations Policies
```sql
-- Migration: 028_update_rls_policies.sql

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can update organizations" ON organizations;

-- Create new policies

-- Platform team can manage all organizations
CREATE POLICY "platform_team_all_organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_platform_team = true
    )
  );

-- Org users can view their organization
CREATE POLICY "org_users_view_own_org"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND is_platform_team = false
    )
  );

-- Only org admins can update their organization
CREATE POLICY "org_admins_update_own_org"
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

#### 2.2 Update Users Policies
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Super admins can manage users" ON users;

-- Platform team can manage all users
CREATE POLICY "platform_team_all_users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.is_platform_team = true
    )
  );

-- Org users can view users in their org
CREATE POLICY "org_users_view_own_org_users"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND is_platform_team = false
    )
  );

-- Org admins can create users in their org
CREATE POLICY "org_admins_create_users"
  ON users FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_platform_team = false
    )
    AND role IN ('manager', 'staff') -- admins can only create lower roles
  );

-- Org admins can update users in their org
CREATE POLICY "org_admins_update_users"
  ON users FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_platform_team = false
    )
    AND role IN ('manager', 'staff') -- can't update other admins
  );

-- Org admins can delete users in their org
CREATE POLICY "org_admins_delete_users"
  ON users FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_platform_team = false
    )
    AND role IN ('manager', 'staff')
  );
```

#### 2.3 Apply Same Pattern to All Tenant Tables
```sql
-- Template for all tenant tables:
-- 1. Platform team: FOR ALL USING (is_platform_team check)
-- 2. Org users: FOR SELECT USING (organization_id match)
-- 3. Role-specific: FOR INSERT/UPDATE/DELETE based on permissions

-- Apply to: bookings, games, venues, customers, payments, etc.
```

---

### **PHASE 3: Data Migration** (Week 3)

#### 3.1 Identify Platform Team Members
```sql
-- Manual step: Identify which current users are platform team

-- Example migration script
DO $$
DECLARE
  platform_user_id UUID;
BEGIN
  -- Update specific users to platform team
  UPDATE users SET 
    is_platform_team = true,
    role = 'system-admin',
    organization_id = NULL
  WHERE email IN (
    'admin@bookingtms.com',
    'support@bookingtms.com'
    -- Add your platform team emails
  )
  RETURNING id INTO platform_user_id;
  
  -- Create platform_team records
  INSERT INTO platform_team (user_id, role, department)
  SELECT id, role, 'engineering'
  FROM users
  WHERE is_platform_team = true
  ON CONFLICT (user_id) DO NOTHING;
END $$;
```

#### 3.2 Convert Super-Admins to Admins
```sql
-- Current super-admins who are org owners → convert to admin
UPDATE users
SET role = 'admin'
WHERE role = 'super-admin'
AND is_platform_team = false;

-- Set them as organization owners
UPDATE organizations o
SET owner_id = u.id
FROM users u
WHERE u.organization_id = o.id
AND u.role = 'admin'
AND o.owner_id IS NULL;
```

#### 3.3 Initialize Usage Counters
```sql
-- Count current resources per organization
UPDATE organizations o
SET 
  current_venues_count = (SELECT COUNT(*) FROM venues WHERE organization_id = o.id),
  current_staff_count = (SELECT COUNT(*) FROM users WHERE organization_id = o.id),
  current_bookings_this_month = (
    SELECT COUNT(*) FROM bookings 
    WHERE organization_id = o.id 
    AND booking_date >= DATE_TRUNC('month', CURRENT_DATE)
  );
```

---

### **PHASE 4: Testing & Validation** (Week 4)

#### 4.1 Test Checklist

```bash
# 1. Platform Team Access
✓ Can system-admin view all organizations?
✓ Can super-admin create organizations?
✓ Can platform team access System Admin Dashboard?
✓ Can platform team access Backend Dashboard?

# 2. Organization Owner Access
✓ Can admin view only their organization?
✓ Can admin create manager/staff users?
✓ Can admin manage venues, games, bookings?
✗ Can admin access other organizations? (should fail)
✗ Can admin access System Admin Dashboard? (should fail)

# 3. Role Permissions
✓ Can manager edit bookings?
✓ Can staff view bookings?
✗ Can staff delete bookings? (should fail)
✗ Can manager create other users? (should fail)

# 4. Tenant Isolation
✓ Query bookings as org A user → only see org A bookings
✓ Query bookings as org B user → only see org B bookings
✗ Cross-tenant foreign keys work? (should fail)

# 5. Plan Limits
✓ Organization at venue limit → can't create more
✓ Organization at staff limit → can't add more
✓ Organization upgrades plan → limits increase
```

#### 4.2 Sample Test Queries

```sql
-- Test 1: Tenant isolation on bookings
SET SESSION "request.jwt.claims.sub" = '<org_a_user_id>';
SELECT COUNT(*) FROM bookings; -- Should only see org A bookings

SET SESSION "request.jwt.claims.sub" = '<org_b_user_id>';
SELECT COUNT(*) FROM bookings; -- Should only see org B bookings

-- Test 2: Platform team sees all
SET SESSION "request.jwt.claims.sub" = '<platform_team_user_id>';
SELECT COUNT(DISTINCT organization_id) FROM bookings; -- Should see all orgs

-- Test 3: Cross-tenant FK prevention
INSERT INTO bookings (organization_id, customer_id, ...)
VALUES ('<org_a_id>', '<org_b_customer_id>', ...); -- Should FAIL

-- Test 4: Role-based access
SET SESSION "request.jwt.claims.sub" = '<staff_user_id>';
DELETE FROM bookings WHERE id = '...'; -- Should FAIL (no permission)

SET SESSION "request.jwt.claims.sub" = '<admin_user_id>';
DELETE FROM bookings WHERE id = '...'; -- Should SUCCEED
```

---

### **PHASE 5: Frontend Updates** (Week 5)

#### 5.1 Update Auth Context
```typescript
// src/lib/auth/AuthContext.tsx

// Add platform team check
const isPlatformTeam = (): boolean => {
  return currentUser?.is_platform_team === true;
};

// Update role check
const isRole = (role: UserRole | UserRole[]): boolean => {
  if (!currentUser) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(currentUser.role);
};

// Add to context
const value: AuthContextType = {
  // ... existing
  isPlatformTeam,
  canAccessPlatform: () => isPlatformTeam() && isRole(['system-admin', 'super-admin']),
};
```

#### 5.2 Update Sidebar Menu
```typescript
// src/components/layout/Sidebar.tsx

// Platform team menus
if (isPlatformTeam() && isRole(['system-admin', 'super-admin'])) {
  navItems.push({
    id: 'system-admin',
    label: 'System Admin',
    icon: Crown,
    permission: 'system.view'
  });
  navItems.push({
    id: 'backend-dashboard',
    label: 'Backend Dashboard',
    icon: Server,
    permission: 'backend.view'
  });
}

// Organization owner menus
if (isRole('admin') && !isPlatformTeam()) {
  navItems.push({
    id: 'staff-management',
    label: 'Staff',
    icon: Users,
    permission: 'staff.view'
  });
  navItems.push({
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    permission: 'billing.view'
  });
}
```

---

### **PHASE 6: Deployment** (Week 6)

#### 6.1 Pre-Deployment Checklist
- [ ] All migrations tested on staging
- [ ] Data migration scripts verified
- [ ] RLS policies tested thoroughly
- [ ] Frontend changes tested
- [ ] Rollback plan prepared
- [ ] Database backup created
- [ ] Maintenance window scheduled
- [ ] Team notification sent

#### 6.2 Deployment Steps
```bash
# 1. Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migrations in order
supabase migration up --file 024_add_system_admin_role.sql
supabase migration up --file 025_create_plans_table.sql
supabase migration up --file 026_update_organizations_for_plans.sql
supabase migration up --file 027_create_usage_tracking.sql
supabase migration up --file 028_update_rls_policies.sql

# 3. Run data migration script
psql $DATABASE_URL < data_migration.sql

# 4. Verify data
psql $DATABASE_URL -c "SELECT role, is_platform_team, COUNT(*) FROM users GROUP BY role, is_platform_team;"

# 5. Deploy frontend
git push production main

# 6. Monitor logs
tail -f /var/log/app.log
```

---

## 🔄 ROLLBACK PLAN

If critical issues arise:

```sql
-- Rollback migrations (in reverse order)
supabase migration down --file 028_update_rls_policies.sql
supabase migration down --file 027_create_usage_tracking.sql
-- ... etc

-- Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

---

## ✅ POST-MIGRATION VALIDATION

```sql
-- 1. Verify all platform team members
SELECT * FROM users WHERE is_platform_team = true;
SELECT * FROM platform_team;

-- 2. Verify all orgs have plans
SELECT COUNT(*) FROM organizations WHERE plan_id IS NULL; -- Should be 0

-- 3. Verify all orgs have owners
SELECT COUNT(*) FROM organizations WHERE owner_id IS NULL; -- Should be minimal

-- 4. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'users', 'bookings');
-- All should have rowsecurity = true

-- 5. Check for orphaned records
SELECT COUNT(*) FROM users WHERE organization_id IS NOT NULL 
AND organization_id NOT IN (SELECT id FROM organizations);
-- Should be 0
```

---

**Estimated Total Time:** 6 weeks  
**Risk Mitigation:** Staged deployment, comprehensive testing, rollback plan  
**Success Criteria:** All tests pass, no data loss, tenant isolation verified
