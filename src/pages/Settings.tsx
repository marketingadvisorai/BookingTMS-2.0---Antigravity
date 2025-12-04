/**
 * Settings Page - Re-export from modular module
 * @deprecated Use the modular SettingsPage from '@/modules/settings' instead
 *
 * This file is kept for backward compatibility with existing imports.
 * The actual implementation is in /src/modules/settings/pages/SettingsPage.tsx
 */

export { SettingsPage as Settings } from '../modules/settings';

// Default export for compatibility
export { SettingsPage as default } from '../modules/settings';
