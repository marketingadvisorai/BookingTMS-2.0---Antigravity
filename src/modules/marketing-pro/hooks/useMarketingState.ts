/**
 * MarketingPro 1.1 - State Management Hook
 * @description Centralized state management for marketing features
 */

import { useState, useEffect, useCallback } from 'react';
import type { EmailTemplate, MarketingTab } from '../types';
import { DEFAULT_EMAIL_TEMPLATES } from '../constants';

const STORAGE_KEYS = {
  EMAIL_TEMPLATES: 'emailTemplates',
  WORKFLOW_STATES: 'workflowStates',
  ACTIVE_TAB: 'marketingActiveTab',
};

/**
 * Initialize email templates with lastModified date
 */
const initializeTemplates = (): EmailTemplate[] => {
  return DEFAULT_EMAIL_TEMPLATES.map(t => ({
    ...t,
    lastModified: new Date().toISOString(),
  }));
};

/**
 * Hook for managing marketing module state
 */
export function useMarketingState() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('promotions');
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [workflowStates, setWorkflowStates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state on mount
  useEffect(() => {
    try {
      // Load email templates
      const savedTemplates = localStorage.getItem(STORAGE_KEYS.EMAIL_TEMPLATES);
      if (savedTemplates) {
        setEmailTemplates(JSON.parse(savedTemplates));
      } else {
        setEmailTemplates(initializeTemplates());
      }

      // Load workflow states
      const savedWorkflows = localStorage.getItem(STORAGE_KEYS.WORKFLOW_STATES);
      if (savedWorkflows) {
        setWorkflowStates(JSON.parse(savedWorkflows));
      }
    } catch (error) {
      console.error('Error loading marketing state:', error);
      setEmailTemplates(initializeTemplates());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist templates when changed
  const updateEmailTemplates = useCallback((templates: EmailTemplate[]) => {
    setEmailTemplates(templates);
    localStorage.setItem(STORAGE_KEYS.EMAIL_TEMPLATES, JSON.stringify(templates));
  }, []);

  // Persist workflow states when changed
  const updateWorkflowStates = useCallback((states: Record<string, boolean>) => {
    setWorkflowStates(states);
    localStorage.setItem(STORAGE_KEYS.WORKFLOW_STATES, JSON.stringify(states));
  }, []);

  // Template operations
  const activateTemplate = useCallback((templateId: string) => {
    const updated = emailTemplates.map(t =>
      t.id === templateId ? { ...t, isActive: true } : t
    );
    updateEmailTemplates(updated);
  }, [emailTemplates, updateEmailTemplates]);

  const updateTemplate = useCallback((template: EmailTemplate) => {
    const updated = emailTemplates.map(t =>
      t.id === template.id 
        ? { ...template, lastModified: new Date().toISOString() } 
        : t
    );
    updateEmailTemplates(updated);
  }, [emailTemplates, updateEmailTemplates]);

  // Workflow operations
  const toggleWorkflow = useCallback((templateId: string, enabled: boolean) => {
    const newStates = { ...workflowStates, [templateId]: enabled };
    updateWorkflowStates(newStates);
    return newStates;
  }, [workflowStates, updateWorkflowStates]);

  return {
    // State
    activeTab,
    emailTemplates,
    workflowStates,
    isLoading,
    // Tab actions
    setActiveTab,
    // Template actions
    activateTemplate,
    updateTemplate,
    updateEmailTemplates,
    // Workflow actions
    toggleWorkflow,
  };
}

export type MarketingState = ReturnType<typeof useMarketingState>;
