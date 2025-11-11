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
      apiVersion: '2024-06-20',
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
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;
