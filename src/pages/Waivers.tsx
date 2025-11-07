import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useTheme } from '../components/layout/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Plus, 
  MoreVertical, 
  FileText, 
  Download, 
  Eye, 
  Edit2, 
  Copy, 
  Trash2, 
  Send,
  CheckSquare,
  XSquare,
  Clock,
  Settings,
  Sparkles,
  AlertCircle,
  FileCheck,
  FilePlus,
  Calendar,
  Mail,
  Users,
  Globe,
  QrCode,
  ExternalLink,
  UserPlus,
  Baby,
  Award,
  List,
  Scan,
  Search,
  Filter,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import WaiverTemplateEditor from '../components/waivers/WaiverTemplateEditor';
import WaiverPreview from '../components/waivers/WaiverPreview';
import AttendeeListDialog from '../components/waivers/AttendeeListDialog';
import ScanWaiverDialog from '../components/waivers/ScanWaiverDialog';
import { PageHeader } from '../components/layout/PageHeader';

const waiversData = [
  {
    id: 'WV-1001',
    customer: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    booking: 'BK-1001',
    game: 'Mystery Manor',
    signedDate: 'Oct 29, 2025',
    status: 'signed',
    templateName: 'Standard Liability Waiver',
  },
  {
    id: 'WV-1002',
    customer: 'Mike Chen',
    email: 'mike.c@email.com',
    booking: 'BK-1002',
    game: 'Space Odyssey',
    signedDate: 'Oct 29, 2025',
    status: 'signed',
    templateName: 'Standard Liability Waiver',
  },
  {
    id: 'WV-1003',
    customer: 'Emily Davis',
    email: 'emily.d@email.com',
    booking: 'BK-1003',
    game: 'Zombie Outbreak',
    signedDate: 'Oct 28, 2025',
    status: 'signed',
    templateName: 'Standard Liability Waiver',
  },
  {
    id: 'WV-1004',
    customer: 'Alex Thompson',
    email: 'alex.t@email.com',
    booking: 'BK-1004',
    game: 'Treasure Hunt',
    signedDate: 'Oct 28, 2025',
    status: 'signed',
    templateName: 'Minor Participant Waiver',
  },
  {
    id: 'WV-1005',
    customer: 'David Kim',
    email: 'david.k@email.com',
    booking: 'BK-1006',
    game: 'Prison Break',
    signedDate: '-',
    status: 'pending',
    templateName: 'Standard Liability Waiver',
  },
  {
    id: 'WV-1006',
    customer: 'Jessica Brown',
    email: 'jessica.b@email.com',
    booking: 'BK-1007',
    game: 'Wizards Quest',
    signedDate: 'Oct 27, 2025',
    status: 'signed',
    templateName: 'Photo Release Waiver',
  },
];

interface WaiverRecord {
  id: string;
  customer: string;
  email: string;
  booking: string;
  game: string;
  signedDate: string;
  status: 'signed' | 'pending';
  templateName: string;
}

interface WaiverTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  content: string;
  status: 'active' | 'inactive' | 'draft';
  requiredFields: string[];
  assignedGames: string[];
  createdDate: string;
  lastModified: string;
  usageCount: number;
}

