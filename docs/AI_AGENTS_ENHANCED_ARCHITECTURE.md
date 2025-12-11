# AI Agents Enhanced Architecture v2.0

## Overview

The AI Agents module provides a comprehensive system for text-based and voice-based AI agents, supporting multiple LLM providers and ElevenLabs voice synthesis.

## Problem Statement

The current implementation has:
1. **AIAgents.tsx** is 1431 lines - violates 200-line limit
2. Hardcoded demo data instead of real Supabase data
3. ElevenLabs voice service exists but NO UI
4. SystemAdminSettingsPage not wired to main flow
5. Voice agent shows as "Inactive" with no configuration

## Target Architecture

```
/src/modules/ai-agents/
├── index.ts                         - Module exports
├── types/index.ts                   - TypeScript types
├── constants/
│   ├── index.ts                     - Barrel exports
│   ├── providers.ts                 - Provider configs
│   └── models.ts                    - Model definitions
├── services/
│   ├── index.ts                     - Service exports
│   ├── agent.service.ts             - Agent CRUD (existing)
│   ├── text-agent.service.ts        - Chat handling (existing)
│   ├── voice-agent.service.ts       - ElevenLabs (existing)
│   └── settings.service.ts          - System settings (existing)
├── hooks/
│   ├── index.ts                     - Hook exports
│   ├── useAIAgents.ts               - Agent management (existing)
│   ├── useTextAgent.ts              - Chat hook (existing)
│   ├── useAISettings.ts             - Settings hook (existing)
│   └── useVoiceAgent.ts             - NEW: Voice agent hook
├── components/
│   ├── index.ts                     - Component exports
│   ├── AgentCard.tsx                - Agent card (existing)
│   ├── AgentChatPreview.tsx         - Chat preview (existing)
│   ├── AgentStatsCards.tsx          - NEW: Stats overview
│   ├── AgentList.tsx                - NEW: Agent grid
│   ├── CustomerAssistantCard.tsx    - NEW: Featured assistant
│   ├── VoiceAgentConfig.tsx         - NEW: ElevenLabs config
│   ├── VoiceAgentPanel.tsx          - NEW: Voice call UI
│   └── ProviderSettingsCard.tsx     - NEW: Provider config card
└── pages/
    ├── index.ts                     - Page exports
    ├── AIAgentsPage.tsx             - NEW: Main orchestrator (<200 lines)
    ├── OrgAdminAgentsPage.tsx       - Org admin view (existing)
    └── SystemAdminSettingsPage.tsx  - System settings (existing)
```

## Key Features

### 1. Text Agents (OpenAI, DeepSeek)
- Chat widget for customer websites
- Booking assistance and FAQ handling
- Conversation history and analytics

### 2. Voice Agents (ElevenLabs)
- Text-to-speech for notifications
- Conversational AI for phone calls
- Voice selection and configuration
- Call logs and transcriptions

### 3. Provider Management (System Admin)
- API key configuration (secure storage)
- Model selection per provider
- Rate limiting and budgets
- Usage statistics

## Component Specifications

### AIAgentsPage.tsx (Main Orchestrator) - <150 lines
```tsx
// Orchestrates tabs: Overview | Agents | Voice | Settings
// Renders appropriate components based on active tab
// Delegates all logic to child components and hooks
```

### AgentStatsCards.tsx - <100 lines
```tsx
// 4 stat cards: Conversations, Success Rate, Avg Response, Active Agents
// Uses data from useAIAgents hook
```

### CustomerAssistantCard.tsx - <180 lines
```tsx
// Featured chat assistant configuration
// Color, position, greeting settings
// Embed code generation
// Live preview integration
```

### VoiceAgentConfig.tsx - <150 lines
```tsx
// ElevenLabs API key configuration
// Voice selection dropdown
// Model selection (eleven_turbo_v2_5, etc.)
// Voice preview playback
```

### VoiceAgentPanel.tsx - <150 lines
```tsx
// Voice call initiation
// Call history list
// Transcription viewer
// Recording playback
```

## Database Tables (Existing)

- `ai_agent_settings` - Provider API keys and config
- `ai_agents` - Organization agents
- `ai_conversations` - Chat history
- `ai_voice_calls` - Voice call logs
- `ai_agent_templates` - Pre-built configs

## Hook Specifications

### useVoiceAgent (NEW)
```typescript
interface UseVoiceAgentOptions {
  organizationId: string;
  agentId?: string;
}

interface UseVoiceAgentReturn {
  // State
  calls: AIVoiceCall[];
  loading: boolean;
  error: string | null;
  
  // Voice list
  voices: ElevenLabsVoice[];
  loadingVoices: boolean;
  
  // Actions
  initiateCall: (toNumber: string, purpose: string) => Promise<AIVoiceCall>;
  refreshCalls: () => Promise<void>;
  fetchVoices: (apiKey: string) => Promise<void>;
  
  // TTS
  synthesizeSpeech: (text: string, voiceId: string) => Promise<ArrayBuffer>;
}
```

## UI Flow

### For Org Admin
1. View active agents
2. See statistics
3. Preview/test chat
4. View call logs (if voice enabled)

### For System Admin
1. All org admin features PLUS:
2. Configure API keys for providers
3. Enable/disable providers
4. Set models and limits
5. Configure ElevenLabs voices
6. View cross-org analytics

## Implementation Priority

1. **Phase 1**: Create modular components from AIAgents.tsx
2. **Phase 2**: Implement useVoiceAgent hook
3. **Phase 3**: Create VoiceAgentConfig and VoiceAgentPanel
4. **Phase 4**: Wire everything to real Supabase data
5. **Phase 5**: Test and polish

## Security Considerations

- API keys stored in Supabase with encryption
- Only system admins can view/edit API keys
- Voice calls require explicit user consent
- Rate limiting enforced at edge function level

## Version History

- v2.0 (Dec 12, 2025): Enhanced architecture with ElevenLabs UI
- v1.0 (Nov 2025): Initial implementation
