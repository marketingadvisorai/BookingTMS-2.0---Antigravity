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
    plan_id: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState<OrganizationValidationErrors>({});

  // Initialize form when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        owner_name: organization.owner_name || '',
        owner_email: organization.owner_email || '',
        plan_id: organization.plan_id || '',
        status: organization.status === 'active' ? 'active' : 'pending',
      });
    } else {
      setFormData({
        name: '',
        owner_name: '',
        owner_email: '',
        plan_id: '',
        status: 'pending',
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
