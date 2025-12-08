/**
 * AI Agents Module Types
 * Supports text agents (DeepSeek, OpenAI) and voice agents (ElevenLabs)
 */

// ============================================================================
// Enums
// ============================================================================

export type AIAgentType = 'text' | 'voice' | 'hybrid';
export type AIAgentStatus = 'active' | 'inactive' | 'training' | 'error';
export type AIProvider = 'openai' | 'deepseek' | 'anthropic' | 'elevenlabs' | 'custom';
export type VoiceCallStatus = 'queued' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer';
export type VoiceCallDirection = 'inbound' | 'outbound';
export type ConversationStatus = 'active' | 'completed' | 'escalated' | 'abandoned';

// ============================================================================
// AI Agent Settings (System Admin only)
// ============================================================================

export interface AIModel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  contextWindow?: number;
  default?: boolean;
}

export interface AIAgentSettings {
  id: string;
  provider: AIProvider;
  providerName: string;
  isEnabled: boolean;
  apiKeyHint?: string; // "...xxxx"
  apiEndpoint?: string;
  models: AIModel[];
  defaultModel: string;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  costPer1kTokens: number;
  monthlyBudgetLimit?: number;
  currentMonthUsage: number;
  voiceSettings?: {
    voices?: ElevenLabsVoice[];
    defaultVoice?: string;
    modelId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ElevenLabsVoice {
  voiceId: string;
  name: string;
  category: string;
  previewUrl?: string;
}

// ============================================================================
// AI Agent (Organization level)
// ============================================================================

export interface AIAgentConfig {
  greeting: string;
  personality: 'friendly' | 'professional' | 'casual';
  knowledgeBase: string[];
  businessHours?: string;
  escalateToHuman: boolean;
  autoSuggest: boolean;
  showPrices: boolean;
  collectFeedback: boolean;
  customFAQs?: { question: string; answer: string }[];
}

export interface AIAgentSystemConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  voiceId?: string; // For voice agents
  elevenlabsAgentId?: string;
}

export interface AIAgentWidgetConfig {
  primaryColor: string;
  position: 'left' | 'right';
  avatarUrl?: string;
  showBranding: boolean;
}

export interface AIAgentStats {
  totalConversations: number;
  successfulBookings: number;
  avgResponseTimeMs: number;
  satisfactionScore: number;
  totalMessages: number;
  totalTokens: number;
  totalCalls: number;
  completedCalls: number;
  avgCallDurationSec: number;
}

export interface AIAgent {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  agentType: AIAgentType;
  status: AIAgentStatus;
  config: AIAgentConfig;
  systemConfig: AIAgentSystemConfig; // Hidden from org admins
  widgetConfig: AIAgentWidgetConfig;
  stats: AIAgentStats;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
}

// Database model (snake_case)
export interface DBAIAgent {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  agent_type: AIAgentType;
  status: AIAgentStatus;
  config: AIAgentConfig;
  system_config: AIAgentSystemConfig;
  widget_config: AIAgentWidgetConfig;
  stats: AIAgentStats;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

// ============================================================================
// Conversations
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  entities?: Record<string, unknown>;
  tokensUsed?: number;
}

export interface BookingSlots {
  activityId?: string;
  activityName?: string;
  date?: string;
  time?: string;
  partySize?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface AIConversation {
  id: string;
  agentId: string;
  organizationId: string;
  sessionId: string;
  customerId?: string;
  visitorId?: string;
  status: ConversationStatus;
  bookingId?: string;
  messages: ChatMessage[];
  bookingSlots: BookingSlots;
  totalMessages: number;
  totalTokensUsed: number;
  responseTimesMs: number[];
  satisfactionRating?: number;
  feedback?: string;
  source?: string;
  sourceUrl?: string;
  startedAt: string;
  endedAt?: string;
  lastMessageAt: string;
}

// ============================================================================
// Voice Calls
// ============================================================================

export interface VoiceTranscriptEntry {
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: number; // seconds from start
}

export interface AIVoiceCall {
  id: string;
  agentId: string;
  organizationId: string;
  callSid?: string;
  direction: VoiceCallDirection;
  status: VoiceCallStatus;
  fromNumber?: string;
  toNumber?: string;
  customerId?: string;
  bookingId?: string;
  purpose?: string;
  recordingUrl?: string;
  recordingDurationSec?: number;
  transcription: VoiceTranscriptEntry[];
  queueTimeSec?: number;
  ringTimeSec?: number;
  talkTimeSec?: number;
  outcome?: string;
  notes?: string;
  satisfactionRating?: number;
  voiceId?: string;
  voiceSettings?: Record<string, unknown>;
  queuedAt: string;
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
}

// ============================================================================
// Templates
// ============================================================================

export interface AIAgentTemplate {
  id: string;
  name: string;
  description?: string;
  agentType: AIAgentType;
  category: string;
  config: AIAgentConfig;
  systemConfig: AIAgentSystemConfig;
  widgetConfig: AIAgentWidgetConfig;
  previewGreeting?: string;
  previewConversation?: ChatMessage[];
  isFeatured: boolean;
  isActive: boolean;
  usageCount: number;
}

// ============================================================================
// API Types
// ============================================================================

export interface SendMessageRequest {
  agentId: string;
  sessionId: string;
  message: string;
  context?: {
    activities?: { id: string; name: string; price: number }[];
    currentSlots?: BookingSlots;
  };
}

export interface SendMessageResponse {
  message: string;
  suggestions?: { label: string; value: string }[];
  intent?: string;
  entities?: Record<string, unknown>;
  bookingSlots?: BookingSlots;
  checkoutUrl?: string; // If ready for checkout
  tokensUsed?: number;
}

export interface InitiateCallRequest {
  agentId: string;
  toNumber: string;
  purpose: string;
  customerId?: string;
  bookingId?: string;
  context?: Record<string, unknown>;
}

export interface CallStatusResponse {
  callId: string;
  status: VoiceCallStatus;
  duration?: number;
  transcription?: VoiceTranscriptEntry[];
}

// ============================================================================
// Filters & Pagination
// ============================================================================

export interface AIAgentFilters {
  status?: AIAgentStatus;
  agentType?: AIAgentType;
  search?: string;
}

export interface ConversationFilters {
  agentId?: string;
  status?: ConversationStatus;
  dateFrom?: string;
  dateTo?: string;
  hasBooking?: boolean;
}

export interface VoiceCallFilters {
  agentId?: string;
  status?: VoiceCallStatus;
  direction?: VoiceCallDirection;
  dateFrom?: string;
  dateTo?: string;
}
