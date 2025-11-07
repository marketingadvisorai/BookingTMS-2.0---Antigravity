# Frontend Migration Guide

**Step-by-step guide to migrate existing code into the `/frontend` folder structure**

---

## 🎯 Overview

This guide explains how to reorganize the existing BookingTMS codebase into a proper `/frontend` folder structure following enterprise best practices.

**Current State**: Files scattered at root level  
**Target State**: Organized `/frontend` folder with clear separation

---

## 📋 Migration Checklist

### Phase 1: Create Frontend Structure (30 minutes)

#### 1. Create Base Folders
```bash
mkdir -p frontend/src/{pages,components,hooks,contexts,services,constants,types,lib,styles,assets,config}
mkdir -p frontend/src/components/{ui,layout,dashboard,bookings,customers,games,payments,notifications,waivers,widgets,auth}
mkdir -p frontend/src/services/{api,storage,external}
mkdir -p frontend/public/{images,icons}
mkdir -p frontend/tests/{unit,integration,e2e}
```

#### 2. Create Index Files
```bash
touch frontend/src/index.tsx
touch frontend/src/hooks/index.ts
touch frontend/src/contexts/index.ts
touch frontend/src/services/index.ts
touch frontend/src/constants/index.ts
touch frontend/src/types/index.ts
```

---

### Phase 2: Move Page Components (1 hour)

**Source**: `/pages/*`  
**Destination**: `/frontend/src/pages/*`

```bash
# Move all pages
mv pages/Dashboard.tsx frontend/src/pages/
mv pages/Bookings.tsx frontend/src/pages/
mv pages/Customers.tsx frontend/src/pages/
mv pages/Games.tsx frontend/src/pages/
mv pages/Staff.tsx frontend/src/pages/
mv pages/PaymentHistory.tsx frontend/src/pages/
mv pages/Waivers.tsx frontend/src/pages/
mv pages/Reports.tsx frontend/src/pages/
mv pages/Marketing.tsx frontend/src/pages/
mv pages/Campaigns.tsx frontend/src/pages/
mv pages/Media.tsx frontend/src/pages/
mv pages/AIAgents.tsx frontend/src/pages/
mv pages/Team.tsx frontend/src/pages/
mv pages/Settings.tsx frontend/src/pages/
mv pages/AccountSettings.tsx frontend/src/pages/
mv pages/MyAccount.tsx frontend/src/pages/
mv pages/ProfileSettings.tsx frontend/src/pages/
mv pages/Billing.tsx frontend/src/pages/
mv pages/Notifications.tsx frontend/src/pages/
mv pages/BookingWidgets.tsx frontend/src/pages/
mv pages/Embed.tsx frontend/src/pages/
```

**Files to Move**: 21 files

**After Moving**:
- [ ] Update import paths in each file
- [ ] Test each page loads correctly

---

### Phase 3: Move Components (2 hours)

#### UI Components
**Source**: `/components/ui/*`  
**Destination**: `/frontend/src/components/ui/*`

```bash
mv components/ui frontend/src/components/
```

**Files**: ~50 Shadcn UI components

#### Layout Components
**Source**: `/components/layout/*`  
**Destination**: `/frontend/src/components/layout/*`

```bash
mv components/layout frontend/src/components/
```

**Files to Move**:
- `AdminLayout.tsx`
- `Header.tsx`
- `Sidebar.tsx`
- `PageHeader.tsx`
- `MobileBottomNav.tsx`
- `ThemeContext.tsx` (will move to contexts later)
- `ThemeToggle.tsx`

#### Feature Components
```bash
# Dashboard
mv components/dashboard frontend/src/components/

# Customers
mv components/customers frontend/src/components/

# Games
mv components/games frontend/src/components/

# Payments
mv components/payments frontend/src/components/

# Notifications
mv components/notifications frontend/src/components/

# Waivers
mv components/waivers frontend/src/components/

# Widgets
mv components/widgets frontend/src/components/

# Auth
mv components/auth frontend/src/components/
```

**After Moving**:
- [ ] Update all import paths
- [ ] Verify component references

---

### Phase 4: Move Contexts (30 minutes)

**Source**: Multiple locations  
**Destination**: `/frontend/src/contexts/`

#### Files to Move:
```bash
# From components/layout
mv components/layout/ThemeContext.tsx frontend/src/contexts/

# From lib/auth
mv lib/auth/AuthContext.tsx frontend/src/contexts/
mv lib/auth/AuthContext.supabase.tsx frontend/src/contexts/

# From lib/notifications
mv lib/notifications/NotificationContext.tsx frontend/src/contexts/

# From components/widgets
mv components/widgets/WidgetThemeContext.tsx frontend/src/contexts/
mv components/widgets/WidgetConfigContext.tsx frontend/src/contexts/
```

#### Create AppProvider
Create `/frontend/src/contexts/AppProvider.tsx`:

