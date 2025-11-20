/**
 * Stripe Service
 * Secure Stripe payment processing service
 * @module backend/services
 */

import Stripe from 'stripe';
import { backendSecrets } from '../config/secrets.config';

/**
 * Stripe configuration interface
 */
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  currency: string;
  country: string;
}

/**
 * Payment intent creation parameters
 */
export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
  automaticPaymentMethods?: boolean;
}

/**
 * Customer creation parameters
 */
export interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
  address?: Stripe.AddressParam;
  metadata?: Record<string, string>;
}

/**
 * Stripe Service Class
 * Handles all Stripe operations securely
 */
class StripeService {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor() {
    // Initialize Stripe with secret key
    this.stripe = new Stripe(backendSecrets.stripe.secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    });

    // Set configuration
    this.config = {
      secretKey: backendSecrets.stripe.secretKey,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: backendSecrets.stripe.webhookSecret,
      currency: 'usd',
      country: 'US',
    };
  }

  /**
   * Get Stripe configuration (safe for frontend)
   */
  public getPublicConfig() {
    return {
      publishableKey: this.config.publishableKey,
      currency: this.config.currency,
      country: this.config.country,
    };
  }

  /**
   * Create a payment intent
   */
  public async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency || this.config.currency,
        customer: params.customerId,
        description: params.description,
        metadata: params.metadata || {},
        automatic_payment_methods: {
          enabled: params.automaticPaymentMethods !== false,
        },
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Confirm a payment intent
   */
  public async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  /**
   * Create a customer
   */
  public async createCustomer(params: CreateCustomerParams): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        address: params.address,
        metadata: params.metadata || {},
      });

      return customer;
    } catch (error) {
      console.error('Stripe customer creation failed:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Get customer by ID
   */
  public async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      return customer;
    } catch (error) {
      console.error('Stripe customer retrieval failed:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  /**
   * Create a refund
   */
  public async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason as Stripe.RefundCreateParams.Reason,
      });

      return refund;
    } catch (error) {
      console.error('Stripe refund creation failed:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Verify webhook signature
   */
  public verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Stripe webhook verification failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Create a checkout session
   */
  public async createCheckoutSession(params: {
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: params.lineItems,
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer: params.customerId,
        metadata: params.metadata || {},
      });

      return session;
    } catch (error) {
      console.error('Stripe checkout session creation failed:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Get payment methods for customer
   */
  public async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Stripe payment methods retrieval failed:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  /**
   * Test Stripe connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.stripe.accounts.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      return false;
    }
  }

  /**
   * Get account information
   */
  public async getAccountInfo(): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.retrieve();
      return account;
    } catch (error) {
      console.error('Stripe account info retrieval failed:', error);
      throw new Error('Failed to retrieve account information');
    }
  }

  /**
   * Create a product
   */
  public async createProduct(params: {
    name: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        name: params.name,
        description: params.description,
        metadata: params.metadata || {},
      });

      console.log('✅ Stripe product created:', product.id);
      return product;
    } catch (error) {
      console.error('Stripe product creation failed:', error);
      throw new Error('Failed to create Stripe product');
    }
  }

  /**
   * Create a price for a product
   */
  public async createPrice(params: {
    productId: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        product: params.productId,
        unit_amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency || this.config.currency,
        metadata: params.metadata || {},
      });

      console.log('✅ Stripe price created:', price.id);
      return price;
    } catch (error) {
      console.error('Stripe price creation failed:', error);
      throw new Error('Failed to create Stripe price');
    }
  }

  /**
   * Update a product
   */
  public async updateProduct(
    productId: string,
    params: {
      name?: string;
      description?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.update(productId, params);
      console.log('✅ Stripe product updated:', product.id);
      return product;
    } catch (error) {
      console.error('Stripe product update failed:', error);
      throw new Error('Failed to update Stripe product');
    }
  }

  /**
   * Archive a product (soft delete)
   */
  public async archiveProduct(productId: string): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.update(productId, {
        active: false,
      });
      console.log('✅ Stripe product archived:', product.id);
      return product;
    } catch (error) {
      console.error('Stripe product archival failed:', error);
      throw new Error('Failed to archive Stripe product');
    }
  }

  /**
   * Get a product by ID
   */
  public async getProduct(productId: string): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.retrieve(productId);
      return product;
    } catch (error) {
      console.error('Stripe product retrieval failed:', error);
      throw new Error('Failed to retrieve Stripe product');
    }
  }

  /**
   * List all products
   */
  public async listProducts(params?: {
    active?: boolean;
    limit?: number;
  }): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list({
        active: params?.active,
        limit: params?.limit || 100,
      });
      return products.data;
    } catch (error) {
      console.error('Stripe products listing failed:', error);
      throw new Error('Failed to list Stripe products');
    }
  }

  // ==================== STRIPE CONNECT METHODS ====================

  /**
   * Create a connected account (Express or Custom)
   */
  public async createConnectedAccount(params: {
    type: 'express' | 'custom' | 'standard';
    email: string;
    country: string;
    businessType?: 'individual' | 'company';
    capabilities?: string[];
    metadata?: Record<string, string>;
  }): Promise<Stripe.Account> {
    try {
      const capabilities: any = {};
      
      // Set default capabilities
      const defaultCapabilities = params.capabilities || ['card_payments', 'transfers'];
      defaultCapabilities.forEach(cap => {
        capabilities[cap] = { requested: true };
      });

      const account = await this.stripe.accounts.create({
        type: params.type,
        email: params.email,
        country: params.country,
        business_type: params.businessType || 'company',
        capabilities,
        metadata: params.metadata || {},
      });

      console.log('✅ Connected account created:', account.id);
      return account;
    } catch (error) {
      console.error('Connected account creation failed:', error);
      throw new Error('Failed to create connected account');
    }
  }

  /**
   * Generate account link for onboarding
   */
  public async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
    type?: 'account_onboarding' | 'account_update';
  }): Promise<Stripe.AccountLink> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: params.accountId,
        refresh_url: params.refreshUrl,
        return_url: params.returnUrl,
        type: params.type || 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      console.error('Account link creation failed:', error);
      throw new Error('Failed to create account link');
    }
  }

  /**
   * Create account session for embedded components
   */
  public async createAccountSession(accountId: string): Promise<Stripe.AccountSession> {
    try {
      const accountSession = await this.stripe.accountSessions.create({
        account: accountId,
        components: {
          account_onboarding: { enabled: true },
          payments: { enabled: true },
          payouts: { enabled: true },
        },
      });

      return accountSession;
    } catch (error) {
      console.error('Account session creation failed:', error);
      throw new Error('Failed to create account session');
    }
  }

  /**
   * Get connected account details
   */
  public async getConnectedAccount(accountId: string): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      console.error('Connected account retrieval failed:', error);
      throw new Error('Failed to retrieve connected account');
    }
  }

  /**
   * List all connected accounts
   */
  public async listConnectedAccounts(params?: {
    limit?: number;
  }): Promise<Stripe.Account[]> {
    try {
      const accounts = await this.stripe.accounts.list({
        limit: params?.limit || 100,
      });
      return accounts.data;
    } catch (error) {
      console.error('Connected accounts listing failed:', error);
      throw new Error('Failed to list connected accounts');
    }
  }

  /**
   * Update connected account
   */
  public async updateConnectedAccount(
    accountId: string,
    params: Stripe.AccountUpdateParams
  ): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.update(accountId, params);
      console.log('✅ Connected account updated:', account.id);
      return account;
    } catch (error) {
      console.error('Connected account update failed:', error);
      throw new Error('Failed to update connected account');
    }
  }

  /**
   * Delete (deactivate) connected account
   */
  public async deleteConnectedAccount(accountId: string): Promise<Stripe.Account | Stripe.DeletedAccount> {
    try {
      const account = await this.stripe.accounts.del(accountId);
      console.log('✅ Connected account deleted:', account.id);
      return account;
    } catch (error) {
      console.error('Connected account deletion failed:', error);
      throw new Error('Failed to delete connected account');
    }
  }

  /**
   * Get balance for a connected account
   */
  public async getConnectedAccountBalance(accountId: string): Promise<Stripe.Balance> {
    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: accountId,
      });
      return balance;
    } catch (error) {
      console.error('Balance retrieval failed:', error);
      throw new Error('Failed to retrieve balance');
    }
  }

  /**
   * Create manual payout for connected account
   */
  public async createPayout(params: {
    accountId: string;
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Payout> {
    try {
      const payout = await this.stripe.payouts.create(
        {
          amount: Math.round(params.amount * 100),
          currency: params.currency || this.config.currency,
          description: params.description,
          metadata: params.metadata || {},
        },
        {
          stripeAccount: params.accountId,
        }
      );

      console.log('✅ Payout created:', payout.id);
      return payout;
    } catch (error) {
      console.error('Payout creation failed:', error);
      throw new Error('Failed to create payout');
    }
  }

  /**
   * List payouts for connected account
   */
  public async listPayouts(params: {
    accountId: string;
    limit?: number;
    status?: string;
  }): Promise<Stripe.Payout[]> {
    try {
      const payouts = await this.stripe.payouts.list(
        {
          limit: params.limit || 100,
          status: params.status as any,
        },
        {
          stripeAccount: params.accountId,
        }
      );
      return payouts.data;
    } catch (error) {
      console.error('Payouts listing failed:', error);
      throw new Error('Failed to list payouts');
    }
  }

  /**
   * List charges for connected account
   */
  public async listCharges(params: {
    accountId: string;
    limit?: number;
    created?: { gte?: number; lte?: number };
  }): Promise<Stripe.Charge[]> {
    try {
      const charges = await this.stripe.charges.list(
        {
          limit: params.limit || 100,
          created: params.created,
        },
        {
          stripeAccount: params.accountId,
        }
      );
      return charges.data;
    } catch (error) {
      console.error('Charges listing failed:', error);
      throw new Error('Failed to list charges');
    }
  }

  /**
   * List balance transactions for connected account
   */
  public async listBalanceTransactions(params: {
    accountId: string;
    limit?: number;
    type?: string;
    payout?: string;
  }): Promise<Stripe.BalanceTransaction[]> {
    try {
      const transactions = await this.stripe.balanceTransactions.list(
        {
          limit: params.limit || 100,
          type: params.type as any,
          payout: params.payout,
        },
        {
          stripeAccount: params.accountId,
        }
      );
      return transactions.data;
    } catch (error) {
      console.error('Balance transactions listing failed:', error);
      throw new Error('Failed to list balance transactions');
    }
  }

  /**
   * List disputes for connected account
   */
  public async listDisputes(params: {
    accountId: string;
    limit?: number;
  }): Promise<Stripe.Dispute[]> {
    try {
      const disputes = await this.stripe.disputes.list(
        {
          limit: params.limit || 100,
        },
        {
          stripeAccount: params.accountId,
        }
      );
      return disputes.data;
    } catch (error) {
      console.error('Disputes listing failed:', error);
      throw new Error('Failed to list disputes');
    }
  }

  /**
   * Get dispute details
   */
  public async getDispute(params: {
    accountId: string;
    disputeId: string;
  }): Promise<Stripe.Dispute> {
    try {
      const dispute = await this.stripe.disputes.retrieve(
        params.disputeId,
        {},
        {
          stripeAccount: params.accountId,
        }
      );
      return dispute;
    } catch (error) {
      console.error('Dispute retrieval failed:', error);
      throw new Error('Failed to retrieve dispute');
    }
  }

  /**
   * Update dispute evidence
   */
  public async updateDispute(params: {
    accountId: string;
    disputeId: string;
    evidence?: Stripe.DisputeUpdateParams.Evidence;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Dispute> {
    try {
      const dispute = await this.stripe.disputes.update(
        params.disputeId,
        {
          evidence: params.evidence,
          metadata: params.metadata,
        },
        {
          stripeAccount: params.accountId,
        }
      );
      console.log('✅ Dispute updated:', dispute.id);
      return dispute;
    } catch (error) {
      console.error('Dispute update failed:', error);
      throw new Error('Failed to update dispute');
    }
  }

  /**
   * Create subscription for connected account
   */
  public async createSubscription(params: {
    accountId: string;
    customerId: string;
    priceId: string;
    applicationFeePercent?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create(
        {
          customer: params.customerId,
          items: [{ price: params.priceId }],
          application_fee_percent: params.applicationFeePercent,
          metadata: params.metadata || {},
        },
        {
          stripeAccount: params.accountId,
        }
      );

      console.log('✅ Subscription created:', subscription.id);
      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * List subscriptions for connected account
   */
  public async listSubscriptions(params: {
    accountId: string;
    limit?: number;
    status?: string;
  }): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list(
        {
          limit: params.limit || 100,
          status: params.status as any,
        },
        {
          stripeAccount: params.accountId,
        }
      );
      return subscriptions.data;
    } catch (error) {
      console.error('Subscriptions listing failed:', error);
      throw new Error('Failed to list subscriptions');
    }
  }

  /**
   * Update payout schedule for connected account
   */
  public async updatePayoutSchedule(params: {
    accountId: string;
    interval: 'manual' | 'daily' | 'weekly' | 'monthly';
    weeklyAnchor?: string;
    monthlyAnchor?: number;
    delayDays?: number;
  }): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.update(params.accountId, {
        settings: {
          payouts: {
            schedule: {
              interval: params.interval,
              weekly_anchor: params.weeklyAnchor as any,
              monthly_anchor: params.monthlyAnchor,
              delay_days: params.delayDays || 2,
            },
          },
        },
      });
      console.log('✅ Payout schedule updated for:', account.id);
      return account;
    } catch (error) {
      console.error('Payout schedule update failed:', error);
      throw new Error('Failed to update payout schedule');
    }
  }

  /**
   * Create transfer to connected account (for separate charges and transfers pattern)
   */
  public async createTransfer(params: {
    amount: number;
    currency: string;
    destination: string;
    transferGroup?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        destination: params.destination,
        transfer_group: params.transferGroup,
        description: params.description,
        metadata: params.metadata || {},
      });

      console.log('✅ Transfer created:', transfer.id);
      return transfer;
    } catch (error) {
      console.error('Transfer creation failed:', error);
      throw new Error('Failed to create transfer');
    }
  }

  /**
   * Get platform application fees
   */
  public async listApplicationFees(params?: {
    limit?: number;
    charge?: string;
  }): Promise<Stripe.ApplicationFee[]> {
    try {
      const fees = await this.stripe.applicationFees.list({
        limit: params?.limit || 100,
        charge: params?.charge,
      });
      return fees.data;
    } catch (error) {
      console.error('Application fees listing failed:', error);
      throw new Error('Failed to list application fees');
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;
