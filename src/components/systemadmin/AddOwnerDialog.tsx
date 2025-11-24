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
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';
import { useOrganizations, usePlans } from '../../features/system-admin/hooks';
import { OrganizationService } from '../../features/system-admin/services';
import type { CreateOrganizationDTO } from '../../features/system-admin/types';

interface AddOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: () => void;
}

export const AddOwnerDialog = ({ isOpen, onClose, onAdd }: AddOwnerDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  const { createOrganization, isCreating, error: orgsError } = useOrganizations({}, 1, 10);
  const { plans, error: plansError } = usePlans(true); // Get only active plans

  const hasDbError = orgsError || plansError;

  const [formData, setFormData] = useState<CreateOrganizationDTO>({
    name: '',
    owner_name: '',
    owner_email: '',
    website: '',
    phone: '',
    plan_id: '',
    status: 'pending',
  });

  const [createAccount, setCreateAccount] = useState(true);
  const [password, setPassword] = useState('');
  const [venueName, setVenueName] = useState('');


  const handleInputChange = (field: keyof CreateOrganizationDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const validateForm = () => {
    if (!formData.owner_name.trim()) {
      toast.error('Owner name is required');
      return false;
    }
    if (!formData.name.trim()) {
      toast.error('Organization name is required');
      return false;
    }
    if (!formData.owner_email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.owner_email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.plan_id) {
      toast.error('Please select a plan');
      return false;
    }
    if (createAccount && !password) {
      toast.error('Password is required when creating a user account');
      return false;
    }
    if (createAccount && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (createAccount) {
        // Use the new service method to create user + org + venue
        await OrganizationService.createWithUser(formData, password, venueName);
      } else {
        // Standard org creation
        await createOrganization(formData);
      }

      toast.success(`Organization "${formData.name}" has been created successfully`);
      if (onAdd) {
        onAdd();
      }
      // Reset form
      setFormData({
        name: '',
        owner_name: '',
        owner_email: '',
        website: '',
        phone: '',
        plan_id: '',
        status: 'pending',
      });
      setPassword('');
      setVenueName('');
      onClose();
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      toast.error(`Failed to create organization: ${error.message || 'Unknown error'}`);
    }
  };

  // Show error if database not configured
  if (hasDbError && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${bgClass} ${textClass} border ${borderColor} max-w-md`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Database Not Configured</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className={mutedTextClass}>The database tables don't exist yet. Please run migrations first.</p>
            <div className="mt-4">
              <Button onClick={() => onClose()} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Organization Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="Escape Rooms Inc."
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${borderColor} bg-blue-600/5`}>
                <p className={`text-xs ${mutedTextClass}`}>
                  📝 Organization ID will be automatically generated when you create the organization
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Default Venue Name <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </Label>
                <Input
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="e.g. Main Location (defaults to Organization Name - Main Venue)"
                />
              </div>
            </div>
          </div>


          <Separator className={borderColor} />

          {/* User Account Settings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-sm uppercase tracking-wider ${mutedTextClass}`}>User Account</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={createAccount}
                  onCheckedChange={setCreateAccount}
                  id="create-account"
                />
                <Label htmlFor="create-account" className="text-sm font-medium">
                  Create User Account
                </Label>
              </div>
            </div>

            {createAccount && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Password <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="Set a temporary password"
                  />
                  <p className={`text-xs ${mutedTextClass}`}>
                    The user will be created with the 'Org Admin' role and assigned to this organization.
                  </p>
                </div>
              </div>
            )}
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
                  value={formData.owner_email}
                  onChange={(e) => handleInputChange('owner_email', e.target.value)}
                  className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                  placeholder="owner@example.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Website</Label>
                  <Input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333] placeholder:text-gray-500`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Plan & Settings */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Plan & Settings</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">
                    Plan <span className="text-red-600">*</span>
                  </Label>
                  <Select value={formData.plan_id} onValueChange={(value) => handleInputChange('plan_id', value)}>
                    <SelectTrigger className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333]`}>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent className={`${bgClass} border ${borderColor}`} position="popper" sideOffset={5}>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id} className={textClass}>
                          {plan.name} - ${plan.price_monthly}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as 'active' | 'pending')}>
                    <SelectTrigger className={`h-12 bg-gray-100 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#333]`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={`${bgClass} border ${borderColor}`} position="popper" sideOffset={5}>
                      <SelectItem value="pending" className={textClass}>Pending</SelectItem>
                      <SelectItem value="active" className={textClass}>Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Plan Info */}
              {formData.plan_id && (
                <div className={`p-4 rounded-lg border ${borderColor} bg-blue-600/5`}>
                  <p className={`text-sm ${mutedTextClass}`}>
                    {plans?.find(p => p.id === formData.plan_id)?.name} plan features will be available after organization is created.
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#333]">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className={`border ${borderColor}`}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isCreating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isCreating ? 'Creating...' : 'Add Owner'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog >
  );
};
