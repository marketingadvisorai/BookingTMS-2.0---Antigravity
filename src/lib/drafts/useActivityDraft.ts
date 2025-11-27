/**
 * Activity Draft Hook
 * 
 * React hook for auto-saving activity wizard progress.
 * Debounces saves to avoid excessive database writes.
 * 
 * @module useActivityDraft
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityDraftService, DraftListItem, ActivityDraft } from './activityDraftService';
import { ActivityData } from '../../components/events/types';

// Debounce delay for auto-save (5 seconds)
const AUTO_SAVE_DELAY = 5000;

interface UseActivityDraftProps {
  initialDraftId?: string;
  organizationId?: string;
  venueId?: string;
  enabled?: boolean;
}

interface UseActivityDraftReturn {
  draftId: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
  drafts: DraftListItem[];
  loadDraft: (draftId: string) => Promise<ActivityData | null>;
  saveDraft: (currentStep: number, activityData: ActivityData) => Promise<void>;
  deleteDraft: () => Promise<void>;
  refreshDrafts: () => Promise<void>;
  markComplete: () => Promise<void>;
}

export function useActivityDraft({
  initialDraftId,
  organizationId,
  venueId,
  enabled = true,
}: UseActivityDraftProps = {}): UseActivityDraftReturn {
  const [draftId, setDraftId] = useState<string | null>(initialDraftId || null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [drafts, setDrafts] = useState<DraftListItem[]>([]);
  
  // Ref for debounce timer
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<{ step: number; data: ActivityData } | null>(null);

  // Load existing drafts on mount
  useEffect(() => {
    if (enabled) {
      ActivityDraftService.listDrafts().then(setDrafts);
    }
  }, [enabled]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // Load a specific draft
  const loadDraft = useCallback(async (id: string): Promise<ActivityData | null> => {
    try {
      const draft = await ActivityDraftService.getDraft(id);
      if (draft) {
        setDraftId(draft.id);
        return draft.draft_data;
      }
      return null;
    } catch (error) {
      console.error('[useActivityDraft] Error loading draft:', error);
      return null;
    }
  }, []);

  // Perform the actual save
  const performSave = useCallback(async () => {
    if (!pendingDataRef.current || !enabled) return;

    const { step, data } = pendingDataRef.current;
    pendingDataRef.current = null;

    setIsSaving(true);
    try {
      const savedId = await ActivityDraftService.saveDraft({
        draftId: draftId || undefined,
        organizationId,
        venueId,
        currentStep: step,
        activityData: data,
      });

      if (savedId) {
        setDraftId(savedId);
        setLastSaved(new Date());
      }
    } finally {
      setIsSaving(false);
    }
  }, [draftId, organizationId, venueId, enabled]);

  // Debounced save function
  const saveDraft = useCallback(async (currentStep: number, activityData: ActivityData) => {
    if (!enabled) return;

    // Store pending data
    pendingDataRef.current = { step: currentStep, data: activityData };

    // Clear existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Set new timer
    saveTimerRef.current = setTimeout(performSave, AUTO_SAVE_DELAY);
  }, [enabled, performSave]);

  // Force immediate save (e.g., on step change)
  const forceSave = useCallback(async (currentStep: number, activityData: ActivityData) => {
    if (!enabled) return;

    // Clear any pending debounce
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    pendingDataRef.current = { step: currentStep, data: activityData };
    await performSave();
  }, [enabled, performSave]);

  // Delete current draft
  const deleteDraft = useCallback(async () => {
    if (draftId) {
      await ActivityDraftService.deleteDraft(draftId);
      setDraftId(null);
      setLastSaved(null);
      // Refresh list
      const updated = await ActivityDraftService.listDrafts();
      setDrafts(updated);
    }
  }, [draftId]);

  // Refresh drafts list
  const refreshDrafts = useCallback(async () => {
    const updated = await ActivityDraftService.listDrafts();
    setDrafts(updated);
  }, []);

  // Mark current draft as complete
  const markComplete = useCallback(async () => {
    if (draftId) {
      await ActivityDraftService.markComplete(draftId);
      setDraftId(null);
      // Refresh list
      const updated = await ActivityDraftService.listDrafts();
      setDrafts(updated);
    }
  }, [draftId]);

  return {
    draftId,
    isSaving,
    lastSaved,
    drafts,
    loadDraft,
    saveDraft,
    deleteDraft,
    refreshDrafts,
    markComplete,
  };
}

export default useActivityDraft;
