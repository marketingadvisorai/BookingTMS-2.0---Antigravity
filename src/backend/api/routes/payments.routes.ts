/**
 * @file payments.routes.ts
 * @description Stripe Connect Payment Routes - Destination Charges Implementation
 * @module backend/api/routes
 * 
 * @purpose
 * Handles payment processing through Stripe Connect using destination charges.
 * This is the recommended approach for marketplaces where:
 * - Customers book through the platform
 * - Payment goes to platform first
 * - Funds are immediately transferred to connected account (venue)
 * - Platform can take an application fee
 * 
 * @reference https://docs.stripe.com/connect/destination-charges
 */

import express, { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { paymentService } from '../../services/payment.service';

const router = Router();

/**
 * Validation middleware
 */
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  return next();
};

// ============================================================================
// DESTINATION CHARGE ENDPOINTS
// ============================================================================

/**
 * POST /api/payments/create-booking-payment
 * Create a destination charge for a booking
 * 
 * @description
 * Creates a payment intent with destination charge to connected account.
 * - Charge created on platform account
 * - Funds immediately transferred to venue's connected account
 * - Platform can collect application fee
 * 
 * @body {
 *   amount: number;              // Total booking amount in dollars
 *   currency: string;            // Currency code (default: 'usd')
 *   connectedAccountId: string;  // Stripe connected account ID of venue
 *   applicationFeeAmount: number; // Platform fee in dollars (optional)
 *   customerId: string;          // Stripe customer ID (optional)
 *   bookingId: string;           // Internal booking reference
 *   venueId: string;             // Venue identifier
 *   customerEmail: string;       // Customer email
 *   description: string;         // Payment description
 *   metadata: object;            // Additional metadata
 * }
 * 
 * @returns {
 *   success: boolean;
 *   clientSecret: string;        // For confirming payment on frontend
 *   paymentIntentId: string;
 *   amount: number;
 *   applicationFee: number;
 * }
 */
router.post(
  '/create-booking-payment',
  [
    body('amount')
      .isNumeric()
      .withMessage('Amount is required')
      .custom((value) => value > 0)
      .withMessage('Amount must be greater than 0'),
    body('currency')
      .optional()
      .isString()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3-letter code'),
    body('connectedAccountId')
      .isString()
      .notEmpty()
      .withMessage('Connected account ID is required')
      .matches(/^acct_/)
      .withMessage('Invalid connected account ID format'),
    body('applicationFeeAmount')
      .optional()
      .isNumeric()
      .custom((value) => value >= 0)
      .withMessage('Application fee must be non-negative'),
    body('customerId')
      .optional()
      .isString(),
    body('bookingId')
      .isString()
      .notEmpty()
      .withMessage('Booking ID is required'),
    body('venueId')
      .isString()
      .notEmpty()
      .withMessage('Venue ID is required'),
    body('customerEmail')
      .isEmail()
      .withMessage('Valid customer email is required'),
    body('description')
      .isString()
      .notEmpty()
      .withMessage('Payment description is required'),
    body('metadata')
      .optional()
      .isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      console.log('[payments.routes] Creating booking payment:', {
        amount: req.body.amount,
        connectedAccountId: req.body.connectedAccountId,
        bookingId: req.body.bookingId,
      });

      const paymentIntent = await paymentService.createDestinationCharge(req.body);

      res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: req.body.amount,
        applicationFee: req.body.applicationFeeAmount || 0,
        connectedAccountId: req.body.connectedAccountId,
      });
    } catch (error: any) {
      console.error('[payments.routes] Create booking payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment',
        details: error.response?.data || null,
      });
    }
  }
);

/**
 * POST /api/payments/confirm-payment
 * Confirm a payment intent
 * 
 * @description
 * Confirms a payment intent after customer completes payment on frontend.
 * This is usually handled automatically by Stripe.js, but provided for manual confirmation.
 * 
 * @body {
 *   paymentIntentId: string;
 *   paymentMethodId: string; // Optional
 * }
 */
router.post(
  '/confirm-payment',
  [
    body('paymentIntentId')
      .isString()
      .notEmpty()
      .withMessage('Payment intent ID is required')
      .matches(/^pi_/)
      .withMessage('Invalid payment intent ID format'),
    body('paymentMethodId')
      .optional()
      .isString(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;

      const paymentIntent = await paymentService.confirmPayment(
        paymentIntentId,
        paymentMethodId
      );

      res.json({
        success: true,
        paymentIntent,
        status: paymentIntent.status,
      });
    } catch (error: any) {
      console.error('[payments.routes] Confirm payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to confirm payment',
      });
    }
  }
);

