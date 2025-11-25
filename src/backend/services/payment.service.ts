/**
 * @file payment.service.ts
 * @description Stripe Connect Payment Service - Destination Charges
 * @module backend/services
 * 
 * @purpose
 * Handles all payment operations for Stripe Connect destination charges.
 * Implements the marketplace payment flow where:
 * 1. Customer pays through platform
 * 2. Payment is charged to platform account
 * 3. Funds are immediately transferred to connected account (venue)
 * 4. Platform collects application fee
 * 
 * @reference
 * - https://docs.stripe.com/connect/destination-charges
 * - https://docs.stripe.com/connect/charges
 */

import Stripe from 'stripe';
import { backendSecrets } from '../config/secrets.config';

/**
 * Destination charge creation parameters
 */
export interface CreateDestinationChargeParams {
  amount: number;                    // Total amount in dollars
  currency?: string;                 // Currency code (default: 'usd')
  connectedAccountId: string;        // Stripe connected account ID
  applicationFeeAmount?: number;     // Platform fee in dollars
  customerId?: string;               // Stripe customer ID (optional)
  bookingId: string;                 // Internal booking reference
  venueId: string;                   // Venue identifier
  customerEmail: string;             // Customer email
  description: string;               // Payment description
  metadata?: Record<string, string>; // Additional metadata
}

/**
 * Refund creation parameters
 */
export interface CreateRefundParams {
  paymentIntentId: string;
  amount?: number;                   // Refund amount in dollars (optional, full refund if not provided)
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  refundApplicationFee?: boolean;    // Whether to refund application fee (default: true)
  metadata?: Record<string, string>;
}

/**
 * Payment Service Class
 * Manages Stripe Connect destination charges
 */
