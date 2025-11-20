# 🚀 Stripe Connect Implementation Plan
## Step-by-Step Database Implementation

**Date:** November 16, 2025  
**Branch:** `system-admin-implementation-0.1`  
**Status:** 🟢 Ready to Execute

---

## 📋 PRE-IMPLEMENTATION CHECKLIST

### Environment Verification
- [x] Git status clean
- [x] On correct branch: `system-admin-implementation-0.1`
- [ ] Supabase project connected
- [ ] Database backup created
- [ ] Local Supabase running (optional for testing)

### Files Ready
- [x] Migration 026 created: `026_stripe_connect_architecture.sql`
- [x] Architecture documentation complete
- [x] Revenue model designed
- [x] Security architecture planned

---

## 🎯 IMPLEMENTATION STRATEGY

### Approach: Safe & Incremental

```
1. Validate current database state
2. Create backup point
3. Apply migration in sections
4. Verify each section
5. Test RLS policies
6. Validate data integrity
7. Document completion
```

### Rollback Plan
- Every section can be rolled back independently
- Backup created before execution
- Migration uses IF NOT EXISTS and IF EXISTS
- Safe to re-run

---

## 📊 MIGRATION SECTIONS

### **Section 1: Organizations Table** (5 min)
**What:** Update organizations for Stripe Connect
**Risk:** Low - additive changes only
**Rollback:** Simple - just drop new columns

Changes:
- Remove old API key fields
- Add Stripe Connect fields
- Add revenue tracking fields
- Add indexes and constraints

**Validation:**
```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND column_name LIKE 'stripe_%';

-- Verify constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'organizations';
```

---

### **Section 2: Customers Table** (3 min)
**What:** Fix unique constraint bug
**Risk:** Medium - changes constraint
**Rollback:** Restore old constraint

Changes:
- Drop global unique on stripe_customer_id
- Add compound unique (org_id, stripe_customer_id)
- Add Connect-specific fields

**Validation:**
```sql
-- Verify new constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'customers'
AND constraint_name = 'customers_org_stripe_customer_unique';

-- Test constraint works
-- Should succeed:
INSERT INTO customers (organization_id, email, full_name, stripe_customer_id)
VALUES ('org-1-id', 'test@example.com', 'Test', 'cus_test1');

-- Should fail (duplicate within same org):
INSERT INTO customers (organization_id, email, full_name, stripe_customer_id)
VALUES ('org-1-id', 'test2@example.com', 'Test2', 'cus_test1');

-- Should succeed (same customer_id, different org):
INSERT INTO customers (organization_id, email, full_name, stripe_customer_id)
VALUES ('org-2-id', 'test3@example.com', 'Test3', 'cus_test1');
```

---

### **Section 3: Payments Table** (5 min)
**What:** Add organization_id and Connect fields
**Risk:** High - requires data migration
**Rollback:** Complex - need to preserve data

Changes:
- Add organization_id from bookings
- Add Stripe Connect fields
- Update RLS policies

**Validation:**
```sql
-- Check organization_id populated
SELECT COUNT(*) as total,
       COUNT(organization_id) as with_org_id
FROM payments;

-- Should be equal
-- Verify new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name IN ('organization_id', 'application_fee_amount', 'platform_earning');
```

---

### **Section 4: Platform Revenue Table** (3 min)
**What:** Create new tracking table
**Risk:** Low - new table only
**Rollback:** Simple - drop table

Changes:
- Create platform_revenue table
- Add indexes
- Enable RLS

**Validation:**
```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'platform_revenue';

-- Check RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'platform_revenue';

-- Test insert
INSERT INTO platform_revenue (
  organization_id, revenue_type, amount, description
) VALUES (
  'test-org-id', 'application_fee', 0.75, 'Test fee'
);
```

---

### **Section 5: Webhook Events Table** (2 min)
**What:** Add organization tracking
**Risk:** Low - additive only
**Rollback:** Simple - drop columns

Changes:
- Add organization_id
- Add processing fields
- Add indexes

**Validation:**
```sql
-- Verify new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'stripe_webhook_events' 
AND column_name IN ('organization_id', 'processing_error', 'retry_count');
```

---

### **Section 6: Helper Functions** (3 min)
**What:** Create calculation and tracking functions
**Risk:** Low - new functions only
**Rollback:** Simple - drop functions

Changes:
- calculate_application_fee()
- update_organization_payment_stats()
- track_platform_revenue()
- Create triggers

**Validation:**
```sql
-- Test application fee calculation
SELECT calculate_application_fee('test-org-id', 100.00);
-- Should return 0.75

-- Verify triggers exist
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('payments', 'platform_revenue');
```

---

### **Section 7: RLS Policies** (2 min)
**What:** Update security policies
**Risk:** Medium - affects access control
**Rollback:** Restore old policies

Changes:
- Update payments RLS
- Add platform_revenue RLS

**Validation:**
```sql
-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename IN ('payments', 'platform_revenue', 'organizations');

-- Test as org user (should see own data only)
-- Test as platform team (should see all data)
```

---

### **Section 8: Analytics Views** (2 min)
**What:** Create reporting views
**Risk:** Low - views only
**Rollback:** Simple - drop views

