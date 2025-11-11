/**
 * Stripe Product Service
 * Automatically creates and manages Stripe products/prices for games
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
    game_id?: string;
    venue_id?: string;
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
  metadata?: Record<string, string>;
}

interface ProductAndPrice {
  productId: string;
  priceId: string;
}

export class StripeProductService {
  private static STRIPE_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  private static get authHeaders() {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!anonKey) {
      console.error('Supabase anon key missing. Check VITE_SUPABASE_ANON_KEY env variable.');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey ?? ''}`,
      apikey: anonKey ?? '',
    } as const;
  }

  private static async parseResponse(response: Response) {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch (error) {
      console.warn('Failed to parse Stripe function response as JSON. Raw response:', text);
      throw new Error('Unexpected response format from Stripe service');
    }
  }
  
  /**
   * Create both Stripe product and price for a game
   * Includes support for child pricing, custom capacity fields, and group discounts
   */
  static async createProductAndPrice(params: CreateProductParams): Promise<ProductAndPrice> {
    try {
      console.log('Creating Stripe product and price with enhanced features:', params);

      // Build comprehensive metadata including all pricing options
      // Add identification metadata for easy Stripe dashboard viewing
      const enhancedMetadata: Record<string, string> = {
        ...(params.metadata || {}),
        
        // === IDENTIFICATION DATA ===
        product_name: params.name,
        product_type: 'game',
        created_at: new Date().toISOString(),
        currency: params.currency || 'usd',
        
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

      // Create price for the product (using adult price as base)
      const priceId = await this.createPrice(productId, {
        amount: params.price,
        currency: params.currency || 'usd',
        metadata: cleanMetadata,
      });

      console.log('Stripe product created with enhanced pricing:', { productId, priceId });

      return { productId, priceId };
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
      const url = `${this.STRIPE_API_URL}/stripe-manage-product`;
      console.log('🌐 Calling Edge Function:', url);
      console.log('📦 Request payload:', {
        action: 'create_product',
        name: params.name,
        description: params.description,
      });

      // Call Stripe API via Edge Function
      const response = await fetch(url, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify({
          action: 'create_product',
          name: params.name,
          description: params.description,
          metadata: params.metadata || {},
        }),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await this.parseResponse(response);
      console.log('📥 Response data:', data);

      if (!response.ok) {
        const errorMsg = data.error || `HTTP ${response.status}: Failed to create Stripe product`;
        console.error('❌ Edge Function error:', errorMsg);
        throw new Error(errorMsg);
      }

      if (!data.productId) {
        throw new Error('Stripe product creation did not return productId');
      }

      console.log('✅ Product created successfully:', data.productId);
      return data.productId;
    } catch (error: any) {
      console.error('❌ Error in createProduct:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
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
      const response = await fetch(`${this.STRIPE_API_URL}/stripe-manage-product`, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify({
          action: 'create_price',
          product: productId,
          unit_amount: Math.round(params.amount * 100), // Convert to cents
          currency: params.currency || 'usd',
          metadata: params.metadata || {},
        }),
      });

      const data = await this.parseResponse(response);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe price');
      }

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
      const response = await fetch(`${this.STRIPE_API_URL}/stripe-manage-product`, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify({
          action: 'update_product',
          productId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const data = await this.parseResponse(response);
        throw new Error(data.error || 'Failed to update Stripe product');
      }
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
      const response = await fetch(`${this.STRIPE_API_URL}/stripe-manage-product`, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify({
          action: 'archive_product',
          productId
        }),
      });

      if (!response.ok) {
        const data = await this.parseResponse(response).catch(() => ({}));
        console.error('Failed to archive Stripe product:', data);
        // Don't throw - archiving is best effort
      }
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
}
