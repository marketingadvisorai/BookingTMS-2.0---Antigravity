# Backend Quick Reference

**Handy code snippets for common backend operations**

---

## 🔐 Authentication

### Verify Token
```typescript
import { supabase } from './config/supabase';

const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) {
  throw new UnauthorizedError();
}
```

### Get User Profile
```typescript
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
```

### Check Permission
```typescript
import { checkPermission } from './config/supabase';

const hasPermission = await checkPermission(userId, 'bookings.create');
if (!hasPermission) {
  throw new ForbiddenError();
}
```

---

## 📝 Database Operations

### Create Record
```typescript
const { data, error } = await supabase
  .from('bookings')
  .insert({
    organization_id: orgId,
    customer_id: customerId,
    game_id: gameId,
    booking_date: date,
    start_time: time,
  })
  .select()
  .single();

if (error) throw error;
return data;
```

### Update Record
```typescript
const { data, error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId)
  .eq('organization_id', orgId)  // RLS safety
  .select()
  .single();
```

### Delete Record
```typescript
const { error } = await supabase
  .from('bookings')
  .delete()
  .eq('id', bookingId)
  .eq('organization_id', orgId);
```

### Query with Joins
```typescript
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    customer:customers(full_name, email),
    game:games(name, price)
  `)
  .eq('organization_id', orgId)
  .order('booking_date', { ascending: false });
```

### Query with Filters
```typescript
let query = supabase
  .from('bookings')
  .select('*')
  .eq('organization_id', orgId);

if (status) {
  query = query.eq('status', status);
}

if (dateFrom) {
  query = query.gte('booking_date', dateFrom);
}

if (dateTo) {
  query = query.lte('booking_date', dateTo);
}

const { data } = await query;
```

### Pagination
```typescript
const page = 1;
const limit = 20;
const from = (page - 1) * limit;
const to = from + limit - 1;

const { data, error, count } = await supabase
  .from('bookings')
  .select('*', { count: 'exact' })
  .range(from, to);

return {
  data,
  total: count,
  page,
  pages: Math.ceil(count / limit),
};
```

---

## ✅ Validation

### Email
```typescript
import { isValidEmail } from './utils/validation';

if (!isValidEmail(email)) {
  throw new ValidationError('Invalid email format');
}
```

### Date & Time
```typescript
import { isValidDate, isValidTime } from './utils/validation';

if (!isValidDate(date)) {
  throw new ValidationError('Invalid date format. Use YYYY-MM-DD');
}

if (!isValidTime(time)) {
  throw new ValidationError('Invalid time format. Use HH:MM');
}
```

### Batch Validation
```typescript
import { validateFields } from './utils/validation';

const result = validateFields(
  req.body,
  {
    email: isValidEmail,
    date: isValidDate,
    time: isValidTime,
  }
);

if (!result.valid) {
  throw new ValidationError('Validation failed', result.errors);
}
```

---

## ❌ Error Handling

### Throw Custom Errors
```typescript
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from './middleware/errorHandler';

// Validation error (400)
throw new ValidationError('Invalid input', {
  email: 'Email is required',
  date: 'Date must be in the future',
});

// Not found (404)
throw new NotFoundError('Booking');

// Unauthorized (401)
throw new UnauthorizedError('Invalid token');

// Forbidden (403)
throw new ForbiddenError('Insufficient permissions');

// Conflict (409)
throw new ConflictError('Booking already exists');
```

### Try-Catch Pattern
```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NotFoundError) {
    // Handle not found error
  } else {
    // Handle unexpected error
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

---

## 🔄 Service Pattern

### Create Service Class
```typescript
export class MyService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async create(data: CreateDTO, orgId: string): Promise<Entity> {
    // Validate
    this.validate(data);

    // Create
    const { data: entity, error } = await this.supabase
      .from('table')
      .insert({ ...data, organization_id: orgId })
      .select()
      .single();

    if (error) throw error;

    // Post-processing
    await this.sendNotification(entity);

    return entity;
  }

  private validate(data: CreateDTO): void {
    if (!data.required_field) {
      throw new ValidationError('Field is required');
    }
  }

  private async sendNotification(entity: Entity): Promise<void> {
    // Send notification
  }
}
```

### Use Service
```typescript
import { MyService } from './services/MyService';
import { supabase } from './config/supabase';

const service = new MyService(supabase);
const result = await service.create(data, organizationId);
```

---

## 🛣️ API Routes (Express)

### Basic Route
```typescript
import { asyncHandler } from './middleware/errorHandler';
import type { AuthenticatedRequest } from './middleware/auth';

export const getItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const items = await service.list(req.user!.organizationId);
    
    res.json({
      success: true,
      data: items,
    });
  }
);
```

### With Validation
```typescript
export const createItem = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Validate
    const result = validateFields(req.body, validationRules);
    if (!result.valid) {
      throw new ValidationError('Validation failed', result.errors);
    }

    // Create
    const item = await service.create(
      req.body,
      req.user!.organizationId
    );

    res.status(201).json({
      success: true,
      data: item,
    });
  }
);
```

### With Pagination
```typescript
export const listItems = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await service.listWithPagination(
      req.user!.organizationId,
      page,
      limit
    );

    res.json({
      success: true,
      ...result,
    });
  }
);
```

---

## 🎣 Express Setup

### Complete Server
```typescript
import express from 'express';
import { authenticate } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { supabase } from './config/supabase';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.get('/api/items', authenticate(supabase), getItems);
app.post('/api/items', authenticate(supabase), createItem);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
```

---

## 📧 Notifications

### SendGrid Email
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: customer.email,
  from: 'noreply@bookingtms.com',
  subject: 'Booking Confirmation',
  html: `<p>Your booking ${bookingNumber} is confirmed!</p>`,
});
```

### Twilio SMS
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: 'Your booking reminder',
  from: process.env.TWILIO_PHONE_NUMBER,
  to: customer.phone,
});
```

### Create Notification Record
```typescript
await supabase
  .from('notifications')
  .insert({
    organization_id: orgId,
    user_id: userId,
    type: 'booking',
    priority: 'high',
    title: 'New Booking',
    message: `Booking ${bookingNumber} created`,
  });
```

---

## 💳 Stripe

### Create Payment Intent
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100,  // Convert to cents
  currency: 'usd',
  metadata: { booking_id: bookingId },
});
```

### Process Refund
```typescript
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: amount * 100,
});
```

### Handle Webhook
```typescript
const event = stripe.webhooks.constructEvent(
  req.body,
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET!
);

switch (event.type) {
  case 'payment_intent.succeeded':
    await handlePaymentSuccess(event.data.object);
    break;
  case 'payment_intent.payment_failed':
    await handlePaymentFailure(event.data.object);
    break;
}
```

---

## 🔍 Common Patterns

### Generate Unique ID
```typescript
function generateBookingNumber(): string {
  const prefix = 'BK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}
```

### Calculate Date Range
```typescript
function getDateRange(days: number = 30): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return {
    from: from.toISOString().split('T')[0],
    to: now.toISOString().split('T')[0],
  };
}
```

### Format Currency
```typescript
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
```

---

**Quick Tip**: Bookmark this page for fast reference while coding!

**See Also**:
- `/backend/README.md` - Complete documentation
- `/backend/GETTING_STARTED.md` - Detailed examples
- `/backend/services/` - Service implementations
