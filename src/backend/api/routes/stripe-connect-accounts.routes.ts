import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { backendSecrets } from '../../config/secrets.config';

const router = Router();
const stripe = new Stripe(backendSecrets.stripe.secretKey, {
  apiVersion: '2023-10-16' as any,
  typescript: true,
});

/**
 * GET /api/stripe-connect-accounts/list
 * Fetches all connected accounts with their balances, pending payouts, and disputes
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    // Fetch all connected accounts
    const accounts = await stripe.accounts.list({ limit: 100 });

    // Fetch detailed information for each account
    const accountsWithDetails = await Promise.all(
      accounts.data.map(async (account) => {
        try {
          // Fetch balance for this account
          const balance = await stripe.balance.retrieve({
            stripeAccount: account.id,
          });

          // Fetch pending payouts
          const payouts = await stripe.payouts.list(
            { limit: 10, status: 'pending' },
            { stripeAccount: account.id }
          );

          // Calculate pending payout amount
          const pendingPayoutAmount = payouts.data.reduce(
            (sum, payout) => sum + payout.amount,
            0
          );

          // Fetch disputes
          const disputes = await stripe.disputes.list(
            { limit: 100 },
            { stripeAccount: account.id }
          );

          // Count open disputes
          const openDisputesCount = disputes.data.filter(
            (dispute) => dispute.status !== 'won' && dispute.status !== 'lost'
          ).length;

          // Get last payout
          const lastPayouts = await stripe.payouts.list(
            { limit: 1, status: 'paid' },
            { stripeAccount: account.id }
          );

          const lastPayout = lastPayouts.data[0];

          return {
            id: account.id,
            email: account.email,
            business_profile: account.business_profile,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            balance: {
              available: balance.available[0]?.amount || 0,
              pending: balance.pending[0]?.amount || 0,
              currency: balance.available[0]?.currency || 'usd',
            },
            pending_payouts: {
              amount: pendingPayoutAmount,
              count: payouts.data.length,
            },
            disputes: {
              count: openDisputesCount,
              total: disputes.data.length,
            },
            last_payout: lastPayout
              ? {
                amount: lastPayout.amount,
                arrival_date: lastPayout.arrival_date,
                created: lastPayout.created,
              }
              : null,
            created: account.created,
            type: account.type,
          };
        } catch (error: any) {
          console.error(`Error fetching details for account ${account.id}:`, error.message);
          // Return basic account info if detailed fetch fails
          return {
            id: account.id,
            email: account.email,
            business_profile: account.business_profile,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            balance: { available: 0, pending: 0, currency: 'usd' },
            pending_payouts: { amount: 0, count: 0 },
            disputes: { count: 0, total: 0 },
            last_payout: null,
            created: account.created,
            type: account.type,
            error: error.message,
          };
        }
      })
    );

    res.json({
      success: true,
      accounts: accountsWithDetails,
      total: accountsWithDetails.length,
    });
  } catch (error: any) {
    console.error('Error fetching connected accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch connected accounts',
    });
  }
});

/**
 * GET /api/stripe-connect-accounts/transactions
 * Fetches recent transaction activity across all connected accounts
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    // Fetch all connected accounts
    const accounts = await stripe.accounts.list({ limit: 100 });

    // Fetch recent transactions for each account
    const allTransactions: any[] = [];

    for (const account of accounts.data) {
      try {
        // Fetch recent payouts
        const payouts = await stripe.payouts.list(
          { limit: 5 },
          { stripeAccount: account.id }
        );

        payouts.data.forEach((payout) => {
          allTransactions.push({
            id: payout.id,
            type: 'payout',
            account_id: account.id,
            account_name: account.business_profile?.name || account.email || 'Unknown',
            amount: payout.amount,
            currency: payout.currency,
            status: payout.status,
            created: payout.created,
            arrival_date: payout.arrival_date,
          });
        });

        // Fetch recent disputes
        const disputes = await stripe.disputes.list(
          { limit: 5 },
          { stripeAccount: account.id }
        );

        disputes.data.forEach((dispute) => {
          allTransactions.push({
            id: dispute.id,
            type: 'dispute',
            account_id: account.id,
            account_name: account.business_profile?.name || account.email || 'Unknown',
            amount: dispute.amount,
            currency: dispute.currency,
            status: dispute.status,
            reason: dispute.reason,
            created: dispute.created,
          });
        });
      } catch (error: any) {
        console.error(`Error fetching transactions for account ${account.id}:`, error.message);
      }
    }

    // Sort by created date (most recent first)
    allTransactions.sort((a, b) => b.created - a.created);

    // Limit results
    const limitedTransactions = allTransactions.slice(0, limit);

    res.json({
      success: true,
      transactions: limitedTransactions,
      total: limitedTransactions.length,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch transactions',
    });
  }
});

/**
 * POST /api/stripe-connect-accounts/:accountId/payout
 * Trigger a manual payout for a connected account
 */
router.post('/:accountId/payout', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required',
      });
    }

    // Create a payout
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount), // Amount in cents
        currency,
        method: 'standard',
      },
      { stripeAccount: accountId }
    );

    res.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrival_date: payout.arrival_date,
      },
    });
  } catch (error: any) {
    console.error('Error creating payout:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payout',
    });
  }
});

/**
 * GET /api/stripe-connect-accounts/:accountId/details
 * Get detailed information for a specific connected account
 */
router.get('/:accountId/details', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;

    // Fetch account details
    const account = await stripe.accounts.retrieve(accountId);

    // Fetch balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId,
    });

    // Fetch recent payouts
    const payouts = await stripe.payouts.list(
      { limit: 10 },
      { stripeAccount: accountId }
    );

    // Fetch disputes
    const disputes = await stripe.disputes.list(
      { limit: 10 },
      { stripeAccount: accountId }
    );

    res.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        business_profile: account.business_profile,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        requirements: account.requirements,
        settings: account.settings,
        type: account.type,
        created: account.created,
      },
      balance: {
        available: balance.available,
        pending: balance.pending,
      },
      recent_payouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        arrival_date: p.arrival_date,
        created: p.created,
      })),
      disputes: disputes.data.map((d) => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        reason: d.reason,
        created: d.created,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching account details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch account details',
    });
  }
});

export default router;
