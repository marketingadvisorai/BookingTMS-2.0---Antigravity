'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Code, 
  Sparkles,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'engagement';
  subject: string;
  preheader: string;
  body: string;
  variables: string[];
  icon: any;
  description: string;
  isActive: boolean;
  lastModified: string;
}

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
}

export function EmailTemplateEditor({ template, onSave, onCancel }: EmailTemplateEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const bgSecondary = isDark ? 'bg-[#161616]' : 'bg-gray-50';
  const bgTertiary = isDark ? 'bg-[#1e1e1e]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';

  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate>(template);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    const isChanged = JSON.stringify(editedTemplate) !== JSON.stringify(template);
    setHasChanges(isChanged);
  }, [editedTemplate, template]);

  const handleSave = () => {
    onSave(editedTemplate);
  };

  const handleReset = () => {
    setEditedTemplate(template);
    toast.info('Changes reverted');
  };

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    setCopiedVariable(variable);
    toast.success('Variable copied to clipboard');
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  const insertVariable = (variable: string) => {
    const variableTag = `{{${variable}}}`;
    setEditedTemplate({
      ...editedTemplate,
      body: editedTemplate.body + variableTag
    });
    toast.success('Variable inserted');
  };

  // Render preview with sample data
  const renderPreview = () => {
    let previewBody = editedTemplate.body;
    const sampleData: Record<string, string> = {
      customerName: 'John Doe',
      escaperoomName: 'The Mystery Chamber',
      bookingDate: 'Saturday, November 9, 2025',
      bookingTime: '3:00 PM',
      duration: '60',
      playerCount: '6',
      bookingId: 'BK-2025-1234',
      businessName: 'Escape Masters',
      businessAddress: '123 Main Street, San Francisco, CA 94105',
      totalAmount: '180.00',
      paymentMethod: 'Credit Card',
      supportEmail: 'support@escapemasters.com',
      supportPhone: '+1 (555) 123-4567',
      ageRequirement: '12+',
      directionsLink: 'https://maps.google.com',
      referralCode: 'JOHN20',
      referralLink: 'https://escapemasters.com/ref/john20',
      referralCount: '3',
      creditsEarned: '60',
      availableBalance: '60',
      roomCount: '12',
      maxPlayers: '8',
      popularRoom1: 'The Heist',
      difficulty1: 'Hard',
      popularRoom2: 'Lost Temple',
      difficulty2: 'Medium',
      popularRoom3: 'Space Station',
      difficulty3: 'Easy',
      businessHours: 'Mon-Thu: 10am-10pm, Fri-Sun: 10am-12am',
      socialLinks: '@escapemasters',
      surveyLink: 'https://escapemasters.com/survey/1234',
      escapeStatus: 'Yes! You escaped with 3:47 remaining',
      completionTime: '56:13',
      teamName: 'The Code Breakers',
      googleReviewLink: 'https://google.com/review',
      facebookReviewLink: 'https://facebook.com/review',
      tripadvisorReviewLink: 'https://tripadvisor.com/review',
      cancellationDate: 'November 6, 2025',
      refundAmount: '180.00',
      refundProcessingTime: '3-5 business days',
      refundMethod: 'Original payment method',
      expectedRefundDate: 'November 14, 2025',
      cancellationPolicy: 'Full refund for cancellations 48+ hours in advance.',
      newRoomsLink: 'https://escapemasters.com/new-rooms',
      daysSinceLastVisit: '90',
      offerValidDays: '14',
      newFeature1: '🎮 New VR integration in select rooms',
      newFeature2: '📱 Mobile app for easier booking',
      newFeature3: '🏆 Leaderboard system launched',
      newRoom1: 'Cyber Heist 2099',
      newRoom1Description: 'Futuristic sci-fi adventure',
      newRoom2: 'Haunted Mansion',
      newRoom2Description: 'Spooky Victorian mystery',
      newRoom3: 'Pirate\'s Curse',
      newRoom3Description: 'Nautical treasure hunt',
      totalRoomsCompleted: '4',
      escapeRate: '75',
      fastestEscape: '47',
      roomsNotTried: '8'
    };

    // Replace all variables with sample data
    Object.keys(sampleData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewBody = previewBody.replace(regex, sampleData[key]);
    });

    return previewBody;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${cardBg} border ${borderColor}`}>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className={`text-xl ${textPrimary} mb-1`}>
                Edit Template: {template.name}
              </CardTitle>
              <p className={`text-sm ${textSecondary}`}>{template.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
                className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className={`w-full ${isDark ? 'bg-[#1e1e1e] border border-[#2a2a2a]' : 'bg-gray-100'}`}>
              <TabsTrigger value="edit" className="flex-1">
                <Code className="w-4 h-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6 mt-6">
              <Card className={`${cardBg} border ${borderColor}`}>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* Template Name */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>Template Name</Label>
                    <Input
                      value={editedTemplate.name}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>Description</Label>
                    <Input
                      value={editedTemplate.description}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, description: e.target.value })}
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  {/* Subject Line */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>Subject Line</Label>
                    <Input
                      value={editedTemplate.subject}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                      placeholder="Use {{variables}} for dynamic content"
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  {/* Preheader */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>
                      Preheader Text
                      <span className={`text-xs ${textSecondary} ml-2`}>(Shown in email preview)</span>
                    </Label>
                    <Input
                      value={editedTemplate.preheader}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, preheader: e.target.value })}
                      placeholder="Brief preview text"
                      className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  {/* Email Body */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>Email Body</Label>
                    <Textarea
                      value={editedTemplate.body}
                      onChange={(e) => setEditedTemplate({ ...editedTemplate, body: e.target.value })}
                      placeholder="Write your email content here. Use {{variables}} for dynamic content."
                      rows={20}
                      className={`resize-none font-mono text-sm ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}
                    />
                    <p className={`text-xs ${textSecondary}`}>
                      Tip: Use emojis and formatting to make your emails more engaging!
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${editedTemplate.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-medium ${textPrimary}`}>Template Status</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {editedTemplate.isActive ? 'Active - Will be sent to customers' : 'Inactive - Will not be sent'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditedTemplate({ ...editedTemplate, isActive: !editedTemplate.isActive })}
                    >
                      {editedTemplate.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card className={`${cardBg} border ${borderColor}`}>
                <CardHeader className="p-4 sm:p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900">
                        Preview Mode
                      </Badge>
                      <Badge variant="outline" className={isDark ? 'border-[#2a2a2a] text-gray-400' : 'border-gray-200 text-gray-600'}>
                        Sample Data
                      </Badge>
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>Subject</p>
                      <p className={`text-sm font-medium ${textPrimary}`}>
                        {editedTemplate.subject.replace(/{{(\w+)}}/g, (match, variable) => {
                          const sampleData: Record<string, string> = {
                            escaperoomName: 'The Mystery Chamber',
                            bookingDate: 'Saturday, November 9, 2025',
                            bookingTime: '3:00 PM'
                          };
                          return sampleData[variable] || match;
                        })}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>Preheader</p>
                      <p className={`text-sm ${textPrimary}`}>{editedTemplate.preheader}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className={`p-6 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} whitespace-pre-wrap text-sm ${textPrimary}`}>
                    {renderPreview()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Variables & Help */}
        <div className="space-y-6">
          {/* Available Variables */}
          <Card className={`${cardBg} border ${borderColor}`}>
            <CardHeader className="p-4">
              <CardTitle className={`text-sm ${textPrimary} flex items-center gap-2`}>
                <Sparkles className="w-4 h-4" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {editedTemplate.variables.map((variable, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between gap-2 p-2 rounded ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-100'} group transition-colors`}
                  >
                    <code className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'} flex-1 truncate`}>
                      {`{{${variable}}}`}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyVariable(variable)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2"
                    >
                      {copiedVariable === variable ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className={`${cardBg} border ${borderColor}`}>
            <CardHeader className="p-4">
              <CardTitle className={`text-sm ${textPrimary} flex items-center gap-2`}>
                <AlertCircle className="w-4 h-4" />
                Email Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className={`space-y-3 text-xs ${textSecondary}`}>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Keep subject lines under 50 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Use personalization variables like {'{{customerName}}'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Include clear call-to-action buttons</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Test with sample data before activating</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Use emojis sparingly for visual appeal</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Keep most important info above the fold</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className={`${cardBg} border ${borderColor}`}>
            <CardHeader className="p-4">
              <CardTitle className={`text-sm ${textPrimary}`}>Template Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex justify-between text-xs">
                <span className={textSecondary}>Subject Length</span>
                <span className={textPrimary}>{editedTemplate.subject.length} chars</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={textSecondary}>Body Length</span>
                <span className={textPrimary}>{editedTemplate.body.length} chars</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={textSecondary}>Variables Used</span>
                <span className={textPrimary}>{editedTemplate.variables.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={textSecondary}>Category</span>
                <Badge className={`text-xs ${
                  editedTemplate.category === 'transactional' 
                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                    : editedTemplate.category === 'marketing'
                    ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                    : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                }`}>
                  {editedTemplate.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
