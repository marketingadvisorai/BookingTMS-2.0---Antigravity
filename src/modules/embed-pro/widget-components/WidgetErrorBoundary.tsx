/**
 * Embed Pro 2.0 - Widget Error Boundary
 * @module embed-pro/widget-components/WidgetErrorBoundary
 * 
 * React Error Boundary to catch and handle widget crashes gracefully.
 * Shows a user-friendly error message instead of breaking the page.
 * Includes retry functionality and error reporting.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// =====================================================
// PROPS & STATE INTERFACES
// =====================================================

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  primaryColor?: string;
  showRetry?: boolean;
  showHomeLink?: boolean;
  homeUrl?: string;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// =====================================================
// ERROR BOUNDARY COMPONENT
// =====================================================

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  static defaultProps = {
    primaryColor: '#2563eb',
    showRetry: true,
    showHomeLink: false,
  };

  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error for debugging
    console.error('[WidgetErrorBoundary] Caught error:', error);
    console.error('[WidgetErrorBoundary] Component stack:', errorInfo.componentStack);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to analytics/monitoring (future enhancement)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: ErrorInfo): void {
    // Future: Send to error monitoring service (Sentry, LogRocket, etc.)
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
      
      // Log for now, can be sent to monitoring service
      console.log('[WidgetErrorBoundary] Error report:', errorReport);
    } catch {
      // Silently fail if reporting fails
    }
  }

  handleRetry = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { 
      children, 
      fallbackUI, 
      primaryColor, 
      showRetry, 
      showHomeLink,
      homeUrl 
    } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallbackUI) {
        return fallbackUI;
      }

      // Default error UI
      return (
        <div 
          className="p-6 sm:p-8 text-center rounded-2xl bg-white border border-gray-200 shadow-sm max-w-md mx-auto"
          role="alert"
          aria-live="assertive"
        >
          {/* Error Icon */}
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: '#fef2f2' }}
          >
            <AlertTriangle className="w-8 h-8 text-red-500" aria-hidden="true" />
          </div>

          {/* Error Message */}
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            We encountered an unexpected error while loading the booking widget.
            {retryCount > 0 && retryCount < 3 && ' Please try again.'}
            {retryCount >= 3 && ' If the problem persists, please contact support.'}
          </p>

          {/* Error Details (collapsed) */}
          {error && process.env.NODE_ENV === 'development' && (
            <details className="text-left mb-4 p-3 bg-gray-50 rounded-lg text-xs">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="overflow-auto text-red-600 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetry && retryCount < 3 && (
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px]"
                style={{ 
                  backgroundColor: primaryColor,
                  ['--tw-ring-color' as any]: primaryColor 
                }}
                aria-label="Try loading the widget again"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Try Again
              </button>
            )}

            {showHomeLink && homeUrl && (
              <a
                href={homeUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 min-h-[44px]"
                aria-label="Return to home page"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go Home
              </a>
            )}
          </div>

          {/* Support Info */}
          {retryCount >= 3 && (
            <p className="mt-4 text-xs text-gray-400">
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
          )}
        </div>
      );
    }

    return children;
  }
}

export default WidgetErrorBoundary;
