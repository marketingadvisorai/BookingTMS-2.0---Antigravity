/**
 * Notifications Settings Tab
 * @module settings/components/NotificationsTab
 */

import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { NotificationPreferences } from '../types';

interface NotificationsTabProps {
  notifications: NotificationPreferences | null;
  saving: boolean;
  isDark: boolean;
  onSave: (updates: Partial<NotificationPreferences>) => Promise<void>;
}

export function NotificationsTab({ notifications, saving, isDark, onSave }: NotificationsTabProps) {
  const [formData, setFormData] = useState<Partial<NotificationPreferences>>({});

  useEffect(() => {
    if (notifications) {
      setFormData({
        emailNewBookings: notifications.emailNewBookings,
        emailCancellations: notifications.emailCancellations,
        emailDailyReports: notifications.emailDailyReports,
        smsBookingReminders: notifications.smsBookingReminders,
        smsUrgentAlerts: notifications.smsUrgentAlerts,
      });
    }
  }, [notifications]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const NotificationItem = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
      <div className="flex-1">
        <p className={`text-sm ${textClass}`}>{label}</p>
        <p className={`text-sm ${textMutedClass}`}>{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
          <CardTitle className={textClass}>Notification Preferences</CardTitle>
        </div>
        <CardDescription className={textMutedClass}>
          Choose how you want to be notified about important events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className={`w-4 h-4 ${textMutedClass}`} />
            <h3 className={`text-sm ${textClass}`}>Email Notifications</h3>
          </div>
          <div className="space-y-3">
            <NotificationItem
              label="New Bookings"
              description="Get notified when a new booking is made"
              checked={formData.emailNewBookings ?? true}
              onChange={(checked) => setFormData({ ...formData, emailNewBookings: checked })}
            />
            <NotificationItem
              label="Booking Cancellations"
              description="Get notified when a booking is cancelled"
              checked={formData.emailCancellations ?? true}
              onChange={(checked) => setFormData({ ...formData, emailCancellations: checked })}
            />
            <NotificationItem
              label="Daily Reports"
              description="Receive daily summary reports"
              checked={formData.emailDailyReports ?? false}
              onChange={(checked) => setFormData({ ...formData, emailDailyReports: checked })}
            />
          </div>
        </div>

        <Separator className={borderClass} />

        {/* SMS Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className={`w-4 h-4 ${textMutedClass}`} />
            <h3 className={`text-sm ${textClass}`}>SMS Notifications</h3>
          </div>
          <div className="space-y-3">
            <NotificationItem
              label="Booking Reminders"
              description="Send SMS reminders to customers"
              checked={formData.smsBookingReminders ?? false}
              onChange={(checked) => setFormData({ ...formData, smsBookingReminders: checked })}
            />
            <NotificationItem
              label="Urgent Alerts"
              description="Get SMS for urgent issues"
              checked={formData.smsUrgentAlerts ?? false}
              onChange={(checked) => setFormData({ ...formData, smsUrgentAlerts: checked })}
            />
          </div>
        </div>

        <Separator className={borderClass} />

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
