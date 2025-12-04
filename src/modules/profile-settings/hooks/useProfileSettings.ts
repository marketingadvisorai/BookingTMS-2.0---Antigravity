/**
 * Profile Settings Hook
 * Manages profile data loading and saving
 * @module profile-settings/hooks/useProfileSettings
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import type {
  ProfileData,
  NotificationSettings,
  SecuritySettings,
  PreferenceSettings,
} from '../types';

const DEFAULT_PROFILE: ProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  timezone: 'America/Los_Angeles',
  language: 'en',
  avatar: '',
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailBookings: true,
  emailReports: true,
  emailMarketing: false,
  pushBookings: true,
  pushStaff: true,
  smsBookings: false,
  smsReminders: true,
};

const DEFAULT_SECURITY: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: '30',
  loginAlerts: true,
};

const DEFAULT_PREFERENCES: PreferenceSettings = {
  dateFormat: 'mm/dd/yyyy',
  timeFormat: '12',
  currency: 'usd',
};

export function useProfileSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileData>(DEFAULT_PROFILE);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [security, setSecurity] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [preferences, setPreferences] = useState<PreferenceSettings>(DEFAULT_PREFERENCES);

  // Load user profile
  const loadUserProfile = async () => {
    if (!currentUser) return;

    try {
      setProfileLoading(true);

      const { data: profile, error } = await (supabase
        .from('user_profiles') as any)
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const { data: { user } } = await supabase.auth.getUser();

      if (profile) {
        setProfileData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: user?.email || '',
          phone: profile.phone || '',
          company: profile.company || '',
          address: profile.metadata?.address || '',
          city: profile.metadata?.city || '',
          state: profile.metadata?.state || '',
          zip: profile.metadata?.zip || '',
          country: profile.metadata?.country || 'United States',
          timezone: profile.metadata?.timezone || 'America/Los_Angeles',
          language: profile.metadata?.language || 'en',
          avatar: profile.metadata?.avatar || '',
        });

        if (profile.metadata?.notifications) {
          setNotifications(profile.metadata.notifications);
        }
        if (profile.metadata?.security) {
          setSecurity(profile.metadata.security);
        }
        if (profile.metadata?.preferences) {
          setPreferences({
            dateFormat: profile.metadata.preferences.dateFormat || 'mm/dd/yyyy',
            timeFormat: profile.metadata.preferences.timeFormat || '12',
            currency: profile.metadata.preferences.currency || 'usd',
          });
        }
      } else {
        setProfileData(prev => ({ ...prev, email: user?.email || '' }));
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Save profile
  const saveProfile = async () => {
    if (!currentUser) return false;

    try {
      setLoading(true);

      const metadata = {
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip: profileData.zip,
        country: profileData.country,
        timezone: profileData.timezone,
        language: profileData.language,
        avatar: profileData.avatar,
        notifications,
        security,
        preferences,
      };

      const { error } = await (supabase.from('user_profiles') as any).upsert({
        id: currentUser.id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        company: profileData.company,
        metadata,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update email if changed
      if (profileData.email !== currentUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });
        if (emailError) throw emailError;
        toast.info('Verification email sent to new address');
      }

      toast.success('Profile saved successfully');
      await loadUserProfile();
      return true;
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save notifications
  const saveNotifications = async () => {
    if (!currentUser) return false;

    try {
      setLoading(true);

      const { data: currentProfile } = await (supabase.from('user_profiles') as any)
        .select('metadata')
        .eq('id', currentUser.id)
        .single();

      const metadata = { ...(currentProfile?.metadata || {}), notifications };

      const { error } = await (supabase.from('user_profiles') as any)
        .update({ metadata, updated_at: new Date().toISOString() })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Notification preferences saved');
      return true;
    } catch (error: any) {
      console.error('Error saving notifications:', error);
      toast.error(error.message || 'Failed to save notifications');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save security settings
  const saveSecurity = async () => {
    if (!currentUser) return false;

    try {
      setLoading(true);

      const { data: currentProfile } = await (supabase.from('user_profiles') as any)
        .select('metadata')
        .eq('id', currentUser.id)
        .single();

      const metadata = { ...(currentProfile?.metadata || {}), security };

      const { error } = await (supabase.from('user_profiles') as any)
        .update({ metadata, updated_at: new Date().toISOString() })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Security settings saved');
      return true;
    } catch (error: any) {
      console.error('Error saving security:', error);
      toast.error(error.message || 'Failed to save security');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    if (!currentUser) return false;

    try {
      setLoading(true);

      const { data: currentProfile } = await (supabase.from('user_profiles') as any)
        .select('metadata')
        .eq('id', currentUser.id)
        .single();

      const metadata = {
        ...(currentProfile?.metadata || {}),
        timezone: profileData.timezone,
        language: profileData.language,
        preferences,
      };

      const { error } = await (supabase.from('user_profiles') as any)
        .update({ metadata, updated_at: new Date().toISOString() })
        .eq('id', currentUser.id);

      if (error) throw error;

      toast.success('Preferences saved');
      return true;
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (newPassword: string, confirmPassword: string) => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  return {
    loading,
    profileLoading,
    profileData,
    setProfileData,
    notifications,
    setNotifications,
    security,
    setSecurity,
    preferences,
    setPreferences,
    saveProfile,
    saveNotifications,
    saveSecurity,
    savePreferences,
    changePassword,
    loadUserProfile,
  };
}

export default useProfileSettings;
