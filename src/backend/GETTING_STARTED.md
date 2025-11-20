# Getting Started with BookingTMS Backend

**A practical guide to building and using the BookingTMS backend API**

---

## 🎯 Overview

The BookingTMS backend is organized following a clean, three-tier architecture:

1. **API Layer** - HTTP endpoints and request handling
2. **Service Layer** - Business logic and validation
3. **Data Layer** - Database operations and models

---

## 📋 Prerequisites

- Node.js 18+ or Deno 1.40+
- Supabase account and project
- Environment variables configured
- TypeScript knowledge

---

## 🚀 Quick Setup

### 1. Environment Variables

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SENDGRID_API_KEY=SG...

# SMS (optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
npm install stripe  # If using payments
npm install @sendgrid/mail  # If using email
npm install twilio  # If using SMS
```

### 3. Database Setup

Run the migration in Supabase SQL Editor:

```sql
-- Located at: /supabase/migrations/001_initial_schema.sql
```

---

## 📚 Usage Examples

### Example 1: Using BookingService

```typescript
import { BookingService } from './backend/services/BookingService';
import { supabase } from './backend/config/supabase';

// Initialize service
const bookingService = new BookingService(supabase);

// Create a booking
async function createNewBooking() {
  try {
    const booking = await bookingService.createBooking(
      {
        customer_id: 'customer-uuid',
        game_id: 'game-uuid',
        booking_date: '2025-11-10',
        start_time: '18:00',
        party_size: 4,
        notes: 'Birthday party',
      },
      'organization-uuid',
      'user-uuid'
    );

    console.log('Booking created:', booking);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// List bookings
async function listAllBookings() {
  try {
    const bookings = await bookingService.listBookings(
      'organization-uuid',
      {
        status: 'confirmed',
        date: '2025-11-10',
      }
    );

    console.log(`Found ${bookings.length} bookings`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Example 2: Building an API with Express

```typescript
import express from 'express';
import { authenticate } from './backend/middleware/auth';
import { errorHandler } from './backend/middleware/errorHandler';
import * as bookingsAPI from './backend/api/bookings';
import { supabase } from './backend/config/supabase';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bookings routes
app.get('/api/bookings', authenticate(supabase), bookingsAPI.listBookings);
app.get('/api/bookings/:id', authenticate(supabase), bookingsAPI.getBooking);
app.post('/api/bookings', authenticate(supabase), bookingsAPI.createBooking);
app.put('/api/bookings/:id', authenticate(supabase), bookingsAPI.updateBooking);
app.delete('/api/bookings/:id', authenticate(supabase), bookingsAPI.cancelBooking);
app.post('/api/bookings/:id/checkin', authenticate(supabase), bookingsAPI.checkIn);

// Error handling
app.use(errorHandler);

// Start server
app.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});
```

### Example 3: Using with Next.js API Routes

```typescript
// pages/api/bookings/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { BookingService } from '@/backend/services/BookingService';
import { supabase } from '@/backend/config/supabase';

const bookingService = new BookingService(supabase);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract user from session
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Handle different methods
  if (req.method === 'GET') {
    const bookings = await bookingService.listBookings(
      user.organization_id,
      req.query
    );
    
    return res.json({ success: true, data: bookings });
  }

  if (req.method === 'POST') {
    const booking = await bookingService.createBooking(
      req.body,
      user.organization_id,
      user.id
    );
    
    return res.status(201).json({ success: true, data: booking });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

### Example 4: Using with Supabase Edge Functions

```typescript
// supabase/functions/bookings/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { BookingService } from '../../../backend/services/BookingService.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Initialize service
    const bookingService = new BookingService(supabase);

    // Parse request
    const url = new URL(req.url);
    const path = url.pathname;

    // Route handling
    if (path === '/bookings' && req.method === 'GET') {
      const bookings = await bookingService.listBookings('org-id');
      
      return new Response(JSON.stringify({ data: bookings }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (path === '/bookings' && req.method === 'POST') {
      const body = await req.json();
      const booking = await bookingService.createBooking(
        body,
        'org-id',
        'user-id'
      );
      
      return new Response(JSON.stringify({ data: booking }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Example 5: Error Handling

```typescript
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError 
} from './backend/middleware/errorHandler';

async function handleBooking() {
  try {
    // Validate input
    if (!email) {
      throw new ValidationError('Email is required', {
        email: 'This field is required',
      });
    }

    // Check existence
    const booking = await getBooking(id);
    if (!booking) {
      throw new NotFoundError('Booking');
    }

    // Check permissions
    if (!hasPermission) {
      throw new UnauthorizedError('You cannot access this booking');
    }

    // Process booking
    await processBooking(booking);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation failed:', error.fields);
    } else if (error instanceof NotFoundError) {
      console.error('Resource not found:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

### Example 6: Input Validation

```typescript
import {
  isValidEmail,
  isValidDate,
  isValidTime,
  isValidPartySize,
  validateFields,
} from './backend/utils/validation';

// Validate individual fields
const emailValid = isValidEmail('user@example.com'); // true

const dateValid = isValidDate('2025-11-10'); // true

const timeValid = isValidTime('18:00'); // true

const partySizeResult = isValidPartySize(4, 2, 8);
// { valid: true }

// Batch validation
const result = validateFields(
  {
    email: 'user@example.com',
    date: '2025-11-10',
    time: '18:00',
  },
  {
    email: isValidEmail,
    date: isValidDate,
    time: isValidTime,
  }
);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

---

## 🏗️ Creating a New Service

### Step 1: Define the Model

```typescript
// /backend/models/Customer.ts
export interface Customer {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  phone?: string;
  total_bookings: number;
  total_spent: number;
  segment: 'new' | 'regular' | 'vip';
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDTO {
  email: string;
  full_name: string;
  phone?: string;
}
```

### Step 2: Create the Service

```typescript
// /backend/services/CustomerService.ts
export class CustomerService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async createCustomer(
    data: CreateCustomerDTO,
    organizationId: string
  ): Promise<Customer> {
    const { data: customer, error } = await this.supabase
      .from('customers')
      .insert({
        organization_id: organizationId,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || null,
        total_bookings: 0,
        total_spent: 0,
        segment: 'new',
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create customer');
    }

    return customer;
  }

  async listCustomers(organizationId: string): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to list customers');
    }

    return data || [];
  }
}
```

### Step 3: Create API Routes

```typescript
// /backend/api/customers/index.ts
import { asyncHandler } from '../../middleware/errorHandler';
import { CustomerService } from '../../services/CustomerService';

const customerService = new CustomerService(supabase);

export const listCustomers = asyncHandler(async (req, res) => {
  const customers = await customerService.listCustomers(
    req.user.organizationId
  );

  res.json({ success: true, data: customers });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(
    req.body,
    req.user.organizationId
  );

  res.status(201).json({ success: true, data: customer });
});
```

---

## 🧪 Testing

### Unit Testing

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { BookingService } from './backend/services/BookingService';

describe('BookingService', () => {
  let service: BookingService;

  beforeAll(() => {
    // Setup
    service = new BookingService(supabaseMock);
  });

  it('should create a booking', async () => {
    const result = await service.createBooking(mockData, 'org-1', 'user-1');
    expect(result.id).toBeDefined();
  });

  it('should validate booking date', async () => {
    await expect(
      service.createBooking(
        { ...mockData, booking_date: '2020-01-01' },
        'org-1',
        'user-1'
      )
    ).rejects.toThrow('Cannot book in the past');
  });
});
```

### Integration Testing

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('Bookings API', () => {
  it('GET /api/bookings returns bookings', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('POST /api/bookings creates booking', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', 'Bearer test-token')
      .send({
        customer_id: 'customer-1',
        game_id: 'game-1',
        booking_date: '2025-11-10',
        start_time: '18:00',
        party_size: 4,
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.booking_number).toBeDefined();
  });
});
```

---

## 📚 Best Practices

### 1. Error Handling

```typescript
// ✅ Good - Specific error with context
throw new ValidationError('Party size must be between 2 and 8', {
  party_size: 'Value must be between 2 and 8',
});

// ❌ Bad - Generic error
throw new Error('Invalid input');
```

### 2. Input Validation

```typescript
// ✅ Good - Validate early
async createBooking(data: CreateBookingDTO) {
  this.validateBookingData(data);
  // ... rest of logic
}

// ❌ Bad - Validate late or not at all
```

### 3. Database Operations

```typescript
// ✅ Good - Select specific fields with relations
await supabase
  .from('bookings')
  .select('id, booking_number, customer:customers(name, email)')
  .eq('organization_id', orgId);

// ❌ Bad - Select everything
await supabase.from('bookings').select('*');
```

### 4. Authentication

```typescript
// ✅ Good - Always check authentication
if (!req.user) {
  throw new UnauthorizedError();
}

// ❌ Bad - Assume user exists
const userId = req.user.id;
```

### 5. Logging

```typescript
// ✅ Good - Contextual logging
console.error('Failed to create booking:', {
  error: error.message,
  customerId: data.customer_id,
  gameId: data.game_id,
});

// ❌ Bad - Generic logging
console.error('Error:', error);
```

---

## 🔒 Security Checklist

- [ ] All routes use authentication middleware
- [ ] Input validation on all endpoints
- [ ] SQL injection prevented (use parameterized queries)
- [ ] XSS prevention (sanitize input)
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] HTTPS only in production
- [ ] Environment variables secured
- [ ] Service role key never exposed to client
- [ ] Logging excludes sensitive data

---

## 📖 Additional Resources

- **Main Documentation**: `/backend/README.md`
- **Supabase Setup**: `/SUPABASE_SETUP_GUIDE.md`
- **Database Schema**: `/supabase/migrations/001_initial_schema.sql`
- **Frontend Integration**: `/lib/supabase/hooks.ts`

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0

**Ready to build!** Start with the examples above and customize for your needs.
