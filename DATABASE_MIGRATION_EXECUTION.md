# 🚀 Database Migration Execution Guide
## Stripe Connect - Migration 026

**Bismillah - In the Name of God**

**Date:** November 16, 2025  
**Migration:** `026_stripe_connect_architecture.sql`  
**Status:** Ready to Execute

---

## 📋 EXECUTION OPTIONS

### **Option 1: Supabase Dashboard (RECOMMENDED)**
✅ Safest for beginners  
✅ Visual feedback  
✅ Easy rollback  
✅ No CLI needed

### **Option 2: Supabase CLI**
✅ Automated  
✅ Version controlled  
✅ Requires Docker for local testing

### **Option 3: Direct SQL**
⚠️ Advanced users only  
⚠️ Manual execution  
⚠️ Be careful with production

---

## 🎯 OPTION 1: SUPABASE DASHBOARD (START HERE)

### **Step 1: Access SQL Editor**

1. Go to https://supabase.com/dashboard
2. Select your project: **BookingTMS**
3. Click **SQL Editor** in left sidebar
4. Click **New query**

### **Step 2: Create Backup First**

```sql
-- Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_nov16_2025;

-- Backup critical tables
CREATE TABLE backup_nov16_2025.organizations AS SELECT * FROM organizations;
CREATE TABLE backup_nov16_2025.customers AS SELECT * FROM customers;
CREATE TABLE backup_nov16_2025.payments AS SELECT * FROM payments;
CREATE TABLE backup_nov16_2025.bookings AS SELECT * FROM bookings;

-- Verify backup
SELECT 
  'organizations' as table_name, COUNT(*) as row_count FROM backup_nov16_2025.organizations
UNION ALL
SELECT 'customers', COUNT(*) FROM backup_nov16_2025.customers
UNION ALL
SELECT 'payments', COUNT(*) FROM backup_nov16_2025.payments
UNION ALL
SELECT 'bookings', COUNT(*) FROM backup_nov16_2025.bookings;
```

✅ **Run this first** and verify all tables backed up successfully.

---

### **Step 3: Execute Migration (Section by Section)**

#### **SECTION 1: Organizations Table** (5 min)

Copy and paste this into SQL Editor:

```sql
-- =====================================================
-- SECTION 1: Organizations Table
-- =====================================================

-- Remove old fields
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_publishable_key;
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_secret_key_vault_id;
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_webhook_secret;

-- Add Stripe Connect fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255) UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_onboarding_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_created_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS application_fee_percentage DECIMAL(5,2) DEFAULT 0.75;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_volume_processed DECIMAL(12,2) DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_application_fees_earned DECIMAL(10,2) DEFAULT 0;

-- Add constraints
ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS chk_application_fee_percentage 
  CHECK (application_fee_percentage >= 0 AND application_fee_percentage <= 100);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_org_stripe_account ON organizations(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_org_stripe_charges_enabled ON organizations(stripe_charges_enabled);

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND column_name LIKE 'stripe_%'
ORDER BY column_name;
```

**Expected Result:** Should show all new stripe_* columns

✅ **Verify:** Check output shows stripe_account_id, stripe_charges_enabled, etc.

---

#### **SECTION 2: Customers Table** (3 min)

```sql
-- =====================================================
-- SECTION 2: Customers Table - FIX CRITICAL BUG
-- =====================================================

-- Drop global unique constraint
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_stripe_customer_id_key;

-- Add compound unique per organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_org_stripe_customer_unique'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_org_stripe_customer_unique 
      UNIQUE(organization_id, stripe_customer_id);
  END IF;
END $$;

-- Add Connect fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_via VARCHAR(50) DEFAULT 'api';

-- Add index
CREATE INDEX IF NOT EXISTS idx_customers_org_stripe ON customers(organization_id, stripe_customer_id);

-- Verify constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'customers'
AND constraint_name = 'customers_org_stripe_customer_unique';
```

**Expected Result:** Should show customers_org_stripe_customer_unique constraint

✅ **Verify:** Constraint exists and is type UNIQUE

---

#### **SECTION 3: Payments Table** (5 min) ⚠️ **IMPORTANT**

