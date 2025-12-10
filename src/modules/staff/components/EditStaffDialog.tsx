/**
 * Edit Staff Dialog Component
 * Form for updating existing staff members
 * @module staff/components/EditStaffDialog
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
import { StaffMember, StaffUpdateData, STAFF_ROLES, DEPARTMENTS, StaffRole } from '../types';
import { getInitials } from '../utils/mappers';
import { useStaffPermissions } from '../hooks/useStaffPermissions';

interface EditStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember;
  onUpdate: (id: string, userId: string, updates: StaffUpdateData) => Promise<void>;
  isDark: boolean;
}

export function EditStaffDialog({ open, onClose, staff, onUpdate, isDark }: EditStaffDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<StaffUpdateData>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const { getAssignableRoles } = useStaffPermissions();
  const assignableRoles = getAssignableRoles();

  // Initialize form data when staff member changes
  useEffect(() => {
    if (staff) {
      setFormData({
        fullName: staff.fullName,
        role: staff.role,
        department: staff.department,
        jobTitle: staff.jobTitle,
        phone: staff.phone,
        hireDate: staff.hireDate,
        notes: staff.notes,
        // Add other fields as needed
      });
      setAvatarPreview(staff.avatarUrl || null);
      setAvatarFile(null);
    }
  }, [staff, open]);

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

  // Remove selected avatar
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData(prev => ({ ...prev, avatarUrl: '' })); // Empty string to indicate removal
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  // Validation function
  const validateForm = (): string | null => {
    if (formData.fullName && formData.fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    return null;
  };

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
      let avatarUrl = formData.avatarUrl; // Preserve existing or removed state
      
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

      // Include avatar URL in updates
      const updates = {
        ...formData,
        avatarUrl,
      };

      await onUpdate(staff.id, staff.userId, updates);
      handleClose();
    } catch (error: any) {
      console.error('Error updating staff:', error);
      const errorMessage = error?.message || 'Failed to update staff member';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormError(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  const availableRoles = STAFF_ROLES.filter((r) => assignableRoles.includes(r.value as StaffRole));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Edit Staff Member</DialogTitle>
          <DialogDescription className={textMutedClass}>
            Update staff member details and permissions.
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
                id="edit-staff-avatar-upload"
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
              <Label htmlFor="edit-staff-fullname" className={textClass}>Full Name</Label>
              <Input 
                id="edit-staff-fullname"
                placeholder="John Doe" 
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Email Address</Label>
              <Input 
                disabled
                value={staff.email}
                className="opacity-70 cursor-not-allowed"
              />
              <span className="text-xs text-muted-foreground">Email cannot be changed</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-staff-phone" className={textClass}>Phone Number</Label>
              <Input 
                id="edit-staff-phone"
                placeholder="+1 (555) 123-4567" 
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as StaffRole })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>{role.icon} {role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Department</Label>
              <Select value={formData.department || ''} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-staff-jobtitle" className={textClass}>Job Title</Label>
              <Input 
                id="edit-staff-jobtitle"
                placeholder="Game Master" 
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-staff-hiredate" className={textClass}>Hire Date</Label>
              <Input 
                id="edit-staff-hiredate"
                type="date" 
                value={formData.hireDate || ''}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} 
              />
            </div>
          </div>

          {/* Bio/Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-staff-bio" className={textClass}>Bio / Description</Label>
            <Textarea
              id="edit-staff-bio"
              placeholder="Brief description about this staff member..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="resize-none h-20"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}
            disabled={loading}
            className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca]' : ''}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
