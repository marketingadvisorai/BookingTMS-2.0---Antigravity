/**
 * AI Agents Wrapper
 * Routes to appropriate AI Agents page based on user role
 * - Org Admin: OrgAdminAgentsPage (preview, chat, stats only)
 * - System Admin: AIAgentsPage (full configuration, API keys, models, voice)
 */

import React from 'react';
import { useAuth } from '../lib/auth/AuthContext';
import { AIAgentsPage, OrgAdminAgentsPage } from '../modules/ai-agents';

export function AIAgentsWrapper() {
  const { isRole } = useAuth();
  
  const isSystemAdmin = isRole('system-admin');
  const isSuperAdmin = isRole('super-admin');
  
  // System admins and super admins get full configuration access with voice
  if (isSystemAdmin || isSuperAdmin) {
    return <AIAgentsPage />;
  }
  
  // Org admins get the simplified view (preview, chat, stats)
  return <OrgAdminAgentsPage />;
}

export default AIAgentsWrapper;
