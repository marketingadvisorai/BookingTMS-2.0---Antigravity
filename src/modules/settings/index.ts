/**
 * Settings Module
 * Organization settings and notification preferences
 * 
 * @module settings
 * @version 1.0.0
 */

// Types
export * from './types';

// Utils
export * from './utils/mappers';

// Services
export { settingsService } from './services';

// Hooks
export { useSettings } from './hooks/useSettings';
export type { UseSettingsOptions, UseSettingsReturn } from './hooks/useSettings';

// Components
export {
  SettingsTabNav,
  BusinessInfoTab,
  NotificationsTab,
  SecurityTab,
  AppearanceTab,
  StripeConnectTab,
} from './components';
export type { StripeAccountStatus, StripeConnectTabProps } from './components';

// Pages
export { SettingsPage } from './pages/SettingsPage';
