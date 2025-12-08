/**
 * AI Agents Module
 * Complete AI agents system with text (DeepSeek, OpenAI) and voice (ElevenLabs) support
 * 
 * Features:
 * - Text agents for booking assistance
 * - Voice agents for phone calls (ElevenLabs)
 * - Role-based access (Org Admin vs System Admin)
 * - Real-time conversation tracking
 * - Multiple LLM provider support
 * 
 * Usage:
 * 
 * // For Org Admins (view and preview agents)
 * import { OrgAdminAgentsPage } from '@/modules/ai-agents';
 * 
 * // For System Admins (configure providers and models)
 * import { SystemAdminSettingsPage } from '@/modules/ai-agents';
 * 
 * // Hooks
 * import { useAIAgents, useTextAgent, useAISettings } from '@/modules/ai-agents';
 * 
 * // Components
 * import { AgentCard, AgentChatPreview } from '@/modules/ai-agents';
 */

// Types
export * from './types';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Pages
export * from './pages';