class PaymentService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    // Initialize Stripe with secret key
    this.stripe = new Stripe(backendSecrets.stripe.secretKey, {
      apiVersion: '2023-10-16' as any,
      typescript: true,
    });

    // Get webhook secret from environment or secrets
    this.webhookSecret = backendSecrets.stripe.webhookSecret;

    console.log('[PaymentService] Initialized');
    console.log('[PaymentService] Webhook secret configured:', !!this.webhookSecret);
  }

  /**
   * Create a destination charge for a booking
   * 
   * @param params - Destination charge parameters
   * @returns Stripe PaymentIntent
   * 
   * @description
   * Creates a payment intent with destination charge:
   * 1. Charge created on platform account
   * 2. Funds automatically transferred to connected account
   * 3. Platform collects application fee if specified
   * 
   * @example
   * const payment = await paymentService.createDestinationCharge({
   *   amount: 100,
   *   connectedAccountId: 'acct_123',
   *   applicationFeeAmount: 10,
   *   bookingId: 'booking_123',
   *   venueId: 'venue_123',
   *   customerEmail: 'customer@example.com',
   *   description: 'Escape Room Booking',
   * });
   */
  public async createDestinationCharge(
    params: CreateDestinationChargeParams
  ): Promise<Stripe.PaymentIntent> {
    try {
      console.log('[PaymentService] Creating destination charge:', {
        amount: params.amount,
        connectedAccountId: params.connectedAccountId,
        applicationFee: params.applicationFeeAmount,
        bookingId: params.bookingId,
      });

      // Convert amounts to cents
      const amountInCents = Math.round(params.amount * 100);
      const applicationFeeInCents = params.applicationFeeAmount
        ? Math.round(params.applicationFeeAmount * 100)
        : 0;

      // Validate amounts
      if (amountInCents <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (applicationFeeInCents < 0) {
        throw new Error('Application fee cannot be negative');
      }

      if (applicationFeeInCents >= amountInCents) {
        throw new Error('Application fee cannot be greater than or equal to total amount');
      }

      // Validate connected account ID format
      if (!params.connectedAccountId.startsWith('acct_')) {
        throw new Error('Invalid connected account ID format');
      }

      // Prepare payment intent parameters
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        // Amount charged to customer
        amount: amountInCents,
        currency: params.currency || 'usd',

        // Customer information
        receipt_email: params.customerEmail,
        description: params.description,

        // Destination charge parameters
        transfer_data: {
          // Connected account to receive funds
          destination: params.connectedAccountId,
        },

        // Metadata for tracking
        metadata: {
          bookingId: params.bookingId,
          venueId: params.venueId,
          customerEmail: params.customerEmail,
          ...params.metadata,
        },

        // Enable automatic payment methods
        automatic_payment_methods: {
          enabled: true,
        },
      };

      // Add customer if provided
      if (params.customerId) {
        paymentIntentParams.customer = params.customerId;
      }

      // Add application fee if specified
      if (applicationFeeInCents > 0) {
        paymentIntentParams.application_fee_amount = applicationFeeInCents;
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentParams);

      console.log('[PaymentService] Destination charge created:', {
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        applicationFee: applicationFeeInCents,
        destination: params.connectedAccountId,
        status: paymentIntent.status,
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('[PaymentService] Create destination charge error:', error);

      // Provide more detailed error messages
      if (error.type === 'StripeInvalidRequestError') {
        throw new Error(`Stripe error: ${error.message}`);
      }

      throw new Error(error.message || 'Failed to create destination charge');
    }
  }

  /**
   * Confirm a payment intent
   * 
   * @param paymentIntentId - Payment intent ID
   * @param paymentMethodId - Payment method ID (optional)
   * @returns Confirmed payment intent
   */
  public async confirmPayment(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      console.log('[PaymentService] Confirming payment:', paymentIntentId);

      const confirmParams: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      console.log('[PaymentService] Payment confirmed:', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });

      return paymentIntent;
    } catch (error: any) {
      console.error('[PaymentService] Confirm payment error:', error);
      throw new Error(error.message || 'Failed to confirm payment');
    }
  }

  /**
   * Get payment intent details
   * 
   * @param paymentIntentId - Payment intent ID
   * @returns Payment intent
   */
  public async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error: any) {
      console.error('[PaymentService] Get payment intent error:', error);
      throw new Error(error.message || 'Failed to retrieve payment intent');
    }
  }

  /**
   * Create a refund
   * 
   * @param params - Refund parameters
   * @returns Stripe Refund
   * 
   * @description
   * Creates a refund for a destination charge:
   * - Refunds debit the platform's balance
   * - Application fee is refunded by default
   * - Can do partial or full refunds
   */
  public async createRefund(params: CreateRefundParams): Promise<Stripe.Refund> {
    try {
      console.log('[PaymentService] Creating refund:', {
        paymentIntentId: params.paymentIntentId,
        amount: params.amount,
      });

      // Get the payment intent to find the charge
      const paymentIntent = await this.stripe.paymentIntents.retrieve(params.paymentIntentId);

      if (!paymentIntent.latest_charge) {
        throw new Error('No charge found for this payment intent');
      }

      const chargeId = typeof paymentIntent.latest_charge === 'string'
        ? paymentIntent.latest_charge
        : paymentIntent.latest_charge.id;

      // Prepare refund parameters
      const refundParams: Stripe.RefundCreateParams = {
        charge: chargeId,
      };

      // Add amount if specified (partial refund)
      if (params.amount !== undefined) {
        refundParams.amount = Math.round(params.amount * 100); // Convert to cents
      }

      // Add reason if specified
      if (params.reason) {
        refundParams.reason = params.reason;
      }

      // Refund application fee by default
      if (params.refundApplicationFee !== false) {
        refundParams.refund_application_fee = true;
      }

      // Add metadata
      if (params.metadata) {
        refundParams.metadata = params.metadata;
      }

      // Create refund
      const refund = await this.stripe.refunds.create(refundParams);

      console.log('[PaymentService] Refund created:', {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
      });

      return refund;
    } catch (error: any) {
      console.error('[PaymentService] Create refund error:', error);
      throw new Error(error.message || 'Failed to create refund');
    }
  }

  /**
   * Get payments by booking ID
   * 
   * @param bookingId - Booking identifier
   * @returns Array of payment intents
   */
  public async getPaymentsByBooking(bookingId: string): Promise<Stripe.PaymentIntent[]> {
    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        limit: 100,
      });

      // Filter by booking ID in metadata
      const bookingPayments = paymentIntents.data.filter(
        (pi) => pi.metadata.bookingId === bookingId
      );

      return bookingPayments;
    } catch (error: any) {
      console.error('[PaymentService] Get payments by booking error:', error);
      throw new Error(error.message || 'Failed to retrieve payments');
    }
  }

  /**
   * Get payments by venue ID
   * 
   * @param venueId - Venue identifier
   * @param options - Pagination options
   * @returns Array of payment intents
   */
  public async getPaymentsByVenue(
    venueId: string,
    options?: {
      limit?: number;
      startingAfter?: string;
    }
  ): Promise<Stripe.PaymentIntent[]> {
    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        limit: options?.limit || 100,
        starting_after: options?.startingAfter,
      });

      // Filter by venue ID in metadata
      const venuePayments = paymentIntents.data.filter(
        (pi) => pi.metadata.venueId === venueId
      );

      return venuePayments;
    } catch (error: any) {
      console.error('[PaymentService] Get payments by venue error:', error);
      throw new Error(error.message || 'Failed to retrieve payments');
    }
  }

  /**
   * Handle Stripe webhook events
   * 
   * @param payload - Raw request body
   * @param signature - Stripe signature header
   * @returns Stripe event
   * 
   * @description
   * Verifies and processes Stripe webhook events.
   * Handles payment lifecycle events:
   * - payment_intent.succeeded
   * - payment_intent.payment_failed
   * - charge.succeeded
   * - charge.failed
   * - charge.refunded
   * - charge.dispute.created
   * - transfer.created
   * - transfer.failed
   */
  public async handleWebhook(payload: Buffer, signature: string): Promise<Stripe.Event> {
    try {
      // Verify webhook signature
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      console.log('[PaymentService] Webhook received:', {
        type: event.type,
        id: event.id,
      });

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.succeeded':
          await this.handleChargeSucceeded(event.data.object as Stripe.Charge);
          break;

        case 'charge.failed':
          await this.handleChargeFailed(event.data.object as Stripe.Charge);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        case 'transfer.created':
          await this.handleTransferCreated(event.data.object as Stripe.Transfer);
          break;

        default:
          console.log(`[PaymentService] Unhandled event type: ${event.type}`);
      }

      return event;
    } catch (error: any) {
      console.error('[PaymentService] Webhook error:', error);
      throw new Error(error.message || 'Webhook processing failed');
    }
  }

  // ============================================================================
  // WEBHOOK EVENT HANDLERS
  // ============================================================================

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('[PaymentService] Payment succeeded:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      bookingId: paymentIntent.metadata.bookingId,
    });

    // TODO: Update booking status in database
    // TODO: Send confirmation email to customer
    // TODO: Notify venue of new booking
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('[PaymentService] Payment failed:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      bookingId: paymentIntent.metadata.bookingId,
    });

    // TODO: Update booking status in database
    // TODO: Send failure notification to customer
  }

  /**
   * Handle successful charge
   */
  private async handleChargeSucceeded(charge: Stripe.Charge): Promise<void> {
    console.log('[PaymentService] Charge succeeded:', {
      chargeId: charge.id,
      amount: charge.amount,
    });

    // TODO: Log charge success
  }

  /**
   * Handle failed charge
   */
  private async handleChargeFailed(charge: Stripe.Charge): Promise<void> {
    console.log('[PaymentService] Charge failed:', {
      chargeId: charge.id,
      amount: charge.amount,
    });

    // TODO: Log charge failure
    // TODO: Alert admin
  }

  /**
   * Handle refunded charge
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    console.log('[PaymentService] Charge refunded:', {
      chargeId: charge.id,
      amountRefunded: charge.amount_refunded,
    });

    // TODO: Update booking status
    // TODO: Notify customer and venue
  }

  /**
   * Handle dispute created
   */
  private async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    console.log('[PaymentService] Dispute created:', {
      disputeId: dispute.id,
      amount: dispute.amount,
      reason: dispute.reason,
    });

    // TODO: Alert admin
    // TODO: Gather evidence for dispute
  }

  /**
   * Handle transfer created
   */
  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    console.log('[PaymentService] Transfer created:', {
      transferId: transfer.id,
      amount: transfer.amount,
      destination: transfer.destination,
    });

    // TODO: Log transfer
  }

  /**
   * Handle transfer failed
   */
  private async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    console.log('[PaymentService] Transfer failed:', {
      transferId: transfer.id,
      amount: transfer.amount,
    });

    // TODO: Alert admin
    // TODO: Retry transfer or refund customer
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
