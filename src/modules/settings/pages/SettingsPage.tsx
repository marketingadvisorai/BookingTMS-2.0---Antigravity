/**
 * Settings Page
 * @module settings/pages/SettingsPage
 */

import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { AlertCircle, Building2 } from 'lucide-react';
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
  const hasOrganization = !!currentUser?.organizationId;
  const isSystemAdmin = currentUser?.role === 'system-admin';

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

  // Card styling
  const cardBg = isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';

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

  // No organization message component
  const NoOrganizationMessage = ({ feature }: { feature: string }) => (
    <Card className={`${cardBg} border p-8 text-center`}>
      <Building2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
      <h3 className={`text-lg font-semibold mb-2 ${textClass}`}>
        No Organization Selected
      </h3>
      <p className={mutedText}>
        {isSystemAdmin
          ? `${feature} settings are organization-specific. As a system admin, you can manage these settings from the Organizations page.`
          : `${feature} requires an organization. Please contact your administrator.`}
      </p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" sticky />

      {/* Tab Navigation */}
      <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} />

      {/* Tab Content */}
      {activeTab === 'business' && (
        hasOrganization ? (
          <BusinessInfoTab
            settings={settings}
            saving={saving}
            isDark={isDark}
            onSave={updateSettings}
          />
        ) : (
          <NoOrganizationMessage feature="Business" />
        )
      )}

      {activeTab === 'payments' && (
        hasOrganization ? (
          <StripeConnectTab
            organizationId={currentUser!.organizationId!}
            organizationEmail={settings?.businessEmail || currentUser?.email}
            organizationName={settings?.businessName || ''}
          />
        ) : (
          <NoOrganizationMessage feature="Payment" />
        )
      )}

      {activeTab === 'notifications' && (
        hasOrganization ? (
          <NotificationsTab
            notifications={notifications}
            saving={saving}
            isDark={isDark}
            onSave={updateNotifications}
          />
        ) : (
          <NoOrganizationMessage feature="Notification" />
        )
      )}

      {activeTab === 'security' && (
        <SecurityTab saving={saving} isDark={isDark} onUpdatePassword={updatePassword} />
      )}

      {activeTab === 'appearance' && <AppearanceTab isDark={isDark} />}
    </div>
  );
}