```sql
-- =====================================================
-- SECTION 3: Payments Table - ADD ORGANIZATION_ID
-- =====================================================

-- Check current state
SELECT 
  COUNT(*) as total_payments,
  COUNT(organization_id) as payments_with_org_id,
  COUNT(*) - COUNT(organization_id) as missing_org_id
FROM payments;

-- Add organization_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'organization_id'
  ) THEN
    -- Add column as nullable first
    ALTER TABLE payments ADD COLUMN organization_id UUID;
    
    -- Populate from bookings
    UPDATE payments p
    SET organization_id = b.organization_id
    FROM bookings b
    WHERE p.booking_id = b.id AND p.organization_id IS NULL;
    
    -- Make NOT NULL
    ALTER TABLE payments ALTER COLUMN organization_id SET NOT NULL;
    
    -- Add FK
    ALTER TABLE payments ADD CONSTRAINT fk_payments_organization 
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add Stripe Connect fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS application_fee_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_earning DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS net_to_merchant DECIMAL(10,2);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_account ON payments(stripe_account_id);

-- Verify all payments have organization_id
SELECT 
  COUNT(*) as total_payments,
  COUNT(organization_id) as with_org_id,
  CASE 
    WHEN COUNT(*) = COUNT(organization_id) THEN '✅ ALL GOOD'
    ELSE '❌ MISSING DATA'
  END as status
FROM payments;
```

**Expected Result:** Status should be '✅ ALL GOOD'

✅ **Critical Check:** All payments must have organization_id!

---

#### **SECTION 4: Platform Revenue Table** (3 min)

```sql
-- =====================================================
-- SECTION 4: Platform Revenue Table - NEW
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  revenue_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  stripe_account_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  stripe_application_fee_id VARCHAR(255),
  
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_revenue_type CHECK (revenue_type IN ('application_fee', 'referral_fee', 'subscription', 'usage_fee', 'addon_fee')),
  CONSTRAINT chk_amount_positive CHECK (amount >= 0)
);

-- Add indexes
CREATE INDEX idx_platform_revenue_org ON platform_revenue(organization_id);
CREATE INDEX idx_platform_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX idx_platform_revenue_earned_at ON platform_revenue(earned_at);

-- Enable RLS
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;

-- Add policy for platform team
CREATE POLICY "platform_team_all_revenue"
  ON platform_revenue FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

-- Verify table created
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'platform_revenue';
```

**Expected Result:** Shows platform_revenue table

✅ **Verify:** Table exists and RLS is enabled

---

#### **SECTION 5: Helper Functions** (3 min)

```sql
-- =====================================================
-- SECTION 5: Helper Functions
-- =====================================================

-- Function to calculate application fee
CREATE OR REPLACE FUNCTION calculate_application_fee(
  p_organization_id UUID,
  p_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_fee_percentage DECIMAL;
  v_total_fee DECIMAL;
BEGIN
  SELECT application_fee_percentage
  INTO v_fee_percentage
  FROM organizations
  WHERE id = p_organization_id;
  
  v_total_fee := p_amount * v_fee_percentage / 100;
  RETURN ROUND(v_total_fee, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update org stats
CREATE OR REPLACE FUNCTION update_organization_payment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    UPDATE organizations
    SET 
      total_volume_processed = COALESCE(total_volume_processed, 0) + NEW.amount,
      total_application_fees_earned = COALESCE(total_application_fees_earned, 0) + COALESCE(NEW.application_fee_amount, 0)
    WHERE id = NEW.organization_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_org_stats_on_payment ON payments;
CREATE TRIGGER update_org_stats_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_payment_stats();

-- Test function
SELECT calculate_application_fee(
  (SELECT id FROM organizations LIMIT 1),
  100.00
) as test_fee;
```

**Expected Result:** Should return 0.75 (0.75% of $100)

✅ **Verify:** Test function returns correct value

---

#### **SECTION 6: Update RLS Policies** (2 min)

```sql
-- =====================================================
-- SECTION 6: RLS Policies
-- =====================================================

-- Drop old policies if exist
DROP POLICY IF EXISTS "org_users_view_payments" ON payments;
DROP POLICY IF EXISTS "platform_team_all_payments" ON payments;

-- Create new policies with organization_id
CREATE POLICY "org_users_view_payments"
  ON payments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "platform_team_all_payments"
  ON payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true)
  );

-- Verify policies
SELECT schemaname, tablename, policyname, permissive
FROM pg_policies
WHERE tablename IN ('payments', 'platform_revenue')
ORDER BY tablename, policyname;
```

**Expected Result:** Shows policies for payments and platform_revenue

✅ **Verify:** Both tables have RLS policies

---

#### **SECTION 7: Analytics Views** (2 min)

