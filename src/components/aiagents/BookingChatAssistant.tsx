import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useTheme } from '../layout/ThemeContext';
import {
  Bot,
  User,
  Calendar,
  Clock,
  Users,
  Send,
  Minimize2,
  MessageSquare,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  X,
  History,
  Settings,
  Lightbulb
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format } from 'date-fns';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text?: string;
  component?: 'game-selector' | 'date-picker' | 'time-slots' | 'participant-count' | 'checkout-summary';
  data?: any;
  timestamp?: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

interface BookingChatAssistantProps {
  chatColor: string;
  chatPosition: 'left' | 'right';
  chatGreeting: string;
  isOpen: boolean;
  onToggle: () => void;
  apiKey?: string;
  provider?: 'openai';
  model?: string;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
}

// Assistant configuration (mirrors AssistantConfigDialog)
interface AssistantConfig {
  personality: {
    tone: 'professional' | 'friendly' | 'casual';
    style: 'concise' | 'detailed' | 'balanced';
    greeting: string;
    signOff: string;
  };
  knowledge: {
    customFAQs: { id: string; question: string; answer: string }[];
    businessHours: string;
    specialInstructions: string;
  };
  behavior: {
    autoSuggest: boolean;
    showPrices: boolean;
    collectFeedback: boolean;
    escalateToHuman: boolean;
  };
}

// Mock games data
const GAMES = [
  {
    id: '1',
    name: 'Mystery Mansion',
    description: 'Solve the haunted mansion mystery',
    difficulty: 'Medium',
    duration: '60 min',
    minPlayers: 2,
    maxPlayers: 8,
    price: 29
  },
  {
    id: '2',
    name: 'Prison Break',
    description: 'Escape before time runs out',
    difficulty: 'Hard',
    duration: '75 min',
    minPlayers: 4,
    maxPlayers: 10,
    price: 35
  },
  {
    id: '3',
    name: 'Lost Temple',
    description: 'Discover ancient treasures',
    difficulty: 'Easy',
    duration: '45 min',
    minPlayers: 2,
    maxPlayers: 6,
    price: 25
  },
  {
    id: '4',
    name: 'Zombie Outbreak',
    description: 'Survive the apocalypse',
    difficulty: 'Hard',
    duration: '60 min',
    minPlayers: 4,
    maxPlayers: 8,
    price: 32
  }
];

// Time slots
const TIME_SLOTS = [
  '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', 
  '4:00 PM', '5:30 PM', '7:00 PM', '8:30 PM'
];

// Quick suggestions
const QUICK_SUGGESTIONS = [
  { text: 'Show me available rooms', icon: '🎮' },
  { text: 'Book for tonight', icon: '📅' },
  { text: 'What are the prices?', icon: '💰' },
  { text: 'Help me choose', icon: '💡' }
];

