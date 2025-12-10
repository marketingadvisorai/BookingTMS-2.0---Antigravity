/**
 * Staff List Item Component
 * Displays a staff member as a rich list item (card-like row)
 * Matches the "Team Members" reference design
 * @module staff/components/table/StaffListItem
 */

import { Mail, Phone, Calendar, Clock, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StaffMember } from '../../types';
import { getInitials, getRoleColor, formatDisplayDate } from '../../utils/mappers';
import { StaffDropdownMenu } from './StaffDropdownMenu';
import { formatDistanceToNow } from 'date-fns';

interface StaffListItemProps {
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

export function StaffListItem({
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
}: StaffListItemProps) {
  // Format last active time if available (using updatedAt as proxy for now)
  const lastActive = member.updatedAt 
    ? formatDistanceToNow(new Date(member.updatedAt), { addSuffix: true })
    : 'Unknown';

  return (
    <div className={`flex items-center justify-between p-4 border-b ${borderClass} ${hoverBgClass} transition-colors group`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="w-10 h-10 mt-1">
          <AvatarImage src={member.avatarUrl} />
          <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-600 text-white'}>
            {getInitials(member.fullName)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="space-y-1.5">
          {/* Header Row: Name + Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`font-medium ${textClass}`}>{member.fullName}</h3>
            
            {/* Role Badge */}
            <Badge 
              variant="secondary" 
              className={`text-xs px-2 py-0.5 h-5 font-normal ${getRoleColor(member.role, isDark)}`}
            >
              {member.role}
            </Badge>

            {/* Status Badge */}
            <Badge 
              variant="outline" 
              className={`text-xs px-2 py-0.5 h-5 font-normal border-0 ${
                member.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                member.isActive ? 'bg-green-500' : 'bg-gray-500'
              }`} />
              {member.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Meta Info Row */}
          <div className="flex items-center gap-4 flex-wrap text-sm">
            {/* Email */}
            <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
              <Mail className="w-3.5 h-3.5" />
              <span>{member.email}</span>
            </div>

            {/* Phone */}
            {member.phone && (
              <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
                <Phone className="w-3.5 h-3.5" />
                <span>{member.phone}</span>
              </div>
            )}

            {/* Join Date */}
            <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {formatDisplayDate(member.createdAt)}</span>
            </div>

            {/* Last Active */}
            <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>Last active {lastActive}</span>
            </div>

            {/* Organization (System Admin only) */}
            {showOrganization && (
              <div className={`flex items-center gap-1.5 ${textMutedClass}`}>
                <Building className="w-3.5 h-3.5" />
                <span>{member.organizationName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="ml-4">
        <StaffDropdownMenu
          member={member}
          isDark={isDark}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </div>
  );
}
