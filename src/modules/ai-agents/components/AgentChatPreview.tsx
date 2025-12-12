/**
 * AgentChatPreview Component
 * Live chat preview with an AI agent
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, RotateCcw, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/layout/ThemeContext';
import { useTextAgent } from '../hooks';
import type { AIAgent } from '../types';

interface AgentChatPreviewProps {
  agent: AIAgent;
  activities?: { id: string; name: string; price: number; duration?: number }[];
  onClose?: () => void;
}

export function AgentChatPreview({
  agent,
  activities = [],
  onClose,
}: AgentChatPreviewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, slots, isProcessing, sendMessage, reset } = useTextAgent({
    agent,
    activities,
    onBookingReady: (slots) => {
      console.log('Booking ready:', slots);
    },
  });

  const primaryColor = agent.widgetConfig?.primaryColor || '#4f46e5';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const quickReplies = [
    { label: '📅 Book Now', value: 'I want to book an activity' },
    { label: '💰 Prices', value: 'What are the prices?' },
    { label: '❓ Help', value: 'I need help' },
  ];

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${borderClass} ${bgClass}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
              <Sparkles className="w-3 h-3 text-white/70" />
            </div>
            <p className="text-white/70 text-xs">
              {agent.agentType === 'voice' ? 'Voice Agent' : 'AI-Powered • Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={reset}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 max-w-[75%] ${
                  message.role === 'user'
                    ? 'rounded-tr-sm text-white'
                    : `rounded-tl-sm ${bgClass} border ${borderClass}`
                }`}
                style={
                  message.role === 'user' ? { backgroundColor: primaryColor } : undefined
                }
              >
                <p className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : textClass}`}>
                  {message.content}
                </p>
              </div>

              {message.role === 'user' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                  <User className={`w-4 h-4 ${textMutedClass}`} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className={`rounded-2xl rounded-tl-sm px-4 py-2.5 ${bgClass} border ${borderClass}`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Replies - Show only at start */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(reply.value)}
                disabled={isProcessing}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#1e1e1e] border border-[#2a2a2a] hover:border-[#4f46e5] text-white'
                    : 'bg-white border border-gray-200 hover:border-blue-400 text-gray-700'
                }`}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className={`p-4 border-t ${borderClass} ${bgClass}`}
      >
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 h-11 rounded-full ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}
            disabled={isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-full"
            style={{ backgroundColor: primaryColor }}
            disabled={!inputValue.trim() || isProcessing}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
        <p className={`text-xs mt-2 text-center ${textMutedClass}`}>
          Preview Mode • No actual bookings
        </p>
      </form>
    </div>
  );
}
