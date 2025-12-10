/**
 * Staff Table Component
 * Displays staff members in table/card views with error handling
 * Uses modular sub-components for maintainability
 * @module staff/components/StaffTable
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
import { StaffMember } from '../types';
import { StaffTableSkeleton, StaffListItem } from './table';

interface StaffTableProps {
  staff: StaffMember[];
  loading: boolean;
  isDark: boolean;
  error?: string | null;
  onView: (staff: StaffMember) => void;
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onToggleStatus: (userId: string, isActive: boolean) => void;
  onRefresh?: () => void;
  showOrganization?: boolean; // Show organization column for system admins
}

export function StaffTable({
  staff,
  loading,
  isDark,
  error,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onRefresh,
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

  // Show error state with detailed message
  if (error) {
    return (
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Team Members</CardTitle>
          <CardDescription className={textMutedClass}>View and manage all team members</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Alert variant="destructive" className={isDark ? 'border-red-800 bg-red-950/30' : ''}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Team Members</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">{error}</p>
              <p className={`text-sm ${textMutedClass}`}>
                This could be due to:
              </p>
              <ul className={`text-sm list-disc list-inside mt-1 ${textMutedClass}`}>
                <li>Database connection issues</li>
                <li>Permission restrictions (RLS policies)</li>
                <li>Missing database functions</li>
                <li>Network connectivity problems</li>
              </ul>
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center gap-2 ${textClass}`}>
              <Users className="w-5 h-5" />
              Team Members ({staff.length})
            </CardTitle>
            <CardDescription className={textMutedClass}>
              View and manage all team members
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {staff.length === 0 ? (
          <div className="p-12 text-center">
            <Users className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-[#3a3a3a]' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium mb-2 ${textClass}`}>No team members yet</p>
            <p className={`text-sm ${textMutedClass}`}>Add your first team member to get started</p>
          </div>
        ) : (
          <div className="divide-y border-t border-b-0 divide-gray-200 dark:divide-gray-800">
            {staff.map((member) => (
              <StaffListItem
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
