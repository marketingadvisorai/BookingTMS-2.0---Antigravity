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
import { Loader2 } from 'lucide-react';
import { validateOrganization, hasValidationErrors, type OrganizationValidationErrors } from '../../utils';
import type { Organization, CreateOrganizationDTO } from '../../types';

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
  
  const [formData, setFormData] = useState<CreateOrganizationDTO>({
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

  const [errors, setErrors] = useState<OrganizationValidationErrors>({});

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
  }, [organization, open]);

  const handleChange = (field: keyof CreateOrganizationDTO, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
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

    // Validate
    const validationErrors = validateOrganization(formData);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]">
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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Organization Name */}
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

            {/* Owner Name */}
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

            {/* Owner Email */}
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

            {/* Website */}
            <div className="grid gap-2">
              <Label htmlFor="website" className="text-gray-900 dark:text-white">
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://example.com"
                className="bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]"
              />
            </div>

            {/* Phone */}
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

            {/* Location Details */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-3 gap-4">
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


            {/* Create Default Venue (Only for new orgs) */}
            {!isEdit && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="create_default_venue"
                  checked={formData.create_default_venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, create_default_venue: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="create_default_venue" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Create default venue using organization address
                </Label>
              </div>
            )}

            {/* Plan Selection */}
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

            {/* Status */}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-200 dark:border-[#2a2a2a]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