const templatesData: WaiverTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Standard Liability Waiver',
    description: 'General release and indemnity agreement for all participants',
    type: 'Liability',
    content: [
      'I, {FULL_NAME}, born on {DATE_OF_BIRTH}, agree to participate in the activity.',
      'I acknowledge the risks involved and release the organizer from liability.',
      'Contact: {EMAIL} | {PHONE}. Emergency Contact: {EMERGENCY_CONTACT}.',
      'Signed on {DATE}.',
    ].join('\n'),
    status: 'active',
    requiredFields: ['Full Name', 'Date of Birth', 'Email', 'Phone', 'Emergency Contact'],
    assignedGames: ['All Games'],
    createdDate: 'Oct 1, 2025',
    lastModified: 'Oct 15, 2025',
    usageCount: 234,
  },
  {
    id: 'TPL-002',
    name: 'Minor Participant Waiver',
    description: 'Waiver for participants under 18 years old - requires parent/guardian signature',
    type: 'Minor Consent',
    content: [
      'Minor: {MINOR_NAME}, DOB {DATE_OF_BIRTH}.',
      'Parent/Guardian: {PARENT_GUARDIAN_NAME}. Email: {PARENT_EMAIL}. Phone: {PARENT_PHONE}.',
      'I consent to my minor participating and accept the terms.',
      'Signed on {DATE}.',
    ].join('\n'),
    status: 'active',
    requiredFields: ['Minor Name', 'Date of Birth', 'Parent/Guardian Name', 'Parent Email', 'Parent Phone'],
    assignedGames: ['All Games'],
    createdDate: 'Oct 1, 2025',
    lastModified: 'Oct 10, 2025',
    usageCount: 87,
  },
  {
    id: 'TPL-003',
    name: 'Photo Release Waiver',
    description: 'Permission to use photos and videos for marketing purposes',
    type: 'Photo/Video Release',
    content: [
      'I, {FULL_NAME}, grant permission to use photos/videos for marketing.',
      'Contact: {EMAIL}. Signature: {SIGNATURE}. Date: {DATE}.',
    ].join('\n'),
    status: 'active',
    requiredFields: ['Full Name', 'Email', 'Signature'],
    assignedGames: ['All Games'],
    createdDate: 'Oct 5, 2025',
    lastModified: 'Oct 20, 2025',
    usageCount: 156,
  },
  {
    id: 'TPL-004',
    name: 'Medical Disclosure Form',
    description: 'Health conditions and medical information disclosure',
    type: 'Medical',
    content: [
      'Medical Conditions: {MEDICAL_CONDITIONS}.',
      'Allergies: {ALLERGIES}. Medications: {MEDICATIONS}.',
      'Emergency Contact: {EMERGENCY_CONTACT}. Date: {DATE}.',
    ].join('\n'),
    status: 'active',
    requiredFields: ['Full Name', 'Medical Conditions', 'Allergies', 'Medications', 'Emergency Contact'],
    assignedGames: ['Zombie Outbreak', 'Prison Break'],
    createdDate: 'Oct 8, 2025',
    lastModified: 'Oct 18, 2025',
    usageCount: 45,
  },
  {
    id: 'TPL-005',
    name: 'COVID-19 Health Screening',
    description: 'Health screening questionnaire for COVID-19 symptoms',
    type: 'Health Screening',
    content: [
      'Name: {FULL_NAME}. Temperature: {TEMPERATURE_CHECK}.',
      'Symptoms: {SYMPTOM_CHECKLIST}. Date: {DATE}.',
    ].join('\n'),
    status: 'inactive',
    requiredFields: ['Full Name', 'Temperature Check', 'Symptom Checklist'],
    assignedGames: [],
    createdDate: 'Sep 20, 2025',
    lastModified: 'Sep 25, 2025',
    usageCount: 312,
  },
];

