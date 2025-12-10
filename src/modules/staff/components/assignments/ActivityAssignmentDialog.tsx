/**
 * Activity Assignment Dialog
 * Assign staff to activities with schedule
 * @module staff/components/assignments/ActivityAssignmentDialog
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssignmentFormData, DEFAULT_ASSIGNMENT_FORM } from '../../types';

interface ActivityAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  activities: { id: string; name: string }[];
  venues: { id: string; name: string }[];
  isDark: boolean;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function ActivityAssignmentDialog({
  open,
  onClose,
  onSubmit,
  activities,
  venues,
  isDark,
}: ActivityAssignmentDialogProps) {
  const [formData, setFormData] = useState<AssignmentFormData>(DEFAULT_ASSIGNMENT_FORM);
  const [loading, setLoading] = useState(false);

  const textClass = isDark ? 'text-white' : 'text-gray-900';

  useEffect(() => {
    if (open) setFormData(DEFAULT_ASSIGNMENT_FORM);
  }, [open]);

  const toggleDay = (day: number) => {
    const days = formData.schedulePattern.days.includes(day)
      ? formData.schedulePattern.days.filter((d) => d !== day)
      : [...formData.schedulePattern.days, day].sort();
    setFormData({
      ...formData,
      schedulePattern: { ...formData.schedulePattern, days },
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`max-w-md ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Add Assignment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className={textClass}>Assignment Type</Label>
            <Select
              value={formData.assignmentType}
              onValueChange={(v) => setFormData({ ...formData, assignmentType: v as any })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.assignmentType === 'activity' && (
            <div className="space-y-2">
              <Label className={textClass}>Activity</Label>
              <Select
                value={formData.activityId || ''}
                onValueChange={(v) => setFormData({ ...formData, activityId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                <SelectContent>
                  {activities.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.assignmentType === 'venue' && (
            <div className="space-y-2">
              <Label className={textClass}>Venue</Label>
              <Select
                value={formData.venueId || ''}
                onValueChange={(v) => setFormData({ ...formData, venueId: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className={textClass}>Working Days</Label>
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={formData.schedulePattern.days.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                  className={formData.schedulePattern.days.includes(day.value) && isDark ? 'bg-[#4f46e5]' : ''}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={textClass}>Start Time</Label>
              <Input
                type="time"
                value={formData.schedulePattern.startTime}
                onChange={(e) => setFormData({
                  ...formData,
                  schedulePattern: { ...formData.schedulePattern, startTime: e.target.value },
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>End Time</Label>
              <Input
                type="time"
                value={formData.schedulePattern.endTime}
                onChange={(e) => setFormData({
                  ...formData,
                  schedulePattern: { ...formData.schedulePattern, endTime: e.target.value },
                })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className={isDark ? 'bg-[#4f46e5]' : ''}>
            {loading ? 'Adding...' : 'Add Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
