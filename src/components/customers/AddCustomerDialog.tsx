'use client';

import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { X } from 'lucide-react';

interface AddCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: any) => void;
  editCustomer?: any;
}

export function AddCustomerDialog({ open, onClose, onSave, editCustomer }: AddCustomerDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    firstName: editCustomer?.firstName || '',
    lastName: editCustomer?.lastName || '',
    email: editCustomer?.email || '',
    phone: editCustomer?.phone || '',
    segment: editCustomer?.segment || 'Regular',
    communicationPreference: editCustomer?.communicationPreference || 'Email',
    notes: editCustomer?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} max-w-2xl`}>
        <DialogHeader>
          <DialogTitle className={textClass}>
            {editCustomer ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogDescription className={isDark ? 'text-[#737373]' : 'text-gray-600'}>
            {editCustomer ? 'Update customer information and preferences.' : 'Add a new customer to your database with their contact details and preferences.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
                First Name *
              </Label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                placeholder="John"
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
                Last Name *
              </Label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
                Email Address *
              </Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
                Phone Number
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
                Customer Segment
              </Label>
              <Select value={formData.segment} onValueChange={(value) => setFormData({ ...formData, segment: value })}>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
                Communication Preference
              </Label>
              <Select value={formData.communicationPreference} onValueChange={(value) => setFormData({ ...formData, communicationPreference: value })}>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>
              Notes
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`${isDark ? 'bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
              placeholder="Additional notes about this customer..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={isDark ? 'border-[#1e1e1e] text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#4f46e5' }}
              className="text-white hover:opacity-90"
            >
              {editCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
