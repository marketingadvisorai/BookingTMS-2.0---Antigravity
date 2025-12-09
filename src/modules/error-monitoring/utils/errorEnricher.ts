/**
 * Error Enricher - Add context to captured errors
 * @module error-monitoring/utils/errorEnricher
 */

import type { BrowserInfo } from '../types';

/**
 * Get browser information
 */
export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  
  return {
    name: detectBrowser(ua),
    version: detectBrowserVersion(ua),
    os: detectOS(ua),
    osVersion: detectOSVersion(ua),
    deviceType: detectDeviceType(ua),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
  };
}

/**
 * Detect browser name from user agent
 */
function detectBrowser(ua: string): string {
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

/**
 * Detect browser version
 */
function detectBrowserVersion(ua: string): string {
  const matches = ua.match(/(Firefox|Chrome|Safari|Edg|Opera)[\/\s](\d+)/);
  return matches ? matches[2] : 'Unknown';
}

/**
 * Detect operating system
 */
function detectOS(ua: string): string {
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
  return 'Unknown';
}

/**
 * Detect OS version
 */
function detectOSVersion(ua: string): string {
  const winMatch = ua.match(/Windows NT (\d+\.\d+)/);
  if (winMatch) return winMatch[1];
  
  const macMatch = ua.match(/Mac OS X (\d+[._]\d+)/);
  if (macMatch) return macMatch[1].replace('_', '.');
  
  return 'Unknown';
}

/**
 * Detect device type
 */
function detectDeviceType(ua: string): string {
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Get current page context
 */
export function getPageContext(): Record<string, unknown> {
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    referrer: document.referrer,
    title: document.title,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sanitize error metadata (remove sensitive data)
 */
export function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credit'];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(s => lowerKey.includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
