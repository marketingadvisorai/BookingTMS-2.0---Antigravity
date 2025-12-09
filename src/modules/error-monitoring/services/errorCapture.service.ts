/**
 * Error Capture Service - Global error capture and processing
 * @module error-monitoring/services/errorCapture
 */

import type { ErrorCaptureInput, ErrorType, Severity } from '../types';
import { detectErrorType, ERROR_CATEGORIES } from '../constants';
import { generateErrorHash } from '../utils/errorHash';
import { getBrowserInfo, getPageContext, sanitizeMetadata } from '../utils/errorEnricher';
import { errorStoreService } from './errorStore.service';

// Rate limiting
const ERROR_RATE_LIMIT = 100; // Max errors per minute
const errorQueue: number[] = [];

class ErrorCaptureService {
  private initialized = false;
  private userId?: string;
  private organizationId?: string;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize global error handlers
   */
  initialize(userId?: string, organizationId?: string): void {
    if (this.initialized) return;
    
    this.userId = userId;
    this.organizationId = organizationId;
    
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        errorType: 'javascript',
        message: String(message),
        stackTrace: error?.stack,
        filePath: source,
        lineNumber: lineno,
        columnNumber: colno,
      });
      return false; // Let error propagate
    };

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        errorType: 'javascript',
        message: event.reason?.message || String(event.reason),
        stackTrace: event.reason?.stack,
      });
    });

    // Network error interceptor
    this.setupFetchInterceptor();
    
    this.initialized = true;
    console.log('[ErrorCapture] Initialized');
  }

  /**
   * Update user context
   */
  setContext(userId?: string, organizationId?: string): void {
    this.userId = userId;
    this.organizationId = organizationId;
  }

  /**
   * Capture an error
   */
  async captureError(input: ErrorCaptureInput): Promise<void> {
    // Rate limiting check
    if (!this.checkRateLimit()) {
      console.warn('[ErrorCapture] Rate limit exceeded');
      return;
    }

    try {
      const errorType = input.errorType || detectErrorType(input.message);
      const severity = this.determineSeverity(errorType, input.message);
      
      const errorHash = await generateErrorHash(
        input.message,
        input.stackTrace,
        input.component
      );

      const browserInfo = getBrowserInfo();
      const pageContext = getPageContext();

      await errorStoreService.storeError({
        errorHash,
        errorType,
        severity,
        message: input.message,
        stackTrace: input.stackTrace,
        component: input.component,
        filePath: input.filePath,
        lineNumber: input.lineNumber,
        columnNumber: input.columnNumber,
        url: pageContext.url as string,
        userAgent: navigator.userAgent,
        browser: browserInfo.name,
        os: browserInfo.os,
        deviceType: browserInfo.deviceType,
        userId: this.userId,
        organizationId: this.organizationId,
        sessionId: this.sessionId,
        metadata: sanitizeMetadata({
          ...input.metadata,
          pageContext,
          browserInfo,
        }),
      });
    } catch (error) {
      console.error('[ErrorCapture] Failed to capture error:', error);
    }
  }

  /**
   * Capture API error
   */
  captureApiError(endpoint: string, status: number, message: string): void {
    this.captureError({
      errorType: 'api',
      message: `API Error: ${endpoint} - ${status} - ${message}`,
      metadata: { endpoint, status },
    });
  }

  /**
   * Setup fetch interceptor for network errors
   */
  private setupFetchInterceptor(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          this.captureApiError(
            args[0]?.toString() || 'unknown',
            response.status,
            response.statusText
          );
        }
        return response;
      } catch (error) {
        this.captureError({
          errorType: 'network',
          message: error instanceof Error ? error.message : 'Network error',
          metadata: { url: args[0]?.toString() },
        });
        throw error;
      }
    };
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old entries
    while (errorQueue.length > 0 && errorQueue[0] < oneMinuteAgo) {
      errorQueue.shift();
    }
    
    if (errorQueue.length >= ERROR_RATE_LIMIT) return false;
    
    errorQueue.push(now);
    return true;
  }

  private determineSeverity(errorType: ErrorType, message: string): Severity {
    const category = ERROR_CATEGORIES[errorType];
    if (message.toLowerCase().includes('critical')) return 'critical';
    return category?.defaultSeverity || 'error';
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

export const errorCaptureService = new ErrorCaptureService();
