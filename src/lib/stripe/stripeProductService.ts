import { supabase } from '../../lib/supabase';

/**
 * Stripe Product Service
 * Automatically creates and manages Stripe products/prices for games
 * Uses Supabase Edge Functions for secure Stripe operations
 */

interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  currency?: string;
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
  metadata?: {
    activity_id?: string;
    activity_name?: string;
    venue_id?: string;
    venue_name?: string;
    calendar_id?: string;
    calendar_name?: string;
    venue_calendar_id?: string;
    organization_id?: string;
    organization_name?: string;
    company_name?: string;
    duration?: string;
    [key: string]: string | undefined;
  };
}

interface UpdateProductParams {
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface CreatePriceParams {
  amount: number;
  currency?: string;
  lookup_key?: string;
  metadata?: Record<string, string>;
}

interface ProductAndPrice {
  productId: string;
  priceId: string;
}

export class StripeProductService {
  // Helper to invoke Edge Function with improved error handling
  private static async invokeStripeFunction(action: string, params: any) {
    console.log(`[Stripe] Invoking edge function: ${action}`, params);

    try {
      const { data, error } = await supabase.functions.invoke('stripe-manage-product', {
        body: { action, ...params }
      });

      // Handle Supabase function errors
      if (error) {
        console.error(`[Stripe] Edge Function error (${action}):`, {
          name: error.name,
          message: error.message,
          context: (error as any).context,
          status: (error as any).status,
        });

        // Try to extract more details from the error
        let errorMessage = error.message || 'Failed to invoke Stripe function';

        // FunctionsHttpError often has the actual error in context
        if ((error as any).context) {
          try {
            const contextData = (error as any).context;
            if (typeof contextData === 'object' && contextData.error) {
              errorMessage = contextData.error;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }

        throw new Error(errorMessage);
      }

      // Handle errors returned in the data
      if (data?.error) {
        console.error(`[Stripe] API error (${action}):`, data.error);
        throw new Error(data.error);
      }

      console.log(`[Stripe] Success (${action}):`, data);
      return data;
    } catch (err: any) {
      console.error(`[Stripe] Exception in ${action}:`, err);

      // Re-throw with better message
      if (err.message) {
        throw err;
      }
      throw new Error(`Stripe operation ${action} failed`);
    }
  }

  /**
   * Create both Stripe product and price for an activity
   * Includes support for child pricing, custom capacity fields, and group discounts
   */
  static async createProductAndPrice(params: CreateProductParams): Promise<ProductAndPrice & { prices: any[] }> {
    try {
      console.log('Creating Stripe product and price with enhanced features:', params);

      // Build comprehensive metadata including all pricing options
      // Add identification metadata for easy Stripe dashboard viewing
      const enhancedMetadata: Record<string, string> = {
        ...(params.metadata || {}),

        // === IDENTIFICATION DATA ===
        product_name: params.name,
        product_type: 'activity',
        created_at: new Date().toISOString(),
        currency: params.currency || 'usd',

        // === MULTI-TENANT DATA ===
        ...(params.metadata?.organization_id && { organization_id: params.metadata.organization_id }),
        ...(params.metadata?.organization_name && { organization_name: params.metadata.organization_name }),
        ...(params.metadata?.company_name && { company_name: params.metadata.company_name }),
        ...(params.metadata?.venue_id && { venue_id: params.metadata.venue_id }),
        ...(params.metadata?.venue_name && { venue_name: params.metadata.venue_name }),
        ...(params.metadata?.calendar_id && { calendar_id: params.metadata.calendar_id }),
        ...(params.metadata?.calendar_name && { calendar_name: params.metadata.calendar_name }),
        ...(params.metadata?.venue_calendar_id && { venue_calendar_id: params.metadata.venue_calendar_id }),
        ...(params.metadata?.activity_name && { activity_name: params.metadata.activity_name }),

        // === MEDIA DATA ===
        // Add cover image URL if provided in metadata
        ...(params.metadata?.image_url && { image_url: params.metadata.image_url }),

        // === PRICING DATA ===
        adult_price: params.price.toString(),
        adult_price_display: `$${params.price.toFixed(2)}`,
      };

      // Add child pricing if provided
      if (params.childPrice !== undefined && params.childPrice > 0) {
        enhancedMetadata.child_price = params.childPrice.toString();
        enhancedMetadata.child_price_display = `$${params.childPrice.toFixed(2)}`;
        enhancedMetadata.child_pricing_enabled = 'true';
      } else {
        enhancedMetadata.child_pricing_enabled = 'false';
      }

      // Add custom capacity fields if provided
      if (params.customCapacityFields && params.customCapacityFields.length > 0) {
        enhancedMetadata.custom_capacity_enabled = 'true';
        enhancedMetadata.custom_capacity_count = params.customCapacityFields.length.toString();

        // Store each custom field with display names
        params.customCapacityFields.forEach((field, index) => {
          enhancedMetadata[`custom_${index}_name`] = field.name;
          enhancedMetadata[`custom_${index}_price`] = field.price.toString();
          enhancedMetadata[`custom_${index}_price_display`] = `$${field.price.toFixed(2)}`;
          enhancedMetadata[`custom_${index}_min`] = field.min.toString();
          enhancedMetadata[`custom_${index}_max`] = field.max.toString();
          enhancedMetadata[`custom_${index}_range`] = `${field.min}-${field.max} ${field.name}`;
        });

        // Create summary for dashboard
        const customFieldsSummary = params.customCapacityFields
          .map(f => `${f.name}: $${f.price.toFixed(2)}`)
          .join(', ');
        enhancedMetadata.custom_fields_summary = customFieldsSummary;
      } else {
        enhancedMetadata.custom_capacity_enabled = 'false';
      }

      // Add group discount information if enabled
      if (params.groupDiscountEnabled && params.groupTiers && params.groupTiers.length > 0) {
        enhancedMetadata.group_discount_enabled = 'true';
        enhancedMetadata.group_tiers_count = params.groupTiers.length.toString();

        // Store each group tier with display info
        params.groupTiers.forEach((tier, index) => {
          enhancedMetadata[`tier_${index}_min`] = tier.minSize.toString();
          enhancedMetadata[`tier_${index}_max`] = tier.maxSize.toString();
          enhancedMetadata[`tier_${index}_discount`] = tier.discountPercent.toString();
          enhancedMetadata[`tier_${index}_display`] = `${tier.minSize}-${tier.maxSize} people: ${tier.discountPercent}% off`;
        });

        // Create summary for dashboard
        const tiersSummary = params.groupTiers
          .map(t => `${t.minSize}-${t.maxSize}: ${t.discountPercent}%`)
          .join(', ');
        enhancedMetadata.group_tiers_summary = tiersSummary;
      } else {
        enhancedMetadata.group_discount_enabled = 'false';
      }

      // Add pricing summary for quick dashboard view
      let pricingSummary = `Adult: $${params.price.toFixed(2)}`;
      if (params.childPrice && params.childPrice > 0) {
        pricingSummary += `, Child: $${params.childPrice.toFixed(2)}`;
      }
      if (params.customCapacityFields && params.customCapacityFields.length > 0) {
        pricingSummary += `, +${params.customCapacityFields.length} custom`;
      }
      if (params.groupDiscountEnabled && params.groupTiers && params.groupTiers.length > 0) {
        pricingSummary += `, Group discounts: ${params.groupTiers.length} tiers`;
      }
      enhancedMetadata.pricing_summary = pricingSummary;

      // Clean metadata (remove undefined values)
      const cleanMetadata = Object.fromEntries(
        Object.entries(enhancedMetadata).filter(([_, v]) => v !== undefined)
      ) as Record<string, string>;

      console.log('Enhanced Stripe metadata:', cleanMetadata);

      // Create product
      const productId = await this.createProduct({
        name: params.name,
        description: params.description,
        metadata: cleanMetadata,
      });

      const createdPrices: any[] = [];

      // 1. Create Adult Price
      const adultPriceId = await this.createPrice(productId, {
        amount: params.price,
        currency: params.currency || 'usd',
        metadata: { ...cleanMetadata, type: 'adult' },
        lookup_key: 'adult',
      });
      createdPrices.push({ id: adultPriceId, type: 'adult', unit_amount: params.price * 100, currency: params.currency || 'usd' });

      // 2. Create Child Price (if exists)
      if (params.childPrice && params.childPrice > 0) {
        const childPriceId = await this.createPrice(productId, {
          amount: params.childPrice,
          currency: params.currency || 'usd',
          metadata: { ...cleanMetadata, type: 'child' },
          lookup_key: 'child',
        });
        createdPrices.push({ id: childPriceId, type: 'child', unit_amount: params.childPrice * 100, currency: params.currency || 'usd' });
      }

      // 3. Create Custom Prices (if exist)
      if (params.customCapacityFields && params.customCapacityFields.length > 0) {
        for (let i = 0; i < params.customCapacityFields.length; i++) {
          const field = params.customCapacityFields[i];
          if (field.price > 0) {
            const customPriceId = await this.createPrice(productId, {
              amount: field.price,
              currency: params.currency || 'usd',
              metadata: { ...cleanMetadata, type: 'custom', name: field.name },
              lookup_key: `custom_${i}`,
            });
            createdPrices.push({ id: customPriceId, type: 'custom', name: field.name, unit_amount: field.price * 100, currency: params.currency || 'usd' });
          }
        }
      }

      console.log('Stripe product created with enhanced pricing:', { productId, prices: createdPrices });

      return {
        productId,
        priceId: adultPriceId, // Keep for backward compatibility
        prices: createdPrices
      };
    } catch (error) {
      console.error('Error creating product and price:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe product
   */
  static async createProduct(params: {
    name: string;
    description: string;
    metadata?: Record<string, string>;
  }): Promise<string> {
    try {
      console.log('📦 Creating product via Edge Function:', params.name);

      const data = await this.invokeStripeFunction('create_product', {
        name: params.name,
        description: params.description,
        metadata: params.metadata || {},
      });

      if (!data.productId) {
        throw new Error('Stripe product creation did not return productId');
      }

      console.log('✅ Product created successfully:', data.productId);
      return data.productId;
    } catch (error: any) {
      console.error('❌ Error in createProduct:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe price for a product
   */
  static async createPrice(
    productId: string,
    params: CreatePriceParams
  ): Promise<string> {
    try {
      const data = await this.invokeStripeFunction('create_price', {
        product: productId,
        unit_amount: params.amount,
        currency: params.currency || 'usd',
        metadata: params.metadata || {},
      });

      if (!data.priceId) {
        throw new Error('Stripe price creation did not return priceId');
      }

      return data.priceId;
    } catch (error) {
      console.error('Error creating Stripe price:', error);
      throw error;
    }
  }

  /**
   * Update a Stripe product
   */
  static async updateProduct(
    productId: string,
    updates: UpdateProductParams
  ): Promise<void> {
    try {
      await this.invokeStripeFunction('update_product', {
        productId,
        ...updates
      });
    } catch (error) {
      console.error('Error updating Stripe product:', error);
      throw error;
    }
  }

  /**
   * Update product metadata (e.g., after game is created with ID)
   */
  static async updateProductMetadata(
    productId: string,
    metadata: Record<string, string>
  ): Promise<void> {
    try {
      await this.updateProduct(productId, { metadata });
    } catch (error) {
      console.error('Error updating product metadata:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Archive a Stripe product (soft delete)
   */
  static async archiveProduct(productId: string): Promise<void> {
    try {
      await this.invokeStripeFunction('archive_product', { productId });
    } catch (error) {
      console.error('Error archiving Stripe product:', error);
      // Don't throw - archiving is best effort
    }
  }

  /**
   * Check if price has changed and needs update
   */
  static priceHasChanged(oldPrice: number, newPrice: number): boolean {
    return Math.abs(oldPrice - newPrice) > 0.01; // Account for floating point
  }

  /**
   * Create product and price with retry logic
   */
  static async createWithRetry(
    params: CreateProductParams,
    maxRetries: number = 3
  ): Promise<ProductAndPrice> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.createProductAndPrice(params);
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed to create Stripe product after retries');
  }

  /**
   * Get product by ID
   */
  static async getProduct(productId: string): Promise<any> {
    try {
      const data = await this.invokeStripeFunction('get_product', { productId });
      return data.product;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  /**
   * Get all prices for a product
   */
  static async getProductPrices(productId: string): Promise<any[]> {
    try {
      console.log('🔍 Fetching prices for product:', productId);
      const data = await this.invokeStripeFunction('get_prices', { productId });
      console.log('✅ Retrieved prices:', data.prices);
      return data.prices;
    } catch (error) {
      console.error('Error getting product prices:', error);
      throw error;
    }
  }

  /**
   * Link existing product (get product and prices)
   */
  static async linkExistingProduct(params: {
    productId: string;
    priceId?: string;
  }): Promise<{
    productId: string;
    priceId?: string;
    prices: any[];
  }> {
    try {
      console.log('🔗 Linking existing product:', params.productId);

      // Get product details
      const product = await this.getProduct(params.productId);

      // Get all prices for the product
      const prices = await this.getProductPrices(params.productId);

      return {
        productId: params.productId,
        priceId: params.priceId || prices[0]?.id,
        prices: prices.map(p => ({
          priceId: p.id,
          unitAmount: p.unit_amount,
          currency: p.currency,
          lookupKey: p.lookup_key,
          type: p.metadata?.type || p.metadata?.pricing_type,
          metadata: p.metadata,
        })),
      };
    } catch (error) {
      console.error('Error linking product:', error);
      throw error;
    }
  }

  /**
   * Update price using lookup key (creates new price, archives old)
   */
  static async updatePriceByLookupKey(
    lookupKey: string,
    newAmount: number,
    productId: string
  ): Promise<string> {
    try {
      console.log('Updating price via lookup key:', { lookupKey, newAmount, productId });

      // Create new price with same lookup key (Stripe will deactivate old)
      const newPriceId = await this.createPrice(productId, {
        amount: newAmount,
        currency: 'usd',
        lookup_key: lookupKey,
      });

      console.log('New price created with lookup key:', newPriceId);
      return newPriceId;
    } catch (error) {
      console.error('Error updating price by lookup key:', error);
      throw error;
    }
  }

  /**
   * Get price by lookup key
   */
  static async getPriceByLookupKey(lookupKey: string): Promise<any> {
    try {
      const data = await this.invokeStripeFunction('get_price_by_lookup_key', { lookupKey });
      return data.price;
    } catch (error) {
      console.error('Error getting price by lookup key:', error);
      throw error;
    }
  }

  /**
   * Validate product ID format
   */
  static isValidProductId(productId: string): boolean {
    return /^prod_[a-zA-Z0-9]+$/.test(productId);
  }

  /**
   * Validate price lookup key format
   */
  static isValidLookupKey(lookupKey: string): boolean {
    return /^[a-z0-9_-]+$/.test(lookupKey) && lookupKey.length <= 250;
  }
}
