/**
 * Settings Page
 * @module settings/pages/SettingsPage
 */

import { useTheme } from '@/components/layout/ThemeContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import {
  SettingsTabNav,
  BusinessInfoTab,
  NotificationsTab,
  SecurityTab,
  AppearanceTab,
} from '../components';

export function SettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    settings,
    notifications,
    loading,
    saving,
    activeTab,
    setActiveTab,
    updateSettings,
    updateNotifications,
    updatePassword,
  } = useSettings();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your account and preferences" sticky />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" sticky />

      {/* Tab Navigation */}
      <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} />

      {/* Tab Content */}
      {activeTab === 'business' && (
        <BusinessInfoTab
          settings={settings}
          saving={saving}
          isDark={isDark}
          onSave={updateSettings}
        />
      )}

      {activeTab === 'payments' && (
        <div className={`p-6 rounded-lg ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'} border`}>
          <p className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>
            Payment settings are managed through the Payments page and Stripe Connect.
          </p>
        </div>
      )}

      {activeTab === 'notifications' && (
        <NotificationsTab
          notifications={notifications}
          saving={saving}
          isDark={isDark}
          onSave={updateNotifications}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab saving={saving} isDark={isDark} onUpdatePassword={updatePassword} />
      )}

      {activeTab === 'appearance' && <AppearanceTab isDark={isDark} />}
    </div>
  );
}
