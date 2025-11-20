# Frontend Architecture

**Enterprise-grade frontend architecture for BookingTMS**

---

## 🎯 Overview

BookingTMS frontend follows a **component-based architecture** with clear separation of concerns, leveraging React, TypeScript, and Tailwind CSS for a modern, maintainable codebase.

---

## 🏗️ Architecture Patterns

### 1. Component-Based Architecture

```
┌─────────────────────────────────────────┐
│          Application Layer               │
│  ┌─────────────────────────────────┐   │
│  │        App.tsx (Router)          │   │
│  └─────────────────────────────────┘   │
│                  ↓                       │
│  ┌─────────────────────────────────┐   │
│  │    AppProvider (Contexts)        │   │
│  │  • Auth • Theme • Notifications  │   │
│  └─────────────────────────────────┘   │
│                  ↓                       │
│  ┌─────────────────────────────────┐   │
│  │      Layout Components           │   │
│  │  AdminLayout → Sidebar + Header  │   │
│  └─────────────────────────────────┘   │
│                  ↓                       │
│  ┌─────────────────────────────────┐   │
│  │        Page Components           │   │
│  │  Dashboard, Bookings, etc.       │   │
│  └─────────────────────────────────┘   │
│                  ↓                       │
│  ┌─────────────────────────────────┐   │
│  │      Feature Components          │   │
│  │  KPICard, BookingTable, etc.     │   │
│  └─────────────────────────────────┘   │
│                  ↓                       │
│  ┌─────────────────────────────────┐   │
│  │        Base UI Components        │   │
│  │  Button, Input, Card, etc.       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 2. Data Flow Architecture

```
┌──────────────┐
│ User Action  │
└──────┬───────┘
       ↓
┌──────────────────────────┐
│   Component Event        │
│   (onClick, onChange)    │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   Custom Hook            │
│   (useBookings)          │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   API Service            │
│   (bookingService)       │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   HTTP Request           │
│   (axios/fetch)          │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   Backend API            │
│   (/api/bookings)        │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   Backend Service        │
│   (BookingService)       │
└──────┬───────────────────┘
       ↓
┌──────────────────────────┐
│   Database               │
│   (Supabase/PostgreSQL)  │
└──────────────────────────┘
```

### 3. State Management Architecture

```
┌─────────────────────────────────────┐
│         Global State                 │
│  (React Context API)                │
│  ┌─────────────────────────────┐   │
│  │  AuthContext                │   │
│  │  • currentUser              │   │
│  │  • isAuthenticated          │   │
│  │  • permissions              │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  ThemeContext               │   │
│  │  • theme (light/dark)       │   │
│  │  • setTheme                 │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  NotificationContext        │   │
│  │  • notifications            │   │
│  │  • unreadCount              │   │
│  │  • markAsRead               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        Component State               │
│  (useState/useReducer)              │
│  • Form inputs                      │
│  • UI states (modals, tabs)         │
│  • Local data                       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Server State                 │
│  (Custom Hooks + Services)          │
│  • API data (bookings, customers)   │
│  • Loading states                   │
│  • Error states                     │
│  • Cache (optional: React Query)    │
└─────────────────────────────────────┘
```

---

## 📦 Module Organization

### Pages (Route-Level Components)

**Purpose**: Top-level components rendered by router

**Structure**:
```
/pages
├── Dashboard.tsx          # Main dashboard
├── Bookings.tsx           # Bookings management
├── Customers.tsx          # Customer management
└── ...
```

**Responsibilities**:
- ✅ Fetch page-level data
- ✅ Handle routing
- ✅ Compose feature components
- ✅ Manage page-level state
- ❌ NO complex business logic
- ❌ NO direct API calls (use hooks)

**Example**:
```typescript
// pages/Dashboard.tsx
export default function Dashboard() {
  const { bookings, loading } = useBookings();
  
  return (
    <AdminLayout>
      <PageHeader title="Dashboard" />
      <BookingStats bookings={bookings} loading={loading} />
    </AdminLayout>
  );
}
```

---

### Components (Reusable UI)

**Purpose**: Reusable building blocks

**Structure**:
```
/components
├── ui/              # Base components (Button, Input, Card)
├── layout/          # Layout components (AdminLayout, Sidebar)
├── dashboard/       # Dashboard-specific components
├── bookings/        # Booking-specific components
└── ...
```

**Types of Components**:

#### 1. Base UI Components (`/components/ui`)
- **Purpose**: Primitive components (Shadcn/UI)
- **Examples**: Button, Input, Card, Dialog
- **Characteristics**: Highly reusable, no business logic

#### 2. Layout Components (`/components/layout`)
- **Purpose**: Page structure and navigation
- **Examples**: AdminLayout, Sidebar, Header
- **Characteristics**: Composition, responsive

#### 3. Feature Components (`/components/dashboard`, `/components/bookings`)
- **Purpose**: Feature-specific, domain logic
- **Examples**: KPICard, BookingTable, CustomerForm
- **Characteristics**: Business logic, data display

**Component Best Practices**:
```typescript
// ✅ Good Component
export function BookingCard({ booking, onEdit }: Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Card className={isDark ? 'bg-[#161616]' : 'bg-white'}>
      {/* Content */}
    </Card>
  );
}