export function BookingChatAssistant({
  chatColor,
  chatPosition,
  chatGreeting,
  isOpen,
  onToggle,
  apiKey,
  provider = 'openai',
  model,
  onOpenHistory,
  onOpenSettings
}: BookingChatAssistantProps): JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  // Load assistant configuration from localStorage
  const [assistantConfig, setAssistantConfig] = useState<AssistantConfig | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: chatGreeting,
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'bot',
      text: "I can help you book an escape room experience! Let me show you our available games:",
      component: 'game-selector',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [selectedGame, setSelectedGame] = useState<typeof GAMES[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(2);
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Read assistant configuration on mount and when localStorage changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem('assistantConfig');
      if (saved) {
        setAssistantConfig(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
    const handler = (e: StorageEvent) => {
      if (e.key === 'assistantConfig') {
        try {
          setAssistantConfig(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Apply greeting and behavior toggles when config loads
  useEffect(() => {
    if (!assistantConfig) return;

    // Replace initial greeting if we're still at the initial two messages
    if (messages.length === 2) {
      setMessages((prev: Message[]) => {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          text: assistantConfig.personality?.greeting || chatGreeting
        };
        return updated;
      });
    }

    // Toggle quick suggestions based on config
    if (assistantConfig.behavior?.autoSuggest === false) {
      setShowSuggestions(false);
    }
  }, [assistantConfig]);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 2) {
      const conversations = JSON.parse(localStorage.getItem('chatConversations') || '[]');
      const currentConversation: Conversation = {
        id: Date.now().toString(),
        title: messages[2]?.text?.substring(0, 50) || 'New Conversation',
        messages,
        timestamp: new Date()
      };
      
      // Keep only last 20 conversations
      const updatedConversations = [currentConversation, ...conversations].slice(0, 20);
      localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
    }
  }, [messages]);

  const addBotMessage = (text: string, component?: Message['component'], data?: any) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev: Message[]) => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        text,
        component,
        data,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev: Message[]) => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date()
    }]);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const handleGameSelect = (game: typeof GAMES[0]) => {
    setSelectedGame(game);
    addUserMessage(`I'd like to book ${game.name}`);
    addBotMessage(
      `Great choice! ${game.name} is a ${game.difficulty.toLowerCase()} level room that takes ${game.duration}. Let's pick a date:`,
      'date-picker'
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    addUserMessage(`I'd like to book for ${format(date, 'MMMM dd, yyyy')}`);
    addBotMessage(
      `Perfect! Here are the available time slots for ${format(date, 'MMMM dd')}:`,
      'time-slots'
    );
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    addUserMessage(`${time} works for me`);
    addBotMessage(
      `Excellent! How many people will be joining you? (${selectedGame?.minPlayers}-${selectedGame?.maxPlayers} players)`,
      'participant-count'
    );
  };

  const handleParticipantSelect = (count: number) => {
    setParticipantCount(count);
    addUserMessage(`${count} people`);
    addBotMessage(
      `Perfect! Here's your booking summary:`,
      'checkout-summary'
    );
  };

  const handleCheckout = () => {
    addUserMessage('Proceed to checkout');
    addBotMessage(
      `🎉 Awesome! Redirecting you to checkout to complete your booking...`
    );
    setTimeout(() => {
      addBotMessage(
        `Your booking details have been saved. You can continue this conversation anytime, or start a new booking by typing "book another room".`
      );
    }, 2000);
  };

  const callLLMAPI = async (userMessage: string): Promise<string> => {
    if (!apiKey || !apiKey.trim()) {
      return "I'd love to help you book an escape room! Let me show you our available games:";
    }

    try {
      const composeSystemPrompt = (): string => {
        const tone = assistantConfig?.personality?.tone || 'friendly';
        const style = assistantConfig?.personality?.style || 'balanced';
        const hours = assistantConfig?.knowledge?.businessHours;
        const special = assistantConfig?.knowledge?.specialInstructions;
        const faqs = assistantConfig?.knowledge?.customFAQs || [];
        const showPrices = assistantConfig?.behavior?.showPrices !== false; // default true
        const escalate = assistantConfig?.behavior?.escalateToHuman ? 'Yes' : 'No';
        const feedback = assistantConfig?.behavior?.collectFeedback ? 'Yes' : 'No';

        const gamesList = `Available games:\n1. Mystery Mansion - Medium difficulty, 60 min, 2-8 players${showPrices ? ', $29/person' : ''}\n2. Prison Break - Hard difficulty, 75 min, 4-10 players${showPrices ? ', $35/person' : ''}\n3. Lost Temple - Easy difficulty, 45 min, 2-6 players${showPrices ? ', $25/person' : ''}\n4. Zombie Outbreak - Hard difficulty, 60 min, 4-8 players${showPrices ? ', $32/person' : ''}`;
        const slotsList = 'Available time slots: 10:00 AM, 11:30 AM, 1:00 PM, 2:30 PM, 4:00 PM, 5:30 PM, 7:00 PM, 8:30 PM';

        const faqText = faqs.length
          ? `Additional FAQs:\n${faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}`
          : '';

        const pricingRule = showPrices
          ? 'Include pricing details when relevant.'
          : 'Avoid quoting exact prices; if asked, say pricing is shown during checkout.';

        const escalationRule = escalate === 'Yes'
          ? 'If the user seems stuck or requests a human, offer to escalate to a human agent.'
          : '';

        const feedbackRule = feedback === 'Yes'
          ? 'At the end of the booking or conversation, politely ask for feedback or a quick rating.'
          : '';

        return [
          'You are a helpful booking assistant for BookingTMS escape rooms.',
          'Your goal is to help customers book escape room experiences.',
          `Respond with a ${tone} tone and ${style} style.`,
          hours ? `Business hours: ${hours}` : undefined,
          special ? `Special instructions: ${special}` : undefined,
          gamesList,
          slotsList,
          'Guide the customer through: 1) selecting a game, 2) picking a date, 3) choosing a time slot, 4) number of participants, 5) completing checkout.',
          pricingRule,
          escalationRule || undefined,
          feedbackRule || undefined,
          faqText || undefined,
          'Keep responses user-friendly. When appropriate, suggest showing available games or booking options.',
        ]
          .filter((line): line is string => Boolean(line))
          .join('\n\n');
      };

      const systemPrompt = composeSystemPrompt();

      // Get Supabase project info
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');

      // Use the provided model or fallback to gpt-4o-mini
      const defaultModel = model || 'gpt-4o-mini';

      // Call our backend server endpoint (server-to-server, no CORS)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            apiKey,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            model: defaultModel,
            temperature: 0.7,
            maxTokens: 200,
            provider
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I can help you book an escape room! Would you like to see our available games?";
    } catch (error) {
      console.error(`${provider.toUpperCase()} API error:`, error);
      // Fallback to simple responses
      return "I'd love to help you book an escape room! Let me show you our available games:";
    }
  };

  const handleSendMessage = async (customMessage?: string): Promise<void> => {
    const messageToSend = customMessage || inputValue;
    if (!messageToSend.trim()) return;
    
    const userMsg = messageToSend;
    addUserMessage(userMsg);
    setInputValue('');
    
    // Get AI response
    setIsTyping(true);
    const aiResponse = await callLLMAPI(userMsg);
    setIsTyping(false);
    
    // Analyze response to determine if we should show UI components
    const lowerResponse = aiResponse.toLowerCase();
    const lowerInput = userMsg.toLowerCase();
    
    if (lowerInput.includes('book') || lowerInput.includes('room') || lowerInput.includes('game') || 
        lowerResponse.includes('games') || lowerResponse.includes('available')) {
      addBotMessage(
        aiResponse,
        'game-selector'
      );
    } else if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      addBotMessage(
        aiResponse,
        'game-selector'
      );
    } else if (lowerInput.includes('time') || lowerInput.includes('when')) {
      addBotMessage(
        aiResponse,
        'game-selector'
      );
    } else {
      // Just show the AI response without components
      setMessages((prev: Message[]) => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        text: aiResponse,
        timestamp: new Date()
      }]);
    }
  };

  const renderComponent = (message: Message): JSX.Element | null => {
    switch (message.component) {
      case 'game-selector':
        return (
          <div className="space-y-2 mt-3">
            {GAMES.map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${ 
                  isDark 
                    ? 'bg-[#1e1e1e] border-[#2a2a2a] hover:border-[#4f46e5]' 
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm ${textClass}`}>{game.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          game.difficulty === 'Easy' 
                            ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'
                            : game.difficulty === 'Medium'
                            ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                            : isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {game.difficulty}
                      </Badge>
                    </div>
                    <p className={`text-xs ${textMutedClass} mb-2`}>{game.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${textMutedClass}`}>
                        <Clock className="w-3 h-3" />
                        {game.duration}
                      </span>
                      <span className={`flex items-center gap-1 ${textMutedClass}`}>
                        <Users className="w-3 h-3" />
                        {game.minPlayers}-{game.maxPlayers}
                      </span>
                      {assistantConfig?.behavior?.showPrices !== false && (
                      <span className={`font-semibold ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`}>
                        ${game.price}/person
                      </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${textMutedClass}`} />
                </div>
              </button>
            ))}
          </div>
        );

      case 'date-picker':
        return (
          <div className={`mt-3 p-4 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date: Date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
              className={`${isDark ? '[&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-[#4f46e5]' : ''}`}
            />
          </div>
        );

      case 'time-slots':
        return (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {TIME_SLOTS.map((time: string) => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`p-3 rounded-lg border text-center transition-all ${ 
                  isDark 
                    ? 'bg-[#1e1e1e] border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/20' 
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <Clock className={`w-4 h-4 mx-auto mb-1 ${textMutedClass}`} />
                <span className={`text-sm ${textClass}`}>{time}</span>
              </button>
            ))}
          </div>
        );

      case 'participant-count':
        const minPlayers = selectedGame?.minPlayers || 2;
        const maxPlayers = selectedGame?.maxPlayers || 8;
        const playerOptions = Array.from({ length: maxPlayers - minPlayers + 1 }, (_, i) => minPlayers + i);
        
        return (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {playerOptions.map((count: number) => (
              <button
                key={count}
                onClick={() => handleParticipantSelect(count)}
                className={`p-3 rounded-lg border text-center transition-all ${ 
                  isDark 
                    ? 'bg-[#1e1e1e] border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/20' 
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <Users className={`w-4 h-4 mx-auto mb-1 ${textMutedClass}`} />
                <span className={`text-sm ${textClass}`}>{count}</span>
              </button>
            ))}
          </div>
        );

      case 'checkout-summary':
        const totalPrice = (selectedGame?.price || 0) * participantCount;
        return (
          <div className={`mt-3 p-4 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm mb-1 ${textClass}`}>{selectedGame?.name}</h4>
                  <div className={`text-xs space-y-1 ${textMutedClass}`}>
                    <p>📅 {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : 'Date not selected'}</p>
                    <p>🕐 {selectedTime || 'Time not selected'}</p>
                    <p>👥 {participantCount} {participantCount === 1 ? 'person' : 'people'}</p>
                  </div>
                </div>
              </div>
              
              <div className={`border-t pt-3 ${borderClass}`}>
                {assistantConfig?.behavior?.showPrices !== false && (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className={textMutedClass}>Price per person:</span>
                      <span className={textClass}>${selectedGame?.price}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={textMutedClass}>Participants:</span>
                      <span className={textClass}>×{participantCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={textClass}>Total:</span>
                      <span className={`text-lg ${textClass}`}>${totalPrice}</span>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full h-11"
                style={{ backgroundColor: chatColor }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative hover:scale-105 transition-transform"
        style={{ backgroundColor: chatColor }}
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
          1
        </span>
      </button>
    );
  }

  return (
    <div className={`w-[380px] rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
      {/* Chat Header */}
      <div 
        className="p-4 text-white flex items-center justify-between"
        style={{ backgroundColor: chatColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm">Booking Assistant</p>
              <Sparkles className="w-3 h-3" />
            </div>
            <p className="text-xs opacity-90">AI-Powered • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onOpenHistory && (
            <button 
              onClick={onOpenHistory}
              className="hover:bg-white/20 p-1.5 rounded transition-colors"
              title="Chat History"
            >
              <History className="w-4 h-4" />
            </button>
          )}
          {onOpenSettings && (
            <button 
              onClick={onOpenSettings}
              className="hover:bg-white/20 p-1.5 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onToggle}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`h-[480px] p-4 space-y-4 overflow-y-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        {messages.map((message: Message) => (
          <div key={message.id}>
            {message.type === 'bot' ? (
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" 
                  style={{ backgroundColor: chatColor }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 max-w-[85%]">
                  {message.text && (
                    <div className={`rounded-2xl rounded-tl-sm p-3 shadow-sm ${bgClass} border ${borderClass}`}>
                      <p className={`text-sm ${textClass}`}>{message.text}</p>
                    </div>
                  )}
                  {message.component && renderComponent(message)}
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <div 
                  className="rounded-2xl rounded-tr-sm p-3 shadow-sm max-w-[75%]"
                  style={{ backgroundColor: chatColor }}
                >
                  <p className="text-sm text-white">{message.text}</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                  <User className={`w-4 h-4 ${textMutedClass}`} />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" 
              style={{ backgroundColor: chatColor }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className={`rounded-2xl rounded-tl-sm p-3 shadow-sm ${bgClass} border ${borderClass}`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestions */}
        {showSuggestions && messages.length === 2 && (
          <div className="space-y-2 pt-2">
            <div className={`flex items-center gap-2 px-1 ${textMutedClass}`}>
              <Lightbulb className="w-3 h-3" />
              <span className="text-xs">Quick suggestions:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SUGGESTIONS.map((suggestion: { text: string; icon: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all ${
                    isDark 
                      ? 'bg-[#1e1e1e] border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/10' 
                      : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-1">{suggestion.icon}</span>
                  <span className={textClass}>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className={`p-3 border-t ${isDark ? 'border-[#2a2a2a] bg-[#161616]' : 'border-gray-200 bg-white'}`}>
        <div className="flex gap-2">
          <Input 
            placeholder="Type your message..."
            className={`flex-1 text-sm h-10 ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}
            value={inputValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            size="icon"
            style={{ backgroundColor: chatColor }}
            onClick={() => handleSendMessage()}
            className="h-10 w-10 flex-shrink-0"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
        <p className={`text-xs mt-2 text-center ${textMutedClass}`}>
          Powered by BookingTMS AI
        </p>
      </div>
    </div>
  );
}
