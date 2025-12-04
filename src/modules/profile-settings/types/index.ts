/**
 * Profile Settings Types
 * @module profile-settings/types
 */

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  timezone: string;
  language: string;
  avatar: string;
}

export interface NotificationSettings {
  emailBookings: boolean;
  emailReports: boolean;
  emailMarketing: boolean;
  pushBookings: boolean;
  pushStaff: boolean;
  smsBookings: boolean;
  smsReminders: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
}

export interface PreferenceSettings {
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

export type ProfileTab = 'personal' | 'security' | 'notifications' | 'preferences';
