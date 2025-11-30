/**
 * MarketingPro 1.1 - Main Page Component
 * @description Main container with submenu navigation for all marketing features
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Percent, Gift, Star, Mail, UserPlus } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../utils/theme';
import { useMarketingState } from '../hooks/useMarketingState';
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

import { SectionHeader } from '../components/shared';
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
  
  const {
    activeTab,
    setActiveTab,
    emailTemplates,
    workflowStates,
    activateTemplate,
    updateTemplate,
    toggleWorkflow,
  } = useMarketingState();

  // Dialog states
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showCreateGiftCard, setShowCreateGiftCard] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showAddAffiliate, setShowAddAffiliate] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [templateToPreview, setTemplateToPreview] = useState<EmailTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<EmailTemplate | null>(null);

  // Get current section info
  const currentTab = MARKETING_TABS.find(t => t.id === activeTab) || MARKETING_TABS[0];
  const SectionIcon = ICON_MAP[currentTab.icon as keyof typeof ICON_MAP] || Percent;

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
      <div>
        <h1 className={`text-2xl font-semibold mb-2 ${classes.text}`}>MarketingPro 1.1</h1>
        <p className={classes.textMuted}>
          Manage promotions, gift cards, reviews, emails, and affiliates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as MarketingTab)} className="space-y-4 sm:space-y-6">
        {/* Mobile: Dropdown Navigation */}
        <div className="sm:hidden">
          <Select value={activeTab} onValueChange={(val) => setActiveTab(val as MarketingTab)}>
            <SelectTrigger className={`w-full h-12 font-medium ${
              isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'
            }`}>
              <SelectValue>
                <div className="flex items-center gap-2">
                  <SectionIcon className={`w-4 h-4 ${classes.primary}`} />
                  <span>{currentTab.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MARKETING_TABS.map((tab) => {
                const Icon = ICON_MAP[tab.icon as keyof typeof ICON_MAP];
                return (
                  <SelectItem key={tab.id} value={tab.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Horizontal Tabs */}
        <TabsList className={`hidden sm:flex w-full justify-start overflow-x-auto h-auto ${
          isDark ? 'bg-[#161616] border border-[#2a2a2a]' : ''
        }`}>
          {MARKETING_TABS.map((tab) => {
            const Icon = ICON_MAP[tab.icon as keyof typeof ICON_MAP];
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Mobile: Section Header */}
        <SectionHeader
          title={currentTab.label}
          description={currentTab.description}
          icon={SectionIcon}
          color={currentTab.color as any}
        />

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
