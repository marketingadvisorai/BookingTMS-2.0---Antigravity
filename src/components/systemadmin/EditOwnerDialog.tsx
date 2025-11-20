'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useTheme } from '../layout/ThemeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Save, X } from 'lucide-react';

interface EditOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  owner: any;
  onSave?: (updatedOwner: any) => void;
}

export const EditOwnerDialog = ({ isOpen, onClose, owner, onSave }: EditOwnerDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  const [formData, setFormData] = useState({
    ownerName: owner?.ownerName || '',
    organizationName: owner?.organizationName || '',
    organizationId: owner?.organizationId || '',
    email: owner?.email || '',
    website: owner?.website || '',
    plan: owner?.plan || 'Basic',
    venues: owner?.venues || 1,
    status: owner?.status || 'active',
    features: owner?.features || [],
  });

  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    'AI Agents': owner?.features?.includes('AI Agents') || false,
    'Waivers': owner?.features?.includes('Waivers') || false,
    'Analytics': owner?.features?.includes('Analytics') || false,
    'Marketing': owner?.features?.includes('Marketing') || false,
    'Booking Widgets': owner?.features?.includes('Booking Widgets') || false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setEnabledFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleSave = () => {
    // Get enabled features
    const features = Object.entries(enabledFeatures)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature);

    const updatedOwner = {
      ...owner,
      ...formData,
      features,
    };

    if (onSave) {
      onSave(updatedOwner);
    }

    toast.success('Owner updated successfully');
    onClose();
  };

  if (!owner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} border ${borderColor} max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Edit Owner</DialogTitle>
          <DialogDescription className={mutedTextClass}>
            Update owner information and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Basic Information</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Owner Name</Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Organization Name</Label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="Escape Rooms Inc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Organization ID</Label>
                <Input
                  value={formData.organizationId}
                  onChange={(e) => handleInputChange('organizationId', e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="ORG-001"
                />
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Contact Information */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Contact Information</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="owner@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Website</Label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Plan & Settings */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Plan & Settings</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Plan</Label>
                  <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                    <SelectTrigger className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333]`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${bgClass} border ${borderColor}`}>
                      <SelectItem value="Basic" className={textClass}>Basic</SelectItem>
                      <SelectItem value="Growth" className={textClass}>Growth</SelectItem>
                      <SelectItem value="Pro" className={textClass}>Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Number of Venues</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.venues}
                    onChange={(e) => handleInputChange('venues', parseInt(e.target.value))}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333]`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${bgClass} border ${borderColor}`}>
                      <SelectItem value="active" className={textClass}>Active</SelectItem>
                      <SelectItem value="inactive" className={textClass}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Features */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Enabled Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(enabledFeatures).map(([feature, enabled]) => (
                <div
                  key={feature}
                  className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass} flex items-center justify-between`}
                >
                  <Label className="text-gray-700 dark:text-gray-300 cursor-pointer" htmlFor={feature}>
                    {feature}
                  </Label>
                  <Switch
                    id={feature}
                    checked={enabled}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#333]">
            <Button
              variant="outline"
              onClick={onClose}
              className={`border ${borderColor}`}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
