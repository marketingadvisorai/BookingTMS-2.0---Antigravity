/**
 * Stripe Connect API Routes
 * Endpoints for managing Stripe Connect accounts
 * @module backend/api/routes
 */

import { Router, Request, Response } from 'express';
import { stripeService } from '../../services/stripe.service';
import { body, param, query, validationResult } from 'express-validator';

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
  next();
};

// ==================== CONNECTED ACCOUNT MANAGEMENT ====================

/**
 * POST /api/stripe-connect/accounts
 * Create a new connected account
 */
router.post(
  '/accounts',
  [
    body('type').isIn(['express', 'custom', 'standard']).withMessage('Invalid account type'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('country').isString().notEmpty().withMessage('Country is required'),
    body('businessType').optional().isIn(['individual', 'company']),
    body('capabilities').optional().isArray(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const account = await stripeService.createConnectedAccount(req.body);

      res.status(201).json({
        success: true,
        account,
        accountId: account.id,
      });
    } catch (error: any) {
      console.error('Create connected account error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create connected account',
      });
    }
  }
);

/**
 * GET /api/stripe-connect/accounts
 * List all connected accounts
 */
router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;

    const accounts = await stripeService.listConnectedAccounts({
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      accounts,
      count: accounts.length,
    });
  } catch (error: any) {
    console.error('List connected accounts error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list connected accounts',
    });
  }
});

/**
 * GET /api/stripe-connect/accounts/:accountId
 * Get connected account details
 */
router.get(
  '/accounts/:accountId',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const account = await stripeService.getConnectedAccount(accountId);

      res.json({
        success: true,
        account,
      });
    } catch (error: any) {
      console.error('Get connected account error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve connected account',
      });
    }
  }
);

/**
 * PUT /api/stripe-connect/accounts/:accountId
 * Update connected account
 */
router.put(
  '/accounts/:accountId',
  [
    param('accountId').isString().notEmpty(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const account = await stripeService.updateConnectedAccount(accountId, req.body);

      res.json({
        success: true,
        account,
      });
    } catch (error: any) {
      console.error('Update connected account error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update connected account',
      });
    }
  }
);

/**
 * DELETE /api/stripe-connect/accounts/:accountId
 * Delete/deactivate connected account
 */
router.delete(
  '/accounts/:accountId',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const account = await stripeService.deleteConnectedAccount(accountId);

      res.json({
        success: true,
        message: 'Connected account deleted successfully',
        account,
      });
    } catch (error: any) {
      console.error('Delete connected account error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete connected account',
      });
    }
  }
);

// ==================== ONBOARDING ====================

/**
 * POST /api/stripe-connect/account-links
 * Generate account link for onboarding
 */
router.post(
  '/account-links',
  [
    body('accountId').isString().notEmpty().withMessage('Account ID is required'),
    body('refreshUrl').isURL().withMessage('Valid refresh URL is required'),
    body('returnUrl').isURL().withMessage('Valid return URL is required'),
    body('type').optional().isIn(['account_onboarding', 'account_update']),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const accountLink = await stripeService.createAccountLink(req.body);

      res.json({
        success: true,
        url: accountLink.url,
        accountLink,
      });
    } catch (error: any) {
      console.error('Create account link error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create account link',
      });
    }
  }
);

/**
 * POST /api/stripe-connect/account-sessions
 * Create account session for embedded components
 */
router.post(
  '/account-sessions',
  [body('accountId').isString().notEmpty().withMessage('Account ID is required')],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.body;
      const accountSession = await stripeService.createAccountSession(accountId);

      res.json({
        success: true,
        clientSecret: accountSession.client_secret,
        accountSession,
      });
    } catch (error: any) {
      console.error('Create account session error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create account session',
      });
    }
  }
);

// ==================== BALANCES & PAYOUTS ====================

/**
 * GET /api/stripe-connect/accounts/:accountId/balance
 * Get connected account balance
 */
router.get(
  '/accounts/:accountId/balance',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const balance = await stripeService.getConnectedAccountBalance(accountId);

      res.json({
        success: true,
        balance,
      });
    } catch (error: any) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve balance',
      });
    }
  }
);

/**
 * POST /api/stripe-connect/accounts/:accountId/payouts
 * Create manual payout
 */
router.post(
  '/accounts/:accountId/payouts',
  [
    param('accountId').isString().notEmpty(),
    body('amount').isNumeric().withMessage('Amount is required'),
    body('currency').optional().isString(),
    body('description').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { amount, currency, description, metadata } = req.body;

      const payout = await stripeService.createPayout({
        accountId,
        amount: parseFloat(amount),
        currency,
        description,
        metadata,
      });

      res.status(201).json({
        success: true,
        payout,
      });
    } catch (error: any) {
      console.error('Create payout error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payout',
      });
    }
  }
);

/**
 * GET /api/stripe-connect/accounts/:accountId/payouts
 * List payouts for connected account
 */
router.get(
  '/accounts/:accountId/payouts',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { limit, status } = req.query;

      const payouts = await stripeService.listPayouts({
        accountId,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
      });

      res.json({
        success: true,
        payouts,
        count: payouts.length,
      });
    } catch (error: any) {
      console.error('List payouts error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list payouts',
      });
    }
  }
);

/**
 * PUT /api/stripe-connect/accounts/:accountId/payout-schedule
 * Update payout schedule
 */
