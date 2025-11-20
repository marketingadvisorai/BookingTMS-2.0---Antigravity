import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { 
  FileText, 
  Settings, 
  Eye, 
  Sparkles, 
  Plus, 
  X, 
  AlertCircle,
  Info,
  CheckCircle,
  Code,
  Type,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Save,
  QrCode,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface WaiverTemplateEditorProps {
  template: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
}

const TEMPLATE_TYPES = [
  { value: 'liability', label: 'Liability Waiver', icon: '⚖️' },
  { value: 'minor', label: 'Minor Consent', icon: '👶' },
  { value: 'photo', label: 'Photo/Video Release', icon: '📸' },
  { value: 'medical', label: 'Medical Disclosure', icon: '🏥' },
  { value: 'health', label: 'Health Screening', icon: '🩺' },
  { value: 'custom', label: 'Custom', icon: '✏️' },
];

const REQUIRED_FIELDS = [
  'Full Name',
  'Date of Birth',
  'Email',
  'Phone',
  'Address',
  'Emergency Contact',
  'Parent/Guardian Name',
  'Parent Email',
  'Parent Phone',
  'Medical Conditions',
  'Allergies',
  'Medications',
  'Signature',
  'Date'
];

export default function WaiverTemplateEditor({ template, isOpen, onClose, onSave }: WaiverTemplateEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const [formData, setFormData] = useState({
    id: template?.id || `TPL-${String(Date.now()).slice(-3)}`,
    name: template?.name || '',
    description: template?.description || '',
    type: template?.type || 'liability',
    content: template?.content || '',
    status: template?.status || 'draft',
    requiredFields: template?.requiredFields || ['Full Name', 'Email', 'Signature'],
    assignedGames: template?.assignedGames || [],
    createdDate: template?.createdDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    usageCount: template?.usageCount || 0,
    qrCodeEnabled: template?.qrCodeEnabled !== undefined ? template.qrCodeEnabled : true,
    qrCodeSettings: template?.qrCodeSettings || {
      includeInEmail: true,
      includeBookingLink: true,
      customMessage: 'Scan this QR code to complete your waiver'
    }
  });

  const [activeTab, setActiveTab] = useState('basic');

  const handleToggleField = (field: string) => {
    if (formData.requiredFields.includes(field)) {
      setFormData({
        ...formData,
        requiredFields: formData.requiredFields.filter(f => f !== field)
      });
    } else {
      setFormData({
        ...formData,
        requiredFields: [...formData.requiredFields, field]
      });
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <DialogTitle className={textClass}>
            {template ? 'Edit Waiver Template' : 'Create New Waiver Template'}
          </DialogTitle>
          <DialogDescription className={textMutedClass}>
            {template ? 'Update template details and content' : 'Create a new waiver template for your customers'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="content" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex-1">
              <Type className="w-4 h-4 mr-2" />
              Fields
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={textClass}>Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Liability Waiver"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className={textClass}>Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this waiver template"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className={textClass}>Template Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                      {TEMPLATE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={textClass}>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className={borderClass} />

              {/* QR Code Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <QrCode className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  <Label className={`text-base ${textClass}`}>QR Code Settings</Label>
                </div>

                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-2">
                    <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>QR Code for Waiver Forms</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                        When enabled, customers will receive a QR code in their booking confirmation email that links directly to this waiver form.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.qrCodeEnabled ? (isDark ? 'bg-emerald-500/20' : 'bg-green-100') : (isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100')}`}>
                      <QrCode className={`w-5 h-5 ${formData.qrCodeEnabled ? (isDark ? 'text-emerald-400' : 'text-green-600') : (isDark ? 'text-[#737373]' : 'text-gray-400')}`} />
                    </div>
                    <div>
                      <Label htmlFor="qr-enabled" className={`text-sm ${textClass} cursor-pointer`}>
                        Enable QR Code
                      </Label>
                      <p className={`text-xs ${textMutedClass}`}>
                        Include QR code in booking confirmation emails
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="qr-enabled"
                    checked={formData.qrCodeEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, qrCodeEnabled: checked })}
                  />
                </div>

                {formData.qrCodeEnabled && (
                  <div className="space-y-3 pl-4 border-l-2 border-blue-500">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${textMutedClass}`} />
                        <Label htmlFor="include-email" className={`text-sm ${textClass} cursor-pointer`}>
                          Include in Email
                        </Label>
                      </div>
                      <Switch
                        id="include-email"
                        checked={formData.qrCodeSettings.includeInEmail}
                        onCheckedChange={(checked) => setFormData({ 
                          ...formData, 
                          qrCodeSettings: { ...formData.qrCodeSettings, includeInEmail: checked }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qr-message" className={textClass}>Custom Message</Label>
                      <Input
                        id="qr-message"
                        value={formData.qrCodeSettings.customMessage}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          qrCodeSettings: { ...formData.qrCodeSettings, customMessage: e.target.value }
                        })}
                        placeholder="Scan this QR code to complete your waiver"
                        className="h-11"
                      />
                      <p className={`text-xs ${textMutedClass}`}>
                        This message will appear above the QR code in the email
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Waiver Content</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    Write the full text of your waiver. You can use {'{'}FIELD_NAME{'}'} placeholders for dynamic fields.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className={textClass}>Waiver Text</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the full waiver text here..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="cursor-pointer">
                {'{'}FULL_NAME{'}'}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                {'{'}EMAIL{'}'}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                {'{'}DATE{'}'}
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                {'{'}SIGNATURE{'}'}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4 mt-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Required Fields</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    Select which fields customers must fill out when signing this waiver
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REQUIRED_FIELDS.map((field) => (
                <div 
                  key={field}
                  className={`flex items-center justify-between p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}
                >
                  <Label htmlFor={`field-${field}`} className={`text-sm ${textClass} cursor-pointer`}>
                    {field}
                  </Label>
                  <Switch
                    id={`field-${field}`}
                    checked={formData.requiredFields.includes(field)}
                    onCheckedChange={() => handleToggleField(field)}
                  />
                </div>
              ))}
            </div>

            <Separator className={borderClass} />

            <div className="space-y-2">
              <Label className={textClass}>
                Selected Fields ({formData.requiredFields.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.requiredFields.map((field) => (
                  <Badge 
                    key={field}
                    className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0' : 'bg-blue-100 text-blue-700 border-0'}
                  >
                    {field}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => handleToggleField(field)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="h-11">
            Cancel
          </Button>
          <Button 
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={`h-11 ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
