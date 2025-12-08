/**
 * Stripe Connect Types
 * @module settings/components/stripe-connect/types
 */

export interface StripeAccountStatus {
  connected: boolean;
  accountId?: string;
  type?: string;
  email?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  country?: string;
  defaultCurrency?: string;
  businessName?: string;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    disabledReason?: string;
  };
}

export interface StripeConnectTabProps {
  organizationId: string;
  organizationEmail?: string;
  organizationName?: string;
}

export type ActionType = 'create' | 'link' | 'dashboard' | null;
