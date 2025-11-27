# BookingTMS Admin User Guide

> Version: 0.1.48  
> Last Updated: 2025-11-28

Complete guide for administrators managing BookingTMS.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Activities](#managing-activities)
4. [Managing Bookings](#managing-bookings)
5. [Managing Customers](#managing-customers)
6. [Venues Management](#venues-management)
7. [Payment & Stripe Setup](#payment--stripe-setup)
8. [Widget Configuration](#widget-configuration)
9. [Reports & Analytics](#reports--analytics)
10. [User Roles & Permissions](#user-roles--permissions)

---

## Getting Started

### First-Time Login

1. Navigate to your BookingTMS URL
2. Enter your email and password
3. For new accounts, check your email for the activation link

### Dashboard Navigation

The left sidebar contains all main sections:
- **Dashboard** - Overview metrics and quick actions
- **Bookings** - View and manage all bookings
- **Activities** - Create and edit bookable experiences
- **Customers** - Customer database and history
- **Venues** - Manage physical locations
- **Reports** - Analytics and reporting
- **Settings** - System configuration

---

## Dashboard Overview

### Key Metrics

| Metric | Description |
|--------|-------------|
| **Today's Bookings** | Bookings scheduled for today |
| **Revenue (MTD)** | Month-to-date revenue |
| **Pending Bookings** | Awaiting confirmation |
| **Customer Count** | Total registered customers |

### Quick Actions

- **+ New Booking** - Create manual booking
- **+ New Activity** - Add new experience
- **View Calendar** - See booking calendar
- **Export Report** - Download reports

---

## Managing Activities

### Creating a New Activity

1. Go to **Activities** → Click **+ Add Activity**
2. Complete the wizard steps:

#### Step 1: Basic Info
- **Name**: Activity title (e.g., "Escape Room Challenge")
- **Description**: Detailed description
- **Category**: Select category type
- **Tags**: Add searchable tags

#### Step 2: Capacity & Pricing
- **Min Players**: Minimum group size
- **Max Players**: Maximum capacity
- **Adult Price**: Price per adult
- **Child Price**: Price per child (optional)
- **Duration**: Activity length in minutes

#### Step 3: Activity Details
- **Difficulty Level**: Easy/Medium/Hard/Expert
- **Age Requirement**: Minimum age (if any)
- **FAQs**: Common questions and answers

#### Step 4: Media
- **Cover Image**: Main promotional image (16:9 recommended)
- **Gallery**: Additional images
- **Video URL**: Optional promotional video

#### Step 5: Schedule
- **Operating Days**: Select which days available
- **Start/End Time**: Operating hours
- **Slot Interval**: Time between bookings (30, 60, 90 min)
- **Advance Booking**: How far ahead customers can book
- **Blocked Dates**: Holiday closures, maintenance

#### Step 6: Payment Settings
- **Enable Payments**: Toggle Stripe checkout
- **Deposit Option**: Require deposit vs full payment
- **Cancellation Policy**: Hours before for refund

#### Step 7: Widget & Embed
- **Generate Embed Code**: Get code for your website
- **Customize Colors**: Match your branding
- **Preview Widget**: Test before publishing

#### Step 8: Review & Publish
- Review all settings
- Click **Publish** to make live

### Editing Activities

1. Go to **Activities**
2. Click on activity card or use **⋮** menu
3. Select **Edit**
4. Modify settings and **Save**

### Activity Status

| Status | Meaning |
|--------|---------|
| **Published** | Live and bookable |
| **Draft** | Not visible to customers |
| **Archived** | Hidden but data preserved |

---

## Managing Bookings

### Viewing Bookings

**List View**: Table with all bookings
- Filter by date, status, activity
- Search by customer name or reference
- Sort by any column

**Calendar View**: Visual schedule
- Day/Week/Month views
- Color-coded by status
- Click to view details

### Booking Statuses

| Status | Color | Description |
|--------|-------|-------------|
| **Pending** | Yellow | Awaiting confirmation |
| **Confirmed** | Green | Payment received |
| **Checked In** | Blue | Customer arrived |
| **Completed** | Gray | Activity finished |
| **Cancelled** | Red | Booking cancelled |
| **No Show** | Orange | Customer didn't arrive |

### Creating Manual Booking

1. Click **+ New Booking**
2. Select **Activity**
3. Choose **Date & Time**
4. Enter **Party Size**
5. Enter **Customer Info** (or select existing)
6. Choose **Payment Method**:
   - Cash
   - Card (on-site)
   - Invoice
   - Mark as paid
7. Add **Notes** (optional)
8. Click **Create Booking**

### Modifying Bookings

**Reschedule**:
1. Open booking details
2. Click **Reschedule**
3. Select new date/time
4. Confirm change

**Cancel**:
1. Open booking details
2. Click **Cancel Booking**
3. Select refund option (if paid)
4. Confirm cancellation

**Check In**:
1. Find booking (search or scan QR)
2. Click **Check In**
3. Verify party size
4. Mark as checked in

---

## Managing Customers

### Customer Database

View all customers with:
- Name, email, phone
- Total bookings count
- Total spent
- Last booking date
- Notes

### Customer Profile

Click customer to view:
- **Contact Info**: Edit details
- **Booking History**: All past bookings
- **Payment History**: All transactions
- **Notes**: Internal notes
- **Tags**: Custom labels (VIP, etc.)

### Merging Duplicates

1. Select customers to merge
2. Click **Merge**
3. Choose primary record
4. Confirm merge

### Exporting Customers

1. Click **Export**
2. Select format (CSV, Excel)
3. Choose fields to include
4. Download file

---

## Venues Management

### Adding a Venue

1. Go to **Venues** → **+ Add Venue**
2. Enter details:
   - **Name**: Venue name
   - **Address**: Full address
   - **City/State**: Location
   - **Timezone**: Important for scheduling
   - **Contact**: Phone, email
3. Add **Images**
4. Set **Operating Hours**
5. Configure **Widget Settings**
6. **Save**

### Venue Widget

Each venue gets an embed key for booking widgets:

```
/embed-pro?key={venue-embed-key}
```

This shows all activities at that venue.

---

## Payment & Stripe Setup

### Connecting Stripe

1. Go to **Settings** → **Payments**
2. Click **Connect Stripe**
3. Complete Stripe OAuth flow
4. Return to BookingTMS

### Payment Settings

| Setting | Description |
|---------|-------------|
| **Currency** | Default currency (USD, EUR, etc.) |
| **Tax Rate** | Automatic tax calculation |
| **Platform Fee** | Your platform percentage |
| **Refund Policy** | Automatic refund rules |

### Viewing Payments

1. Go to **Payment History**
2. Filter by date, status, amount
3. Click transaction for details
4. Download receipts

### Handling Refunds

1. Find the booking/payment
2. Click **Refund**
3. Choose:
   - **Full Refund**: 100% back
   - **Partial Refund**: Enter amount
4. Add reason (optional)
5. Confirm refund

---

## Widget Configuration

### Embed Types

| Type | Use Case | URL Pattern |
|------|----------|-------------|
| **Activity Widget** | Single activity booking | `/embed-pro?key={key}&activityId={id}` |
| **Venue Widget** | All venue activities | `/embed-pro?key={key}` |

### Customization Options

1. Go to activity or venue settings
2. Find **Widget Settings**
3. Customize:
   - **Primary Color**: Brand color
   - **Theme**: Light/Dark
   - **Success Message**: Custom thank you text
   - **Redirect URL**: Where to send after booking

### Getting Embed Code

1. Open activity/venue settings
2. Go to **Widget & Embed** section
3. Choose embed type:
   - **HTML**: For static sites
   - **React**: For React apps
   - **WordPress**: Shortcode
   - **iframe**: Universal
4. Copy code
5. Paste into your website

---

## Reports & Analytics

### Available Reports

| Report | Description |
|--------|-------------|
| **Revenue Report** | Income by period |
| **Booking Report** | Booking counts and trends |
| **Customer Report** | Customer acquisition |
| **Activity Report** | Performance by activity |
| **Cancellation Report** | Cancellation analysis |

### Generating Reports

1. Go to **Reports**
2. Select report type
3. Set date range
4. Apply filters (optional)
5. Click **Generate**
6. View charts and data
7. **Export** to CSV/PDF

### Key Metrics

- **Conversion Rate**: Website visits → Bookings
- **Average Order Value**: Revenue per booking
- **Customer Lifetime Value**: Total per customer
- **Utilization Rate**: Booked vs available slots

---

## User Roles & Permissions

### Role Types

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access |
| **Admin** | Manage organization settings |
| **Manager** | Manage bookings, activities, reports |
| **Staff** | View/check-in bookings only |
| **Read Only** | View data only |

### Adding Team Members

1. Go to **Settings** → **Team**
2. Click **+ Invite Member**
3. Enter email
4. Select role
5. Send invitation

### Managing Permissions

1. Go to **Settings** → **Team**
2. Click member name
3. Change role or permissions
4. Save changes

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick search |
| `Ctrl/Cmd + N` | New booking |
| `Ctrl/Cmd + /` | Show shortcuts |
| `Esc` | Close modal |

---

## Support

- **Help Center**: Access from `?` icon
- **Email**: support@yourdomain.com
- **Documentation**: `/docs` folder
- **Video Tutorials**: Coming soon
