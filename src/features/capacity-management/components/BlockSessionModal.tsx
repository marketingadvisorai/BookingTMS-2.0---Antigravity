/**
 * BlockSessionModal Component
 * Modal for blocking sessions with reason selection
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Ban } from 'lucide-react';
import type { BlockSessionRequest, SessionBlockReason } from '../types';

interface BlockSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: BlockSessionRequest) => Promise<void>;
  activityId: string;
  selectedDate?: string;
  selectedTime?: string;
}

const BLOCK_REASONS: { value: SessionBlockReason; label: string }[] = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'private_event', label: 'Private Event' },
  { value: 'staff_unavailable', label: 'Staff Unavailable' },
  { value: 'weather', label: 'Weather' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'other', label: 'Other' },
];

export function BlockSessionModal({
  isOpen,
  onClose,
  onSubmit,
  activityId,
  selectedDate,
  selectedTime,
}: BlockSessionModalProps) {
  const [isFullDay, setIsFullDay] = useState(!selectedTime);
  const [date, setDate] = useState(selectedDate || '');
  const [startTime, setStartTime] = useState(selectedTime || '');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState<SessionBlockReason>('maintenance');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await onSubmit({
      activityId,
      date,
      startTime: isFullDay ? undefined : startTime,
      endTime: isFullDay ? undefined : endTime,
      isFullDay,
      reason,
      notes: notes || undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Block Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="fullDay">Block Full Day</Label>
            <Switch
              id="fullDay"
              checked={isFullDay}
              onCheckedChange={setIsFullDay}
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {!isFullDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required={!isFullDay}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as SessionBlockReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Blocking...' : 'Block Session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
