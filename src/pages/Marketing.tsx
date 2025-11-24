import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  Eye,
  Target,
  BarChart3,
  Copy,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  Gift,
  Percent,
  Star,
  Mail,
  Send,
  Download,
  Upload,
  MoreVertical,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  UserPlus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  Play,
  Pause,
  Facebook,
  CreditCard,
  Save,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useTheme } from '../components/layout/ThemeContext';
import { EmailTemplateEditor } from '../components/email/EmailTemplateEditor';

// Email Template Interface
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

// Default Email Templates
const getDefaultTemplates = (): EmailTemplate[] => [
  {
    id: 'booking-confirmation',
    name: 'Booking Confirmation',
    category: 'transactional',
    subject: '🎉 Confirmed! Your {{escaperoomName}} Adventure',
    preheader: 'Your adventure is confirmed!',
    body: 'Hi {{customerName}},\n\n🎊 Your booking is CONFIRMED!\n\n🎯 DETAILS\n🎮 Room: {{escaperoomName}}\n📅 Date: {{bookingDate}}\n⏰ Time: {{bookingTime}}\n👥 Players: {{playerCount}}\n🎫 ID: #{{bookingId}}',
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'playerCount', 'bookingId'],
    icon: CheckCircle,
    description: 'Sent after successful booking',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'booking-reminder',
    name: 'Booking Reminder (24hr)',
    category: 'transactional',
    subject: '⏰ Tomorrow! Your {{escaperoomName}} Adventure',
    preheader: 'Your adventure is tomorrow!',
    body: 'Hi {{customerName}},\n\n⏰ REMINDER: Your adventure is TOMORROW!\n\n📅 Date: {{bookingDate}}\n⏰ Time: {{bookingTime}}\n📍 Location: {{businessAddress}}',
    variables: ['customerName', 'escaperoomName', 'bookingDate', 'bookingTime', 'businessAddress'],
    icon: Clock,
    description: '24-hour booking reminder',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'digital-waiver',
    name: 'Digital Waiver Request',
    category: 'transactional',
    subject: '📝 Complete Your Waiver - {{escaperoomName}}',
    preheader: 'Quick waiver before your visit',
    body: 'Hi {{customerName}},\n\n📝 Please complete your digital waiver:\n{{waiverLink}}\n\n⏱️ Takes 2 minutes\n✅ Required before arrival',
    variables: ['customerName', 'escaperoomName', 'waiverLink'],
    icon: MessageSquare,
    description: 'Waiver completion request',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'referral-program',
    name: 'Referral Rewards Program',
    category: 'engagement',
    subject: '💰 Give $20, Get $20 - Share the Fun!',
    preheader: 'Earn rewards by sharing',
    body: 'Hi {{customerName}},\n\n💰 Share your referral code: {{referralCode}}\n\n🎁 They get $20 off\n💵 You earn $20 credit\n\nShare now: {{referralLink}}',
    variables: ['customerName', 'referralCode', 'referralLink'],
    icon: Gift,
    description: 'Referral program invitation',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email',
    category: 'engagement',
    subject: '👋 Welcome to {{businessName}}!',
    preheader: 'Start your adventure today',
    body: 'Hi {{customerName}},\n\n👋 Welcome to {{businessName}}!\n\n🎮 Explore our rooms\n🎁 Get 10% off first booking\nCode: WELCOME10',
    variables: ['customerName', 'businessName'],
    icon: UserPlus,
    description: 'New customer welcome',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'review-request',
    name: 'Review Request',
    category: 'engagement',
    subject: '⭐ How Was Your {{escaperoomName}} Experience?',
    preheader: 'Share your feedback',
    body: 'Hi {{customerName}},\n\n⭐ Please review your experience:\n\n📍 Google: {{googleReviewLink}}\n📘 Facebook: {{facebookReviewLink}}\n\n🎁 Get 20% off next booking (code: REVIEW20)',
    variables: ['customerName', 'escaperoomName', 'googleReviewLink', 'facebookReviewLink'],
    icon: Star,
    description: 'Post-visit review request',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'post-visit-survey',
    name: 'Post-Visit Survey',
    category: 'engagement',
    subject: '📊 Quick Survey + 15% OFF Your Next Visit',
    preheader: '2 minutes = 15% discount',
    body: 'Hi {{customerName}},\n\n📊 Take our 2-minute survey:\n{{surveyLink}}\n\n🎁 Get 15% OFF (code: SURVEY15)\n🏆 Enter prize draw',
    variables: ['customerName', 'surveyLink'],
    icon: MessageSquare,
    description: 'Feedback survey with incentive',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'cancellation-confirmation',
    name: 'Cancellation Confirmation',
    category: 'transactional',
    subject: 'Booking Cancelled - We Hope to See You Soon',
    preheader: 'Your cancellation has been processed',
    body: 'Hi {{customerName}},\n\n❌ CANCELLED\nBooking ID: #{{bookingId}}\n\n💰 Refund: ${{refundAmount}}\nExpected: {{expectedRefundDate}}\n\n🎯 Rebook with COMEBACK10 for 10% off',
    variables: ['customerName', 'bookingId', 'refundAmount', 'expectedRefundDate'],
    icon: XCircle,
    description: 'Cancellation confirmation',
    isActive: true,
    lastModified: new Date().toISOString()
  },
  {
    id: 'win-back-campaign',
    name: 'Win-Back Campaign',
    category: 'marketing',
    subject: 'We Miss You! Come Back for 25% Off 💙',
    preheader: 'Special offer just for you',
    body: 'Hi {{customerName}},\n\n💙 We miss you! It\'s been {{daysSinceLastVisit}} days.\n\n🎁 Come back for 25% OFF\nCode: WELCOME25\nValid: {{offerValidDays}} days\n\nBook now: {{bookingLink}}',
    variables: ['customerName', 'daysSinceLastVisit', 'offerValidDays', 'bookingLink'],
    icon: TrendingUp,
    description: 'Re-engage inactive customers',
    isActive: true,
    lastModified: new Date().toISOString()
  }
];

