/**
 * useTextAgent Hook
 * Manages text chat conversations with AI agent
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { textAgentService } from '../services';
import type {
  AIAgent,
  ChatMessage,
  BookingSlots,
  AIConversation,
} from '../types';

interface UseTextAgentOptions {
  agent: AIAgent;
  activities?: { id: string; name: string; price: number; duration?: number }[];
  onBookingReady?: (slots: BookingSlots) => void;
}

interface UseTextAgentReturn {
  messages: ChatMessage[];
  slots: BookingSlots;
  isProcessing: boolean;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useTextAgent(options: UseTextAgentOptions): UseTextAgentReturn {
  const { agent, activities = [], onBookingReady } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [slots, setSlots] = useState<BookingSlots>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [conversation, setConversation] = useState<AIConversation | null>(null);

  const mountedRef = useRef(true);

  // Initialize conversation
  useEffect(() => {
    const init = async () => {
      try {
        // Create conversation record
        const conv = await textAgentService.createConversation(
          agent.id,
          agent.organizationId,
          sessionId,
          'widget'
        );
        setConversation(conv);

        // Send initial greeting
        const greeting: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: agent.config.greeting,
          timestamp: new Date().toISOString(),
        };
        setMessages([greeting]);
        await textAgentService.addMessage(sessionId, greeting);
      } catch (err) {
        console.error('Failed to initialize conversation:', err);
      }
    };

    init();

    return () => {
      mountedRef.current = false;
    };
  }, [agent, sessionId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isProcessing) return;

      setIsProcessing(true);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Extract entities from user message
        const extractedEntities = textAgentService.extractEntities(content);
        userMessage.entities = extractedEntities;

        // Update slots
        const newSlots = { ...slots, ...extractedEntities };
        setSlots(newSlots);
        await textAgentService.updateBookingSlots(sessionId, extractedEntities);

        // Save user message
        await textAgentService.addMessage(sessionId, userMessage);

        // Get AI response
        const startTime = Date.now();
        const systemPrompt = textAgentService.buildSystemPrompt(agent, activities);

        // Prepare message history for LLM
        const messageHistory = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content }));
        messageHistory.push({ role: 'user', content });

        // Get provider config from agent's system config (API key is handled server-side)
        const config = {
          provider: (agent.systemConfig.provider as 'openai' | 'deepseek') || 'openai',
          model: agent.systemConfig.model || 'gpt-4o-mini',
          temperature: agent.systemConfig.temperature || 0.7,
          maxTokens: agent.systemConfig.maxTokens || 500,
        };

        let responseContent: string;
        let tokensUsed = 0;

        try {
          // Call Edge Function (API key is server-side)
          const result = await textAgentService.sendMessageToLLM(
            systemPrompt,
            messageHistory,
            config
          );
          responseContent = result.content;
          tokensUsed = result.tokensUsed;
        } catch (llmError) {
          console.warn('LLM call failed, using fallback:', llmError);
          responseContent = generateFallbackResponse(newSlots, activities);
        }

        const responseTime = Date.now() - startTime;

        // Check if booking is ready
        if (responseContent.includes('[CHECKOUT_READY]')) {
          onBookingReady?.(newSlots);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString(),
          tokensUsed,
        };

        if (mountedRef.current) {
          setMessages((prev) => [...prev, assistantMessage]);
        }

        await textAgentService.addMessage(sessionId, assistantMessage);
      } catch (err) {
        console.error('Failed to process message:', err);

        // Add error message
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble processing your request. Please try again.",
          timestamp: new Date().toISOString(),
        };

        if (mountedRef.current) {
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        if (mountedRef.current) {
          setIsProcessing(false);
        }
      }
    },
    [agent, activities, isProcessing, messages, onBookingReady, sessionId, slots]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setSlots({});

    // Send new greeting
    const greeting: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: agent.config.greeting,
      timestamp: new Date().toISOString(),
    };
    setMessages([greeting]);
  }, [agent.config.greeting]);

  return {
    messages,
    slots,
    isProcessing,
    sessionId,
    sendMessage,
    reset,
  };
}

// Simple fallback response generator when no API key is available
function generateFallbackResponse(
  slots: BookingSlots,
  activities: { id: string; name: string; price: number }[]
): string {
  if (!slots.activityId && activities.length > 0) {
    const list = activities.map((a) => `• ${a.name} - $${a.price}`).join('\n');
    return `Great! Here are our available activities:\n\n${list}\n\nWhich one would you like to book?`;
  }

  if (!slots.date) {
    return `Excellent choice! When would you like to book? You can say something like "tomorrow" or "Saturday".`;
  }

  if (!slots.time) {
    return `Perfect! What time works best for you? We have slots available at 10am, 12pm, 2pm, 4pm, and 6pm.`;
  }

  if (!slots.partySize) {
    return `Great! How many people will be joining you?`;
  }

  if (!slots.customerEmail) {
    return `Almost there! Please provide your name and email address to complete the booking.`;
  }

  return `[CHECKOUT_READY]\nYour booking is ready! Click the button below to proceed to checkout.`;
}
