/**
 * Add Staff Dialog Component
 * Form for creating new staff members
 * @module staff/components/AddStaffDialog
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StaffFormData, STAFF_ROLES, DEPARTMENTS, DEFAULT_STAFF_FORM } from '../types';
import { getInitials } from '../utils/mappers';

interface AddStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData, password: string) => Promise<void>;
  isDark: boolean;
}

export function AddStaffDialog({ open, onClose, onSubmit, isDark }: AddStaffDialogProps) {
  const [formData, setFormData] = useState<StaffFormData>(DEFAULT_STAFF_FORM);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const handleSubmit = async () => {
    if (!formData.email || !formData.fullName || !password) return;
    if (password.length < 6) return;

    setLoading(true);
    try {
      await onSubmit(formData, password);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_STAFF_FORM);
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Add New Staff Member</DialogTitle>
          <DialogDescription className={textMutedClass}>
            Fill in the details to add a new team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                {formData.fullName ? getInitials(formData.fullName) : 'NA'}
              </AvatarFallback>
            </Avatar>
            <div className={textMutedClass}>Profile photo can be added later</div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Full Name *</Label>
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Email Address *</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Phone Number</Label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Password *</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.filter((r) => r.value !== 'super-admin' && r.value !== 'org-admin').map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.icon} {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Department</Label>
              <Select
                value={formData.department || ''}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Job Title</Label>
              <Input
                placeholder="Game Master"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Hire Date</Label>
              <Input
                type="date"
                value={formData.hireDate || ''}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.fullName || password.length < 6}
            className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca]' : ''}
          >
            {loading ? 'Creating...' : 'Add Staff Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
