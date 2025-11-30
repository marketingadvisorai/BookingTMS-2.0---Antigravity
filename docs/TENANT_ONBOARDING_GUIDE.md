# Tenant (Organization) Onboarding Guide

> Version: v1.0.0
> Last Updated: 2025-11-30

## Overview

This guide documents the complete tenant onboarding flow for BookingTMS, including organization creation, user account setup, and credential delivery via Supabase Auth.

---

## Quick Reference

| Step | Action | System Component |
|------|--------|------------------|
| 1 | Create Organization | OrganizationService.createComplete() |
| 2 | Create Auth User | Supabase Auth (Edge Function) |
| 3 | Create User Profile | public.users table |
| 4 | Send Welcome Email | Supabase Auth SMTP (Resend optional, currently disabled) |
| 5 | Owner Logs In | /org-login route |
| 6 | Password Reset | /reset-password route |

---

## Organization Creation Flow

### System Admin Creates Organization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ORGANIZATION CREATION FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  System      │     │  Frontend    │     │  Supabase    │     │  Email       │
│  Admin       │     │  (React)     │     │  Backend     │     │  Service     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │ 1. Fill Form       │                    │                    │
       │───────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │ 2. Submit          │                    │
       │                    │───────────────────>│                    │
       │                    │                    │                    │
       │                    │                    │ 3. Create Org      │
       │                    │                    │ (organizations)    │
       │                    │                    │                    │
       │                    │                    │ 4. Create Auth User│
       │                    │                    │ (auth.users)       │
       │                    │                    │                    │
       │                    │                    │ 5. Create Profile  │
       │                    │                    │ (public.users)     │
       │                    │                    │                    │
       │                    │                    │ 6. Create Member   │
       │                    │                    │ (org_members)      │
       │                    │                    │                    │
       │                    │                    │ 7. Send Email      │
       │                    │                    │───────────────────>│
       │                    │                    │                    │
       │                    │ 8. Return Result   │                    │
       │                    │<───────────────────│                    │
       │                    │                    │                    │
       │ 9. Show Success    │                    │                    │
       │<───────────────────│                    │                    │
       │                    │                    │                    │
```

### Data Created

#### 1. Organization Record
```sql
INSERT INTO organizations (
  name,
  slug,
  owner_name,
  owner_email,
  owner_user_id,  -- Links to auth user
  plan_id,
  status,
  address,
  city,
  state,
  country
) VALUES (...)
```

#### 2. Auth User (Supabase)
```typescript
await supabase.auth.admin.createUser({
  email: dto.owner_email,
  password: tempPassword,
  email_confirm: true,
  user_metadata: { 
    full_name: name, 
    role: 'org-admin', 
    organization_id: org.id 
  }
});
```

#### 3. User Profile
```sql
INSERT INTO users (
  id,            -- Same as auth.users.id
  email,
  username,
  full_name,
  role,          -- 'org-admin'
  organization_id,
  is_active
) VALUES (...)
```

#### 4. Organization Member
```sql
INSERT INTO organization_members (
  organization_id,
  user_id,
  role,          -- 'owner'
  permissions
) VALUES (...)
```

---

## Welcome Email Content

The welcome email includes:

1. **Organization Details**
   - Organization ID
   - Organization Name
   - Account Type (Organization Owner)

2. **Login Credentials**
   - Email Address
   - Temporary Password

3. **Action Links**
   - Login to Dashboard button
   - Set New Password button

4. **Getting Started Guide**
   - 5-step onboarding checklist

### Email Template Preview

```
┌─────────────────────────────────────────────────────────────────┐
│                      BookingFlow AI                              │
│              Smart Booking Management Platform                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Welcome, [Owner Name]! 🎉                                      │
│                                                                 │
│  Your organization account for [Org Name] has been             │
│  successfully created on BookingFlow AI.                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📋 Your Organization Details                             │   │
│  │                                                          │   │
│  │ Organization ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx   │   │
│  │ Organization Name: [Org Name]                           │   │
│  │ Account Type: Organization Owner                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔐 Your Login Credentials                                │   │
│  │                                                          │   │
│  │ Email: [owner@email.com]                                │   │
│  │ Temp Password: [Auto-generated]                          │   │
│  │                                                          │   │
│  │ ⚠️ Please change your password immediately!             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Login to Dashboard]  [Set New Password]                       │
│                                                                 │
│  🚀 Getting Started                                             │
│  1. Login with your credentials                                │
│  2. Set a new secure password                                  │
│  3. Set up your venue and activities                           │
│  4. Configure your booking widgets                             │
│  5. Start accepting bookings!                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Admin Actions

### Creating an Organization

1. Navigate to **Organizations** page
2. Click **Add Organization** button
3. Fill in the required fields:
   - Organization Name *
   - Owner Name *
   - Owner Email *
   - Plan *
