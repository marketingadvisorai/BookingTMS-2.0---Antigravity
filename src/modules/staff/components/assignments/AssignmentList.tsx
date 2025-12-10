/**
 * Assignment List Component
 * Displays staff's activity/venue assignments
 * @module staff/components/assignments/AssignmentList
 */

import { Trash2, MapPin, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StaffAssignment } from '../../types';

interface AssignmentListProps {
  assignments: StaffAssignment[];
  loading: boolean;
  isDark: boolean;
  onDelete: (id: string) => void;
  canManage: boolean;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AssignmentList({
  assignments,
  loading,
  isDark,
  onDelete,
  canManage,
}: AssignmentListProps) {
  const cardBg = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-500';

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className={`rounded-lg border ${borderClass} ${cardBg} p-3 animate-pulse`}>
            <div className={`h-4 w-32 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} rounded mb-2`} />
            <div className={`h-3 w-24 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} rounded`} />
          </div>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className={`text-center py-6 ${mutedClass}`}>
        No assignments yet
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className={`rounded-lg border ${borderClass} ${cardBg} p-3 flex items-start justify-between gap-2`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={isDark ? 'bg-[#4f46e5]/20 text-[#818cf8] border-[#4f46e5]/30' : ''}
              >
                {assignment.assignmentType}
              </Badge>
              {assignment.isPrimary && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Primary</Badge>
              )}
            </div>
            <div className={`font-medium ${textClass} truncate`}>
              {assignment.activityName || assignment.venueName || 'Schedule Assignment'}
            </div>
            <div className={`text-xs ${mutedClass} flex items-center gap-3 mt-1`}>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {assignment.schedulePattern.days.map((d) => DAY_NAMES[d]).join(', ')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {assignment.schedulePattern.startTime} - {assignment.schedulePattern.endTime}
              </span>
            </div>
          </div>
          {canManage && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700'}`}
              onClick={() => onDelete(assignment.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
