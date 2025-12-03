/**
 * Add/Edit Guest Dialog
 * Form dialog for creating or updating guests
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Customer, CustomerCreateInput } from '../types';

interface AddGuestDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CustomerCreateInput) => Promise<void>;
  editCustomer?: Customer | null;
}

const INITIAL_FORM: CustomerCreateInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  status: 'active',
  communicationPreference: 'email',
  marketingConsent: false,
};

export function AddGuestDialog({
  open,
  onClose,
  onSave,
  editCustomer,
}: AddGuestDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerCreateInput>(INITIAL_FORM);

  // Reset form when dialog opens/closes or editCustomer changes
  useEffect(() => {
    if (editCustomer) {
      setFormData({
        firstName: editCustomer.firstName,
        lastName: editCustomer.lastName,
        email: editCustomer.email,
        phone: editCustomer.phone || '',
        notes: editCustomer.notes || '',
        status: editCustomer.status,
        communicationPreference: 'email',
        marketingConsent: editCustomer.metadata.marketing_consent ?? false,
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [editCustomer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving guest:', error);
    } finally {
      setLoading(false);
    }
  };

  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const labelClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-700';
  const inputClass = isDark
    ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]'
    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} max-w-2xl`}>
        <DialogHeader>
          <DialogTitle className={textClass}>
            {editCustomer ? 'Edit Guest' : 'Add New Guest'}
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-[#737373]' : 'text-gray-600'}>
            {editCustomer
              ? 'Update guest information and preferences.'
              : 'Add a new guest to your database with their contact details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelClass}>First Name *</Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={`h-12 ${inputClass}`}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Last Name *</Label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={`h-12 ${inputClass}`}
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelClass}>Email Address *</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`h-12 ${inputClass}`}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`h-12 ${inputClass}`}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Status and Communication */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={labelClass}>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'blocked') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className={`h-12 ${inputClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}
                >
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={labelClass}>Communication Preference</Label>
              <Select
                value={formData.communicationPreference}
                onValueChange={(value: 'email' | 'sms' | 'both' | 'none') =>
                  setFormData({ ...formData, communicationPreference: value })
                }
              >
                <SelectTrigger className={`h-12 ${inputClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}
                >
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className={labelClass}>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className={inputClass}
              placeholder="Additional notes about this guest..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={
                isDark
                  ? 'border-[#1e1e1e] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: '#4f46e5' }}
              className="text-white hover:opacity-90"
            >
              {loading ? 'Saving...' : editCustomer ? 'Update Guest' : 'Add Guest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
