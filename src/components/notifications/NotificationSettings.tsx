/**
 * Notification Settings Component
 * Comprehensive settings panel for notification preferences
 */

'use client';

import React from 'react';
import { useNotifications } from '../../lib/notifications/NotificationContext';
import { useTheme } from '../layout/ThemeContext';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Bell,
  Volume2,
  Monitor,
  Mail,
  MessageSquare,
  Moon,
  Save,
  Calendar,
  CreditCard,
  XCircle,
  AlertTriangle,
  BarChart3,
  Megaphone,
  Users,
  Info,
  Check,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { toast } from 'sonner@2.0.3';

export function NotificationSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { settings, updateSettings, playNotificationSound } = useNotifications();

  // Local state for pending changes
  const [pendingSettings, setPendingSettings] = React.useState(settings);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Update pending settings when global settings change
  React.useEffect(() => {
    setPendingSettings(settings);
    setHasChanges(false);
    setSaved(false);
  }, [settings]);

  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderColor = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const labelClass = isDark ? 'text-white' : 'text-gray-700';

  const handlePendingUpdate = (updates: Partial<typeof settings>) => {
    setPendingSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSoundVolumeChange = (value: number[]) => {
    handlePendingUpdate({ soundVolume: value[0] });
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  const handleSave = () => {
    // Save settings
    updateSettings(pendingSettings);
    setHasChanges(false);
    setSaved(true);
    
    // Show success toast
    toast.success('Your offline changes were synced', {
      description: 'Notification settings saved successfully',
    });

    // Reset saved state after 3 seconds
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleCancel = () => {
    setPendingSettings(settings);
    setHasChanges(false);
    setSaved(false);
    toast.info('Changes discarded');
  };

  return (
    <div className="space-y-6">
      {/* Sound Notifications */}
      <Card className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
        <div className="flex items-start gap-3 mb-4">
          <Volume2 className={`w-5 h-5 mt-1 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`mb-1 ${textPrimary}`}>Sound Notifications</h3>
            <p className={`text-sm ${textSecondary}`}>
              Play audio alerts for important events
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className={labelClass}>
              Enable sound notifications
            </Label>
            <Switch
              id="sound-enabled"
              checked={pendingSettings.soundEnabled}
              onCheckedChange={(checked) => handlePendingUpdate({ soundEnabled: checked })}
            />
          </div>

          {pendingSettings.soundEnabled && (
            <>
              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={labelClass}>Volume</Label>
                  <span className={`text-sm ${textSecondary}`}>{pendingSettings.soundVolume}%</span>
                </div>
                <Slider
                  value={[pendingSettings.soundVolume]}
                  onValueChange={handleSoundVolumeChange}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSound}
                  className={`w-full gap-2 ${isDark ? 'border-[#1e1e1e] bg-transparent hover:bg-[#0a0a0a]' : ''}`}
                >
                  <Volume2 className="w-4 h-4" />
                  Test Sound
                </Button>
              </div>

              <Separator className={isDark ? 'bg-[#1e1e1e]' : 'bg-gray-200'} />

              {/* Sound for specific events */}
              <div className="space-y-3">
                <Label className={labelClass}>Play sound for:</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${textSecondary}`} />
                    <span className={`text-sm ${textSecondary}`}>New bookings</span>
                  </div>
                  <Switch
                    checked={pendingSettings.soundForBookings}
                    onCheckedChange={(checked) => handlePendingUpdate({ soundForBookings: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${textSecondary}`} />
                    <span className={`text-sm ${textSecondary}`}>Payment received</span>
                  </div>
                  <Switch
                    checked={pendingSettings.soundForPayments}
                    onCheckedChange={(checked) => handlePendingUpdate({ soundForPayments: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className={`w-4 h-4 ${textSecondary}`} />
                    <span className={`text-sm ${textSecondary}`}>Cancellations</span>
                  </div>
                  <Switch
                    checked={pendingSettings.soundForCancellations}
                    onCheckedChange={(checked) => handlePendingUpdate({ soundForCancellations: checked })}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
        <div className="flex items-start gap-3 mb-6">
          <Bell className={`w-5 h-5 mt-1 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`mb-1 ${textPrimary}`}>Push Notifications</h3>
            <p className={`text-sm ${textSecondary}`}>
              In-app and browser notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* New Bookings */}
          <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Calendar className={`w-5 h-5 mt-0.5 ${textSecondary}`} />
                <div>
                  <div className={`${textPrimary} mb-1`}>New Bookings</div>
                  <p className={`text-sm ${textSecondary}`}>Instant alerts for new bookings</p>
                </div>
              </div>
              <Switch
                checked={pendingSettings.desktopForBookings}
                onCheckedChange={(checked) => handlePendingUpdate({ desktopForBookings: checked })}
              />
            </div>
          </div>

          {/* Staff Updates */}
          <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Users className={`w-5 h-5 mt-0.5 ${textSecondary}`} />
                <div>
                  <div className={`${textPrimary} mb-1`}>Staff Updates</div>
                  <p className={`text-sm ${textSecondary}`}>Staff check-ins and schedule changes</p>
                </div>
              </div>
              <Switch
                checked={pendingSettings.desktopForStaffUpdates}
                onCheckedChange={(checked) => handlePendingUpdate({ desktopForStaffUpdates: checked })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Email Notifications */}
      <Card className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
        <div className="flex items-start gap-3 mb-6">
          <Mail className={`w-5 h-5 mt-1 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`mb-1 ${textPrimary}`}>Email Notifications</h3>
            <p className={`text-sm ${textSecondary}`}>
              Manage your email notification preferences
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Booking Notifications */}
          <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Bell className={`w-5 h-5 mt-0.5 ${textSecondary}`} />
                <div>
                  <div className={`${textPrimary} mb-1`}>Booking Notifications</div>
                  <p className={`text-sm ${textSecondary}`}>New bookings, cancellations, and modifications</p>
                </div>
              </div>
              <Switch
                checked={pendingSettings.emailForBookings}
                onCheckedChange={(checked) => handlePendingUpdate({ emailForBookings: checked })}
              />
            </div>
          </div>

          {/* Reports & Analytics */}
          <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <BarChart3 className={`w-5 h-5 mt-0.5 ${textSecondary}`} />
                <div>
                  <div className={`${textPrimary} mb-1`}>Reports & Analytics</div>
                  <p className={`text-sm ${textSecondary}`}>Daily, weekly, and monthly reports</p>
                </div>
              </div>
              <Switch
                checked={pendingSettings.emailForReports}
                onCheckedChange={(checked) => handlePendingUpdate({ emailForReports: checked })}
              />
            </div>
          </div>

          {/* Marketing & Updates */}
          <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 mt-0.5 ${textSecondary}`} />
                <div>
                  <div className={`${textPrimary} mb-1`}>Marketing & Updates</div>
                  <p className={`text-sm ${textSecondary}`}>Product updates, tips, and promotional content</p>
                </div>
              </div>
              <Switch
                checked={pendingSettings.emailForMarketing}
                onCheckedChange={(checked) => handlePendingUpdate({ emailForMarketing: checked })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* SMS Notifications */}
      <Card className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
        <div className="flex items-start gap-3 mb-6">
          <MessageSquare className={`w-5 h-5 mt-1 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`mb-1 ${textPrimary}`}>SMS Notifications</h3>
            <p className={`text-sm ${textSecondary}`}>
              Text message alerts
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Critical Alerts */}
          <div className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${textSecondary}`} />
                <div>
                  <div className={`${textPrimary} mb-1`}>Critical Alerts</div>
                  <p className={`text-sm ${textSecondary}`}>Urgent notifications only (cancellations, system issues)</p>
                </div>
              </div>
              <Switch
                checked={pendingSettings.smsEnabled}
                onCheckedChange={(checked) => handlePendingUpdate({ smsEnabled: checked })}
              />
            </div>
          </div>

          {pendingSettings.smsEnabled && (
            <>
              <Separator className={isDark ? 'bg-[#1e1e1e]' : 'bg-gray-200'} />

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="sms-phone" className={labelClass}>Phone number</Label>
                <Input
                  id="sms-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={pendingSettings.smsPhoneNumber}
                  onChange={(e) => handlePendingUpdate({ smsPhoneNumber: e.target.value })}
                  className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
                <p className={`text-xs ${textSecondary}`}>We'll send a verification code to this number</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
        <div className="flex items-start gap-3 mb-4">
          <Moon className={`w-5 h-5 mt-1 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`mb-1 ${textPrimary}`}>Quiet Hours</h3>
            <p className={`text-sm ${textSecondary}`}>
              Pause notifications during specific hours (Do Not Disturb)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours-enabled" className={labelClass}>
              Enable quiet hours
            </Label>
            <Switch
              id="quiet-hours-enabled"
              checked={pendingSettings.quietHoursEnabled}
              onCheckedChange={(checked) => handlePendingUpdate({ quietHoursEnabled: checked })}
            />
          </div>

          {pendingSettings.quietHoursEnabled && (
            <>
              <Separator className={isDark ? 'bg-[#1e1e1e]' : 'bg-gray-200'} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start" className={labelClass}>Start time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={pendingSettings.quietHoursStart}
                    onChange={(e) => handlePendingUpdate({ quietHoursStart: e.target.value })}
                    className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiet-end" className={labelClass}>End time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={pendingSettings.quietHoursEnd}
                    onChange={(e) => handlePendingUpdate({ quietHoursEnd: e.target.value })}
                    className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300'}`}
                  />
                </div>
              </div>

              <p className={`text-xs ${textSecondary}`}>
                No sound or desktop notifications will be shown during these hours
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Additional Preferences */}
      <Card className={`${cardBg} border ${borderColor} shadow-sm p-6`}>
        <div className="flex items-start gap-3 mb-4">
          <Bell className={`w-5 h-5 mt-1 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`mb-1 ${textPrimary}`}>Additional Preferences</h3>
            <p className={`text-sm ${textSecondary}`}>
              Fine-tune your notification experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="in-app" className={labelClass}>Show in-app notifications</Label>
              <p className={`text-xs ${textSecondary} mt-1`}>Display toast notifications in the app</p>
            </div>
            <Switch
              id="in-app"
              checked={pendingSettings.showInAppNotifications}
              onCheckedChange={(checked) => handlePendingUpdate({ showInAppNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="group-similar" className={labelClass}>Group similar notifications</Label>
              <p className={`text-xs ${textSecondary} mt-1`}>Combine multiple similar notifications</p>
            </div>
            <Switch
              id="group-similar"
              checked={pendingSettings.groupSimilarNotifications}
              onCheckedChange={(checked) => handlePendingUpdate({ groupSimilarNotifications: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Sticky Action Buttons */}
      <div className={`sticky bottom-0 left-0 right-0 py-4 px-6 -mx-6 flex items-center justify-end gap-3 border-t ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e]' : 'bg-white border-gray-200'} z-10 shadow-lg`}>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={!hasChanges || saved}
          className={`h-11 min-w-[120px] ${isDark ? 'border-[#1e1e1e] bg-transparent text-[#a3a3a3] hover:bg-[#161616] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saved}
          className="h-11 min-w-[200px] gap-2 text-white hover:opacity-90 disabled:opacity-100 disabled:cursor-default transition-all duration-300"
          style={{ 
            backgroundColor: saved ? '#10b981' : (hasChanges ? '#4f46e5' : '#9ca3af')
          }}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Success
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Notification Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
