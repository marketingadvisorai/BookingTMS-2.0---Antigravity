/**
 * Guest/Customer Module
 * Enterprise-level multi-tenant customer management
 * Version: 2.0.0
 * 
 * Architecture:
 * - Multi-tenant: All data scoped by organization_id
 * - Real-time: Supabase subscriptions for live updates
 * - Modular: Clean separation of concerns
 * - Type-safe: Full TypeScript coverage
 * 
 * Usage:
 * import { useGuests, customerService } from '@/modules/guests';
 */

// Types
export * from './types';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Utilities
export * from './utils';

// Components
export * from './components';

// Pages
export { GuestsPage } from './pages';
