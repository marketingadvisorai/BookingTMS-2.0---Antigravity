# 🚀 BookingTMS Multi-Tenant SaaS - Implementation Roadmap

**Version:** 1.0  
**Date:** November 16, 2025  
**Branch:** `system-admin-implementation-0.1`

---

## 📋 OVERVIEW

Complete transformation of BookingTMS into an enterprise-grade multi-tenant SaaS platform with:
- ✅ Plan-based access control
- ✅ Stripe subscription integration
- ✅ System admin platform management
- ✅ Organization-level tenant isolation
- ✅ Feature gates and usage limits

---

## 📚 DOCUMENTATION CREATED

### 1. **MULTI_TENANT_ARCHITECTURE.md**
Complete database architecture for multi-tenant SaaS:
- Multi-tenant strategy (Shared DB + RLS)
- 9 core entities with full specifications
- ERD with visual diagrams
- Relationships matrix
- RLS policies for all tables
- RBAC permission matrix
- Indexing strategy
- Migration plan (5 weeks)

### 2. **ERD_VISUAL.md**
Visual Entity Relationship Diagram showing:
- Platform layer (global resources)
- Tenant layer (organization-scoped)
- All relationships and foreign keys
- Tenant isolation boundaries

### 3. **PLAN_BASED_ACCESS_ARCHITECTURE.md**
Plan-based feature access control:
- Clarified role hierarchy
- 3-tier subscription plans
- Feature matrix by plan
- Menu access matrix by role
- Database schema with Stripe fields
- Stripe integration workflows

---

## 🏗️ ROLE HIERARCHY (FINALIZED)

```
┌─────────────────────────────────────────┐
│   PLATFORM LEVEL (Us - System Owners)  │
├─────────────────────────────────────────┤
│  system-admin                           │
│  ├─ Manage ALL organizations           │
│  ├─ Create/control super-admins        │
│  ├─ Backend Dashboard access ✅         │
│  ├─ Database Management access ✅       │
│  ├─ Feature flag control                │
│  └─ Platform analytics                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ORGANIZATION LEVEL (Customers)          │
├─────────────────────────────────────────┤
│  super-admin (Organization Owner)       │
│  ├─ Created by system admins            │
│  ├─ Full access to THEIR org only       │
│  ├─ Backend Dashboard access ❌         │
│  ├─ Database Management access ❌       │
│  ├─ Feature access: PLAN-BASED          │
│  └─ Can manage billing/subscription     │
│                                          │
│  admin (Full Operational)               │
│  ├─ Same as super-admin BUT             │
│  ├─ Cannot manage billing               │
│  └─ Cannot create/delete super-admins   │
│                                          │
│  manager → staff → customer             │
│  └─ Decreasing permissions              │
└─────────────────────────────────────────┘
```

---

## 🎫 SUBSCRIPTION PLANS

| Feature | Basic ($99) | Growth ($299) | Pro ($599) |
|---------|-------------|---------------|------------|
| **Limits** ||||
| Venues | 2 | 5 | ♾️ Unlimited |
| Staff Users | 3 | 10 | ♾️ Unlimited |
| Bookings/Month | 200 | 1000 | ♾️ Unlimited |
| Widgets | 1 | 3 | ♾️ Unlimited |
| **Core Features** ||||
| Booking Widgets | ✅ | ✅ | ✅ |
| Basic Analytics | ✅ | ✅ | ✅ |
| Email Support | ✅ | ✅ | ✅ |
| **Marketing** ||||
| Email Campaigns | ❌ | ✅ | ✅ |
| SMS Campaigns | ❌ | ✅ | ✅ |
| Automation | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ✅ | ✅ |
| **Advanced** ||||
| AI Agents | ❌ | ❌ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ |
| Custom Reporting | ❌ | ❌ | ✅ |
| **Integration** ||||
| API Access | ❌ | ❌ | ✅ |
| Webhooks | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

---

## 🛠️ COMPONENTS CREATED

### Frontend Hooks

