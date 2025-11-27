/**
 * Payment Settings Module
 * Enterprise-grade Stripe payment integration for activities
 * 
 * @module payment
 * @version 1.0.0
 * 
 * Architecture:
 * - Types: Centralized type definitions
 * - Hook: Business logic and state management
 * - Components: Modular UI components
 * 
 * Usage:
 * ```tsx
 * import { usePaymentSettings, PaymentHeader, ConfiguredView } from './payment';
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
