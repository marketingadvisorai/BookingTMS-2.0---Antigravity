# Complete Folder Structure Guide for BookingTMS

**Comprehensive guide to organizing your codebase following software engineering best practices**

---

## 🎯 Current vs. Recommended Structure

### ✅ What You Have (Good Foundation)

```
✓ /backend          # Backend architecture & services
✓ /components       # React components
✓ /pages           # Page components
✓ /lib             # Utilities and contexts
✓ /types           # TypeScript definitions
✓ /styles          # CSS/styling
✓ /guidelines      # Development guidelines
✓ /supabase        # Database & edge functions
✓ /utils           # Utility functions
```

### 🆕 What You Need to Add

```
+ /tests           # Testing suite
+ /hooks           # Custom React hooks
+ /contexts        # React contexts (separate from lib)
+ /constants       # Application constants
+ /config          # Configuration files
+ /services        # Frontend API services
+ /api             # Next.js API routes
+ /public          # Static assets
+ /docs            # Technical documentation
+ /scripts         # Automation scripts
+ /mocks           # Mock data for development
+ /validators      # Input validation schemas
+ /store           # State management (optional)
+ /features        # Feature-based modules (optional)
```

---

## 📁 Complete Folder Structure

Here's the ideal structure for an enterprise-grade SaaS application:

```
BookingTMS/
├── 📱 Frontend Layer
│   ├── pages/                      # Page components (existing)
│   ├── components/                 # Reusable UI components (existing)
│   ├── features/                   # ⭐ NEW - Feature-based modules
│   ├── hooks/                      # ⭐ NEW - Custom React hooks
│   ├── contexts/                   # ⭐ NEW - React contexts
│   └── styles/                     # Styling (existing)
│
├── 🔧 Business Logic Layer
│   ├── services/                   # ⭐ NEW - Frontend API services
│   ├── store/                      # ⭐ NEW - State management
│   ├── validators/                 # ⭐ NEW - Validation schemas
│   └── lib/                        # Utilities (existing)
│
├── 🗄️ Backend Layer
│   ├── backend/                    # Backend architecture (existing)
│   ├── api/                        # ⭐ NEW - Next.js API routes
│   ├── supabase/                   # Database & functions (existing)
│   └── utils/                      # Utilities (existing)
│
├── 🔒 Configuration & Types
│   ├── types/                      # TypeScript definitions (existing)
│   ├── constants/                  # ⭐ NEW - App constants
│   ├── config/                     # ⭐ NEW - Config files
│   └── .env files                  # Environment variables
│
├── 🧪 Testing & Quality
│   ├── tests/                      # ⭐ NEW - Test files
│   │   ├── unit/                   # Unit tests
│   │   ├── integration/            # Integration tests
│   │   ├── e2e/                    # End-to-end tests
│   │   └── __mocks__/              # Test mocks
│   ├── mocks/                      # ⭐ NEW - Dev mock data
│   └── cypress/                    # ⭐ NEW - E2E testing (optional)
│
├── 📦 Assets & Documentation
│   ├── public/                     # ⭐ NEW - Static assets
│   │   ├── images/                 # Images
│   │   ├── fonts/                  # Custom fonts
│   │   ├── icons/                  # Icon files
│   │   └── favicon.ico             # Favicon
│   ├── docs/                       # ⭐ NEW - Technical docs
│   ├── guidelines/                 # Dev guidelines (existing)
│   └── *.md                        # Root documentation
│
└── 🛠️ DevOps & Scripts
    ├── scripts/                    # ⭐ NEW - Automation scripts
    ├── .github/                    # ⭐ NEW - GitHub workflows
    ├── docker/                     # ⭐ NEW - Docker configs (optional)
    └── infrastructure/             # ⭐ NEW - IaC files (optional)
```

---

## 📋 Detailed Folder Purposes

### 1. `/tests` - Testing Suite ⭐ CRITICAL

**Purpose**: All test files and testing utilities

**Structure**:
```
/tests
├── unit/                       # Unit tests (components, functions)
│   ├── components/
│   │   ├── Button.test.tsx
│   │   └── KPICard.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   ├── services/
│   │   └── BookingService.test.ts
│   └── utils/
│       └── validation.test.ts
├── integration/                # Integration tests (API, DB)
│   ├── api/
│   │   └── bookings.test.ts
│   ├── auth/
│   │   └── login.test.ts
│   └── database/
│       └── queries.test.ts
├── e2e/                        # End-to-end tests (full flows)
│   ├── booking-flow.test.ts
│   ├── auth-flow.test.ts
│   └── payment-flow.test.ts
├── __mocks__/                  # Test mocks
│   ├── supabase.ts
│   ├── stripe.ts
│   └── react-router.ts
├── setup.ts                    # Test setup/config
├── helpers.ts                  # Test utilities
└── fixtures.ts                 # Test data fixtures
```

