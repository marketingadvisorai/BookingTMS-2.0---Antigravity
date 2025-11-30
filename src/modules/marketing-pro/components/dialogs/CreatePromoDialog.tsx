/**
 * MarketingPro 1.1 - Create Promotion Dialog
 * @description Dialog for creating new promotions
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface CreatePromoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePromoDialog({ open, onOpenChange }: CreatePromoDialogProps) {
  const handleCreate = () => {
    onOpenChange(false);
    toast.success('Promotion created successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
          <DialogDescription>Set up a new discount code or special offer</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Promo Code</Label>
              <Input id="promo-code" placeholder="e.g., SUMMER25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-type">Discount Type</Label>
              <Select defaultValue="percentage">
                <SelectTrigger id="discount-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount-value">Discount Value</Label>
              <Input id="discount-value" type="number" placeholder="e.g., 25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage-limit">Usage Limit</Label>
              <Input id="usage-limit" type="number" placeholder="e.g., 100 (leave empty for unlimited)" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid-from">Valid From</Label>
              <Input id="valid-from" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid-until">Valid Until</Label>
              <Input id="valid-until" type="date" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-purchase">Minimum Purchase ($)</Label>
              <Input id="min-purchase" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-discount">Maximum Discount ($)</Label>
              <Input id="max-discount" type="number" placeholder="No limit" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="activate-now" defaultChecked />
            <Label htmlFor="activate-now" className="cursor-pointer">Activate immediately</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
            Create Promotion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
