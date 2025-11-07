# BookingTMS Frontend

**React + TypeScript + Tailwind CSS frontend application for BookingTMS**

---

## 📁 Structure

```
/frontend
├── README.md                   # This file
├── ARCHITECTURE.md             # Frontend architecture guide
├── MIGRATION_GUIDE.md          # Guide to migrate existing code
├── src/                        # Source code
│   ├── pages/                  # Page components (17 pages)
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Shadcn/UI base components
│   │   ├── layout/             # Layout components (AdminLayout, Header, Sidebar)
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── bookings/           # Booking-related components
│   │   ├── customers/          # Customer management components
│   │   ├── games/              # Games/rooms components
│   │   ├── payments/           # Payment components
│   │   ├── notifications/      # Notification components
│   │   ├── waivers/            # Waiver components
│   │   ├── widgets/            # Customer-facing booking widgets
│   │   └── auth/               # Authentication components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useTheme.ts         # Theme management hook
│   │   ├── useNotifications.ts # Notifications hook
│   │   ├── useBookings.ts      # Bookings data hook
│   │   ├── useLocalStorage.ts  # LocalStorage wrapper
│   │   ├── useDebounce.ts      # Debounce utility
│   │   └── useMediaQuery.ts    # Responsive hooks
│   ├── contexts/               # React context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── ThemeContext.tsx    # Theme (light/dark) state
│   │   ├── NotificationContext.tsx # Notification state
│   │   ├── WidgetThemeContext.tsx  # Widget theme state
│   │   ├── WidgetConfigContext.tsx # Widget configuration
│   │   └── AppProvider.tsx     # Root provider (compose all)
│   ├── services/               # Frontend API clients
│   │   ├── api/                # API service clients
│   │   │   ├── base.ts         # Base API client (axios/fetch)
│   │   │   ├── bookings.ts     # Booking API calls
│   │   │   ├── customers.ts    # Customer API calls
│   │   │   ├── games.ts        # Games API calls
│   │   │   ├── payments.ts     # Payment API calls
│   │   │   └── auth.ts         # Auth API calls
│   │   ├── storage/            # Browser storage
│   │   │   └── localStorage.ts # LocalStorage wrapper
│   │   └── external/           # External integrations
│   │       ├── stripe.ts       # Stripe client-side
│   │       └── analytics.ts    # Analytics service
│   ├── constants/              # Application constants
│   │   ├── routes.ts           # Route definitions
│   │   ├── colors.ts           # Design system colors
│   │   ├── status.ts           # Status enums
│   │   ├── permissions.ts      # Permission strings
│   │   ├── roles.ts            # User roles
│   │   └── validation.ts       # Validation rules
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Auth types
│   │   ├── notifications.ts    # Notification types
│   │   ├── payment.ts          # Payment types
│   │   ├── booking.ts          # Booking types
│   │   ├── customer.ts         # Customer types
│   │   └── index.ts            # Export all types
│   ├── lib/                    # Utility functions & helpers
│   │   ├── utils.ts            # General utilities
│   │   ├── cn.ts               # className utility
│   │   ├── formatters.ts       # Data formatting
│   │   └── validators.ts       # Client-side validation
│   ├── styles/                 # Global styles
│   │   ├── globals.css         # Global CSS + Tailwind
│   │   └── themes.css          # Theme variables
│   ├── assets/                 # Static assets (images, fonts)
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   └── config/                 # Frontend configuration
│       ├── app.config.ts       # App settings
│       └── env.ts              # Environment variables
├── public/                     # Public static files
│   ├── images/
│   ├── icons/
│   │   ├── favicon.ico
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── manifest.json           # PWA manifest
├── tests/                      # Frontend tests
│   ├── unit/                   # Unit tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
└── index.tsx                   # Entry point
```

---

## 🎯 Purpose

The frontend folder contains all **client-side code** that runs in the browser:

- **Pages** - Route-level components for each page
- **Components** - Reusable UI building blocks
- **Hooks** - Custom React hooks for logic reuse
- **Contexts** - Global state management
- **Services** - API clients and external integrations
- **Constants** - Application-wide constants
- **Types** - TypeScript type definitions
- **Styles** - Global CSS and Tailwind styles

---

## 🏗️ Architecture

### Component Hierarchy

```
App.tsx
└── AppProvider (contexts)
    └── AdminLayout (layout)
        ├── Sidebar (navigation)
        ├── Header (top bar)
        └── Page Components
            ├── Dashboard
            ├── Bookings
            ├── Customers
            └── ...
```

