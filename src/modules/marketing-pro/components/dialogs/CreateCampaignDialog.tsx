/**
 * MarketingPro 1.1 - Create Campaign Dialog
 * @description Dialog for creating new email campaigns
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TARGET_AUDIENCES } from '../../constants';
import { toast } from 'sonner';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const handleCreate = () => {
    onOpenChange(false);
    toast.success('Email campaign created successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <DialogDescription>Design and schedule a new email marketing campaign</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input id="campaign-name" placeholder="e.g., Holiday Special 2025" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject-line">Email Subject Line</Label>
            <Input id="subject-line" placeholder="Don't miss out! 🎁 Special holiday offer inside" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-name">From Name</Label>
            <Input id="from-name" defaultValue="BookingTMS" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-template">Email Template</Label>
            <Select defaultValue="promotional">
              <SelectTrigger id="email-template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promotional">Promotional</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="custom">Custom Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-audience">Target Audience</Label>
            <Select defaultValue="all">
              <SelectTrigger id="target-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_AUDIENCES.map((audience) => (
                  <SelectItem key={audience.value} value={audience.value}>
                    {audience.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-type">Send Time</Label>
              <Select defaultValue="immediately">
                <SelectTrigger id="schedule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Send Immediately</SelectItem>
                  <SelectItem value="schedule">Schedule for Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Schedule Date & Time</Label>
              <Input id="schedule-date" type="datetime-local" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Save as Draft</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
            Create Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