Changes:
- organization_revenue_summary
- platform_revenue_summary

**Validation:**
```sql
-- Check views exist
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_name IN ('organization_revenue_summary', 'platform_revenue_summary');

-- Test query
SELECT * FROM organization_revenue_summary LIMIT 5;
SELECT * FROM platform_revenue_summary LIMIT 5;
```

---

## 🔧 EXECUTION COMMANDS

### Step 1: Connect to Supabase
```bash
# If using local Supabase
supabase db reset --local

# Or connect to remote project
supabase link --project-ref <your-project-ref>
```

### Step 2: Create Backup
```bash
# Export current schema
supabase db dump --local > backup_before_026.sql

# Or for remote
supabase db dump > backup_before_026.sql
```

### Step 3: Apply Migration
```bash
# Test locally first (RECOMMENDED)
supabase db push --local

# If successful, apply to remote
supabase db push
```

### Alternative: Manual Application
```bash
# Apply migration file directly
psql -h <host> -p <port> -U <user> -d <database> -f supabase/migrations/026_stripe_connect_architecture.sql
```

---

## ✅ POST-MIGRATION VERIFICATION

### 1. Schema Verification
```sql
-- Count of new columns added
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('organizations', 'customers', 'payments', 'platform_revenue', 'stripe_webhook_events')
GROUP BY table_name;
```

### 2. Data Integrity Check
```sql
-- Check no NULL organization_ids in payments
SELECT COUNT(*) FROM payments WHERE organization_id IS NULL;
-- Should be 0

-- Check constraints working
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'CHECK'
AND table_name IN ('organizations', 'platform_revenue');
```

### 3. RLS Verification
```sql
-- Verify RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('payments', 'platform_revenue')
AND schemaname = 'public';
```

### 4. Function Testing
```sql
-- Test helper functions
SELECT calculate_application_fee(
  (SELECT id FROM organizations LIMIT 1),
  100.00
);

-- Verify triggers active
SELECT count(*) FROM pg_trigger
WHERE tgname IN (
  'update_org_stats_on_payment',
  'track_revenue_on_payment'
);
```

### 5. Performance Check
```sql
-- Check indexes created
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('organizations', 'customers', 'payments', 'platform_revenue')
AND indexname LIKE '%stripe%';
```

---

## 📈 SUCCESS CRITERIA

- [ ] All 8 sections applied successfully
- [ ] No NULL organization_ids in payments
- [ ] Unique constraints working correctly
- [ ] RLS policies active on all tables
- [ ] Helper functions operational
- [ ] Triggers firing correctly
- [ ] Views returning data
- [ ] Indexes created
- [ ] No migration errors

---

## 🚨 TROUBLESHOOTING

### Issue: Migration fails on customers constraint
**Cause:** Existing duplicate stripe_customer_id across orgs
**Fix:**
```sql
-- Find duplicates
SELECT stripe_customer_id, COUNT(*)
FROM customers
WHERE stripe_customer_id IS NOT NULL
GROUP BY stripe_customer_id
HAVING COUNT(*) > 1;

-- Manually resolve duplicates before migration
```

### Issue: Payments missing organization_id
**Cause:** Orphaned payments without bookings
**Fix:**
```sql
-- Find orphaned payments
SELECT * FROM payments 
WHERE booking_id NOT IN (SELECT id FROM bookings);

-- Option 1: Delete orphaned (if test data)
DELETE FROM payments 
WHERE booking_id NOT IN (SELECT id FROM bookings);

-- Option 2: Assign to default org (if production)
UPDATE payments 
SET organization_id = '<default-org-id>'
WHERE organization_id IS NULL;
```

### Issue: Function creation fails
**Cause:** Language not installed
**Fix:**
```sql
CREATE EXTENSION IF NOT EXISTS plpgsql;
```

---

## 📝 COMPLETION LOG

```
Date: __________
Executed by: __________
Duration: __________ minutes

Section Status:
[ ] 1. Organizations Table
[ ] 2. Customers Table
[ ] 3. Payments Table
[ ] 4. Platform Revenue Table
[ ] 5. Webhook Events Table
[ ] 6. Helper Functions
[ ] 7. RLS Policies
[ ] 8. Analytics Views

Notes:
_________________________________
_________________________________
_________________________________

Sign-off: __________
```

---

## 🎯 NEXT STEPS AFTER DATABASE

1. **Edge Functions Implementation** (Phase 2)
   - create-account.ts
   - create-account-link.ts
   - get-account-status.ts
   - create-checkout.ts (updated)
   - stripe-webhook.ts (updated)

2. **Environment Variables**
   - STRIPE_SECRET_KEY (platform account)
   - STRIPE_WEBHOOK_SECRET (platform webhook)
   - STRIPE_PUBLISHABLE_KEY (for frontend)

3. **Admin UI Development**
   - Settings > Payments page
   - Connection status component
   - Onboarding flow
   - Revenue dashboard

4. **Testing**
   - Onboarding flow test
   - Payment processing test
   - Application fee verification
   - Multi-organization test

---

**Ready to execute? Let's start with Section 1! 🚀**
