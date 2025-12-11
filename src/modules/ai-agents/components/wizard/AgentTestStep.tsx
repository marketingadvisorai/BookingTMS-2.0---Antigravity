/**
 * AgentTestStep
 * Step 3 of Create Agent Wizard - Live test chat with agent
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Zap, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
  latencyMs?: number;
}

interface AgentTestStepProps {
  agentName: string;
  welcomeMessage: string;
  systemPrompt: string;
  isDark: boolean;
}

export function AgentTestStep({ agentName, welcomeMessage, systemPrompt, isDark }: AgentTestStepProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: welcomeMessage || 'Hi! How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const inputClass = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const startTime = Date.now();

    // Simulate AI response (in production, this would call the actual API)
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const latency = Date.now() - startTime;
    const tokens = Math.floor(input.length * 1.3 + 50);

    const responses = [
      "I'd be happy to help you with that! Our escape rooms are open daily from 10 AM to 10 PM.",
      "Great question! We have 5 different escape room experiences, ranging from beginner to expert difficulty.",
      "I can check availability for you. What date and time were you thinking?",
      "Our most popular room is 'The Heist' - it's perfect for groups of 4-6 people!",
      "Bookings can be made right here. Just let me know your preferred date and group size.",
    ];

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      tokens,
      latencyMs: latency,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setTotalTokens((prev) => prev + tokens);
    setAvgLatency((prev) => (prev === 0 ? latency : (prev + latency) / 2));
    setIsLoading(false);
  };

  const estimatedCost = (totalTokens / 1000000) * 0.15; // gpt-4o-mini pricing

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className={`text-xl font-semibold ${textClass}`}>Test Your Agent</h2>
        <p className={`text-sm mt-1 ${textMutedClass}`}>
          Try chatting with your agent to see how it responds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats Panel */}
        <div className="space-y-3">
          <Card className={`${cardBgClass} border ${borderClass}`}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className={`text-sm ${textClass}`}>Test Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClass}`}>Messages</span>
                <Badge variant="secondary">{messages.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClass}`}>Total Tokens</span>
                <Badge variant="secondary">{totalTokens}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClass}`}>Avg Latency</span>
                <Badge variant="secondary">{avgLatency > 0 ? `${Math.round(avgLatency)}ms` : '--'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${textMutedClass}`}>Est. Cost</span>
                <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
                  ${estimatedCost.toFixed(6)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className={`p-3 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${textMutedClass}`}>
              <Zap className="w-3 h-3 inline mr-1" />
              This is a simulated test. Real API calls will be made after deployment.
            </p>
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`lg:col-span-2 flex flex-col h-[400px] rounded-xl border ${borderClass} ${cardBgClass}`}>
          <div className={`p-3 border-b ${borderClass} flex items-center gap-2`}>
            <Bot className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
            <span className={`font-medium ${textClass}`}>{agentName || 'AI Agent'}</span>
            <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
              Testing
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-3 ${
                  msg.role === 'user'
                    ? isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'
                    : isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm ${msg.role === 'assistant' ? textClass : ''}`}>{msg.content}</p>
                  {msg.tokens && (
                    <p className={`text-xs mt-1 opacity-60`}>
                      {msg.tokens} tokens • {msg.latencyMs}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`rounded-xl p-3 ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
                  <Loader2 className={`w-5 h-5 animate-spin ${textMutedClass}`} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-3 border-t ${borderClass}`}>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className={inputClass}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