4. Optional fields:
   - Initial Password (auto-generated if blank)
   - Address, City, State, Country
   - Create default venue checkbox
5. Click **Create**

### Resending Welcome Email

1. Navigate to **Organizations** page
2. Find the organization in the list
3. Click the **⋮** (more) menu
4. Select **Resend Welcome Email**
5. Confirm the action

### Resetting Owner Password

1. Navigate to **Organizations** page
2. Find the organization in the list
3. Click the **⋮** (more) menu
4. Select **Reset Password**
5. Choose:
   - **Send Reset Email** - Sends password reset link to owner
   - **Set Password** - Manually set a new password

---

## Edge Functions

### create-org-admin

**Location:** `/supabase/functions/create-org-admin/index.ts`

**Purpose:** Creates a new organization admin user with proper Supabase Auth integration.

**Request:**
```typescript
{
  organization_id: string;
  email: string;
  name: string;
  phone?: string;
  set_password?: string;
  send_welcome_email?: boolean;
  organization_name?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user_id: string;
  temp_password: string;
  reset_link: string;
  login_url: string;
  organization_id: string;
  email_sent: boolean;
  email_error?: string;
  message: string;
}
```

### admin-password-reset

**Location:** `/supabase/functions/admin-password-reset/index.ts`

**Purpose:** Handles admin-initiated password operations.

**Actions:**
- `send_reset` - Send password reset email
- `set_password` - Directly set a new password
- `check_user` - Check if user exists

---

## Frontend Components

### OrganizationModal

**Location:** `/src/features/system-admin/components/organizations/OrganizationModal.tsx`

**Features:**
- Form validation
- Initial password field (optional)
- Create default venue option
- Plan selection
- Status selection

### Organizations Page

**Location:** `/src/pages/Organizations.tsx`

**Features:**
- Grid and Table view modes
- Search and filter
- Pagination
- Organization CRUD operations
- Password reset actions
- Resend welcome email

---

## Services

### OrganizationService

**Location:** `/src/features/system-admin/services/OrganizationService.ts`

**Key Methods:**

```typescript
// Create organization with admin user
static async createComplete(
  dto: CreateOrganizationDTO,
  adminPassword?: string
): Promise<{
  organization: Organization;
  admin_credentials?: {
    email: string;
    temp_password?: string;
    reset_link?: string;
    login_url?: string;
    email_sent?: boolean;
    email_error?: string;
  };
  message?: string;
}>

// Create org admin user via Edge Function
static async createOrgAdmin(params: {
  organization_id: string;
  email: string;
  name: string;
  phone?: string;
  set_password?: string;
  send_welcome_email?: boolean;
  organization_name?: string;
}): Promise<CreateOrgAdminResult>

// Resend welcome email to organization owner
static async resendWelcomeEmail(
  organizationId: string
): Promise<{ success: boolean; message?: string; error?: string; }>
```

---

## Tenant Dashboard Features

After onboarding, organization owners have access to:

### Accessible Features (org-admin role)
- Dashboard with organization metrics
- Venues management
- Activities management
- Bookings management
- Customers list
- Embed widget configuration
- Organization settings

### Hidden Features (system-admin only)
- Organizations management
- Plans management
- System settings
- Platform analytics

---

## Troubleshooting

### Email Not Received

1. Check spam/junk folder
2. Verify email address is correct
3. Use "Resend Welcome Email" action
4. Verify Supabase Auth SMTP configuration in the Supabase dashboard
5. Review edge function logs in Supabase Dashboard

### Login Issues

1. Verify user exists in auth.users
2. Check public.users profile exists
3. Verify organization_id is set
4. Check role assignment
5. Review RLS policies

### Password Reset Issues

1. Use System Admin "Reset Password" action
2. Check admin-password-reset edge function logs
3. Verify SMTP/Resend configuration
4. Generate manual reset link if needed

---

## Security Considerations

1. **Password Generation**
   - 12+ characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Avoids ambiguous characters (0, O, l, 1)

2. **Email Verification**
   - All accounts created with `email_confirm: true`
   - No manual verification needed

3. **Audit Logging**
   - All password operations logged to `audit_logs`
   - Includes who initiated the action

4. **RLS Policies**
   - Tenant isolation at database level
   - System admins can access all organizations
   - Org admins can only access their organization

---

## Related Documentation

- [Multi-Tenant Architecture](/docs/MULTI_TENANT_ARCHITECTURE.md)
- [Multi-Tenant Auth Architecture](/docs/MULTI_TENANT_AUTH_ARCHITECTURE.md)
- [Password Reset Implementation](/docs/PASSWORD_RESET_IMPLEMENTATION.md)
