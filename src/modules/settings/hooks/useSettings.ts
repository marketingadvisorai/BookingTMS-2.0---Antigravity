/**
 * Settings Module - Main Hook
 * @module settings/hooks/useSettings
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import {
  OrganizationSettings,
  NotificationPreferences,
  SettingsTab,
} from '../types';
import { settingsService } from '../services';

export interface UseSettingsOptions {
  organizationId?: string;
  autoFetch?: boolean;
}

export interface UseSettingsReturn {
  settings: OrganizationSettings | null;
  notifications: NotificationPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  
  // Actions
  updateSettings: (updates: Partial<OrganizationSettings>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationPreferences>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export function useSettings(options: UseSettingsOptions = {}): UseSettingsReturn {
  const { autoFetch = true } = options;
  const { currentUser } = useAuth();
  const organizationId = options.organizationId || currentUser?.organizationId;

  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  const mountedRef = useRef(true);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const [settingsData, notifData] = await Promise.all([
        settingsService.getSettings(organizationId),
        settingsService.getNotificationPreferences(organizationId, currentUser?.id),
      ]);

      if (mountedRef.current) {
        setSettings(settingsData);
        setNotifications(notifData);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [organizationId, currentUser?.id]);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<OrganizationSettings>) => {
      if (!organizationId) return;

      setSaving(true);
      try {
        const updated = await settingsService.updateSettings(organizationId, updates);
        setSettings(updated);
        toast.success('Settings saved successfully');
      } catch (err: any) {
        console.error('Error updating settings:', err);
        toast.error('Failed to save settings');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [organizationId]
  );

  // Update notifications
  const updateNotifications = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!notifications?.id) return;

      setSaving(true);
      try {
        const updated = await settingsService.updateNotificationPreferences(
          notifications.id,
          updates
        );
        setNotifications(updated);
        toast.success('Notification preferences saved');
      } catch (err: any) {
        console.error('Error updating notifications:', err);
        toast.error('Failed to save notification preferences');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [notifications?.id]
  );

  // Update password
  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setSaving(true);
      try {
        // First verify current password by re-authenticating
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: currentUser?.email || '',
          password: currentPassword,
        });

        if (signInError) {
          throw new Error('Current password is incorrect');
        }

        await settingsService.updatePassword(newPassword);
        toast.success('Password updated successfully');
      } catch (err: any) {
        console.error('Error updating password:', err);
        toast.error(err.message || 'Failed to update password');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [currentUser?.email]
  );

  // Real-time subscription
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase.channel('settings-changes');

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_settings' }, () => {
        if (mountedRef.current) fetchSettings();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_preferences' }, () => {
        if (mountedRef.current) fetchSettings();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [organizationId, fetchSettings]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch && organizationId) {
      fetchSettings();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, organizationId, fetchSettings]);

  return {
    settings,
    notifications,
    loading,
    saving,
    error,
    activeTab,
    setActiveTab,
    updateSettings,
    updateNotifications,
    updatePassword,
    refreshSettings: fetchSettings,
  };
}
