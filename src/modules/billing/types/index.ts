/**
 * Billing Module Types
 * @module billing/types
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  monthly_price: number;
  yearly_price: number;
  monthly_credits: number;
  free_bookings_per_month: number;
  free_ai_conversations_per_month: number;
  transaction_fee_percent: number;
  description: string;
  is_active: boolean;
  is_popular: boolean;
  display_order: number;
  features: string[];
  limits: PlanLimits;
}

export interface PlanLimits {
  games: number;
  staff: number;
  widgets: number;
  api_access: boolean;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_end: string | null;
  billing_cycle: 'monthly' | 'yearly';
  subscription_plans?: SubscriptionPlan;
}

export type SubscriptionStatus = 
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

export interface CreditBalance {
  id: string;
  organization_id: string;
  balance: number;
  plan_credits: number;
  purchased_credits: number;
  last_reset_date: string;
  next_reset_date: string | null;
  bookings_used: number;
  ai_conversations_used: number;
  waivers_used: number;
}

export interface CreditTransaction {
  id: string;
  organization_id: string;
  amount: number;
  type: CreditTransactionType;
  description: string | null;
  booking_id: string | null;
  stripe_payment_intent_id: string | null;
  balance_before: number;
  balance_after: number;
  created_at: string;
}

export type CreditTransactionType = 
  | 'plan_allocation'
  | 'purchase'
  | 'booking'
  | 'waiver'
  | 'ai_conversation'
  | 'refund'
  | 'adjustment'
  | 'expiry';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  display_order: number;
}

export interface PaymentMethod {
  id: string;
  organization_id: string;
  stripe_payment_method_id: string;
  type: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface Invoice {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  invoice_number: string | null;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';

export interface BillingData {
  subscription: Subscription | null;
  creditBalance: CreditBalance | null;
  transactions: CreditTransaction[];
  paymentMethods: PaymentMethod[];
  plans: SubscriptionPlan[];
  creditPackages: CreditPackage[];
  invoices: Invoice[];
}

export interface CheckoutSessionResponse {
  url: string;
  session_id: string;
}

export interface PortalSessionResponse {
  url: string;
}
