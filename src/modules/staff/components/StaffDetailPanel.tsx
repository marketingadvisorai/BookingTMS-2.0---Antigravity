/**
 * Staff Detail Panel
 * Detailed staff view with assignments tab
 * @module staff/components/StaffDetailPanel
 */

import { useState, useEffect } from 'react';
import { Plus, Calendar, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StaffMember } from '../types';
import { useStaffAssignments } from '../hooks/useStaffAssignments';
import { useStaffPermissions } from '../hooks/useStaffPermissions';
import { AssignmentList } from './assignments/AssignmentList';
import { ActivityAssignmentDialog } from './assignments/ActivityAssignmentDialog';
import { getInitials, getRoleColor, formatDisplayDate } from '../utils/mappers';
import { useAuth } from '@/lib/auth/AuthContext';

interface StaffDetailPanelProps {
  staff: StaffMember;
  isDark: boolean;
  activities: { id: string; name: string }[];
  venues: { id: string; name: string }[];
  onClose: () => void;
}

export function StaffDetailPanel({
  staff,
  isDark,
  activities,
  venues,
  onClose,
}: StaffDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { currentUser } = useAuth();
  const { canManageAssignments } = useStaffPermissions();

  const {
    assignments,
    loading: assignmentsLoading,
    createAssignment,
    deleteAssignment,
  } = useStaffAssignments({
    staffProfileId: staff.id,
    organizationId: staff.organizationId,
  });

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-500';
  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  return (
    <div className={`h-full flex flex-col ${isDark ? 'bg-[#161616]' : 'bg-white'}`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4" style={{ borderColor: isDark ? '#2a2a2a' : '#e5e7eb' }}>
        <Avatar className="w-12 h-12">
          <AvatarImage src={staff.avatarUrl} />
          <AvatarFallback className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600'}>
            {getInitials(staff.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${textClass}`}>{staff.fullName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getRoleColor(staff.role, isDark)}>{staff.role}</Badge>
            {staff.department && <span className={`text-xs ${mutedClass}`}>{staff.department}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className={`grid grid-cols-2 m-4 ${isDark ? 'bg-[#1e1e1e]' : ''}`}>
          <TabsTrigger value="details" className="gap-2"><User className="w-4 h-4" /> Details</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><Calendar className="w-4 h-4" /> Assignments</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <TabsContent value="details" className="mt-0 space-y-4">
            <InfoSection label="Email" value={staff.email} isDark={isDark} />
            <InfoSection label="Phone" value={staff.phone || 'Not set'} isDark={isDark} />
            <InfoSection label="Job Title" value={staff.jobTitle || 'Not set'} isDark={isDark} />
            <InfoSection label="Hire Date" value={staff.hireDate ? formatDisplayDate(staff.hireDate) : 'Not set'} isDark={isDark} />
            {staff.skills && staff.skills.length > 0 && (
              <div className={`p-3 rounded-lg ${bgClass}`}>
                <div className={`text-xs ${mutedClass} mb-2`}>Skills</div>
                <div className="flex flex-wrap gap-1">
                  {staff.skills.map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="mt-0 space-y-4">
            {canManageAssignments && (
              <Button
                variant="outline"
                className={`w-full ${isDark ? 'border-[#2a2a2a] hover:bg-[#1e1e1e]' : ''}`}
                onClick={() => setShowAssignDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Assignment
              </Button>
            )}
            <AssignmentList
              assignments={assignments}
              loading={assignmentsLoading}
              isDark={isDark}
              onDelete={deleteAssignment}
              canManage={canManageAssignments}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Assignment Dialog */}
      <ActivityAssignmentDialog
        open={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onSubmit={async (data) => {
          await createAssignment(data, currentUser?.id || '');
        }}
        activities={activities}
        venues={venues}
        isDark={isDark}
      />
    </div>
  );
}

function InfoSection({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-500';
  const textClass = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className={`p-3 rounded-lg ${bgClass}`}>
      <div className={`text-xs ${mutedClass} mb-1`}>{label}</div>
      <div className={`text-sm ${textClass}`}>{value}</div>
    </div>
  );
}
