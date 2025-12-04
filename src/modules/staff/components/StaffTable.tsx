/**
 * Staff Table Component
 * Displays staff members in table/card views
 * @module staff/components/StaffTable
 */

import {
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StaffMember } from '../types';
import { getInitials, getRoleColor, formatDisplayDate } from '../utils/mappers';

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  isDark: boolean;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
}

export function StaffTable({
  staff,
  loading,
  isDark,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: StaffTableProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  if (loading) {
    return (
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardContent className="p-6">
          <div className={`text-center py-12 ${textMutedClass}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            Loading staff members...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader className="p-6">
        <CardTitle className={textClass}>Team Members</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3 p-4">
          {staff.length === 0 ? (
            <div className={`text-center py-8 ${textMutedClass}`}>No staff members found</div>
          ) : (
            staff.map((member) => (
              <StaffMobileCard
                key={member.id}
                member={member}
                isDark={isDark}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${borderClass}`}>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Member</th>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Contact</th>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Role</th>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Department</th>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Join Date</th>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Status</th>
                <th className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`text-center py-8 ${textMutedClass}`}>
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <StaffTableRow
                    key={member.id}
                    member={member}
                    isDark={isDark}
                    borderClass={borderClass}
                    hoverBgClass={hoverBgClass}
                    textClass={textClass}
                    textMutedClass={textMutedClass}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile Card sub-component
function StaffMobileCard({
  member,
  isDark,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  member: StaffMember;
  isDark: boolean;
  onView: (s: StaffMember) => void;
  onEdit: (s: StaffMember) => void;
  onDelete: (s: StaffMember) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
}) {
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

// Table Row sub-component (in separate file if needed for size)
function StaffTableRow({ member, isDark, borderClass, hoverBgClass, textClass, textMutedClass, onView, onEdit, onDelete, onToggleStatus }: any) {
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
        <StaffDropdownMenu member={member} isDark={isDark} onView={onView} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
      </td>
    </tr>
  );
}

// Dropdown Menu sub-component
function StaffDropdownMenu({ member, isDark, onView, onEdit, onDelete, onToggleStatus }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView(member)}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(member)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleStatus(member.userId, member.isActive)}>
          {member.isActive ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
          {member.isActive ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(member)}
          className={isDark ? 'text-red-400' : 'text-red-600'}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
