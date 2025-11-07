# BookingTMS Backend

**Backend architecture and API documentation for BookingTMS**

---

## 📁 Structure

```
/backend
├── README.md                    # This file
├── api/                         # API routes and handlers
│   ├── bookings/               # Booking endpoints
│   ├── games/                  # Games/rooms endpoints
│   ├── customers/              # Customer endpoints
│   ├── payments/               # Payment endpoints
│   ├── notifications/          # Notification endpoints
│   └── auth/                   # Authentication endpoints
├── services/                    # Business logic layer
│   ├── BookingService.ts       # Booking business logic
│   ├── GameService.ts          # Game business logic
│   ├── CustomerService.ts      # Customer business logic
│   ├── PaymentService.ts       # Payment business logic
│   └── NotificationService.ts  # Notification business logic
├── models/                      # Data models and types
│   ├── Booking.ts              # Booking model
│   ├── Game.ts                 # Game model
│   ├── Customer.ts             # Customer model
│   └── Payment.ts              # Payment model
├── middleware/                  # Express/Hono middleware
│   ├── auth.ts                 # Authentication middleware
│   ├── cors.ts                 # CORS configuration
│   ├── errorHandler.ts         # Error handling
│   └── rateLimit.ts            # Rate limiting
├── utils/                       # Utility functions
│   ├── database.ts             # Database helpers
│   ├── validation.ts           # Input validation
│   ├── email.ts                # Email utilities (SendGrid)
│   └── sms.ts                  # SMS utilities (Twilio)
├── config/                      # Configuration files
│   ├── database.ts             # Database config
│   ├── stripe.ts               # Stripe config
│   └── supabase.ts             # Supabase config
└── tests/                       # Backend tests
    ├── bookings.test.ts
    ├── payments.test.ts
    └── auth.test.ts
```

---

## 🏗️ Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│  • Components                        │
│  • Pages                             │
│  • UI Logic                          │
└────────────┬────────────────────────┘
             │ HTTP/REST API
             ▼
┌─────────────────────────────────────┐
│       Backend (Node/Deno)            │
│  ┌───────────────────────────────┐  │
│  │ API Layer (Express/Hono)      │  │
│  │  • Routes                     │  │
│  │  • Controllers                │  │
│  │  • Middleware                 │  │
│  └────────────┬──────────────────┘  │
│               ▼                      │
│  ┌───────────────────────────────┐  │
│  │ Service Layer                 │  │
│  │  • Business Logic             │  │
│  │  • Validation                 │  │
│  │  • Error Handling             │  │
│  └────────────┬──────────────────┘  │
│               ▼                      │
│  ┌───────────────────────────────┐  │
│  │ Data Layer                    │  │
│  │  • Database Operations        │  │
│  │  • ORM/Query Builder          │  │
│  │  • Data Models                │  │
│  └───────────────────────────────┘  │
└────────────┬────────────────────────┘
             │ SQL/Realtime
             ▼
┌─────────────────────────────────────┐
│    Database (Supabase/PostgreSQL)   │
│  • Tables                            │
│  • RLS Policies                      │
│  • Triggers                          │
│  • Functions                         │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Development Setup

