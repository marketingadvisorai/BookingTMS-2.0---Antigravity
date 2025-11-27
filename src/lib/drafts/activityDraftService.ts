/**
 * Activity Draft Service
 * 
 * Auto-saves activity wizard progress so users can continue later.
 * Uses Supabase for persistent storage with RLS for security.
 * 
 * @module activityDraftService
 * @version 1.0.0
 * @date 2025-11-27
 */

import { supabase } from '../supabase';
import { ActivityData } from '../../components/events/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ActivityDraft {
  id: string;
  user_id: string;
  organization_id: string | null;
  venue_id: string | null;
  name: string | null;
  current_step: number;
  is_complete: boolean;
  draft_data: ActivityData;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface SaveDraftParams {
  draftId?: string;
  organizationId?: string;
  venueId?: string;
  currentStep: number;
  activityData: ActivityData;
}

export interface DraftListItem {
  id: string;
  name: string;
  currentStep: number;
  updatedAt: Date;
  organizationId: string | null;
  venueId: string | null;
}

// ============================================================================
// SERVICE
// ============================================================================

export class ActivityDraftService {
  /**
   * Save or update a draft
   * Called on step change or periodically during editing
   */
  static async saveDraft(params: SaveDraftParams): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[DraftService] No authenticated user, cannot save draft');
        return null;
      }

      const draftPayload = {
        user_id: user.id,
        organization_id: params.organizationId || params.activityData.organizationId || null,
        venue_id: params.venueId || params.activityData.venueId || null,
        name: params.activityData.name || 'Untitled Activity',
        current_step: params.currentStep,
        is_complete: false,
        draft_data: params.activityData as any,
      };

      if (params.draftId) {
        // Update existing draft
        const { data, error } = await (supabase as any)
          .from('activity_drafts')
          .update(draftPayload)
          .eq('id', params.draftId)
          .eq('user_id', user.id)
          .select('id')
          .single();

        if (error) {
          console.error('[DraftService] Error updating draft:', error);
          return null;
        }
        console.log('[DraftService] Draft updated:', params.draftId);
        return data?.id || params.draftId;
      } else {
        // Create new draft
        const { data, error } = await (supabase as any)
          .from('activity_drafts')
          .insert(draftPayload)
          .select('id')
          .single();

        if (error) {
          console.error('[DraftService] Error creating draft:', error);
          return null;
        }
        console.log('[DraftService] Draft created:', data?.id);
        return data?.id || null;
      }
    } catch (error) {
      console.error('[DraftService] Exception saving draft:', error);
      return null;
    }
  }

  /**
   * Get a draft by ID
   */
  static async getDraft(draftId: string): Promise<ActivityDraft | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('activity_drafts')
        .select('*')
        .eq('id', draftId)
        .single();

      if (error) {
        console.error('[DraftService] Error fetching draft:', error);
        return null;
      }

      return data as ActivityDraft;
    } catch (error) {
      console.error('[DraftService] Exception fetching draft:', error);
      return null;
    }
  }

  /**
   * List all drafts for the current user
   */
  static async listDrafts(): Promise<DraftListItem[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('activity_drafts')
        .select('id, name, current_step, updated_at, organization_id, venue_id')
        .eq('is_complete', false)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[DraftService] Error listing drafts:', error);
        return [];
      }

      return (data || []).map((d: any) => ({
        id: d.id,
        name: d.name || 'Untitled Activity',
        currentStep: d.current_step,
        updatedAt: new Date(d.updated_at),
        organizationId: d.organization_id,
        venueId: d.venue_id,
      }));
    } catch (error) {
      console.error('[DraftService] Exception listing drafts:', error);
      return [];
    }
  }

  /**
   * Delete a draft
   */
  static async deleteDraft(draftId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('activity_drafts')
        .delete()
        .eq('id', draftId);

      if (error) {
        console.error('[DraftService] Error deleting draft:', error);
        return false;
      }

      console.log('[DraftService] Draft deleted:', draftId);
      return true;
    } catch (error) {
      console.error('[DraftService] Exception deleting draft:', error);
      return false;
    }
  }

  /**
   * Mark draft as complete (can be deleted or kept for reference)
   * Called when activity is successfully created
   */
  static async markComplete(draftId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('activity_drafts')
        .update({ is_complete: true })
        .eq('id', draftId);

      if (error) {
        console.error('[DraftService] Error marking draft complete:', error);
        return false;
      }

      console.log('[DraftService] Draft marked complete:', draftId);
      return true;
    } catch (error) {
      console.error('[DraftService] Exception marking draft complete:', error);
      return false;
    }
  }
}

export default ActivityDraftService;