// ❌ Bad Component (mixing concerns)
export function BookingCard({ bookingId }: Props) {
  const [booking, setBooking] = useState();
  
  useEffect(() => {
    // Fetching data in component (should use hook)
    fetch(`/api/bookings/${bookingId}`).then(/* ... */);
  }, []);
  
  return <Card>{/* ... */}</Card>;
}
```

---

### Hooks (Logic Reuse)

**Purpose**: Encapsulate reusable logic

**Structure**:
```
/hooks
├── useAuth.ts           # Authentication
├── useTheme.ts          # Theme management
├── useBookings.ts       # Bookings data
├── useDebounce.ts       # Debounce utility
└── ...
```

**Hook Patterns**:

#### 1. Data Hooks (API Interaction)
```typescript
// hooks/useBookings.ts
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
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, refresh: loadBookings };
}
```

#### 2. Context Hooks (State Access)
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 3. Utility Hooks (Reusable Logic)
```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

---

### Contexts (Global State)

**Purpose**: Share state across component tree

**Structure**:
```
/contexts
├── AuthContext.tsx            # User authentication
├── ThemeContext.tsx           # Light/dark theme
├── NotificationContext.tsx    # Notifications
└── AppProvider.tsx            # Compose all providers
```

**Context Pattern**:
```typescript
// contexts/ThemeContext.tsx
interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

### Services (API Clients)

**Purpose**: Handle external communication

**Structure**:
```
/services
├── api/
│   ├── base.ts          # Base HTTP client
│   ├── bookings.ts      # Booking API
│   └── customers.ts     # Customer API
├── storage/
│   └── localStorage.ts  # Browser storage
└── external/
    └── stripe.ts        # External services
```

**Service Pattern**:
```typescript
// services/api/bookings.ts
import { apiClient } from './base';

export const bookingService = {
  async getAll(filters?: BookingFilters): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/bookings', { params: filters });
  },

  async create(data: CreateBookingDTO): Promise<Booking> {
    return apiClient.post<Booking>('/bookings', data);
  },

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  },
};
```

**Benefits**:
- ✅ Centralized API logic
- ✅ Easy to mock in tests
- ✅ Type-safe responses
- ✅ Consistent error handling

---

## 🔄 Request-Response Cycle

### Complete Flow Example: Creating a Booking

```
1. User fills booking form
   ↓
2. Component calls hook
   const { createBooking } = useBookings();
   ↓
3. Hook calls service
   await bookingService.create(data);
   ↓
4. Service makes HTTP request
   POST /api/bookings
   ↓
5. Next.js API route receives request
   /api/bookings/index.ts
   ↓
6. API route authenticates user
   const user = await authenticate(req);
   ↓
7. API route calls backend service
   BookingService.createBooking(data, orgId, userId)
   ↓
