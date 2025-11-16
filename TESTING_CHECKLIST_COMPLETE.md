# ✅ Complete Testing Checklist
## BookingTMS Multi-Tenant SaaS

**Version:** 1.0  
**Date:** November 16, 2025

---

## 🎯 TESTING STRATEGY

### Test Levels
1. **Unit Tests** - Individual functions and components
2. **Integration Tests** - API endpoints and database interactions
3. **RLS Tests** - Row-level security policy validation
4. **E2E Tests** - Complete user workflows
5. **Performance Tests** - Load and stress testing
6. **Security Tests** - Penetration and vulnerability testing

---

## 📋 COMPREHENSIVE TEST CHECKLIST

### ✅ **1. DATABASE SCHEMA TESTS**

#### 1.1 Table Structure
- [ ] All tables created successfully
- [ ] All columns have correct data types
- [ ] All primary keys are UUID type
- [ ] All foreign keys have correct references
- [ ] All check constraints are valid
- [ ] All default values are set correctly
- [ ] All indexes created successfully

#### 1.2 Tenant Isolation
- [ ] All tenant tables have `organization_id` column
- [ ] `organization_id` is NOT NULL on tenant tables
- [ ] `organization_id` has foreign key to organizations(id)
- [ ] `organization_id` has index for performance
- [ ] No cross-tenant foreign keys exist

#### 1.3 Data Integrity
- [ ] Foreign key constraints prevent orphaned records
- [ ] Cascade deletes work correctly
- [ ] Unique constraints enforced
- [ ] Check constraints validated
- [ ] Triggers execute correctly
- [ ] Default values applied

```sql
-- Test Script
DO $$
BEGIN
  -- Test 1: Verify all tenant tables have organization_id
  ASSERT (
    SELECT COUNT(*) = 0
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name IN ('bookings', 'games', 'venues', 'customers')
    AND column_name != 'organization_id'
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns c2
      WHERE c2.table_schema = table_schema
      AND c2.table_name = table_name
      AND c2.column_name = 'organization_id'
    )
  ), 'All tenant tables must have organization_id';
  
  RAISE NOTICE 'Schema tests passed';
END $$;
```

---

### ✅ **2. ROW-LEVEL SECURITY (RLS) TESTS**

#### 2.1 RLS Enabled
- [ ] RLS enabled on all tenant tables
- [ ] RLS enabled on organizations table
- [ ] RLS enabled on users table
- [ ] RLS policies exist for all tables
- [ ] Service role can bypass RLS when needed

#### 2.2 Platform Team Access
```sql
-- Test: Platform team can see all organizations
SET SESSION "request.jwt.claims.sub" = '<platform_team_user_id>';
SELECT COUNT(*) FROM organizations; -- Should see all

-- Test: Platform team can see all bookings across orgs
SELECT COUNT(DISTINCT organization_id) FROM bookings; -- Should be > 1

-- Result: ✅ Pass / ❌ Fail
```

#### 2.3 Organization User Access
```sql
-- Test: Org user can only see their org
SET SESSION "request.jwt.claims.sub" = '<org_a_user_id>';
SELECT COUNT(DISTINCT organization_id) FROM bookings; -- Should be 1
SELECT organization_id FROM bookings LIMIT 1; -- Should match user's org

-- Test: Org user cannot see other org's data
SELECT COUNT(*) FROM bookings 
WHERE organization_id != (
  SELECT organization_id FROM users WHERE id = auth.uid()
); -- Should be 0

-- Result: ✅ Pass / ❌ Fail
```

#### 2.4 Role-Based Access
```sql
-- Test: Staff can view but not delete bookings
SET SESSION "request.jwt.claims.sub" = '<staff_user_id>';
SELECT COUNT(*) FROM bookings; -- Should succeed
DELETE FROM bookings WHERE id = '<booking_id>'; -- Should fail

-- Test: Admin can delete bookings
SET SESSION "request.jwt.claims.sub" = '<admin_user_id>';
DELETE FROM bookings WHERE id = '<test_booking_id>'; -- Should succeed

-- Result: ✅ Pass / ❌ Fail
```

---

### ✅ **3. ROLE HIERARCHY TESTS**

#### 3.1 Platform Team Roles
- [ ] system-admin can access all platform features
- [ ] super-admin can access all platform features
- [ ] Platform team has `is_platform_team = true`
- [ ] Platform team has no `organization_id`
- [ ] Platform team can view all organizations
- [ ] Platform team can create organizations
- [ ] Platform team can manage all users

