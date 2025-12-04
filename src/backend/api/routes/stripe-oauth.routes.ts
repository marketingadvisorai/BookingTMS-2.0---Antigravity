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
import supabase from '../../config/supabase';

const router = Router();
const stripe = new Stripe(backendSecrets.stripe.secretKey, {
  apiVersion: '2023-10-16' as any,
  typescript: true,
});

// Use an untyped alias for Supabase mutations to avoid tight coupling
// with generated Database types (organizations table schema has evolved).
const adminSupabase: any = supabase;

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

      // Persist connection to Supabase organizations table when organization_id is provided
      if (organization_id) {
        try {
          const { error: orgUpdateError } = await adminSupabase
            .from('organizations')
            .update({
              stripe_account_id: response.stripe_user_id,
              stripe_onboarding_status: 'complete',
              updated_at: new Date().toISOString(),
            })
            .eq('id', organization_id);

          if (orgUpdateError) {
            console.error('[stripe-oauth] Failed to update organization with Stripe account ID:', orgUpdateError.message || orgUpdateError);
          } else {
            console.log('[stripe-oauth] Organization updated with Stripe account ID:', {
              organization_id,
              stripe_account_id: response.stripe_user_id,
            });
          }
        } catch (dbErr: any) {
          console.error('[stripe-oauth] Unexpected error updating organization with Stripe account ID:', dbErr);
        }
      }

      return res.json({
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

      return res.status(500).json({
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
    body('organization_id')
      .optional()
      .isString(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { stripe_user_id, user_id, organization_id } = req.body;

      console.log('[stripe-oauth] Deauthorizing account:', {
        stripe_user_id,
        user_id,
      });

      // Deauthorize the connected account
      await stripe.oauth.deauthorize({
        client_id: process.env.STRIPE_CONNECT_CLIENT_ID || '',
        stripe_user_id,
      } as any);

      // Update your database to remove the connection from the organization when provided
      if (organization_id) {
        try {
          const { error: orgUpdateError } = await adminSupabase
            .from('organizations')
            .update({
              stripe_account_id: null,
              stripe_onboarding_status: 'not_started',
              updated_at: new Date().toISOString(),
            })
            .eq('id', organization_id);

          if (orgUpdateError) {
            console.error('[stripe-oauth] Failed to clear Stripe account ID from organization:', orgUpdateError.message || orgUpdateError);
          } else {
            console.log('[stripe-oauth] Organization Stripe account disconnected:', {
              organization_id,
            });
          }
        } catch (dbErr: any) {
          console.error('[stripe-oauth] Unexpected error clearing organization Stripe account:', dbErr);
        }
      }

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
