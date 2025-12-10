/**
 * Staff Mobile Card Component
 * Mobile-optimized card view for staff member
 * @module staff/components/table/StaffMobileCard
 */

import { Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StaffMember } from '../../types';
import { getInitials, getRoleColor } from '../../utils/mappers';
import { StaffDropdownMenu } from './StaffDropdownMenu';

interface StaffMobileCardProps {
  member: StaffMember;
  isDark: boolean;
  onView: (s: StaffMember) => void;
  onEdit: (s: StaffMember) => void;
  onDelete: (s: StaffMember) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
}

export function StaffMobileCard({
  member,
  isDark,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: StaffMobileCardProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <Card className={`${cardBgClass} border ${borderClass}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={member.avatarUrl} />
              <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
                {getInitials(member.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${textClass}`}>{member.fullName}</p>
              <Badge className={`${getRoleColor(member.role, isDark)} text-xs mt-1`}>
                {member.role}
              </Badge>
            </div>
          </div>
          <StaffDropdownMenu
            member={member}
            isDark={isDark}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        </div>
        <div className="space-y-2 text-xs">
          <div className={`flex items-center gap-2 ${textMutedClass}`}>
            <Mail className="w-3 h-3" />
            <span className="truncate">{member.email}</span>
          </div>
          {member.phone && (
            <div className={`flex items-center gap-2 ${textMutedClass}`}>
              <Phone className="w-3 h-3" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.organizationName && (
            <div className={`text-xs ${textMutedClass} italic`}>
              {member.organizationName}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <span className={textMutedClass}>{member.department || 'Unassigned'}</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={member.isActive}
                onCheckedChange={() => onToggleStatus(member.userId, member.isActive)}
              />
              <span className={textClass}>{member.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