export function Marketing() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Semantic class variables
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const codeBgClass = isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100';
  
  const [showCreatePromoDialog, setShowCreatePromoDialog] = useState(false);
  const [showCreateGiftCardDialog, setShowCreateGiftCardDialog] = useState(false);
  const [showEmailCampaignDialog, setShowEmailCampaignDialog] = useState(false);
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [workflowStates, setWorkflowStates] = useState<Record<string, boolean>>({});
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('promotions');

  // Load email templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('emailTemplates');
    if (saved) {
      try {
        setEmailTemplates(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading templates:', error);
        setEmailTemplates(getDefaultTemplates());
      }
    } else {
      setEmailTemplates(getDefaultTemplates());
    }
    
    // Load workflow states
    const savedWorkflows = localStorage.getItem('workflowStates');
    if (savedWorkflows) {
      try {
        setWorkflowStates(JSON.parse(savedWorkflows));
      } catch (error) {
        console.error('Error loading workflows:', error);
      }
    }
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    const updatedTemplates = emailTemplates.map(t =>
      t.id === template.id ? { ...t, isActive: true } : t
    );
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    setEmailTemplates(updatedTemplates);
    toast.success(`"${template.name}" is now active and ready to use!`);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setTemplateToEdit(template);
    setShowEditTemplateDialog(true);
  };

  const handleSaveEditedTemplate = (editedTemplate: EmailTemplate) => {
    const updatedTemplates = emailTemplates.map(t =>
      t.id === editedTemplate.id ? { ...editedTemplate, lastModified: new Date().toISOString() } : t
    );
    localStorage.setItem('emailTemplates', JSON.stringify(updatedTemplates));
    setEmailTemplates(updatedTemplates);
    setShowEditTemplateDialog(false);
    setTemplateToEdit(null);
    toast.success(`\"${editedTemplate.name}\" has been updated successfully!`);
  };

  const handleCancelEdit = () => {
    setShowEditTemplateDialog(false);
    setTemplateToEdit(null);
  };

  const handleToggleWorkflow = (templateId: string, enabled: boolean) => {
    const newStates = { ...workflowStates, [templateId]: enabled };
    setWorkflowStates(newStates);
    localStorage.setItem('workflowStates', JSON.stringify(newStates));
    
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      toast.success(
        enabled 
          ? `"${template.name}" workflow activated!` 
          : `"${template.name}" workflow deactivated`
      );
    }
  };

  const handleCreateNewTemplate = () => {
    window.location.href = '/email-templates';
    toast.info('Opening Email Templates page to create new template...');
  };

  const handleCreateWorkflow = () => {
    setShowCreateWorkflowDialog(true);
  };

  // Get section info for better UX
  const getSectionInfo = () => {
    switch(activeTab) {
      case 'promotions':
        return { icon: Percent, title: 'Promotions', description: 'Manage discount codes and special offers', color: 'blue' };
      case 'gift-cards':
        return { icon: Gift, title: 'Gift Cards', description: 'Create and track gift card sales', color: 'pink' };
      case 'reviews':
        return { icon: Star, title: 'Review Management', description: 'Monitor and respond to customer feedback', color: 'yellow' };
      case 'email':
        return { icon: Mail, title: 'Email Campaigns', description: 'Send targeted marketing emails', color: 'purple' };
      case 'affiliate':
        return { icon: UserPlus, title: 'Affiliate Program', description: 'Manage affiliate partners and commissions', color: 'green' };
      default:
        return { icon: Percent, title: 'Promotions', description: 'Manage discount codes and special offers', color: 'blue' };
    }
  };

  const sectionInfo = getSectionInfo();
  const SectionIcon = sectionInfo.icon;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`mb-2 ${textClass}`}>Marketing</h1>
        <p className={textMutedClass}>Manage promotions, gift cards, reviews, emails, and affiliates</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        {/* Mobile: Dropdown Navigation */}
        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className={`w-full h-12 font-medium ${
              isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <SelectValue>
                <div className="flex items-center gap-2">
                  {activeTab === 'promotions' && <><Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" /><span>Promotions</span></>}
                  {activeTab === 'gift-cards' && <><Gift className="w-4 h-4 text-pink-600 dark:text-pink-400" /><span>Gift Cards</span></>}
                  {activeTab === 'reviews' && <><Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /><span>Review Management</span></>}
                  {activeTab === 'email' && <><Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" /><span>Email Campaigns</span></>}
                  {activeTab === 'affiliate' && <><UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" /><span>Affiliate Program</span></>}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promotions">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  <span>Promotions</span>
                </div>
              </SelectItem>
              <SelectItem value="gift-cards">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span>Gift Cards</span>
                </div>
              </SelectItem>
              <SelectItem value="reviews">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Review Management</span>
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Campaigns</span>
                </div>
              </SelectItem>
              <SelectItem value="affiliate">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Affiliate Program</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Horizontal Tabs */}
        <TabsList className={`hidden sm:flex w-full justify-start overflow-x-auto h-auto ${isDark ? 'bg-[#161616] border border-[#2a2a2a]' : ''}`}>
          <TabsTrigger value="promotions" className="gap-2">
            <Percent className="w-4 h-4" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="gift-cards" className="gap-2">
            <Gift className="w-4 h-4" />
            Gift Cards
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="w-4 h-4" />
            Review Management
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Affiliate Program
          </TabsTrigger>
        </TabsList>

        {/* Mobile: Section Header - Shows current section clearly */}
        <div className={`sm:hidden ${cardBgClass} border ${borderClass} rounded-lg p-4 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              sectionInfo.color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/20' :
              sectionInfo.color === 'pink' ? 'bg-pink-100 dark:bg-pink-500/20' :
              sectionInfo.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-500/20' :
              sectionInfo.color === 'purple' ? 'bg-purple-100 dark:bg-purple-500/20' :
              'bg-green-100 dark:bg-green-500/20'
            }`}>
              <SectionIcon className={`w-5 h-5 ${
                sectionInfo.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                sectionInfo.color === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                sectionInfo.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                sectionInfo.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                'text-green-600 dark:text-green-400'
              }`} />
            </div>
            <div className="flex-1">
              <h2 className={`text-base font-semibold ${textClass}`}>{sectionInfo.title}</h2>
              <p className={`text-xs ${textMutedClass}`}>{sectionInfo.description}</p>
            </div>
          </div>
        </div>

        {/* PROMOTIONS TAB */}
        <TabsContent value="promotions" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Active Promos</p>
                    <h3 className={`text-2xl ${textClass}`}>12</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+3 this month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <Percent className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Total Redemptions</p>
                    <h3 className={`text-2xl ${textClass}`}>1,234</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+18%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <Percent className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Revenue Impact</p>
                    <h3 className={`text-2xl ${textClass}`}>$8,450</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+25%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <DollarSign className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Avg Discount</p>
                    <h3 className={`text-2xl ${textClass}`}>15%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${textMutedClass}`}>Across all promos</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <BarChart3 className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Promotions List */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className={textClass}>Coupon Codes & Promotions</CardTitle>
                  <p className={`text-sm mt-1 ${textMutedClass}`}>Create and manage discount codes</p>
                </div>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={() => setShowCreatePromoDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Promotion
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                    <Input placeholder="Search promotions..." className="pl-10" />
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Promotions Table */}
                <div className={`border rounded-lg overflow-x-auto ${borderClass}`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className={`text-sm px-2 py-1 rounded ${codeBgClass} ${textClass}`}>SUMMER25</code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode('SUMMER25')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-700'}>Percentage</Badge>
                        </TableCell>
                        <TableCell className={textClass}>25% off</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className={textClass}>45</span>
                            <span className={textMutedClass}> / 100</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>Dec 31, 2025</TableCell>
                        <TableCell>
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className={`text-sm px-2 py-1 rounded ${codeBgClass} ${textClass}`}>FIRSTTIME10</code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode('FIRSTTIME10')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Fixed Amount</Badge>
                        </TableCell>
                        <TableCell className={textClass}>$10 off</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className={textClass}>12</span>
                            <span className={textMutedClass}> / 50</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>Jan 15, 2026</TableCell>
                        <TableCell>
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className={`text-sm px-2 py-1 rounded ${codeBgClass} ${textClass}`}>BLACKFRIDAY</code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode('BLACKFRIDAY')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-700'}>Percentage</Badge>
                        </TableCell>
                        <TableCell className={textClass}>50% off</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className={textClass}>200</span>
                            <span className={textMutedClass}> / 200</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>Nov 30, 2025</TableCell>
                        <TableCell>
                          <Badge className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>Paused</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Play className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GIFT CARDS TAB */}
        <TabsContent value="gift-cards" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Total Sold</p>
                    <h3 className={`text-2xl ${textClass}`}>487</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+12%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                    <Gift className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Active Balance</p>
                    <h3 className={`text-2xl ${textClass}`}>$12,340</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${textMutedClass}`}>Outstanding</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <DollarSign className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Redeemed</p>
                    <h3 className={`text-2xl ${textClass}`}>$8,920</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${textMutedClass}`}>This month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <CheckCircle2 className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Redemption Rate</p>
                    <h3 className={`text-2xl ${textClass}`}>68%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+5%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <BarChart3 className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gift Cards Management */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className={textClass}>Gift Cards</CardTitle>
                  <p className={`text-sm mt-1 ${textMutedClass}`}>Create and manage gift cards</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => toast.success('Bulk import dialog would open here')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Generate
                  </Button>
                  <Button 
                    style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    className={`${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} w-full sm:w-auto`}
                    onClick={() => setShowCreateGiftCardDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Gift Card
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                    <Input placeholder="Search gift cards..." className="pl-10" />
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Gift Cards Table */}
                <div className={`border rounded-lg overflow-x-auto ${borderClass}`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className={`text-sm px-2 py-1 rounded ${codeBgClass} ${textClass}`}>GC-ABC123XYZ</code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode('GC-ABC123XYZ')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className={textClass}>$100.00</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={textClass}>$75.00</span>
                            <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>75%</Badge>
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>john.doe@example.com</TableCell>
                        <TableCell>
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Active</Badge>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>Dec 31, 2025</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="w-4 h-4 mr-2" />
                                Resend Email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className={`text-sm px-2 py-1 rounded ${codeBgClass} ${textClass}`}>GC-DEF456UVW</code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode('GC-DEF456UVW')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className={textClass}>$50.00</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={textClass}>$50.00</span>
                            <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}`}>100%</Badge>
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>sarah.smith@example.com</TableCell>
                        <TableCell>
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Active</Badge>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>Mar 15, 2026</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="w-4 h-4 mr-2" />
                                Resend Email
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className={`text-sm px-2 py-1 rounded ${codeBgClass} ${textClass}`}>GC-GHI789RST</code>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyCode('GC-GHI789RST')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className={textClass}>$25.00</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`line-through ${isDark ? 'text-[#737373]' : 'text-gray-400'}`}>$25.00</span>
                            <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}`}>0%</Badge>
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>mike.jones@example.com</TableCell>
                        <TableCell>
                          <Badge className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>Redeemed</Badge>
                        </TableCell>
                        <TableCell className={`text-sm ${textMutedClass}`}>Jun 30, 2025</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="w-4 h-4 mr-2" />
                                Resend Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEW MANAGEMENT TAB */}
        <TabsContent value="reviews" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Average Rating</p>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-2xl ${textClass}`}>4.8</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className={`text-sm mt-2 ${textMutedClass}`}>1,234 reviews</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                    <Star className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>New Reviews</p>
                    <h3 className={`text-2xl ${textClass}`}>47</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+22% this month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <MessageSquare className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Response Rate</p>
                    <h3 className={`text-2xl ${textClass}`}>92%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${textMutedClass}`}>Within 24 hours</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <CheckCircle className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Positive Reviews</p>
                    <h3 className={`text-2xl ${textClass}`}>89%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <ThumbsUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>4-5 stars</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <ThumbsUp className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Management */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className={textClass}>Customer Reviews</CardTitle>
                  <p className={`text-sm mt-1 ${textMutedClass}`}>Monitor and respond to customer feedback</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    className={`${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} w-full sm:w-auto`}
                    onClick={() => toast.success('Review request sent!')}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Request Reviews
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filter Tabs */}
                <div className={`flex flex-wrap gap-2 border-b pb-3 ${borderClass}`}>
                  <Button variant="ghost" size="sm" className={`rounded-none border-b-2 ${isDark ? 'text-[#6366f1] border-[#4f46e5]' : 'text-blue-600 border-blue-600'}`}>
                    All (1,234)
                  </Button>
                  <Button variant="ghost" size="sm">
                    Pending Response (12)
                  </Button>
                  <Button variant="ghost" size="sm">
                    5 Stars (876)
                  </Button>
                  <Button variant="ghost" size="sm">
                    1-3 Stars (45)
                  </Button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {/* Review Item 1 */}
                  <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${borderClass}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                          <span className={`text-sm ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`}>JD</span>
                        </div>
                        <div>
                          <p className={`text-sm ${textClass}`}>John Doe</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className={`text-xs ${textMutedClass}`}>2 days ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-700'}`}>Google</Badge>
                        <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}`}>Verified</Badge>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${isDark ? 'text-[#d4d4d4]' : 'text-gray-700'}`}>
                      Amazing experience! The Mystery Manor room was so immersive and challenging. Our game master was fantastic and very helpful. Highly recommend!
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Reply
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ThumbsUp className="w-3 h-3 mr-2" />
                        Mark Helpful
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View on Google
                      </Button>
                    </div>
                  </div>

                  {/* Review Item 2 */}
                  <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${borderClass}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                          <span className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>SS</span>
                        </div>
                        <div>
                          <p className={`text-sm ${textClass}`}>Sarah Smith</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4].map((star) => (
                                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              <Star className={`w-3 h-3 ${isDark ? 'text-[#525252]' : 'text-gray-300'}`} />
                            </div>
                            <span className={`text-xs ${textMutedClass}`}>1 week ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>Facebook</Badge>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${isDark ? 'text-[#d4d4d4]' : 'text-gray-700'}`}>
                      Great escape room! Had a lot of fun with friends. The only downside was we had to wait 15 minutes past our booking time to start.
                    </p>
                    <div className={`p-3 mb-3 rounded border-l-4 ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]' : 'bg-blue-50 border-blue-600'}`}>
                      <div className="flex items-start gap-2">
                        <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                        <div>
                          <p className={`text-xs mb-1 ${textMutedClass}`}>Your Response:</p>
                          <p className={`text-sm ${textClass}`}>Thank you for the feedback, Sarah! We apologize for the delay. We've addressed this with our team to ensure better timing. Hope to see you again!</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>Responded 5 days ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" disabled>
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Responded
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View on Facebook
                      </Button>
                    </div>
                  </div>

                  {/* Review Item 3 */}
                  <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                          <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>MJ</span>
                        </div>
                        <div>
                          <p className={`text-sm ${textClass}`}>Mike Johnson</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2].map((star) => (
                                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                              {[1, 2, 3].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${isDark ? 'text-[#525252]' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className={`text-xs ${textMutedClass}`}>3 days ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-700'}`}>Yelp</Badge>
                        <Badge variant="secondary" className={`text-xs ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>Needs Response</Badge>
                      </div>
                    </div>
                    <p className={`text-sm mb-3 ${isDark ? 'text-[#d4d4d4]' : 'text-gray-700'}`}>
                      Disappointed with our experience. Some of the puzzles were broken and the room wasn't very clean. Expected better for the price.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button 
                        size="sm" 
                        style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                        className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                      >
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Respond Now
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        View on Yelp
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardHeader>
                <CardTitle className={textClass}>Connected Review Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`flex items-center justify-between p-3 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                      <Star className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>Google Reviews</p>
                      <p className={`text-xs ${textMutedClass}`}>876 reviews</p>
                    </div>
                  </div>
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Connected</Badge>
                </div>
                <div className={`flex items-center justify-between p-3 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                      <Facebook className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>Facebook Reviews</p>
                      <p className={`text-xs ${textMutedClass}`}>234 reviews</p>
                    </div>
                  </div>
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Connected</Badge>
                </div>
                <div className={`flex items-center justify-between p-3 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                      <Star className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>Yelp</p>
                      <p className={`text-xs ${textMutedClass}`}>124 reviews</p>
                    </div>
                  </div>
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Connected</Badge>
                </div>
                <div className={`flex items-center justify-between p-3 border rounded-lg ${borderClass}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                      <Star className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${textClass}`}>TripAdvisor</p>
                      <p className={`text-xs ${textMutedClass}`}>Not connected</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardHeader>
                <CardTitle className={textClass}>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = rating === 5 ? 72 : rating === 4 ? 17 : rating === 3 ? 8 : rating === 2 ? 2 : 1;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className={`text-sm ${textClass}`}>{rating}</span>
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className={`text-sm w-12 text-right ${textMutedClass}`}>{percentage}%</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EMAIL CAMPAIGNS TAB */}
        <TabsContent value="email" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Total Sent</p>
                    <h3 className={`text-2xl ${textClass}`}>45.2K</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${textMutedClass}`}>This month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <Mail className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Open Rate</p>
                    <h3 className={`text-2xl ${textClass}`}>34.5%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+4.2%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <Eye className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Click Rate</p>
                    <h3 className={`text-2xl ${textClass}`}>12.8%</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+2.1%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <MousePointerClick className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Conversions</p>
                    <h3 className={`text-2xl ${textClass}`}>234</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+15%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <Target className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Campaigns */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className={textClass}>Email Campaigns</CardTitle>
                  <p className={`text-sm mt-1 ${textMutedClass}`}>Create and send email marketing campaigns</p>
                </div>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={`${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} w-full sm:w-auto`}
                  onClick={() => setShowEmailCampaignDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Campaign List */}
                <div className="space-y-3">
                  {/* Campaign Item 1 */}
                  <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${borderClass}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`text-sm ${textClass}`}>Summer Special - 25% Off Weekend Bookings</h4>
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Sent</Badge>
                        </div>
                        <p className={`text-xs mb-2 ${textMutedClass}`}>Sent to 12,450 subscribers on Nov 15, 2025</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Delivered</p>
                            <p className={`text-sm ${textClass}`}>12,234</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Opened</p>
                            <p className={`text-sm ${textClass}`}>4,123 (33.7%)</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Clicked</p>
                            <p className={`text-sm ${textClass}`}>1,567 (12.8%)</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Conversions</p>
                            <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>89 bookings</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Campaign Item 2 */}
                  <div className={`p-4 border rounded-lg ${isDark ? 'border-[#4f46e5]/30 bg-[#4f46e5]/10' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`text-sm ${textClass}`}>Black Friday Mega Sale - 50% Off All Rooms</h4>
                          <Badge className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-700'}>Scheduled</Badge>
                        </div>
                        <p className={`text-xs mb-2 ${textMutedClass}`}>Scheduled for Nov 24, 2025 at 9:00 AM</p>
                        <p className={`text-xs ${textMutedClass}`}>Target audience: 15,234 subscribers</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="w-4 h-4 mr-2" />
                            Send Test
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Campaign Item 3 */}
                  <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${borderClass}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`text-sm ${textClass}`}>Weekly Newsletter - New Mystery Manor Update</h4>
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>Sent</Badge>
                        </div>
                        <p className={`text-xs mb-2 ${textMutedClass}`}>Sent to 13,120 subscribers on Nov 8, 2025</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Delivered</p>
                            <p className={`text-sm ${textClass}`}>12,987</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Opened</p>
                            <p className={`text-sm ${textClass}`}>4,567 (35.2%)</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Clicked</p>
                            <p className={`text-sm ${textClass}`}>1,789 (13.8%)</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMutedClass}`}>Conversions</p>
                            <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>67 bookings</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Templates & Automation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardHeader>
                <CardTitle className={textClass}>Email Templates</CardTitle>
                <p className={`text-sm ${textMutedClass}`}>Pre-built email templates ({emailTemplates.length} available)</p>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {emailTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div key={template.id} className={`flex items-center justify-between p-3 border rounded-lg ${borderClass} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'} transition-colors`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${textClass} truncate`}>{template.name}</span>
                            {template.isActive && (
                              <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className={`text-xs ${textMutedClass} truncate`}>{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handlePreviewTemplate(template)}
                          className="h-8 px-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditTemplate(template)}
                          className="h-8 px-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleUseTemplate(template)}
                          disabled={template.isActive}
                          className={`h-8 ${isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} ${template.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {template.isActive ? 'In Use' : 'Use'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className={textClass}>Automated Workflows</CardTitle>
                    <p className={`text-sm ${textMutedClass} mt-1`}>
                      Enable/disable email automation ({emailTemplates.length} templates available)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCreateNewTemplate}
                      className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Template
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateWorkflow}
                      className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New Workflow
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
                {emailTemplates.length === 0 ? (
                  <div className={`text-center py-8 ${textMutedClass}`}>
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No email templates available</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCreateNewTemplate}
                      className="mt-3"
                    >
                      Create Your First Template
                    </Button>
                  </div>
                ) : (
                  emailTemplates.map((template) => {
                    const Icon = template.icon;
                    const isEnabled = workflowStates[template.id] ?? false;
                    
                    return (
                      <div 
                        key={template.id} 
                        className={`flex items-center justify-between p-3 border rounded-lg transition-all ${borderClass} ${
                          isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'
                        } ${isEnabled ? (isDark ? 'bg-emerald-900/10 border-emerald-800/40' : 'bg-green-50 border-green-200') : ''}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isEnabled 
                              ? (isDark ? 'bg-emerald-500/20' : 'bg-green-100')
                              : (isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100')
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              isEnabled
                                ? (isDark ? 'text-emerald-400' : 'text-green-600')
                                : (isDark ? 'text-[#a3a3a3]' : 'text-gray-600')
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm truncate ${textClass}`}>{template.name}</p>
                              {isEnabled && (
                                <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800">
                                  Active
                                </Badge>
                              )}
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  template.category === 'transactional'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                                    : template.category === 'marketing'
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-800'
                                    : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-800'
                                }`}
                              >
                                {template.category}
                              </Badge>
                            </div>
                            <p className={`text-xs ${textMutedClass} truncate mt-0.5`}>
                              {template.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreviewTemplate(template)}
                            className={`h-8 px-2 ${isDark ? 'hover:bg-[#1e1e1e] text-white' : 'hover:bg-gray-100'}`}
                            title="Preview template"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTemplate(template)}
                            className={`h-8 px-2 ${isDark ? 'hover:bg-[#1e1e1e] text-white' : 'hover:bg-gray-100'}`}
                            title="Edit template"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleToggleWorkflow(template.id, checked)}
                            className={isEnabled ? 'data-[state=checked]:bg-green-600' : ''}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AFFILIATE PROGRAM TAB */}
        <TabsContent value="affiliate" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Active Affiliates</p>
                    <h3 className={`text-2xl ${textClass}`}>34</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+8 this month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <UserPlus className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Total Referrals</p>
                    <h3 className={`text-2xl ${textClass}`}>234</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+18%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                    <Users className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Revenue Generated</p>
                    <h3 className={`text-2xl ${textClass}`}>$15,670</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>+22%</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <DollarSign className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${textMutedClass}`}>Commissions Paid</p>
                    <h3 className={`text-2xl ${textClass}`}>$2,350</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className={`text-sm ${textMutedClass}`}>15% avg commission</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                    <CreditCard className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Affiliate Program Settings */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <CardTitle className={textClass}>Affiliate Program Settings</CardTitle>
              <p className={`text-sm ${textMutedClass}`}>Configure your affiliate program</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="commission-rate">Default Commission Rate</Label>
                  <div className="flex gap-2">
                    <Input id="commission-rate" type="number" defaultValue="15" className="flex-1" />
                    <span className={`flex items-center px-3 border rounded-md ${borderClass} ${bgElevatedClass} ${textMutedClass}`}>%</span>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>Percentage of booking value paid to affiliates</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookie-duration">Cookie Duration</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="cookie-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs ${textMutedClass}`}>How long to track referrals</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout</Label>
                  <div className="flex gap-2">
                    <span className={`flex items-center px-3 border rounded-md ${borderClass} ${bgElevatedClass} ${textMutedClass}`}>$</span>
                    <Input id="min-payout" type="number" defaultValue="50" className="flex-1" />
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>Minimum earnings before payout</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">Payout Schedule</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger id="payout-schedule">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className={`text-xs ${textMutedClass}`}>How often to process payouts</p>
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2">
                  <Switch checked={true} />
                  <div>
                    <p className={`text-sm ${textClass}`}>Auto-approve Affiliates</p>
                    <p className={`text-xs ${textMutedClass}`}>Automatically approve new affiliate applications</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" className="w-full sm:w-auto">Reset to Defaults</Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={`${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} w-full sm:w-auto`}
                  onClick={handleSaveSettings}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Affiliates List */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className={textClass}>Affiliate Partners</CardTitle>
                  <p className={`text-sm mt-1 ${textMutedClass}`}>Manage your affiliate relationships</p>
                </div>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={`${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'} w-full sm:w-auto`}
                  onClick={() => setShowAffiliateDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Affiliate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                    <Input placeholder="Search affiliates..." className="pl-10" />
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Affiliates Table */}
                <div className={`border rounded-lg overflow-x-auto ${borderClass}`}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">Sarah's Blog</p>
                            <p className="text-xs text-gray-600">sarah@escapeblog.com</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-gray-900">89</span>
                            <span className="text-gray-600"> bookings</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">$6,720</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">$1,008</span>
                            <span className="text-gray-600"> (15%)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Commission
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Process Payout
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">Adventure Seekers</p>
                            <p className="text-xs text-gray-600">team@adventureseekers.com</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-gray-900">67</span>
                            <span className="text-gray-600"> bookings</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">$5,140</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">$771</span>
                            <span className="text-gray-600"> (15%)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Commission
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Process Payout
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">Local Events Guide</p>
                            <p className="text-xs text-gray-600">info@localevents.com</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-gray-900">45</span>
                            <span className="text-gray-600"> bookings</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">$3,450</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">$517</span>
                            <span className="text-gray-600"> (15%)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Commission
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Process Payout
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Promotion Dialog */}
      <Dialog open={showCreatePromoDialog} onOpenChange={setShowCreatePromoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
            <DialogDescription>Set up a new discount code or promotional campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="promo-code">Promotion Code</Label>
                <Input id="promo-code" placeholder="e.g., SUMMER25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-type">Discount Type</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger id="promo-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free-shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-value">Discount Value</Label>
                <Input id="discount-value" type="number" placeholder="25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage-limit">Usage Limit</Label>
                <Input id="usage-limit" type="number" placeholder="100" />
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
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" placeholder="Summer sale - 25% off all weekend bookings" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePromoDialog(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowCreatePromoDialog(false);
                toast.success('Promotion created successfully!');
              }}
            >
              Create Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Gift Card Dialog */}
      <Dialog open={showCreateGiftCardDialog} onOpenChange={setShowCreateGiftCardDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Gift Card</DialogTitle>
            <DialogDescription>Generate a new gift card for your customers</DialogDescription>
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
                    <SelectItem value="25">$25</SelectItem>
                    <SelectItem value="50">$50</SelectItem>
                    <SelectItem value="100">$100</SelectItem>
                    <SelectItem value="150">$150</SelectItem>
                    <SelectItem value="custom">Custom Amount</SelectItem>
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
              <Textarea id="gc-message" placeholder="Happy Birthday! Enjoy an escape room adventure on us!" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="send-immediately" />
              <Label htmlFor="send-immediately" className="cursor-pointer">Send gift card email immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateGiftCardDialog(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowCreateGiftCardDialog(false);
                toast.success('Gift card created successfully!');
              }}
            >
              Create Gift Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Email Campaign Dialog */}
      <Dialog open={showEmailCampaignDialog} onOpenChange={setShowEmailCampaignDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>Design and schedule a new email marketing campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input id="campaign-name" placeholder="e.g., Holiday Special 2025" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-line">Email Subject Line</Label>
              <Input id="subject-line" placeholder="Don't miss out! 🎁 Special holiday offer inside" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input id="from-name" defaultValue="BookingTMS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-template">Email Template</Label>
              <Select defaultValue="promotional">
                <SelectTrigger id="email-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="custom">Custom Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Select defaultValue="all">
                <SelectTrigger id="target-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscribers</SelectItem>
                  <SelectItem value="active">Active Customers</SelectItem>
                  <SelectItem value="inactive">Inactive Customers</SelectItem>
                  <SelectItem value="new">New Subscribers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-type">Send Time</Label>
                <Select defaultValue="immediately">
                  <SelectTrigger id="schedule-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Send Immediately</SelectItem>
                    <SelectItem value="schedule">Schedule for Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Schedule Date & Time</Label>
                <Input id="schedule-date" type="datetime-local" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailCampaignDialog(false)}>Save as Draft</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowEmailCampaignDialog(false);
                toast.success('Email campaign created successfully!');
              }}
            >
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Affiliate Dialog */}
      <Dialog open={showAffiliateDialog} onOpenChange={setShowAffiliateDialog}>
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
                <Label htmlFor="commission-rate-custom">Commission Rate (%)</Label>
                <Input id="commission-rate-custom" type="number" defaultValue="15" />
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
              <Textarea id="affiliate-notes" placeholder="Additional information about this affiliate..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="auto-approve-affiliate" defaultChecked />
              <Label htmlFor="auto-approve-affiliate" className="cursor-pointer">Activate immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAffiliateDialog(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowAffiliateDialog(false);
                toast.success('Affiliate added successfully!');
              }}
            >
              Add Affiliate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Template Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className={`max-w-3xl max-h-[90vh] ${cardBgClass} border ${borderClass}`}>
          <DialogHeader className={`border-b pb-4 ${borderClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedTemplate && (
                  <>
                    <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'} flex items-center justify-center`}>
                      {(() => {
                        const Icon = selectedTemplate.icon;
                        return <Icon className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle className={textClass}>{selectedTemplate.name}</DialogTitle>
                      <DialogDescription className={textMutedClass}>
                        {selectedTemplate.description}
                      </DialogDescription>
                    </div>
                  </>
                )}
              </div>
              <Badge className={`${selectedTemplate?.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                {selectedTemplate?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 p-6">
              {/* Category Badge */}
              <div>
                <Label className={`text-xs ${textMutedClass} uppercase tracking-wide mb-2 block`}>Category</Label>
                <Badge className={`${
                  selectedTemplate?.category === 'transactional' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                    : selectedTemplate?.category === 'marketing'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-800'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800'
                }`}>
                  {selectedTemplate?.category}
                </Badge>
              </div>

              {/* Subject Line */}
              <div>
                <Label className={`text-sm ${textMutedClass} mb-2 block`}>Subject Line</Label>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass}`}>
                  <p className={`text-sm ${textClass}`}>{selectedTemplate?.subject}</p>
                </div>
              </div>

              {/* Preheader */}
              <div>
                <Label className={`text-sm ${textMutedClass} mb-2 block`}>Preheader Text</Label>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass}`}>
                  <p className={`text-sm ${textClass}`}>{selectedTemplate?.preheader}</p>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <Label className={`text-sm ${textMutedClass} mb-2 block`}>Email Body</Label>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} border ${borderClass}`}>
                  <pre className={`text-sm ${textClass} whitespace-pre-wrap font-sans`}>
                    {selectedTemplate?.body}
                  </pre>
                </div>
              </div>

              {/* Dynamic Variables */}
              <div>
                <Label className={`text-sm ${textMutedClass} mb-2 block`}>
                  Dynamic Variables ({selectedTemplate?.variables.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate?.variables.map((variable, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-xs ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Last Modified */}
              <div>
                <Label className={`text-xs ${textMutedClass} block`}>
                  Last modified: {selectedTemplate && new Date(selectedTemplate.lastModified).toLocaleString()}
                </Label>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className={`border-t pt-4 ${borderClass}`}>
            <Button 
              variant="outline" 
              onClick={() => setShowTemplatePreview(false)}
              className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
            >
              Close
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                if (selectedTemplate) {
                  handleEditTemplate(selectedTemplate);
                  setShowTemplatePreview(false);
                }
              }}
              className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Template
            </Button>
            {selectedTemplate && !selectedTemplate.isActive && (
              <Button 
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setShowTemplatePreview(false);
                }}
                className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              >
                Use Template
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateWorkflowDialog} onOpenChange={setShowCreateWorkflowDialog}>
        <DialogContent className={`max-w-2xl ${cardBgClass} border ${borderClass}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Create New Automated Workflow</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Set up automated email sequences based on triggers and conditions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Workflow Name */}
            <div className="space-y-2">
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Workflow Name
              </Label>
              <Input
                placeholder="e.g., Post-Booking Follow-up Series"
                className={`h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>

            {/* Trigger Event */}
            <div className="space-y-2">
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Trigger Event
              </Label>
              <Select defaultValue="booking-confirmed">
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}>
                  <SelectItem value="booking-confirmed">Booking Confirmed</SelectItem>
                  <SelectItem value="booking-cancelled">Booking Cancelled</SelectItem>
                  <SelectItem value="customer-signup">New Customer Signup</SelectItem>
                  <SelectItem value="visit-completed">Visit Completed</SelectItem>
                  <SelectItem value="abandoned-cart">Cart Abandoned</SelectItem>
                  <SelectItem value="payment-received">Payment Received</SelectItem>
                  <SelectItem value="review-requested">Review Requested</SelectItem>
                  <SelectItem value="custom-date">Custom Date/Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Template Selection */}
            <div className="space-y-2">
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Template
              </Label>
              <Select>
                <SelectTrigger className={`h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                  <SelectValue placeholder="Select an email template" />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delay Settings */}
            <div className="space-y-2">
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Send Delay
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="0"
                  defaultValue="0"
                  min="0"
                  className={`h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
                <Select defaultValue="minutes">
                  <SelectTrigger className={`h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white' : 'bg-gray-100 border-gray-300'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className={`text-xs ${textMutedClass}`}>
                Email will be sent after this delay from the trigger event
              </p>
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <Label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Conditions (Optional)
              </Label>
              <Textarea
                placeholder="e.g., Only send if booking value > $100"
                rows={3}
                className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder:text-gray-500' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>

            {/* Active Toggle */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
              <div>
                <Label className={`text-sm ${textClass}`}>Activate Immediately</Label>
                <p className={`text-xs ${textMutedClass} mt-1`}>Start sending emails as soon as workflow is created</p>
              </div>
              <Switch defaultChecked />
            </div>

            {/* Workflow Preview */}
            <div className={`p-4 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1e1e1e]' : 'bg-blue-50'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'} flex items-center justify-center flex-shrink-0`}>
                  <Send className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${textClass}`}>Workflow Preview</p>
                  <p className={`text-xs ${textMutedClass} mt-1`}>
                    When <strong>booking is confirmed</strong>, send <strong>selected template</strong> after <strong>0 minutes</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className={`border-t pt-4 ${borderClass}`}>
            <Button
              variant="outline"
              onClick={() => setShowCreateWorkflowDialog(false)}
              className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCreateWorkflowDialog(false);
                toast.success('Workflow created successfully! Enable it in the list to activate.');
              }}
              className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={showEditTemplateDialog} onOpenChange={setShowEditTemplateDialog}>
        <DialogContent 
          className={`max-w-7xl max-h-[90vh] overflow-y-auto p-0 ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Customize the email template content, subject, and settings
            </DialogDescription>
          </DialogHeader>
          {templateToEdit && (
            <EmailTemplateEditor
              template={templateToEdit}
              onSave={handleSaveEditedTemplate}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
