/**
 * ChatMessage Component
 * Renders a single chat message with formatting
 */

import React from 'react';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType, QuickReply } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (reply: QuickReply) => void;
  primaryColor?: string;
}

export function ChatMessage({ message, onQuickReply, primaryColor = '#3b82f6' }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Format message content with markdown-like styling
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Emoji handling is automatic
        return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: line }} />;
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-slate-200 dark:bg-slate-700'
            : ''
        }`}
        style={isAssistant ? { backgroundColor: primaryColor } : undefined}
      >
        {isUser ? (
          <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isUser
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-br-md'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-md shadow-sm'
          }`}
        >
          <div className="text-sm leading-relaxed">{formatContent(message.content)}</div>
        </div>

        {/* Quick Replies */}
        {isAssistant && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.suggestions.map((reply) => (
              <button
                key={reply.id}
                onClick={() => onQuickReply?.(reply)}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
