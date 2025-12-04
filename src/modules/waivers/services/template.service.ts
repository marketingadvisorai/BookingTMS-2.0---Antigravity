/**
 * Waiver Template Service
 * CRUD operations for waiver templates with multi-tenant support
 * @module waivers/services/template.service
 */

import { supabase } from '@/lib/supabase/client';
import {
  WaiverTemplate,
  DBWaiverTemplate,
  TemplateStats,
  TemplateStatus,
} from '../types';
import {
  mapDBTemplateToUI,
  mapUITemplateToDBInsert,
  mapUITemplateToDBUpdate,
} from '../utils/mappers';

export interface ListTemplatesOptions {
  organizationId?: string;
  status?: TemplateStatus | 'all';
  search?: string;
  limit?: number;
  offset?: number;
}

class TemplateService {
  private tableName = 'waiver_templates';

  /**
   * List all templates with optional filters
   */
  async list(options: ListTemplatesOptions = {}): Promise<WaiverTemplate[]> {
    const { organizationId, status, search, limit = 50, offset = 0 } = options;

    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      throw new Error(error.message);
    }

    return (data || []).map(mapDBTemplateToUI);
  }

  /**
   * Get a single template by ID
   */
  async getById(id: string): Promise<WaiverTemplate | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching template:', error);
      throw new Error(error.message);
    }

    return data ? mapDBTemplateToUI(data as DBWaiverTemplate) : null;
  }

  /**
   * Create a new template
   */
  async create(
    template: Partial<WaiverTemplate>,
    organizationId: string,
    userId?: string
  ): Promise<WaiverTemplate> {
    const dbData = mapUITemplateToDBInsert(template, organizationId, userId);

    const { data, error } = await (supabase
      .from(this.tableName)
      .insert as any)(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw new Error(error.message);
    }

    return mapDBTemplateToUI(data as DBWaiverTemplate);
  }

  /**
   * Update an existing template
   */
  async update(id: string, updates: Partial<WaiverTemplate>): Promise<WaiverTemplate> {
    const dbData = mapUITemplateToDBUpdate(updates);

    const { data, error } = await (supabase
      .from(this.tableName)
      .update as any)(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      throw new Error(error.message);
    }

    return mapDBTemplateToUI(data as DBWaiverTemplate);
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Increment usage count for a template
   */
  async incrementUsage(id: string): Promise<void> {
    const { error } = await (supabase.rpc as any)('increment_template_usage', {
      template_id: id,
    });

    // Fallback to manual increment if RPC doesn't exist
    if (error) {
      const template = await this.getById(id);
      if (template) {
        await this.update(id, { usageCount: (template.usageCount || 0) + 1 });
      }
    }
  }

  /**
   * Duplicate a template
   */
  async duplicate(id: string, organizationId: string, userId?: string): Promise<WaiverTemplate> {
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Template not found');
    }

    const copy = {
      ...original,
      name: `${original.name} (Copy)`,
      status: 'draft' as TemplateStatus,
      usageCount: 0,
    };

    // Remove fields that should be regenerated
    delete (copy as any).id;
    delete (copy as any).createdAt;
    delete (copy as any).updatedAt;

    return this.create(copy, organizationId, userId);
  }

  /**
   * Get template statistics
   */
  async getStats(organizationId?: string): Promise<TemplateStats> {
    let query = supabase
      .from(this.tableName)
      .select('status', { count: 'exact' });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching template stats:', error);
      return { total: 0, active: 0, draft: 0, inactive: 0 };
    }

    const stats = { total: 0, active: 0, draft: 0, inactive: 0 };
    (data || []).forEach((item: any) => {
      stats.total++;
      if (item.status === 'active') stats.active++;
      else if (item.status === 'draft') stats.draft++;
      else if (item.status === 'inactive') stats.inactive++;
    });

    return stats;
  }

  /**
   * Get active templates for an activity
   */
  async getActiveForActivity(
    activityId: string,
    organizationId: string
  ): Promise<WaiverTemplate[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .or(`assigned_activities.cs.{${activityId}},assigned_activities.cs.{All Activities}`);

    if (error) {
      console.error('Error fetching templates for activity:', error);
      return [];
    }

    return (data || []).map(mapDBTemplateToUI);
  }
}

export const templateService = new TemplateService();