**`src/hooks/usePlanFeatures.ts`**
```typescript
const { 
  hasFeature,      // Check if feature available in plan
  canUse,          // Check if can perform action (respects limits)
  getLimit,        // Get resource limits
  isAtLimit,       // Check if at/over limit
  getRequiredPlan  // Get plan needed for feature
} = usePlanFeatures();

// Usage
if (!hasFeature('ai_agents')) {
  return <UpgradePrompt feature="AI Agents" requiredPlan="Pro" />;
}

if (!canUse('venues', 'create')) {
  return <LimitReachedPrompt resource="venues" />;
}
```

### UI Components

**`src/components/common/UpgradePrompt.tsx`**
- Full-page upgrade prompts (feature locked)
- Full-page limit reached prompts
- Inline upgrade banners
- Limit usage badges

---

## 💾 DATABASE SCHEMA UPDATES NEEDED

### New Tables

```sql
-- Plans table
CREATE TABLE plans (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly decimal(10,2),
  stripe_price_id_monthly text,
  max_venues int,  -- NULL = unlimited
  max_staff int,
  max_bookings_per_month int,
  features jsonb DEFAULT '{}'
);

-- Updated organizations table
ALTER TABLE organizations ADD COLUMN stripe_customer_id text UNIQUE;
ALTER TABLE organizations ADD COLUMN stripe_subscription_id text UNIQUE;
ALTER TABLE organizations ADD COLUMN subscription_status text;
ALTER TABLE organizations ADD COLUMN current_venues_count int DEFAULT 0;
ALTER TABLE organizations ADD COLUMN current_staff_count int DEFAULT 0;
ALTER TABLE organizations ADD COLUMN current_bookings_this_month int DEFAULT 0;

-- Subscription history
CREATE TABLE subscription_history (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  old_plan_id uuid,
  new_plan_id uuid,
  change_type text,
  stripe_event_id text,
  amount_paid decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- Usage tracking
CREATE TABLE organization_usage (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  venues_count int DEFAULT 0,
  staff_count int DEFAULT 0,
  bookings_count int DEFAULT 0,
  has_exceeded_limits boolean DEFAULT false
);
```

---

## 🔄 IMPLEMENTATION PHASES

### **PHASE 1: Database Foundation** (Week 1)
- [ ] Create `plans` table with Basic/Growth/Pro plans
- [ ] Add Stripe fields to `organizations` table
- [ ] Create `subscription_history` table
- [ ] Create `organization_usage` table
- [ ] Add all necessary indexes
- [ ] Test migrations on staging

### **PHASE 2: Stripe Integration** (Week 2)
- [ ] Set up Stripe products/prices in dashboard
- [ ] Create Supabase Edge Function for webhooks
- [ ] Implement organization creation with Stripe
- [ ] Implement subscription creation flow
- [ ] Implement plan upgrade/downgrade flows
- [ ] Test payment flows end-to-end

### **PHASE 3: Frontend Feature Gates** (Week 3)
- [ ] Integrate `usePlanFeatures` hook in all pages
- [ ] Add feature checks to menu items in Sidebar
- [ ] Add upgrade prompts to locked features
- [ ] Hide Backend Dashboard from non-system-admins
- [ ] Hide Database Management from non-system-admins
- [ ] Test all plan tiers (Basic/Growth/Pro)

### **PHASE 4: Usage Tracking** (Week 4)
- [ ] Implement venue count tracking
- [ ] Implement staff count tracking
- [ ] Implement booking count tracking
- [ ] Add limit enforcement to create actions
- [ ] Create usage dashboard for system admins
- [ ] Add email notifications for limits

### **PHASE 5: Testing & Launch** (Week 5)
- [ ] End-to-end testing all flows
- [ ] Test subscription upgrades/downgrades
- [ ] Test payment failures
- [ ] Test usage limit enforcement
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to production

---

## 🎯 CRITICAL REQUIREMENTS

### Backend Menu Access (ENFORCED)

```typescript
// ❌ super-admin CANNOT see these
const BACKEND_MENUS = [
  'system-admin',      // System Admin Dashboard
  'backend-dashboard', // Backend Dashboard
  'database',          // Database Management
];

// ✅ Only system-admin can access
if (currentUser?.role !== 'system-admin') {
  // Hide backend menus
}
```

### Feature Access Pattern

