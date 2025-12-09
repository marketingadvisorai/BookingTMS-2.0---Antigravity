/**
 * PublicErrorReportWidget - Public widget for customer error reporting
 * Can be embedded in any page or shown as a floating button
 * @module error-monitoring/components/PublicErrorReportWidget
 */

import React, { useState } from 'react';
import { Bug, X, Send, Loader2, MessageSquare, CheckCircle } from 'lucide-react';
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
import { userReportsService } from '../services';
import type { ReportType, Priority } from '../types';

interface PublicErrorReportWidgetProps {
  organizationId?: string;
  position?: 'bottom-right' | 'bottom-left';
  buttonLabel?: string;
}

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'bug', label: 'Bug / Something Broken' },
  { value: 'ui_issue', label: 'Display Problem' },
  { value: 'performance', label: 'Slow / Not Responding' },
  { value: 'other', label: 'Other Issue' },
];

export function PublicErrorReportWidget({
  organizationId,
  position = 'bottom-right',
  buttonLabel = 'Report Issue',
}: PublicErrorReportWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    reportType: 'bug' as ReportType,
    title: '',
    description: '',
    reporterEmail: '',
    reporterName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setIsSubmitting(true);
    try {
      const id = await userReportsService.submitReport(
        {
          ...formData,
          reporterType: 'customer',
          priority: 'medium' as Priority,
        },
        organizationId
      );

      if (id) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setFormData({
            reportType: 'bug',
            title: '',
            description: '',
            reporterEmail: '',
            reporterName: '',
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionClasses = position === 'bottom-right' 
    ? 'right-4 bottom-4' 
    : 'left-4 bottom-4';

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses} z-50 flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-105`}
      >
        <Bug className="h-4 w-4" />
        <span className="text-sm font-medium">{buttonLabel}</span>
      </button>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Report an Issue</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      {submitted ? (
        <div className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Report Submitted!
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Thank you for your feedback. We'll look into this issue.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Type of Issue</Label>
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
            <Label className="text-gray-700 dark:text-gray-300">Brief Description *</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="What went wrong?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Details *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Please describe what happened..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Your Name</Label>
              <Input
                value={formData.reporterName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, reporterName: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                type="email"
                value={formData.reporterEmail}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, reporterEmail: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Report
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Your feedback helps us improve. Page URL and browser info will be included.
          </p>
        </form>
      )}
    </div>
  );
}
