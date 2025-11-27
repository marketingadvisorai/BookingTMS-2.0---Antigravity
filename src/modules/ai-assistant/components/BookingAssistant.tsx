/**
 * BookingAssistant Component
 * Main chat interface for AI booking assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { useBookingAssistant } from '../hooks';
import type { AssistantConfig, ActivityOption, BookingSlots, QuickReply } from '../types';

interface BookingAssistantProps {
  config?: AssistantConfig;
  activities?: ActivityOption[];
  onBookingComplete?: (slots: BookingSlots) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  floatingButton?: boolean;
}

export function BookingAssistant({
  config,
  activities = [],
  onBookingComplete,
  isOpen: controlledOpen,
  onToggle,
  floatingButton = true,
}: BookingAssistantProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const {
    messages,
    slots,
    currentStep,
    isProcessing,
    sendMessage,
    reset,
  } = useBookingAssistant({
    config,
    activities,
    onBookingComplete,
  });

  const primaryColor = config?.primaryColor || '#3b82f6';
  const botName = config?.botName || 'Booking Assistant';

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (!isProcessing) {
      sendMessage(reply.value);
    }
  };

  // Floating button mode
  if (floatingButton && !isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50"
        style={{ backgroundColor: primaryColor }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>
    );
  }

  const chatContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{botName}</h3>
            <p className="text-white/70 text-xs">
              {currentStep === 'complete' ? 'Booking Complete!' : 'Online • Ready to help'}
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
          {floatingButton && (
            <button
              onClick={handleToggle}
              className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onQuickReply={handleQuickReply}
            primaryColor={primaryColor}
          />
        ))}

        {/* Typing Indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-slate-500"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <span className="text-xs">Typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Booking Progress */}
      {currentStep !== 'greeting' && currentStep !== 'complete' && (
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: primaryColor }}
                initial={{ width: 0 }}
                animate={{
                  width: `${getProgressPercentage(currentStep)}%`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {getStepLabel(currentStep)}
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-700 border-0 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0"
            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="p-2.5 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );

  // Floating mode
  if (floatingButton) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] z-50"
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Embedded mode
  return <div className="w-full h-full">{chatContent}</div>;
}

// Helper functions
function getProgressPercentage(step: string): number {
  const steps: Record<string, number> = {
    select_activity: 15,
    select_date: 30,
    select_time: 45,
    select_party_size: 60,
    collect_contact: 75,
    confirm: 90,
    complete: 100,
  };
  return steps[step] || 0;
}

function getStepLabel(step: string): string {
  const labels: Record<string, string> = {
    select_activity: 'Activity',
    select_date: 'Date',
    select_time: 'Time',
    select_party_size: 'Guests',
    collect_contact: 'Contact',
    confirm: 'Confirm',
  };
  return labels[step] || '';
}
