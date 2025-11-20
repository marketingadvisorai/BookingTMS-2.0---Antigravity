/**
 * 2Checkout Payment Service
 * 
 * Implements the IPaymentProviderService interface for 2Checkout (now Verifone).
 * This is a placeholder for future 2Checkout integration.
 * 
 * TODO: Implement 2Checkout API integration
 * - 2Checkout REST API for products
 * - 2Checkout Inline Checkout
 * - 2Checkout Subscriptions
 */

import {
  PaymentProviderType,
  IPaymentProviderService,
  ICreateProductParams,
  ILinkProductParams,
  IFetchProductResult,
  IPaymentPrice,
} from '../PaymentProvider.types';

export class TwoCheckoutPaymentService implements IPaymentProviderService {
  provider = PaymentProviderType.TWO_CHECKOUT;

  async createProductAndPrice(params: ICreateProductParams): Promise<{
    productId: string;
    priceId: string;
  }> {
    // TODO: Implement 2Checkout product creation
    // Use 2Checkout Products API
    // https://knowledgecenter.2checkout.com/API-Integration/
    
    console.log('🚧 2Checkout integration coming soon...');
    throw new Error('2Checkout integration not yet implemented');
  }

  async linkExistingProduct(params: ILinkProductParams): Promise<IFetchProductResult> {
    // TODO: Implement 2Checkout product linking
    throw new Error('2Checkout integration not yet implemented');
  }

  async getProduct(productId: string): Promise<any> {
    // TODO: Implement 2Checkout product retrieval
    throw new Error('2Checkout integration not yet implemented');
  }

  async getProductPrices(productId: string): Promise<IPaymentPrice[]> {
    // TODO: Implement 2Checkout price retrieval
    throw new Error('2Checkout integration not yet implemented');
  }

  async updateProductMetadata(
    productId: string,
    metadata: Record<string, string>
  ): Promise<void> {
    // TODO: Implement 2Checkout product update
    throw new Error('2Checkout integration not yet implemented');
  }

  async archiveProduct(productId: string): Promise<void> {
    // TODO: Implement 2Checkout product archival
    throw new Error('2Checkout integration not yet implemented');
  }

  isValidProductId(productId: string): boolean {
    // 2Checkout product codes are typically numeric
    return /^\d+$/.test(productId);
  }

  getDisplayName(): string {
    return '2Checkout';
  }

  getIcon(): string {
    return '💰'; // Or use 2Checkout logo SVG
  }

  getColorScheme(): {
    primary: string;
    secondary: string;
    accent: string;
  } {
    return {
      primary: '#0066CC', // 2Checkout blue
      secondary: '#003D7A', // 2Checkout dark blue
      accent: '#00A3E0', // 2Checkout light blue
    };
  }
}
