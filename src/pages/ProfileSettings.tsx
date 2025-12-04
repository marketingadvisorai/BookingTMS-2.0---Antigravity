/**
 * Profile Settings Page
 * Uses the modular profile-settings components
 * @module pages/ProfileSettings
 */

import { useState } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Shield, Bell, Settings } from 'lucide-react';
import { toast } from 'sonner';

import {
  useProfileSettings,
  PersonalInfoTab,
  SecurityTab,
  NotificationsTab,
  PreferencesTab,
} from '@/modules/profile-settings';

export function ProfileSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('personal');

  const {
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
  } = useProfileSettings();

  const handleUploadPhoto = () => {
    toast.info('Photo upload coming soon');
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile Settings" description="Manage your account" sticky />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';

  return (
    <div className="space-y-6">
      <PageHeader title="Profile Settings" description="Manage your profile and preferences" sticky />

      {/* Tab Navigation */}
      <div className={`${cardBgClass} border ${borderClass} rounded-lg p-4`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'preferences', label: 'Preferences', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                activeTab === id
                  ? isDark
                    ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
                    : 'bg-blue-600 border-blue-600 text-white'
                  : isDark
                    ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && (
        <PersonalInfoTab
          profileData={profileData}
          onChange={setProfileData}
          onSave={saveProfile}
          onUploadPhoto={handleUploadPhoto}
          loading={loading}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab
          security={security}
          onChange={setSecurity}
          onSave={saveSecurity}
          onChangePassword={changePassword}
          loading={loading}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsTab
          notifications={notifications}
          onChange={setNotifications}
          onSave={saveNotifications}
          loading={loading}
        />
      )}

      {activeTab === 'preferences' && (
        <PreferencesTab
          profileData={profileData}
          onProfileChange={setProfileData}
          preferences={preferences}
          onPreferencesChange={setPreferences}
          onSave={savePreferences}
          loading={loading}
        />
      )}
    </div>
  );
}

export default ProfileSettings;
