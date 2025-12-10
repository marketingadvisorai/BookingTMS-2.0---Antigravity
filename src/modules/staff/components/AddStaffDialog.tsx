/**
 * Add Staff Dialog Component
 * Form for creating new staff members with role-based permissions
 * System admins must select an organization; org admins use their own org
 * Supports profile photo upload and bio/description
 * @module staff/components/AddStaffDialog
 */

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<StaffFormData>(DEFAULT_STAFF_FORM);
  const [password, setPassword] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>(defaultOrganizationId || '');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
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

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    
    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `staff-avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });
      
      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Don't fail the whole operation, just log
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (err) {
      console.error('Avatar upload exception:', err);
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove selected avatar
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      // Upload avatar first if selected
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `staff-avatars/${tempId}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrl;
        } else {
          console.warn('Avatar upload failed, continuing without:', uploadError);
        }
      }

      // Include avatar URL and notes in formData
      const dataWithAvatar = {
        ...formData,
        avatarUrl,
      };

      await onSubmit(dataWithAvatar, password, selectedOrgId);
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
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

          {/* Avatar Upload Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : (
                  <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                    {formData.fullName ? getInitials(formData.fullName) : 'NA'}
                  </AvatarFallback>
                )}
              </Avatar>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="staff-avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {avatarPreview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <span className={`text-xs ${textMutedClass}`}>Max 2MB, JPG/PNG</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff-fullname" className={textClass}>Full Name *</Label>
              <Input 
                id="staff-fullname"
                name="staff-fullname"
                placeholder="John Doe" 
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                autoComplete="off"
                data-form-type="other"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email" className={textClass}>Email Address *</Label>
              <Input 
                id="staff-email"
                name="staff-email"
                type="email" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                autoComplete="off"
                data-form-type="other"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff-phone" className={textClass}>Phone Number</Label>
              <Input 
                id="staff-phone"
                name="staff-phone"
                placeholder="+1 (555) 123-4567" 
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-password" className={textClass}>Password *</Label>
              <Input 
                id="staff-password"
                name="staff-password"
                type="password" 
                placeholder="Min 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                autoComplete="new-password"
              />
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
              <Label htmlFor="staff-jobtitle" className={textClass}>Job Title</Label>
              <Input 
                id="staff-jobtitle"
                name="staff-jobtitle"
                placeholder="Game Master" 
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} 
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-hiredate" className={textClass}>Hire Date</Label>
              <Input 
                id="staff-hiredate"
                name="staff-hiredate"
                type="date" 
                value={formData.hireDate || ''}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} 
              />
            </div>
          </div>

          {/* Bio/Description */}
          <div className="space-y-2">
            <Label htmlFor="staff-bio" className={textClass}>Bio / Description</Label>
            <Textarea
              id="staff-bio"
              name="staff-bio"
              placeholder="Brief description about this staff member..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="resize-none h-20"
              autoComplete="off"
            />
            <span className={`text-xs ${textMutedClass}`}>Optional - shown on staff profile</span>
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
