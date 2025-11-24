# Access Guide for BookingTMS Beta

## Application URL
The application is running locally at:
**[http://localhost:3001](http://localhost:3001)**

## Login Credentials (Demo Mode)

### 1. System Administrator
Use this account to manage organizations, plans, and platform-wide settings.

*   **Login Page**: [http://localhost:3001/login](http://localhost:3001/login)
*   **Role Selection**: Select "System Admin Login" or "Super Admin Login"
*   **Username**: `superadmin`
*   **Password**: `demo123`

### 2. Organization Administrator (Beta Owner)
Use this account to manage a specific organization's venues, events, and bookings.

*   **Login Page**: [http://localhost:3001/beta-login](http://localhost:3001/beta-login)
*   **Username**: `betaadmin`
*   **Password**: `123admin`

## Organization Registration

Currently, new organizations must be provisioned by a System Administrator. There is no public self-registration page enabled in this beta version.

**How to Register a New Organization:**

1.  Log in as a **System Administrator** (credentials above).
2.  Navigate to the **Organizations** tab in the dashboard.
3.  Click the **"Add Owner"** (or "Create Organization") button.
4.  Fill in the required details:
    *   **Organization Name**: Name of the business.
    *   **Owner Name**: Name of the primary admin.
    *   **Email**: Contact email.
    *   **Plan**: Select a subscription plan.
    *   **Default Venue Name**: (Optional) Enter a custom name for the initial venue.
5.  Ensure **"Create User Account"** is checked to generate login credentials for the new Org Admin.
6.  Click **"Add Owner"** to complete the process.

The new organization will be created with a default venue and the specified administrator account.