### Data Flow

```
User Interaction
   ↓
Component
   ↓
Custom Hook (e.g., useBookings)
   ↓
API Service (e.g., bookingService)
   ↓
HTTP Request to Backend API
   ↓
Backend Service
   ↓
Database
```

### State Management

```
Global State:
- AuthContext → User authentication
- ThemeContext → Light/dark theme
- NotificationContext → Notifications

Local State:
- useState/useReducer in components
- React Query/SWR for server state (optional)
```

---

## 🎨 Design System

### Theme Management

The frontend uses a comprehensive theme system:

```typescript
// Light Mode
- Background: #ffffff (white)
- Cards: #ffffff with border-gray-200
- Inputs: bg-gray-100 border-gray-300
- Text Primary: text-gray-900
- Text Secondary: text-gray-600
- Primary Color: #4f46e5 (indigo)

// Dark Mode
- Background: #0a0a0a (deepest black)
- Cards: #161616 (dark gray)
- Elevated: #1e1e1e (lighter gray)
- Text Primary: text-white
- Text Secondary: text-gray-400
- Primary Color: #4f46e5 (vibrant blue)
```

### 3-Tier Background System (Dark Mode)

```
Level 1: #0a0a0a (Main app background)
Level 2: #161616 (Cards, containers)
Level 3: #1e1e1e (Modals, dropdowns, elevated elements)
```

---

## 🚀 Key Features

### 1. Dark Mode Support

Every component supports dark mode:

```typescript
import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={isDark ? 'bg-[#161616] text-white' : 'bg-white text-gray-900'}>
      Content
    </div>
  );
}
```

### 2. Role-Based Access Control (RBAC)

Components use permission guards:

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export function AdminPanel() {
  const { hasPermission } = useAuth();
  
  return (
    <PermissionGuard permissions={['bookings.edit']}>
      <EditButton />
    </PermissionGuard>
  );
}
```

### 3. Real-Time Notifications

Notification system with multiple channels:

```typescript
import { useNotifications } from '@/contexts/NotificationContext';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <button>
      <Bell />
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </button>
  );
}
```

### 4. Responsive Design

Mobile-first approach:

```typescript
// Mobile first, then tablet, then desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### 5. Type Safety

Full TypeScript coverage:

```typescript
// types/booking.ts
export interface Booking {
  id: string;
  customer_id: string;
  game_id: string;
  booking_date: string;
  status: BookingStatus;
}

export type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
```

---

## 📖 Component Examples

### Page Component

```typescript
// src/pages/Dashboard.tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/dashboard/KPICard';
import { useTheme } from '@/contexts/ThemeContext';
import { DollarSign, Users, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <PageHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's your business overview."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value="$12,543"
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title="Active Bookings"
          value="48"
          change="+8.2%"
          icon={Calendar}
          trend="up"
        />
        <KPICard
          title="Total Customers"
          value="1,234"
          change="+5.4%"
          icon={Users}
          trend="up"
        />
      </div>
    </AdminLayout>
  );
}
```

### Reusable Component

