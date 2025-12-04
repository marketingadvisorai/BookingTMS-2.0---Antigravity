/**
 * Security Tab
 * Password and security settings
 * @module profile-settings/components/SecurityTab
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lock, Shield, Key, Eye, EyeOff, CheckCircle2, Smartphone, Save, Check } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { SecuritySettings } from '../types';

interface SecurityTabProps {
  security: SecuritySettings;
  onChange: (settings: SecuritySettings) => void;
  onSave: () => Promise<boolean>;
  onChangePassword: (newPassword: string, confirmPassword: string) => Promise<boolean>;
  loading: boolean;
}

export function SecurityTab({
  security,
  onChange,
  onSave,
  onChangePassword,
  loading,
}: SecurityTabProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [saved, setSaved] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleChangePassword = async () => {
    const success = await onChangePassword(newPassword, confirmPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Change Password</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={textClass}><Lock className="w-4 h-4 inline mr-2" />Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={textClass}><Key className="w-4 h-4 inline mr-2" />New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={textClass}><CheckCircle2 className="w-4 h-4 inline mr-2" />Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Separator className={borderClass} />

          <Button variant="outline" onClick={handleChangePassword} disabled={loading}>
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Add extra security to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className={textClass}>Authenticator App</p>
                <p className={`text-sm ${textMutedClass}`}>Use an app like Google Authenticator</p>
              </div>
            </div>
            <Switch
              checked={security.twoFactorEnabled}
              onCheckedChange={(checked) => onChange({ ...security, twoFactorEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <CardTitle className={textClass}>Session Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={textClass}>Session Timeout</Label>
            <Select
              value={security.sessionTimeout}
              onValueChange={(v) => onChange({ ...security, sessionTimeout: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={textClass}>Login Alerts</p>
              <p className={`text-sm ${textMutedClass}`}>Get notified of new logins</p>
            </div>
            <Switch
              checked={security.loginAlerts}
              onCheckedChange={(checked) => onChange({ ...security, loginAlerts: checked })}
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
          {saved ? <><Check className="w-4 h-4 mr-2" />Saved</> : <><Save className="w-4 h-4 mr-2" />Save Security Settings</>}
        </Button>
      </div>
    </div>
  );
}

export default SecurityTab;
