# Testing Suite

Comprehensive testing setup for BookingTMS including unit, integration, and end-to-end tests.

## 📁 Structure

```
/tests
├── README.md               # This file
├── setup.ts                # Test setup and configuration
├── helpers.ts              # Test utility functions
├── fixtures.ts             # Test data fixtures
├── unit/                   # Unit tests
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── integration/            # Integration tests
│   ├── api/
│   ├── auth/
│   └── database/
├── e2e/                    # End-to-end tests
│   ├── booking-flow.test.ts
│   ├── auth-flow.test.ts
│   └── payment-flow.test.ts
└── __mocks__/              # Test mocks
    ├── supabase.ts
    ├── stripe.ts
    └── next-router.ts
```

## 🎯 Testing Strategy

### Unit Tests (70%)
Test individual components and functions in isolation.

**What to test:**
- Components render correctly
- Hooks return expected values
- Utility functions work correctly
- Services handle data properly

### Integration Tests (20%)
Test how components work together.

**What to test:**
- API + Database interactions
- Authentication flows
- Form submissions
- Data fetching and updates

### E2E Tests (10%)
Test complete user workflows.

**What to test:**
- Complete booking flow
- User registration and login
- Payment processing
- Admin operations

## 🛠️ Tech Stack

### Testing Framework
- **Vitest** - Fast unit testing (Jest compatible)
- **React Testing Library** - Component testing
- **Playwright** or **Cypress** - E2E testing

### Utilities
- **MSW (Mock Service Worker)** - API mocking
- **@testing-library/user-event** - User interactions
- **@testing-library/jest-dom** - DOM matchers

## 📖 Examples

### Unit Test - Component

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Unit Test - Hook

```typescript
// tests/unit/hooks/useBookings.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useBookings } from '@/hooks/useBookings';
import { bookingService } from '@/services/api/bookings';

vi.mock('@/services/api/bookings');

describe('useBookings', () => {
  it('fetches bookings on mount', async () => {
    const mockBookings = [
      { id: '1', booking_number: 'BK-001' },
      { id: '2', booking_number: 'BK-002' },
    ];
    
    vi.mocked(bookingService.getAll).mockResolvedValue(mockBookings);

    const { result } = renderHook(() => useBookings());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.bookings).toEqual(mockBookings);
    expect(bookingService.getAll).toHaveBeenCalledTimes(1);
  });

  it('handles errors', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(bookingService.getAll).mockRejectedValue(error);

    const { result } = renderHook(() => useBookings());

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });
  });
});
```

### Unit Test - Service

```typescript
// tests/unit/services/bookingService.test.ts
import { BookingService } from '@/backend/services/BookingService';
import { supabase } from '@/backend/config/supabase';

vi.mock('@/backend/config/supabase');

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(() => {
    service = new BookingService(supabase);
  });

  describe('createBooking', () => {
    it('creates a booking successfully', async () => {
      const mockBooking = {
        id: '1',
        booking_number: 'BK-001',
        status: 'pending',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockBooking, error: null }),
          }),
        }),
      } as any);

      const result = await service.createBooking(
        {
          customer_id: 'cust-1',
          game_id: 'game-1',
          booking_date: '2025-11-10',
          start_time: '18:00',
          party_size: 4,
        },
        'org-1',
        'user-1'
      );

      expect(result).toEqual(mockBooking);
    });

    it('throws error for invalid date', async () => {
      await expect(
        service.createBooking(
          {
            customer_id: 'cust-1',
            game_id: 'game-1',
            booking_date: '2020-01-01', // Past date
            start_time: '18:00',
            party_size: 4,
          },
          'org-1',
          'user-1'
        )
      ).rejects.toThrow('Cannot book in the past');
    });
  });
});
```

### Integration Test - API

```typescript
// tests/integration/api/bookings.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/api/bookings/index';
import { supabase } from '@/backend/config/supabase';

describe('/api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns all bookings', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    const mockBookings = [
      { id: '1', booking_number: 'BK-001' },
      { id: '2', booking_number: 'BK-002' },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockBookings, error: null }),
      }),
    } as any);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      data: mockBookings,
    });
  });

  it('POST creates a new booking', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: {
        customer_id: 'cust-1',
        game_id: 'game-1',
        booking_date: '2025-11-10',
        start_time: '18:00',
        party_size: 4,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data.booking_number).toBeDefined();
  });

  it('returns 401 without auth', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
```

### E2E Test - Booking Flow

```typescript
// tests/e2e/booking-flow.test.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('complete booking creation', async ({ page }) => {
    // Navigate to bookings
    await page.click('a[href="/bookings"]');
    await expect(page).toHaveURL('/bookings');

    // Click Add Booking
    await page.click('button:has-text("Add Booking")');

    // Fill form
    await page.selectOption('select[name="customer"]', 'customer-1');
    await page.selectOption('select[name="game"]', 'game-1');
    await page.fill('input[name="date"]', '2025-11-10');
    await page.fill('input[name="time"]', '18:00');
    await page.fill('input[name="party_size"]', '4');

    // Submit
    await page.click('button:has-text("Create Booking")');

    // Verify success
    await expect(page.locator('text=Booking created successfully')).toBeVisible();
    await expect(page.locator('td:has-text("BK-")')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/bookings');
    await page.click('button:has-text("Add Booking")');

    // Try to submit without filling
    await page.click('button:has-text("Create Booking")');

    // Check for errors
    await expect(page.locator('text=Customer is required')).toBeVisible();
    await expect(page.locator('text=Game is required')).toBeVisible();
  });
});
```

## 📋 Test Configuration

### `/tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

### `/tests/helpers.ts`

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Custom render with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    ),
    ...options,
  });
}

// Wait for async updates
export const waitForLoadingToFinish = () =>
  screen.findByText(/loading/i, {}, { timeout: 3000 });
```

## 🚀 Running Tests

### Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- unit

# Run integration tests
npm test -- integration

# Run E2E tests
npm run test:e2e

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run unit",
    "test:integration": "vitest run integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

## ✅ Testing Checklist

### Component Tests
- [ ] Renders without crashing
- [ ] Displays correct content
- [ ] Handles user interactions
- [ ] Shows loading states
- [ ] Shows error states
- [ ] Handles edge cases
- [ ] Respects accessibility

### Hook Tests
- [ ] Returns correct initial state
- [ ] Updates state correctly
- [ ] Handles side effects
- [ ] Handles errors
- [ ] Cleans up properly

### Service Tests
- [ ] Successful operations
- [ ] Error handling
- [ ] Validation
- [ ] Edge cases

### E2E Tests
- [ ] Happy path works
- [ ] Validation works
- [ ] Error handling works
- [ ] Navigation works

## 📚 Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **One Assertion**: Test one thing per test
3. **Clear Names**: Test names should describe what they test
4. **Mock External**: Mock all external dependencies
5. **Test Behavior**: Test what users see, not implementation
6. **Coverage Goal**: Aim for 80%+ coverage
7. **Fast Tests**: Keep tests fast and isolated

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Status**: Ready to implement. Start with unit tests for critical components.
