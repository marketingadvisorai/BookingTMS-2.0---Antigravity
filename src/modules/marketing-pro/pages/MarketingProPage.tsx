/**
 * MarketingPro 1.1 - Main Page Component
 * @description Main container with submenu navigation for all marketing features
 */

import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Percent, Gift, Star, Mail, UserPlus, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { useMarketingState } from '../hooks/useMarketingState';
import { useOrganizationMarketing } from '../hooks/useOrganizationMarketing';
import { MARKETING_TABS } from '../constants';

// Tab Components
import { PromotionsTab } from '../components/promotions';
import { GiftCardsTab } from '../components/gift-cards';
import { ReviewsTab } from '../components/reviews';
import { EmailTab } from '../components/email';
import { AffiliateTab } from '../components/affiliate';

// Dialogs
import {
  CreatePromoDialog,
  CreateGiftCardDialog,
  CreateCampaignDialog,
  AddAffiliateDialog,
  CreateWorkflowDialog,
} from '../components/dialogs';

import { toast } from 'sonner';
import type { EmailTemplate, MarketingTab } from '../types';

const ICON_MAP = {
  Percent,
  Gift,
  Star,
  Mail,
  UserPlus,
};

export function MarketingProPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);
  
  // Local state for UI
  const {
    activeTab,
    setActiveTab,
    emailTemplates: localTemplates,
    workflowStates: localWorkflowStates,
    activateTemplate,
    updateTemplate,
    toggleWorkflow: localToggleWorkflow,
  } = useMarketingState();

  // Supabase data hook
  const {
    promotions,
    giftCards,
    campaigns,
    templates: dbTemplates,
    workflows: dbWorkflows,
    affiliates,
    reviews,
    stats,
    isLoading,
    refresh,
    createPromotion,
    deletePromotion,
    createGiftCard,
    bulkCreateGiftCards,
    createCampaign,
    toggleWorkflow: dbToggleWorkflow,
    createAffiliate,
    approveAffiliate,
    respondToReview,
  } = useOrganizationMarketing();

  // Use local templates for UI (DB templates have different structure)
  const emailTemplates = localTemplates;
  const workflowStates = dbWorkflows.length > 0 
    ? dbWorkflows.reduce((acc, w) => ({ ...acc, [w.id]: w.is_enabled }), {} as Record<string, boolean>) 
    : localWorkflowStates;
  const toggleWorkflow = dbWorkflows.length > 0 
    ? async (id: string, enabled: boolean) => { await dbToggleWorkflow(id, enabled); } 
    : localToggleWorkflow;

  // Dialog states
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showCreateGiftCard, setShowCreateGiftCard] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showAddAffiliate, setShowAddAffiliate] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState<EmailTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);

  // Template handlers
  const handlePreviewTemplate = (template: EmailTemplate) => {
    setTemplateToPreview(template);
    // For now, show toast - in production, open preview dialog
    toast.info(`Preview: ${template.name}`);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setTemplateToEdit(template);
    // For now, show toast - in production, open edit dialog
    toast.info(`Edit: ${template.name}`);
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    activateTemplate(template.id);
    toast.success(`"${template.name}" is now active!`);
  };

  const handleCreateTemplate = () => {
    toast.info('Opening Email Templates page...');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold mb-2 ${classes.text}`}>MarketingPro 1.1</h1>
          <p className={classes.textMuted}>
            Manage promotions, gift cards, reviews, emails, and affiliates
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refresh} 
          disabled={isLoading}
          className={isDark ? 'border-[#2a2a2a]' : ''}
        >
          <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation - Always Visible */}
      <div className={`${classes.cardBg} border ${classes.border} rounded-lg p-2 shadow-sm`}>
        <div className="flex flex-wrap gap-2">
          {MARKETING_TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon as keyof typeof ICON_MAP];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MarketingTab)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isDark 
                      ? 'bg-[#1e1e1e] text-[#a3a3a3] hover:bg-[#252525] hover:text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as MarketingTab)} className="space-y-4 sm:space-y-6">

        {/* Tab Contents */}
        <TabsContent value="promotions">
          <PromotionsTab onCreatePromo={() => setShowCreatePromo(true)} />
        </TabsContent>

        <TabsContent value="gift-cards">
          <GiftCardsTab onCreateGiftCard={() => setShowCreateGiftCard(true)} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailTab
            templates={emailTemplates}
            workflowStates={workflowStates}
            onCreateCampaign={() => setShowCreateCampaign(true)}
            onPreviewTemplate={handlePreviewTemplate}
            onEditTemplate={handleEditTemplate}
            onUseTemplate={handleUseTemplate}
            onToggleWorkflow={toggleWorkflow}
            onCreateTemplate={handleCreateTemplate}
            onCreateWorkflow={() => setShowCreateWorkflow(true)}
          />
        </TabsContent>

        <TabsContent value="affiliate">
          <AffiliateTab onAddAffiliate={() => setShowAddAffiliate(true)} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreatePromoDialog open={showCreatePromo} onOpenChange={setShowCreatePromo} />
      <CreateGiftCardDialog open={showCreateGiftCard} onOpenChange={setShowCreateGiftCard} />
      <CreateCampaignDialog open={showCreateCampaign} onOpenChange={setShowCreateCampaign} />
      <AddAffiliateDialog open={showAddAffiliate} onOpenChange={setShowAddAffiliate} />
      <CreateWorkflowDialog 
        open={showCreateWorkflow} 
        onOpenChange={setShowCreateWorkflow}
        templates={emailTemplates}
      />
    </div>
  );
}