```typescript
import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { WidgetThemeProvider } from './WidgetThemeContext';
import { WidgetConfigProvider } from './WidgetConfigContext';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <WidgetThemeProvider>
            <WidgetConfigProvider>
              {children}
            </WidgetConfigProvider>
          </WidgetThemeProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

#### Create Index File
Create `/frontend/src/contexts/index.ts`:

```typescript
export { AuthProvider, useAuth } from './AuthContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { NotificationProvider, useNotifications } from './NotificationContext';
export { WidgetThemeProvider, useWidgetTheme } from './WidgetThemeContext';
export { WidgetConfigProvider, useWidgetConfig } from './WidgetConfigContext';
export { AppProvider } from './AppProvider';
```

**After Moving**:
- [ ] Update all context imports
- [ ] Test context functionality
- [ ] Verify theme switching works
- [ ] Test authentication flow

---

### Phase 5: Create Hooks (1 hour)

**Source**: Extract from contexts and lib  
**Destination**: `/frontend/src/hooks/`

#### Extract Hooks from Contexts

Create individual hook files:

**`/frontend/src/hooks/useAuth.ts`**:
```typescript
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**`/frontend/src/hooks/useTheme.ts`**:
```typescript
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

**`/frontend/src/hooks/useNotifications.ts`**:
```typescript
import { useContext } from 'react';
import { NotificationContext } from '@/contexts/NotificationContext';

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
```

#### Create New Utility Hooks

**`/frontend/src/hooks/useLocalStorage.ts`**:
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

**`/frontend/src/hooks/useDebounce.ts`**:
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**`/frontend/src/hooks/useMediaQuery.ts`**:
```typescript
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

#### Create Index File
Create `/frontend/src/hooks/index.ts`:

```typescript
export { useAuth } from './useAuth';
export { useTheme } from './useTheme';
export { useNotifications } from './useNotifications';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce } from './useDebounce';
export { useMediaQuery } from './useMediaQuery';
```

**After Creating**:
- [ ] Update all hook imports
- [ ] Test each hook

---

### Phase 6: Create Services (1.5 hours)

**Destination**: `/frontend/src/services/`

#### Base API Client
Create `/frontend/src/services/api/base.ts`:

```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor (add auth token)
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor (handle errors)
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### API Services
Create service files for each resource (see `/services/README.md` for examples):

- `/frontend/src/services/api/bookings.ts`
- `/frontend/src/services/api/customers.ts`
- `/frontend/src/services/api/games.ts`
- `/frontend/src/services/api/payments.ts`
- `/frontend/src/services/api/auth.ts`

#### Storage Services
Create `/frontend/src/services/storage/localStorage.ts`:

```typescript
class LocalStorageService {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }
}

export const localStorageService = new LocalStorageService();
```

**After Creating**:
- [ ] Test API services
- [ ] Verify authentication flow
- [ ] Test error handling

---

### Phase 7: Move Constants (45 minutes)

**Source**: Extract from code  
**Destination**: `/frontend/src/constants/`

#### Create Constant Files

**`/frontend/src/constants/routes.ts`**:
```typescript
export const ROUTES = {
  DASHBOARD: '/dashboard',
  BOOKINGS: '/bookings',
  GAMES: '/games',
  CUSTOMERS: '/customers',
  STAFF: '/staff',
  PAYMENT_HISTORY: '/payment-history',
  WAIVERS: '/waivers',
  REPORTS: '/reports',
  MARKETING: '/marketing',
  CAMPAIGNS: '/campaigns',
  MEDIA: '/media',
  AI_AGENTS: '/ai-agents',
  TEAM: '/team',
  SETTINGS: '/settings',
  ACCOUNT_SETTINGS: '/account-settings',
  MY_ACCOUNT: '/my-account',
  PROFILE_SETTINGS: '/profile-settings',
  BILLING: '/billing',
  NOTIFICATIONS: '/notifications',
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

**`/frontend/src/constants/colors.ts`**:
```typescript
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
```

**`/frontend/src/constants/permissions.ts`**:
```bash
# Move existing file
mv lib/auth/permissions.ts frontend/src/constants/permissions.ts
```

Create other constant files:
- `status.ts` - Booking/payment statuses
- `roles.ts` - User roles
- `validation.ts` - Validation rules
- `notifications.ts` - Notification types

**After Creating**:
- [ ] Replace hardcoded strings with constants
- [ ] Update all imports

---

### Phase 8: Move Types (30 minutes)

**Source**: `/types/*`  
**Destination**: `/frontend/src/types/*`

```bash
mv types frontend/src/
```

**Files to Move**:
- `auth.ts`
- `notifications.ts`
- `payment.ts`
- `supabase.ts`

Create `/frontend/src/types/index.ts`:
```typescript
export * from './auth';
export * from './notifications';
export * from './payment';
export * from './booking';
export * from './customer';
export * from './game';
```

**After Moving**:
- [ ] Update type imports
- [ ] Verify TypeScript compilation

---

### Phase 9: Move Styles (15 minutes)

**Source**: `/styles/*`  
**Destination**: `/frontend/src/styles/*`

```bash
mv styles frontend/src/
```

**Files to Move**:
- `globals.css`

**After Moving**:
- [ ] Update CSS imports in index file
- [ ] Verify styles load correctly
- [ ] Test dark mode styles

---

### Phase 10: Move Utilities (30 minutes)

**Source**: `/lib/*` and `/utils/*`  
**Destination**: `/frontend/src/lib/*`

```bash
# Move lib contents (except what was moved to contexts/services)
mv lib/supabase frontend/src/lib/

# Move utils
mv utils frontend/src/lib/utils
```

Create new utility files:
- `/frontend/src/lib/cn.ts` - className utility
- `/frontend/src/lib/formatters.ts` - Data formatting
- `/frontend/src/lib/validators.ts` - Client-side validation

**After Moving**:
- [ ] Update utility imports
- [ ] Test utility functions

---

### Phase 11: Update Import Paths (2-3 hours)

This is the most time-consuming part. Update all import statements to use the new structure.

#### Configure Path Aliases

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["frontend/src/*"],
      "@/components/*": ["frontend/src/components/*"],
      "@/pages/*": ["frontend/src/pages/*"],
      "@/hooks/*": ["frontend/src/hooks/*"],
      "@/contexts/*": ["frontend/src/contexts/*"],
      "@/services/*": ["frontend/src/services/*"],
      "@/constants/*": ["frontend/src/constants/*"],
      "@/types/*": ["frontend/src/types/*"],
      "@/lib/*": ["frontend/src/lib/*"],
      "@/styles/*": ["frontend/src/styles/*"]
    }
  }
}
```

#### Update Imports

**Old**:
```typescript
import { Button } from '../components/ui/button';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTheme } from '../../components/layout/ThemeContext';
```

**New**:
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
// or
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
```

