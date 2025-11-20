/**
 * Application Error Classes
 * Enterprise-grade error handling
 * @module shared/errors
 */

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * Base Application Error
 * All custom errors extend this class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.category = category;
    this.severity = severity;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }

  /**
   * Get user-friendly message
   */
  getUserMessage(): string {
    // Override in subclasses for custom user messages
    return this.message;
  }
}

/**
 * Validation Error
 * Used for input validation failures
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>;

  constructor(
    message: string,
    fields: Record<string, string[]> = {},
    context?: Record<string, any>
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      true,
      context
    );
    
    this.fields = fields;
  }

  getUserMessage(): string {
    const fieldErrors = Object.entries(this.fields)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('; ');
    
    return fieldErrors || this.message;
  }
}

/**
 * Authentication Error
 * Used for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(
      message,
      'AUTHENTICATION_ERROR',
      401,
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.HIGH,
      true,
      context
    );
  }

  getUserMessage(): string {
    return 'Please log in to continue';
  }
}

/**
 * Authorization Error
 * Used for permission/access control failures
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: Record<string, any>) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      403,
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.HIGH,
      true,
      context
    );
  }

  getUserMessage(): string {
    return 'You do not have permission to perform this action';
  }
}

/**
 * Not Found Error
 * Used when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string,
    context?: Record<string, any>
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(
      message,
      'NOT_FOUND',
      404,
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.LOW,
      true,
      context
    );
  }

  getUserMessage(): string {
    return 'The requested resource was not found';
  }
}

/**
 * Conflict Error
 * Used for resource conflicts (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'CONFLICT_ERROR',
      409,
      ErrorCategory.CONFLICT,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
  }

  getUserMessage(): string {
    return 'A conflict occurred with the requested operation';
  }
}

/**
 * Business Logic Error
 * Used for business rule violations
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR', context?: Record<string, any>) {
    super(
      message,
      code,
      422,
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
  }
}

/**
 * External Service Error
 * Used for third-party service failures
 */
export class ExternalServiceError extends AppError {
  public readonly serviceName: string;

  constructor(
    serviceName: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(
      message,
      'EXTERNAL_SERVICE_ERROR',
      502,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      true,
      { ...context, serviceName }
    );
    
    this.serviceName = serviceName;
  }

  getUserMessage(): string {
    return 'An external service is temporarily unavailable. Please try again later';
  }
}

/**
 * Database Error
 * Used for database operation failures
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      ErrorCategory.DATABASE,
      ErrorSeverity.CRITICAL,
      true,
      context
    );
  }

  getUserMessage(): string {
    return 'A database error occurred. Please try again later';
  }
}

/**
 * Network Error
 * Used for network-related failures
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'NETWORK_ERROR',
      503,
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      true,
      context
    );
  }

  getUserMessage(): string {
    return 'Network error. Please check your connection and try again';
  }
}

/**
 * Rate Limit Error
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter?: number, context?: Record<string, any>) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      429,
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.LOW,
      true,
      { ...context, retryAfter }
    );
    
    this.retryAfter = retryAfter;
  }

  getUserMessage(): string {
    if (this.retryAfter) {
      return `Too many requests. Please try again in ${this.retryAfter} seconds`;
    }
    return 'Too many requests. Please try again later';
  }
}
