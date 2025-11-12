/**
 * Stripe API Routes
 * Secure endpoints for Stripe operations
 * @module backend/api/routes
 */

import { Router, Request, Response } from 'express';
import { stripeService } from '../../services/stripe.service';
import { body, param, validationResult } from 'express-validator';

const router = Router();

/**
 * Validation middleware
 */
const validate = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/stripe/products
 * Create a new Stripe product
 */
router.post(
  '/products',
  [
    body('name').isString().notEmpty().withMessage('Product name is required'),
    body('description').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { name, description, metadata } = req.body;

      const product = await stripeService.createProduct({
        name,
        description,
        metadata,
      });

      res.status(201).json({
        success: true,
        productId: product.id,
        product,
      });
    } catch (error: any) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create product',
      });
    }
  }
);

/**
 * POST /api/stripe/prices
 * Create a new Stripe price for a product
 */
router.post(
  '/prices',
  [
    body('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { productId, amount, currency, metadata } = req.body;

      const price = await stripeService.createPrice({
        productId,
        amount: parseFloat(amount),
        currency,
        metadata,
      });

      res.status(201).json({
        success: true,
        priceId: price.id,
        price,
      });
    } catch (error: any) {
      console.error('Create price error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create price',
      });
    }
  }
);

/**
 * PUT /api/stripe/products/:productId
 * Update a Stripe product
 */
router.put(
  '/products/:productId',
  [
    param('productId').isString().notEmpty(),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { name, description, metadata } = req.body;

      const product = await stripeService.updateProduct(productId, {
        name,
        description,
        metadata,
      });

      res.json({
        success: true,
        product,
      });
    } catch (error: any) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update product',
      });
    }
  }
);

/**
 * DELETE /api/stripe/products/:productId
 * Archive a Stripe product
 */
router.delete(
  '/products/:productId',
  [param('productId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const product = await stripeService.archiveProduct(productId);

      res.json({
        success: true,
        message: 'Product archived successfully',
        product,
      });
    } catch (error: any) {
      console.error('Archive product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to archive product',
      });
    }
  }
);

/**
 * GET /api/stripe/products/:productId
 * Get a Stripe product by ID
 */
router.get(
  '/products/:productId',
  [param('productId').isString().notEmpty()],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const product = await stripeService.getProduct(productId);

      res.json({
        success: true,
        product,
      });
    } catch (error: any) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve product',
      });
    }
  }
);

/**
 * GET /api/stripe/products
 * List all Stripe products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { active, limit } = req.query;

    const products = await stripeService.listProducts({
      active: active === 'true',
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error: any) {
    console.error('List products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list products',
    });
  }
});

/**
 * POST /api/stripe/payment-intents
 * Create a payment intent
 */
router.post(
  '/payment-intents',
  [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('currency').optional().isString(),
    body('customerId').optional().isString(),
    body('description').optional().isString(),
    body('metadata').optional().isObject(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { amount, currency, customerId, description, metadata } = req.body;

      const paymentIntent = await stripeService.createPaymentIntent({
        amount: parseFloat(amount),
        currency,
        customerId,
        description,
        metadata,
      });

      res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntent,
      });
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment intent',
      });
    }
  }
);

/**
 * GET /api/stripe/config
 * Get public Stripe configuration
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = stripeService.getPublicConfig();
    res.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get configuration',
    });
  }
});

export default router;
