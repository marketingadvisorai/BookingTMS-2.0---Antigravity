# BookingTMS PRD - Quick Start Guide for AI Agents

**📘 Main PRD**: See `/PRD_BOOKINGTMS_ENTERPRISE.md` (50+ pages)

This is a condensed quick-start guide for AI development agents who need to get started quickly.

---

## 🎯 What You Need to Know

### Product Overview
BookingTMS is an enterprise SaaS booking management platform for escape rooms and activity centers. Built by AI agents, maintained by AI agents, continuously improved through AI-human collaboration.

### Current Status (v3.2.2)
- ✅ **Frontend**: 100% complete (17 pages, 100+ components)
- 🔄 **Backend**: Ready to implement (Supabase + PostgreSQL)
- 🔄 **Payments**: Ready for Stripe integration
- 🔄 **Design Pipeline**: Ready for Figma automation

---

## 🚀 Quick Reference

### Essential Documents (Read in Order)

1. **Start Here** → `/PRD_BOOKINGTMS_ENTERPRISE.md`
   - Complete product requirements
   - Enterprise architecture
   - Stripe integration guide
   - Figma-to-production workflow

2. **Design Guidelines** → `/guidelines/Guidelines.md`
   - Design system
   - Component patterns
   - Dark mode rules
   - RBAC system

3. **Quick Templates** → `/guidelines/AI_AGENT_QUICK_START.md`
   - Code templates
   - Common patterns
   - Testing checklist

4. **Color Guide** → `/DARK_MODE_COLOR_GUIDE.md`
   - Light/dark mode colors
   - 3-tier background system

---

## 📊 Architecture at a Glance

```
Frontend (React/Next.js)
    ↓
API Gateway
    ↓
Application Services (Bookings, Payments, Users, Notifications)
    ↓
Database (PostgreSQL + Redis Cache)
    ↓
External Services (Stripe, Twilio, SendGrid, Figma API)
```

---

## 💳 Stripe Integration - Quick Steps

### 1. Setup (5 minutes)
```bash
# Get API keys from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Payment Flow (Code Template)
```typescript
// Create Payment Intent
const { clientSecret } = await fetch('/api/payments/create-intent', {
  method: 'POST',
  body: JSON.stringify({ bookingId, amount })
}).then(r => r.json());

// Confirm Payment (Frontend)
const { paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: { return_url: '/confirmation' }
});
```

### 3. Webhook Handler
```typescript
// /api/webhooks/stripe.ts
const event = stripe.webhooks.constructEvent(body, signature, secret);

switch (event.type) {
  case 'payment_intent.succeeded':
    await handlePaymentSuccess(event.data.object);
    break;
  // ... other events
}
```

**Full Guide**: See PRD Section 6 (pages 25-35)

---

## 🎨 Figma-to-Production - Quick Setup

### 1. Get Figma Token
```bash
# Figma Settings → Account → Personal Access Tokens
FIGMA_ACCESS_TOKEN=figd_...
FIGMA_FILE_KEY=... # From file URL
```

### 2. Sync Design Tokens (Automated)
```bash
npm run sync-figma-tokens
# Creates: /design-tokens/tokens.json
```

### 3. GitHub Actions Workflow
```yaml
# Runs every 6 hours or on webhook
# Creates PR with design updates
# AI reviews changes automatically
```

### 4. AI Design Review (Weekly)
```bash
# Captures production screenshots
# AI analyzes UI/UX
# Posts suggestions to Figma
npm run ai-design-review
```

**Full Guide**: See PRD Section 7 (pages 35-45)

---

## 🔐 Security Checklist

### Must Do
- [ ] Use Supabase Auth (JWT tokens)
- [ ] Implement RBAC (Row-Level Security)
- [ ] Never store card data (use Stripe)
- [ ] Validate all inputs (Zod schemas)
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Enable CSRF protection
- [ ] Set security headers

### Stripe Security
- [ ] Verify webhook signatures
- [ ] Enable Stripe Radar (fraud detection)
- [ ] Configure 3D Secure for EU
- [ ] Use payment intents (not charges)
- [ ] Implement refund controls
- [ ] Monitor dispute alerts

**Full Guide**: See PRD Section 8 (pages 45-50)

---

## 📈 Development Roadmap

### Phase 1: Backend (Weeks 1-4)
- Week 1: Database setup
- Week 2: Auth & RBAC
- Week 3: Core APIs
- Week 4: Real-time features

### Phase 2: Payments (Weeks 5-6)
- Week 5: Basic Stripe integration
- Week 6: Refunds, webhooks, fraud prevention

### Phase 3: Notifications (Week 7)
- Email (SendGrid)
- SMS (Twilio)
- Push notifications

### Phase 4: Production (Week 8)
- Deploy to Vercel
- Configure monitoring
- Security audit
- Launch

### Phase 5: Design Pipeline (Weeks 9-10)
- Figma API integration
- AI design review
- Automated sync

**Full Roadmap**: See PRD Section 5 (pages 15-25)

---

## 🤖 AI Agent Guidelines

### Code Generation Rules
1. Always use TypeScript
2. Follow existing patterns (check `/components/`, `/pages/`)
3. Implement dark mode (use `ThemeContext`)
4. Make responsive (mobile-first)
5. Add accessibility (ARIA, keyboard nav)
6. Handle errors gracefully
7. Add loading states
8. Write documentation

### Quality Checklist
- [ ] TypeScript types ✓
- [ ] Dark mode ✓
- [ ] Responsive ✓
- [ ] Accessible ✓
- [ ] Error handling ✓
- [ ] Loading states ✓
- [ ] Tests written ✓

### Prompting Example
```
"Create a PaymentHistoryTable component.

