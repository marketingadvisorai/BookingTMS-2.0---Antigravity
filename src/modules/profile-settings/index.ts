/**
 * Profile Settings Module
 * @module profile-settings
 */

// Components
export {
  PersonalInfoTab,
  SecurityTab,
  NotificationsTab,
  PreferencesTab,
} from './components';

// Hooks
export { useProfileSettings } from './hooks/useProfileSettings';

// Types
export type {
  ProfileData,
  NotificationSettings,
  SecuritySettings,
  PreferenceSettings,
  ProfileTab,
} from './types';
