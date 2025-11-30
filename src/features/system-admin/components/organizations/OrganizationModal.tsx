/**
 * Organization Modal Component
 * 
 * Modal for adding/editing organizations
 * Following existing modal design patterns
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Copy, Check, Mail, Key, AlertCircle } from 'lucide-react';
import { validateOrganization, hasValidationErrors, type OrganizationValidationErrors } from '../../utils';
import type { Organization, CreateOrganizationDTO } from '../../types';
import { toast } from 'sonner';

interface OrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrganizationDTO) => Promise<void>;
  organization?: Organization | null;
  plans: Array<{ id: string; name: string }>;
  loading?: boolean;
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({
  open,
  onClose,
  onSubmit,
  organization,
  plans,
  loading = false,
}) => {
  const isEdit = !!organization;
  
  const [formData, setFormData] = useState<CreateOrganizationDTO & { initial_password?: string }>({
    name: '',
    owner_name: '',
    owner_email: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    plan_id: '',
    status: 'pending',
    create_default_venue: true,
    initial_password: '',
  });

  const [errors, setErrors] = useState<OrganizationValidationErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Initialize form when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        owner_name: organization.owner_name || '',
        owner_email: organization.owner_email || '',
        website: organization.website || '',
        phone: organization.phone || '',
        address: organization.address || '',
        city: organization.city || '',
        state: organization.state || '',
        zip: organization.zip || '',
        country: organization.country || '',
        plan_id: organization.plan_id || '',
        status: organization.status === 'active' ? 'active' : 'pending',
      });
    } else {
      setFormData({
        name: '',
        owner_name: '',
        owner_email: '',
        website: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        plan_id: '',
        status: 'pending',
        create_default_venue: true,
      });
    }
    setErrors({});
    setApiError(null);
    setIsSubmitting(false);
  }, [organization, open]);

  const handleChange = (field: keyof CreateOrganizationDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user makes changes
    setApiError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate
    const validationErrors = validateOrganization(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      // Show toast with first error
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Success - modal will be closed by parent
    } catch (error: any) {
      console.error('Submit error:', error);
      // Extract meaningful error message
      let errorMessage = 'Failed to create organization. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.code) {
        // Database error codes
        if (error.code === '23505') {
          errorMessage = 'An organization with this email already exists.';
        } else if (error.code === '23503') {
          errorMessage = 'Invalid plan selection. Please select a valid plan.';
        } else {
          errorMessage = `Database error: ${error.code}`;
        }
      }
      
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            {isEdit ? 'Edit Organization' : 'Add New Organization'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-[#737373]">
            {isEdit
              ? 'Update organization details'
              : 'Create a new organization in the system'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <form onSubmit={handleSubmit} id="org-form">
            <div className="grid gap-6 py-4">
              {/* API Error Alert */}
              {apiError && (
                <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-950/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Validation Error Summary */}
              {hasValidationErrors(errors) && (
                <Alert variant="destructive" className="border-orange-300 bg-orange-50 dark:bg-orange-950/30">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="ml-2 text-orange-700 dark:text-orange-400">
                    Please fix the highlighted fields below
                  </AlertDescription>
                </Alert>
              )}

              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">Basic Information</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-gray-900 dark:text-white">
                      Organization Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter organization name"
                      className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 dark:text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="website" className="text-gray-900 dark:text-white">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="example.com"
                      className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Just the domain name (e.g., example.com) - https:// will be added automatically
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">Owner Details</h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="owner_name" className="text-gray-900 dark:text-white">
                        Owner Name *
                      </Label>
                      <Input
                        id="owner_name"
                        value={formData.owner_name}
                        onChange={(e) => handleChange('owner_name', e.target.value)}
                        placeholder="Enter owner name"
                        className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                      />
                      {errors.owner_name && (
                        <p className="text-sm text-red-600 dark:text-red-500">{errors.owner_name}</p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="owner_email" className="text-gray-900 dark:text-white">
                      Owner Email *
                    </Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={formData.owner_email}
                      onChange={(e) => handleChange('owner_email', e.target.value)}
                      placeholder="owner@example.com"
                      className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                    />
                    {errors.owner_email && (
                      <p className="text-sm text-red-600 dark:text-red-500">{errors.owner_email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">Location</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address" className="text-gray-900 dark:text-white">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Street address"
                      className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city" className="text-gray-900 dark:text-white">
                        City
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        placeholder="City"
                        className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="country" className="text-gray-900 dark:text-white">
                        Country
                      </Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        placeholder="Country"
                        className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="state" className="text-gray-900 dark:text-white">
                        State
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        placeholder="State"
                        className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zip" className="text-gray-900 dark:text-white">
                        Zip
                      </Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleChange('zip', e.target.value)}
                        placeholder="Zip"
                        className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
                      />
                    </div>
                  </div>

                  {!isEdit && (
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="create_default_venue"
                        checked={formData.create_default_venue}
                        onChange={(e) => setFormData(prev => ({ ...prev, create_default_venue: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label htmlFor="create_default_venue" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-0">
                        Create default venue using organization address
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">Account Settings</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plan" className="text-gray-900 dark:text-white">
                      Plan *
                    </Label>
                    <Select
                      value={formData.plan_id}
                      onValueChange={(value) => handleChange('plan_id', value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.plan_id && (
                      <p className="text-sm text-red-600 dark:text-red-500">{errors.plan_id}</p>
                    )}
                  </div>

                  {/* Initial Password (Only for new orgs) */}
                  {!isEdit && (
                    <div className="grid gap-2">
                      <Label htmlFor="initial_password" className="text-gray-900 dark:text-white flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Initial Password (Optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="initial_password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.initial_password || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, initial_password: e.target.value }))}
                          placeholder="Leave blank to auto-generate"
                          className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        If left blank, a secure password will be generated and the owner will receive a reset link.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="status" className="text-gray-900 dark:text-white">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange('status', value as any)}
                    >
                      <SelectTrigger className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || isSubmitting}
            className="border-gray-200 dark:border-[#2a2a2a]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="org-form"
            disabled={loading || isSubmitting}
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white min-w-[100px]"
          >
            {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creating...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
