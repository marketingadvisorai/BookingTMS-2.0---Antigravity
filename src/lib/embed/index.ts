/**
 * Embed Module Exports
 * 
 * Modern embedding system for BookingTMS widgets.
 * Supports high-traffic scenarios with:
 * - PostMessage API for secure cross-origin communication
 * - ResizeObserver for dynamic height adjustment
 * - Lazy loading for performance
 * - Multiple platform support (HTML, React, WordPress)
 */

export { 
  EmbedManager,
  generateEmbedCode,
  generateReactCode,
  generateEmbedUrl,
  generateWordPressInstructions,
} from './EmbedManager';

export type {
  EmbedConfig,
  BookingResult,
  EmbedError,
  EmbedMessage,
} from './EmbedManager';
