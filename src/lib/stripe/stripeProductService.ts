/**
 * Stripe Product Service
 * Automatically creates and manages Stripe products/prices for games
 */

interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  currency?: string;
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
  private static STRIPE_API_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';
  
  /**
   * Create both Stripe product and price for a game
   */
  static async createProductAndPrice(params: CreateProductParams): Promise<ProductAndPrice> {
    try {
      console.log('Creating Stripe product and price:', params);

      // Clean metadata (remove undefined values)
      const cleanMetadata = params.metadata 
        ? Object.fromEntries(
            Object.entries(params.metadata).filter(([_, v]) => v !== undefined)
          ) as Record<string, string>
        : undefined;

      // Create product
      const productId = await this.createProduct({
        name: params.name,
        description: params.description,
        metadata: cleanMetadata,
      });

      // Create price for the product
      const priceId = await this.createPrice(productId, {
        amount: params.price,
        currency: params.currency || 'usd',
        metadata: cleanMetadata,
      });

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
      // Call Stripe API via Edge Function
      const response = await fetch(`${this.STRIPE_API_URL}/stripe-manage-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'create_product',
          name: params.name,
          description: params.description,
          metadata: params.metadata || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create Stripe product');
      }

      const data = await response.json();
      return data.productId;
    } catch (error) {
      console.error('Error creating Stripe product:', error);
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'create_price',
          product: productId,
          unit_amount: Math.round(params.amount * 100), // Convert to cents
          currency: params.currency || 'usd',
          metadata: params.metadata || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create Stripe price');
      }

      const data = await response.json();
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'update_product',
          productId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update Stripe product');
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'archive_product',
          productId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to archive Stripe product:', error);
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