8. Backend service validates data
   this.validateBookingData(data);
   ↓
9. Backend service checks availability
   await this.checkAvailability(...)
   ↓
10. Backend service creates record
    await supabase.from('bookings').insert(...)
    ↓
11. Backend sends notifications
    await this.sendBookingConfirmation(...)
    ↓
12. Response flows back up
    Service → Hook → Component → UI Update
```

---

## 🎨 Design System Integration

### Theme System

```typescript
// 1. ThemeContext provides global theme state
<ThemeProvider>
  {/* App */}
</ThemeProvider>

// 2. Components consume theme
const { theme } = useTheme();
const isDark = theme === 'dark';

// 3. Apply conditional classes
<div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
```

### Color System

```typescript
// Light Mode
const lightModeClasses = {
  background: 'bg-white',
  card: 'bg-white border border-gray-200',
  input: 'bg-gray-100 border-gray-300',
  text: 'text-gray-900',
  textSecondary: 'text-gray-600',
};

// Dark Mode (3-tier backgrounds)
const darkModeClasses = {
  background: 'bg-[#0a0a0a]',      // Deepest
  card: 'bg-[#161616]',             // Mid
  elevated: 'bg-[#1e1e1e]',         // Lightest
  text: 'text-white',
  textSecondary: 'text-gray-400',
  primary: 'bg-[#4f46e5]',          // Vibrant blue
};
```

---

## 🔒 Security Architecture

### 1. Authentication Flow

```
Login Request
   ↓
API Route (/api/auth/login)
   ↓
Supabase Auth
   ↓
JWT Token Generated
   ↓
Token Stored (localStorage)
   ↓
AuthContext Updated
   ↓
User Redirected to Dashboard
```

### 2. Protected Routes

```typescript
// App.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 3. Permission Guards

```typescript
// Component level
<PermissionGuard permissions={['bookings.edit']}>
  <EditButton />
</PermissionGuard>

// Hook level
const { hasPermission } = useAuth();
const canEdit = hasPermission('bookings.edit');
```

---

## 📊 Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load large components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Bookings = lazy(() => import('@/pages/Bookings'));

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 2. Memoization

```typescript
// Expensive computations
const totalRevenue = useMemo(() => {
  return bookings.reduce((sum, b) => sum + b.amount, 0);
}, [bookings]);

// Component memoization
const BookingCard = memo(({ booking }: Props) => {
  return <Card>{/* ... */}</Card>;
});
```

### 3. Virtual Scrolling

```typescript
// For long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={bookings.length}
  itemSize={100}
>
  {({ index, style }) => (
    <div style={style}>
      <BookingCard booking={bookings[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🧪 Testing Strategy

### 1. Unit Tests (70%)
- Test individual components
- Test hooks
- Test utilities

### 2. Integration Tests (20%)
- Test component combinations
- Test data flows
- Test API interactions

### 3. E2E Tests (10%)
- Test complete user flows
- Test critical paths
- Test authentication

---

## 🚀 Deployment Architecture

```
Development
   ↓
Git Push
   ↓
CI/CD Pipeline
   ├─ Run Tests
   ├─ Build Frontend
   ├─ Type Check
   └─ Lint Code
   ↓
Deploy to Vercel/AWS
   ├─ Static Assets → CDN
   ├─ API Routes → Serverless
   └─ Environment Variables
   ↓
Production
```

---

## 📚 Best Practices Summary

### Components
- ✅ Single responsibility
- ✅ Explicit prop types
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Accessibility (ARIA labels)

### Hooks
- ✅ Reusable logic only
- ✅ Clear naming (useXxx)
- ✅ Proper dependencies
- ✅ Error handling

### Services
- ✅ Type-safe APIs
- ✅ Centralized error handling
- ✅ Consistent response format
- ✅ Easy to mock

### State Management
- ✅ Context for global state
- ✅ Local state for UI
- ✅ Server state for API data
- ✅ Minimize re-renders

---

**Last Updated**: November 4, 2025  
**Maintained By**: BookingTMS Frontend Team
