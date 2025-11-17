/**
 * @file stripe-oauth.routes.ts
 * @description Stripe Connect OAuth Routes for linking existing accounts
 * @module backend/api/routes
 * 
 * @purpose
 * Handles OAuth flow for connecting existing Stripe accounts to the platform.
 * This allows users who already have Stripe accounts to link them via OAuth
 * instead of creating new accounts.
 * 
 * @reference https://docs.stripe.com/connect/oauth-reference
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { backendSecrets } from '../../config/secrets.config';

const router = Router();
const stripe = new Stripe(backendSecrets.stripe.secretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

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

// ============================================================================
// OAUTH TOKEN EXCHANGE
// ============================================================================

/**
 * POST /api/stripe-connect/oauth/token
 * Exchange OAuth authorization code for access token
 * 
 * @description
 * After user authorizes via OAuth, Stripe redirects back with an authorization code.
 * This endpoint exchanges that code for an access token and connects the account.
 * 
 * @body {
 *   code: string;              // Authorization code from Stripe
 *   user_id: string;           // Internal user ID
 *   organization_id: string;   // Organization ID (optional)
 *   email: string;             // User email
 *   name: string;              // User/business name
 * }
 * 
 * @returns {
 *   success: boolean;
 *   stripe_user_id: string;    // Connected Stripe account ID
 *   access_token: string;      // OAuth access token (store securely)
 *   refresh_token: string;     // OAuth refresh token (store securely)
 *   livemode: boolean;         // Whether account is in live mode
 * }
 */
router.post(
  '/oauth/token',
  [
    body('code')
      .isString()
      .notEmpty()
      .withMessage('Authorization code is required'),
    body('user_id')
      .isString()
      .notEmpty()
      .withMessage('User ID is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),
    body('name')
      .isString()
      .notEmpty()
      .withMessage('Name is required'),
    body('organization_id')
      .optional()
      .isString(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { code, user_id, organization_id, email, name } = req.body;

      console.log('[stripe-oauth] Exchanging authorization code:', {
        user_id,
        organization_id,
        email,
      });

      // Exchange authorization code for access token
      const response = await stripe.oauth.token({
        grant_type: 'authorization_code',
        code,
      });

      console.log('[stripe-oauth] OAuth token exchange successful:', {
        stripe_user_id: response.stripe_user_id,
        livemode: response.livemode,
      });

      // TODO: Store the following in your database:
      // - response.stripe_user_id (connected account ID)
      // - response.access_token (for making API calls on behalf of account)
      // - response.refresh_token (for refreshing access token)
      // - response.livemode (whether account is in live mode)
      // - Link to user_id and organization_id

      // Example database update (implement based on your schema):
      /*
      await supabase
        .from('users')
        .update({
          stripe_account_id: response.stripe_user_id,
          stripe_access_token: response.access_token, // Encrypt this!
          stripe_refresh_token: response.refresh_token, // Encrypt this!
          stripe_livemode: response.livemode,
        })
        .eq('id', user_id);
      */

      res.json({
        success: true,
        stripe_user_id: response.stripe_user_id,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        livemode: response.livemode,
        scope: response.scope,
      });

    } catch (error: any) {
      console.error('[stripe-oauth] Token exchange error:', error);
      
      // Handle specific OAuth errors
      if (error.type === 'StripeInvalidGrantError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid authorization code',
          details: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Failed to exchange OAuth code',
      });
    }
  }
);

// ============================================================================
// OAUTH DEAUTHORIZATION
// ============================================================================

/**
 * POST /api/stripe-connect/oauth/deauthorize
 * Deauthorize a connected account (disconnect)
 * 
 * @description
 * Revokes access to a connected account. This should be called when:
 * - User wants to disconnect their Stripe account
 * - Account is being deleted
 * - Security breach or suspicious activity
 * 
 * @body {
 *   stripe_user_id: string;    // Connected account ID to deauthorize
 *   user_id: string;           // Internal user ID (for logging)
 * }
 */
router.post(
  '/oauth/deauthorize',
  [
    body('stripe_user_id')
      .isString()
      .notEmpty()
      .withMessage('Stripe account ID is required')
      .matches(/^acct_/)
      .withMessage('Invalid Stripe account ID format'),
    body('user_id')
      .isString()
      .notEmpty()
      .withMessage('User ID is required'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { stripe_user_id, user_id } = req.body;

      console.log('[stripe-oauth] Deauthorizing account:', {
        stripe_user_id,
        user_id,
      });

      // Deauthorize the connected account
      await stripe.oauth.deauthorize({
        stripe_user_id,
      });

      // TODO: Update your database to remove the connection
      /*
      await supabase
        .from('users')
        .update({
          stripe_account_id: null,
          stripe_access_token: null,
          stripe_refresh_token: null,
        })
        .eq('id', user_id);
      */

      console.log('[stripe-oauth] Account deauthorized successfully');

      res.json({
        success: true,
        message: 'Account disconnected successfully',
      });

    } catch (error: any) {
      console.error('[stripe-oauth] Deauthorization error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to deauthorize account',
      });
    }
  }
);

export default router;
