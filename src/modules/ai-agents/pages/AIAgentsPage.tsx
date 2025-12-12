/**
 * AIAgentsPage
 * Main orchestrator for AI Agents module - modular design (<200 lines)
 * Routes to appropriate view based on tab and user role
 */

import React, { useState } from 'react';
import { Bot, MessageSquare, Phone, Settings, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { useAIAgents, useAISettings } from '../hooks';
import {
  AgentCard,
  AgentStatsCards,
  AgentPreviewModal,
  VoiceAgentConfig,
  VoiceAgentPanel,
  CreateAgentWizard,
  KnowledgeBaseManager,
} from '../components';
import { SystemAdminSettingsPage } from './SystemAdminSettingsPage';
import type { AIAgent, AIAgentCategory } from '../types';

export function AIAgentsPage() {
  const { theme } = useTheme();
  const { currentUser, isRole } = useAuth();
  const isDark = theme === 'dark';

  const organizationId = currentUser?.organizationId || '';
  const isSystemAdmin = isRole('system-admin');

  const { agents, loading, refresh, createFromTemplate } = useAIAgents({ organizationId });
  const { settings } = useAISettings();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [previewAgent, setPreviewAgent] = useState<AIAgent | null>(null);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const voiceAgent = agents.find((a) => a.agentType === 'voice');

  const handleVoiceSave = () => {
    console.log('Saving voice config:', { elevenLabsKey, selectedVoice });
  };

  const handleCreateAgent = async (data: { type: AIAgentCategory; config: any }) => {
    try {
      // Map agent category to agent type
      const agentType = data.type === 'voice_agent' ? 'voice' : 'text';
      
      // Use createFromTemplate with the agent type as template ID and name
      await createFromTemplate(data.type, data.config.name);
      
      toast.success(`${data.config.name} created successfully!`);
      await refresh();
    } catch (error) {
      toast.error('Failed to create agent');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agents"
        description="Manage your AI-powered automation agents"
        sticky
        action={
          <Button
            onClick={() => setShowCreateWizard(true)}
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Text Agents
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Voice Agents
          </TabsTrigger>
          {isSystemAdmin && (
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Knowledge Base
            </TabsTrigger>
          )}
          {isSystemAdmin && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <AgentStatsCards agents={agents} isDark={isDark} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onPreview={() => setPreviewAgent(agent)}
                showSystemControls={isSystemAdmin}
              />
            ))}
          </div>

          {agents.length === 0 && !loading && (
            <div className={`text-center py-12 ${textMutedClass}`}>
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No agents configured yet</p>
              <p className="text-sm mt-2">Create your first AI agent to get started</p>
            </div>
          )}
        </TabsContent>

        {/* Text Agents Tab */}
        <TabsContent value="text" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents
              .filter((a) => a.agentType === 'text' || a.agentType === 'hybrid')
              .map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onPreview={() => setPreviewAgent(agent)}
                  showSystemControls={isSystemAdmin}
                />
              ))}
          </div>
        </TabsContent>

        {/* Voice Agents Tab */}
        <TabsContent value="voice" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoiceAgentConfig
              organizationId={organizationId}
              isDark={isDark}
              apiKey={elevenLabsKey}
              selectedVoice={selectedVoice}
              onApiKeyChange={setElevenLabsKey}
              onVoiceChange={setSelectedVoice}
              onSave={handleVoiceSave}
            />
            <VoiceAgentPanel
              organizationId={organizationId}
              agentId={voiceAgent?.id}
              isDark={isDark}
            />
          </div>
        </TabsContent>

        {/* Knowledge Base Tab (System Admin only) */}
        {isSystemAdmin && (
          <TabsContent value="knowledge" className="mt-6">
            <KnowledgeBaseManager organizationId={organizationId} isDark={isDark} />
          </TabsContent>
        )}

        {/* Settings Tab (System Admin only) */}
        {isSystemAdmin && (
          <TabsContent value="settings" className="mt-6">
            <SystemAdminSettingsPage />
          </TabsContent>
        )}
      </Tabs>

      {/* Create Agent Wizard */}
      <CreateAgentWizard
        open={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onComplete={handleCreateAgent}
      />

      {/* Agent Preview Modal */}
      <AgentPreviewModal
        agent={previewAgent}
        open={!!previewAgent}
        onClose={() => setPreviewAgent(null)}
      />
    </div>
  );
}
