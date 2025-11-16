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
import { Plus, X } from 'lucide-react';

interface AddOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (newOwner: any) => void;
}

export const AddOwnerDialog = ({ isOpen, onClose, onAdd }: AddOwnerDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  const [formData, setFormData] = useState({
    ownerName: '',
    organizationName: '',
    organizationId: '',
    email: '',
    website: '',
    plan: 'Basic',
    venues: 1,
    status: 'active',
  });

  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    'AI Agents': false,
    'Waivers': false,
    'Analytics': false,
    'Marketing': false,
    'Booking Widgets': true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setEnabledFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const validateForm = () => {
    if (!formData.ownerName.trim()) {
      toast.error('Owner name is required');
      return false;
    }
    if (!formData.organizationName.trim()) {
      toast.error('Organization name is required');
      return false;
    }
    if (!formData.organizationId.trim()) {
      toast.error('Organization ID is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }

    // Get enabled features
    const features = Object.entries(enabledFeatures)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature);

    // Generate profile slug from organization name
    const profileSlug = formData.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newOwner = {
      id: Date.now(), // In real app, this would come from backend
      accountId: 1, // Would be assigned by backend
      ...formData,
      features,
      profileSlug,
    };

    if (onAdd) {
      onAdd(newOwner);
    }

    toast.success(`Owner "${formData.organizationName}" has been added successfully`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} border ${borderColor} max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Add New Owner</DialogTitle>
          <DialogDescription className={mutedTextClass}>
            Create a new owner account and configure settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Basic Information</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Owner Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Organization Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="Escape Rooms Inc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Organization ID <span className="text-red-600">*</span>
                </Label>
                <Input
                  value={formData.organizationId}
                  onChange={(e) => handleInputChange('organizationId', e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="ORG-001"
                />
                <p className={`text-xs ${mutedTextClass}`}>Unique identifier for this organization</p>
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Contact Information */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Contact Information</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-600">*</span>
                </Label>
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
                      <SelectItem value="Basic" className={textClass}>Basic - $99/mo</SelectItem>
                      <SelectItem value="Growth" className={textClass}>Growth - $299/mo</SelectItem>
                      <SelectItem value="Pro" className={textClass}>Pro - $599/mo</SelectItem>
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

              {/* Plan Info */}
              <div className={`p-4 rounded-lg border ${borderColor} bg-blue-600/5`}>
                <p className={`text-sm ${mutedTextClass}`}>
                  {formData.plan === 'Basic' && 'Basic plan includes: Up to 2 venues, Booking Widgets, Basic Analytics, Email Support'}
                  {formData.plan === 'Growth' && 'Growth plan includes: Up to 5 venues, All Basic features, Waivers, Marketing Tools, Priority Support'}
                  {formData.plan === 'Pro' && 'Pro plan includes: Unlimited venues, All Growth features, AI Agents, Advanced Analytics, Custom Branding, Dedicated Support'}
                </p>
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
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Owner
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
