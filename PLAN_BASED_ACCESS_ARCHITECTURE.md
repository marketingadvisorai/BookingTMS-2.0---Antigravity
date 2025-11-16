# 🎯 Plan-Based Access Control & Stripe Integration
## BookingTMS Multi-Tenant SaaS - Complete Strategy

**Version:** 2.0 | **Date:** Nov 16, 2025 | **Status:** ✅ Ready

---

## 🏗️ ROLE HIERARCHY (CLARIFIED)

```
PLATFORM LEVEL (Us - System Owners)
├── system-admin
│   ├─ Full platform control
│   ├─ Manage ALL organizations
│   ├─ Create/manage super-admins
│   ├─ Control feature flags & plans
│   ├─ Access Backend Dashboard
│   └─ Access Database Management

ORGANIZATION LEVEL (Customers - Plan-Based)
├── super-admin (Organization Owner)
│   ├─ Full access to THEIR org only
│   ├─ Manage venues/games/bookings
│   ├─ Create staff (admin/manager/staff)
│   ├─ View/manage billing & subscription
│   ├─ ❌ NO Backend Dashboard access
│   ├─ ❌ NO Database Management access
│   └─ Features based on subscription plan

├── admin (Full Operational)
│   ├─ Same as super-admin but:
│   ├─ ❌ Cannot manage billing
│   └─ ❌ Cannot create/delete super-admins

├── manager (Limited Management)
│   └─ View/edit content, create bookings

├── staff (Basic Operations)
│   └─ View bookings, basic customer management

└── customer (End User)
    └─ View/manage own bookings only
```

**KEY POINTS:**
1. System admins = Platform owners (us)
2. Super admins = Controlled by system admins (customers)
3. Backend/Database menus = System admins ONLY
4. All features = Plan-based for organizations

---

## 🎫 SUBSCRIPTION PLANS & FEATURES

| Feature | Basic ($99) | Growth ($299) | Pro ($599) |
|---------|-------------|---------------|------------|
| **Limits** |
| Venues | 2 | 5 | Unlimited |
| Games/Rooms | 10 | 50 | Unlimited |
| Bookings/Month | 200 | 1000 | Unlimited |
| Staff Users | 3 | 10 | Unlimited |
| Widgets | 1 | 3 | Unlimited |
| **Core** |
| Booking Widgets | ✅ | ✅ | ✅ |
| Email Support | ✅ | ✅ | ✅ |
| **Marketing** |
| Email Campaigns | ❌ | ✅ | ✅ |
| SMS Campaigns | ❌ | ✅ | ✅ |
| Automation | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ✅ | ✅ |
| **Advanced** |
| AI Agents | ❌ | ❌ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ |
| Custom Reporting | ❌ | ❌ | ✅ |
| **Integration** |
| API Access | ❌ | ❌ | ✅ |
| Webhooks | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |

---

## 🔒 MENU ACCESS MATRIX

### Backend/Platform (System Admin ONLY)

| Menu Item | system-admin | super-admin | admin |
|-----------|--------------|-------------|-------|
| System Admin Dashboard | ✅ | ❌ | ❌ |
| Backend Dashboard | ✅ | ❌ | ❌ |
| Database Management | ✅ | ❌ | ❌ |
| All Organizations | ✅ | ❌ | ❌ |
| Feature Flags | ✅ | ❌ | ❌ |
| Platform Analytics | ✅ | ❌ | ❌ |

### Organization Menus (Plan-Based)

| Menu Item | Plan Required | super-admin | admin | manager | staff |
|-----------|---------------|-------------|-------|---------|-------|
| Dashboard | All | ✅ | ✅ | ✅ | ✅ |
| Bookings | All | ✅ | ✅ | ✅ | ✅ |
| Events/Rooms | All | ✅ | ✅ | ✅ | 👁️ |
| Venues | All | ✅ | ✅ | ❌ | ❌ |
| Widgets | All | ✅ | ✅ | ❌ | ❌ |
| Customers | All | ✅ | ✅ | ✅ | ✅ |
| Inbox | All | ✅ | ✅ | ✅ | ✅ |
| Campaigns | Growth+ | ✅ | ✅ | ❌ | ❌ |
| Marketing | Growth+ | ✅ | ✅ | ❌ | ❌ |
| AI Agents | Pro+ | ✅ | ✅ | 👁️ | ❌ |
| Staff | All | ✅ | ✅ | ❌ | ❌ |
| Reports | All | ✅ | ✅ | ✅ | 👁️ |
| Media | All | ✅ | ✅ | ✅ | ❌ |
| Waivers | All | ✅ | ✅ | ❌ | ❌ |
| Payments | All | ✅ | ✅ | 👁️ | 👁️ |
| Settings | All | ✅ | ✅ | ❌ | ❌ |
| Billing | All | ✅ | ❌ | ❌ | ❌ |

---

## 💾 DATABASE SCHEMA (Stripe Integration)

