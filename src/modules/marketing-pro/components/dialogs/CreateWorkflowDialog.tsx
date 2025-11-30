/**
 * MarketingPro 1.1 - Create Workflow Dialog
 * @description Dialog for creating new email automation workflows
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
import { CheckCircle, Send } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../../utils/theme';
import { WORKFLOW_TRIGGERS } from '../../constants';
import type { EmailTemplate } from '../../types';
import { toast } from 'sonner';

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: EmailTemplate[];
}

export function CreateWorkflowDialog({ open, onOpenChange, templates }: CreateWorkflowDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  const handleCreate = () => {
    onOpenChange(false);
    toast.success('Workflow created successfully! Enable it in the list to activate.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl ${classes.cardBg} border ${classes.border}`}>
        <DialogHeader>
          <DialogTitle className={classes.text}>Create New Automated Workflow</DialogTitle>
          <DialogDescription className={classes.textMuted}>
            Set up automated email sequences based on triggers and conditions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className={classes.text}>Workflow Name</Label>
            <Input placeholder="e.g., Post-Booking Follow-up Series" />
          </div>

          <div className="space-y-2">
            <Label className={classes.text}>Trigger Event</Label>
            <Select defaultValue="booking-confirmed">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORKFLOW_TRIGGERS.map((trigger) => (
                  <SelectItem key={trigger.value} value={trigger.value}>
                    {trigger.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={classes.text}>Email Template</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select an email template" /></SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={classes.text}>Send Delay</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="0" defaultValue="0" min="0" />
              <Select defaultValue="minutes">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className={`text-xs ${classes.textMuted}`}>
              Email will be sent after this delay from the trigger event
            </p>
          </div>

          <div className="space-y-2">
            <Label className={classes.text}>Conditions (Optional)</Label>
            <Textarea placeholder="e.g., Only send if booking value > $100" rows={2} />
          </div>

          <div className={`flex items-center justify-between p-4 rounded-lg border ${classes.border} ${classes.bgElevated}`}>
            <div>
              <Label className={classes.text}>Activate Immediately</Label>
              <p className={`text-xs ${classes.textMuted} mt-1`}>
                Start sending emails as soon as workflow is created
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className={`p-4 rounded-lg border ${classes.border} ${isDark ? 'bg-[#4f46e5]/10' : 'bg-blue-50'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'} flex items-center justify-center flex-shrink-0`}>
                <Send className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${classes.text}`}>Workflow Preview</p>
                <p className={`text-xs ${classes.textMuted} mt-1`}>
                  When <strong>booking is confirmed</strong>, send <strong>selected template</strong> after <strong>0 minutes</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className={`border-t pt-4 ${classes.border}`}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className={classes.primaryBtn}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
