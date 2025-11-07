# Frontend Services

This folder contains frontend API clients and external service integrations.

## 📁 Structure

```
/services
├── README.md               # This file
├── index.ts                # Export all services
├── api/                    # API clients
│   ├── base.ts             # Base API client
│   ├── bookings.ts         # Booking API
│   ├── customers.ts        # Customer API
│   ├── games.ts            # Games API
│   ├── payments.ts         # Payment API
│   └── auth.ts             # Auth API
├── storage/                # Browser storage
│   ├── localStorage.ts     # LocalStorage wrapper
│   └── sessionStorage.ts   # SessionStorage wrapper
├── external/               # External integrations
│   ├── stripe.ts           # Stripe client-side
│   ├── analytics.ts        # Analytics service
│   └── notifications.ts    # Push notifications
└── utils/                  # Service utilities
    ├── errorHandler.ts     # Error handling
    └── interceptors.ts     # Request/response interceptors
```

## 🎯 Purpose

Separate frontend API logic from:
- **Backend services** (`/backend/services`) - Server-side business logic
- **Components** - Keep components clean
- **Hooks** - Hooks use services, not implement them

## 📖 Examples

### Base API Client

```typescript
// services/api/base.ts
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
          // Handle unauthorized
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

### Booking Service

```typescript
// services/api/bookings.ts
import { apiClient } from './base';
import type { Booking, CreateBookingDTO, BookingFilters } from '@/types';

export const bookingService = {
  /**
   * Get all bookings with optional filters
   */
  async getAll(filters?: BookingFilters): Promise<Booking[]> {
    return apiClient.get<Booking[]>('/bookings', { params: filters });
  },

  /**
   * Get booking by ID
   */
  async getById(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  },

  /**
   * Create new booking
   */
  async create(data: CreateBookingDTO): Promise<Booking> {
    return apiClient.post<Booking>('/bookings', data);
  },

  /**
   * Update booking
   */
  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  },

  /**
   * Delete booking
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/bookings/${id}`);
  },

  /**
   * Check-in customer
   */
  async checkIn(id: string): Promise<Booking> {
    return apiClient.post<Booking>(`/bookings/${id}/check-in`);
  },

  /**
   * Check availability
   */
  async checkAvailability(
    gameId: string,
    date: string,
    time: string
  ): Promise<{ available: boolean }> {
    return apiClient.get<{ available: boolean }>('/bookings/availability', {
      params: { game_id: gameId, date, time },
    });
  },
};
```

### Storage Service

```typescript
// services/storage/localStorage.ts
class LocalStorageService {
  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }

  /**
   * Clear all items
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

export const localStorageService = new LocalStorageService();
```

### External Service - Stripe

```typescript
// services/external/stripe.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export const stripeService = {
  /**
   * Create payment intent
   */
  async createPaymentIntent(amount: number, bookingId: string) {
    const response = await fetch('/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, booking_id: bookingId }),
    });

    const data = await response.json();
    return data.clientSecret;
  },

  /**
   * Confirm payment
   */
  async confirmPayment(
    clientSecret: string,
    paymentMethod: string
  ): Promise<{ success: boolean; error?: string }> {
    const stripe = await getStripe();
    if (!stripe) {
      return { success: false, error: 'Stripe not loaded' };
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  },
};
```

## 🚀 Usage in Hooks

Services should be used in custom hooks, not directly in components:

```typescript
// hooks/useBookings.ts
import { useState, useEffect } from 'react';
import { bookingService } from '@/services/api/bookings';
import type { Booking } from '@/types';

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

  const createBooking = async (data: CreateBookingDTO) => {
    const booking = await bookingService.create(data);
    setBookings([...bookings, booking]);
    return booking;
  };

  return {
    bookings,
    loading,
    error,
    refresh: loadBookings,
    createBooking,
  };
}
```

Then use in component:

```typescript
// components/BookingList.tsx
import { useBookings } from '@/hooks/useBookings';

export function BookingList() {
  const { bookings, loading, error } = useBookings();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
```

## 🔗 Service vs Backend Service

### Frontend Service (`/services`)
- **Purpose**: API client, make HTTP requests
- **Location**: Runs in browser
- **Usage**: Called by hooks/components
- **Example**: `bookingService.getAll()` - makes HTTP request

### Backend Service (`/backend/services`)
- **Purpose**: Business logic, database operations
- **Location**: Runs on server
- **Usage**: Called by API routes
- **Example**: `BookingService.createBooking()` - creates record in DB

### Flow

```
Component
   ↓
Hook (useBookings)
   ↓
Frontend Service (bookingService.getAll)
   ↓ HTTP Request
API Route (/api/bookings)
   ↓
Backend Service (BookingService.listBookings)
   ↓
Database (Supabase)
```

## ✅ Best Practices

1. **Single Responsibility**: Each service handles one resource
2. **Type Safety**: Use TypeScript for all services
3. **Error Handling**: Always handle errors gracefully
4. **Consistent API**: Use similar method names across services
5. **Documentation**: Add JSDoc comments
6. **Testing**: Mock services in tests
7. **Caching**: Implement caching when appropriate

## 📦 Export Pattern

```typescript
// services/index.ts
export * from './api/bookings';
export * from './api/customers';
export * from './api/games';
export * from './api/payments';
export * from './storage/localStorage';
export * from './external/stripe';
```

Import like:
```typescript
import { bookingService, localStorageService } from '@/services';
```

---

**Status**: To be created. Start with API clients for critical resources.
