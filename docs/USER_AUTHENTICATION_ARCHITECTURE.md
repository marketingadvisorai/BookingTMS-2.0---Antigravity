# User Authentication & Password Management Architecture

## Overview

This document describes the authentication, user management, and password reset architecture for BookingTMS. The system uses Supabase Auth with custom edge functions for enhanced functionality.

## Entity Relationships

```
Organization
    ↓
organization_members (junction table)
    ↓
users (auth.users + public.users)
```

## Database Schema

### `public.users` Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (matches auth.users.id) |
| email | varchar | User email |
| full_name | varchar | User's full name |
| role | varchar | User role (system-admin, super-admin, org-admin, manager, staff) |
| organization_id | uuid | Primary organization |
| is_active | boolean | Account status |
| is_platform_team | boolean | Platform team member flag |
| last_login_at | timestamptz | Last login timestamp |
| created_at | timestamptz | Account creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### `public.organization_members` Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| organization_id | uuid | Organization reference |
| user_id | uuid | User reference |
| role | varchar | Role within organization (owner, admin, manager, staff) |
| permissions | jsonb | Granular permissions |
| joined_at | timestamptz | Join date |

## Authentication Flows

### 1. System Admin Login (`/beta-login`)
- Standard Supabase Auth login
- Checks `users.role` for system-admin/super-admin
- Full platform access

### 2. Organization Owner Login (`/:slug/admin`)
- Login via organization slug
- Validates user is member of specific organization
- Checks role is 'owner' in `organization_members`

### 3. Password Reset Flow

```
User → ForgotPassword Page → Supabase Auth → Email → ResetPassword Page → Update Password
```

#### Routes
- `/forgot-password` - General password reset
- `/owner/:slug/forgot-password` - Organization-specific reset (validates email belongs to org)
- `/reset-password` - Set new password after clicking email link

## Edge Functions

### `admin-password-reset`
**Purpose**: Admin-initiated password operations

**Actions**:
- `send_reset` - Send password reset email to user
- `set_password` - Directly set new password (admin override)
- `check_user` - Verify user exists

**Email Delivery Strategy**:
1. Primary: Supabase Auth built-in SMTP
2. Fallback: Resend API (if RESEND_API_KEY configured)
3. Last resort: Return reset link directly to admin

### `invite-organization-member`
**Purpose**: Invite new users to organizations with email delivery

**Features**:
- Creates Supabase Auth user
- Creates user profile in `public.users`
- Adds to `organization_members`
- Sends welcome email with credentials
- Generates password reset link

**Request Body**:
```json
{
  "organization_id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "staff|manager|admin|owner",
  "phone": "+1234567890",
  "password": "optional-custom-password",
  "send_email": true
}
```

### `create-org-admin`
**Purpose**: Create organization owner during organization setup

**Features**:
- Creates admin user with org-admin role
- Links to organization as owner
- Sends welcome email

## Frontend Services

### `passwordService` (`/src/services/password.service.ts`)
- `sendResetEmail(email)` - Self-service password reset
- `updatePassword(newPassword)` - Update password after recovery
- `adminSetPassword(userId, password)` - Admin override
- `adminSendResetEmail(email, userName)` - Admin-initiated reset
- `validatePassword(password)` - Password strength validation

### `userInvitationService` (`/src/services/userInvitation.service.ts`)
- `inviteMember(params)` - Invite user to organization
- `checkUserExists(email)` - Check if user exists
- `checkOrgMembership(email, orgId)` - Verify org membership
- `validateEmailForOrg(email, slug)` - Validate email for org reset
- `resendInvitation(userId, orgId)` - Resend invitation email

## Components

### Admin Components
- `UserPasswordResetModal` - Modal for admin password operations
- `OrganizationModal` - Create/edit organization with owner

### Public Pages
- `ForgotPassword` - General password reset request
- `OwnerForgotPassword` - Organization-specific reset (validates membership)
- `ResetPassword` - Set new password from email link
- `OwnerAdminLogin` - Organization owner login

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Considerations

1. **Rate Limiting**: Supabase Auth handles rate limiting for reset emails
2. **Token Expiry**: Reset tokens expire after 24 hours
3. **Organization Validation**: Owner reset validates email belongs to org
4. **Admin Authorization**: Admin functions require system-admin or super-admin role
5. **Audit Logging**: Password operations are logged to `audit_logs` table

## Environment Variables

### Required for Email Delivery
```bash
RESEND_API_KEY=re_xxxxx           # Optional: For branded emails
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx   # For edge functions only
```

### Frontend
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

## Troubleshooting

### Password Reset Emails Not Arriving
1. Check Supabase Auth SMTP configuration
2. Verify RESEND_API_KEY is set in Supabase secrets
3. Check spam/junk folders
4. Use fallback link if email delivery fails

### Invalid Reset Link
1. Link expired (24 hour limit)
2. Token already used
3. URL parameters corrupted
4. Session not properly established

### User Not Found During Reset
1. Email not in auth.users
2. User not in organization_members (for org-specific reset)
3. Case sensitivity in email comparison

## Version History
- **v0.1.47** (Nov 30, 2025): Complete password management system with organization validation
