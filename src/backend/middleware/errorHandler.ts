/**
 * Error Handler Middleware
 * 
 * Global error handling for Express/Hono applications
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 400);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict error
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
  });

  // Known application errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      fields: err.fields,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      error: 'Forbidden',
      message: err.message,
    });
  }

  if (err instanceof ConflictError) {
    return res.status(409).json({
      error: 'Conflict',
      message: err.message,
    });
  }

  // Database errors (PostgreSQL)
  if ('code' in err) {
    const pgError = err as any;

    // Unique constraint violation
    if (pgError.code === '23505') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Resource already exists',
      });
    }

    // Foreign key violation
    if (pgError.code === '23503') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Referenced resource does not exist',
      });
    }

    // Not null violation
    if (pgError.code === '23502') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Required field is missing',
      });
    }
  }

  // Supabase errors
  if ('details' in err) {
    const supabaseError = err as any;
    return res.status(400).json({
      error: 'Database Error',
      message: supabaseError.message,
      details: supabaseError.details,
    });
  }

  // Stripe errors
  if (err.name === 'StripeError') {
    const stripeError = err as any;
    return res.status(stripeError.statusCode || 400).json({
      error: 'Payment Error',
      message: stripeError.message,
    });
  }

  // Default error (500 Internal Server Error)
  const statusCode = (err as AppError).statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(statusCode).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
};
