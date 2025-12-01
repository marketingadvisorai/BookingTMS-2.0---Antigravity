/**
 * Stripe Connect Types
 * 
 * Type definitions for Stripe Connect integration.
 */

export type OnboardingStatus = 
  | 'not_started'
  | 'pending'
  | 'in_progress'
  | 'action_required'
  | 'complete'
  | 'rejected';

export type AccountType = 'express' | 'standard' | 'custom';

export interface StripeConnectAccount {
  id: string;
  type: AccountType;
  email: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  country: string;
  defaultCurrency: string;
  businessProfile?: {
    name?: string;
    url?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    disabledReason?: string;
  };
  capabilities?: {
    cardPayments: 'active' | 'inactive' | 'pending';
    transfers: 'active' | 'inactive' | 'pending';
  };
  createdAt?: string;
}

export interface OrganizationStripeStatus {
  organizationId: string;
  organizationName: string;
  stripeAccountId: string | null;
  onboardingStatus: OnboardingStatus;
  account?: StripeConnectAccount;
  lastChecked?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'complete' | 'error';
  icon: string;
}

export interface CreateAccountParams {
  organizationId: string;
  email: string;
  country: string;
  businessType: 'individual' | 'company';
  businessName?: string;
}

export interface AccountLinkParams {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  type: 'account_onboarding' | 'account_update';
}

export interface StripeConnectState {
  status: OrganizationStripeStatus | null;
  isLoading: boolean;
  error: string | null;
  onboardingUrl: string | null;
}
