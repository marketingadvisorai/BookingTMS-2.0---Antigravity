import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { supabase } from '../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';

type WaiverTemplate = {
  id: string;
  name: string;
  description: string;
  type: string;
  content: string;
  status: 'active' | 'inactive' | 'draft';
  requiredFields: string[];
  assignedActivities: string[];
  createdDate: string;
  lastModified: string;
  usageCount: number;
};

const WAIVERS_STORAGE_KEY = 'admin_waivers';
const WAIVER_TEMPLATES_STORAGE_KEY = 'admin_waiver_templates';

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function normalizeToken(label: string) {
  return label.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

export default function WaiverForm() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const [template, setTemplate] = useState<WaiverTemplate | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const templateId = useMemo(() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || '';
  }, []);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // Try to load from Supabase first
        const { data, error } = await (supabase
          .from('waiver_templates') as any)
          .select('*')
          .eq('id', templateId)
          .single();

        if (error) {
          console.error('Supabase error loading template:', error);
          // Fallback to localStorage
          const raw = localStorage.getItem(WAIVER_TEMPLATES_STORAGE_KEY);
          const templates: WaiverTemplate[] = raw ? JSON.parse(raw) : [];
          const found = templates.find(t => t.id === templateId);
          if (found) {
            setTemplate(found);
            initializeForm(found);
          } else {
            setNotFound(true);
          }
          return;
        }

        if (data) {
          // Transform database template to UI format
          const dbTemplate: WaiverTemplate = {
            id: data.id,
            name: data.name,
            description: data.description || '',
            type: data.type,
            content: data.content,
            status: data.status as 'active' | 'inactive' | 'draft',
            requiredFields: Array.isArray(data.required_fields) ? data.required_fields : [],
            assignedActivities: Array.isArray(data.assigned_activities) ? data.assigned_activities : [],
            createdDate: data.created_at ? formatDisplayDate(new Date(data.created_at)) : '',
            lastModified: data.updated_at ? formatDisplayDate(new Date(data.updated_at)) : '',
            usageCount: data.usage_count || 0
          };
          setTemplate(dbTemplate);
          initializeForm(dbTemplate);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load template for WaiverForm', err);
        setNotFound(true);
      }
    };

    const initializeForm = (tmpl: WaiverTemplate) => {
      const initial: Record<string, string> = {};
      tmpl.requiredFields?.forEach(field => {
        initial[field] = '';
      });
      // Optional extras for record display
      initial['Booking ID'] = '';
      initial['Activity'] = '';
      setFormData(initial);
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const filledContent = useMemo(() => {
    if (!template) return '';
    if (!template.content) return '';
    // Build token mapping
    const mapping: Record<string, string> = {};
    Object.entries(formData).forEach(([label, value]) => {
      const token = normalizeToken(label);
      mapping[token] = value || '';
    });
    // Common auto tokens
    mapping['DATE'] = formatDisplayDate(new Date());
    mapping['SIGNATURE'] = formData['Signature'] || formData['Full Name'] || formData['Parent/Guardian Name'] || '';

    // Replace {TOKEN} occurrences
    return template.content.replace(/\{([A-Z0-9_]+)\}/g, (_m, t) => {
      return mapping[t] ?? `{${t}}`;
    });
  }, [template, formData]);

  const updateField = (label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const isTextAreaField = (label: string) => {
    const l = label.toLowerCase();
    return l.includes('medical') || l.includes('allergies') || l.includes('medications') || l.includes('symptom');
  };

  const inputTypeFor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('email')) return 'email';
    if (l.includes('phone')) return 'tel';
    if (l.includes('date')) return 'date';
    return 'text';
  };

  const getCustomerName = () => {
    return formData['Full Name'] || formData['Minor Name'] || formData['Parent/Guardian Name'] || 'Anonymous';
  };

  const getEmail = () => {
    return formData['Email'] || formData['Parent Email'] || '-';
  };

  const handleSubmit = async () => {
    if (!template) return;

    // Validate required fields
    const missing = (template.requiredFields || []).filter(f => !(formData[f] && formData[f].trim().length > 0));
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing.join(', ')}`);
      return;
    }
    if (!agree) {
      toast.error('Please accept the terms to proceed');
      return;
    }

    const now = new Date();
    const waiverCode = `WV-${String(now.getTime()).slice(-6)}`;

    try {
      // Create waiver record in Supabase
      const { data: waiverData, error: waiverError } = await (supabase
        .from('waivers') as any)
        .insert({
          waiver_code: waiverCode,
          template_id: template.id,
          participant_name: getCustomerName(),
          participant_email: getEmail(),
          participant_phone: formData['Phone'] || formData['Parent Phone'] || '',
          booking_id: formData['Booking ID'] || null,
          activity: formData['Activity'] || (template.assignedActivities?.[0] || 'Unknown'),
          status: 'signed',
          signed_at: now.toISOString(),
          waiver_content: filledContent,
          form_data: formData,
          is_minor: !!(formData['Minor Name'] || formData['Parent/Guardian Name']),
          attendee_name: getCustomerName(),
          attendee_email: getEmail(),
          attendee_phone: formData['Phone'] || formData['Parent Phone'] || '',
          check_in_status: 'pending'
        } as any)
        .select()
        .single();

      if (waiverError) {
        console.error('Supabase waiver error:', waiverError);
        throw waiverError;
      }

      // Increment usage count for template
      const { error: templateError } = await (supabase
        .from('waiver_templates') as any)
        .update({
          usage_count: (template.usageCount || 0) + 1,
          updated_at: now.toISOString()
        } as any)
        .eq('id', template.id);

      if (templateError) {
        console.error('Template update error:', templateError);
      }

      // Also save to localStorage as backup
      try {
        const newRecord = {
          id: waiverCode,
          customer: getCustomerName(),
          email: getEmail(),
          booking: formData['Booking ID'] || '-',
          activity: formData['Activity'] || (template.assignedActivities?.[0] || 'Unknown'),
          signedDate: formatDisplayDate(now),
          status: 'signed' as const,
          templateName: template.name,
          content: filledContent,
        };
        const rawWaivers = localStorage.getItem(WAIVERS_STORAGE_KEY);
        const waivers = rawWaivers ? JSON.parse(rawWaivers) : [];
        waivers.unshift(newRecord);
        localStorage.setItem(WAIVERS_STORAGE_KEY, JSON.stringify(waivers));
      } catch (localErr) {
        console.error('localStorage backup failed:', localErr);
      }

      toast.success('Waiver signed and saved to database!');
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to save waiver record', err);
      toast.error('Failed to save waiver. Please try again.');
    }
  };

  if (notFound) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto p-6">
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className={isDark ? 'text-red-400' : 'text-red-600'} />
                Waiver Template Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={textMutedClass}>The requested waiver template could not be located. Please check the link or contact the administrator.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card className={`${cardBgClass} border ${borderClass}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {template.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                  <User className="w-4 h-4" />
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Type</p>
                    <p className={textClass}>{template.type}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Created</p>
                    <p className={textClass}>{template.createdDate}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                  <Building2 className="w-4 h-4" />
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Assigned Activities</p>
                    <p className={textClass}>{template.assignedActivities?.length ? template.assignedActivities.join(', ') : 'None'}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <div>
                    <p className={`text-xs ${textMutedClass}`}>Status</p>
                    <p className={textClass}>{template.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {template.description && (
              <p className={textMutedClass}>{template.description}</p>
            )}

            {/* Required Fields Badges */}
            <div className="flex flex-wrap gap-2">
              {template.requiredFields?.map((f) => (
                <Badge key={f} variant="secondary" className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] border-0' : ''}>
                  {f}
                </Badge>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Dynamic Fields */}
            <div className="space-y-4">
              {template.requiredFields?.map((field) => (
                <div key={field} className="space-y-2">
                  <Label>{field}</Label>
                  {isTextAreaField(field) ? (
                    <Textarea
                      value={formData[field] || ''}
                      onChange={(e) => updateField(field, e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <Input
                      type={inputTypeFor(field)}
                      value={formData[field] || ''}
                      onChange={(e) => updateField(field, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {/* Optional extras for record context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Booking ID (optional)</Label>
                  <Input
                    value={formData['Booking ID'] || ''}
                    onChange={(e) => updateField('Booking ID', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Activity (optional)</Label>
                  <Input
                    value={formData['Activity'] || ''}
                    onChange={(e) => updateField('Activity', e.target.value)}
                  />
                </div>
              </div>

              {/* Agreement */}
              <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <div className="flex items-start gap-2">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="agree" className={textMutedClass}>
                    I confirm that the information provided is accurate and I agree to the terms outlined in this waiver.
                  </Label>
                </div>
              </div>

              {/* Content Preview */}
              <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <h3 className={`text-sm mb-2 ${textClass}`}>Waiver Content</h3>
                {template.content ? (
                  <pre className={`text-xs whitespace-pre-wrap ${textMutedClass}`}>{filledContent}</pre>
                ) : (
                  <p className={textMutedClass}>No template content provided.</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="h-11">Sign & Submit</Button>
                <Button variant="outline" className="h-11" onClick={() => setShowPreview(true)}>Preview</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Confirmation */}
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className={isDark ? 'text-emerald-400' : 'text-green-600'} />
                  Waiver Ready
                </DialogTitle>
                <DialogDescription>
                  The waiver information has been prepared. If you clicked Submit, it has been saved to records.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className={`flex items-center gap-2 ${textMutedClass}`}>
                  <User className="w-4 h-4" />
                  <span>{getCustomerName()}</span>
                </div>
                <div className={`flex items-center gap-2 ${textMutedClass}`}>
                  <Mail className="w-4 h-4" />
                  <span>{getEmail()}</span>
                </div>
                <div className={`flex items-center gap-2 ${textMutedClass}`}>
                  <Calendar className="w-4 h-4" />
                  <span>{formatDisplayDate(new Date())}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/waivers'}>Go to Admin</Button>
                <Button onClick={() => setShowPreview(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

