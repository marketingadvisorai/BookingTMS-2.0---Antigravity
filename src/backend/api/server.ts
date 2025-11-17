/**
 * Express API Server
 * Secure backend server with all API endpoints
 * @module backend/api
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { backendSecrets, getSafeConfig } from '../config/secrets.config';
import configRoutes from './routes/config.routes';
import stripeRoutes from './routes/stripe.routes';
import stripeConnectRoutes from './routes/stripe-connect.routes';
import stripeOAuthRoutes from './routes/stripe-oauth.routes';
import stripeConnectAccountsRoutes from './routes/stripe-connect-accounts.routes';
import paymentRoutes from './routes/payments.routes';

/**
 * Create and configure Express application
 */
export function createServer(): Express {
  const app = express();
  
  // Trust proxy for Render deployment
  app.set('trust proxy', 1);
  
  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  
  // CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (backendSecrets.security.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  
  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Compression
  app.use(compression());
  
  // Global Rate Limiting
  const limiter = rateLimit({
    windowMs: backendSecrets.rateLimit.windowMs,
    max: backendSecrets.rateLimit.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  
  // Request Logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
      );
    });
    
    next();
  });
  
  // Root Path - Welcome Message
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'BookingTMS API Server',
      version: '0.1.0',
      status: 'online',
      endpoints: {
        health: '/health',
        api: '/api',
        config: '/api/config',
        docs: '/api/docs',
      },
      documentation: 'Visit /api for full endpoint list',
      timestamp: new Date().toISOString(),
    });
  });
  
  // Health Check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: backendSecrets.nodeEnv,
    });
  });
  
  // API Info
  app.get('/api', (req: Request, res: Response) => {
    res.json({
      name: 'BookingTMS API',
      version: '0.1.0',
      endpoints: {
        config: '/api/config',
        stripe: '/api/stripe',
        stripeConnect: '/api/stripe-connect',
        payments: '/api/payments',
        auth: '/api/auth',
        notifications: '/api/notifications',
        ai: '/api/ai',
        bookings: '/api/bookings',
      },
      documentation: '/api/docs',
    });
  });
  
  // API Routes
  app.use('/api/config', configRoutes);
  app.use('/api/stripe', stripeRoutes);
  app.use('/api/stripe-connect', stripeConnectRoutes);
  app.use('/api/stripe-connect', stripeOAuthRoutes);
  app.use('/api/stripe-connect-accounts', stripeConnectAccountsRoutes);
  app.use('/api/payments', paymentRoutes);
  
  // Future routes (will be added)
  // app.use('/api/auth', authRoutes);
  // app.use('/api/payments', paymentRoutes);
  // app.use('/api/notifications', notificationRoutes);
  // app.use('/api/ai', aiRoutes);
  // app.use('/api/bookings', bookingRoutes);
  
  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Global Error Handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: backendSecrets.nodeEnv === 'development' 
        ? err.message 
        : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      ...(backendSecrets.nodeEnv === 'development' && { stack: err.stack }),
    });
  });
  
  return app;
}

/**
 * Start the server
 */
export function startServer(): void {
  const app = createServer();
  const port = backendSecrets.port;
  
  app.listen(port, () => {
    console.log('\n🚀 Backend API Server Started');
    console.log('================================');
    console.log(`Port: ${port}`);
    console.log(`Environment: ${backendSecrets.nodeEnv}`);
    console.log(`API URL: ${backendSecrets.apiBaseUrl}`);
    console.log('\nConfiguration:');
    console.log(JSON.stringify(getSafeConfig(), null, 2));
    console.log('\n================================\n');
  });
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
