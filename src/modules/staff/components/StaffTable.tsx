/**
 * Staff Table Component
 * Displays staff members in table/card views
 * Uses modular sub-components for maintainability
 * @module staff/components/StaffTable
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffMember } from '../types';
import { StaffTableSkeleton, StaffMobileCard, StaffTableRow } from './table';

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  isDark: boolean;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  showOrganization?: boolean; // Show organization column for system admins
}

export function StaffTable({
  staff,
  loading,
  isDark,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  showOrganization = false,
}: StaffTableProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  if (loading) {
    return <StaffTableSkeleton isDark={isDark} />;
  }

  // Build table headers dynamically
  const headers = ['Member', 'Contact', 'Role', 'Department'];
  if (showOrganization) headers.push('Organization');
  headers.push('Join Date', 'Status', 'Actions');

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
                {headers.map((h) => (
                  <th key={h} className={`text-left py-3 px-4 text-sm ${textMutedClass}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className={`text-center py-8 ${textMutedClass}`}>
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
                    showOrganization={showOrganization}
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
