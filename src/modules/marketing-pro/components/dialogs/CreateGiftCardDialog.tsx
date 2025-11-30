/**
 * MarketingPro 1.1 - Create Gift Card Dialog
 * @description Dialog for creating new gift cards
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GIFT_CARD_AMOUNTS } from '../../constants';
import { toast } from 'sonner';

interface CreateGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGiftCardDialog({ open, onOpenChange }: CreateGiftCardDialogProps) {
  const handleCreate = () => {
    onOpenChange(false);
    toast.success('Gift card created successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Gift Card</DialogTitle>
          <DialogDescription>Generate a new gift card for a customer</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gc-amount">Gift Card Amount</Label>
              <Select defaultValue="50">
                <SelectTrigger id="gc-amount">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GIFT_CARD_AMOUNTS.map((amt) => (
                    <SelectItem key={amt.value} value={amt.value}>{amt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gc-expiry">Expiry Date</Label>
              <Input id="gc-expiry" type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient Email</Label>
            <Input id="recipient-email" type="email" placeholder="customer@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Recipient Name (Optional)</Label>
            <Input id="recipient-name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gc-message">Personal Message (Optional)</Label>
            <Textarea 
              id="gc-message" 
              placeholder="Happy Birthday! Enjoy an escape room adventure on us!" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="send-immediately" />
            <Label htmlFor="send-immediately" className="cursor-pointer">
              Send gift card email immediately
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreate}>
            Create Gift Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
