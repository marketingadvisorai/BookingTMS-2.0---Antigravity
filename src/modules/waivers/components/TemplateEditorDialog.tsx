/**
 * Template Editor Dialog
 * Create/edit waiver templates with form validation
 * @module waivers/components/TemplateEditorDialog
 */

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings, FileText, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import {
  WaiverTemplate,
  TEMPLATE_TYPES,
  REQUIRED_FIELD_OPTIONS,
  DEFAULT_TEMPLATE,
  TemplateStatus,
  TemplateType,
} from '../types';

interface TemplateEditorDialogProps {
  template?: WaiverTemplate | null;
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  onSave: (template: Partial<WaiverTemplate>) => Promise<void>;
}

export function TemplateEditorDialog({
  template,
  isOpen,
  isDark,
  onClose,
  onSave,
}: TemplateEditorDialogProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'liability' as TemplateType,
    content: '',
    status: 'draft' as TemplateStatus,
    requiredFields: ['Full Name', 'Email', 'Signature'] as string[],
    qrCodeEnabled: true,
    qrCodeSettings: { includeInEmail: true, includeBookingLink: true, customMessage: '' },
  });

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        description: template.description,
        type: template.type,
        content: template.content,
        status: template.status,
        requiredFields: template.requiredFields,
        qrCodeEnabled: template.qrCodeEnabled,
        qrCodeSettings: template.qrCodeSettings,
      });
    } else {
      setForm({
        name: '',
        description: '',
        type: 'liability',
        content: '',
        status: 'draft',
        requiredFields: ['Full Name', 'Email', 'Signature'],
        qrCodeEnabled: true,
        qrCodeSettings: { includeInEmail: true, includeBookingLink: true, customMessage: '' },
      });
    }
  }, [template, isOpen]);

  const toggleField = (field: string) => {
    setForm(prev => ({
      ...prev,
      requiredFields: prev.requiredFields.includes(field)
        ? prev.requiredFields.filter(f => f !== field)
        : [...prev.requiredFields, field],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList>
            <TabsTrigger value="basic"><Settings className="w-4 h-4 mr-2" />Basic</TabsTrigger>
            <TabsTrigger value="content"><FileText className="w-4 h-4 mr-2" />Content</TabsTrigger>
            <TabsTrigger value="settings"><QrCode className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={textClass}>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Template name"
                />
              </div>
              <div className="space-y-2">
                <Label className={textClass}>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TemplateType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                    {TEMPLATE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TemplateStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className={textClass}>Waiver Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Enter waiver text. Use {FIELD_NAME} for placeholders."
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className={textClass}>Required Fields ({form.requiredFields.length})</Label>
              <div className="grid grid-cols-3 gap-2">
                {REQUIRED_FIELD_OPTIONS.map(field => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.requiredFields.includes(field)}
                      onChange={() => toggleField(field)}
                      className="rounded"
                    />
                    <span className="text-sm">{field}</span>
                  </label>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label className={textClass}>Enable QR Code</Label>
                <p className="text-sm text-muted-foreground">Include QR in confirmation emails</p>
              </div>
              <Switch
                checked={form.qrCodeEnabled}
                onCheckedChange={(v) => setForm({ ...form, qrCodeEnabled: v })}
              />
            </div>
            {form.qrCodeEnabled && (
              <div className="space-y-2">
                <Label className={textClass}>Custom QR Message</Label>
                <Input
                  value={form.qrCodeSettings.customMessage}
                  onChange={(e) => setForm({
                    ...form,
                    qrCodeSettings: { ...form.qrCodeSettings, customMessage: e.target.value },
                  })}
                  placeholder="Scan to complete your waiver"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
