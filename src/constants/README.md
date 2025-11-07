# Application Constants

This folder contains all application constants, enums, and configuration values.

## 📁 Structure

```
/constants
├── README.md           # This file
├── index.ts            # Export all constants
├── routes.ts           # Route paths
├── colors.ts           # Design system colors
├── breakpoints.ts      # Responsive breakpoints
├── permissions.ts      # Permission strings
├── roles.ts            # User roles
├── status.ts           # Status enums
├── notifications.ts    # Notification types
├── api.ts              # API endpoints
└── validation.ts       # Validation rules
```

## 🎯 Purpose

Centralize all hardcoded values to:
- Avoid magic strings/numbers
- Make updates easier
- Ensure consistency
- Enable type safety
- Improve maintainability

## 📖 Example Files

### `/constants/routes.ts`
```typescript
export const ROUTES = {
  // Admin Portal
  DASHBOARD: '/dashboard',
  BOOKINGS: '/bookings',
  GAMES: '/games',
  CUSTOMERS: '/customers',
  STAFF: '/staff',
  PAYMENTS: '/payment-history',
  WAIVERS: '/waivers',
  REPORTS: '/reports',
  MARKETING: '/marketing',
  SETTINGS: '/settings',
  ACCOUNT_SETTINGS: '/account-settings',
  
  // Widget
  BOOKING_WIDGETS: '/booking-widgets',
  EMBED: '/embed',
} as const;

export const API_ROUTES = {
  BOOKINGS: '/api/bookings',
  CUSTOMERS: '/api/customers',
  GAMES: '/api/games',
  PAYMENTS: '/api/payments',
  AUTH: '/api/auth',
} as const;
```

### `/constants/colors.ts`
```typescript
// Design System Colors
export const COLORS = {
  // Primary
  PRIMARY_LIGHT: '#4f46e5',
  PRIMARY_DARK: '#6366f1',
  
  // Success
  SUCCESS_LIGHT: '#10b981',
  SUCCESS_DARK: '#34d399',
  
  // Warning
  WARNING_LIGHT: '#f59e0b',
  WARNING_DARK: '#fbbf24',
  
  // Error
  ERROR_LIGHT: '#ef4444',
  ERROR_DARK: '#f87171',
  
  // Dark Mode Backgrounds
  BG_DARK_PRIMARY: '#0a0a0a',
  BG_DARK_SECONDARY: '#161616',
  BG_DARK_TERTIARY: '#1e1e1e',
  
  // Light Mode Backgrounds
  BG_LIGHT_PRIMARY: '#ffffff',
  BG_LIGHT_SECONDARY: '#f9fafb',
} as const;

export type ColorKey = keyof typeof COLORS;
```

### `/constants/status.ts`
```typescript
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Status Labels for Display
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.CHECKED_IN]: 'Checked In',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
  [BOOKING_STATUS.NO_SHOW]: 'No Show',
};

// Status Colors
export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [BOOKING_STATUS.CHECKED_IN]: 'bg-purple-100 text-purple-800',
  [BOOKING_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [BOOKING_STATUS.NO_SHOW]: 'bg-gray-100 text-gray-800',
};
```

### `/constants/permissions.ts`
```typescript
export const PERMISSIONS = {
  // Bookings
  BOOKINGS_VIEW: 'bookings.view',
  BOOKINGS_CREATE: 'bookings.create',
  BOOKINGS_EDIT: 'bookings.edit',
  BOOKINGS_DELETE: 'bookings.delete',
  
  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',
  CUSTOMERS_EXPORT: 'customers.export',
  
  // Games
  GAMES_VIEW: 'games.view',
  GAMES_CREATE: 'games.create',
  GAMES_EDIT: 'games.edit',
  GAMES_DELETE: 'games.delete',
  
  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_REFUND: 'payments.refund',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
```

### `/constants/roles.ts`
```typescript
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.STAFF]: 'Staff',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'Full system access including user management',
  [ROLES.ADMIN]: 'Full operational access (no user management)',
  [ROLES.MANAGER]: 'View and limited edit access',
  [ROLES.STAFF]: 'Basic view-only access',
};
```

### `/constants/breakpoints.ts`
```typescript
export const BREAKPOINTS = {
  XS: 375,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Media queries
export const MEDIA_QUERIES = {
  XS: `(min-width: ${BREAKPOINTS.XS}px)`,
  SM: `(min-width: ${BREAKPOINTS.SM}px)`,
  MD: `(min-width: ${BREAKPOINTS.MD}px)`,
  LG: `(min-width: ${BREAKPOINTS.LG}px)`,
  XL: `(min-width: ${BREAKPOINTS.XL}px)`,
  '2XL': `(min-width: ${BREAKPOINTS['2XL']}px)`,
} as const;
```

### `/constants/validation.ts`
```typescript
export const VALIDATION_RULES = {
  // Email
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MAX_LENGTH: 255,
  
  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
  
  // Phone
  PHONE_REGEX: /^[\d\s\-\(\)\+]+$/,
  PHONE_MIN_LENGTH: 10,
  
  // Booking
  PARTY_SIZE_MIN: 1,
  PARTY_SIZE_MAX: 20,
  BOOKING_NOTES_MAX_LENGTH: 500,
  
  // Names
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  
  // General
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
```

### `/constants/notifications.ts`
```typescript
export const NOTIFICATION_TYPES = {
  BOOKING_NEW: 'booking_new',
  BOOKING_MODIFIED: 'booking_modified',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_CHECKED_IN: 'booking_checked_in',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_REFUNDED: 'payment_refunded',
  MESSAGE_NEW: 'message_new',
  STAFF_SHIFT_REMINDER: 'staff_shift_reminder',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_ALERT: 'system_alert',
  SYSTEM_UPDATE: 'system_update',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES];
```

## 🚀 Usage

### Instead of Magic Strings
```typescript
// ❌ Bad
if (booking.status === 'confirmed') {
  // ...
}

// ✅ Good
import { BOOKING_STATUS } from '@/constants';

if (booking.status === BOOKING_STATUS.CONFIRMED) {
  // ...
}
```

### Type-Safe Enums
```typescript
import { BOOKING_STATUS, type BookingStatus } from '@/constants/status';

function updateStatus(bookingId: string, status: BookingStatus) {
  // status is type-safe
}

// TypeScript will error on invalid status
updateStatus('123', 'invalid'); // ❌ Error
updateStatus('123', BOOKING_STATUS.CONFIRMED); // ✅ OK
```

### Display Labels
```typescript
import { BOOKING_STATUS, BOOKING_STATUS_LABELS } from '@/constants/status';

<Badge>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
```

## ✅ Best Practices

1. **Use `as const`**: Makes values readonly and literal types
2. **Export Types**: Export derived TypeScript types
3. **Group Related**: Keep related constants together
4. **Descriptive Names**: Use clear, descriptive constant names
5. **Documentation**: Add comments for complex constants
6. **No Duplicates**: DRY principle - define once, use everywhere

## 📦 Index File

Create `/constants/index.ts` to export everything:

```typescript
export * from './routes';
export * from './colors';
export * from './status';
export * from './permissions';
export * from './roles';
export * from './breakpoints';
export * from './validation';
export * from './notifications';
```

Then import like:
```typescript
import { ROUTES, BOOKING_STATUS, PERMISSIONS } from '@/constants';
```

---

**Status**: To be populated with constants from codebase
