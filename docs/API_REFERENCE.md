# BookingTMS API Reference

> Version: 0.1.46  
> Last Updated: 2025-11-28

Complete API documentation for BookingTMS Supabase Edge Functions.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Checkout API](#checkout-api)
3. [Booking API](#booking-api)
4. [Widget Config API](#widget-config-api)
5. [Stripe Integration](#stripe-integration)
6. [Error Codes](#error-codes)

---

## Authentication

Most edge functions require authentication via Supabase JWT or API key.

### Headers

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

### Public Endpoints

These endpoints don't require authentication:
- `GET /embed-pro?key={embedKey}` - Widget rendering
- `POST /create-checkout-session` - Customer checkout

---

## Checkout API

### Create Checkout Session

Creates a Stripe Checkout session for booking payment.

**Endpoint:** `POST /functions/v1/create-checkout-session`

**Request Body:**

```json
{
  "activityId": "uuid",
  "organizationId": "uuid",
  "date": "2024-12-25",
  "time": "14:00",
  "partySize": 4,
  "childCount": 2,
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "notes": "Optional notes"
  },
  "priceId": "price_xxx",
  "adultPriceId": "price_adult_xxx",
  "adultQuantity": 4,
  "childPriceId": "price_child_xxx",
  "childQuantity": 2,
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel",
  "embedKey": "optional-for-tracking"
}
```

**Response:**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_xxx",
  "sessionId": "cs_xxx"
}
```

**Error Response:**

```json
{
  "error": "Missing required field: activityId",
  "code": "VALIDATION_ERROR"
}
```

---

## Booking API

### Create Booking

Creates a booking record after successful payment.

**Endpoint:** `POST /functions/v1/create-booking`

**Request Body:**

```json
{
  "activityId": "uuid",
  "sessionId": "uuid",
  "customerId": "uuid",
  "organizationId": "uuid",
  "date": "2024-12-25",
  "time": "14:00",
  "partySize": 4,
  "totalAmount": 12000,
  "currency": "USD",
  "paymentIntentId": "pi_xxx",
  "status": "confirmed",
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Response:**

```json
{
  "booking": {
    "id": "uuid",
    "reference": "BK-ABC123-XYZ",
    "status": "confirmed",
    "createdAt": "2024-11-28T10:00:00Z"
  }
}
```

### Verify Checkout Session

Verifies Stripe checkout and creates booking.

**Endpoint:** `POST /functions/v1/verify-checkout-session`

**Request Body:**

```json
{
  "sessionId": "cs_xxx"
}
```

**Response:**

```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "reference": "BK-ABC123-XYZ"
  }
}
```

---

## Widget Config API

### Get Activity Widget Config

Fetches configuration for single-activity widget.

**Endpoint:** `GET /rest/v1/rpc/get_activity_widget_config`

**Parameters:**

```json
{
  "p_activity_id": "uuid"
}
```

**Response:**

```json
{
  "activity": {
    "id": "uuid",
    "name": "Escape Room Adventure",
    "description": "60-minute challenge",
    "price": 35.00,
    "childPrice": 25.00,
    "duration": 60,
    "minPlayers": 2,
    "maxPlayers": 8,
    "schedule": {
      "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      "startTime": "10:00",
      "endTime": "20:00",
      "slotInterval": 60
    }
  },
  "venue": {
    "id": "uuid",
    "name": "Adventure Zone",
    "timezone": "America/New_York"
  },
  "style": {
    "primaryColor": "#3b82f6",
    "theme": "light"
  }
}
```

### Get Venue Widget Config

Fetches configuration for venue widget (multiple activities).

**Endpoint:** `GET /rest/v1/rpc/get_venue_widget_config`

**Parameters:**

```json
{
  "p_embed_key": "your-embed-key"
}
```

**Response:**

```json
{
  "venue": {
    "id": "uuid",
    "name": "Adventure Zone",
    "city": "New York"
  },
  "activities": [
    { "id": "uuid", "name": "Escape Room", "price": 35.00 },
    { "id": "uuid", "name": "Laser Tag", "price": 25.00 }
  ],
  "style": {
    "primaryColor": "#3b82f6"
  }
}
```

---

## Stripe Integration

### Manage Products

Creates or updates Stripe products and prices.

**Endpoint:** `POST /functions/v1/stripe-manage-product`

**Actions:**

#### Create Product

```json
{
  "action": "create",
  "organizationId": "uuid",
  "name": "Escape Room Adventure",
  "description": "60-minute challenge",
  "price": 3500,
  "currency": "USD",
  "activityId": "uuid"
}
```

#### Create Multi-Tier Prices

```json
{
  "action": "create_multi_tier_prices",
  "organizationId": "uuid",
  "productId": "prod_xxx",
  "activityId": "uuid",
  "tiers": {
    "adult": { "amount": 3500, "currency": "USD" },
    "child": { "amount": 2500, "currency": "USD" }
  }
}
```

#### Sync Activity Prices

```json
{
  "action": "sync_activity_prices",
  "activityId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "productId": "prod_xxx",
  "priceId": "price_xxx",
  "stripePrices": {
    "adult": { "price_id": "price_adult_xxx", "amount": 3500 },
    "child": { "price_id": "price_child_xxx", "amount": 2500 }
  }
}
```

---

## Error Codes

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing auth |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable - Validation failed |
| 500 | Server Error - Internal error |

### Application Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_EMBED_KEY` | Embed key not found or inactive | Verify embed key |
| `ACTIVITY_NOT_FOUND` | Activity ID doesn't exist | Check activity ID |
| `VENUE_NOT_FOUND` | Venue not found for embed key | Check venue setup |
| `NO_AVAILABILITY` | No time slots available | Check schedule config |
| `CAPACITY_EXCEEDED` | Party size exceeds max | Reduce party size |
| `VALIDATION_ERROR` | Request validation failed | Check required fields |
| `STRIPE_ERROR` | Stripe API error | Check Stripe config |
| `PAYMENT_FAILED` | Payment processing failed | Retry or use different card |
| `SESSION_EXPIRED` | Checkout session timed out | Restart checkout flow |
| `UNAUTHORIZED` | Missing or invalid auth | Check API credentials |
| `RATE_LIMITED` | Too many requests | Wait and retry |

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context if available"
  }
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Widget Config | 100 req/min |
| Checkout | 20 req/min per IP |
| Booking | 10 req/min per customer |

---

## Webhooks

### Stripe Webhook Events

Configure webhook URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`

**Handled Events:**
- `checkout.session.completed` - Creates booking
- `payment_intent.succeeded` - Updates payment status
- `payment_intent.payment_failed` - Marks booking failed
- `charge.refunded` - Updates refund status

---

## SDK Usage

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get widget config
const { data, error } = await supabase.rpc('get_activity_widget_config', {
  p_activity_id: 'uuid-here'
});

// Create checkout session
const response = await supabase.functions.invoke('create-checkout-session', {
  body: {
    activityId: 'uuid',
    date: '2024-12-25',
    time: '14:00',
    partySize: 4,
    customerInfo: { ... }
  }
});
```

---

## Support

- **Issues**: GitHub Issues
- **Email**: api-support@yourdomain.com