Requirements:
- Display payment records with columns: Date, Booking #, Amount, Status, Actions
- Support dark mode using ThemeContext
- Add filters: Date range, Status, Payment method
- Include refund action (admin/super-admin only)
- Make responsive (mobile: cards, desktop: table)
- Add loading skeleton and empty state
- Follow design system (/guidelines/DESIGN_SYSTEM.md)
- Use existing Table component (/components/ui/table.tsx)

Reference:
- Similar pattern: /pages/PaymentHistory.tsx
- RBAC: /lib/auth/README.md
- Refund API: /api/payments/refund.ts"
```

**Full Guide**: See PRD Section 10 (pages 50-52)

---

## 📊 Database Schema - Core Tables

### bookings
```sql
id, booking_number, customer_id, game_id, 
booking_date, start_time, party_size, 
status, payment_status, total_amount, final_amount,
payment_intent_id (Stripe), created_at
```

### payments
```sql
id, booking_id, stripe_payment_intent_id, 
stripe_charge_id, amount, currency, status,
payment_method_type, refund_amount, receipt_url
```

### notifications
```sql
id, user_id, organization_id, type, priority,
title, message, action_url, is_read, created_at
```

### users (extends Supabase auth)
```sql
id, email, full_name, role, organization_id,
is_active, last_login_at
```

**Full Schema**: See PRD Section 3.3 (pages 10-15)

---

## 🔗 Important Links

### Documentation
- **Main PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md`
- **Guidelines**: `/guidelines/Guidelines.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Library**: `/guidelines/COMPONENT_LIBRARY.md`
- **Quick Start**: `/guidelines/AI_AGENT_QUICK_START.md`
- **Dark Mode**: `/DARK_MODE_COLOR_GUIDE.md`
- **RBAC**: `/lib/auth/README.md`
- **Notifications**: `/NOTIFICATION_SYSTEM_COMPLETE.md`
- **Project Status**: `/PROJECT_STATUS_SUMMARY.md`

### External Resources
- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Figma API**: https://www.figma.com/developers/api
- **Shadcn/UI**: https://ui.shadcn.com

---

## 💡 Common Tasks

### Create New Page
```typescript
// 1. Create file: /pages/MyPage.tsx
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useTheme } from '@/components/layout/ThemeContext';

export default function MyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <PageHeader title="My Page" />
      {/* Content */}
    </AdminLayout>
  );
}

// 2. Add route to App.tsx
// 3. Add to sidebar (/components/layout/Sidebar.tsx)
// 4. Test dark mode, responsive, accessibility
```

### Add API Endpoint
```typescript
// /pages/api/my-endpoint.ts
import { supabase } from '@/lib/supabase/server';

export default async function handler(req, res) {
  // 1. Verify authentication
  const { user } = await supabase.auth.getUser(token);
  
  // 2. Check permissions
  const hasPermission = await checkPermission(user, 'resource.action');
  
  // 3. Validate input (Zod)
  const validated = schema.parse(req.body);
  
  // 4. Execute logic
  const result = await doSomething(validated);
  
  // 5. Return response
  return res.json({ success: true, data: result });
}
```

### Integrate with Stripe
```typescript
// See PRD Section 6 for complete examples
// Key files:
// - /pages/api/payments/create-intent.ts
// - /pages/api/payments/refund.ts
// - /pages/api/webhooks/stripe.ts
```

### Sync Figma Designs
```bash
# Manual sync
npm run sync-figma-tokens

# Auto-sync (GitHub Actions runs every 6 hours)
# Or trigger: repository_dispatch event
```

---

## 🎯 Success Criteria

### Technical
- [ ] 99.9% uptime
- [ ] < 2s page load time
- [ ] < 0.1% error rate
- [ ] Lighthouse score > 90

### Business
- [ ] 100+ organizations onboarded (6 months)
- [ ] >98% payment success rate
- [ ] NPS score >50
- [ ] <5% monthly churn

### Design-Dev
- [ ] <24 hours design-to-code time
- [ ] >8/10 AI design review score
- [ ] >95% design consistency
- [ ] 100% WCAG AA compliance

---

## 📞 Need Help?

1. **Quick answer?** → Check `/guidelines/AI_AGENT_QUICK_START.md`
2. **Design question?** → See `/guidelines/DESIGN_SYSTEM.md`
3. **Architecture question?** → See `/PRD_BOOKINGTMS_ENTERPRISE.md`
4. **Stripe integration?** → See PRD Section 6
5. **Figma pipeline?** → See PRD Section 7
6. **Still stuck?** → Review existing implementations in codebase

---

## 🚀 Getting Started (30-Minute Checklist)

- [ ] Read this document (5 min)
- [ ] Skim main PRD sections 1-3 (10 min)
- [ ] Review `/guidelines/Guidelines.md` (5 min)
- [ ] Explore `/components/` and `/pages/` (5 min)
- [ ] Review existing patterns (5 min)
- [ ] Start coding! 🎉

---

**Version**: 1.0.0  
**Last Updated**: November 3, 2025  
**For**: AI Development Agents (Claude Sonnet 4.5, Cursor, Trae AI)

**Main Document**: `/PRD_BOOKINGTMS_ENTERPRISE.md` (50+ pages)  
**This Quick Start**: Essential information condensed for rapid onboarding

---

**Remember**: This is a living, breathing AI-first development environment. Humans and AI collaborate continuously. When in doubt, check the docs or review existing code patterns. Happy coding! 🤖💙
