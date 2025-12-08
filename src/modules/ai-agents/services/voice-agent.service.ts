/**
 * Voice Agent Service
 * ElevenLabs integration for voice calls and speech synthesis
 */

import { supabase } from '@/lib/supabase';
import type {
  AIVoiceCall,
  VoiceCallStatus,
  VoiceCallDirection,
  VoiceTranscriptEntry,
  VoiceCallFilters,
  ElevenLabsVoice,
} from '../types';

// ============================================================================
// ElevenLabs API Configuration
// ============================================================================

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId?: string;
}

// ============================================================================
// Voice Call Management
// ============================================================================

export async function listCalls(
  organizationId: string,
  filters?: VoiceCallFilters
): Promise<AIVoiceCall[]> {
  let query = supabase
    .from('ai_voice_calls')
    .select('*')
    .eq('organization_id', organizationId)
    .order('queued_at', { ascending: false });

  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.direction) {
    query = query.eq('direction', filters.direction);
  }
  if (filters?.dateFrom) {
    query = query.gte('queued_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('queued_at', filters.dateTo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapCall);
}

export async function getCall(callId: string): Promise<AIVoiceCall | null> {
  const { data, error } = await supabase
    .from('ai_voice_calls')
    .select('*')
    .eq('id', callId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapCall(data) : null;
}

export async function createCall(
  agentId: string,
  organizationId: string,
  data: {
    direction: VoiceCallDirection;
    toNumber: string;
    fromNumber?: string;
    purpose: string;
    customerId?: string;
    bookingId?: string;
    voiceId?: string;
    voiceSettings?: Record<string, unknown>;
  }
): Promise<AIVoiceCall> {
  const { data: call, error } = await supabase
    .from('ai_voice_calls')
    .insert({
      agent_id: agentId,
      organization_id: organizationId,
      direction: data.direction,
      status: 'queued',
      to_number: data.toNumber,
      from_number: data.fromNumber,
      purpose: data.purpose,
      customer_id: data.customerId,
      booking_id: data.bookingId,
      voice_id: data.voiceId,
      voice_settings: data.voiceSettings || {},
      transcription: [],
    })
    .select()
    .single();

  if (error) throw error;
  return mapCall(call);
}

export async function updateCallStatus(
  callId: string,
  status: VoiceCallStatus,
  additionalData?: {
    callSid?: string;
    startedAt?: string;
    answeredAt?: string;
    endedAt?: string;
    queueTimeSec?: number;
    ringTimeSec?: number;
    talkTimeSec?: number;
    outcome?: string;
  }
): Promise<AIVoiceCall> {
  const updateData: Record<string, unknown> = { status };

  if (additionalData) {
    if (additionalData.callSid) updateData.call_sid = additionalData.callSid;
    if (additionalData.startedAt) updateData.started_at = additionalData.startedAt;
    if (additionalData.answeredAt) updateData.answered_at = additionalData.answeredAt;
    if (additionalData.endedAt) updateData.ended_at = additionalData.endedAt;
    if (additionalData.queueTimeSec !== undefined)
      updateData.queue_time_sec = additionalData.queueTimeSec;
    if (additionalData.ringTimeSec !== undefined)
      updateData.ring_time_sec = additionalData.ringTimeSec;
    if (additionalData.talkTimeSec !== undefined)
      updateData.talk_time_sec = additionalData.talkTimeSec;
    if (additionalData.outcome) updateData.outcome = additionalData.outcome;
  }

  const { data, error } = await supabase
    .from('ai_voice_calls')
    .update(updateData)
    .eq('id', callId)
    .select()
    .single();

  if (error) throw error;
  return mapCall(data);
}

export async function addTranscription(
  callId: string,
  entry: VoiceTranscriptEntry
): Promise<void> {
  const { data: call } = await supabase
    .from('ai_voice_calls')
    .select('transcription')
    .eq('id', callId)
    .single();

  const transcription = [...(call?.transcription || []), entry];

  await supabase
    .from('ai_voice_calls')
    .update({ transcription })
    .eq('id', callId);
}

export async function saveRecording(
  callId: string,
  recordingUrl: string,
  durationSec: number
): Promise<void> {
  await supabase
    .from('ai_voice_calls')
    .update({
      recording_url: recordingUrl,
      recording_duration_sec: durationSec,
    })
    .eq('id', callId);
}

// ============================================================================
// ElevenLabs API Integration
// ============================================================================

export async function getAvailableVoices(
  apiKey: string
): Promise<ElevenLabsVoice[]> {
  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.voices || []).map((v: Record<string, unknown>) => ({
    voiceId: v.voice_id as string,
    name: v.name as string,
    category: v.category as string,
    previewUrl: v.preview_url as string,
  }));
}

export async function textToSpeech(
  config: ElevenLabsConfig,
  text: string,
  options?: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  }
): Promise<ArrayBuffer> {
  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${config.voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId || 'eleven_turbo_v2_5',
        voice_settings: {
          stability: options?.stability ?? 0.5,
          similarity_boost: options?.similarityBoost ?? 0.75,
          style: options?.style ?? 0,
          use_speaker_boost: options?.useSpeakerBoost ?? true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`ElevenLabs TTS error: ${JSON.stringify(error)}`);
  }

  return response.arrayBuffer();
}