export function Waivers() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  const hoverShadowClass = isDark ? 'hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'hover:shadow-md';
  
  const [activeTab, setActiveTab] = useState<'records' | 'templates'>('records');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WaiverTemplate | null>(null);
  const [selectedWaiver, setSelectedWaiver] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [templates, setTemplates] = useState<WaiverTemplate[]>(templatesData);
  const [waivers, setWaivers] = useState<WaiverRecord[]>(waiversData);
  const [showAttendeeList, setShowAttendeeList] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const WAIVERS_STORAGE_KEY = 'admin_waivers';
  const WAIVER_TEMPLATES_STORAGE_KEY = 'admin_waiver_templates';

  // Load from localStorage on mount; seed if empty
  useEffect(() => {
    try {
      const rawTemplates = localStorage.getItem(WAIVER_TEMPLATES_STORAGE_KEY);
      if (rawTemplates) {
        const parsed = JSON.parse(rawTemplates);
        if (Array.isArray(parsed)) setTemplates(parsed);
      } else {
        localStorage.setItem(WAIVER_TEMPLATES_STORAGE_KEY, JSON.stringify(templatesData));
      }
    } catch (err) {
      console.error('Failed to load waiver templates from localStorage', err);
    }

    try {
      const rawWaivers = localStorage.getItem(WAIVERS_STORAGE_KEY);
      if (rawWaivers) {
        const parsed = JSON.parse(rawWaivers);
        if (Array.isArray(parsed)) setWaivers(parsed);
      } else {
        localStorage.setItem(WAIVERS_STORAGE_KEY, JSON.stringify(waiversData));
      }
    } catch (err) {
      console.error('Failed to load waivers from localStorage', err);
    }
  }, []);

  // Persist to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(WAIVER_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch (err) {
      console.error('Failed to save waiver templates to localStorage', err);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(WAIVERS_STORAGE_KEY, JSON.stringify(waivers));
    } catch (err) {
      console.error('Failed to save waivers to localStorage', err);
    }
  }, [waivers]);

  // Filter waivers
  const filteredWaivers = waivers.filter(waiver => {
    const matchesSearch = waiver.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         waiver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         waiver.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || waiver.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setEditMode(true);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: WaiverTemplate) => {
    setSelectedTemplate(template);
    setEditMode(true);
    setShowTemplateEditor(true);
  };

  const handlePreviewTemplate = (template: WaiverTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleDuplicateTemplate = (template: WaiverTemplate) => {
    const newTemplate: WaiverTemplate = {
      ...template,
      id: `TPL-${String(templates.length + 1).padStart(3, '0')}`,
      name: `${template.name} (Copy)`,
      status: 'draft',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastModified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      usageCount: 0,
    };
    setTemplates([...templates, newTemplate]);
    toast.success('Template duplicated successfully!');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success('Template deleted successfully!');
  };

  const handleToggleStatus = (templateId: string) => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setTemplates(templates.map(t => 
      t.id === templateId 
        ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive', lastModified: nowStr }
        : t
    ));
    toast.success('Template status updated!');
  };

  const handleViewWaiver = (waiver: any) => {
    setSelectedWaiver(waiver);
    setShowPreview(true);
  };

  const handleOpenAttendeeList = (booking?: any) => {
    setSelectedBooking(booking);
    setShowAttendeeList(true);
  };

  const handleOpenScanDialog = () => {
    setShowScanDialog(true);
  };

  const handleOpenWaiverForm = (template: WaiverTemplate) => {
    window.open(`/waiver-form/${template.id}`, '_blank');
    toast.success('Opening waiver form...');
  };

  const buildFormUrl = (template: WaiverTemplate) => {
    return `${window.location.origin}/waiver-form/${template.id}`;
  };

  const handleCopyFormLink = async (template: WaiverTemplate) => {
    try {
      const url = buildFormUrl(template);
      await navigator.clipboard.writeText(url);
      toast.success('Copied waiver form link to clipboard');
    } catch (err) {
      console.error('Failed to copy link', err);
      toast.error('Failed to copy link');
    }
  };

  const handleCopyEmbedCode = async (template: WaiverTemplate) => {
    try {
      const url = buildFormUrl(template);
      const embed = `<iframe src="${url}" width="100%" height="800" style="border:0"></iframe>`;
      await navigator.clipboard.writeText(embed);
      toast.success('Copied embed code');
    } catch (err) {
      console.error('Failed to copy embed code', err);
      toast.error('Failed to copy embed code');
    }
  };

  const handleDownloadFormLink = (template: WaiverTemplate) => {
    try {
      const url = buildFormUrl(template);
      const text = `Waiver Form Link for ${template.name}\n\n${url}\n\nEmbed:\n<iframe src="${url}" width="100%" height="800" style="border:0"></iframe>\n`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${template.id}-waiver-link.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success('Downloaded waiver form link');
    } catch (err) {
      console.error('Failed to download link file', err);
      toast.error('Failed to download link file');
    }
  };

  const handleSendReminders = () => {
    const pending = waivers.filter(w => w.status === 'pending');
    if (pending.length === 0) {
      toast.info('No pending waivers to remind');
      return;
    }
    toast.success(`Sent reminders to ${pending.length} pending ${pending.length === 1 ? 'waiver' : 'waivers'}`);
  };

  const handleExport = (format: 'csv' | 'pdf', scope: 'all' | 'filtered' = 'all') => {
    try {
      const records = scope === 'filtered' ? filteredWaivers : waivers;
      if (records.length === 0) {
        toast.info('No waivers to export');
        return;
      }

      if (format === 'csv') {
        const headers = ['Waiver ID','Customer','Email','Booking ID','Game','Signed Date','Status','Template'];
        const rows = records.map(w => [w.id, w.customer, w.email, w.booking, w.game, w.signedDate, w.status, w.templateName]);
        const escape = (val: any) => {
          const s = String(val ?? '');
          // Escape quotes and wrap values containing commas/newlines in quotes
          const escaped = s.replace(/"/g, '""');
          return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        };
        const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = scope === 'filtered' ? 'waivers_filtered.csv' : 'waivers_all.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${scope === 'filtered' ? 'filtered' : 'all'} waivers to CSV`);
        return;
      }

      if (format === 'pdf') {
        const doc = new jsPDF();
        const marginX = 15;
        const startY = 20;

        records.forEach((w, idx) => {
          if (idx > 0) doc.addPage();

          let y = startY;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(16);
          doc.text('Waiver Record', marginX, y);

          y += 10;
          doc.setFontSize(11);
          const lines = [
            `Waiver ID: ${w.id}`,
            `Template: ${w.templateName}`,
            `Customer: ${w.customer}`,
            `Email: ${w.email}`,
            `Booking: ${w.booking}`,
            `Game: ${w.game}`,
            `Status: ${w.status}`,
            `Signed Date: ${w.signedDate}`,
          ];
          lines.forEach((line) => {
            doc.text(line, marginX, y);
            y += 8;
          });

          // Content section
          y += 4;
          doc.setFontSize(12);
          doc.text('Waiver Content', marginX, y);
          y += 6;

          doc.setFontSize(11);
          const tmpl = templates.find(t => t.name === w.templateName);
          const content = tmpl?.content || '(No content available)';
          const wrapped = doc.splitTextToSize(content, 180);
          wrapped.forEach((line: string) => {
            if (y > 280) {
              doc.addPage();
              y = startY;
            }
            doc.text(line, marginX, y);
            y += 7;
          });
        });

        doc.save(scope === 'filtered' ? 'waivers_filtered.pdf' : 'waivers_all.pdf');
        toast.success(`Exported ${scope === 'filtered' ? 'filtered' : 'all'} waivers to PDF`);
        return;
      }
    } catch (err) {
      console.error('Failed to export waivers', err);
      toast.error('Failed to export waivers');
    }
  };

  const handleDownloadWaiver = (waiver: WaiverRecord) => {
    try {
      const doc = new jsPDF();
      const marginX = 15;
      let y = 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.text('Waiver Record', marginX, y);

      y += 10;
      doc.setFontSize(11);
      const lines = [
        `Waiver ID: ${waiver.id}`,
        `Template: ${waiver.templateName}`,
        `Customer: ${waiver.customer}`,
        `Email: ${waiver.email}`,
        `Booking: ${waiver.booking}`,
        `Game: ${waiver.game}`,
        `Status: ${waiver.status}`,
        `Signed Date: ${waiver.signedDate}`,
      ];
      lines.forEach((line) => {
        doc.text(line, marginX, y);
        y += 8;
      });

      doc.save(`${waiver.id}.pdf`);
      toast.success('Downloaded waiver PDF');
    } catch (err) {
      console.error('Failed to download waiver', err);
      toast.error('Failed to download waiver');
    }
  };

  const handleSendReminder = (waiver: WaiverRecord) => {
    toast.success(`Reminder sent to ${waiver.email}`);
  };

  const handleDeleteWaiver = (waiverId: string) => {
    setWaivers(prev => prev.filter(w => w.id !== waiverId));
    toast.success('Waiver deleted');
  };

  const stats = {
    total: waivers.length,
    signed: waivers.filter(w => w.status === 'signed').length,
    pending: waivers.filter(w => w.status === 'pending').length,
    thisMonth: 124
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Waivers"
        description="Manage liability waivers and customer agreements"
        sticky
        action={
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={handleOpenScanDialog}
              className="h-11 flex-1 sm:flex-initial"
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Scan Waiver</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleOpenAttendeeList()}
              className="h-11 flex-1 sm:flex-initial"
            >
              <List className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Attendee List</span>
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              onClick={handleCreateTemplate}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Template</span>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Waivers</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{stats.total}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <FileText className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Signed</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{stats.signed}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <FileCheck className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Pending</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{stats.pending}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                <Clock className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>This Month</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{stats.thisMonth}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Calendar className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'records' | 'templates')}>
        <div className="overflow-x-auto">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="records" className="gap-2 flex-1 sm:flex-initial">
              <FileText className="w-4 h-4" />
              Waiver Records
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2 flex-1 sm:flex-initial">
              <FilePlus className="w-4 h-4" />
              Templates ({templates.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Waiver Records Tab */}
        <TabsContent value="records" className="mt-6">
          {/* Search and Filters */}
          <Card className={`${cardBgClass} border ${borderClass} shadow-sm mb-4`}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                  <Input
                    placeholder="Search by customer, email, or waiver ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px] h-11">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchQuery || filterStatus !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                      }}
                      className="h-11"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <CardTitle className={textClass}>Waiver Records</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-9" onClick={handleSendReminders}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminders
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Download className="w-4 h-4 mr-2" />
                        Export All
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleExport('csv', 'all')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export CSV (All)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('pdf', 'all')}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF (All)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExport('csv', 'filtered')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export CSV (Filtered)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport('pdf', 'filtered')}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF (Filtered)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={borderClass}>
                      <TableHead className={textMutedClass}>Waiver ID</TableHead>
                      <TableHead className={textMutedClass}>Customer</TableHead>
                      <TableHead className={textMutedClass}>Booking ID</TableHead>
                      <TableHead className={textMutedClass}>Game</TableHead>
                      <TableHead className={textMutedClass}>Signed Date</TableHead>
                      <TableHead className={textMutedClass}>Status</TableHead>
                      <TableHead className={`text-right ${textMutedClass}`}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWaivers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className={`text-center py-8 ${textMutedClass}`}>
                          No waivers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWaivers.map((waiver) => (
                        <TableRow key={waiver.id} className={`${borderClass} ${hoverBgClass} transition-colors`}>
                          <TableCell className={textClass}>{waiver.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className={`text-sm ${textClass}`}>{waiver.customer}</p>
                              <p className={`text-xs ${textMutedClass}`}>{waiver.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className={textClass}>{waiver.booking}</TableCell>
                          <TableCell className={textClass}>{waiver.game}</TableCell>
                          <TableCell className={textMutedClass}>{waiver.signedDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                waiver.status === 'signed'
                                  ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0')
                                  : (isDark ? 'bg-yellow-500/20 text-yellow-400 border-0' : 'bg-yellow-100 text-yellow-700 border-0')
                              }
                            >
                              {waiver.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewWaiver(waiver)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Waiver
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadWaiver(waiver)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                {waiver.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handleSendReminder(waiver)}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Reminder
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className={isDark ? 'text-red-400' : 'text-red-600'} onClick={() => handleDeleteWaiver(waiver.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
                <CardHeader className="p-6 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className={`w-4 h-4 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                        <h3 className={`truncate ${textClass}`}>{template.name}</h3>
                      </div>
                      <p className={`text-xs line-clamp-2 ${textMutedClass}`}>{template.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(template.id)}>
                          {template.status === 'active' ? (
                            <>
                              <XSquare className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckSquare className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className={isDark ? 'text-red-400' : 'text-red-600'}
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0">
                  <div className="flex items-center justify-between text-xs">
                    <Badge 
                      variant="secondary" 
                      className={
                        template.status === 'active'
                          ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0')
                          : template.status === 'inactive'
                          ? (isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] border-0' : 'bg-gray-100 text-gray-700 border-0')
                          : (isDark ? 'bg-yellow-500/20 text-yellow-400 border-0' : 'bg-yellow-100 text-yellow-700 border-0')
                      }
                    >
                      {template.status}
                    </Badge>
                    <span className={textMutedClass}>{template.type}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className={`flex items-center gap-2 ${textMutedClass}`}>
                      <Users className="w-3 h-3" />
                      <span>{template.usageCount} times used</span>
                    </div>
                    <div className={`flex items-center gap-2 ${textMutedClass}`}>
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{template.assignedGames.join(', ')}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${textMutedClass}`}>
                      <Clock className="w-3 h-3" />
                      <span>Updated {template.lastModified}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenWaiverForm(template)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Form
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenAttendeeList()}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Attendees
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Share Link
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyFormLink(template)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Public Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyEmbedCode(template)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Copy Embed Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadFormLink(template)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Link (.txt)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      {showTemplateEditor && (
        <WaiverTemplateEditor
          template={selectedTemplate}
          isOpen={showTemplateEditor}
          onClose={() => {
            setShowTemplateEditor(false);
            setSelectedTemplate(null);
          }}
          onSave={(template) => {
            const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            if (editMode && selectedTemplate) {
              setTemplates(templates.map(t => t.id === template.id ? { ...template, lastModified: nowStr } : t));
              toast.success('Template updated successfully!');
            } else {
              setTemplates([...templates, { ...template, createdDate: template.createdDate || nowStr, lastModified: nowStr }]);
              toast.success('Template created successfully!');
            }
            setShowTemplateEditor(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Preview Dialog */}
      {showPreview && (
        <WaiverPreview
          template={selectedTemplate}
          waiver={selectedWaiver}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
            setSelectedWaiver(null);
          }}
        />
      )}

      {/* Attendee List Dialog */}
      {showAttendeeList && (
        <AttendeeListDialog
          booking={selectedBooking}
          isOpen={showAttendeeList}
          onClose={() => {
            setShowAttendeeList(false);
            setSelectedBooking(null);
          }}
        />
      )}

      {/* Scan Waiver Dialog */}
      {showScanDialog && (
        <ScanWaiverDialog
          isOpen={showScanDialog}
          onClose={() => setShowScanDialog(false)}
        />
      )}
    </div>
  );
}
