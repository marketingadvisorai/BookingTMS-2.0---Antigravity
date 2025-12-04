/**
 * View Staff Dialog Component
 * Displays staff member details
 * @module staff/components/ViewStaffDialog
 */

import { Mail, Phone, Building, Calendar, Shield, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StaffMember } from '../types';
import { getInitials, getRoleColor, getStatusColor, formatDisplayDate } from '../utils/mappers';

interface ViewStaffDialogProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  isDark: boolean;
}

export function ViewStaffDialog({ open, onClose, staff, isDark }: ViewStaffDialogProps) {
  if (!staff) return null;

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-lg ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Staff Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={staff.avatarUrl} />
              <AvatarFallback
                className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] text-xl' : 'bg-blue-100 text-blue-600 text-xl'}
              >
                {getInitials(staff.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${textClass}`}>{staff.fullName}</h3>
              <p className={`text-sm ${textMutedClass}`}>{staff.jobTitle || 'No title'}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={getRoleColor(staff.role, isDark)}>{staff.role}</Badge>
                <Badge className={getStatusColor(staff.isActive, isDark)}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className={isDark ? 'bg-[#2a2a2a]' : ''} />

          {/* Contact Info */}
          <div className={`p-4 rounded-lg ${bgElevatedClass}`}>
            <h4 className={`text-sm font-medium mb-3 ${textClass}`}>Contact Information</h4>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 text-sm ${textMutedClass}`}>
                <Mail className="w-4 h-4" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div className={`flex items-center gap-3 text-sm ${textMutedClass}`}>
                  <Phone className="w-4 h-4" />
                  <span>{staff.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Work Info */}
          <div className={`p-4 rounded-lg ${bgElevatedClass}`}>
            <h4 className={`text-sm font-medium mb-3 ${textClass}`}>Work Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-3 text-sm ${textMutedClass}`}>
                <Building className="w-4 h-4" />
                <span>{staff.department || 'Unassigned'}</span>
              </div>
              <div className={`flex items-center gap-3 text-sm ${textMutedClass}`}>
                <Calendar className="w-4 h-4" />
                <span>{staff.hireDate ? formatDisplayDate(staff.hireDate) : 'Not set'}</span>
              </div>
              {staff.employeeId && (
                <div className={`flex items-center gap-3 text-sm ${textMutedClass}`}>
                  <User className="w-4 h-4" />
                  <span>ID: {staff.employeeId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {staff.skills && staff.skills.length > 0 && (
            <div className={`p-4 rounded-lg ${bgElevatedClass}`}>
              <h4 className={`text-sm font-medium mb-3 ${textClass}`}>Skills</h4>
              <div className="flex flex-wrap gap-2">
                {staff.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(staff.emergencyContactName || staff.emergencyContactPhone) && (
            <div className={`p-4 rounded-lg ${bgElevatedClass}`}>
              <h4 className={`text-sm font-medium mb-3 ${textClass}`}>Emergency Contact</h4>
              <div className="space-y-2">
                {staff.emergencyContactName && (
                  <p className={`text-sm ${textMutedClass}`}>{staff.emergencyContactName}</p>
                )}
                {staff.emergencyContactPhone && (
                  <p className={`text-sm ${textMutedClass}`}>{staff.emergencyContactPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className={`text-xs ${textMutedClass}`}>
            <p>Member since: {formatDisplayDate(staff.createdAt)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
