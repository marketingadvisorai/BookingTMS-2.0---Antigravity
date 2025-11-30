/**
 * MarketingPro 1.1 - Email Campaigns Service
 * @description CRUD operations for email campaigns with multi-tenant support
 */

import { supabase } from '@/lib/supabase';
import type { EmailCampaign, EmailTemplate as DBEmailTemplate, EmailWorkflow } from '../types';

export interface CreateCampaignInput {
  organization_id: string;
  name: string;
  subject: string;
  preheader?: string;
  content: string;
  template_id?: string;
  target_audience?: Record<string, unknown>;
  scheduled_at?: string;
}

export interface CreateTemplateInput {
  organization_id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'notification' | 'custom';
  subject: string;
  preheader?: string;
  body: string;
  variables?: string[];
}

export interface CreateWorkflowInput {
  organization_id: string;
  name: string;
  trigger_type: string;
  template_id?: string;
  delay_minutes?: number;
  conditions?: Record<string, unknown>;
}

/**
 * Email Campaigns service with multi-tenant organization scoping
 */
export const EmailCampaignsService = {
  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  async listCampaigns(organizationId: string): Promise<EmailCampaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`);
    return (data || []) as EmailCampaign[];
  },

  async createCampaign(input: CreateCampaignInput): Promise<EmailCampaign> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert({ ...input, created_by: user?.user?.id })
      .select()
      .single();

    if (error) throw new Error(`Failed to create campaign: ${error.message}`);
    return data as EmailCampaign;
  },

  async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update campaign: ${error.message}`);
    return data as EmailCampaign;
  },

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete campaign: ${error.message}`);
  },

  // ============================================================================
  // TEMPLATES
  // ============================================================================

  async listTemplates(organizationId: string): Promise<DBEmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
    return (data || []) as DBEmailTemplate[];
  },

  async createTemplate(input: CreateTemplateInput): Promise<DBEmailTemplate> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('email_templates')
      .insert({ ...input, created_by: user?.user?.id })
      .select()
      .single();

    if (error) throw new Error(`Failed to create template: ${error.message}`);
    return data as DBEmailTemplate;
  },

  async updateTemplate(id: string, updates: Partial<DBEmailTemplate>): Promise<DBEmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update template: ${error.message}`);
    return data as DBEmailTemplate;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('email_templates').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete template: ${error.message}`);
  },

  // ============================================================================
  // WORKFLOWS (Automations)
  // ============================================================================

  async listWorkflows(organizationId: string): Promise<EmailWorkflow[]> {
    const { data, error } = await supabase
      .from('email_workflows')
      .select('*, template:email_templates(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch workflows: ${error.message}`);
    return (data || []) as EmailWorkflow[];
  },

  async createWorkflow(input: CreateWorkflowInput): Promise<EmailWorkflow> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('email_workflows')
      .insert({ ...input, created_by: user?.user?.id })
      .select()
      .single();

    if (error) throw new Error(`Failed to create workflow: ${error.message}`);
    return data as EmailWorkflow;
  },

  async toggleWorkflow(id: string, enabled: boolean): Promise<EmailWorkflow> {
    const { data, error } = await supabase
      .from('email_workflows')
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle workflow: ${error.message}`);
    return data as EmailWorkflow;
  },

  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase.from('email_workflows').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete workflow: ${error.message}`);
  },

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async getStats(organizationId: string) {
    const [campaigns, templates, workflows] = await Promise.all([
      supabase.from('email_campaigns').select('id, status, delivered_count, opened_count').eq('organization_id', organizationId),
      supabase.from('email_templates').select('id, is_active').eq('organization_id', organizationId),
      supabase.from('email_workflows').select('id, is_enabled, trigger_count').eq('organization_id', organizationId),
    ]);

    const campaignData = (campaigns.data || []) as EmailCampaign[];
    const templateData = (templates.data || []) as DBEmailTemplate[];
    const workflowData = (workflows.data || []) as EmailWorkflow[];

    return {
      totalCampaigns: campaignData.length,
      sentCampaigns: campaignData.filter(c => c.status === 'sent').length,
      totalDelivered: campaignData.reduce((sum, c) => sum + (c.delivered_count || 0), 0),
      totalOpened: campaignData.reduce((sum, c) => sum + (c.opened_count || 0), 0),
      totalTemplates: templateData.length,
      activeTemplates: templateData.filter(t => t.is_active).length,
      totalWorkflows: workflowData.length,
      activeWorkflows: workflowData.filter(w => w.is_enabled).length,
    };
  },
};
