/**
 * Billing Module
 * Exports all billing-related components, hooks, services, and types
 * @module billing
 */

// Page
export { BillingPage } from './pages/BillingPage';

// Components
export {
  CurrentPlanCard,
  CreditBalanceCard,
  PlanSelector,
  InvoiceHistory,
  CreditPurchaseDialog,
  BillingCycleToggle,
  CreditInfoSection,
} from './components';

// Hooks
export { useBilling } from './hooks/useBilling';

// Services
export { billingService } from './services/billing.service';

// Types
export type {
  SubscriptionPlan,
  PlanLimits,
  Subscription,
  SubscriptionStatus,
  CreditBalance,
  CreditTransaction,
  CreditTransactionType,
  CreditPackage,
  PaymentMethod,
  Invoice,
  InvoiceStatus,
  BillingData,
  CheckoutSessionResponse,
  PortalSessionResponse,
} from './types';
