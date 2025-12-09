'use client';

import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Users,
  Mail,
  Smartphone,
  Save,
  Key,
  Lock,
  Code,
  Database,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemAdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemAdminSettingsModal({ isOpen, onClose }: SystemAdminSettingsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [activeTab, setActiveTab] = useState('platform');

  // Settings states
  const [platformSettings, setPlatformSettings] = useState({
    systemName: 'BookingTMS Admin Portal',
    systemEmail: 'admin@bookingtms.com',
    supportEmail: 'support@bookingtms.com',
    timezone: 'America/New_York',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    systemUpdates: true,
    securityAlerts: true,
    newOrganizations: true,
    planChanges: true,
    paymentAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    enforceStrongPasswords: true,
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    autoLockoutDuration: '15',
  });

  const [apiSettings, setApiSettings] = useState({
    apiEnabled: true,
    webhooksEnabled: true,
    rateLimitPerHour: '1000',
    allowCors: true,
  });

  const handleSavePlatform = () => {
    localStorage.setItem('systemAdminPlatformSettings', JSON.stringify(platformSettings));
    toast.success('Platform settings saved successfully');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('systemAdminNotificationSettings', JSON.stringify(notificationSettings));
    toast.success('Notification settings saved successfully');
  };

  const handleSaveSecurity = () => {
    localStorage.setItem('systemAdminSecuritySettings', JSON.stringify(securitySettings));
    toast.success('Security settings saved successfully');
  };

  const handleSaveApi = () => {
    localStorage.setItem('systemAdminApiSettings', JSON.stringify(apiSettings));
    toast.success('API settings saved successfully');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${cardBgClass} ${borderColor}`}>
        {/* Header with improved spacing */}
        <DialogHeader className="pb-4">
          <DialogTitle className={`flex items-center gap-3 text-xl ${textClass}`}>
            <Settings className="w-6 h-6" />
            System Admin Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Improved tab list with better spacing and mobile-first design */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-1.5 mb-6">
            <TabsTrigger 
              value="platform" 
              className="flex items-center justify-center gap-2 h-12 px-4 text-sm data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Platform</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              className="flex items-center justify-center gap-2 h-12 px-4 text-sm data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="flex items-center justify-center gap-2 h-12 px-4 text-sm data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="api"
              className="flex items-center justify-center gap-2 h-12 px-4 text-sm data-[state=active]:bg-[#4f46e5] data-[state=active]:text-white"
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
          </TabsList>

          {/* Platform Settings */}
          <TabsContent value="platform" className="space-y-6 mt-0">
            <Card className={`${cardBgClass} border ${borderColor} shadow-sm`}>
              <CardHeader className="pb-6">
                <CardTitle className={`${textClass} text-lg`}>Platform Configuration</CardTitle>
                <CardDescription className={`${textMutedClass} text-sm mt-2`}>
                  Configure global platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Improved grid with better responsive breakpoints */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>System Name</Label>
                    <Input
                      value={platformSettings.systemName}
                      onChange={(e) => setPlatformSettings({...platformSettings, systemName: e.target.value})}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>System Email</Label>
                    <Input
                      type="email"
                      value={platformSettings.systemEmail}
                      onChange={(e) => setPlatformSettings({...platformSettings, systemEmail: e.target.value})}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>Support Email</Label>
                    <Input
                      type="email"
                      value={platformSettings.supportEmail}
                      onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>Timezone</Label>
                    <Select 
                      value={platformSettings.timezone}
                      onValueChange={(value) => setPlatformSettings({...platformSettings, timezone: value})}
                    >
                      <SelectTrigger className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* USA Time Zones Only */}
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Phoenix">Arizona (No DST)</SelectItem>
                        <SelectItem value="America/Anchorage">Alaska Time (AKT)</SelectItem>
                        <SelectItem value="Pacific/Honolulu">Hawaii Time (HST)</SelectItem>
                        <SelectItem value="America/Adak">Hawaii-Aleutian (HST)</SelectItem>
                        <SelectItem value="America/Detroit">Eastern Time (Detroit)</SelectItem>
                        <SelectItem value="America/Indiana/Indianapolis">Eastern Time (Indiana)</SelectItem>
                        <SelectItem value="America/Boise">Mountain Time (Boise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>Language</Label>
                    <Select 
                      value={platformSettings.language}
                      onValueChange={(value) => setPlatformSettings({...platformSettings, language: value})}
                    >
                      <SelectTrigger className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>Date Format</Label>
                    <Select 
                      value={platformSettings.dateFormat}
                      onValueChange={(value) => setPlatformSettings({...platformSettings, dateFormat: value})}
                    >
                      <SelectTrigger className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className={`my-6 ${borderColor}`} />

                {/* Improved button layout */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className={`h-11 px-6 ${isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#4f46e5' }}
                    className="h-11 px-6 text-white hover:bg-[#4338ca]"
                    onClick={handleSavePlatform}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-0">
            <Card className={`${cardBgClass} border ${borderColor} shadow-sm`}>
              <CardHeader className="pb-6">
                <CardTitle className={`${textClass} text-lg`}>Notification Preferences</CardTitle>
                <CardDescription className={`${textMutedClass} text-sm mt-2`}>
                  Configure system-wide notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Improved notification items with better spacing */}
                <div className="space-y-3">
                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Mail className={`w-4 h-4 flex-shrink-0 ${textMutedClass}`} />
                        <p className={`text-sm font-medium ${textClass}`}>Email Alerts</p>
                      </div>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Receive email notifications for system events</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailAlerts: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Smartphone className={`w-4 h-4 flex-shrink-0 ${textMutedClass}`} />
                        <p className={`text-sm font-medium ${textClass}`}>SMS Alerts</p>
                      </div>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Receive SMS notifications for critical events</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.smsAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsAlerts: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textClass} mb-1.5`}>System Updates</p>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Get notified about platform updates</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textClass} mb-1.5`}>Security Alerts</p>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Critical security notifications</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textClass} mb-1.5`}>New Organizations</p>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Alert when new organizations sign up</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newOrganizations}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newOrganizations: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textClass} mb-1.5`}>Plan Changes</p>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Notify on subscription plan changes</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.planChanges}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, planChanges: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textClass} mb-1.5`}>Payment Alerts</p>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Alert for payment issues or successes</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.paymentAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentAlerts: checked})}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                <Separator className={`my-6 ${borderColor}`} />

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className={`h-11 px-6 ${isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#4f46e5' }}
                    className="h-11 px-6 text-white hover:bg-[#4338ca]"
                    onClick={handleSaveNotifications}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 mt-0">
            <Card className={`${cardBgClass} border ${borderColor} shadow-sm`}>
              <CardHeader className="pb-6">
                <CardTitle className={`${textClass} text-lg`}>Security Configuration</CardTitle>
                <CardDescription className={`${textMutedClass} text-sm mt-2`}>
                  Configure platform security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Improved security toggles with better spacing */}
                <div className="space-y-3">
                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Shield className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                        <p className={`text-sm font-medium ${textClass}`}>Require Two-Factor Authentication</p>
                      </div>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Enforce 2FA for all system administrators</p>
                    </div>
                    <Switch 
                      checked={securitySettings.requireTwoFactor}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireTwoFactor: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Key className={`w-4 h-4 flex-shrink-0 ${textMutedClass}`} />
                        <p className={`text-sm font-medium ${textClass}`}>Enforce Strong Passwords</p>
                      </div>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Require complex passwords for all users</p>
                    </div>
                    <Switch 
                      checked={securitySettings.enforceStrongPasswords}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enforceStrongPasswords: checked})}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                <Separator className={`my-6 ${borderColor}`} />

                {/* Improved security inputs with better responsive layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>
                      Session Timeout
                      <span className={`${textMutedClass} ml-1 font-normal`}>(minutes)</span>
                    </Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>
                      Max Login
                      <span className={`${textMutedClass} ml-1 font-normal`}>Attempts</span>
                    </Label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: e.target.value})}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>
                      Auto-Lockout
                      <span className={`${textMutedClass} ml-1 font-normal`}>(minutes)</span>
                    </Label>
                    <Input
                      type="number"
                      value={securitySettings.autoLockoutDuration}
                      onChange={(e) => setSecuritySettings({...securitySettings, autoLockoutDuration: e.target.value})}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500`}
                    />
                  </div>
                </div>

                <Separator className={`my-6 ${borderColor}`} />

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className={`h-11 px-6 ${isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#4f46e5' }}
                    className="h-11 px-6 text-white hover:bg-[#4338ca]"
                    onClick={handleSaveSecurity}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Settings */}
          <TabsContent value="api" className="space-y-6 mt-0">
            <Card className={`${cardBgClass} border ${borderColor} shadow-sm`}>
              <CardHeader className="pb-6">
                <CardTitle className={`${textClass} text-lg`}>API Configuration</CardTitle>
                <CardDescription className={`${textMutedClass} text-sm mt-2`}>
                  Configure API and integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Code className={`w-4 h-4 flex-shrink-0 ${textMutedClass}`} />
                        <p className={`text-sm font-medium ${textClass}`}>API Enabled</p>
                      </div>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Enable API access for integrations</p>
                    </div>
                    <Switch 
                      checked={apiSettings.apiEnabled}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, apiEnabled: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Database className={`w-4 h-4 flex-shrink-0 ${textMutedClass}`} />
                        <p className={`text-sm font-medium ${textClass}`}>Webhooks Enabled</p>
                      </div>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Allow webhook notifications</p>
                    </div>
                    <Switch 
                      checked={apiSettings.webhooksEnabled}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, webhooksEnabled: checked})}
                      className="flex-shrink-0"
                    />
                  </div>

                  <div className={`flex items-start sm:items-center justify-between p-5 rounded-lg border ${borderColor} ${hoverBgClass} transition-colors gap-4`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textClass} mb-1.5`}>Allow CORS</p>
                      <p className={`text-sm ${textMutedClass} leading-relaxed`}>Enable Cross-Origin Resource Sharing</p>
                    </div>
                    <Switch 
                      checked={apiSettings.allowCors}
                      onCheckedChange={(checked) => setApiSettings({...apiSettings, allowCors: checked})}
                      className="flex-shrink-0"
                    />
                  </div>
                </div>

                <Separator className={`my-6 ${borderColor}`} />

                <div className="space-y-3">
                  <Label className={`${isDark ? 'text-white' : 'text-gray-700'} text-sm font-medium`}>
                    Rate Limit
                    <span className={`${textMutedClass} ml-1 font-normal`}>(requests per hour)</span>
                  </Label>
                  <Input
                    type="number"
                    value={apiSettings.rateLimitPerHour}
                    onChange={(e) => setApiSettings({...apiSettings, rateLimitPerHour: e.target.value})}
                    className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'} placeholder:text-gray-500 max-w-xs`}
                  />
                </div>

                <Separator className={`my-6 ${borderColor}`} />

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className={`h-11 px-6 ${isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}`}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ backgroundColor: '#4f46e5' }}
                    className="h-11 px-6 text-white hover:bg-[#4338ca]"
                    onClick={handleSaveApi}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
