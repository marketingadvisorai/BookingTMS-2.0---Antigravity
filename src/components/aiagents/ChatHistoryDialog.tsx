import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import {
  History,
  MessageSquare,
  Calendar,
  Search,
  Trash2,
  Download,
  Filter,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text?: string;
  timestamp?: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

interface ChatHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistoryDialog({ isOpen, onClose }: ChatHistoryDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = () => {
    const saved = localStorage.getItem('chatConversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      const withDates = parsed.map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined
        }))
      }));
      setConversations(withDates);
    }
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem('chatConversations', JSON.stringify(updated));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
  };

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to delete all chat history?')) {
      setConversations([]);
      setSelectedConversation(null);
      localStorage.removeItem('chatConversations');
    }
  };

  const exportConversation = (conversation: Conversation) => {
    const text = conversation.messages
      .map(msg => `[${msg.type.toUpperCase()}]: ${msg.text || '(Interactive component)'}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${format(conversation.timestamp, 'yyyy-MM-dd-HHmm')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredConversations = conversations
    .filter(conv => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = conv.title.toLowerCase().includes(query);
        const messageMatch = conv.messages.some(msg => 
          msg.text?.toLowerCase().includes(query)
        );
        if (!titleMatch && !messageMatch) return false;
      }

      // Time filter
      if (filterType !== 'all') {
        const now = new Date();
        const convDate = new Date(conv.timestamp);
        const daysDiff = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filterType === 'today' && daysDiff > 0) return false;
        if (filterType === 'week' && daysDiff > 7) return false;
        if (filterType === 'month' && daysDiff > 30) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl h-[600px] ${bgClass} ${textClass} border ${borderClass}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${textClass}`}>
            <History className="w-5 h-5" />
            Chat History
          </DialogTitle>
          <DialogDescription className={textMutedClass}>
            View and manage your past conversations
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[480px]">
          {/* Conversations List */}
          <div className={`w-1/3 border-r ${borderClass} flex flex-col`}>
            {/* Search and Filters */}
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMutedClass}`} />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 h-10 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
                />
              </div>

              <div className="flex gap-1">
                {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={filterType === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(filter)}
                    className={`text-xs ${
                      filterType === filter && isDark 
                        ? 'bg-[#4f46e5]' 
                        : filterType === filter 
                        ? 'bg-blue-600' 
                        : ''
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {filteredConversations.length === 0 ? (
                  <div className={`text-center py-8 ${textMutedClass}`}>
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedConversation?.id === conv.id
                          ? isDark
                            ? 'bg-[#4f46e5]/20 border-[#4f46e5]'
                            : 'bg-blue-50 border-blue-400'
                          : isDark
                          ? 'bg-[#1e1e1e] border-[#2a2a2a] hover:border-[#4f46e5]'
                          : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm truncate ${textClass}`}>
                          {conv.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {conv.messages.length}
                        </Badge>
                      </div>
                      <p className={`text-xs ${textMutedClass}`}>
                        {format(new Date(conv.timestamp), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            {conversations.length > 0 && (
              <div className="pt-3 border-t mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllHistory}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All History
                </Button>
              </div>
            )}
          </div>

          {/* Conversation Detail */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className={`pb-3 mb-3 border-b ${borderClass} flex items-center justify-between`}>
                  <div>
                    <h3 className={`text-sm ${textClass}`}>{selectedConversation.title}</h3>
                    <p className={`text-xs ${textMutedClass}`}>
                      {format(new Date(selectedConversation.timestamp), 'MMMM dd, yyyy • HH:mm')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportConversation(selectedConversation)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteConversation(selectedConversation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-4">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'bot'
                              ? isDark
                                ? 'bg-[#1e1e1e] border border-[#2a2a2a]'
                                : 'bg-white border border-gray-200'
                              : isDark
                              ? 'bg-[#4f46e5] text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p className="text-sm">
                            {message.text || '(Interactive component)'}
                          </p>
                          {message.timestamp && (
                            <p className={`text-xs mt-1 ${
                              message.type === 'bot' ? textMutedClass : 'text-white/70'
                            }`}>
                              {format(new Date(message.timestamp), 'HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${textMutedClass}`}>
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a conversation to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
