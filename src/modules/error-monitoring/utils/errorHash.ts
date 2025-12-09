/**
 * Error Hash Utility - Generate unique hashes for error deduplication
 * @module error-monitoring/utils/errorHash
 */

/**
 * Generate SHA-256 hash for error deduplication
 */
export async function generateErrorHash(
  message: string,
  stackTrace?: string,
  component?: string
): Promise<string> {
  // Create a normalized string for hashing
  const normalizedMessage = normalizeMessage(message);
  const normalizedStack = stackTrace ? normalizeStackTrace(stackTrace) : '';
  const hashInput = `${normalizedMessage}|${normalizedStack}|${component || ''}`;
  
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Normalize error message by removing dynamic values
 */
function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/\d+/g, 'N') // Replace numbers
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, 'UUID') // UUIDs
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'EMAIL') // Emails
    .replace(/https?:\/\/[^\s]+/g, 'URL') // URLs
    .trim();
}

/**
 * Normalize stack trace by removing line numbers and keeping structure
 */
function normalizeStackTrace(stackTrace: string): string {
  return stackTrace
    .split('\n')
    .slice(0, 5) // Only use first 5 lines
    .map(line => {
      // Remove line and column numbers
      return line.replace(/:\d+:\d+/g, ':N:N').trim();
    })
    .join('|');
}

/**
 * Synchronous hash for simple cases (less secure, but fast)
 */
export function generateSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
