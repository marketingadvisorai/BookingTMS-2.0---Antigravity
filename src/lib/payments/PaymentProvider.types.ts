/**
 * Payment Provider Types
 * 
 * Unified type definitions for all payment providers.
 * This allows easy integration of Stripe, PayPal, 2Checkout, and other providers.
 * 
 * Architecture:
 * - Provider-agnostic interfaces
 * - Consistent data structures
 * - Extensible for future providers
 * - Type-safe implementations
 */

/**
 * Supported payment providers
 */
export enum PaymentProviderType {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  TWO_CHECKOUT = '2checkout',
  SQUARE = 'square',
  RAZORPAY = 'razorpay',
  // Add more providers as needed
}

/**
 * Payment provider status
 */
export enum PaymentProviderStatus {
  NOT_CONFIGURED = 'not_configured',
  CONFIGURED = 'configured',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

/**
 * Generic product interface (works for all providers)
 */
export interface IPaymentProduct {
  id: string;
  provider: PaymentProviderType;
  productId: string; // Provider's product ID
  name: string;
  description?: string;
  prices: IPaymentPrice[];
  metadata?: Record<string, any>;
  status: PaymentProviderStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generic price interface (works for all providers)
 */
export interface IPaymentPrice {
  id: string;
  provider: PaymentProviderType;
  priceId: string; // Provider's price ID
  productId: string;
  amount: number; // In cents
  currency: string;
  interval?: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  lookupKey?: string;
  metadata?: Record<string, any>;
  active: boolean;
}

/**
 * Generic checkout session interface
 */
export interface ICheckoutSession {
  id: string;
  provider: PaymentProviderType;
  sessionId: string; // Provider's session ID
  checkoutUrl: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

/**
 * Payment configuration for a game
 */
export interface IGamePaymentConfig {
  gameId: string;
  gameName: string;
  providers: IProviderConfig[];
  primaryProvider: PaymentProviderType;
  fallbackProvider?: PaymentProviderType;
  updatedAt: Date;
}

/**
 * Provider-specific configuration
 */
export interface IProviderConfig {
  provider: PaymentProviderType;
  enabled: boolean;
  productId?: string;
  priceId?: string;
  checkoutUrl?: string;
  prices?: IPaymentPrice[];
  metadata?: Record<string, any>;
  status: PaymentProviderStatus;
  lastSyncAt?: Date;
}

/**
 * Create product parameters (provider-agnostic)
 */
export interface ICreateProductParams {
  provider: PaymentProviderType;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  metadata?: Record<string, any>;
  // Provider-specific options
  stripeOptions?: {
    childPrice?: number;
    customCapacityFields?: Array<{
      id: string;
      name: string;
      min: number;
      max: number;
      price: number;
    }>;
    groupDiscountEnabled?: boolean;
    groupTiers?: Array<{
      minSize: number;
      maxSize: number;
      discountPercent: number;
    }>;
  };
  paypalOptions?: {
    planType?: 'PHYSICAL_GOODS' | 'DIGITAL_GOODS' | 'SERVICE';
    category?: string;
  };
  twoCheckoutOptions?: {
    tangible?: boolean;
    recurringPrice?: number;
  };
}

/**
 * Link existing product parameters
 */
export interface ILinkProductParams {
  provider: PaymentProviderType;
  productId: string;
  priceId?: string;
  checkoutUrl?: string;
}

/**
 * Fetch product result
 */
export interface IFetchProductResult {
  provider: PaymentProviderType;
  productId: string;
  priceId?: string;
  prices: IPaymentPrice[];
  metadata?: Record<string, any>;
}

/**
 * Payment provider service interface
 * All payment providers must implement this interface
 */
export interface IPaymentProviderService {
  provider: PaymentProviderType;
  
  /**
   * Create a new product and price
   */
  createProductAndPrice(params: ICreateProductParams): Promise<{
    productId: string;
    priceId: string;
  }>;
  
  /**
   * Link an existing product
   */
  linkExistingProduct(params: ILinkProductParams): Promise<IFetchProductResult>;
  
  /**
   * Get product details
   */
  getProduct(productId: string): Promise<any>;
  
  /**
   * Get all prices for a product
   */
  getProductPrices(productId: string): Promise<IPaymentPrice[]>;
  
  /**
   * Update product metadata
   */
  updateProductMetadata(productId: string, metadata: Record<string, string>): Promise<void>;
  
  /**
   * Archive/deactivate a product
   */
  archiveProduct(productId: string): Promise<void>;
  
  /**
   * Validate product ID format
   */
  isValidProductId(productId: string): boolean;
  
  /**
   * Get provider display name
   */
  getDisplayName(): string;
  
  /**
   * Get provider icon/logo
   */
  getIcon(): string;
  
  /**
   * Get provider color scheme
   */
  getColorScheme(): {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Payment provider registry
 * Manages all available payment providers
 */
export interface IPaymentProviderRegistry {
  /**
   * Register a payment provider
   */
  register(service: IPaymentProviderService): void;
  
  /**
   * Get a payment provider by type
   */
  getProvider(provider: PaymentProviderType): IPaymentProviderService | undefined;
  
  /**
   * Get all registered providers
   */
  getAllProviders(): IPaymentProviderService[];
  
  /**
   * Get enabled providers
   */
  getEnabledProviders(): IPaymentProviderService[];
  
  /**
   * Check if provider is registered
   */
  isProviderRegistered(provider: PaymentProviderType): boolean;
}

/**
 * Database schema for payment configurations
 */
export interface IPaymentConfigDB {
  id: string;
  game_id: string;
  provider: PaymentProviderType;
  product_id?: string;
  price_id?: string;
  checkout_url?: string;
  prices?: any; // JSON field
  metadata?: any; // JSON field
  status: PaymentProviderStatus;
  enabled: boolean;
  is_primary: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Widget payment configuration
 */
export interface IWidgetPaymentConfig {
  gameId: string;
  gameName: string;
  gamePrice: number;
  providers: Array<{
    provider: PaymentProviderType;
    enabled: boolean;
    productId?: string;
    priceId?: string;
    checkoutUrl?: string;
    status: PaymentProviderStatus;
  }>;
  primaryProvider: PaymentProviderType;
}
