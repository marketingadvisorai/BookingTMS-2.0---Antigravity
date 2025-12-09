/**
 * Settings Module - Main Hook
 * Uses React Query for caching and smooth loading
 * @module settings/hooks/useSettings
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { CACHE_TIMES } from '@/lib/cache';
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
  const queryClient = useQueryClient();
  const organizationId = options.organizationId || currentUser?.organizationId;

  // Local state
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  // Query keys
  const settingsKey = ['settings', 'organization', organizationId];
  const notificationsKey = ['settings', 'notifications', organizationId, currentUser?.id];

  // React Query for settings
  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: () => settingsService.getSettings(organizationId!),
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  });

  // React Query for notification preferences
  const notificationsQuery = useQuery({
    queryKey: notificationsKey,
    queryFn: () => settingsService.getNotificationPreferences(organizationId!, currentUser?.id),
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.MEDIUM,
  });

  // Derived state
  const settings = settingsQuery.data || null;
  const notifications = notificationsQuery.data || null;
  const loading = settingsQuery.isLoading || notificationsQuery.isLoading;
  const error = settingsQuery.error?.message || notificationsQuery.error?.message || null;

  // Refresh function
  const fetchSettings = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['settings'] });
  }, [queryClient]);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<OrganizationSettings>) => {
      if (!organizationId) return;

      setSaving(true);
      try {
        const updated = await settingsService.updateSettings(organizationId, updates);
        // Update cache
        queryClient.setQueryData(settingsKey, updated);
        toast.success('Settings saved successfully');
      } catch (err: any) {
        console.error('Error updating settings:', err);
        toast.error('Failed to save settings');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, queryClient, settingsKey]
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
        // Update cache
        queryClient.setQueryData(notificationsKey, updated);
        toast.success('Notification preferences saved');
      } catch (err: any) {
        console.error('Error updating notifications:', err);
        toast.error('Failed to save notification preferences');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [notifications?.id, queryClient, notificationsKey]
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

  // Real-time subscription for live updates
  useEffect(() => {
    if (!organizationId) return;

    const channel = supabase.channel('settings-changes');

    const handleChange = () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organization_settings' }, handleChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_preferences' }, handleChange)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [organizationId, queryClient]);

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
