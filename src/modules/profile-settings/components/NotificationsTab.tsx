/**
 * Notifications Tab
 * Notification preferences
 * @module profile-settings/components/NotificationsTab
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Smartphone, Save, Check } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { NotificationSettings } from '../types';

interface NotificationsTabProps {
  notifications: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onSave: () => Promise<boolean>;
  loading: boolean;
}

export function NotificationsTab({
  notifications,
  onChange,
  onSave,
  loading,
}: NotificationsTabProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [saved, setSaved] = useState(false);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const updateField = (field: keyof NotificationSettings, value: boolean) => {
    onChange({ ...notifications, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Email Notifications</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Choose what emails you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Booking Updates</p>
              <p className={`text-sm ${textMutedClass}`}>New bookings and changes</p>
            </div>
            <Switch
              checked={notifications.emailBookings}
              onCheckedChange={(checked) => updateField('emailBookings', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Reports</p>
              <p className={`text-sm ${textMutedClass}`}>Daily and weekly reports</p>
            </div>
            <Switch
              checked={notifications.emailReports}
              onCheckedChange={(checked) => updateField('emailReports', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Marketing</p>
              <p className={`text-sm ${textMutedClass}`}>Tips and updates</p>
            </div>
            <Switch
              checked={notifications.emailMarketing}
              onCheckedChange={(checked) => updateField('emailMarketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Push Notifications</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>In-app and browser notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>New Bookings</p>
              <p className={`text-sm ${textMutedClass}`}>Instant alerts for new bookings</p>
            </div>
            <Switch
              checked={notifications.pushBookings}
              onCheckedChange={(checked) => updateField('pushBookings', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Staff Updates</p>
              <p className={`text-sm ${textMutedClass}`}>Team activity notifications</p>
            </div>
            <Switch
              checked={notifications.pushStaff}
              onCheckedChange={(checked) => updateField('pushStaff', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>SMS Notifications</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Text message alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Booking Alerts</p>
              <p className={`text-sm ${textMutedClass}`}>SMS for new bookings</p>
            </div>
            <Switch
              checked={notifications.smsBookings}
              onCheckedChange={(checked) => updateField('smsBookings', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Reminders</p>
              <p className={`text-sm ${textMutedClass}`}>SMS reminders for upcoming events</p>
            </div>
            <Switch
              checked={notifications.smsReminders}
              onCheckedChange={(checked) => updateField('smsReminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading || saved}
          style={{ backgroundColor: saved ? '#10b981' : '#4f46e5' }}
          className="text-white"
        >
          {saved ? <><Check className="w-4 h-4 mr-2" />Saved</> : <><Save className="w-4 h-4 mr-2" />Save Notifications</>}
        </Button>
      </div>
    </div>
  );
}

export default NotificationsTab;
