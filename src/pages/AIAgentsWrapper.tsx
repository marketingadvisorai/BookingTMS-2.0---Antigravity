/**
 * AI Agents Wrapper
 * Routes to appropriate AI Agents page based on user role
 * - Org Admin: OrgAdminAgentsPage (preview, chat, stats only)
 * - System Admin: Full AIAgents page (configuration, API keys, models)
 */

import React from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import { OrgAdminAgentsPage } from '../modules/ai-agents';
import { AIAgents as SystemAdminAIAgents } from './AIAgents';

export function AIAgentsWrapper() {
  const { isRole } = useAuth();
  
  const isSystemAdmin = isRole('system-admin');
  const isSuperAdmin = isRole('super-admin');
  
  // System admins and super admins get full configuration access
  if (isSystemAdmin || isSuperAdmin) {
    return <SystemAdminAIAgents />;
  }
  
  // Org admins get the simplified view (preview, chat, stats)
  return <OrgAdminAgentsPage />;
}

export default AIAgentsWrapper;
