/**
 * OrgAdminAgentsPage
 * Org admin view of AI agents - preview, chat, stats (no API/model visibility)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  MessageSquare,
  Phone,
  Sparkles,
  RefreshCw,
  Info,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAIAgents } from '../hooks';
import { AgentCard, AgentChatPreview } from '../components';
import type { AIAgent } from '../types';

export function OrgAdminAgentsPage() {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isDark = theme === 'dark';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const organizationId = currentUser?.organizationId || '';

  const { agents, loading, error, refresh } = useAIAgents({
    organizationId,
  });

  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Mock activities for demo
  const mockActivities = [
    { id: '1', name: 'Mystery Mansion', price: 29, duration: 60 },
    { id: '2', name: 'Prison Break', price: 35, duration: 75 },
    { id: '3', name: 'Lost Temple', price: 25, duration: 45 },
  ];

  const handlePreview = (agent: AIAgent) => {
    setSelectedAgent(agent);
    setPreviewOpen(true);
  };

  // Calculate overall stats
  const totalConversations = agents.reduce(
    (sum, a) => sum + (a.stats?.totalConversations || 0),
    0
  );
  const totalBookings = agents.reduce(
    (sum, a) => sum + (a.stats?.successfulBookings || 0),
    0
  );
  const activeAgents = agents.filter((a) => a.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4f46e5]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className={textMutedClass}>{error}</p>
        <Button onClick={refresh}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>AI Agents</h1>
          <p className={textMutedClass}>
            View and interact with your active AI assistants
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={refresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${cardBgClass} border ${borderClass}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <Activity className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Active Agents</p>
                <p className={`text-2xl font-bold ${textClass}`}>
                  {activeAgents} / {agents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <MessageSquare className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Total Conversations</p>
                <p className={`text-2xl font-bold ${textClass}`}>
                  {totalConversations.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <TrendingUp className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className={`text-sm ${textMutedClass}`}>Bookings Generated</p>
                <p className={`text-2xl font-bold ${textClass}`}>
                  {totalBookings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
        <div className="flex items-start gap-3">
          <Info className={`w-5 h-5 mt-0.5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
          <div>
            <p className={`text-sm ${textClass}`}>
              Your AI agents are configured and managed by your system administrator.
            </p>
            <p className={`text-xs mt-1 ${textMutedClass}`}>
              You can preview agents and view their performance. Contact support to request changes.
            </p>
          </div>
        </div>
      </div>

      {/* Agent List */}
      {agents.length === 0 ? (
        <Card className={`${cardBgClass} border ${borderClass}`}>
          <CardContent className="py-16 text-center">
            <Bot className={`w-12 h-12 mx-auto mb-4 ${textMutedClass}`} />
            <h3 className={`text-lg font-medium ${textClass}`}>No Agents Available</h3>
            <p className={textMutedClass}>
              Contact your system administrator to set up AI agents for your organization.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AgentCard
                agent={agent}
                onPreview={handlePreview}
                showSystemControls={false}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className={`${cardBgClass} border ${borderClass} max-w-md p-0 h-[600px] overflow-hidden`}>
          {selectedAgent && (
            <AgentChatPreview
              agent={selectedAgent}
              activities={mockActivities}
              onClose={() => setPreviewOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