```typescript
// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const baseClasses = 'rounded-lg font-medium transition-colors';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };
    
    const variantClasses = {
      primary: isDark 
        ? 'bg-[#4f46e5] hover:bg-[#6366f1] text-white'
        : 'bg-[#4f46e5] hover:bg-[#4338ca] text-white',
      secondary: isDark
        ? 'bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      outline: isDark
        ? 'border border-gray-700 hover:bg-[#1e1e1e] text-white'
        : 'border border-gray-300 hover:bg-gray-50 text-gray-900',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Custom Hook

```typescript
// src/hooks/useBookings.ts
import { useState, useEffect } from 'react';
import { bookingService } from '@/services/api/bookings';
import type { Booking } from '@/types/booking';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (data: CreateBookingDTO) => {
    const booking = await bookingService.create(data);
    setBookings([...bookings, booking]);
    return booking;
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    const booking = await bookingService.update(id, updates);
    setBookings(bookings.map(b => b.id === id ? booking : b));
    return booking;
  };

  const deleteBooking = async (id: string) => {
    await bookingService.delete(id);
    setBookings(bookings.filter(b => b.id !== id));
  };

  return {
    bookings,
    loading,
    error,
    refresh: loadBookings,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
```

### API Service

```typescript
// src/services/api/bookings.ts
import { apiClient } from './base';
import type { Booking, CreateBookingDTO } from '@/types/booking';

export const bookingService = {
  async getAll(filters?: BookingFilters): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/bookings', { params: filters });
  },

  async getById(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  },

  async create(data: CreateBookingDTO): Promise<Booking> {
    return apiClient.post<Booking>('/bookings', data);
  },

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/bookings/${id}`);
  },
};
```

---

## 🎯 Design Guidelines Compliance

### 1. Explicit Styling Override ⭐ CRITICAL

**Always explicitly set design system colors** to override base component defaults:

```typescript
// ❌ WRONG - Relies on component defaults
<Input placeholder="Email" />
<Label>Name</Label>
<Card>Content</Card>

// ✅ CORRECT - Explicitly sets design system colors
<Input 
  className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
  placeholder="Email" 
/>
<Label className="text-gray-700">Name</Label>
<Card className="bg-white border border-gray-200 shadow-sm">
  Content
</Card>
```

### 2. Light Mode Colors

**Standard Component Colors:**

```typescript
// Input Fields
className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"

// Cards & Containers
className="bg-white border border-gray-200 shadow-sm rounded-lg"

// Labels
className="text-gray-700"

// Secondary Text
className="text-gray-600"

// Summary/Total Boxes
className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
```

### 3. Dark Mode Colors

**3-Tier Background System:**

```typescript
// Main background
className="bg-[#0a0a0a]"

// Cards, containers
className="bg-[#161616]"

// Modals, elevated elements
className="bg-[#1e1e1e]"

// Primary actions (always vibrant blue)
className="bg-[#4f46e5]"
```

### 4. Responsive Design

**Mobile-first approach:**

```typescript
// ✅ Correct - Mobile first
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ��� Wrong - Desktop first
<div className="grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

### 5. Typography

**Let globals.css handle default typography** (don't override unless requested):

```typescript
// ✅ Correct - Use semantic HTML
<h1>Page Title</h1>
<h2>Section Title</h2>
<p>Body text</p>

// ❌ Wrong - Manual typography
<h1 className="text-2xl font-bold">Page Title</h1>
```

---

## 📦 Dependencies

### Core
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** or **Next.js** - Routing

### UI Components
- **Shadcn/UI** - Component library
- **Lucide React** - Icons
- **Radix UI** - Headless components

### State Management
- **React Context** - Global state
- **React Query** (optional) - Server state

### API & Data
- **Axios** - HTTP client
- **Zod** - Schema validation

### Utilities
- **clsx** - Conditional classNames
- **date-fns** - Date formatting
- **sonner** - Toast notifications

---

## 🧪 Testing

### Unit Tests
```typescript
// tests/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// tests/integration/bookings.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BookingList } from '@/pages/Bookings';

describe('BookingList', () => {
  it('loads and displays bookings', async () => {
    render(<BookingList />);
    
    await waitFor(() => {
      expect(screen.getByText('BK-001')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

### 3. Run Tests
```bash
npm test
```

### 4. Lint Code
```bash
npm run lint
```

---

## 📝 File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `Button.tsx`, `Dashboard.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatters.ts`)
- **Constants**: `camelCase.ts` (e.g., `routes.ts`)
- **Types**: `camelCase.ts` (e.g., `booking.ts`)

---

## 🔗 Integration Points

### Backend API
Frontend services call backend API routes:
```
Frontend Service → /api/* → Backend Service → Database
```

### Supabase
Direct integration for auth and real-time:
```typescript
import { supabase } from '@/lib/supabase/client';
```

### External Services
- **Stripe** - Payment processing
- **SendGrid** - Email notifications
- **Twilio** - SMS notifications

---

## ✅ Best Practices

1. **Component Organization**: One component per file
2. **Prop Types**: Always use TypeScript interfaces
3. **Error Boundaries**: Wrap components in error boundaries
4. **Code Splitting**: Use React.lazy for large components
5. **Accessibility**: Always include ARIA labels
6. **Performance**: Memoize expensive computations
7. **Testing**: Aim for 80%+ coverage

---

## 🆘 Troubleshooting

### Dark Mode Not Working
1. Check ThemeContext is imported
2. Verify theme variable is used
3. Test theme toggle

### Styling Issues
1. Ensure explicit className overrides
2. Check Tailwind classes are correct
3. Verify dark mode classes

### API Calls Failing
1. Check API service configuration
2. Verify authentication token
3. Check CORS settings

---

## 📚 Additional Resources

- **Guidelines**: `/guidelines/Guidelines.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Library**: `/guidelines/COMPONENT_LIBRARY.md`
- **Backend API**: `/backend/README.md`

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0  
**Maintained By**: BookingTMS Frontend Team
