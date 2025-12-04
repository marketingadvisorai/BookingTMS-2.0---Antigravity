/**
 * Business Info Settings Tab
 * @module settings/components/BusinessInfoTab
 */

import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Clock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { OrganizationSettings, TIMEZONES } from '../types';

interface BusinessInfoTabProps {
  settings: OrganizationSettings | null;
  saving: boolean;
  isDark: boolean;
  onSave: (updates: Partial<OrganizationSettings>) => Promise<void>;
}

export function BusinessInfoTab({ settings, saving, isDark, onSave }: BusinessInfoTabProps) {
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    timezone: 'America/New_York',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName || '',
        businessEmail: settings.businessEmail || '',
        businessPhone: settings.businessPhone || '',
        businessAddress: settings.businessAddress || '',
        timezone: settings.timezone || 'America/New_York',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const inputClass = isDark
    ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white'
    : 'bg-gray-100 border-gray-300';

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
          <CardTitle className={textClass}>Business Information</CardTitle>
        </div>
        <CardDescription className={textMutedClass}>
          Update your business details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={textClass}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Name
              </div>
            </Label>
            <Input
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className={`h-11 ${inputClass}`}
            />
          </div>
          <div className="space-y-2">
            <Label className={textClass}>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Business Email
              </div>
            </Label>
            <Input
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              className={`h-11 ${inputClass}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={textClass}>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </div>
            </Label>
            <Input
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              className={`h-11 ${inputClass}`}
            />
          </div>
          <div className="space-y-2">
            <Label className={textClass}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timezone
              </div>
            </Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData({ ...formData, timezone: value })}
            >
              <SelectTrigger className={`h-11 ${inputClass}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className={textClass}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Business Address
            </div>
          </Label>
          <Input
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className={`h-11 ${inputClass}`}
          />
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
