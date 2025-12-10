/**
 * Add Staff Dialog Component
 * Form for creating new staff members with role-based permissions
 * System admins must select an organization; org admins use their own org
 * @module staff/components/AddStaffDialog
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { StaffFormData, STAFF_ROLES, DEPARTMENTS, DEFAULT_STAFF_FORM, StaffRole } from '../types';
import { getInitials } from '../utils/mappers';
import { useStaffPermissions } from '../hooks/useStaffPermissions';
import { useAuth } from '@/lib/auth/AuthContext';
import { OrganizationSelector } from './OrganizationSelector';

interface AddStaffDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData, password: string, organizationId: string) => Promise<void>;
  isDark: boolean;
  /** Pre-selected organization ID (optional) */
  defaultOrganizationId?: string;
}

export function AddStaffDialog({ open, onClose, onSubmit, isDark, defaultOrganizationId }: AddStaffDialogProps) {
  const { currentUser } = useAuth();
  const isSystemAdmin = currentUser?.role === 'system-admin';
  
  const [formData, setFormData] = useState<StaffFormData>(DEFAULT_STAFF_FORM);
  const [password, setPassword] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(defaultOrganizationId || '');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { getAssignableRoles } = useStaffPermissions();
  const assignableRoles = getAssignableRoles();

  // Set organization ID based on user role
  useEffect(() => {
    if (!isSystemAdmin && currentUser?.organizationId) {
      setSelectedOrgId(currentUser.organizationId);
    } else if (defaultOrganizationId) {
      setSelectedOrgId(defaultOrganizationId);
    }
  }, [isSystemAdmin, currentUser?.organizationId, defaultOrganizationId]);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const inputClass = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-[#666]' : '';

  // Validation function
  const validateForm = (): string | null => {
    if (!selectedOrgId) {
      return 'Please select an organization';
    }
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!formData.role) {
      return 'Please select a role';
    }
    return null;
  };

  const canSubmit = formData.email && formData.fullName && password.length >= 6 && selectedOrgId && formData.role;

  const handleSubmit = async () => {
    setFormError(null);
    
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData, password, selectedOrgId);
      toast.success(`Staff member "${formData.fullName}" created successfully!`);
      handleClose();
    } catch (error: any) {
      console.error('Error creating staff:', error);
      const errorMessage = error?.message || 'Failed to create staff member';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_STAFF_FORM);
    setPassword('');
    setFormError(null);
    if (isSystemAdmin) setSelectedOrgId('');
    onClose();
  };

  const availableRoles = STAFF_ROLES.filter((r) => assignableRoles.includes(r.value as StaffRole));

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
          {/* Error Alert */}
          {formError && (
            <Alert variant="destructive" className={isDark ? 'border-red-800 bg-red-950/50 text-red-400' : ''}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          {/* Organization Selector - Only for System Admins */}
          {isSystemAdmin && (
            <OrganizationSelector
              value={selectedOrgId}
              onChange={setSelectedOrgId}
              isDark={isDark}
            />
          )}

          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                {formData.fullName ? getInitials(formData.fullName) : 'NA'}
              </AvatarFallback>
            </Avatar>
            <div className={textMutedClass}>Profile photo can be added later</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Full Name *</Label>
              <Input placeholder="John Doe" value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Email Address *</Label>
              <Input type="email" placeholder="john@example.com" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Phone Number</Label>
              <Input placeholder="+1 (555) 123-4567" value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Password *</Label>
              <Input type="password" placeholder="Min 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Role *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as StaffRole })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>{role.icon} {role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Department</Label>
              <Select value={formData.department || ''} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Job Title</Label>
              <Input placeholder="Game Master" value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Hire Date</Label>
              <Input type="date" value={formData.hireDate || ''}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca]' : ''}>
            {loading ? 'Creating...' : 'Add Staff Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