#### 3.2 Organization Owner (Admin)
- [ ] Admin can view only their organization
- [ ] Admin can create manager/staff users
- [ ] Admin can edit organization settings
- [ ] Admin can manage billing
- [ ] Admin CANNOT access system-admin dashboard
- [ ] Admin CANNOT access backend dashboard
- [ ] Admin CANNOT see other organizations

#### 3.3 Organization Staff
- [ ] Manager can view/edit bookings
- [ ] Manager CANNOT delete users
- [ ] Staff can view bookings
- [ ] Staff can create bookings
- [ ] Staff CANNOT edit organization settings

```typescript
// Test Script (Jest/Vitest)
describe('Role Hierarchy', () => {
  test('Platform team has platform access', async () => {
    const platformUser = await loginAs('system-admin');
    const orgs = await platformUser.getOrganizations();
    expect(orgs.length).toBeGreaterThan(1);
  });
  
  test('Admin has org access only', async () => {
    const adminUser = await loginAs('admin');
    const orgs = await adminUser.getOrganizations();
    expect(orgs.length).toBe(1);
    expect(orgs[0].id).toBe(adminUser.organizationId);
  });
  
  test('Admin cannot access system dashboard', async () => {
    const adminUser = await loginAs('admin');
    await expect(
      adminUser.accessSystemDashboard()
    ).rejects.toThrow('Forbidden');
  });
});
```

---

### ✅ **4. PLAN-BASED ACCESS TESTS**

#### 4.1 Plan Limits Enforcement
```sql
-- Test: Cannot exceed venue limit
-- Setup: Org on Basic plan (max 2 venues)
INSERT INTO venues (organization_id, name) VALUES ('<org_id>', 'Venue 3');
-- Expected: Should fail with limit exceeded error

-- Test: Cannot exceed staff limit
-- Setup: Org on Basic plan (max 3 staff)
INSERT INTO users (organization_id, role, email) VALUES ('<org_id>', 'staff', 'staff4@test.com');
-- Expected: Should fail with limit exceeded error

-- Test: Cannot exceed monthly booking limit
-- Setup: Org at booking limit for the month
INSERT INTO bookings (...) VALUES (...);
-- Expected: Should fail with limit exceeded error

-- Result: ✅ Pass / ❌ Fail
```

#### 4.2 Feature Access by Plan
```typescript
describe('Plan Features', () => {
  test('Basic plan cannot access AI agents', async () => {
    const basicOrgUser = await loginAs('admin', 'basic-org');
    const hasFeature = await basicOrgUser.hasFeature('ai_agents');
    expect(hasFeature).toBe(false);
  });
  
  test('Pro plan can access AI agents', async () => {
    const proOrgUser = await loginAs('admin', 'pro-org');
    const hasFeature = await proOrgUser.hasFeature('ai_agents');
    expect(hasFeature).toBe(true);
  });
  
  test('Growth plan can send email campaigns', async () => {
    const growthOrgUser = await loginAs('admin', 'growth-org');
    const canSend = await growthOrgUser.hasFeature('email_campaigns');
    expect(canSend).toBe(true);
  });
});
```

#### 4.3 Plan Upgrade/Downgrade
- [ ] Upgrading plan unlocks new features immediately
- [ ] Downgrading plan locks features immediately
- [ ] Usage counts reset correctly after plan change
- [ ] Subscription history recorded
- [ ] Stripe webhook processes correctly
- [ ] Billing updated in database

---

### ✅ **5. API ENDPOINT TESTS**

#### 5.1 Authentication & Authorization
```typescript
describe('API Authentication', () => {
  test('Requires valid JWT token', async () => {
    const response = await fetch('/api/bookings', {
      headers: {} // No Authorization header
    });
    expect(response.status).toBe(401);
  });
  
  test('Rejects expired token', async () => {
    const response = await fetch('/api/bookings', {
      headers: { Authorization: 'Bearer <expired_token>' }
    });
    expect(response.status).toBe(401);
  });
  
  test('Accepts valid token', async () => {
    const token = await getValidToken('admin');
    const response = await fetch('/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(response.status).not.toBe(401);
  });
});
```

