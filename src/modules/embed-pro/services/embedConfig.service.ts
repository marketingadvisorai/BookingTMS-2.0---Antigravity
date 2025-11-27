/**
 * Embed Pro 1.1 - Embed Config Service
 * @module embed-pro/services/embedConfig
 * 
 * Handles CRUD operations for embed configurations
 */

import { supabase } from '../../../lib/supabase';
import type {
  EmbedConfigEntity,
  EmbedConfigWithRelations,
  CreateEmbedConfigInput,
  UpdateEmbedConfigInput,
} from '../types';
import { DEFAULT_EMBED_CONFIG, DEFAULT_EMBED_STYLE } from '../types';

// =====================================================
// SERVICE CLASS
// =====================================================

class EmbedConfigService {
  private readonly tableName = 'embed_configs';

  /**
   * Generate a unique embed key
   */
  private async generateEmbedKey(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_embed_key');
    if (error) throw error;
    return data;
  }

  /**
   * Fetch all embed configs for an organization
   */
  async getByOrganization(organizationId: string): Promise<EmbedConfigWithRelations[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch all embed configs (for system admins)
   */
  async getAll(): Promise<EmbedConfigWithRelations[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Fetch a single embed config by ID
   */
  async getById(id: string): Promise<EmbedConfigWithRelations | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        organization:organizations(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Fetch embed config by embed key (for public widgets)
   */
  async getByEmbedKey(embedKey: string): Promise<EmbedConfigEntity | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('embed_key', embedKey)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  /**
   * Create a new embed config
   */
  async create(input: CreateEmbedConfigInput): Promise<EmbedConfigEntity> {
    const embedKey = await this.generateEmbedKey();

    const insertData = {
      ...input,
      embed_key: embedKey,
      config: { ...DEFAULT_EMBED_CONFIG, ...input.config },
      style: { ...DEFAULT_EMBED_STYLE, ...input.style },
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw error;
    return data as EmbedConfigEntity;
  }

  /**
   * Update an embed config
   */
  async update(id: string, input: UpdateEmbedConfigInput): Promise<EmbedConfigEntity> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(input as never)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an embed config
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<EmbedConfigEntity> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Duplicate an embed config
   */
  async duplicate(id: string): Promise<EmbedConfigEntity> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Embed config not found');

    return this.create({
      organization_id: existing.organization_id,
      name: `${existing.name} (Copy)`,
      description: existing.description || undefined,
      type: existing.type,
      target_type: existing.target_type,
      target_id: existing.target_id || undefined,
      target_ids: existing.target_ids,
      config: existing.config,
      style: existing.style,
    });
  }

  /**
   * Get configs by target (activity or venue)
   */
  async getByTarget(
    targetType: 'activity' | 'venue',
    targetId: string
  ): Promise<EmbedConfigEntity[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active config count for an organization
   */
  async getActiveCount(organizationId: string): Promise<number> {
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    if (error) throw error;
    return count || 0;
  }
}

// Export singleton instance
export const embedConfigService = new EmbedConfigService();
