/**
 * Stripe Connect Service
 * Frontend service for interacting with Stripe Connect APIs
 */

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export interface ConnectedAccount {
  id: string;
  type: 'express' | 'custom' | 'standard';
  email?: string;
  country?: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements?: {
    currently_due?: string[];
    eventually_due?: string[];
    past_due?: string[];
  };
  metadata?: Record<string, string>;
}

export interface AccountBalance {
  available: Array<{ amount: number; currency: string }>;
  pending: Array<{ amount: number; currency: string }>;
}

export interface Payout {
  id: string;
  amount: number;
  arrival_date: number;
  created: number;
  currency: string;
  description?: string;
  status: 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';
  type: 'bank_account' | 'card';
}

export interface Charge {
  id: string;
  amount: number;
  currency: string;
  created: number;
  description?: string;
  status: string;
  paid: boolean;
  refunded: boolean;
}

export interface Dispute {
  id: string;
  amount: number;
  currency: string;
  created: number;
  reason: string;
  status: 'warning_needs_response' | 'warning_under_review' | 'warning_closed' | 'needs_response' | 'under_review' | 'charge_refunded' | 'won' | 'lost';
  charge: string;
}

export interface Subscription {
  id: string;
  status: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing';
  customer: string;
  current_period_end: number;
  current_period_start: number;
  items: any[];
}

class StripeConnectService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${BACKEND_API_URL}/api/stripe-connect`;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Request failed`);
      }

      return data;
    } catch (error: any) {
      // Don't log full error object - just the message
      const errorMsg = error?.message || 'Request failed';
      console.warn(`[StripeConnect] ${endpoint} failed:`, errorMsg);
      throw new Error(errorMsg);
    }
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  /**
   * Create a new connected account
   */
  async createAccount(params: {
    type: 'express' | 'custom' | 'standard';
    email: string;
    country: string;
    businessType?: 'individual' | 'company';
    capabilities?: string[];
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; account: ConnectedAccount; accountId: string }> {
    return this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * List all connected accounts
   */
  async listAccounts(params?: {
    limit?: number;
  }): Promise<{ success: boolean; accounts: ConnectedAccount[]; count: number }> {
    const query = params?.limit ? `?limit=${params.limit}` : '';
    return this.request(`/accounts${query}`);
  }

  /**
   * Get account details
   */
  async getAccount(accountId: string): Promise<{ success: boolean; account: ConnectedAccount }> {
    return this.request(`/accounts/${accountId}`);
  }

  /**
   * Update connected account
   */
  async updateAccount(
    accountId: string,
    params: Record<string, any>
  ): Promise<{ success: boolean; account: ConnectedAccount }> {
    return this.request(`/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  /**
   * Delete connected account
   */
  async deleteAccount(accountId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // ==================== ONBOARDING ====================

  /**
   * Create account link for onboarding
   */
  async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
    type?: 'account_onboarding' | 'account_update';
  }): Promise<{ success: boolean; url: string }> {
    return this.request('/account-links', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Create account session for embedded components
   */
  async createAccountSession(accountId: string): Promise<{ success: boolean; clientSecret: string }> {
    return this.request('/account-sessions', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  }

  // ==================== BALANCES & PAYOUTS ====================

  /**
   * Get account balance
   */
  async getBalance(accountId: string): Promise<{ success: boolean; balance: AccountBalance }> {
    return this.request(`/accounts/${accountId}/balance`);
  }

  /**
   * Create manual payout
   */
  async createPayout(params: {
    accountId: string;
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; payout: Payout }> {
    const { accountId, ...body } = params;
    return this.request(`/accounts/${accountId}/payouts`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * List payouts
   */
  async listPayouts(params: {
    accountId: string;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; payouts: Payout[]; count: number }> {
    const { accountId, ...query } = params;
    const queryString = new URLSearchParams(query as any).toString();
    return this.request(`/accounts/${accountId}/payouts${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Update payout schedule
   */
  async updatePayoutSchedule(params: {
    accountId: string;
    interval: 'manual' | 'daily' | 'weekly' | 'monthly';
    weeklyAnchor?: string;
    monthlyAnchor?: number;
    delayDays?: number;
  }): Promise<{ success: boolean; account: ConnectedAccount }> {
    const { accountId, ...body } = params;
    return this.request(`/accounts/${accountId}/payout-schedule`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // ==================== TRANSACTIONS ====================

  /**
   * List charges
   */
  async listCharges(params: {
    accountId: string;
    limit?: number;
  }): Promise<{ success: boolean; charges: Charge[]; count: number }> {
    const { accountId, ...query } = params;
    const queryString = new URLSearchParams(query as any).toString();
    return this.request(`/accounts/${accountId}/charges${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * List balance transactions
   */
  async listBalanceTransactions(params: {
    accountId: string;
    limit?: number;
    type?: string;
    payout?: string;
  }): Promise<{ success: boolean; transactions: any[]; count: number }> {
    const { accountId, ...query } = params;
    const queryString = new URLSearchParams(query as any).toString();
    return this.request(`/accounts/${accountId}/balance-transactions${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== DISPUTES ====================

  /**
   * List disputes
   */
  async listDisputes(params: {
    accountId: string;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; disputes: Dispute[]; count: number }> {
    const { accountId, ...query } = params;
    const queryString = new URLSearchParams(query as any).toString();
    return this.request(`/accounts/${accountId}/disputes${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get dispute details
   */
  async getDispute(params: {
    accountId: string;
    disputeId: string;
  }): Promise<{ success: boolean; dispute: Dispute }> {
    return this.request(`/accounts/${params.accountId}/disputes/${params.disputeId}`);
  }

  /**
   * Update dispute evidence
   */
  async updateDispute(params: {
    accountId: string;
    disputeId: string;
    evidence?: Record<string, any>;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; dispute: Dispute }> {
    const { accountId, disputeId, ...body } = params;
    return this.request(`/accounts/${accountId}/disputes/${disputeId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // ==================== SUBSCRIPTIONS ====================

  /**
   * List subscriptions
   */
  async listSubscriptions(params: {
    accountId: string;
    limit?: number;
    status?: string;
  }): Promise<{ success: boolean; subscriptions: Subscription[]; count: number }> {
    const { accountId, ...query } = params;
    const queryString = new URLSearchParams(query as any).toString();
    return this.request(`/accounts/${accountId}/subscriptions${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Create subscription
   */
  async createSubscription(params: {
    accountId: string;
    customerId: string;
    priceId: string;
    applicationFeePercent?: number;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; subscription: Subscription }> {
    const { accountId, ...body } = params;
    return this.request(`/accounts/${accountId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ==================== TRANSFERS & FEES ====================

  /**
   * Create transfer to connected account
   */
  async createTransfer(params: {
    amount: number;
    currency: string;
    destination: string;
    transferGroup?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<{ success: boolean; transfer: any }> {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * List application fees
   */
  async listApplicationFees(params?: {
    limit?: number;
    charge?: string;
  }): Promise<{ success: boolean; fees: any[]; count: number }> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request(`/application-fees${queryString}`);
  }
}

export const stripeConnectService = new StripeConnectService();
export default stripeConnectService;
