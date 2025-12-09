/**
 * Payment Settings Module
 * Enterprise-grade Stripe payment integration for activities
 * Supports Multi-Tenant Stripe Connect Architecture
 * 
 * @module payment
 * @version 2.0.0
 * @date 2025-12-10
 * 
 * Architecture:
 * - Types: Centralized type definitions (includes Stripe Connect types)
 * - Hook: Business logic and state management (with Stripe Connect status)
 * - Components: Modular UI components (with Stripe Connect banner)
 * 
 * Usage:
 * ```tsx
 * import { usePaymentSettings, PaymentHeader, ConfiguredView, StripeConnectBanner } from './payment';
 * ```
 */

// Types
export * from './types';

// Utilities
export * from './priceConverters';

// Hook
export { usePaymentSettings } from './usePaymentSettings';

// Components
export { PaymentStatusBadge } from './PaymentStatusBadge';
export { PaymentHeader } from './PaymentHeader';
export { CreateProductForm } from './CreateProductForm';
export { LinkProductForm } from './LinkProductForm';
export { ConfiguredView } from './ConfiguredView';
export { StripeConnectBanner } from './StripeConnectBanner';