export async function getConversationalAIWebSocket(
  apiKey: string,
  agentId: string
): Promise<{ wsUrl: string; sessionId: string }> {
  // ElevenLabs Conversational AI WebSocket endpoint
  const response = await fetch(
    `${ELEVENLABS_API_URL}/convai/conversation/get_signed_url`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs ConvAI error: ${response.status}`);
  }

  const data = await response.json();
  return {
    wsUrl: data.signed_url,
    sessionId: data.session_id,
  };
}

// ============================================================================
// Outbound Call Initiation (via ElevenLabs or Twilio)
// ============================================================================

export async function initiateOutboundCall(
  agentId: string,
  organizationId: string,
  toNumber: string,
  purpose: string,
  config: ElevenLabsConfig,
  context?: {
    customerId?: string;
    bookingId?: string;
    customerName?: string;
    bookingDetails?: Record<string, unknown>;
  }
): Promise<AIVoiceCall> {
  // Create call record
  const call = await createCall(agentId, organizationId, {
    direction: 'outbound',
    toNumber,
    purpose,
    customerId: context?.customerId,
    bookingId: context?.bookingId,
    voiceId: config.voiceId,
  });

  // In production, this would integrate with:
  // 1. Twilio for phone call infrastructure
  // 2. ElevenLabs Conversational AI for the voice agent
  // 
  // For now, we return the call record and handle actual
  // calling via edge function or external service

  return call;
}

// ============================================================================
// Helpers
// ============================================================================

function mapCall(data: unknown): AIVoiceCall {
  const d = data as Record<string, unknown>;
  return {
    id: d.id as string,
    agentId: d.agent_id as string,
    organizationId: d.organization_id as string,
    callSid: d.call_sid as string | undefined,
    direction: d.direction as VoiceCallDirection,
    status: d.status as VoiceCallStatus,
    fromNumber: d.from_number as string | undefined,
    toNumber: d.to_number as string | undefined,
    customerId: d.customer_id as string | undefined,
    bookingId: d.booking_id as string | undefined,
    purpose: d.purpose as string | undefined,
    recordingUrl: d.recording_url as string | undefined,
    recordingDurationSec: d.recording_duration_sec as number | undefined,
    transcription: (d.transcription as VoiceTranscriptEntry[]) || [],
    queueTimeSec: d.queue_time_sec as number | undefined,
    ringTimeSec: d.ring_time_sec as number | undefined,
    talkTimeSec: d.talk_time_sec as number | undefined,
    outcome: d.outcome as string | undefined,
    notes: d.notes as string | undefined,
    satisfactionRating: d.satisfaction_rating as number | undefined,
    voiceId: d.voice_id as string | undefined,
    voiceSettings: d.voice_settings as Record<string, unknown> | undefined,
    queuedAt: d.queued_at as string,
    startedAt: d.started_at as string | undefined,
    answeredAt: d.answered_at as string | undefined,
    endedAt: d.ended_at as string | undefined,
  };
}

export const voiceAgentService = {
  listCalls,
  getCall,
  createCall,
  updateCallStatus,
  addTranscription,
  saveRecording,
  getAvailableVoices,
  textToSpeech,
  getConversationalAIWebSocket,
  initiateOutboundCall,
};
