# BookingTMS - Login Portals & Test Credentials

> Last Updated: 2025-11-29
> Version: v0.1.54

## Quick Reference

| Portal | URL | Auth Required |
|--------|-----|---------------|
| Customer Portal | `/my-bookings` | Email/Phone/Booking Ref |
| Beta Login | `/beta-login` | Username/Password |
| Main Admin | `/` | Role + Any credentials |
| Org Login | `/org-login` | Organization-specific |

---

## 1. Customer Portal (Public)

**URLs:**
- `http://localhost:5173/my-bookings`
- `http://localhost:5173/customer-portal`

**Test Credentials:**

| Method | Value | Notes |
|--------|-------|-------|
| Email | `test@bookingtms.com` | Primary test customer |
| Booking Reference | `BK-TEST-c352` | Confirmed booking for Dec 6 |
| Phone | `+1-555-123-4567` | Alternative lookup |

**Test Booking Details:**
- Activity: Escape The Vault
- Venue: Main Venue
- Date: December 6, 2025 at 2:00 PM
- Party Size: 4
- Status: Confirmed
- Amount: $50.00 (Paid)

---

## 2. Beta Owner Login

**URL:** `http://localhost:5173/beta-login`

| Field | Value |
|-------|-------|
| Username | `betaadmin` |
| Password | `123admin` |

---

## 3. Main Admin Login (Role-Based)

**URL:** `http://localhost:5173/`

Select a role, then use any username + password (6+ chars):

| Role | Access Level | Example Username |
|------|-------------|------------------|
| System Admin | Platform-wide (all orgs) | `systemadmin` |
| Super Admin | Full access + user management | `superadmin` |
| Admin | Full operational access | `admin` |
| Manager | View + limited edit | `manager` |
| Staff | Basic view-only | `staff` |
| Customer | Booking access | `customer` |

**Note:** In development mode, any password 6+ characters works (e.g., `demo123`).

---

## 4. Organization Login

**URL:** `http://localhost:5173/org-login`

For organization-specific authentication.

---

## 5. Booking Widgets (Public)

Embed Pro 2.0 customer-facing widgets:

| Widget Name | URL |
|-------------|-----|
| Netlify Test | `/embed-pro?key=emb_e4cd690cb5c5b753edab85e0` |
| DDD Widget | `/embed-pro?key=emb_e13395ea2d8307a0cd308efe` |
| Special Discount | `/embed-pro?key=emb_18e2f8eb0c10dcb03fab2101` |

---

## 6. Public Venue Profiles

| Venue | Slug URL |
|-------|----------|
| Muhammad Tariqul Islam Sojol | `/muhammad-tariqul-islam-sojol-mihe6emq` |
| Advisor AI - Main Location | `/advisor-ai-main-location-mihjleh6` |
| Marketing Advisor AI - Main | `/marketing-advisor-ai-main-1764209571.488915` |
| Main Venue | `/main-venue-migrk33p` |

---

## Database Users (Real)

| Email | Role | Organization |
|-------|------|--------------|
| marketingadvisorai@gmail.com | Org Admin | Marketing Advisor AI |
| staff_test_xxx@gmail.com | Staff | Test Organization |

---

## Testing Flow

### Customer Portal Test
1. Go to `/my-bookings`
2. Select "Email" tab
3. Enter `test@bookingtms.com`
4. Click "Find My Bookings"
5. View the confirmed booking for Dec 6, 2025

### Admin Dashboard Test
1. Go to `/`
2. Select "Super Admin Login"
3. Enter any username (e.g., `superadmin`)
4. Enter password `demo123`
5. Access full dashboard

### Booking Widget Test
1. Go to `/embed-pro?key=emb_e4cd690cb5c5b753edab85e0`
2. Select date, time, party size
3. Fill customer details
4. Complete Stripe checkout (test card: `4242 4242 4242 4242`)
