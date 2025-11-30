/**
 * MarketingPro 1.1 - Email Tab
 * @description Main container for the Email Campaigns section
 */

import { EmailStats } from './EmailStats';
import { CampaignsList } from './CampaignsList';
import { TemplatesList } from './TemplatesList';
import { WorkflowsList } from './WorkflowsList';
import type { EmailTemplate } from '../../types';

interface EmailTabProps {
  templates: EmailTemplate[];
  workflowStates: Record<string, boolean>;
  onCreateCampaign: () => void;
  onPreviewTemplate: (template: EmailTemplate) => void;
  onEditTemplate: (template: EmailTemplate) => void;
  onUseTemplate: (template: EmailTemplate) => void;
  onToggleWorkflow: (templateId: string, enabled: boolean) => void;
  onCreateTemplate: () => void;
  onCreateWorkflow: () => void;
}

export function EmailTab({
  templates,
  workflowStates,
  onCreateCampaign,
  onPreviewTemplate,
  onEditTemplate,
  onUseTemplate,
  onToggleWorkflow,
  onCreateTemplate,
  onCreateWorkflow,
}: EmailTabProps) {
  return (
    <div className="space-y-6">
      <EmailStats />
      <CampaignsList onCreateCampaign={onCreateCampaign} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TemplatesList 
          templates={templates}
          onPreview={onPreviewTemplate}
          onEdit={onEditTemplate}
          onUse={onUseTemplate}
        />
        <WorkflowsList 
          templates={templates}
          workflowStates={workflowStates}
          onToggleWorkflow={onToggleWorkflow}
          onCreateTemplate={onCreateTemplate}
          onCreateWorkflow={onCreateWorkflow}
        />
      </div>
    </div>
  );
}
