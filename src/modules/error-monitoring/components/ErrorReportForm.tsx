/**
 * ErrorReportForm - Form for submitting error reports
 * @module error-monitoring/components/ErrorReportForm
 */

import React, { useState } from 'react';
import { Bug, Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReportInput, ReportType, Priority, ReporterType } from '../types';

interface ErrorReportFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ReportInput) => Promise<string | null>;
  reporterType?: ReporterType;
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'performance', label: 'Performance Issue' },
  { value: 'ui_issue', label: 'UI/UX Issue' },
  { value: 'data_issue', label: 'Data Issue' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function ErrorReportForm({
  open,
  onClose,
  onSubmit,
  reporterType = 'org_owner',
}: ErrorReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ReportInput>>({
    reportType: 'bug',
    priority: 'medium',
    reporterType,
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      const result = await onSubmit(formData as ReportInput);
      if (result) {
        onClose();
        setFormData({
          reportType: 'bug',
          priority: 'medium',
          reporterType,
          title: '',
          description: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report an Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.reportType}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, reportType: v as ReportType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, priority: v as Priority }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Detailed description of what happened..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Steps to Reproduce (optional)</Label>
            <Textarea
              value={formData.stepsToReproduce}
              onChange={(e) =>
                setFormData((p) => ({ ...p, stepsToReproduce: e.target.value }))
              }
              placeholder="1. Go to...\n2. Click on...\n3. See error"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
