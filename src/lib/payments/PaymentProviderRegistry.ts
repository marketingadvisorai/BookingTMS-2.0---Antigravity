/**
 * Payment Provider Registry
 * 
 * Central registry for all payment providers.
 * Allows easy addition of new providers without modifying existing code.
 * 
 * Usage:
 * ```typescript
 * import { PaymentProviderRegistry } from './PaymentProviderRegistry';
 * import { StripePaymentService } from './providers/StripePaymentService';
 * 
 * // Register providers
 * PaymentProviderRegistry.register(new StripePaymentService());
 * PaymentProviderRegistry.register(new PayPalPaymentService());
 * 
 * // Get a provider
 * const stripe = PaymentProviderRegistry.getProvider(PaymentProviderType.STRIPE);
 * ```
 */

import {
  PaymentProviderType,
  IPaymentProviderService,
  IPaymentProviderRegistry,
} from './PaymentProvider.types';

class PaymentProviderRegistryImpl implements IPaymentProviderRegistry {
  private providers: Map<PaymentProviderType, IPaymentProviderService> = new Map();

  /**
   * Register a payment provider
   */
  register(service: IPaymentProviderService): void {
    if (this.providers.has(service.provider)) {
      console.warn(`Payment provider ${service.provider} is already registered. Overwriting...`);
    }
    
    this.providers.set(service.provider, service);
    console.log(`✅ Registered payment provider: ${service.getDisplayName()}`);
  }

  /**
   * Get a payment provider by type
   */
  getProvider(provider: PaymentProviderType): IPaymentProviderService | undefined {
    return this.providers.get(provider);
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): IPaymentProviderService[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get enabled providers (currently all registered providers)
   */
  getEnabledProviders(): IPaymentProviderService[] {
    return this.getAllProviders();
  }

  /**
   * Check if provider is registered
   */
  isProviderRegistered(provider: PaymentProviderType): boolean {
    return this.providers.has(provider);
  }

  /**
   * Unregister a provider (for testing or dynamic configuration)
   */
  unregister(provider: PaymentProviderType): void {
    if (this.providers.has(provider)) {
      this.providers.delete(provider);
      console.log(`🗑️ Unregistered payment provider: ${provider}`);
    }
  }

  /**
   * Clear all providers (for testing)
   */
  clear(): void {
    this.providers.clear();
    console.log('🗑️ Cleared all payment providers');
  }

  /**
   * Get provider count
   */
  getProviderCount(): number {
    return this.providers.size;
  }
}

// Export singleton instance
export const PaymentProviderRegistry = new PaymentProviderRegistryImpl();

// Export class for testing
export { PaymentProviderRegistryImpl };
