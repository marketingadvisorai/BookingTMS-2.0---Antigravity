/**
 * Settings Page
 * @module settings/pages/SettingsPage
 */

import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { useSettings } from '../hooks/useSettings';
import {
  SettingsTabNav,
  BusinessInfoTab,
  NotificationsTab,
  SecurityTab,
  AppearanceTab,
  StripeConnectTab,
} from '../components';

export function SettingsPage() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
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

      {activeTab === 'payments' && currentUser?.organizationId && (
        <StripeConnectTab
          organizationId={currentUser.organizationId}
          organizationEmail={settings?.businessEmail || currentUser?.email}
          organizationName={settings?.businessName || ''}
        />
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