**Example Files**:
- Unit: Testing individual components
- Integration: Testing API + Database
- E2E: Testing complete user workflows

**Testing Stack**:
- **Unit/Integration**: Vitest or Jest
- **E2E**: Playwright or Cypress
- **Component**: React Testing Library

---

### 2. `/hooks` - Custom React Hooks ⭐ HIGH PRIORITY

**Purpose**: Reusable React hooks (currently mixed in `/lib`)

**Structure**:
```
/hooks
├── index.ts                    # Export all hooks
├── useBookings.ts              # Booking-related hooks
├── useAuth.ts                  # Authentication hooks
├── useTheme.ts                 # Theme management
├── useNotifications.ts         # Notifications
├── useLocalStorage.ts          # LocalStorage wrapper
├── useDebounce.ts              # Debounce utility
├── useMediaQuery.ts            # Responsive hooks
├── usePagination.ts            # Pagination logic
├── useForm.ts                  # Form management
└── useAsync.ts                 # Async state management
```

**Why Separate?**: 
- Hooks are a specific React pattern
- Easier to find and reuse
- Better organization than mixing with utils

---

### 3. `/contexts` - React Contexts ⭐ HIGH PRIORITY

**Purpose**: All React context providers (currently mixed in `/lib` and `/components`)

**Structure**:
```
/contexts
├── index.ts                    # Export all contexts
├── AuthContext.tsx             # Move from /lib/auth
├── ThemeContext.tsx            # Move from /components/layout
├── NotificationContext.tsx     # Move from /lib/notifications
├── WidgetThemeContext.tsx      # Move from /components/widgets
├── WidgetConfigContext.tsx     # Move from /components/widgets
├── BookingContext.tsx          # Booking state
└── ModalContext.tsx            # Modal management
```

**Benefits**:
- Centralized state management
- Clear separation from utilities
- Easy to import and compose

---

### 4. `/constants` - Application Constants ⭐ HIGH PRIORITY

**Purpose**: All hardcoded values, enums, configuration constants

**Structure**:
```
/constants
├── index.ts                    # Export all constants
├── routes.ts                   # Route paths
├── colors.ts                   # Design system colors
├── breakpoints.ts              # Responsive breakpoints
├── permissions.ts              # Permission strings
├── roles.ts                    # User roles
├── status.ts                   # Booking/payment statuses
├── notifications.ts            # Notification types
├── api.ts                      # API endpoints
├── env.ts                      # Environment variables
└── validation.ts               # Validation rules
```

**Example - `/constants/routes.ts`**:
```typescript
export const ROUTES = {
  DASHBOARD: '/dashboard',
  BOOKINGS: '/bookings',
  GAMES: '/games',
  CUSTOMERS: '/customers',
  SETTINGS: '/settings',
  ACCOUNT_SETTINGS: '/account-settings',
} as const;

export const API_ROUTES = {
  BOOKINGS: '/api/bookings',
  CUSTOMERS: '/api/customers',
  GAMES: '/api/games',
} as const;
```

