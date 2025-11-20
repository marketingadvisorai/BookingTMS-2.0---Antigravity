/**
 * Error Handler
 * Centralized error handling and logging
 * @module shared/errors
 */

import { AppError, ErrorSeverity, ErrorCategory } from './AppError';

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  logErrors: boolean;
  logToConsole: boolean;
  logToService: boolean;
  showStackTrace: boolean;
  notifyUser: boolean;
}

/**
 * Error log entry
 */
interface ErrorLogEntry {
  timestamp: Date;
  error: AppError | Error;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

/**
 * Error Handler Class
 * Handles error logging, reporting, and user notification
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLogs: ErrorLogEntry[] = [];
  private errorListeners: Array<(error: AppError | Error) => void> = [];

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = {
      logErrors: true,
      logToConsole: process.env.NODE_ENV === 'development',
      logToService: process.env.NODE_ENV === 'production',
      showStackTrace: process.env.NODE_ENV === 'development',
      notifyUser: true,
      ...config,
    };
  }

  /**
   * Handle an error
   */
  handle(error: Error | AppError, context?: Record<string, any>): void {
    const appError = this.normalizeError(error);
    
    // Log the error
    if (this.config.logErrors) {
      this.logError(appError, context);
    }
    
    // Log to console in development
    if (this.config.logToConsole) {
      this.logToConsole(appError);
    }
    
    // Send to logging service in production
    if (this.config.logToService) {
      this.logToService(appError, context);
    }
    
    // Notify error listeners
    this.notifyListeners(appError);
    
    // Notify user if configured
    if (this.config.notifyUser) {
      this.notifyUser(appError);
    }
  }

  /**
   * Handle async errors
   */
  async handleAsync(
    promise: Promise<any>,
    context?: Record<string, any>
  ): Promise<any> {
    try {
      return await promise;
    } catch (error) {
      this.handle(error as Error, context);
      throw error;
    }
  }

  /**
   * Wrap a function with error handling
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    context?: Record<string, any>
  ): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error: Error) => {
            this.handle(error, context);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        this.handle(error as Error, context);
        throw error;
      }
    }) as T;
  }

  /**
   * Add error listener
   */
  addListener(listener: (error: AppError | Error) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeListener(listener: (error: AppError | Error) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Get error logs
   */
  getErrorLogs(limit?: number): ErrorLogEntry[] {
    if (limit) {
      return this.errorLogs.slice(-limit);
    }
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const stats = {
      total: this.errorLogs.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };
    
    this.errorLogs.forEach((log) => {
      if (log.error instanceof AppError) {
        const category = log.error.category;
        const severity = log.error.severity;
        
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
      }
    });
    
    return stats;
  }

  /**
   * Normalize error to AppError
   */
  private normalizeError(error: Error | AppError): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    // Convert standard errors to AppError
    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      500,
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM,
      false,
      { originalError: error.name, stack: error.stack }
    );
  }

  /**
   * Log error to internal log
   */
  private logError(error: AppError, context?: Record<string, any>): void {
    const logEntry: ErrorLogEntry = {
      timestamp: new Date(),
      error,
      context,
      userId: context?.userId,
      sessionId: context?.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
    
    this.errorLogs.push(logEntry);
    
    // Keep only last 1000 errors in memory
    if (this.errorLogs.length > 1000) {
      this.errorLogs = this.errorLogs.slice(-1000);
    }
  }

  /**
   * Log error to console
   */
  private logToConsole(error: AppError): void {
    const style = this.getConsoleStyle(error.severity);
    
    console.group(`%c${error.name}: ${error.message}`, style);
    console.log('Code:', error.code);
    console.log('Category:', error.category);
    console.log('Severity:', error.severity);
    console.log('Status Code:', error.statusCode);
    
    if (error.context) {
      console.log('Context:', error.context);
    }
    
    if (this.config.showStackTrace && error.stack) {
      console.log('Stack:', error.stack);
    }
    
    console.groupEnd();
  }

  /**
   * Log error to external service
   */
  private logToService(error: AppError, context?: Record<string, any>): void {
    // TODO: Implement logging to external service (e.g., Sentry, LogRocket)
    // This is a placeholder for production error logging
    
    if (error.severity === ErrorSeverity.CRITICAL) {
      // Send critical errors immediately
      this.sendToErrorService(error, context);
    }
  }

  /**
   * Send error to external error tracking service
   */
  private sendToErrorService(error: AppError, context?: Record<string, any>): void {
    // Placeholder for external service integration
    // Example: Sentry.captureException(error, { extra: context });
  }

  /**
   * Notify error listeners
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Notify user of error
   */
  private notifyUser(error: AppError): void {
    // This should be implemented by the UI layer
    // Typically would show a toast notification or modal
    
    if (typeof window !== 'undefined' && (window as any).showErrorNotification) {
      (window as any).showErrorNotification({
        message: error.getUserMessage(),
        severity: error.severity,
        code: error.code,
      });
    }
  }

  /**
   * Get console style based on severity
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    const styles = {
      [ErrorSeverity.LOW]: 'color: #fbbf24; font-weight: bold;',
      [ErrorSeverity.MEDIUM]: 'color: #f97316; font-weight: bold;',
      [ErrorSeverity.HIGH]: 'color: #ef4444; font-weight: bold;',
      [ErrorSeverity.CRITICAL]: 'color: #dc2626; font-weight: bold; font-size: 14px;',
    };
    
    return styles[severity] || styles[ErrorSeverity.MEDIUM];
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Global error handler for unhandled promise rejections
 */
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason, {
      type: 'unhandledRejection',
      promise: event.promise,
    });
  });
}
