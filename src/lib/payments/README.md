## # Payment System Architecture

**Enterprise-grade, provider-agnostic payment system for multi-provider support.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Supported Providers](#supported-providers)
- [File Structure](#file-structure)
- [Adding a New Provider](#adding-a-new-provider)
- [Usage Examples](#usage-examples)
- [Database Schema](#database-schema)
- [UI Components](#ui-components)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This payment system is designed to support **multiple payment providers** (Stripe, PayPal, 2Checkout, etc.) through a unified interface. It follows **SOLID principles** and uses the **Strategy Pattern** for provider implementations.

### Key Features

✅ **Provider-agnostic** - Unified interface for all providers  
✅ **Extensible** - Easy to add new providers  
✅ **Type-safe** - Full TypeScript support  
✅ **Scalable** - Registry pattern for provider management  
✅ **Consistent** - Same API for all providers  
✅ **Future-proof** - Built for multi-provider support  

---

## 🏗️ Architecture

### Design Patterns

1. **Strategy Pattern** - Each provider implements `IPaymentProviderService`
2. **Registry Pattern** - `PaymentProviderRegistry` manages all providers
3. **Adapter Pattern** - Provider services adapt external APIs to our interface
4. **Factory Pattern** - Registry creates and returns provider instances

### Core Components

```
src/lib/payments/
├── PaymentProvider.types.ts      # Type definitions
├── PaymentProviderRegistry.ts    # Provider registry
├── index.ts                       # Entry point & initialization
├── providers/
│   ├── StripePaymentService.ts   # Stripe implementation
│   ├── PayPalPaymentService.ts   # PayPal implementation (placeholder)
│   └── TwoCheckoutPaymentService.ts # 2Checkout implementation (placeholder)
└── README.md                      # This file
```

---

## 💳 Supported Providers

### Currently Active

| Provider | Status | Implementation |
|----------|--------|----------------|
| **Stripe** | ✅ Active | Fully implemented |

### Coming Soon

| Provider | Status | Priority |
|----------|--------|----------|
| **PayPal** | 🚧 Planned | High |
| **2Checkout** | 🚧 Planned | Medium |
| **Square** | 📋 Future | Low |
| **Razorpay** | 📋 Future | Low |

---

## 📁 File Structure

### `PaymentProvider.types.ts`

Defines all interfaces and types:

- `PaymentProviderType` - Enum of supported providers
- `IPaymentProviderService` - Interface all providers must implement
- `IPaymentProduct` - Generic product interface
- `IPaymentPrice` - Generic price interface
- `ICreateProductParams` - Parameters for creating products
- `ILinkProductParams` - Parameters for linking products
- And more...

### `PaymentProviderRegistry.ts`

Central registry for managing providers:

```typescript
class PaymentProviderRegistry {
  register(service: IPaymentProviderService): void
  getProvider(provider: PaymentProviderType): IPaymentProviderService
  getAllProviders(): IPaymentProviderService[]
  isProviderRegistered(provider: PaymentProviderType): boolean
}
```

### `providers/StripePaymentService.ts`

Stripe implementation:

```typescript
class StripePaymentService implements IPaymentProviderService {
  createProductAndPrice(params): Promise<{productId, priceId}>
  linkExistingProduct(params): Promise<IFetchProductResult>
  getProduct(productId): Promise<any>
  getProductPrices(productId): Promise<IPaymentPrice[]>
  // ... more methods
}
```

---

## ➕ Adding a New Provider

### Step 1: Create Provider Service

Create a new file in `providers/` directory:

```typescript
// src/lib/payments/providers/YourProviderService.ts

import {
  PaymentProviderType,
  IPaymentProviderService,
  ICreateProductParams,
  // ... other imports
} from '../PaymentProvider.types';

export class YourProviderService implements IPaymentProviderService {
  provider = PaymentProviderType.YOUR_PROVIDER;

  async createProductAndPrice(params: ICreateProductParams) {
    // Implement product creation
    // Call your provider's API
    // Return { productId, priceId }
  }

  async linkExistingProduct(params: ILinkProductParams) {
    // Implement product linking
  }

  // Implement all other required methods...

  getDisplayName(): string {
    return 'Your Provider';
  }

  getIcon(): string {
    return '💵'; // Or SVG logo
  }

  getColorScheme() {
    return {
      primary: '#FF0000',
      secondary: '#CC0000',
      accent: '#FF3333',
    };
  }
}
```

### Step 2: Add Provider Type

Update `PaymentProvider.types.ts`:

```typescript
export enum PaymentProviderType {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  YOUR_PROVIDER = 'your_provider', // Add this
}
```

### Step 3: Register Provider

Update `index.ts`:

```typescript
import { YourProviderService } from './providers/YourProviderService';

function initializePaymentProviders() {
  PaymentProviderRegistry.register(new StripePaymentService());
  PaymentProviderRegistry.register(new YourProviderService()); // Add this
}
```

### Step 4: Update UI Components

The UI components are already provider-agnostic and will automatically support your new provider!

---

## 💻 Usage Examples

### Basic Usage

```typescript
import { PaymentProviderRegistry, PaymentProviderType } from '@/lib/payments';

// Get a provider
const stripe = PaymentProviderRegistry.getProvider(PaymentProviderType.STRIPE);

// Create a product
const result = await stripe.createProductAndPrice({
  provider: PaymentProviderType.STRIPE,
  name: 'Escape Room Experience',
  description: 'Amazing escape room adventure',
  price: 5000, // $50.00 in cents
  currency: 'usd',
  metadata: {
    game_id: 'game_123',
    venue_id: 'venue_456',
  },
});

console.log('Product created:', result.productId);
console.log('Price created:', result.priceId);
```

### Link Existing Product

```typescript
const stripe = PaymentProviderRegistry.getProvider(PaymentProviderType.STRIPE);

const result = await stripe.linkExistingProduct({
  provider: PaymentProviderType.STRIPE,
  productId: 'prod_xxxxxxxxxxxxx',
  priceId: 'price_xxxxxxxxxxxxx', // Optional
});

console.log('Linked product:', result.productId);
console.log('Available prices:', result.prices);
```

### Get All Providers

```typescript
import { getAvailableProviders } from '@/lib/payments';

const providers = getAvailableProviders();

providers.forEach(provider => {
  console.log(`${provider.icon} ${provider.name}`);
  console.log(`Primary color: ${provider.colors.primary}`);
});
```

### Multi-Provider Support

```typescript
// Get all registered providers
const allProviders = PaymentProviderRegistry.getAllProviders();

// Create product in multiple providers
for (const provider of allProviders) {
  try {
    const result = await provider.createProductAndPrice({
      provider: provider.provider,
      name: 'My Game',
      price: 5000,
      currency: 'usd',
    });
    console.log(`Created in ${provider.getDisplayName()}:`, result);
  } catch (error) {
    console.error(`Failed for ${provider.getDisplayName()}:`, error);
  }
}
```

---

## 🗄️ Database Schema

### Recommended Table Structure

```sql
-- Payment configurations table
CREATE TABLE payment_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', '2checkout'
  product_id VARCHAR(255),
  price_id VARCHAR(255),
  checkout_url TEXT,
  prices JSONB, -- Array of price objects
  metadata JSONB,
  status VARCHAR(50) DEFAULT 'not_configured',
  enabled BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(game_id, provider)
);

-- Index for faster queries
CREATE INDEX idx_payment_configs_game_id ON payment_configurations(game_id);
CREATE INDEX idx_payment_configs_provider ON payment_configurations(provider);
CREATE INDEX idx_payment_configs_enabled ON payment_configurations(enabled);
```

### Migration Example

```sql
-- Add payment configurations support
ALTER TABLE games ADD COLUMN IF NOT EXISTS primary_payment_provider VARCHAR(50) DEFAULT 'stripe';

-- Migrate existing Stripe data
INSERT INTO payment_configurations (game_id, provider, product_id, price_id, checkout_url, status, enabled, is_primary)
SELECT 
  id as game_id,
  'stripe' as provider,
  stripe_product_id as product_id,
  stripe_price_id as price_id,
  stripe_checkout_url as checkout_url,
  CASE 
    WHEN stripe_product_id IS NOT NULL THEN 'configured'
    ELSE 'not_configured'
  END as status,
  true as enabled,
  true as is_primary
FROM games
WHERE stripe_product_id IS NOT NULL;
```

---

## 🎨 UI Components

### Provider-Agnostic Components

The UI components are designed to work with any provider:

#### `WidgetPaymentSettingsModal.tsx`

Already supports multiple providers! Just needs minor updates:

```typescript
// Instead of hardcoded Stripe
const providers = PaymentProviderRegistry.getAllProviders();

// Display all providers
{providers.map(provider => (
  <ProviderCard
    key={provider.provider}
    name={provider.getDisplayName()}
    icon={provider.getIcon()}
    colors={provider.getColorScheme()}
    // ... rest of props
  />
))}
```

#### Provider Selector Component (Future)

```typescript
<ProviderSelector
  selectedProvider={selectedProvider}
  onProviderChange={setSelectedProvider}
  availableProviders={getAvailableProviders()}
/>
```

---

## ✅ Best Practices

### 1. Always Use the Registry

```typescript
// ✅ Good
const provider = PaymentProviderRegistry.getProvider(PaymentProviderType.STRIPE);

// ❌ Bad
const provider = new StripePaymentService();
```

### 2. Handle Provider Unavailability

```typescript
const provider = PaymentProviderRegistry.getProvider(PaymentProviderType.PAYPAL);

if (!provider) {
  console.error('PayPal provider not available');
  return;
}

// Use provider...
```

### 3. Use Type-Safe Enums

```typescript
// ✅ Good
PaymentProviderType.STRIPE

// ❌ Bad
'stripe'
```

### 4. Implement Error Handling

```typescript
try {
  const result = await provider.createProductAndPrice(params);
} catch (error) {
  if (error.message.includes('not yet implemented')) {
    toast.error('This provider is coming soon!');
  } else {
    toast.error('Failed to create product');
  }
}
```

### 5. Store Provider Type in Database

```typescript
// Store the provider type with the configuration
await supabase.from('payment_configurations').insert({
  game_id: gameId,
  provider: PaymentProviderType.STRIPE, // Store as enum value
  product_id: productId,
  // ...
});
```

### 6. Support Multiple Providers Per Game

```typescript
// A game can have multiple payment providers
const gamePaymentConfigs = await supabase
  .from('payment_configurations')
  .select('*')
  .eq('game_id', gameId);

// Primary provider
const primaryConfig = gamePaymentConfigs.find(c => c.is_primary);

// Fallback providers
const fallbackConfigs = gamePaymentConfigs.filter(c => !c.is_primary);
```

---

## 🚀 Future Enhancements

### Planned Features

- [ ] **Provider Health Checks** - Monitor provider API status
- [ ] **Automatic Failover** - Switch to fallback provider on failure
- [ ] **Provider Analytics** - Track usage and success rates per provider
- [ ] **A/B Testing** - Test different providers for conversion optimization
- [ ] **Dynamic Provider Selection** - Choose provider based on user location
- [ ] **Provider-Specific Features** - Support unique features per provider
- [ ] **Webhook Handling** - Unified webhook processing for all providers
- [ ] **Refund Management** - Cross-provider refund handling

---

## 📚 Additional Resources

### Provider Documentation

- **Stripe**: https://stripe.com/docs/api
- **PayPal**: https://developer.paypal.com/docs/api/overview/
- **2Checkout**: https://knowledgecenter.2checkout.com/API-Integration/

### Related Files

- `src/lib/stripe/stripeProductService.ts` - Original Stripe service
- `src/components/widgets/WidgetPaymentSettingsModal.tsx` - Payment UI
- `src/components/games/steps/Step6PaymentSettings.tsx` - Game payment settings

---

## 🤝 Contributing

When adding a new provider:

1. Create provider service implementing `IPaymentProviderService`
2. Add provider type to `PaymentProviderType` enum
3. Register provider in `index.ts`
4. Update this README with provider details
5. Add tests for the new provider
6. Update UI components if needed

---

**Built with ❤️ for enterprise-grade multi-provider payment support**
