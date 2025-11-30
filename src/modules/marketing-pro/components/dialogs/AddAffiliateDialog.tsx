/**
 * MarketingPro 1.1 - Add Affiliate Dialog
 * @description Dialog for adding new affiliate partners
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AddAffiliateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAffiliateDialog({ open, onOpenChange }: AddAffiliateDialogProps) {
  const handleCreate = () => {
    onOpenChange(false);
    toast.success('Affiliate added successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Affiliate</DialogTitle>
          <DialogDescription>Register a new affiliate partner</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="affiliate-name">Affiliate Name</Label>
              <Input id="affiliate-name" placeholder="Business or Person Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliate-email">Email Address</Label>
              <Input id="affiliate-email" type="email" placeholder="partner@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission-rate">Commission Rate (%)</Label>
              <Input id="commission-rate" type="number" defaultValue="15" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliate-code">Custom Referral Code</Label>
              <Input id="affiliate-code" placeholder="Auto-generated if empty" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="affiliate-website">Website (Optional)</Label>
            <Input id="affiliate-website" type="url" placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="affiliate-notes">Notes (Optional)</Label>
            <Textarea 
              id="affiliate-notes" 
              placeholder="Additional information about this affiliate..." 
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="auto-approve-affiliate" defaultChecked />
            <Label htmlFor="auto-approve-affiliate" className="cursor-pointer">
              Activate immediately
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
            Add Affiliate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