#### 5.2 CRUD Operations
```typescript
describe('Bookings API', () => {
  test('GET /bookings returns org bookings only', async () => {
    const adminUser = await loginAs('admin', 'org-a');
    const bookings = await adminUser.getBookings();
    
    bookings.forEach(booking => {
      expect(booking.organization_id).toBe(adminUser.organizationId);
    });
  });
  
  test('POST /bookings creates booking in user org', async () => {
    const adminUser = await loginAs('admin', 'org-a');
    const booking = await adminUser.createBooking({
      customer_id: '<customer_id>',
      game_id: '<game_id>',
      // ... other fields
    });
    
    expect(booking.organization_id).toBe(adminUser.organizationId);
  });
  
  test('Cannot create booking in different org', async () => {
    const adminUser = await loginAs('admin', 'org-a');
    await expect(
      adminUser.createBooking({
        organization_id: '<org_b_id>', // Different org
        // ... other fields
      })
    ).rejects.toThrow();
  });
});
```

#### 5.3 Tenant Isolation in APIs
- [ ] GET requests filter by organization_id
- [ ] POST requests auto-assign organization_id
- [ ] PUT requests validate organization_id
- [ ] DELETE requests check organization ownership
- [ ] Cannot modify other organization's data
- [ ] Cannot access other organization's resources

---

### ✅ **6. FRONTEND TESTS**

#### 6.1 Navigation & Routing
```typescript
describe('Navigation - Platform Team', () => {
  test('System admin sees system dashboard link', async () => {
    await loginAs('system-admin');
    const sidebar = await screen.findByRole('navigation');
    expect(sidebar).toHaveTextContent('System Admin');
    expect(sidebar).toHaveTextContent('Backend Dashboard');
  });
  
  test('Super admin sees system dashboard link', async () => {
    await loginAs('super-admin');
    const sidebar = await screen.findByRole('navigation');
    expect(sidebar).toHaveTextContent('System Admin');
  });
});

describe('Navigation - Organization Owner', () => {
  test('Admin does NOT see system dashboard link', async () => {
    await loginAs('admin');
    const sidebar = await screen.findByRole('navigation');
    expect(sidebar).not.toHaveTextContent('System Admin');
    expect(sidebar).not.toHaveTextContent('Backend Dashboard');
  });
  
  test('Admin sees billing link', async () => {
    await loginAs('admin');
    const sidebar = await screen.findByRole('navigation');
    expect(sidebar).toHaveTextContent('Billing');
  });
});
```

#### 6.2 Component Rendering
- [ ] Dashboard shows correct stats for user's org
- [ ] Bookings list shows only user's org bookings
- [ ] Games list shows only user's org games
- [ ] Users list shows only user's org users
- [ ] Plan features display correctly
- [ ] Upgrade prompts show for locked features
- [ ] Usage limits display correctly

#### 6.3 Feature Gates
```typescript
describe('Feature Gates', () => {
  test('AI Agents locked for Basic plan', async () => {
    await loginAs('admin', 'basic-org');
    await navigate('/ai-agents');
    expect(screen.getByText(/Upgrade to Pro/)).toBeInTheDocument();
  });
  
  test('AI Agents accessible for Pro plan', async () => {
    await loginAs('admin', 'pro-org');
    await navigate('/ai-agents');
    expect(screen.getByText(/AI Agent Settings/)).toBeInTheDocument();
  });
});
```

---

### ✅ **7. PERFORMANCE TESTS**

#### 7.1 Query Performance
```sql
-- Test: Booking list query performance
EXPLAIN ANALYZE
SELECT * FROM bookings 
WHERE organization_id = '<org_id>'
ORDER BY booking_date DESC
LIMIT 100;
-- Expected: < 50ms with proper indexes

-- Test: Dashboard stats performance
EXPLAIN ANALYZE
SELECT COUNT(*) FROM bookings WHERE organization_id = '<org_id>';
-- Expected: < 10ms with index

-- Result: Execution time: ___ ms
```

#### 7.2 Load Testing
```bash
# Use tool like Apache Bench or k6
ab -n 1000 -c 10 -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/bookings

# Expected:
# - Requests per second: > 100
# - Average response time: < 100ms
# - No failed requests
```

#### 7.3 Concurrent User Testing
- [ ] 100 concurrent users can query bookings
- [ ] Database connection pool handles load
- [ ] RLS doesn't cause performance degradation
- [ ] Indexes optimize multi-tenant queries
- [ ] No deadlocks under concurrent writes

---

### ✅ **8. SECURITY TESTS**

#### 8.1 SQL Injection
```typescript
test('Prevents SQL injection in search', async () => {
  const maliciousInput = "'; DROP TABLE bookings; --";
  const response = await fetch(`/api/bookings?search=${maliciousInput}`);
  // Should not execute SQL, should sanitize input
  expect(response.status).toBe(200);
  
  // Verify table still exists
  const bookings = await fetch('/api/bookings');
  expect(bookings.status).toBe(200);
});
```

