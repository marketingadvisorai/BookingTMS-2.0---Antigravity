/**
 * useVoiceAgent Hook
 * Manages ElevenLabs voice agent functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceAgentService } from '../services/voice-agent.service';
import type {
  AIVoiceCall,
  ElevenLabsVoice,
  VoiceCallFilters,
} from '../types';

interface UseVoiceAgentOptions {
  organizationId: string;
  agentId?: string;
  autoFetch?: boolean;
}

interface UseVoiceAgentReturn {
  calls: AIVoiceCall[];
  loading: boolean;
  error: string | null;
  voices: ElevenLabsVoice[];
  loadingVoices: boolean;
  initiateCall: (toNumber: string, purpose: string, context?: Record<string, unknown>) => Promise<AIVoiceCall>;
  refreshCalls: () => Promise<void>;
  fetchVoices: (apiKey: string) => Promise<void>;
  synthesizeSpeech: (text: string, voiceId: string, apiKey: string) => Promise<ArrayBuffer>;
  previewVoice: (voiceId: string, apiKey: string, text?: string) => Promise<void>;
}

export function useVoiceAgent({
  organizationId,
  agentId,
  autoFetch = true,
}: UseVoiceAgentOptions): UseVoiceAgentReturn {
  const [calls, setCalls] = useState<AIVoiceCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  
  const mountedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const refreshCalls = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters: VoiceCallFilters = agentId ? { agentId } : {};
      const data = await voiceAgentService.listCalls(organizationId, filters);
      if (mountedRef.current) {
        setCalls(data);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch calls');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [organizationId, agentId]);

  const fetchVoices = useCallback(async (apiKey: string) => {
    if (!apiKey) return;
    
    setLoadingVoices(true);
    
    try {
      const voiceList = await voiceAgentService.getAvailableVoices(apiKey);
      if (mountedRef.current) {
        setVoices(voiceList);
      }
    } catch (err) {
      console.error('Failed to fetch voices:', err);
    } finally {
      if (mountedRef.current) {
        setLoadingVoices(false);
      }
    }
  }, []);

  const initiateCall = useCallback(async (
    toNumber: string,
    purpose: string,
    context?: Record<string, unknown>
  ): Promise<AIVoiceCall> => {
    if (!agentId) {
      throw new Error('Agent ID required for initiating calls');
    }
    
    const call = await voiceAgentService.initiateOutboundCall(
      agentId,
      organizationId,
      toNumber,
      purpose,
      { apiKey: '', voiceId: '' }, // Config comes from agent settings
      context
    );
    
    await refreshCalls();
    return call;
  }, [agentId, organizationId, refreshCalls]);

  const synthesizeSpeech = useCallback(async (
    text: string,
    voiceId: string,
    apiKey: string
  ): Promise<ArrayBuffer> => {
    return voiceAgentService.textToSpeech(
      { apiKey, voiceId },
      text
    );
  }, []);

  const previewVoice = useCallback(async (
    voiceId: string,
    apiKey: string,
    text: string = 'Hello! This is a preview of how I sound.'
  ) => {
    try {
      const audioBuffer = await synthesizeSpeech(text, voiceId, apiKey);
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(url);
      await audioRef.current.play();
    } catch (err) {
      console.error('Failed to preview voice:', err);
      throw err;
    }
  }, [synthesizeSpeech]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (autoFetch && organizationId) {
      refreshCalls();
    }
    
    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoFetch, organizationId, refreshCalls]);

  return {
    calls,
    loading,
    error,
    voices,
    loadingVoices,
    initiateCall,
    refreshCalls,
    fetchVoices,
    synthesizeSpeech,
    previewVoice,
  };
}
