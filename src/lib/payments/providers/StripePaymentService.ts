/**
 * Stripe Payment Service
 * 
 * Implements the IPaymentProviderService interface for Stripe.
 * This is a wrapper around the existing StripeProductService.
 * 
 * Future providers (PayPal, 2Checkout) will follow the same pattern.
 */

import {
  PaymentProviderType,
  PaymentProviderStatus,
  IPaymentProviderService,
  ICreateProductParams,
  ILinkProductParams,
  IFetchProductResult,
  IPaymentPrice,
} from '../PaymentProvider.types';
import { StripeProductService } from '../../stripe/stripeProductService';

export class StripePaymentService implements IPaymentProviderService {
  provider = PaymentProviderType.STRIPE;

  /**
   * Create a new product and price in Stripe
   */
  async createProductAndPrice(params: ICreateProductParams): Promise<{
    productId: string;
    priceId: string;
  }> {
    // Map generic params to Stripe-specific params
    const stripeParams = {
      name: params.name,
      description: params.description || '',
      price: params.price,
      currency: params.currency || 'usd',
      metadata: params.metadata || {},
      // Stripe-specific options
      childPrice: params.stripeOptions?.childPrice,
      customCapacityFields: params.stripeOptions?.customCapacityFields,
      groupDiscountEnabled: params.stripeOptions?.groupDiscountEnabled,
      groupTiers: params.stripeOptions?.groupTiers,
    };

    return await StripeProductService.createProductAndPrice(stripeParams);
  }

  /**
   * Link an existing Stripe product
   */
  async linkExistingProduct(params: ILinkProductParams): Promise<IFetchProductResult> {
    const result = await StripeProductService.linkExistingProduct({
      productId: params.productId,
      priceId: params.priceId,
    });

    // Map Stripe prices to generic IPaymentPrice format
    const prices: IPaymentPrice[] = result.prices.map((p: any) => ({
      id: p.priceId,
      provider: PaymentProviderType.STRIPE,
      priceId: p.priceId,
      productId: params.productId,
      amount: p.unitAmount,
      currency: p.currency,
      interval: this.mapStripeInterval(p.metadata?.pricing_type),
      lookupKey: p.lookupKey,
      metadata: p.metadata,
      active: true,
    }));

    return {
      provider: PaymentProviderType.STRIPE,
      productId: result.productId,
      priceId: result.priceId,
      prices,
      metadata: {},
    };
  }

  /**
   * Get Stripe product details
   */
  async getProduct(productId: string): Promise<any> {
    return await StripeProductService.getProduct(productId);
  }

  /**
   * Get all prices for a Stripe product
   */
  async getProductPrices(productId: string): Promise<IPaymentPrice[]> {
    const stripePrices = await StripeProductService.getProductPrices(productId);

    return stripePrices.map((p: any) => ({
      id: p.id,
      provider: PaymentProviderType.STRIPE,
      priceId: p.id,
      productId: productId,
      amount: p.unit_amount,
      currency: p.currency,
      interval: this.mapStripeInterval(p.metadata?.pricing_type),
      lookupKey: p.lookup_key,
      metadata: p.metadata,
      active: p.active,
    }));
  }

  /**
   * Update Stripe product metadata
   */
  async updateProductMetadata(
    productId: string,
    metadata: Record<string, string>
  ): Promise<void> {
    await StripeProductService.updateProductMetadata(productId, metadata);
  }

  /**
   * Archive a Stripe product
   */
  async archiveProduct(productId: string): Promise<void> {
    await StripeProductService.archiveProduct(productId);
  }

  /**
   * Validate Stripe product ID format
   */
  isValidProductId(productId: string): boolean {
    return StripeProductService.isValidProductId(productId);
  }

  /**
   * Get display name
   */
  getDisplayName(): string {
    return 'Stripe';
  }

  /**
   * Get Stripe icon
   */
  getIcon(): string {
    return '💳'; // Or use a proper Stripe logo SVG
  }

  /**
   * Get Stripe color scheme
   */
  getColorScheme(): {
    primary: string;
    secondary: string;
    accent: string;
  } {
    return {
      primary: '#635BFF', // Stripe purple
      secondary: '#0A2540', // Stripe dark blue
      accent: '#00D4FF', // Stripe cyan
    };
  }

  /**
   * Helper: Map Stripe pricing type to generic interval
   */
  private mapStripeInterval(
    pricingType?: string
  ): 'one_time' | 'daily' | 'weekly' | 'monthly' | 'yearly' {
    switch (pricingType) {
      case 'recurring_monthly':
        return 'monthly';
      case 'recurring_yearly':
        return 'yearly';
      default:
        return 'one_time';
    }
  }
}