1. **Environment Variables**:
```bash
# Copy from .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notifications
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Start Development Server**:
```bash
npm run dev
```

---

## 📡 API Endpoints

### Bookings

```typescript
GET    /api/bookings              # List all bookings
GET    /api/bookings/:id          # Get booking details
POST   /api/bookings              # Create new booking
PUT    /api/bookings/:id          # Update booking
DELETE /api/bookings/:id          # Cancel booking
POST   /api/bookings/:id/checkin  # Check-in customer
```

### Games/Rooms

```typescript
GET    /api/games                 # List all games
GET    /api/games/:id             # Get game details
POST   /api/games                 # Create new game
PUT    /api/games/:id             # Update game
DELETE /api/games/:id             # Delete game
GET    /api/games/:id/availability # Check availability
```

### Customers

```typescript
GET    /api/customers             # List all customers
GET    /api/customers/:id         # Get customer details
POST   /api/customers             # Create customer
PUT    /api/customers/:id         # Update customer
DELETE /api/customers/:id         # Delete customer
GET    /api/customers/:id/bookings # Customer booking history
```

### Payments

```typescript
GET    /api/payments              # List all payments
GET    /api/payments/:id          # Get payment details
POST   /api/payments              # Process payment
POST   /api/payments/:id/refund   # Refund payment
POST   /api/stripe/webhook        # Stripe webhook handler
```

### Notifications

```typescript
GET    /api/notifications         # List user notifications
POST   /api/notifications/:id/read # Mark as read
PUT    /api/notifications/settings # Update preferences
DELETE /api/notifications/:id     # Delete notification
```

### Authentication

```typescript
POST   /api/auth/signup           # Create new user
POST   /api/auth/login            # User login
POST   /api/auth/logout           # User logout
GET    /api/auth/session          # Get current session
POST   /api/auth/reset-password   # Password reset
```

---

## 🔒 Authentication

### Middleware

```typescript
// /backend/middleware/auth.ts
import { supabase } from '../config/supabase';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};
```

### Protected Routes

```typescript
// Example usage
app.get('/api/bookings', authenticate, async (req, res) => {
  // Only authenticated users can access
  const bookings = await getBookings(req.user.id);
  res.json(bookings);
});
```

---

## 💼 Service Layer

### Example: BookingService

```typescript
// /backend/services/BookingService.ts
import { supabase } from '../config/supabase';
import type { Booking } from '../models/Booking';

export class BookingService {
  async createBooking(data: Partial<Booking>): Promise<Booking> {
    // Validation
    this.validateBooking(data);
    
    // Check availability
    const isAvailable = await this.checkAvailability(
      data.game_id!,
      data.booking_date!,
      data.start_time!
    );
    
    if (!isAvailable) {
      throw new Error('Time slot not available');
    }
    
    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    
    // Send confirmation email
    await this.sendConfirmationEmail(booking);
    
    // Send notification
    await this.createNotification(booking);
    
    return booking;
  }

