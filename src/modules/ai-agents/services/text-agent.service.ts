/**
 * Text Agent Service
 * Handles chat conversations using OpenAI/DeepSeek APIs
 */

import { supabase } from '@/lib/supabase';
import type {
  AIAgent,
  AIConversation,
  ChatMessage,
  BookingSlots,
  SendMessageRequest,
  SendMessageResponse,
} from '../types';

// ============================================================================
// Conversation Management
// ============================================================================

export async function createConversation(
  agentId: string,
  organizationId: string,
  sessionId: string,
  source?: string,
  sourceUrl?: string
): Promise<AIConversation> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      agent_id: agentId,
      organization_id: organizationId,
      session_id: sessionId,
      status: 'active',
      messages: [],
      booking_slots: {},
      source,
      source_url: sourceUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return mapConversation(data);
}

export async function getConversation(
  sessionId: string
): Promise<AIConversation | null> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapConversation(data) : null;
}

export async function addMessage(
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  // Get current messages
  const { data: conv } = await supabase
    .from('ai_conversations')
    .select('messages, total_messages, total_tokens_used, response_times_ms')
    .eq('session_id', sessionId)
    .single();

  if (!conv) return;

  const messages = [...(conv.messages || []), message];
  const totalMessages = (conv.total_messages || 0) + 1;
  const totalTokens = (conv.total_tokens_used || 0) + (message.tokensUsed || 0);

  await supabase
    .from('ai_conversations')
    .update({
      messages,
      total_messages: totalMessages,
      total_tokens_used: totalTokens,
      last_message_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);
}

export async function updateBookingSlots(
  sessionId: string,
  slots: Partial<BookingSlots>
): Promise<void> {
  const { data: conv } = await supabase
    .from('ai_conversations')
    .select('booking_slots')
    .eq('session_id', sessionId)
    .single();

  await supabase
    .from('ai_conversations')
    .update({
      booking_slots: { ...conv?.booking_slots, ...slots },
    })
    .eq('session_id', sessionId);
}

export async function completeConversation(
  sessionId: string,
  bookingId?: string,
  rating?: number,
  feedback?: string
): Promise<void> {
  await supabase
    .from('ai_conversations')
    .update({
      status: 'completed',
      booking_id: bookingId,
      satisfaction_rating: rating,
      feedback,
      ended_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId);
}

// ============================================================================
// LLM Integration
// ============================================================================

interface LLMConfig {
  provider: 'openai' | 'deepseek';
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export async function sendMessageToLLM(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  config: LLMConfig
): Promise<{ content: string; tokensUsed: number }> {
  // Determine API endpoint based on provider
  const endpoints = {
    openai: 'https://api.openai.com/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
  };

  const endpoint = endpoints[config.provider];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`LLM API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0,
  };
}

// ============================================================================
// Booking Flow Helper
// ============================================================================

export function buildSystemPrompt(
  agent: AIAgent,
  activities: { id: string; name: string; price: number; duration?: number }[]
): string {
  const config = agent.config;
  
  const activityList = activities
    .map((a) => `- ${a.name}: $${a.price}${a.duration ? ` (${a.duration} min)` : ''}`)
    .join('\n');

  const faqs = config.customFAQs
    ?.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join('\n\n') || '';

  return `You are a ${config.personality} booking assistant for an escape room/activity venue.

GREETING: "${config.greeting}"

AVAILABLE ACTIVITIES:
${activityList}

BUSINESS HOURS: ${config.businessHours || 'Contact for hours'}

YOUR TASKS:
1. Help customers browse and select activities
2. Guide them to pick a date and time
3. Collect number of participants
4. Gather contact information (name, email, phone)
5. Confirm booking details and provide checkout link

RULES:
- Be ${config.personality} and helpful
${config.showPrices ? '- Always mention prices when discussing activities' : '- Do not quote exact prices; mention pricing is shown at checkout'}
${config.autoSuggest ? '- Proactively suggest options and next steps' : ''}
${config.escalateToHuman ? '- Offer to connect with a human if the customer seems stuck or frustrated' : ''}
${config.collectFeedback ? '- At the end of successful bookings, ask for feedback' : ''}

${faqs ? `FREQUENTLY ASKED QUESTIONS:\n${faqs}` : ''}

When ready to complete a booking, respond with a special format:
[CHECKOUT_READY]
- Activity: {activity_name}
- Date: {date}
- Time: {time}
- Guests: {number}
- Name: {customer_name}
- Email: {customer_email}
- Phone: {customer_phone}

Keep responses concise and focused on helping the customer complete their booking.`;
}

export function extractEntities(
  message: string
): Partial<BookingSlots> {
  const slots: Partial<BookingSlots> = {};

  // Extract date patterns
  const datePatterns = [
    /\b(today|tomorrow|tonight)\b/i,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/,
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\b/i,
  ];

  for (const pattern of datePatterns) {
    const match = message.match(pattern);
    if (match) {
      slots.date = match[1];
      break;
    }
  }

  // Extract time patterns
  const timePatterns = [
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i,
    /\b(morning|afternoon|evening|noon)\b/i,
  ];

  for (const pattern of timePatterns) {
    const match = message.match(pattern);
    if (match) {
      slots.time = match[1];
      break;
    }
  }

  // Extract party size
  const sizePatterns = [
    /\b(\d+)\s*(?:people|persons?|guests?|players?)\b/i,
    /\bfor\s*(\d+)\b/i,
    /\bjust\s*me\b/i,
    /\bcouple\b/i,
  ];

  for (const pattern of sizePatterns) {
    const match = message.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('just me')) {
        slots.partySize = 1;
      } else if (match[0].toLowerCase().includes('couple')) {
        slots.partySize = 2;
      } else if (match[1]) {
        slots.partySize = parseInt(match[1], 10);
      }
      break;
    }
  }

  // Extract email
  const emailMatch = message.match(
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/
  );
  if (emailMatch) {
    slots.customerEmail = emailMatch[1];
  }

  // Extract phone
  const phoneMatch = message.match(
    /\b(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/
  );
  if (phoneMatch) {
    slots.customerPhone = phoneMatch[1];
  }

  // Extract name (simple pattern)
  const nameMatch = message.match(
    /\b(?:my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i
  );
  if (nameMatch) {
    slots.customerName = nameMatch[1];
  }

  return slots;
}

// ============================================================================
// Helpers
// ============================================================================

function mapConversation(data: unknown): AIConversation {
  const d = data as Record<string, unknown>;
  return {
    id: d.id as string,
    agentId: d.agent_id as string,
    organizationId: d.organization_id as string,
    sessionId: d.session_id as string,
    customerId: d.customer_id as string | undefined,
    visitorId: d.visitor_id as string | undefined,
    status: d.status as AIConversation['status'],
    bookingId: d.booking_id as string | undefined,
    messages: (d.messages as ChatMessage[]) || [],
    bookingSlots: (d.booking_slots as BookingSlots) || {},
    totalMessages: (d.total_messages as number) || 0,
    totalTokensUsed: (d.total_tokens_used as number) || 0,
    responseTimesMs: (d.response_times_ms as number[]) || [],
    satisfactionRating: d.satisfaction_rating as number | undefined,
    feedback: d.feedback as string | undefined,
    source: d.source as string | undefined,
    sourceUrl: d.source_url as string | undefined,
    startedAt: d.started_at as string,
    endedAt: d.ended_at as string | undefined,
    lastMessageAt: d.last_message_at as string,
  };
}

export const textAgentService = {
  createConversation,
  getConversation,
  addMessage,
  updateBookingSlots,
  completeConversation,
  sendMessageToLLM,
  buildSystemPrompt,
  extractEntities,
};