```sql
-- =====================================================
-- SECTION 7: Analytics Views
-- =====================================================

-- Organization revenue summary
CREATE OR REPLACE VIEW organization_revenue_summary AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.stripe_account_id,
  o.stripe_charges_enabled,
  o.application_fee_percentage,
  o.total_volume_processed,
  o.total_application_fees_earned,
  COUNT(DISTINCT p.id) as total_payments,
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as total_revenue,
  AVG(CASE WHEN p.status = 'paid' THEN p.amount ELSE NULL END) as average_transaction
FROM organizations o
LEFT JOIN payments p ON p.organization_id = o.id
GROUP BY o.id, o.name, o.stripe_account_id, o.stripe_charges_enabled, 
         o.application_fee_percentage, o.total_volume_processed, o.total_application_fees_earned;

-- Platform revenue summary
CREATE OR REPLACE VIEW platform_revenue_summary AS
SELECT 
  DATE_TRUNC('month', earned_at) as month,
  revenue_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount
FROM platform_revenue
GROUP BY DATE_TRUNC('month', earned_at), revenue_type
ORDER BY month DESC, revenue_type;

-- Test views
SELECT * FROM organization_revenue_summary LIMIT 5;
SELECT * FROM platform_revenue_summary LIMIT 5;
```

**Expected Result:** Views return data (may be empty if no organizations yet)

✅ **Verify:** No errors returned

---

### **Step 4: Final Verification**

```sql
-- =====================================================
-- FINAL VERIFICATION CHECKLIST
-- =====================================================

-- 1. Check all new columns exist
SELECT 
  table_name,
  COUNT(*) as new_columns
FROM information_schema.columns
WHERE table_name IN ('organizations', 'customers', 'payments')
AND column_name LIKE 'stripe_%'
GROUP BY table_name
ORDER BY table_name;

-- 2. Verify organization_id in payments
SELECT 
  COUNT(*) as total,
  COUNT(organization_id) as with_org,
  CASE 
    WHEN COUNT(*) = COUNT(organization_id) THEN '✅ SUCCESS'
    ELSE '❌ FAILED'
  END as status
FROM payments;

-- 3. Check new table
SELECT COUNT(*) as platform_revenue_exists
FROM information_schema.tables
WHERE table_name = 'platform_revenue';

-- 4. Verify functions
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('calculate_application_fee', 'update_organization_payment_stats')
ORDER BY routine_name;

-- 5. Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('update_org_stats_on_payment')
ORDER BY trigger_name;

-- 6. Verify RLS policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('payments', 'platform_revenue')
GROUP BY tablename;

-- 7. Test views
SELECT 'organization_revenue_summary' as view_name, COUNT(*) as exists
FROM information_schema.views
WHERE table_name = 'organization_revenue_summary'
UNION ALL
SELECT 'platform_revenue_summary', COUNT(*)
FROM information_schema.views
WHERE table_name = 'platform_revenue_summary';
```

---

## ✅ SUCCESS CRITERIA

All checks should return:
- ✅ Organizations has stripe_* columns
- ✅ Customers has org-stripe unique constraint
- ✅ Payments has organization_id (all rows)
- ✅ Platform_revenue table exists
- ✅ Functions created
- ✅ Triggers active
- ✅ RLS policies exist
- ✅ Views created

---

## 📊 MIGRATION COMPLETE SUMMARY

If all sections executed successfully, you should see:

```
✅ Section 1: Organizations Table - COMPLETE
✅ Section 2: Customers Table - COMPLETE
✅ Section 3: Payments Table - COMPLETE
✅ Section 4: Platform Revenue Table - COMPLETE
✅ Section 5: Helper Functions - COMPLETE
✅ Section 6: RLS Policies - COMPLETE
✅ Section 7: Analytics Views - COMPLETE

Database is now ready for Stripe Connect!
```

---

## 🚨 ROLLBACK (If Needed)

If something goes wrong:

```sql
-- Restore from backup
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Restore tables
CREATE TABLE organizations AS SELECT * FROM backup_nov16_2025.organizations;
CREATE TABLE customers AS SELECT * FROM backup_nov16_2025.customers;
CREATE TABLE payments AS SELECT * FROM backup_nov16_2025.payments;
CREATE TABLE bookings AS SELECT * FROM backup_nov16_2025.bookings;

-- Recreate foreign keys and indexes
-- (Run original schema migrations)
```

---

## 🎯 NEXT STEPS

After successful migration:

1. ✅ **Update Phase 1 Documentation**
   - Mark database implementation as complete
   - Document any issues encountered

2. 🚀 **Start Phase 2: Edge Functions**
   - Create Stripe Connect functions
   - Test onboarding flow
   - Test payment processing

3. 📊 **Monitor Database**
   - Check query performance
   - Monitor RLS policy effectiveness
   - Verify data integrity

---

**Migration Status: Ready to Execute**  
**Estimated Time: 20-25 minutes**  
**Risk Level: LOW (with backup)**

**Bismillah - Let's begin! 🚀**
