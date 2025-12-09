/**
 * Preferences Tab
 * Display and regional preferences
 * @module profile-settings/components/PreferencesTab
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Clock, Globe, DollarSign, Calendar, Save, Check } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { ProfileData, PreferenceSettings } from '../types';

interface PreferencesTabProps {
  profileData: ProfileData;
  onProfileChange: (data: ProfileData) => void;
  preferences: PreferenceSettings;
  onPreferencesChange: (prefs: PreferenceSettings) => void;
  onSave: () => Promise<boolean>;
  loading: boolean;
}

export function PreferencesTab({
  profileData,
  onProfileChange,
  preferences,
  onPreferencesChange,
  onSave,
  loading,
}: PreferencesTabProps) {
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

  return (
    <div className="space-y-6">
      {/* Regional Settings */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Regional Settings</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Timezone and language preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={textClass}><Clock className="w-4 h-4 inline mr-2" />Timezone</Label>
            <Select
              value={profileData.timezone}
              onValueChange={(v) => onProfileChange({ ...profileData, timezone: v })}
            >
              <SelectTrigger className="h-11">
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

          <div className="space-y-2">
            <Label className={textClass}><Globe className="w-4 h-4 inline mr-2" />Language</Label>
            <Select
              value={profileData.language}
              onValueChange={(v) => onProfileChange({ ...profileData, language: v })}
            >
              <SelectTrigger className="h-11">
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
        </CardContent>
      </Card>

      {/* Display Formats */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Display Formats</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Date, time, and currency formats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(v) => onPreferencesChange({ ...preferences, dateFormat: v })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={textClass}>Time Format</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(v) => onPreferencesChange({ ...preferences, timeFormat: v })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={textClass}><DollarSign className="w-4 h-4 inline mr-2" />Currency</Label>
            <Select
              value={preferences.currency}
              onValueChange={(v) => onPreferencesChange({ ...preferences, currency: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD ($)</SelectItem>
                <SelectItem value="eur">EUR (€)</SelectItem>
                <SelectItem value="gbp">GBP (£)</SelectItem>
                <SelectItem value="cad">CAD ($)</SelectItem>
                <SelectItem value="aud">AUD ($)</SelectItem>
              </SelectContent>
            </Select>
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
          {saved ? <><Check className="w-4 h-4 mr-2" />Saved</> : <><Save className="w-4 h-4 mr-2" />Save Preferences</>}
        </Button>
      </div>
    </div>
  );
}

export default PreferencesTab;
