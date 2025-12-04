/**
 * Security Settings Tab
 * @module settings/components/SecurityTab
 */

import { useState } from 'react';
import { Shield, Lock, Key, CheckCircle2, Eye, EyeOff, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SecurityTabProps {
  saving: boolean;
  isDark: boolean;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function SecurityTab({ saving, isDark, onUpdatePassword }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    await onUpdatePassword(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const PasswordInput = ({
    label,
    icon: Icon,
    value,
    onChange,
    show,
    onToggleShow,
  }: {
    label: string;
    icon: any;
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    onToggleShow: () => void;
  }) => (
    <div className="space-y-2">
      <Label className={textClass}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </div>
      </Label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-11 w-11"
          onClick={onToggleShow}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
          <CardTitle className={textClass}>Security Settings</CardTitle>
        </div>
        <CardDescription className={textMutedClass}>
          Manage your account security and password
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PasswordInput
          label="Current Password"
          icon={Lock}
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrentPassword}
          onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
        />

        <PasswordInput
          label="New Password"
          icon={Key}
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPassword}
          onToggleShow={() => setShowNewPassword(!showNewPassword)}
        />

        <PasswordInput
          label="Confirm New Password"
          icon={CheckCircle2}
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        <Separator className={borderClass} />

        <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Shield className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              <p className={`text-sm ${textClass}`}>Two-Factor Authentication</p>
              {twoFactorEnabled && (
                <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                  Enabled
                </Badge>
              )}
            </div>
            <p className={`text-sm ${textMutedClass}`}>Add an extra layer of security</p>
          </div>
          <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
        </div>

        <Separator className={borderClass} />

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