```typescript
// Example: AI Agents page
function AIAgents() {
  const { hasFeature } = usePlanFeatures();
  
  // Check if plan includes feature
  if (!hasFeature('ai_agents')) {
    return <UpgradePrompt 
      featureName="AI Agents" 
      requiredPlan="Pro" 
    />;
  }
  
  return <AIAgentsUI />;
}

// Example: Create Venue
function CreateVenue() {
  const { canUse, getLimit, getUsage } = usePlanFeatures();
  
  if (!canUse('venues', 'create')) {
    return <UpgradePrompt 
      type="limit"
      resource="venues"
      currentUsage={getUsage('venues')}
      limit={getLimit('venues')}
      requiredPlan="Growth"
    />;
  }
  
  return <CreateVenueForm />;
}
```

---

## 🔐 STRIPE INTEGRATION CHECKLIST

### Stripe Setup
- [ ] Create Stripe account (if not exists)
- [ ] Create products in Stripe dashboard
  - [ ] Basic Plan ($99/mo)
  - [ ] Growth Plan ($299/mo)
  - [ ] Pro Plan ($599/mo)
- [ ] Create price IDs for each product
- [ ] Store price IDs in `plans` table
- [ ] Set up webhook endpoint URL
- [ ] Configure webhook events:
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`

### Environment Variables
```env
# Add to .env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Supabase Edge Functions
```bash
# Deploy webhook handler
supabase functions deploy handle-stripe-webhooks
```

---

## 📊 SUCCESS METRICS

### Week 1-2 (Foundation)
- ✅ Database schema updated
- ✅ Stripe products created
- ✅ Webhooks functional

### Week 3-4 (Implementation)
- ✅ Feature gates working
- ✅ Usage tracking accurate
- ✅ Backend menus hidden from non-system-admins

### Week 5 (Launch)
- ✅ First test organization created
- ✅ First test subscription created
- ✅ All upgrade flows tested
- ✅ Payment flows working

---

## 🚨 IMPORTANT NOTES

### 1. **Backend Access is Critical**
- Backend Dashboard = system-admin ONLY
- Database Management = system-admin ONLY
- This is non-negotiable for security

### 2. **Super Admins are Controlled**
- Created by system admins
- Cannot access platform-level features
- Isolated to their organization
- Plan-based feature access

### 3. **All Features are Plan-Based**
- No hardcoded feature access
- Everything controlled by `plans.features` in DB
- Easy to add/remove features per plan

### 4. **Usage Limits are Enforced**
- Frontend checks before create actions
- Backend validates on API calls
- Real-time tracking in database
- Upgrade prompts when limits reached

---

## 📞 SUPPORT & RESOURCES

### Documentation
- `MULTI_TENANT_ARCHITECTURE.md` - Complete DB architecture
- `ERD_VISUAL.md` - Visual database diagram
- `PLAN_BASED_ACCESS_ARCHITECTURE.md` - Feature access control
- `STRIPE_INTEGRATION.md` - Stripe implementation guide (to be created)

### Code Files
- `src/hooks/usePlanFeatures.ts` - Feature gate hook
- `src/components/common/UpgradePrompt.tsx` - Upgrade UI
- `src/lib/auth/permissions.ts` - Permission definitions
- `src/components/layout/Sidebar.tsx` - Navigation menu

---

## ✅ COMPLETION CHECKLIST

### Architecture ✅
- [x] Multi-tenant database design
- [x] ERD and relationships
- [x] RLS policies defined
- [x] Plan-based access strategy
- [x] Stripe integration design

### Frontend ✅
- [x] usePlanFeatures hook
- [x] UpgradePrompt components
- [x] Feature gate patterns

### Pending 🚧
- [ ] Database migrations
- [ ] Stripe products setup
- [ ] Webhook handler implementation
- [ ] Feature gate integration in UI
- [ ] Usage tracking implementation
- [ ] Testing and QA

---

**Status:** 🎯 **Architecture Complete - Ready for Implementation**  
**Next Step:** Execute Phase 1 - Database Foundation  
**ETA to Launch:** 5 weeks  
**Branch:** `system-admin-implementation-0.1`

---

**Last Updated:** November 16, 2025  
**Version:** 1.0  
**Maintained By:** System Admin Team