  async getBookings(organizationId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(full_name, email),
        game:games(name)
      `)
      .eq('organization_id', organizationId)
      .order('booking_date', { ascending: false });
      
    if (error) throw error;
    return data;
  }

  private validateBooking(data: Partial<Booking>): void {
    if (!data.game_id) throw new Error('Game is required');
    if (!data.customer_id) throw new Error('Customer is required');
    if (!data.booking_date) throw new Error('Date is required');
    if (!data.start_time) throw new Error('Time is required');
  }

  private async checkAvailability(
    gameId: string,
    date: string,
    time: string
  ): Promise<boolean> {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('booking_date', date)
      .eq('start_time', time)
      .neq('status', 'cancelled');
      
    return (count || 0) === 0;
  }

  private async sendConfirmationEmail(booking: Booking): Promise<void> {
    // Email sending logic (SendGrid)
  }

  private async createNotification(booking: Booking): Promise<void> {
    // Create notification record
  }
}
```

---

## 🗃️ Data Models

### Example: Booking Model

```typescript
// /backend/models/Booking.ts
export interface Booking {
  id: string;
  organization_id: string;
  booking_number: string;
  customer_id: string;
  game_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled' | 'no-show';
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateBookingDTO {
  customer_id: string;
  game_id: string;
  booking_date: string;
  start_time: string;
  party_size: number;
  notes?: string;
}

export interface UpdateBookingDTO {
  booking_date?: string;
  start_time?: string;
  party_size?: number;
  status?: Booking['status'];
  notes?: string;
}
```

---

## 🧪 Testing

### Example: Booking Tests

```typescript
// /backend/tests/bookings.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { BookingService } from '../services/BookingService';

describe('BookingService', () => {
  let service: BookingService;
  
  beforeAll(() => {
    service = new BookingService();
  });

  it('should create a booking', async () => {
    const bookingData = {
      customer_id: 'customer-1',
      game_id: 'game-1',
      booking_date: '2025-11-10',
      start_time: '18:00',
      party_size: 4,
    };
    
    const booking = await service.createBooking(bookingData);
    
    expect(booking.id).toBeDefined();
    expect(booking.status).toBe('pending');
  });

  it('should reject overlapping bookings', async () => {
    const bookingData = {
      customer_id: 'customer-2',
      game_id: 'game-1',
      booking_date: '2025-11-10',
      start_time: '18:00', // Same time as above
      party_size: 4,
    };
    
    await expect(service.createBooking(bookingData))
      .rejects
      .toThrow('Time slot not available');
  });
});
```

---

## 🔧 Error Handling

### Global Error Handler

```typescript
// /backend/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Known application errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      fields: err.fields,
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
    });
  }

  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Something went wrong',
  });
};
```

---

## 📊 Database Operations

### Using Supabase Client

```typescript
// /backend/utils/database.ts
import { supabase } from '../config/supabase';

export class DatabaseHelper {
  // Transaction wrapper
  static async transaction<T>(
    operations: (client: typeof supabase) => Promise<T>
  ): Promise<T> {
    try {
      const result = await operations(supabase);
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Pagination helper
  static async paginate<T>(
    query: any,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: T[]; total: number; page: number; pages: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    };
  }
}
```

---

## 🔔 Notifications

### SendGrid Email

```typescript
// /backend/utils/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  static async sendBookingConfirmation(
    to: string,
    bookingDetails: any
  ): Promise<void> {
    const msg = {
      to,
      from: 'noreply@bookingtms.com',
      subject: 'Booking Confirmation',
      html: `
        <h1>Your booking is confirmed!</h1>
        <p>Booking Number: ${bookingDetails.booking_number}</p>
        <p>Date: ${bookingDetails.booking_date}</p>
        <p>Time: ${bookingDetails.start_time}</p>
      `,
    };

    await sgMail.send(msg);
  }
}
```

### Twilio SMS

```typescript
// /backend/utils/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class SMSService {
  static async sendBookingReminder(
    to: string,
    bookingDetails: any
  ): Promise<void> {
    await client.messages.create({
      body: `Reminder: You have a booking today at ${bookingDetails.start_time}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  }
}
```

---

## 💳 Payment Processing

### Stripe Integration

```typescript
// /backend/services/PaymentService.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  async createPaymentIntent(
    amount: number,
    bookingId: string
  ): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        booking_id: bookingId,
      },
    });

    return paymentIntent;
  }

  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? amount * 100 : undefined,
    });

    return refund;
  }

  async handleWebhook(
    body: string,
    signature: string
  ): Promise<void> {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }

  private async handlePaymentSuccess(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const bookingId = paymentIntent.metadata.booking_id;
    
    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', bookingId);
    
    // Create payment record
    await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: paymentIntent.amount / 100,
        status: 'completed',
        stripe_payment_intent_id: paymentIntent.id,
      });
  }
}
```

---

## 🔐 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use different keys for dev/staging/production
- Rotate keys regularly

### 2. Authentication
- Always verify JWT tokens
- Use Row-Level Security (RLS) in Supabase
- Implement rate limiting

### 3. Input Validation
- Validate all user input
- Sanitize data before database operations
- Use TypeScript for type safety

### 4. API Security
- Use HTTPS only
- Implement CORS properly
- Add rate limiting
- Log security events

---

## 📚 Documentation

- **API Reference**: See `/backend/api/` directory
- **Service Documentation**: See `/backend/services/` directory
- **Supabase Setup**: See `/SUPABASE_SETUP_GUIDE.md`
- **Stripe Integration**: See `/PRD_BOOKINGTMS_ENTERPRISE.md` Section 6

---

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Email/SMS credentials verified
- [ ] RLS policies enabled
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0  
**Maintained By**: BookingTMS Development Team