```sql
-- Organizations with Stripe fields
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  
  -- Subscription
  plan_id uuid REFERENCES plans(id),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  subscription_status text, -- active, past_due, canceled, trialing
  trial_ends_at timestamptz,
  
  -- Usage Tracking
  current_venues_count int DEFAULT 0,
  current_staff_count int DEFAULT 0,
  current_bookings_this_month int DEFAULT 0,
  
  status text DEFAULT 'trial',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plans
CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  name text NOT NULL, -- Basic, Growth, Pro
  slug text UNIQUE NOT NULL,
  
  -- Pricing
  price_monthly decimal(10,2) NOT NULL,
  stripe_price_id_monthly text,
  stripe_price_id_annual text,
  
  -- Limits (NULL = unlimited)
  max_venues int,
  max_staff int,
  max_bookings_per_month int,
  max_widgets int,
  
  -- Features
  features jsonb DEFAULT '{}',
  /* {
    "email_campaigns": true,
    "ai_agents": false,
    "api_access": false,
    ...
  } */
  
  created_at timestamptz DEFAULT now()
);

-- Usage tracking
CREATE TABLE organization_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id uuid REFERENCES organizations(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  
  venues_count int DEFAULT 0,
  staff_count int DEFAULT 0,
  bookings_count int DEFAULT 0,
  
  has_exceeded_limits boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Subscription history
CREATE TABLE subscription_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  organization_id uuid REFERENCES organizations(id),
  old_plan_id uuid REFERENCES plans(id),
  new_plan_id uuid REFERENCES plans(id),
  change_type text, -- upgrade, downgrade, cancel, renew
  stripe_event_id text,
  amount_paid decimal(10,2),
  created_at timestamptz DEFAULT now()
);
```

---

## 💳 STRIPE INTEGRATION FLOW

### 1. Create Organization (System Admin)

```typescript
async function createOrganization(data) {
  // 1. Create Stripe customer
  const customer = await stripe.customers.create({
    email: data.owner_email,
    name: data.name,
  });
  
  // 2. Create subscription with trial
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: plan.stripe_price_id_monthly }],
    trial_period_days: 14,
  });
  
  // 3. Create organization in Supabase
  const org = await supabase.from('organizations').insert({
    name: data.name,
    plan_id: data.plan_id,
    stripe_customer_id: customer.id,
    stripe_subscription_id: subscription.id,
    subscription_status: 'trialing',
    trial_ends_at: new Date(subscription.trial_end * 1000),
  });
  
  return org;
}
```

### 2. Stripe Webhook Handler

```typescript
// Supabase Edge Function
export async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'customer.subscription.updated':
      await supabase.from('organizations').update({
        subscription_status: event.data.object.status,
      }).eq('stripe_subscription_id', event.data.object.id);
      break;
    
    case 'invoice.payment_failed':
      await supabase.from('organizations').update({
        subscription_status: 'past_due',
        status: 'suspended',
      }).eq('stripe_customer_id', event.data.object.customer);
      break;
  }
}
```

---

## 🎛️ FRONTEND FEATURE GATE

```typescript
// hooks/usePlanFeatures.ts
export function usePlanFeatures() {
  const { currentUser } = useAuth();
  const { organization, plan } = useOrganization();
  
  const hasFeature = (feature: string) => {
    if (currentUser?.role === 'system-admin') return true;
    return plan?.features?.[feature] === true;
  };
  
  const canUse = (resource: string, action: string) => {
    if (currentUser?.role === 'system-admin') return true;
    
    // Check limits
    if (resource === 'venues' && action === 'create') {
      const limit = plan?.max_venues;
      if (limit && organization?.current_venues_count >= limit) {
        return false;
      }
    }
    
    return true;
  };
  
  return { hasFeature, canUse };
}

// Usage in components
function Venues() {
  const { canUse, hasFeature } = usePlanFeatures();
  
  if (!canUse('venues', 'create')) {
    return <UpgradePrompt />;
  }
  
  return <VenuesUI />;
}
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Database Setup (Week 1)
- [ ] Create plans table with features
- [ ] Add Stripe fields to organizations
- [ ] Create subscription_history table
- [ ] Create organization_usage table
- [ ] Add indexes

### Phase 2: Stripe Integration (Week 2)
- [ ] Set up Stripe products/prices
- [ ] Create webhook handler
- [ ] Implement subscription creation
- [ ] Implement plan upgrades
- [ ] Test payment flows

### Phase 3: Frontend Gates (Week 3)
- [ ] Create usePlanFeatures hook
- [ ] Add feature checks to all menu items
- [ ] Add upgrade prompts
- [ ] Hide backend menus from non-system-admins
- [ ] Test all plan tiers

### Phase 4: Usage Tracking (Week 4)
- [ ] Implement usage counters
- [ ] Add limit enforcement
- [ ] Create usage dashboard
- [ ] Add notifications for limits

---

## ✅ KEY TAKEAWAYS

1. **System Admin = Platform Owner (Us)**
   - Full control, backend access, all features

2. **Super Admin = Customer (Controlled by Us)**
   - Organization owner, NO backend access, plan-based features

3. **Backend Menus = System Admin ONLY**
   - Backend Dashboard
   - Database Management
   - System Admin Portal

4. **All Features = Plan-Based**
   - Basic: Core features
   - Growth: + Marketing
   - Pro: + AI & API

5. **Stripe Powers Everything**
   - Subscriptions
   - Feature access
   - Usage limits
   - Billing

---

**Status:** ✅ Architecture Complete  
**Next:** Implement Phase 1 - Database Setup  
**ETA:** 4 weeks to full implementation