router.put(
  '/accounts/:accountId/payout-schedule',
  [
    param('accountId').isString().notEmpty(),
    body('interval').isIn(['manual', 'daily', 'weekly', 'monthly']).withMessage('Invalid interval'),
    body('weeklyAnchor').optional().isString(),
    body('monthlyAnchor').optional().isInt(),
    body('delayDays').optional().isInt(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const account = await stripeService.updatePayoutSchedule({
        accountId,
        ...req.body,
      });

      res.json({
        success: true,
        account,
      });
    } catch (error: any) {
      console.error('Update payout schedule error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update payout schedule',
      });
    }
  }
);

// ==================== TRANSACTIONS ====================

/**
 * GET /api/stripe-connect/accounts/:accountId/charges
 * List charges for connected account
 */
router.get(
  '/accounts/:accountId/charges',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { limit } = req.query;

      const charges = await stripeService.listCharges({
        accountId,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        charges,
        count: charges.length,
      });
    } catch (error: any) {
      console.error('List charges error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list charges',
      });
    }
  }
);

/**
 * GET /api/stripe-connect/accounts/:accountId/balance-transactions
 * List balance transactions
 */
router.get(
  '/accounts/:accountId/balance-transactions',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { limit, type, payout } = req.query;

      const transactions = await stripeService.listBalanceTransactions({
        accountId,
        limit: limit ? parseInt(limit as string) : undefined,
        type: type as string,
        payout: payout as string,
      });

      res.json({
        success: true,
        transactions,
        count: transactions.length,
      });
    } catch (error: any) {
      console.error('List balance transactions error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list balance transactions',
      });
    }
  }
);

// ==================== DISPUTES ====================

/**
 * GET /api/stripe-connect/accounts/:accountId/disputes
 * List disputes for connected account
 */
router.get(
  '/accounts/:accountId/disputes',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { limit, status } = req.query;

      const disputes = await stripeService.listDisputes({
        accountId,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        disputes,
        count: disputes.length,
      });
    } catch (error: any) {
      console.error('List disputes error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list disputes',
      });
    }
  }
);

/**
 * GET /api/stripe-connect/accounts/:accountId/disputes/:disputeId
 * Get dispute details
 */
router.get(
  '/accounts/:accountId/disputes/:disputeId',
  [
    param('accountId').isString().notEmpty(),
    param('disputeId').isString().notEmpty(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId, disputeId } = req.params;

      const dispute = await stripeService.getDispute({
        accountId,
        disputeId,
      });

      res.json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Get dispute error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve dispute',
      });
    }
  }
);

/**
 * PUT /api/stripe-connect/accounts/:accountId/disputes/:disputeId
 * Update dispute evidence
 */
router.put(
  '/accounts/:accountId/disputes/:disputeId',
  [
    param('accountId').isString().notEmpty(),
    param('disputeId').isString().notEmpty(),
    body('evidence').optional().isObject(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId, disputeId } = req.params;
      const { evidence, metadata } = req.body;

      const dispute = await stripeService.updateDispute({
        accountId,
        disputeId,
        evidence,
        metadata,
      });

      res.json({
        success: true,
        dispute,
      });
    } catch (error: any) {
      console.error('Update dispute error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update dispute',
      });
    }
  }
);

// ==================== SUBSCRIPTIONS ====================

/**
 * GET /api/stripe-connect/accounts/:accountId/subscriptions
 * List subscriptions for connected account
 */
router.get(
  '/accounts/:accountId/subscriptions',
  [param('accountId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { limit, status } = req.query;

      const subscriptions = await stripeService.listSubscriptions({
        accountId,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
      });

      res.json({
        success: true,
        subscriptions,
        count: subscriptions.length,
      });
    } catch (error: any) {
      console.error('List subscriptions error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list subscriptions',
      });
    }
  }
);

/**
 * POST /api/stripe-connect/accounts/:accountId/subscriptions
 * Create subscription for connected account
 */
router.post(
  '/accounts/:accountId/subscriptions',
  [
    param('accountId').isString().notEmpty(),
    body('customerId').isString().notEmpty().withMessage('Customer ID is required'),
    body('priceId').isString().notEmpty().withMessage('Price ID is required'),
    body('applicationFeePercent').optional().isNumeric(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      const { customerId, priceId, applicationFeePercent, metadata } = req.body;

      const subscription = await stripeService.createSubscription({
        accountId,
        customerId,
        priceId,
        applicationFeePercent: applicationFeePercent ? parseFloat(applicationFeePercent) : undefined,
        metadata,
      });

      res.status(201).json({
        success: true,
        subscription,
      });
    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create subscription',
      });
    }
  }
);

// ==================== TRANSFERS & FEES ====================

/**
 * POST /api/stripe-connect/transfers
 * Create transfer to connected account
 */
router.post(
  '/transfers',
  [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('currency').isString().notEmpty().withMessage('Currency is required'),
    body('destination').isString().notEmpty().withMessage('Destination account ID is required'),
    body('transferGroup').optional().isString(),
    body('description').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const transfer = await stripeService.createTransfer({
        amount: parseFloat(req.body.amount),
        currency: req.body.currency,
        destination: req.body.destination,
        transferGroup: req.body.transferGroup,
        description: req.body.description,
        metadata: req.body.metadata,
      });

      res.status(201).json({
        success: true,
        transfer,
      });
    } catch (error: any) {
      console.error('Create transfer error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create transfer',
      });
    }
  }
);

/**
 * GET /api/stripe-connect/application-fees
 * List platform application fees
 */
router.get('/application-fees', async (req: Request, res: Response) => {
  try {
    const { limit, charge } = req.query;

    const fees = await stripeService.listApplicationFees({
      limit: limit ? parseInt(limit as string) : undefined,
      charge: charge as string,
    });

    res.json({
      success: true,
      fees,
      count: fees.length,
    });
  } catch (error: any) {
    console.error('List application fees error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list application fees',
    });
  }
});

export default router;
