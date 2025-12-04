/**
 * Settings Service
 * CRUD operations for organization settings
 * @module settings/services/settings.service
 */

import { supabase } from '@/lib/supabase/client';
import {
  OrganizationSettings,
  DBOrganizationSettings,
  NotificationPreferences,
  DBNotificationPreferences,
} from '../types';
import {
  mapDBSettingsToUI,
  mapUISettingsToDBUpdate,
  mapDBNotifToUI,
  mapUINotifToDBUpdate,
} from '../utils/mappers';

class SettingsService {
  /**
   * Get organization settings (auto-creates if not exists)
   */
  async getSettings(organizationId: string): Promise<OrganizationSettings> {
    const { data, error } = await (supabase.rpc as any)('get_or_create_org_settings', {
      p_organization_id: organizationId,
    });

    if (error) {
      console.error('Error fetching settings:', error);
      throw new Error(error.message);
    }

    return mapDBSettingsToUI(data as DBOrganizationSettings);
  }

  /**
   * Update organization settings
   */
  async updateSettings(
    organizationId: string,
    updates: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings> {
    const dbUpdates = mapUISettingsToDBUpdate(updates);

    const { data, error } = await (supabase
      .from('organization_settings') as any)
      .update(dbUpdates)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error(error.message);
    }

    return mapDBSettingsToUI(data as DBOrganizationSettings);
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(
    organizationId: string,
    userId?: string
  ): Promise<NotificationPreferences> {
    const { data, error } = await (supabase.rpc as any)('get_or_create_notif_prefs', {
      p_organization_id: organizationId,
      p_user_id: userId || null,
    });

    if (error) {
      console.error('Error fetching notification prefs:', error);
      throw new Error(error.message);
    }

    return mapDBNotifToUI(data as DBNotificationPreferences);
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    id: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const dbUpdates = mapUINotifToDBUpdate(updates);

    const { data, error } = await (supabase
      .from('notification_preferences') as any)
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification prefs:', error);
      throw new Error(error.message);
    }

    return mapDBNotifToUI(data as DBNotificationPreferences);
  }

  /**
   * Update password (via Supabase Auth)
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Error updating password:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Enable/disable 2FA (placeholder - needs actual implementation)
   */
  async toggleTwoFactor(enabled: boolean): Promise<void> {
    // TODO: Implement actual 2FA via Supabase MFA
    console.log('2FA toggle:', enabled);
  }
}

export const settingsService = new SettingsService();