#### 8.2 Authorization Bypass Attempts
```typescript
test('Cannot access other org via ID manipulation', async () => {
  const orgAUser = await loginAs('admin', 'org-a');
  
  // Attempt to access org B's booking
  await expect(
    orgAUser.getBooking('<org_b_booking_id>')
  ).rejects.toThrow('Not found'); // RLS blocks access
});

test('Cannot escalate role via API', async () => {
  const staffUser = await loginAs('staff');
  
  await expect(
    staffUser.updateUser(staffUser.id, { role: 'admin' })
  ).rejects.toThrow('Forbidden');
});
```

#### 8.3 Data Leakage
- [ ] User details don't leak across tenants
- [ ] Error messages don't expose sensitive data
- [ ] API responses don't include other org data
- [ ] Logs don't contain sensitive information
- [ ] JWT tokens expire correctly

---

### ✅ **9. STRIPE INTEGRATION TESTS**

#### 9.1 Customer Creation
- [ ] Stripe customer created on org creation
- [ ] stripe_customer_id stored in database
- [ ] Customer metadata includes org_id
- [ ] Duplicate customers not created

#### 9.2 Subscription Flow
- [ ] Subscription created successfully
- [ ] stripe_subscription_id stored
- [ ] subscription_status updated
- [ ] Plan features activated immediately
- [ ] Usage limits updated

#### 9.3 Webhooks
```typescript
describe('Stripe Webhooks', () => {
  test('payment_succeeded webhook updates status', async () => {
    const webhook = await sendStripeWebhook('payment_succeeded', {
      subscription_id: '<sub_id>',
      customer_id: '<cust_id>'
    });
    
    const org = await getOrganization('<org_id>');
    expect(org.subscription_status).toBe('active');
  });
  
  test('payment_failed webhook suspends account', async () => {
    const webhook = await sendStripeWebhook('payment_failed', {
      subscription_id: '<sub_id>'
    });
    
    const org = await getOrganization('<org_id>');
    expect(org.subscription_status).toBe('past_due');
  });
});
```

---

### ✅ **10. DATA MIGRATION TESTS**

#### 10.1 Pre-Migration Validation
- [ ] Backup created successfully
- [ ] Current data integrity verified
- [ ] All constraints satisfied
- [ ] No orphaned records
- [ ] User count matches expectations

#### 10.2 Migration Execution
- [ ] All migrations run without errors
- [ ] New columns added successfully
- [ ] Data transformed correctly
- [ ] Constraints applied successfully
- [ ] Indexes created

#### 10.3 Post-Migration Validation
- [ ] Row counts match pre-migration
- [ ] All relationships intact
- [ ] RLS policies functional
- [ ] No data loss
- [ ] Application functions correctly

```sql
-- Validation script
SELECT 
  'Pre-migration user count' as check_name,
  COUNT(*) as count
FROM users_backup
UNION ALL
SELECT 
  'Post-migration user count',
  COUNT(*)
FROM users;
-- Counts should match
```

---

## 📊 TEST COVERAGE GOALS

| Category | Target Coverage | Status |
|----------|----------------|--------|
| Database Schema | 100% | ⏳ |
| RLS Policies | 100% | ⏳ |
| API Endpoints | 90% | ⏳ |
| Frontend Components | 80% | ⏳ |
| Integration Tests | 85% | ⏳ |
| E2E Workflows | 70% | ⏳ |

---

## 🎯 CRITICAL PATH TESTS (Must Pass Before Production)

### Pre-Deployment Checklist
- [ ] All RLS policies tested and passing
- [ ] Platform team can access all features
- [ ] Organization owners isolated to their org
- [ ] No cross-tenant data leakage
- [ ] Plan limits enforced correctly
- [ ] Stripe integration functional
- [ ] Performance benchmarks met
- [ ] Security tests passed
- [ ] Data migration successful
- [ ] Rollback plan tested

### Sign-Off Requirements
- [ ] Database Architect approval
- [ ] Backend Engineer approval
- [ ] Security Team approval
- [ ] QA Team approval
- [ ] Product Owner approval

---

**All tests must pass before deploying to production!**

**Test Environment:** Staging database with production-like data  
**Test Duration:** Estimated 2-3 days for full test suite  
**Automation:** CI/CD pipeline runs tests on every commit
