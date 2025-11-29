# Organization Admin Setup Guide

> Last Updated: 2025-11-30
> Version: v0.1.55

## Overview

This guide explains how to set up and test the Org Admin (Beta Owner) portal with real database integration.

---

## Current Architecture

### User Flow
```
1. System Admin creates Organization
   ↓
2. Auto-creates default venue
   ↓
3. Creates user account (org-admin role)
   ↓
4. Links user to organization
   ↓
5. Org Admin can now login and manage their business
```

### Role Mapping
| Login Portal | Role | Access Level |
|--------------|------|--------------|
| `/` (Main) | system-admin | Full platform |
| `/` (Main) | super-admin | Full org access |
| `/org-login` | org-admin | Single org |
| `/beta-login` | beta-owner | MVP testing |

---

## Task Checklist

### ✅ Completed
- [x] Organization auto-creates default venue on creation
- [x] Sidebar filters menu items by permissions
- [x] embed_configs RLS policies fixed
- [x] Activity creation auto-assigns venue for non-system-admins

### 🔄 In Progress
- [ ] Connect OrgLogin to Supabase Auth
- [ ] Create test org-admin user
- [ ] Verify data filtering by organization

### 📋 TODO
- [ ] Create "Create Organization with User" form in System Admin
- [ ] Add trial period tracking
- [ ] Add organization onboarding wizard

---

## Testing Org Admin Flow

### Option 1: Use Existing User
```
Email: marketingadvisorai@gmail.com
Organization: Marketing Advisor AI
Role: org-admin
Login URL: http://localhost:5173/org-login
```

### Option 2: Create New Test User
1. Login as System Admin at `/`
2. Go to Organizations
3. Click "Add Organization"
4. Enable "Create User Account" checkbox
5. Fill in owner email and password
6. Submit - this creates org + venue + user

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ORG ADMIN DATA FLOW                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Login (OrgLogin.tsx)                                        │
│       │                                                      │
│       ▼                                                      │
│  Supabase Auth → Get user.id                                 │
│       │                                                      │
│       ▼                                                      │
│  Load User Profile → Get organization_id                     │
│       │                                                      │
│       ▼                                                      │
│  AuthContext.currentUser = { organizationId, role, ... }     │
│       │                                                      │
│       ▼                                                      │
│  All Hooks Filter by organizationId                          │
│       │                                                      │
│       ├── useVenues({ organizationId })                      │
│       ├── useServiceItems(venueId) // venue is org-scoped    │
│       ├── useBookings({ organizationId })                    │
│       └── useEmbedConfigs({ organizationId })                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Supabase RLS Policies

All tables use RLS to filter data:

| Table | Policy | Description |
|-------|--------|-------------|
| venues | org_access | Authenticated users see their org's venues |
| activities | org_access | Authenticated users see their org's activities |
| bookings | org_access | Authenticated users see their org's bookings |
| embed_configs | authenticated_all | Authenticated users can CRUD their embeds |
| customers | org_access | Authenticated users see their org's customers |

---

## Mock vs Real Auth

### Current State (Mock)
- BetaLogin uses hardcoded credentials
- Mock users in AuthContext.tsx
- Quick for development, not production-ready

### Target State (Real)
- OrgLogin uses Supabase email/password auth
- User profile loaded from `users` table
- Organization data loaded from `organizations` table
- All data filtered by user's organization_id

---

## Next Steps

1. **Test with existing user**: Use `marketingadvisorai@gmail.com` via OrgLogin
2. **Create System Admin UI**: Add form to create org + user together
3. **Add trial tracking**: Track trial start/end dates in organizations table
4. **Add onboarding**: First-time wizard for new org admins
