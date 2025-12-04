/**
 * Personal Info Tab
 * Profile photo, basic info, and address
 * @module profile-settings/components/PersonalInfoTab
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, Building2, MapPin, Globe, Camera, Upload, Save, Check } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { ProfileData } from '../types';

interface PersonalInfoTabProps {
  profileData: ProfileData;
  onChange: (data: ProfileData) => void;
  onSave: () => Promise<boolean>;
  onUploadPhoto: () => void;
  loading: boolean;
}

export function PersonalInfoTab({
  profileData,
  onChange,
  onSave,
  onUploadPhoto,
  loading,
}: PersonalInfoTabProps) {
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

  const updateField = (field: keyof ProfileData, value: string) => {
    onChange({ ...profileData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Profile Photo</CardTitle>
          </div>
          <CardDescription className={textMutedClass}>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-2xl bg-[#4f46e5] text-white">
                  {profileData.firstName[0]}{profileData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={onUploadPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#4f46e5] flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="space-y-2">
              <Button variant="outline" onClick={onUploadPhoto}>
                <Upload className="w-4 h-4 mr-2" />
                Upload New Photo
              </Button>
              <p className={`text-xs ${textMutedClass}`}>JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Basic Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>First Name</Label>
              <Input
                value={profileData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Last Name</Label>
              <Input
                value={profileData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={textClass}><Mail className="w-4 h-4 inline mr-2" />Email</Label>
            <Input
              type="email"
              value={profileData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className={textClass}><Phone className="w-4 h-4 inline mr-2" />Phone</Label>
            <Input
              type="tel"
              value={profileData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className={textClass}><Building2 className="w-4 h-4 inline mr-2" />Company</Label>
            <Input
              value={profileData.company}
              onChange={(e) => updateField('company', e.target.value)}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <CardTitle className={textClass}>Address</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className={textClass}>Street Address</Label>
            <Input
              value={profileData.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>City</Label>
              <Input
                value={profileData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>State</Label>
              <Input
                value={profileData.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>ZIP</Label>
              <Input
                value={profileData.zip}
                onChange={(e) => updateField('zip', e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={textClass}><Globe className="w-4 h-4 inline mr-2" />Country</Label>
            <Select value={profileData.country} onValueChange={(v) => updateField('country', v)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="Canada">Canada</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Australia">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" disabled={loading || saved}>Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={loading || saved}
          style={{ backgroundColor: saved ? '#10b981' : '#4f46e5' }}
          className="text-white"
        >
          {saved ? <><Check className="w-4 h-4 mr-2" />Saved</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
        </Button>
      </div>
    </div>
  );
}

export default PersonalInfoTab;
