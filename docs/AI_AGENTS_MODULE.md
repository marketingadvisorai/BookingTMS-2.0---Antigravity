# AI Agents Module

## Overview

The AI Agents module provides a comprehensive system for text-based and voice-based AI agents. It supports multiple LLM providers (OpenAI, DeepSeek) and voice synthesis (ElevenLabs).

## Architecture

```
/src/modules/ai-agents/
├── index.ts                    - Module exports
├── types/index.ts              - TypeScript types
├── services/
│   ├── index.ts                - Service exports
│   ├── agent.service.ts        - Agent CRUD operations
│   ├── text-agent.service.ts   - Chat/conversation handling
│   ├── voice-agent.service.ts  - Voice call management (ElevenLabs)
│   └── settings.service.ts     - System admin settings
├── hooks/
│   ├── index.ts                - Hook exports
│   ├── useAIAgents.ts          - Agent management hook
│   ├── useTextAgent.ts         - Chat conversation hook
│   └── useAISettings.ts        - System settings hook
├── components/
│   ├── index.ts                - Component exports
│   ├── AgentCard.tsx           - Agent display card
│   └── AgentChatPreview.tsx    - Live chat preview
└── pages/
    ├── index.ts                - Page exports
    ├── OrgAdminAgentsPage.tsx  - Org admin view
    └── SystemAdminSettingsPage.tsx - System admin settings
```

## Database Schema

### Tables

1. **ai_agent_settings** - Platform-level provider settings (System Admin only)
   - API keys, models, rate limits
   - Provider: openai, deepseek, elevenlabs

2. **ai_agents** - Organization-level agents
   - Text or voice agent configuration
   - Stats tracking (conversations, ratings)

3. **ai_conversations** - Chat conversation history
   - Messages with intent detection
   - Booking slot collection

4. **ai_voice_calls** - Voice call logs
   - Call status and recordings
   - Transcription

5. **ai_agent_templates** - Pre-built agent configurations

### Migration

```bash
# Apply the migration
supabase db push

# Or manually
psql -f supabase/migrations/082_ai_agents_system.sql
```

## Usage

### Org Admin View

```tsx
import { OrgAdminAgentsPage } from '@/modules/ai-agents';

// In your router or App.tsx
case 'ai-agents':
  return <OrgAdminAgentsPage />;
```

Org Admins can:
- View active agents
- See agent statistics
- Preview and chat with agents
- **Cannot** see API keys, models, or system configuration

### System Admin View

```tsx
import { SystemAdminSettingsPage } from '@/modules/ai-agents';

// In system admin dashboard
case 'ai-settings':
  return <SystemAdminSettingsPage />;
```

System Admins can:
- Configure API keys for providers
- Enable/disable providers
- Select default models
- Set rate limits and budgets
- Configure agent system settings

### Using Hooks

```tsx
import { useAIAgents, useTextAgent, useAISettings } from '@/modules/ai-agents';

// List organization's agents
const { agents, loading, createFromTemplate } = useAIAgents({
  organizationId: 'org-123'
});

// Use a text agent for chat
const { messages, sendMessage, slots } = useTextAgent({
  agent: selectedAgent,
  activities: myActivities,
  onBookingReady: (slots) => navigateToCheckout(slots)
});

// System admin settings
const { settings, updateSettings, saveApiKey } = useAISettings();
```

### Using Components

```tsx
import { AgentCard, AgentChatPreview } from '@/modules/ai-agents';

// Display agent card
<AgentCard
  agent={agent}
  onPreview={(agent) => openPreviewDialog(agent)}
  showSystemControls={isSystemAdmin}
/>

// Chat preview widget
<AgentChatPreview
  agent={agent}
  activities={activities}
  apiKey={apiKey} // Optional
  onClose={() => setPreviewOpen(false)}
/>
```

## Supported LLM Providers

### OpenAI
- Models: gpt-4o-mini (default), gpt-4o, gpt-4-turbo, gpt-3.5-turbo
- Context: 128K tokens
- Cost: ~$0.15/1K tokens

### DeepSeek
- Models: deepseek-chat (default), deepseek-coder
- Context: 64K tokens
- Cost: ~$0.14/1K tokens

### ElevenLabs (Voice)
- Models: eleven_turbo_v2_5 (default), eleven_multilingual_v2
- Features: Text-to-speech, voice cloning, conversational AI

## Role-Based Access

| Feature | Org Admin | System Admin |
|---------|-----------|--------------|
| View agents | ✓ | ✓ |
| Preview/chat | ✓ | ✓ |
| View stats | ✓ | ✓ |
| Configure personality | ✓ | ✓ |
| See API keys | ✗ | ✓ |
| See model config | ✗ | ✓ |
| Change providers | ✗ | ✓ |
| Enable/disable | ✗ | ✓ |

## Edge Function

The `ai-agent-chat` edge function handles LLM API calls:

```bash
# Deploy
supabase functions deploy ai-agent-chat

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set DEEPSEEK_API_KEY=sk-xxx
```

### Request Format

```json
{
  "provider": "openai",
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "You are a booking assistant..."},
    {"role": "user", "content": "I want to book an escape room"}
  ],
  "temperature": 0.7,
  "maxTokens": 500
}
```

## Voice Agent Integration (ElevenLabs)

### Setup

1. Create an ElevenLabs account at https://elevenlabs.io
2. Get your API key
3. Add key via System Admin settings page
4. Configure voice settings for voice agents

### Features

- **Text-to-Speech**: Convert AI responses to natural speech
- **Conversational AI**: Real-time voice conversations
- **Voice Cloning**: Custom voices for your brand
- **Phone Calls**: Outbound calls for booking confirmations (requires Twilio)

### Phone Call Flow

```
1. System initiates call → ai_voice_calls record created
2. Call connects → ElevenLabs Conversational AI handles voice
3. Call ends → Recording and transcription saved
4. Stats updated on ai_agents
```

## Security

1. **API Keys**: Only stored hints visible in UI; full keys in Supabase Vault
2. **RLS Policies**: Organization-scoped access for agents and conversations
3. **Role Checks**: System admin functions require `system-admin` role
4. **Rate Limiting**: Configurable per-provider limits

## Monitoring

- Real-time conversation tracking
- Token usage and cost estimation
- Call duration and outcomes
- Satisfaction ratings

## Future Enhancements

- [ ] Anthropic (Claude) support
- [ ] Google Gemini support
- [ ] Twilio integration for phone infrastructure
- [ ] WhatsApp business integration
- [ ] Custom model fine-tuning
- [ ] A/B testing for prompts
