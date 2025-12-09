import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import {
  Bot,
  Calendar,
  MessageSquare,
  Phone,
  Settings,
  Zap,
  CheckCircle2,
  XCircle,
  Plus,
  Save,
  Upload,
  FileText,
  Brain,
  Key,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  Activity,
  PlayCircle,
  PauseCircle,
  Copy,
  ExternalLink,
  Send,
  Minimize2,
  Code2,
  Sparkles,
  Palette,
  Globe,
  BarChart3,
  Zap as Lightning,
  Shield
} from 'lucide-react';
import { BookingChatAssistant } from '../components/aiagents/BookingChatAssistant';
import { ChatHistoryDialog } from '../components/aiagents/ChatHistoryDialog';
import { AssistantConfigDialog } from '../components/aiagents/AssistantConfigDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { PageHeader } from '../components/layout/PageHeader';
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
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth/AuthContext';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  status: 'Active' | 'Inactive' | 'Training';
  conversations: number;
  successRate: number;
  avgResponseTime: string;
}

const agents: Agent[] = [
  {
    id: 'booking',
    name: 'Booking Assistant',
    description: 'Automates booking inquiries and helps customers schedule their escape room experiences',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    status: 'Active',
    conversations: 342,
    successRate: 94,
    avgResponseTime: '1.2s'
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Handles customer questions, provides information, and resolves common issues 24/7',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    status: 'Active',
    conversations: 856,
    successRate: 91,
    avgResponseTime: '0.8s'
  },
  {
    id: 'calling',
    name: 'Calling Agent',
    description: 'Makes and receives phone calls for booking confirmations, reminders, and follow-ups',
    icon: Phone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    status: 'Inactive',
    conversations: 0,
    successRate: 0,
    avgResponseTime: '--'
  }
];

