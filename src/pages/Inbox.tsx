import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { useTheme } from '../components/layout/ThemeContext';
import {
  MessageSquare,
  Phone,
  FileText,
  Search,
  Trash2,
  Download,
  Clock,
  User,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Archive,
  Star,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
  id: string;
  type: 'bot' | 'user';
  text?: string;
  timestamp?: Date;
}

interface ChatConversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

interface CallRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  duration: string;
  timestamp: Date;
  status: 'completed' | 'missed' | 'voicemail';
  notes?: string;
}

interface FormSubmission {
  id: string;
  formType: string;
  customerName: string;
  customerEmail: string;
  timestamp: Date;
  status: 'new' | 'reviewed' | 'responded';
  data: Record<string, any>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Inbox = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const hoverClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  // State
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Chat History State
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);

  // Call History State
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  // Form Submissions State
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    loadChatHistory();
    loadCallHistory();
    loadFormSubmissions();
  }, []);

  const loadChatHistory = () => {
    const saved = localStorage.getItem('chatConversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
        }))
      }));
      setChatConversations(withDates);
    } else {
      // Mock data for demonstration
      const mockChats: ChatConversation[] = [
        {
          id: '1',
          title: 'Booking inquiry for Mystery Mansion',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          messages: [
            { id: '1', type: 'user', text: "I'd like to book Mystery Mansion", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
            { id: '2', type: 'bot', text: "Great choice! Mystery Mansion is available. When would you like to book?", timestamp: new Date(Date.now() - 1000 * 60 * 29) },
            { id: '3', type: 'user', text: "Tonight at 7pm for 4 people", timestamp: new Date(Date.now() - 1000 * 60 * 28) },
            { id: '4', type: 'bot', text: "Perfect! I can reserve that for you. The price for 4 people is $120.", timestamp: new Date(Date.now() - 1000 * 60 * 27) },
          ]
        }
      ];
      setChatConversations(mockChats);
    }
  };

  const loadCallHistory = () => {
    const saved = localStorage.getItem('callHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map((call: any) => ({
        ...call,
        timestamp: new Date(call.timestamp)
      }));
      setCallRecords(withDates);
    } else {
      // Mock data for demonstration
      const mockCalls: CallRecord[] = [
        {
          id: '1',
          customerName: 'John Smith',
          customerPhone: '+1 (555) 123-4567',
          duration: '5:32',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: 'completed',
          notes: 'Customer wants to book for birthday party. Discussed pricing and availability.'
        },
        {
          id: '2',
          customerName: 'Sarah Johnson',
          customerPhone: '+1 (555) 234-5678',
          duration: '2:15',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          status: 'completed',
          notes: 'Asked about group discounts for 10+ people.'
        },
        {
          id: '3',
          customerName: 'Mike Davis',
          customerPhone: '+1 (555) 345-6789',
          duration: '0:00',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
          status: 'missed',
          notes: 'No voicemail left.'
        },
        {
          id: '4',
          customerName: 'Emily Brown',
          customerPhone: '+1 (555) 456-7890',
          duration: '1:45',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          status: 'voicemail',
          notes: 'Left message asking about availability for corporate event.'
        }
      ];
      setCallRecords(mockCalls);
      localStorage.setItem('callHistory', JSON.stringify(mockCalls));
    }
  };

  const loadFormSubmissions = () => {
    const saved = localStorage.getItem('formSubmissions');
    if (saved) {
      const parsed = JSON.parse(saved);
      const withDates = parsed.map((form: any) => ({
        ...form,
        timestamp: new Date(form.timestamp)
      }));
      setFormSubmissions(withDates);
    } else {
      // Mock data for demonstration
      const mockForms: FormSubmission[] = [
        {
          id: '1',
          formType: 'Contact Form',
          customerName: 'Alex Turner',
          customerEmail: 'alex.turner@email.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
          status: 'new',
          data: {
            subject: 'Corporate Event Booking',
            message: 'We are interested in booking your facility for a team building event with 25 people. What are your rates and availability for next month?',
            phone: '+1 (555) 567-8901'
          }
        },
        {
          id: '2',
          formType: 'Quote Request',
          customerName: 'Jessica Lee',
          customerEmail: 'jessica.lee@company.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          status: 'reviewed',
          data: {
            eventType: 'Birthday Party',
            numberOfGuests: 8,
            preferredDate: '2025-11-15',
            message: 'Looking for a package deal with food and drinks included.'
          }
        },
        {
          id: '3',
          formType: 'Feedback Form',
          customerName: 'Robert Martinez',
          customerEmail: 'robert.m@email.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          status: 'responded',
          data: {
            rating: 5,
            experience: 'Excellent',
            comments: 'Had an amazing time! The staff was very helpful and the room was challenging but fun.',
            wouldRecommend: true
          }
        },
        {
          id: '4',
          formType: 'Partnership Inquiry',
          customerName: 'Lisa Chen',
          customerEmail: 'lisa.chen@business.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          status: 'reviewed',
          data: {
            companyName: 'Corporate Solutions Inc.',
            partnershipType: 'Bulk Bookings',
            message: 'We would like to discuss ongoing partnership for monthly team events.'
          }
        }
      ];
      setFormSubmissions(mockForms);
      localStorage.setItem('formSubmissions', JSON.stringify(mockForms));
    }
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const deleteChat = (id: string) => {
    const updated = chatConversations.filter(c => c.id !== id);
    setChatConversations(updated);
    localStorage.setItem('chatConversations', JSON.stringify(updated));
    if (selectedChat?.id === id) {
      setSelectedChat(null);
    }
    toast.success('Chat conversation deleted');
  };

  const deleteCall = (id: string) => {
    const updated = callRecords.filter(c => c.id !== id);
    setCallRecords(updated);
    localStorage.setItem('callHistory', JSON.stringify(updated));
    if (selectedCall?.id === id) {
      setSelectedCall(null);
    }
    toast.success('Call record deleted');
  };

  const deleteForm = (id: string) => {
    const updated = formSubmissions.filter(f => f.id !== id);
    setFormSubmissions(updated);
    localStorage.setItem('formSubmissions', JSON.stringify(updated));
    if (selectedForm?.id === id) {
      setSelectedForm(null);
    }
    toast.success('Form submission deleted');
  };

  const exportChat = (conversation: ChatConversation) => {
    const text = conversation.messages
      .map(msg => `[${msg.type.toUpperCase()}]: ${msg.text || '(no text)'}`)
      .join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${conversation.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported successfully');
  };

  const updateFormStatus = (id: string, status: FormSubmission['status']) => {
    const updated = formSubmissions.map(f => 
      f.id === id ? { ...f, status } : f
    );
    setFormSubmissions(updated);
    localStorage.setItem('formSubmissions', JSON.stringify(updated));
    if (selectedForm?.id === id) {
      setSelectedForm({ ...selectedForm, status });
    }
    toast.success(`Status updated to ${status}`);
  };

  // ============================================================================
  // FILTER LOGIC
  // ============================================================================

  const filterByTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    switch (filterType) {
      case 'today':
        return diff < 1000 * 60 * 60 * 24;
      case 'week':
        return diff < 1000 * 60 * 60 * 24 * 7;
      case 'month':
        return diff < 1000 * 60 * 60 * 24 * 30;
      default:
        return true;
    }
  };

  const filteredChats = chatConversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTime = filterByTime(conv.timestamp);
    return matchesSearch && matchesTime;
  });

  const filteredCalls = callRecords.filter(call => {
    const matchesSearch = call.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.customerPhone.includes(searchQuery) ||
      call.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTime = filterByTime(call.timestamp);
    return matchesSearch && matchesTime;
  });

  const filteredForms = formSubmissions.filter(form => {
    const matchesSearch = form.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.formType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTime = filterByTime(form.timestamp);
    return matchesSearch && matchesTime;
  });

  // ============================================================================
  // STATS
  // ============================================================================

  const chatStats = {
    total: chatConversations.length,
    today: chatConversations.filter(c => {
      const diff = Date.now() - c.timestamp.getTime();
      return diff < 1000 * 60 * 60 * 24;
    }).length
  };

  const callStats = {
    total: callRecords.length,
    completed: callRecords.filter(c => c.status === 'completed').length,
    missed: callRecords.filter(c => c.status === 'missed').length,
    today: callRecords.filter(c => {
      const diff = Date.now() - c.timestamp.getTime();
      return diff < 1000 * 60 * 60 * 24;
    }).length
  };

  const formStats = {
    total: formSubmissions.length,
    new: formSubmissions.filter(f => f.status === 'new').length,
    reviewed: formSubmissions.filter(f => f.status === 'reviewed').length,
    today: formSubmissions.filter(f => {
      const diff = Date.now() - f.timestamp.getTime();
      return diff < 1000 * 60 * 60 * 24;
    }).length
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inbox" 
        description="Manage all customer communications in one place"
      />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Chat Stats */}
          <Card className={`${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'} p-4 sm:p-5 md:p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <Label className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>Chat Conversations</Label>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className={`text-3xl ${textClass}`}>{chatStats.total}</span>
                  <span className={`text-sm ${textMutedClass}`}>total</span>
                </div>
                {chatStats.today > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +{chatStats.today} today
                    </Badge>
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <MessageSquare className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </Card>

          {/* Call Stats */}
          <Card className={`${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'} p-4 sm:p-5 md:p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <Label className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>Call Records</Label>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className={`text-3xl ${textClass}`}>{callStats.total}</span>
                  <span className={`text-sm ${textMutedClass}`}>total</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {callStats.missed > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {callStats.missed} missed
                    </Badge>
                  )}
                  {callStats.today > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{callStats.today} today
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                <Phone className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </Card>

          {/* Form Stats */}
          <Card className={`${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'} p-4 sm:p-5 md:p-6`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <Label className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>Form Submissions</Label>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className={`text-3xl ${textClass}`}>{formStats.total}</span>
                  <span className={`text-sm ${textMutedClass}`}>total</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {formStats.new > 0 && (
                    <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      {formStats.new} new
                    </Badge>
                  )}
                  {formStats.today > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{formStats.today} today
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <FileText className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className={`${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'}`}>
          {/* Search and Filters Bar */}
          <div className={`p-3 sm:p-4 md:p-6 border-b ${borderClass}`}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search conversations, calls, or forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 h-12 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                />
              </div>

              {/* Time Filter Buttons */}
              <div className="flex gap-2 flex-shrink-0 overflow-x-auto pb-1">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  className="min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 text-sm flex-shrink-0"
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'today' ? 'default' : 'outline'}
                  onClick={() => setFilterType('today')}
                  className="min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 text-sm flex-shrink-0"
                  size="sm"
                >
                  Today
                </Button>
                <Button
                  variant={filterType === 'week' ? 'default' : 'outline'}
                  onClick={() => setFilterType('week')}
                  className="min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 text-sm flex-shrink-0"
                  size="sm"
                >
                  Week
                </Button>
                <Button
                  variant={filterType === 'month' ? 'default' : 'outline'}
                  onClick={() => setFilterType('month')}
                  className="min-h-[44px] h-11 sm:h-12 px-3 sm:px-4 text-sm flex-shrink-0"
                  size="sm"
                >
                  Month
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className={`px-3 sm:px-4 md:px-6 border-b ${borderClass} overflow-x-auto`}>
              <TabsList className={`${isDark ? 'bg-transparent' : 'bg-transparent'} w-full justify-start h-auto p-0 gap-2 sm:gap-4`}>
                <TabsTrigger 
                  value="chat" 
                  className={`${isDark ? 'data-[state=active]:bg-transparent data-[state=active]:text-white' : 'data-[state=active]:bg-transparent data-[state=active]:text-gray-900'} rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-3 sm:px-4 py-3 sm:py-4 gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat History</span>
                  <span className="sm:hidden">Chat</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filteredChats.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="calls" 
                  className={`${isDark ? 'data-[state=active]:bg-transparent data-[state=active]:text-white' : 'data-[state=active]:bg-transparent data-[state=active]:text-gray-900'} rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-3 sm:px-4 py-3 sm:py-4 gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Call History</span>
                  <span className="sm:hidden">Calls</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filteredCalls.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="forms" 
                  className={`${isDark ? 'data-[state=active]:bg-transparent data-[state=active]:text-white' : 'data-[state=active]:bg-transparent data-[state=active]:text-gray-900'} rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 px-3 sm:px-4 py-3 sm:py-4 gap-1.5 sm:gap-2 text-xs sm:text-sm flex-shrink-0`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Form Submissions</span>
                  <span className="sm:hidden">Forms</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filteredForms.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-3 sm:p-4 md:p-6">
              {/* Chat History Tab */}
              <TabsContent value="chat" className="mt-0">
                <ChatHistoryTab
                  conversations={filteredChats}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                  onDeleteChat={deleteChat}
                  onExportChat={exportChat}
                  isDark={isDark}
                  textClass={textClass}
                  textMutedClass={textMutedClass}
                  bgClass={bgClass}
                  bgElevatedClass={bgElevatedClass}
                  borderClass={borderClass}
                  hoverClass={hoverClass}
                />
              </TabsContent>

              {/* Call History Tab */}
              <TabsContent value="calls" className="mt-0">
                <CallHistoryTab
                  calls={filteredCalls}
                  selectedCall={selectedCall}
                  onSelectCall={setSelectedCall}
                  onDeleteCall={deleteCall}
                  isDark={isDark}
                  textClass={textClass}
                  textMutedClass={textMutedClass}
                  bgClass={bgClass}
                  bgElevatedClass={bgElevatedClass}
                  borderClass={borderClass}
                  hoverClass={hoverClass}
                />
              </TabsContent>

              {/* Form Submissions Tab */}
              <TabsContent value="forms" className="mt-0">
                <FormSubmissionsTab
                  forms={filteredForms}
                  selectedForm={selectedForm}
                  onSelectForm={setSelectedForm}
                  onDeleteForm={deleteForm}
                  onUpdateStatus={updateFormStatus}
                  isDark={isDark}
                  textClass={textClass}
                  textMutedClass={textMutedClass}
                  bgClass={bgClass}
                  bgElevatedClass={bgElevatedClass}
                  borderClass={borderClass}
                  hoverClass={hoverClass}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
    </div>
  );
};

// ============================================================================
// CHAT HISTORY TAB
// ============================================================================

interface ChatHistoryTabProps {
  conversations: ChatConversation[];
  selectedChat: ChatConversation | null;
  onSelectChat: (chat: ChatConversation) => void;
  onDeleteChat: (id: string) => void;
  onExportChat: (chat: ChatConversation) => void;
  isDark: boolean;
  textClass: string;
  textMutedClass: string;
  bgClass: string;
  bgElevatedClass: string;
  borderClass: string;
  hoverClass: string;
}

function ChatHistoryTab({
  conversations,
  selectedChat,
  onSelectChat,
  onDeleteChat,
  onExportChat,
  isDark,
  textClass,
  textMutedClass,
  bgClass,
  bgElevatedClass,
  borderClass,
  hoverClass
}: ChatHistoryTabProps) {
  if (conversations.length === 0) {
    return (
      <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} rounded-lg p-12 text-center`}>
        <MessageSquare className={`w-16 h-16 ${textMutedClass} mx-auto mb-4`} />
        <h3 className={`text-lg mb-2 ${textClass}`}>No conversations found</h3>
        <p className={textMutedClass}>
          Chat conversations will appear here when customers interact with your AI assistant
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Conversation List */}
      <div className="lg:col-span-1">
        <ScrollArea className="h-[500px] sm:h-[600px] lg:h-[650px] pr-2 sm:pr-4">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectChat(conv)}
                className={`w-full p-3 sm:p-4 rounded-lg border ${borderClass} text-left transition-all min-h-[44px] ${
                  selectedChat?.id === conv.id
                    ? isDark ? 'bg-[#1e1e1e] border-blue-500 ring-1 ring-blue-500' : 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : `${isDark ? 'bg-[#1e1e1e]' : 'bg-white'} ${hoverClass}`
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${textClass} line-clamp-2 mb-1`}>{conv.title}</p>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-3 h-3 ${textMutedClass}`} />
                      <p className={`text-xs ${textMutedClass}`}>
                        {format(conv.timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {conv.messages.length}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Conversation Detail */}
      <div className="lg:col-span-2">
        {selectedChat ? (
          <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'} rounded-lg border`}>
            {/* Header */}
            <div className={`p-3 sm:p-4 md:p-6 border-b ${borderClass}`}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <h3 className={`text-base sm:text-lg mb-2 ${textClass} line-clamp-2`}>{selectedChat.title}</h3>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-xs sm:text-sm ${textMutedClass}`}>
                      {format(selectedChat.timestamp, 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExportChat(selectedChat)}
                    className="min-h-[44px] h-9 sm:h-10 gap-2 flex-1 sm:flex-initial"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this conversation?')) {
                        onDeleteChat(selectedChat.id);
                      }
                    }}
                    className="min-h-[44px] h-9 sm:h-10 gap-2 flex-1 sm:flex-initial"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[400px] sm:h-[480px] lg:h-[520px] p-3 sm:p-4 md:p-6">
              <div className="space-y-3 sm:space-y-4">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : isDark ? 'bg-[#161616] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className={`text-sm sm:text-base ${msg.type === 'user' ? 'text-white' : textClass}`}>
                        {msg.text}
                      </p>
                      {msg.timestamp && (
                        <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-white/70' : textMutedClass}`}>
                          {format(msg.timestamp, 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} rounded-lg border p-12 text-center h-full flex items-center justify-center`}>
            <div>
              <MessageSquare className={`w-16 h-16 ${textMutedClass} mx-auto mb-4`} />
              <h3 className={`text-lg mb-2 ${textClass}`}>No conversation selected</h3>
              <p className={textMutedClass}>Select a conversation from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CALL HISTORY TAB
// ============================================================================

interface CallHistoryTabProps {
  calls: CallRecord[];
  selectedCall: CallRecord | null;
  onSelectCall: (call: CallRecord) => void;
  onDeleteCall: (id: string) => void;
  isDark: boolean;
  textClass: string;
  textMutedClass: string;
  bgClass: string;
  bgElevatedClass: string;
  borderClass: string;
  hoverClass: string;
}

function CallHistoryTab({
  calls,
  selectedCall,
  onSelectCall,
  onDeleteCall,
  isDark,
  textClass,
  textMutedClass,
  bgClass,
  bgElevatedClass,
  borderClass,
  hoverClass
}: CallHistoryTabProps) {
  const getStatusIcon = (status: CallRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'missed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'voicemail':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: CallRecord['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="text-xs bg-green-600 hover:bg-green-700 text-white">Completed</Badge>;
      case 'missed':
        return <Badge className="text-xs bg-red-600 hover:bg-red-700 text-white">Missed</Badge>;
      case 'voicemail':
        return <Badge className="text-xs bg-amber-600 hover:bg-amber-700 text-white">Voicemail</Badge>;
    }
  };

  if (calls.length === 0) {
    return (
      <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} rounded-lg p-12 text-center`}>
        <Phone className={`w-16 h-16 ${textMutedClass} mx-auto mb-4`} />
        <h3 className={`text-lg mb-2 ${textClass}`}>No call records found</h3>
        <p className={textMutedClass}>
          Phone call records will appear here when logged
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Call List */}
      <div className="lg:col-span-1">
        <ScrollArea className="h-[500px] sm:h-[600px] lg:h-[650px] pr-2 sm:pr-4">
          <div className="space-y-2">
            {calls.map((call) => (
              <button
                key={call.id}
                onClick={() => onSelectCall(call)}
                className={`w-full p-3 sm:p-4 rounded-lg border ${borderClass} text-left transition-all min-h-[44px] ${
                  selectedCall?.id === call.id
                    ? isDark ? 'bg-[#1e1e1e] border-blue-500 ring-1 ring-blue-500' : 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : `${isDark ? 'bg-[#1e1e1e]' : 'bg-white'} ${hoverClass}`
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(call.status)}
                    <p className={`text-sm ${textClass}`}>{call.customerName}</p>
                  </div>
                  {getStatusBadge(call.status)}
                </div>
                <p className={`text-xs ${textMutedClass} mb-2`}>{call.customerPhone}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-3 h-3 ${textMutedClass}`} />
                    <p className={`text-xs ${textMutedClass}`}>
                      {format(call.timestamp, 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <p className={`text-xs ${textMutedClass}`}>{call.duration}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Call Detail */}
      <div className="lg:col-span-2">
        {selectedCall ? (
          <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'} rounded-lg border`}>
            {/* Header */}
            <div className={`p-3 sm:p-4 md:p-6 border-b ${borderClass}`}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    {getStatusIcon(selectedCall.status)}
                    <h3 className={`text-base sm:text-lg ${textClass}`}>{selectedCall.customerName}</h3>
                    {getStatusBadge(selectedCall.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-xs sm:text-sm ${textMutedClass}`}>
                      {format(selectedCall.timestamp, 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this call record?')) {
                      onDeleteCall(selectedCall.id);
                    }
                  }}
                  className="min-h-[44px] h-9 sm:h-10 gap-2 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              <div>
                <Label className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                  Phone Number
                </Label>
                <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-100 border border-gray-300'}`}>
                  <Phone className={`w-5 h-5 ${textMutedClass}`} />
                  <p className={textClass}>{selectedCall.customerPhone}</p>
                </div>
              </div>

              <div>
                <Label className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                  Duration
                </Label>
                <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-100 border border-gray-300'}`}>
                  <Clock className={`w-5 h-5 ${textMutedClass}`} />
                  <p className={textClass}>{selectedCall.duration}</p>
                </div>
              </div>

              {selectedCall.notes && (
                <div>
                  <Label className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                    Notes
                  </Label>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-100 border border-gray-300'}`}>
                    <p className={textClass}>{selectedCall.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} rounded-lg border p-12 text-center h-full flex items-center justify-center`}>
            <div>
              <Phone className={`w-16 h-16 ${textMutedClass} mx-auto mb-4`} />
              <h3 className={`text-lg mb-2 ${textClass}`}>No call selected</h3>
              <p className={textMutedClass}>Select a call record from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FORM SUBMISSIONS TAB
// ============================================================================

interface FormSubmissionsTabProps {
  forms: FormSubmission[];
  selectedForm: FormSubmission | null;
  onSelectForm: (form: FormSubmission) => void;
  onDeleteForm: (id: string) => void;
  onUpdateStatus: (id: string, status: FormSubmission['status']) => void;
  isDark: boolean;
  textClass: string;
  textMutedClass: string;
  bgClass: string;
  bgElevatedClass: string;
  borderClass: string;
  hoverClass: string;
}

function FormSubmissionsTab({
  forms,
  selectedForm,
  onSelectForm,
  onDeleteForm,
  onUpdateStatus,
  isDark,
  textClass,
  textMutedClass,
  bgClass,
  bgElevatedClass,
  borderClass,
  hoverClass
}: FormSubmissionsTabProps) {
  const getStatusBadge = (status: FormSubmission['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">New</Badge>;
      case 'reviewed':
        return <Badge className="text-xs bg-amber-600 hover:bg-amber-700 text-white">Reviewed</Badge>;
      case 'responded':
        return <Badge className="text-xs bg-green-600 hover:bg-green-700 text-white">Responded</Badge>;
    }
  };

  if (forms.length === 0) {
    return (
      <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} rounded-lg p-12 text-center`}>
        <FileText className={`w-16 h-16 ${textMutedClass} mx-auto mb-4`} />
        <h3 className={`text-lg mb-2 ${textClass}`}>No form submissions found</h3>
        <p className={textMutedClass}>
          Customer form submissions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Form List */}
      <div className="lg:col-span-1">
        <ScrollArea className="h-[500px] sm:h-[600px] lg:h-[650px] pr-2 sm:pr-4">
          <div className="space-y-2">
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => onSelectForm(form)}
                className={`w-full p-3 sm:p-4 rounded-lg border ${borderClass} text-left transition-all min-h-[44px] ${
                  selectedForm?.id === form.id
                    ? isDark ? 'bg-[#1e1e1e] border-blue-500 ring-1 ring-blue-500' : 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : `${isDark ? 'bg-[#1e1e1e]' : 'bg-white'} ${hoverClass}`
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className={`text-sm ${textClass}`}>{form.formType}</p>
                  {getStatusBadge(form.status)}
                </div>
                <p className={`text-sm ${textClass} mb-1`}>{form.customerName}</p>
                <p className={`text-xs ${textMutedClass} mb-2 truncate`}>{form.customerEmail}</p>
                <div className="flex items-center gap-2">
                  <Clock className={`w-3 h-3 ${textMutedClass}`} />
                  <p className={`text-xs ${textMutedClass}`}>
                    {format(form.timestamp, 'MMM d, h:mm a')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Form Detail */}
      <div className="lg:col-span-2">
        {selectedForm ? (
          <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'} rounded-lg border`}>
            {/* Header */}
            <div className={`p-3 sm:p-4 md:p-6 border-b ${borderClass}`}>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <h3 className={`text-base sm:text-lg ${textClass}`}>{selectedForm.formType}</h3>
                    {getStatusBadge(selectedForm.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${textMutedClass}`} />
                    <p className={`text-xs sm:text-sm ${textMutedClass}`}>
                      {format(selectedForm.timestamp, 'MMMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Delete this submission?')) {
                      onDeleteForm(selectedForm.id);
                    }
                  }}
                  className="min-h-[44px] h-9 sm:h-10 gap-2 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              <div>
                <Label className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                  Customer Name
                </Label>
                <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-100 border border-gray-300'}`}>
                  <User className={`w-5 h-5 ${textMutedClass}`} />
                  <p className={textClass}>{selectedForm.customerName}</p>
                </div>
              </div>

              <div>
                <Label className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                  Email Address
                </Label>
                <div className={`flex items-center gap-3 p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-100 border border-gray-300'}`}>
                  <Mail className={`w-5 h-5 ${textMutedClass}`} />
                  <p className={textClass}>{selectedForm.customerEmail}</p>
                </div>
              </div>

              <div>
                <Label className={`text-sm mb-3 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                  Form Details
                </Label>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#161616]' : 'bg-gray-100 border border-gray-300'} space-y-3`}>
                  {Object.entries(selectedForm.data).map(([key, value]) => {
                    // Convert camelCase to Title Case
                    const label = key.replace(/([A-Z])/g, ' $1').trim();
                    return (
                      <div key={key} className={`pb-3 border-b ${borderClass} last:border-0 last:pb-0`}>
                        <p className={`text-xs mb-1 capitalize ${textMutedClass}`}>
                          {label}
                        </p>
                        <p className={`text-sm ${textClass}`}>
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className={`text-sm mb-3 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                  Update Status
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant={selectedForm.status === 'new' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateStatus(selectedForm.id, 'new')}
                    className="flex-1 min-h-[44px] h-10"
                  >
                    New
                  </Button>
                  <Button
                    variant={selectedForm.status === 'reviewed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateStatus(selectedForm.id, 'reviewed')}
                    className="flex-1 min-h-[44px] h-10"
                  >
                    Reviewed
                  </Button>
                  <Button
                    variant={selectedForm.status === 'responded' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateStatus(selectedForm.id, 'responded')}
                    className="flex-1 min-h-[44px] h-10"
                  >
                    Responded
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} rounded-lg border p-12 text-center h-full flex items-center justify-center`}>
            <div>
              <FileText className={`w-16 h-16 ${textMutedClass} mx-auto mb-4`} />
              <h3 className={`text-lg mb-2 ${textClass}`}>No submission selected</h3>
              <p className={textMutedClass}>Select a form submission from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;