**Tools to Help**:
```bash
# Find all import statements
grep -r "from.*components" frontend/src/

# Replace imports (example)
find frontend/src -type f -name "*.tsx" -exec sed -i 's|from.*components/ui|from @/components/ui|g' {} +
```

**After Updating**:
- [ ] Fix all TypeScript errors
- [ ] Test application builds
- [ ] Verify all pages load

---

### Phase 12: Update Entry Point (30 minutes)

Create `/frontend/src/index.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { AppProvider } from '@/contexts/AppProvider';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
```

Update `/App.tsx` to import from new structure:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Bookings from '@/pages/Bookings';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        {/* ... other routes */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

### Phase 13: Clean Up Old Files (30 minutes)

After verifying everything works:

```bash
# Remove old empty directories
rm -rf pages/
rm -rf components/
rm -rf lib/
rm -rf types/
rm -rf styles/
rm -rf utils/
```

Keep only:
- `/frontend` - New frontend structure
- `/backend` - Backend code
- `/guidelines` - Documentation
- `/supabase` - Database
- Root config files (package.json, tsconfig.json, etc.)

---

## ✅ Verification Checklist

### Build & Compile
- [ ] `npm run build` completes without errors
- [ ] TypeScript compilation succeeds
- [ ] No import errors

### Functionality
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Authentication works
- [ ] Theme switching works
- [ ] Notifications work
- [ ] Forms submit correctly
- [ ] API calls work

### Dark Mode
- [ ] All pages support dark mode
- [ ] Theme toggle works
- [ ] Colors are correct
- [ ] 3-tier background system works

### Responsive Design
- [ ] Mobile layout works (375px)
- [ ] Tablet layout works (768px)
- [ ] Desktop layout works (1024px+)

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass

---

## 🔄 Rollback Plan

If migration fails:

1. **Keep Backup**: Don't delete old files until verified
2. **Git Branch**: Work in a separate branch
3. **Commit Often**: Commit after each phase
4. **Test Thoroughly**: Test before proceeding to next phase

---

## 📊 Estimated Timeline

| Phase | Task | Time | Difficulty |
|-------|------|------|-----------|
| 1 | Create folder structure | 30 min | Easy |
| 2 | Move pages | 1 hour | Easy |
| 3 | Move components | 2 hours | Medium |
| 4 | Move contexts | 30 min | Easy |
| 5 | Create hooks | 1 hour | Medium |
| 6 | Create services | 1.5 hours | Medium |
| 7 | Move constants | 45 min | Easy |
| 8 | Move types | 30 min | Easy |
| 9 | Move styles | 15 min | Easy |
| 10 | Move utilities | 30 min | Easy |
| 11 | Update imports | 2-3 hours | Hard |
| 12 | Update entry point | 30 min | Medium |
| 13 | Clean up | 30 min | Easy |
| **Total** | **Full Migration** | **11-12 hours** | **Medium** |

**Recommended**: Do in 2-3 day sprint, testing thoroughly at each phase.

---

## 🆘 Common Issues

### Issue: Import not found
**Solution**: Check path alias in tsconfig.json

### Issue: Component not rendering
**Solution**: Verify component export and import

### Issue: Context not available
**Solution**: Ensure component is wrapped in provider

### Issue: Styles not applying
**Solution**: Check CSS import order

### Issue: Dark mode broken
**Solution**: Verify ThemeContext is accessible

---

**Ready to Start?** Begin with Phase 1 and work through systematically.

**Last Updated**: November 4, 2025  
**Maintained By**: BookingTMS Development Team