export function AIAgents() {
  const { theme } = useTheme();
  const { isRole, currentUser } = useAuth();
  const isDark = theme === 'dark';
  
  // SECURITY: Check if user is system admin (only role with API key access)
  const isSystemAdmin = currentUser?.role === 'system-admin';
  const isBetaOwner = isRole('beta-owner');
  
  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  // SECURITY: API keys should NOT be loaded from localStorage
  // They should be fetched from secure backend/Supabase Edge Functions
  const [agentStates, setAgentStates] = useState<Record<string, any>>({
    booking: {
      enabled: true,
      apiKey: '', // SECURITY: Never load API keys from localStorage
      model: 'glm-4.6',
      temperature: 0.7,
      maxTokens: 500,
      systemPrompt: 'You are a helpful booking assistant for BookingTMS escape rooms. Help customers book escape room experiences by showing them available games, dates, and times. Be friendly and guide them through the booking process step by step.',
      knowledgeBase: ['Business hours: Mon-Sun 10AM-10PM', 'Location: 123 Main Street', 'Prices start at $25/person']
    },
    support: {
      enabled: true,
      apiKey: 'sk-••••••••••••••••',
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 500,
      systemPrompt: 'You are a customer support specialist for BookingTMS escape rooms...',
      knowledgeBase: ['Cancellation policy: 24 hours notice required', 'Age requirement: 10+ years old', 'Group size: 2-8 players']
    },
    calling: {
      enabled: false,
      apiKey: '',
      voiceId: 'alloy',
      language: 'en-US',
      systemPrompt: 'You are making a booking confirmation call for BookingTMS...',
      knowledgeBase: []
    }
  });

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isTrainDialogOpen, setIsTrainDialogOpen] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState('');
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  
  // Customer Assistant States
  const [chatEnabled, setChatEnabled] = useState(true);
  const [chatColor, setChatColor] = useState('#4f46e5');
  const [chatPosition, setChatPosition] = useState<'right' | 'left'>('right');
  const [chatGreeting, setChatGreeting] = useState('Hi! How can I help you today?');
  const [chatOpen, setChatOpen] = useState(false);
  // SECURITY: API keys should NEVER be stored in localStorage
  // They must be managed through Supabase Edge Functions/secrets
  const [zaiApiKey, setZaiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState<'openai' | 'zai'>('openai');
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isEmbedTestDialogOpen, setIsEmbedTestDialogOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [isAssistantConfigOpen, setIsAssistantConfigOpen] = useState(false);

  const currentAgent = agents.find(a => a.id === selectedAgent);
  const currentState = selectedAgent ? agentStates[selectedAgent] : null;

  const handleToggleAgent = (agentId: string) => {
    setAgentStates({
      ...agentStates,
      [agentId]: {
        ...agentStates[agentId],
        enabled: !agentStates[agentId].enabled
      }
    });
    toast.success(`${agents.find(a => a.id === agentId)?.name} ${agentStates[agentId].enabled ? 'deactivated' : 'activated'}`);
  };

  const handleSaveConfig = () => {
    toast.success('Configuration saved successfully');
    setIsConfigDialogOpen(false);
  };

  const handleAddKnowledge = () => {
    if (!selectedAgent || !newKnowledge.trim()) return;
    
    setAgentStates({
      ...agentStates,
      [selectedAgent]: {
        ...agentStates[selectedAgent],
        knowledgeBase: [...agentStates[selectedAgent].knowledgeBase, newKnowledge.trim()]
      }
    });
    setNewKnowledge('');
    toast.success('Knowledge added to agent');
  };

  const handleRemoveKnowledge = (index: number) => {
    if (!selectedAgent) return;
    
    const newKnowledgeBase = [...agentStates[selectedAgent].knowledgeBase];
    newKnowledgeBase.splice(index, 1);
    
    setAgentStates({
      ...agentStates,
      [selectedAgent]: {
        ...agentStates[selectedAgent],
        knowledgeBase: newKnowledgeBase
      }
    });
    toast.success('Knowledge removed');
  };

  const openConfigDialog = (agentId: string) => {
    setSelectedAgent(agentId);
    setIsConfigDialogOpen(true);
  };

  const openTrainDialog = (agentId: string) => {
    setSelectedAgent(agentId);
    setIsTrainDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'Inactive':
        return (
          <Badge className={isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] border-0' : 'bg-gray-100 text-gray-700 border-0'}>
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'Training':
        return (
          <Badge className={isDark ? 'bg-yellow-500/20 text-yellow-400 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>
            <Brain className="w-3 h-3 mr-1" />
            Training
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleCopyEmbedCode = () => {
    const embedCode = `<!-- BookingTMS AI Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['BookingTMS']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','btms','https://cdn.bookingtms.com/widget.js'));
  btms('init', {
    apiKey: 'YOUR_API_KEY_HERE',
    color: '${chatColor}',
    position: '${chatPosition}',
    greeting: '${chatGreeting}'
  });
</script>`;
    
    navigator.clipboard.writeText(embedCode);
    toast.success('Embed code copied to clipboard');
  };

  const handleAddToWebsite = () => {
    toast.success('Chat widget added to your website successfully');
  };

  const handleSaveApiKey = () => {
    if (!openaiApiKey.trim()) {
      toast.error('Please enter a valid OpenAI API key');
      return;
    }
    
    // SECURITY: API keys should be saved to secure backend, not localStorage
    // In production, these would be stored in Supabase with proper encryption
    // localStorage storage removed for security
    
    setAgentStates({
      ...agentStates,
      booking: {
        ...agentStates.booking,
        apiKey: openaiApiKey
      }
    });
    setIsApiKeyDialogOpen(false);
    toast.success(`OpenAI API key and model (${llmModel}) saved successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="AI Agents"
        description="Manage your AI-powered automation agents"
        sticky
        action={
          <Button 
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Agent
          </Button>
        }
      />

      {/* Customer Assistant Section - Featured (Hidden for Beta Owners) */}
      {!isBetaOwner && (
      <Card className={`${cardBgClass} border-2 ${isDark ? 'border-[#4f46e5]/30 shadow-[0_0_30px_rgba(79,70,229,0.15)]' : 'border-blue-200 shadow-lg'}`}>
        <CardHeader className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ 
                  background: isDark 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                    : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)'
                }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className={textClass}>Customer Assistant</CardTitle>
                  <Badge 
                    className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0' : 'bg-blue-600 text-white border-0'}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
                <CardDescription className={textMutedClass}>
                  AI-powered chat widget for your website • Handles bookings, questions & support
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
              <span className={`text-sm ${textMutedClass}`}>{chatEnabled ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Configuration */}
            <div className="space-y-6">
              <div>
                <h3 className={`text-sm mb-3 flex items-center gap-2 ${textClass}`}>
                  <Settings className="w-4 h-4" />
                  Widget Customization
                </h3>
                <div className="space-y-4">
                  {/* Color Picker */}
                  <div className="space-y-2">
                    <Label htmlFor="chatColor" className={`flex items-center gap-2 ${textClass}`}>
                      <Palette className="w-4 h-4" />
                      Primary Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="chatColor"
                        type="color"
                        value={chatColor}
                        onChange={(e) => setChatColor(e.target.value)}
                        className="w-20 h-11 cursor-pointer"
                      />
                      <Input
                        value={chatColor}
                        onChange={(e) => setChatColor(e.target.value)}
                        className="flex-1 h-11"
                        placeholder="#4f46e5"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <Label className={textClass}>Widget Position</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={chatPosition === 'right' ? 'default' : 'outline'}
                        style={{ backgroundColor: chatPosition === 'right' && isDark ? '#4f46e5' : undefined }}
                        className={chatPosition === 'right' && !isDark ? 'bg-blue-600' : ''}
                        onClick={() => setChatPosition('right')}
                      >
                        Bottom Right
                      </Button>
                      <Button
                        variant={chatPosition === 'left' ? 'default' : 'outline'}
                        style={{ backgroundColor: chatPosition === 'left' && isDark ? '#4f46e5' : undefined }}
                        className={chatPosition === 'left' && !isDark ? 'bg-blue-600' : ''}
                        onClick={() => setChatPosition('left')}
                      >
                        Bottom Left
                      </Button>
                    </div>
                  </div>

                  {/* Greeting Message */}
                  <div className="space-y-2">
                    <Label htmlFor="greeting" className={textClass}>Greeting Message</Label>
                    <Input
                      id="greeting"
                      value={chatGreeting}
                      onChange={(e) => setChatGreeting(e.target.value)}
                      placeholder="Hi! How can I help you today?"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator className={borderClass} />

              {/* AI Configuration */}
              <div>
                <h3 className={`text-sm mb-3 flex items-center gap-2 ${textClass}`}>
                  <Brain className="w-4 h-4" />
                  AI Configuration
                </h3>
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <Key className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textMutedClass}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${textClass}`}>AI Provider Configuration</p>
                        <p className={`text-xs mt-1 ${textMutedClass}`}>
                          {openaiApiKey ? '✅ OpenAI configured' : '⚙️ Configure OpenAI'} 
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`}>
                          Provider: OpenAI • Model: {llmModel}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => setIsApiKeyDialogOpen(true)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      {openaiApiKey ? 'Update Configuration' : 'Configure OpenAI'}
                    </Button>
                  </div>
                  
                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                      ⭐ <strong>Get Started:</strong> Create your API key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">OpenAI Platform</a>
                    </p>
                  </div>
                </div>
              </div>

              <Separator className={borderClass} />

              {/* Installation Options */}
              <div>
                <h3 className={`text-sm mb-3 flex items-center gap-2 ${textClass}`}>
                  <Globe className="w-4 h-4" />
                  Installation
                </h3>
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Automatic Installation</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                          Add the chat widget to all pages of your BookingTMS website with one click
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="w-full h-11"
                      style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                      onClick={handleAddToWebsite}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Add to My Website
                    </Button>
                  </div>

                  <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <Code2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textMutedClass}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${textClass}`}>Manual Installation</p>
                        <p className={`text-xs mt-1 ${textMutedClass}`}>
                          Get embed code to add the widget to any website
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => setIsEmbedDialogOpen(true)}
                    >
                      <Code2 className="w-4 h-4 mr-2" />
                      Get Embed Code
                    </Button>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <ExternalLink className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textMutedClass}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${textClass}`}>Test Widget</p>
                        <p className={`text-xs mt-1 ${textMutedClass}`}>
                          Test the chat widget in a full-page embed preview
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => setIsEmbedTestDialogOpen(true)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Test in Embed
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className={`lg:hidden ${borderClass}`} />

              {/* Features */}
              <div>
                <h3 className={`text-sm mb-3 ${textClass}`}>Included Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    Booking Assistance
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    24/7 Support
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    FAQ Answers
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${textMutedClass}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                    Lead Capture
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm flex items-center gap-2 ${textClass}`}>
                  <Activity className="w-4 h-4" />
                  Live Preview
                </h3>
                <Badge variant="secondary" className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>

              {/* Website Preview */}
              <div className={`rounded-xl p-6 border-2 relative h-[600px] overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}>
                {/* Fake Website Background */}
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-[#0a0a0a] to-[#161616]' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                  <div className="p-4">
                    <div className={`h-8 w-48 rounded mb-4 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                    <div className="space-y-2">
                      <div className={`h-4 w-full rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                      <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                      <div className={`h-4 w-5/6 rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className={`h-24 rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                      <div className={`h-24 rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>

                {/* Interactive Chat Widget */}
                <div 
                  className={`absolute bottom-6 ${chatPosition === 'right' ? 'right-6' : 'left-6'} transition-all duration-300`}
                  style={{ zIndex: 10 }}
                >
                  <BookingChatAssistant
                    chatColor={chatColor}
                    chatPosition={chatPosition}
                    chatGreeting={chatGreeting}
                    isOpen={chatOpen}
                    onToggle={() => setChatOpen(!chatOpen)}
                    apiKey={openaiApiKey}
                    provider="openai"
                    model={llmModel}
                    onOpenHistory={() => setIsChatHistoryOpen(true)}
                    onOpenSettings={() => setIsAssistantConfigOpen(true)}
                  />
                </div>
              </div>

              <div className={`text-xs text-center space-y-1 ${textMutedClass}`}>
                <p className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Interactive AI-Powered Booking Experience</span>
                </p>
                <p>Click the chat bubble and try: "Book a room" or "Show me available games"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Conversations</p>
                <p className={`text-2xl mt-1 ${textClass}`}>1,198</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>↑ 23% from last month</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <MessageSquare className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Success Rate</p>
                <p className={`text-2xl mt-1 ${textClass}`}>92%</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>↑ 5% improvement</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <TrendingUp className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Avg Response Time</p>
                <p className={`text-2xl mt-1 ${textClass}`}>1.0s</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>↓ 0.3s faster</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Clock className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Active Agents</p>
                <p className={`text-2xl mt-1 ${textClass}`}>2/3</p>
                <p className={`text-xs mt-1 ${textMutedClass}`}>1 agent inactive</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <Bot className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Divider */}
      <div className="flex items-center gap-4">
        <Separator className={`flex-1 ${borderClass}`} />
        <h2 className={`text-lg ${textClass}`}>Specialized AI Agents</h2>
        <Separator className={`flex-1 ${borderClass}`} />
      </div>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const state = agentStates[agent.id];
          const Icon = agent.icon;
          
          return (
            <Card key={agent.id} className={`${cardBgClass} border ${borderClass} shadow-sm hover:shadow-md transition-shadow`}>
              <CardHeader className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 
                    (agent.id === 'booking' ? 'bg-[#4f46e5]/20' : agent.id === 'support' ? 'bg-emerald-500/20' : 'bg-purple-500/20') 
                    : agent.bgColor
                  }`}>
                    <Icon className={`w-7 h-7 ${isDark ? 
                      (agent.id === 'booking' ? 'text-[#6366f1]' : agent.id === 'support' ? 'text-emerald-400' : 'text-purple-400')
                      : agent.color
                    }`} />
                  </div>
                  {getStatusBadge(agent.status)}
                </div>
                <CardTitle className={textClass}>{agent.name}</CardTitle>
                <CardDescription className={`${textMutedClass} line-clamp-2`}>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {/* Performance Metrics */}
                <div className={`grid grid-cols-3 gap-3 p-4 rounded-lg ${bgElevatedClass}`}>
                  <div className="text-center">
                    <p className={`text-lg ${textClass}`}>{agent.conversations}</p>
                    <p className={`text-xs ${textMutedClass}`}>Conversations</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg ${textClass}`}>{agent.successRate}%</p>
                    <p className={`text-xs ${textMutedClass}`}>Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg ${textClass}`}>{agent.avgResponseTime}</p>
                    <p className={`text-xs ${textMutedClass}`}>Avg Response</p>
                  </div>
                </div>

                {/* Enable/Disable Toggle - Hidden for Beta Owners */}
                {!isBetaOwner && (
                  <div className={`flex items-center justify-between p-3 border rounded-lg ${borderClass}`}>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={state.enabled}
                        onCheckedChange={() => handleToggleAgent(agent.id)}
                      />
                      <span className={`text-sm ${textClass}`}>
                        {state.enabled ? 'Agent Active' : 'Agent Inactive'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Beta Owner View - Status Only */}
                {isBetaOwner && (
                  <div className={`p-4 border rounded-lg ${borderClass} ${bgElevatedClass}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${textClass}`}>Status</span>
                      <Badge variant={state.enabled ? "default" : "secondary"} className={state.enabled ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : ""}>
                        {state.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className={`text-xs ${textMutedClass} mt-2`}>
                      Contact support to modify agent settings
                    </p>
                  </div>
                )}

                <Separator className={borderClass} />

                {/* Action Buttons - Hidden for Beta Owners */}
                {!isBetaOwner && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => openConfigDialog(agent.id)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-11"
                        onClick={() => openTrainDialog(agent.id)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Train
                      </Button>
                    </div>
                    <Button 
                      className="w-full h-11"
                      style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </>
                )}
                
                {/* Beta Owner - View Only Button */}
                {isBetaOwner && (
                  <Button 
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => toast.info('Analytics available in Pro plan')}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className={`max-w-3xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Configure {currentAgent?.name}</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Set up API credentials and customize agent behavior
            </DialogDescription>
          </DialogHeader>

          {selectedAgent && currentState && (
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="api">API Setup</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              {/* API Setup Tab */}
              <TabsContent value="api" className="space-y-4 mt-4">
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>API Key Required</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                        You'll need an API key from OpenAI, Anthropic, or another AI provider to use this agent.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider" className={textClass}>AI Provider</Label>
                    <Select defaultValue="openai">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="google">Google (Gemini)</SelectItem>
                        <SelectItem value="custom">Custom Endpoint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className={textClass}>API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        defaultValue={currentState.apiKey}
                      />
                      <Button variant="outline" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className={`text-xs ${textMutedClass}`}>
                      Your API key is encrypted and stored securely
                    </p>
                  </div>

                  {selectedAgent !== 'calling' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="model" className={textClass}>Model</Label>
                        <Select defaultValue={currentState.model}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                            <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Fast)</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Cost-effective)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="temperature" className={textClass}>Temperature</Label>
                          <Input
                            id="temperature"
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            defaultValue={currentState.temperature}
                          />
                          <p className={`text-xs ${textMutedClass}`}>Controls creativity (0-2)</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maxTokens" className={textClass}>Max Tokens</Label>
                          <Input
                            id="maxTokens"
                            type="number"
                            defaultValue={currentState.maxTokens}
                          />
                          <p className={`text-xs ${textMutedClass}`}>Maximum response length</p>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedAgent === 'calling' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="voiceId" className={textClass}>Voice</Label>
                        <Select defaultValue={currentState.voiceId}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alloy">Alloy (Professional, Neutral)</SelectItem>
                            <SelectItem value="echo">Echo (Warm, Friendly)</SelectItem>
                            <SelectItem value="fable">Fable (Clear, Expressive)</SelectItem>
                            <SelectItem value="onyx">Onyx (Deep, Authoritative)</SelectItem>
                            <SelectItem value="nova">Nova (Energetic, Bright)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language" className={textClass}>Language</Label>
                        <Select defaultValue={currentState.language}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="es-ES">Spanish</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Behavior Tab */}
              <TabsContent value="behavior" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt" className={textClass}>System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    rows={6}
                    defaultValue={currentState.systemPrompt}
                    placeholder="Define how the AI agent should behave..."
                  />
                  <p className={`text-xs ${textMutedClass}`}>
                    This instruction guides the AI's behavior and personality
                  </p>
                </div>

                <Separator className={borderClass} />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className={textClass}>Knowledge Base</Label>
                    <Badge variant="secondary" className={textMutedClass}>
                      {currentState.knowledgeBase.length} items
                    </Badge>
                  </div>

                  <div className={`p-4 rounded-lg space-y-2 ${bgElevatedClass}`}>
                    {currentState.knowledgeBase.map((item: string, index: number) => (
                      <div 
                        key={index} 
                        className={`flex items-start justify-between p-3 rounded border group ${borderClass} ${hoverBgClass}`}
                      >
                        <p className={`text-sm flex-1 ${textClass}`}>{item}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveKnowledge(index)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new knowledge item..."
                      value={newKnowledge}
                      onChange={(e) => setNewKnowledge(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKnowledge()}
                    />
                    <Button onClick={handleAddKnowledge}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Integration Tab */}
              <TabsContent value="integration" className="space-y-4 mt-4">
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start gap-2">
                    <Shield className={`w-5 h-5 mt-0.5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Integration Options</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                        Connect this agent to your booking system, CRM, or other tools
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                          <Calendar className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <p className={`text-sm ${textClass}`}>Booking System</p>
                          <p className={`text-xs ${textMutedClass}`}>Create and manage bookings</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                          <Users className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                        </div>
                        <div>
                          <p className={`text-sm ${textClass}`}>CRM Integration</p>
                          <p className={`text-xs ${textMutedClass}`}>Sync customer data</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${borderClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                          <Mail className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <p className={`text-sm ${textClass}`}>Email Notifications</p>
                          <p className={`text-xs ${textMutedClass}`}>Send automated emails</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              onClick={handleSaveConfig}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={isTrainDialogOpen} onOpenChange={setIsTrainDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Train {currentAgent?.name}</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Upload documents and data to improve agent knowledge
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isDark ? 'border-[#2a2a2a] bg-[#0a0a0a]' : 'border-gray-300 bg-gray-50'}`}>
              <Upload className={`w-12 h-12 mx-auto mb-3 ${textMutedClass}`} />
              <p className={`text-sm mb-2 ${textClass}`}>Upload Training Documents</p>
              <p className={`text-xs mb-4 ${textMutedClass}`}>
                PDF, DOCX, TXT files up to 10MB
              </p>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>

            <Separator className={borderClass} />

            <div className="space-y-3">
              <Label className={textClass}>Recent Training Sessions</Label>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-4 h-4 ${textMutedClass}`} />
                      <div>
                        <p className={`text-sm ${textClass}`}>FAQ Document.pdf</p>
                        <p className={`text-xs ${textMutedClass}`}>Uploaded 2 days ago</p>
                      </div>
                    </div>
                    <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                      Trained
                    </Badge>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-4 h-4 ${textMutedClass}`} />
                      <div>
                        <p className={`text-sm ${textClass}`}>Booking Policies.docx</p>
                        <p className={`text-xs ${textMutedClass}`}>Uploaded 1 week ago</p>
                      </div>
                    </div>
                    <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                      Trained
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTrainDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Embed Code</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Copy and paste this code into your website's HTML
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-900 border-gray-700'}`}>
              <code className="text-xs text-gray-100 block overflow-x-auto">
                {`<!-- BookingTMS AI Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['BookingTMS']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','btms','https://cdn.bookingtms.com/widget.js'));
  btms('init', {
    apiKey: 'YOUR_API_KEY_HERE',
    color: '${chatColor}',
    position: '${chatPosition}',
    greeting: '${chatGreeting}'
  });
</script>`}
              </code>
            </div>

            <div className={`p-3 rounded-lg border ${isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <p className={`text-xs ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  Replace YOUR_API_KEY_HERE with your actual API key from Settings → API Keys
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEmbedDialogOpen(false)}>
              Close
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              onClick={handleCopyEmbedCode}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Configuration Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className={`${cardBgClass} border ${borderClass} max-w-lg`}>
          <DialogHeader>
            <DialogTitle className={textClass}>AI API Configuration</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Configure your OpenAI API key to enable intelligent responses for the booking assistant.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Provider Display (Text Only) */}
            <div className="space-y-2">
              <Label className={`text-gray-700 ${isDark ? 'text-white' : ''}`}>AI Provider</Label>
              <div className={`h-11 px-3 rounded-lg border flex items-center ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
                <p className={textClass}>OpenAI</p>
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label className={`text-gray-700 ${isDark ? 'text-white' : ''}`}>Model</Label>
              <Select value={llmModel} onValueChange={setLlmModel}>
                <SelectTrigger className={`h-11 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}>
                  <SelectItem value="gpt-4o">GPT-4o (Most capable, multimodal)</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini (Affordable & intelligent)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Previous generation)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & cost-effective)</SelectItem>
                  <SelectItem value="o1-preview">O1 Preview (Advanced reasoning)</SelectItem>
                  <SelectItem value="o1-mini">O1 Mini (Faster reasoning)</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-xs ${textMutedClass}`}>
                Choose the AI model that best fits your needs and budget
              </p>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className={`text-gray-700 ${isDark ? 'text-white' : ''}`}>OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                className={`h-11 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a] placeholder:text-gray-500' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
              />
            </div>

            {/* Getting Started Info */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex gap-2 mb-2">
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Getting Started</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">OpenAI Platform</a><br />
                    2. Generate an API key<br />
                    3. Paste it above and click Save
                  </p>
                </div>
              </div>
            </div>

            {/* API Details */}
            <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs ${textMutedClass}`}>
                <strong>Provider:</strong> OpenAI<br />
                <strong>Model:</strong> {llmModel}<br />
                <strong>Endpoint:</strong> https://api.openai.com/v1/chat/completions
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={handleSaveApiKey}
            >
              <Save className="w-4 h-4 mr-2" />
              Save API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Test Dialog */}
      <Dialog open={isEmbedTestDialogOpen} onOpenChange={setIsEmbedTestDialogOpen}>
        <DialogContent className={`${cardBgClass} border ${borderClass} max-w-6xl h-[90vh]`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Test Booking Assistant</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Full-page preview of the AI booking assistant widget. Test the complete booking flow.
            </DialogDescription>
          </DialogHeader>
          
          <div className={`flex-1 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'} overflow-hidden relative h-[calc(90vh-160px)]`}>
            {/* Simulated Website */}
            <div className="absolute inset-0 p-6">
              <div className="max-w-4xl mx-auto">
                <div className={`h-12 w-64 rounded-lg mb-6 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                <div className="space-y-4">
                  <div className={`h-6 w-full rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                  <div className={`h-6 w-5/6 rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                  <div className={`h-6 w-4/6 rounded ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className={`h-32 rounded-lg ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                  <div className={`h-32 rounded-lg ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                  <div className={`h-32 rounded-lg ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {/* Chat Widget */}
            <div 
              className={`absolute bottom-6 ${chatPosition === 'right' ? 'right-6' : 'left-6'}`}
              style={{ zIndex: 50 }}
            >
              <BookingChatAssistant
                chatColor={chatColor}
                chatPosition={chatPosition}
                chatGreeting={chatGreeting}
                isOpen={true}
                onToggle={() => {}}
                apiKey={openaiApiKey}
                provider="openai"
                model={llmModel}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmbedTestDialogOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat History Dialog */}
      <ChatHistoryDialog
        isOpen={isChatHistoryOpen}
        onClose={() => setIsChatHistoryOpen(false)}
      />

      {/* Assistant Configuration Dialog */}
      <AssistantConfigDialog
        isOpen={isAssistantConfigOpen}
        onClose={() => setIsAssistantConfigOpen(false)}
      />
    </div>
  );
}

function Mail(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
