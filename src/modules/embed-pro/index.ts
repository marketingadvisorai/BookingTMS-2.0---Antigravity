/**
 * Embed Pro 2.0 - Module Entry Point
 * @module embed-pro
 * 
 * Standalone embedding management system for BookFlow.
 * 
 * This module provides:
 * - Admin dashboard for managing embed configurations
 * - Independent embed page for customer-facing widgets
 * - Complete booking widget with calendar, time slots, and checkout
 * 
 * @example
 * // Admin Dashboard
 * import { EmbedProDashboard, useEmbedConfigs } from '@/modules/embed-pro';
 * 
 * // Embed Page (customer-facing)
 * import { EmbedProPage } from '@/modules/embed-pro';
 */

// Types
export * from './types';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Admin Components
export * from './components';

// Customer-Facing Pages & Widgets (Embed Pro 2.0)
export * from './pages';
export * from './containers';
export * from './widgets';
export * from './widget-components';