/**
 * GET /api/payments/:paymentIntentId
 * Get payment intent details
 * 
 * @param paymentIntentId - Stripe payment intent ID
 */
router.get(
  '/:paymentIntentId',
  [
    param('paymentIntentId')
      .isString()
      .notEmpty()
      .matches(/^pi_/)
      .withMessage('Invalid payment intent ID'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.params;

      const paymentIntent = await paymentService.getPaymentIntent(paymentIntentId);

      res.json({
        success: true,
        paymentIntent,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert cents to dollars
      });
    } catch (error: any) {
      console.error('[payments.routes] Get payment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve payment',
      });
    }
  }
);

/**
 * POST /api/payments/refund
 * Create a refund for a payment
 * 
 * @description
 * Creates a refund for a destination charge.
 * - Refunds debit the platform's balance
 * - Application fee is refunded by default
 * - Can do partial or full refunds
 * 
 * @body {
 *   paymentIntentId: string;
 *   amount: number;              // Refund amount in dollars (optional, full refund if not provided)
 *   reason: string;              // Reason for refund (optional)
 *   refundApplicationFee: boolean; // Whether to refund application fee (default: true)
 *   metadata: object;
 * }
 */
router.post(
  '/refund',
  [
    body('paymentIntentId')
      .isString()
      .notEmpty()
      .withMessage('Payment intent ID is required')
      .matches(/^pi_/)
      .withMessage('Invalid payment intent ID format'),
    body('amount')
      .optional()
      .isNumeric()
      .custom((value) => value > 0)
      .withMessage('Refund amount must be greater than 0'),
    body('reason')
      .optional()
      .isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
      .withMessage('Invalid refund reason'),
    body('refundApplicationFee')
      .optional()
      .isBoolean(),
    body('metadata')
      .optional()
      .isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const refund = await paymentService.createRefund(req.body);

      res.status(201).json({
        success: true,
        refund,
        refundId: refund.id,
        amount: refund.amount / 100, // Convert cents to dollars
        status: refund.status,
      });
    } catch (error: any) {
      console.error('[payments.routes] Create refund error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create refund',
      });
    }
  }
);

/**
 * GET /api/payments/booking/:bookingId
 * Get all payments for a booking
 * 
 * @param bookingId - Internal booking ID
 */
router.get(
  '/booking/:bookingId',
  [
    param('bookingId')
      .isString()
      .notEmpty()
      .withMessage('Booking ID is required'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;

      const payments = await paymentService.getPaymentsByBooking(bookingId);

      res.json({
        success: true,
        payments,
        count: payments.length,
      });
    } catch (error: any) {
      console.error('[payments.routes] Get booking payments error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve payments',
      });
    }
  }
);

/**
 * GET /api/payments/venue/:venueId
 * Get all payments for a venue
 * 
 * @param venueId - Venue identifier
 * @query limit - Maximum number of results (default: 100)
 * @query startingAfter - Pagination cursor
 */
router.get(
  '/venue/:venueId',
  [
    param('venueId')
      .isString()
      .notEmpty()
      .withMessage('Venue ID is required'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { venueId } = req.params;
      const { limit, startingAfter } = req.query;

      const payments = await paymentService.getPaymentsByVenue(venueId, {
        limit: limit ? parseInt(limit as string) : 100,
        startingAfter: startingAfter as string,
      });

      res.json({
        success: true,
        payments,
        count: payments.length,
      });
    } catch (error: any) {
      console.error('[payments.routes] Get venue payments error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve payments',
      });
    }
  }
);

// ============================================================================
// WEBHOOK ENDPOINT
// ============================================================================

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 * 
 * @description
 * Receives and processes Stripe webhook events for payment lifecycle.
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.succeeded
 * - charge.failed
 * - charge.refunded
 * - charge.dispute.created
 * - transfer.created
 * - transfer.failed
 * 
 * @security Webhook signature verification required
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        console.error('[payments.routes] Missing Stripe signature');
        return res.status(400).json({
          success: false,
          error: 'Missing Stripe signature',
        });
      }

      // Process webhook with signature verification
      const event = await paymentService.handleWebhook(req.body, signature);

      console.log('[payments.routes] Webhook processed:', {
        type: event.type,
        id: event.id,
      });

      return res.json({
        success: true,
        received: true,
        eventType: event.type,
      });
    } catch (error: any) {
      console.error('[payments.routes] Webhook error:', error);
      return res.status(400).json({
        success: false,
        error: error.message || 'Webhook processing failed',
      });
    }
  }
);

export default router;
