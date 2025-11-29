# Current Task List

> **Last Updated**: 2025-11-30 03:50 UTC+6
> **Version**: v0.1.63
> **For**: AI Agents, Developers, Designers

---

## 🎯 Active Sprint

### ✅ Completed Today
| Task | Status | Notes |
|------|--------|-------|
| E2E Booking Flow Test | ✅ Done | Widget → Checkout → Payment → Webhook → DB |
| Organizations Module Refactor | ✅ Done | 812 → 11 files < 250 lines |
| Enterprise Coding Standards | ✅ Done | `.agent/rules/coding-standards.md` |
| Bookings Module Structure | ✅ Done | types, utils extracted |
| Calendar Views Extraction | ✅ Done | 4 views: Month, Week, Day, Schedule |
| Integrate Modules into Bookings.tsx | ✅ Done | 3,410 → 2,875 lines (-535) |
| Extract BookingTableView | ✅ Done | 3,410 → 1,222 lines (64% reduction) |
| Remove Seed Data | ✅ Done | Cleaned up unused mock data |
| QR Ticket System | ✅ Done | v0.1.62 - QR generation, scanning, check-in |
| Refund Processing | ✅ Done | v0.1.61 - Stripe refund edge function |

### 🔄 In Progress
| Task | Priority | Assignee | ETA |
|------|----------|----------|-----|
| - | - | - | - |

### 📋 Up Next
| Task | Priority | Depends On |
|------|----------|------------|
| Refactor Marketing.tsx (2772 lines) | 🔴 High | Bookings done ✅ |
| Admin Notification (Email/Slack) | 🟡 Medium | - |
| Booking Receipt PDF | 🟡 Medium | - |
| Capacity Management (Block/unblock sessions) | 🟡 Medium | - |

---

## 📁 Files Needing Refactoring

> **Standard**: Max 250 lines per file (see `.agent/rules/coding-standards.md`)

| File | Current Lines | Target | Priority |
|------|---------------|--------|----------|
| `src/pages/Bookings.tsx` | 1,222 ✅ (was 3,409) | < 500 | 🟢 Good Progress |
| `src/pages/Marketing.tsx` | 2,772 | < 250 | 🔴 High |
| `src/components/widgets/FareBookWidget.tsx` | 2,747 | < 250 | 🔴 High |
| `src/pages/SystemAdminDashboard.tsx` | 1,901 | < 250 | 🟡 Medium |
| `src/pages/Waivers.tsx` | 1,664 | < 250 | 🟡 Medium |

### Refactoring Pattern
```
Original: src/pages/Bookings.tsx (3409 lines)
    ↓
Target: src/features/bookings/
├── ARCHITECTURE.md          # Documentation
├── components/
│   ├── index.ts             # Barrel export
│   ├── BookingCard.tsx      # < 150 lines
│   ├── BookingTable.tsx     # < 200 lines
│   ├── BookingFilters.tsx   # < 100 lines
│   └── BookingStats.tsx     # < 50 lines
├── hooks/
│   └── useBookingFilters.ts # < 100 lines
└── types/
    └── booking.types.ts     # < 50 lines
```

---

## 🔧 Key Commands

```bash
# Check file line counts
wc -l src/pages/*.tsx | sort -n

# Run dev server
npm run dev

# Run tests
npm test

# Deploy functions
supabase functions deploy

# Push to GitHub
git push origin main
```

---

## 📚 Documentation Index

| Document | Purpose | Location |
|----------|---------|----------|
| Coding Standards | File size, naming, structure | `.agent/rules/coding-standards.md` |
| Tech Stack | Technologies used | `.agent/rules/tech-stack.md` |
| Next Steps | Roadmap & completed tasks | `.agent/rules/next-steps.md` |
| Database Schema | Tables & relationships | `.agent/rules/database-schema.md` |
| Organizations Module | Refactored structure | `src/features/organizations/ARCHITECTURE.md` |
| Multi-Tenant | Architecture overview | `docs/MULTI_TENANT_ARCHITECTURE.md` |

---

## 🚀 Quick Reference

### Test URLs
- **Dev Server**: `http://localhost:5173`
- **Widget Test**: `http://localhost:3001/embed-pro?key=emb_57fdcedc75b56c818aba35ed`
- **Customer Portal**: `http://localhost:5173/my-bookings`
- **Org Admin Login**: `http://localhost:5173/org-login`

### Test Credentials
- **Org Admin**: `marketingadvisorai@gmail.com` (org-admin role)
- **Stripe Test Card**: `4242 4242 4242 4242`

### Supabase Project
- **Project ID**: `qftjyjpitnoapqxlrvfs`
- **Dashboard**: https://supabase.com/dashboard/project/qftjyjpitnoapqxlrvfs

---

## ⚠️ Do NOT Touch

These are working and should not be modified unless fixing bugs:
- `supabase/functions/stripe-webhook/index.ts` - Payment webhooks
- `supabase/functions/create-checkout-session/index.ts` - Checkout
- `src/lib/auth/AuthContext.tsx` - Authentication
- `src/modules/embed-pro/` - Widget system
- `src/modules/customer-portal/` - Customer portal

---

## 📝 Notes for Agents

1. **Before refactoring**: Read `.agent/rules/coding-standards.md`
2. **File size limit**: 250 lines max (200 preferred)
3. **Always create**: `ARCHITECTURE.md` in new feature folders
4. **Use barrel exports**: `index.ts` for clean imports
5. **Document with JSDoc**: For AI agent readability
6. **Test after changes**: Run `npm run dev` to verify
7. **Commit frequently**: Use conventional commit format
