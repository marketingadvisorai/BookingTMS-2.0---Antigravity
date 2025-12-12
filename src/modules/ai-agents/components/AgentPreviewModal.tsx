/**
 * AgentPreviewModal
 * Beautiful modal for previewing AI agent chat functionality
 */

import React from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/layout/ThemeContext';
import { AgentChatPreview } from './AgentChatPreview';
import type { AIAgent } from '../types';

interface AgentPreviewModalProps {
  agent: AIAgent | null;
  open: boolean;
  onClose: () => void;
  activities?: { id: string; name: string; price: number; duration?: number }[];
}

export function AgentPreviewModal({
  agent,
  open,
  onClose,
  activities = [],
}: AgentPreviewModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  if (!agent) return null;

  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={`${bgClass} ${borderClass} p-0 overflow-hidden ${
          isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-lg'
        }`}
        style={{ height: isFullscreen ? '90vh' : '600px' }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Preview {agent.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Custom Header with controls */}
          <div
            className={`flex items-center justify-between px-4 py-2 border-b ${borderClass}`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: agent.widgetConfig?.primaryColor || '#4f46e5' }}
              />
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Preview: {agent.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Preview */}
          <div className="flex-1 overflow-hidden">
            <AgentChatPreview agent={agent} activities={activities} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
