/**
 * Payment System Entry Point
 * 
 * Initializes and exports all payment-related functionality.
 * This is the main entry point for the payment system.
 * 
 * Usage:
 * ```typescript
 * import { PaymentProviderRegistry, PaymentProviderType } from '@/lib/payments';
 * 
 * // Get Stripe provider
 * const stripe = PaymentProviderRegistry.getProvider(PaymentProviderType.STRIPE);
 * 
 * // Create a product
 * const result = await stripe.createProductAndPrice({
 *   provider: PaymentProviderType.STRIPE,
 *   name: 'My Game',
 *   price: 5000, // $50.00
 *   currency: 'usd',
 * });
 * ```
 */

// Export types
export * from './PaymentProvider.types';

// Export registry
export { PaymentProviderRegistry } from './PaymentProviderRegistry';

// Export provider services
export { StripePaymentService } from './providers/StripePaymentService';
export { PayPalPaymentService } from './providers/PayPalPaymentService';
export { TwoCheckoutPaymentService } from './providers/TwoCheckoutPaymentService';

// Initialize and register all providers
import { PaymentProviderRegistry } from './PaymentProviderRegistry';
import { StripePaymentService } from './providers/StripePaymentService';
// Uncomment when ready to enable
// import { PayPalPaymentService } from './providers/PayPalPaymentService';
// import { TwoCheckoutPaymentService } from './providers/TwoCheckoutPaymentService';

/**
 * Initialize payment providers
 * This is called automatically when the module is imported
 */
function initializePaymentProviders() {
  console.log('🔧 Initializing payment providers...');
  
  // Register Stripe (currently active)
  PaymentProviderRegistry.register(new StripePaymentService());
  
  // Register PayPal (coming soon)
  // PaymentProviderRegistry.register(new PayPalPaymentService());
  
  // Register 2Checkout (coming soon)
  // PaymentProviderRegistry.register(new TwoCheckoutPaymentService());
  
  console.log(`✅ Registered ${PaymentProviderRegistry.getProviderCount()} payment provider(s)`);
}

// Auto-initialize on import
initializePaymentProviders();

/**
 * Helper function to get all available providers
 */
export function getAvailableProviders() {
  return PaymentProviderRegistry.getAllProviders().map(provider => ({
    type: provider.provider,
    name: provider.getDisplayName(),
    icon: provider.getIcon(),
    colors: provider.getColorScheme(),
  }));
}

/**
 * Helper function to check if a provider is available
 */
export function isProviderAvailable(provider: string): boolean {
  return PaymentProviderRegistry.isProviderRegistered(provider as any);
}