**Example - `/constants/status.ts`**:
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
```

---

### 5. `/config` - Configuration Files ⭐ MEDIUM PRIORITY

**Purpose**: Application configuration (NOT sensitive data)

**Structure**:
```
/config
├── index.ts                    # Main config
├── app.config.ts               # App settings
├── theme.config.ts             # Theme configuration
├── api.config.ts               # API configuration
├── stripe.config.ts            # Stripe settings
├── seo.config.ts               # SEO metadata
├── analytics.config.ts         # Analytics setup
└── feature-flags.config.ts     # Feature toggles
```

**Example - `/config/app.config.ts`**:
```typescript
export const appConfig = {
  name: 'BookingTMS',
  version: '3.2.2',
  environment: process.env.NODE_ENV,
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  features: {
    notifications: true,
    darkMode: true,
    analytics: true,
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  timeouts: {
    api: 30000,
    upload: 60000,
  },
} as const;
```

---

### 6. `/services` - Frontend API Services ⭐ HIGH PRIORITY

**Purpose**: Frontend API clients and business logic (separate from backend)

**Structure**:
```
/services
├── index.ts                    # Export all services
├── api/                        # API clients
│   ├── base.ts                 # Base API client (axios/fetch)
│   ├── bookings.ts             # Booking API calls
│   ├── customers.ts            # Customer API calls
│   ├── games.ts                # Games API calls
│   ├── payments.ts             # Payment API calls
│   └── auth.ts                 # Auth API calls
├── storage/                    # Storage services
│   ├── localStorage.ts         # LocalStorage wrapper
│   └── sessionStorage.ts       # SessionStorage wrapper
├── external/                   # External API integrations
│   ├── stripe.ts               # Stripe client-side
│   ├── analytics.ts            # Analytics service
│   └── notifications.ts        # Push notifications
└── utils/                      # Service utilities
    ├── errorHandler.ts
    └── interceptors.ts
```

**Example - `/services/api/bookings.ts`**:
```typescript
import { apiClient } from './base';
import type { Booking, CreateBookingDTO } from '@/types';

export const bookingService = {
  getAll: async (filters?: BookingFilters): Promise<Booking[]> => {
    const { data } = await apiClient.get('/bookings', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data;
  },

  create: async (booking: CreateBookingDTO): Promise<Booking> => {
    const { data } = await apiClient.post('/bookings', booking);
    return data;
  },

  update: async (id: string, updates: Partial<Booking>): Promise<Booking> => {
    const { data } = await apiClient.put(`/bookings/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bookings/${id}`);
  },
};
```

---

### 7. `/api` - Next.js API Routes ⭐ MEDIUM PRIORITY

**Purpose**: Next.js serverless API routes (bridge between frontend and backend)

**Structure**:
```
/api
├── bookings/
│   ├── index.ts                # GET /api/bookings, POST /api/bookings
│   ├── [id].ts                 # GET/PUT/DELETE /api/bookings/:id
│   └── check-in.ts             # POST /api/bookings/check-in
├── customers/
│   ├── index.ts
│   └── [id].ts
├── games/
│   ├── index.ts
│   └── [id].ts
├── payments/
│   ├── index.ts
│   ├── intent.ts               # Create payment intent
│   └── webhook.ts              # Stripe webhook
├── auth/
│   ├── login.ts
│   ├── signup.ts
│   ├── logout.ts
│   └── refresh.ts
├── notifications/
│   └── send.ts
└── health.ts                   # Health check endpoint
```

**Example - `/api/bookings/index.ts`**:
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { BookingService } from '@/backend/services/BookingService';
import { supabase } from '@/backend/config/supabase';
import { authenticate } from '@/backend/middleware/auth';

const service = new BookingService(supabase);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate
  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const bookings = await service.listBookings(user.organizationId);
      return res.json({ success: true, data: bookings });
    }

    if (req.method === 'POST') {
      const booking = await service.createBooking(
        req.body,
        user.organizationId,
        user.id
      );
      return res.status(201).json({ success: true, data: booking });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Bookings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

### 8. `/public` - Static Assets ⭐ HIGH PRIORITY

**Purpose**: Static files served directly (images, fonts, icons)

**Structure**:
```
/public
├── images/                     # Image assets
│   ├── logo.png
│   ├── logo-dark.png
│   ├── hero.jpg
│   ├── placeholder.png
│   └── widgets/                # Widget preview images
│       ├── farebook.png
│       ├── calendar.png
│       └── list.png
├── fonts/                      # Custom fonts
│   ├── inter/
│   └── poppins/
├── icons/                      # Icon files
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── audio/                      # Sound files
│   └── notification.mp3
├── videos/                     # Video files (if any)
└── manifest.json               # PWA manifest
```

**Best Practices**:
- Optimize all images (compress, WebP format)
- Use SVG for icons when possible
- Include multiple favicon sizes
- Add robots.txt and sitemap.xml

---

### 9. `/docs` - Technical Documentation ⭐ MEDIUM PRIORITY

**Purpose**: Technical documentation (separate from guidelines)

**Structure**:
```
/docs
├── README.md                   # Documentation index
├── architecture/               # Architecture docs
│   ├── overview.md
│   ├── database-schema.md
│   ├── api-design.md
│   └── security.md
├── api/                        # API documentation
│   ├── bookings.md
│   ├── customers.md
│   ├── payments.md
│   └── auth.md
├── deployment/                 # Deployment guides
│   ├── vercel.md
│   ├── aws.md
│   └── docker.md
├── integrations/               # Integration guides
│   ├── stripe.md
│   ├── sendgrid.md
│   └── twilio.md
├── troubleshooting/            # Common issues
│   └── common-errors.md
└── changelog/                  # Version history
    └── CHANGELOG.md
```

---

### 10. `/scripts` - Automation Scripts ⭐ MEDIUM PRIORITY

**Purpose**: Build scripts, database migrations, automation

**Structure**:
```
/scripts
├── setup.sh                    # Initial project setup
├── seed-database.ts            # Seed database with test data
├── migrate.ts                  # Run database migrations
├── generate-types.ts           # Generate TypeScript types
├── build.sh                    # Custom build script
├── deploy.sh                   # Deployment script
├── backup.ts                   # Database backup
├── cleanup.ts                  # Clean temp files
└── test-connection.ts          # Test API/DB connections
```

**Example - `/scripts/seed-database.ts`**:
```typescript
import { supabase } from '../backend/config/supabase';
import { mockBookings, mockCustomers } from '../mocks';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Seed customers
  const { error: customerError } = await supabase
    .from('customers')
    .insert(mockCustomers);

  if (customerError) {
    console.error('Error seeding customers:', customerError);
    return;
  }

  // Seed bookings
  const { error: bookingError } = await supabase
    .from('bookings')
    .insert(mockBookings);

  if (bookingError) {
    console.error('Error seeding bookings:', bookingError);
    return;
  }

  console.log('✅ Database seeded successfully!');
}

seedDatabase();
```

---

### 11. `/mocks` - Mock Data ⭐ HIGH PRIORITY

**Purpose**: Mock data for development and testing (separate from test mocks)

**Structure**:
```
/mocks
├── index.ts                    # Export all mocks
├── bookings.ts                 # Mock bookings
├── customers.ts                # Mock customers
├── games.ts                    # Mock games
├── payments.ts                 # Mock payments
├── users.ts                    # Mock users
├── notifications.ts            # Mock notifications
└── handlers.ts                 # MSW handlers (optional)
```

**Example - `/mocks/bookings.ts`**:
```typescript
import type { Booking } from '@/types';

export const mockBookings: Booking[] = [
  {
    id: '1',
    organization_id: 'org-1',
    booking_number: 'BK-001',
    customer_id: 'cust-1',
    game_id: 'game-1',
    booking_date: '2025-11-10',
    start_time: '18:00',
    end_time: '19:00',
    party_size: 4,
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 120,
    discount_amount: 0,
    final_amount: 120,
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-11-01T10:00:00Z',
    created_by: 'user-1',
  },
  // ... more mock data
];

export const createMockBooking = (overrides?: Partial<Booking>): Booking => ({
  id: Math.random().toString(36),
  organization_id: 'org-1',
  booking_number: `BK-${Math.floor(Math.random() * 1000)}`,
  // ... defaults
  ...overrides,
});
```

---

### 12. `/validators` - Validation Schemas ⭐ MEDIUM PRIORITY

**Purpose**: Input validation using Zod, Yup, or similar

**Structure**:
```
/validators
├── index.ts                    # Export all validators
├── booking.ts                  # Booking validation
├── customer.ts                 # Customer validation
├── game.ts                     # Game validation
├── payment.ts                  # Payment validation
├── auth.ts                     # Auth validation
└── common.ts                   # Common validators
```

**Example - `/validators/booking.ts`** (using Zod):
```typescript
import { z } from 'zod';

export const createBookingSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  game_id: z.string().uuid('Invalid game ID'),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  party_size: z.number().min(1, 'Party size must be at least 1').max(20, 'Party size too large'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const updateBookingSchema = createBookingSchema.partial();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
```

**Usage**:
```typescript
import { createBookingSchema } from '@/validators/booking';

const result = createBookingSchema.safeParse(formData);

if (!result.success) {
  console.error('Validation errors:', result.error.format());
  return;
}

// result.data is now type-safe
const booking = await bookingService.create(result.data);
```

---

### 13. `/features` - Feature-Based Modules (Optional) ⭐ ADVANCED

**Purpose**: Organize by feature instead of file type (for large apps)

**Structure**:
```
/features
├── booking/
│   ├── components/
│   │   ├── BookingList.tsx
│   │   ├── BookingForm.tsx
│   │   └── BookingCard.tsx
│   ├── hooks/
│   │   ├── useBookings.ts
│   │   └── useBookingForm.ts
│   ├── services/
│   │   └── bookingService.ts
│   ├── types.ts
│   ├── constants.ts
│   └── index.ts
├── customer/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── index.ts
├── payment/
│   └── ...
└── auth/
    └── ...
```

**When to Use**:
- Large applications with many features
- Teams working on different features
- Features that are relatively independent

**Benefits**:
- Feature isolation
- Easier to find related code
- Better team collaboration
- Potential for feature extraction to separate packages

---

### 14. `/.github` - GitHub Workflows ⭐ MEDIUM PRIORITY

**Purpose**: CI/CD, automation, issue templates

**Structure**:
```
/.github
├── workflows/                  # GitHub Actions
│   ├── ci.yml                  # Continuous Integration
│   ├── deploy.yml              # Deployment
│   ├── tests.yml               # Run tests
│   └── lint.yml                # Linting
├── ISSUE_TEMPLATE/             # Issue templates
│   ├── bug_report.md
│   └── feature_request.md
├── PULL_REQUEST_TEMPLATE.md    # PR template
└── dependabot.yml              # Dependabot config
```

**Example - `/.github/workflows/ci.yml`**:
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

---

## 🚀 Migration Plan

### Phase 1: Core Structure (Week 1) - HIGH PRIORITY

1. **Create `/hooks`** - Move hooks from `/lib`
2. **Create `/contexts`** - Move contexts from `/lib` and `/components`
3. **Create `/constants`** - Extract all hardcoded values
4. **Create `/mocks`** - Move mock data from `/lib`
5. **Create `/public`** - Add static assets

### Phase 2: Services & APIs (Week 2) - HIGH PRIORITY

6. **Create `/services`** - Frontend API clients
7. **Create `/api`** - Next.js API routes
8. **Create `/validators`** - Input validation schemas

### Phase 3: Testing (Week 3) - CRITICAL

9. **Create `/tests`** - Full testing suite
   - Unit tests
   - Integration tests
   - E2E tests

### Phase 4: Documentation & DevOps (Week 4) - MEDIUM PRIORITY

10. **Create `/docs`** - Technical documentation
11. **Create `/scripts`** - Automation scripts
12. **Create `/config`** - Configuration files
13. **Create `/.github`** - CI/CD workflows

---

## 📝 Final Recommended Structure

```
BookingTMS/
├── .github/                    # GitHub workflows & templates
├── api/                        # Next.js API routes
├── backend/                    # Backend services (existing)
├── components/                 # UI components (existing)
├── config/                     # Configuration files
├── constants/                  # App constants
├── contexts/                   # React contexts
├── docs/                       # Technical documentation
├── features/                   # Feature modules (optional)
├── guidelines/                 # Development guidelines (existing)
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities (existing, restructured)
├── mocks/                      # Mock data
├── pages/                      # Page components (existing)
├── public/                     # Static assets
├── scripts/                    # Automation scripts
├── services/                   # Frontend API services
├── store/                      # State management (optional)
├── styles/                     # Styling (existing)
├── supabase/                   # Supabase configs (existing)
├── tests/                      # Testing suite
├── types/                      # TypeScript types (existing)
├── utils/                      # Utility functions (existing)
├── validators/                 # Validation schemas
├── .env.local                  # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ✅ Benefits of This Structure

1. **Clear Separation of Concerns**: Each folder has a single, well-defined purpose
2. **Scalability**: Easy to add new features without cluttering
3. **Maintainability**: Easy to find and update code
4. **Testability**: Testing infrastructure is first-class
5. **Team Collaboration**: Clear ownership and boundaries
6. **Developer Experience**: Intuitive navigation and imports
7. **Best Practices**: Follows industry standards

---

## 🎯 Quick Action Items

### Immediate (This Week)
- [ ] Create `/hooks` folder and move all custom hooks
- [ ] Create `/contexts` folder and move all context providers
- [ ] Create `/constants` folder and extract hardcoded values
- [ ] Create `/public` folder for static assets

### Short-term (Next 2 Weeks)
- [ ] Create `/services` folder for API clients
- [ ] Create `/mocks` folder for development data
- [ ] Create `/tests` folder and start writing tests
- [ ] Create `/validators` folder for input validation

### Medium-term (Next Month)
- [ ] Create `/api` folder for Next.js routes
- [ ] Create `/docs` folder for technical documentation
- [ ] Create `/scripts` folder for automation
- [ ] Set up CI/CD with `/.github/workflows`

---

## 💡 Pro Tips

1. **Start Small**: Don't create all folders at once. Prioritize based on immediate needs.
2. **Consistent Naming**: Use singular for utilities, plural for collections.
3. **Index Files**: Add `index.ts` to export from folders.
4. **Path Aliases**: Update `tsconfig.json` with path aliases:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"],
         "@/components/*": ["./components/*"],
         "@/hooks/*": ["./hooks/*"],
         "@/services/*": ["./services/*"],
         "@/constants/*": ["./constants/*"]
       }
     }
   }
   ```

5. **README Files**: Add README.md to each major folder explaining its purpose.

---

**Last Updated**: November 4, 2025  
**Maintained By**: BookingTMS Development Team
