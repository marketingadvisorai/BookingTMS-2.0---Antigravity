/**
 * Staff Table Row Component
 * Desktop table row for staff member
 * @module staff/components/table/StaffTableRow
 */

import { Mail, Phone, Calendar, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StaffMember } from '../../types';
import { getInitials, getRoleColor, formatDisplayDate } from '../../utils/mappers';
import { StaffDropdownMenu } from './StaffDropdownMenu';

interface StaffTableRowProps {
  member: StaffMember;
  isDark: boolean;
  borderClass: string;
  hoverBgClass: string;
  textClass: string;
  textMutedClass: string;
  onView: (s: StaffMember) => void;
  onEdit: (s: StaffMember) => void;
  onDelete: (s: StaffMember) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  showOrganization?: boolean;
}

export function StaffTableRow({
  member,
  isDark,
  borderClass,
  hoverBgClass,
  textClass,
  textMutedClass,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  showOrganization = false,
}: StaffTableRowProps) {
  return (
    <tr className={`border-b ${borderClass} ${hoverBgClass} transition-colors`}>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={member.avatarUrl} />
            <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
              {getInitials(member.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className={`text-sm ${textClass}`}>{member.fullName}</p>
            <p className={`text-xs ${textMutedClass}`}>{member.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="space-y-1">
          <div className={`flex items-center gap-2 text-xs ${textMutedClass}`}>
            <Mail className="w-3 h-3" />
            <span>{member.email}</span>
          </div>
          {member.phone && (
            <div className={`flex items-center gap-2 text-xs ${textMutedClass}`}>
              <Phone className="w-3 h-3" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <Badge className={getRoleColor(member.role, isDark)}>{member.role}</Badge>
      </td>
      <td className="py-4 px-4">
        <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
          <Building className="w-3 h-3" />
          <span>{member.department || 'Unassigned'}</span>
        </div>
      </td>
      {showOrganization && (
        <td className="py-4 px-4">
          <span className={`text-sm ${textMutedClass}`}>
            {member.organizationName || 'Unknown'}
          </span>
        </td>
      )}
      <td className="py-4 px-4">
        <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
          <Calendar className="w-3 h-3" />
          <span>{formatDisplayDate(member.createdAt)}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Switch checked={member.isActive} onCheckedChange={() => onToggleStatus(member.userId, member.isActive)} />
          <span className={`text-sm ${textClass}`}>{member.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <StaffDropdownMenu
          member={member}
          isDark={isDark}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </td>
    </tr>
  );
}
