/**
 * VoiceAgentPanel
 * Voice call management and history panel
 */

import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, Clock, Play, FileText, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useVoiceAgent } from '../hooks/useVoiceAgent';
import type { AIVoiceCall, VoiceCallStatus } from '../types';

interface VoiceAgentPanelProps {
  organizationId: string;
  agentId?: string;
  isDark: boolean;
}

function getStatusBadge(status: VoiceCallStatus, isDark: boolean) {
  const styles: Record<VoiceCallStatus, { bg: string; text: string }> = {
    queued: { bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100', text: isDark ? 'text-yellow-400' : 'text-yellow-700' },
    ringing: { bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100', text: isDark ? 'text-blue-400' : 'text-blue-700' },
    in_progress: { bg: isDark ? 'bg-green-500/20' : 'bg-green-100', text: isDark ? 'text-green-400' : 'text-green-700' },
    completed: { bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100', text: isDark ? 'text-emerald-400' : 'text-emerald-700' },
    failed: { bg: isDark ? 'bg-red-500/20' : 'bg-red-100', text: isDark ? 'text-red-400' : 'text-red-700' },
    busy: { bg: isDark ? 'bg-orange-500/20' : 'bg-orange-100', text: isDark ? 'text-orange-400' : 'text-orange-700' },
    no_answer: { bg: isDark ? 'bg-gray-500/20' : 'bg-gray-100', text: isDark ? 'text-gray-400' : 'text-gray-700' },
  };
  const style = styles[status] || styles.queued;
  return <Badge className={`${style.bg} ${style.text} border-0`}>{status.replace('_', ' ')}</Badge>;
}

export function VoiceAgentPanel({ organizationId, agentId, isDark }: VoiceAgentPanelProps) {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedCall, setSelectedCall] = useState<AIVoiceCall | null>(null);

  const { calls, loading, error, initiateCall, refreshCalls } = useVoiceAgent({
    organizationId,
    agentId,
  });

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  const handleInitiateCall = async () => {
    if (!phoneNumber || !purpose) return;
    try {
      await initiateCall(phoneNumber, purpose);
      setShowCallDialog(false);
      setPhoneNumber('');
      setPurpose('');
    } catch (err) {
      console.error('Failed to initiate call:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Phone className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <CardTitle className={textClass}>Voice Calls</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={refreshCalls}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCallDialog(true)} disabled={!agentId}>
                <PhoneCall className="w-4 h-4 mr-2" />
                New Call
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          {calls.length === 0 ? (
            <div className={`text-center py-8 ${textMutedClass}`}>
              <PhoneOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No voice calls yet</p>
              <p className="text-sm mt-1">Initiate a call to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.slice(0, 10).map((call) => (
                <div
                  key={call.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${bgElevatedClass} cursor-pointer hover:opacity-80`}
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-center gap-3">
                    <Phone className={`w-5 h-5 ${textMutedClass}`} />
                    <div>
                      <p className={`text-sm font-medium ${textClass}`}>{call.toNumber || 'Unknown'}</p>
                      <p className={`text-xs ${textMutedClass}`}>{call.purpose}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs ${textMutedClass}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDuration(call.talkTimeSec)}
                      </p>
                    </div>
                    {getStatusBadge(call.status, isDark)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className={`${cardBgClass} border ${borderClass}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Initiate Voice Call</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className={`text-sm ${textClass}`}>Phone Number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm ${textClass}`}>Purpose</label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Booking confirmation"
                className={isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCallDialog(false)}>Cancel</Button>
            <Button onClick={handleInitiateCall} disabled={!phoneNumber || !purpose}>
              <PhoneCall className="w-4 h-4 mr-2" />
              Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Details Dialog */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className={`${cardBgClass} border ${borderClass} max-w-lg`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Call Details</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${textMutedClass}`}>To</p>
                  <p className={`text-sm ${textClass}`}>{selectedCall.toNumber}</p>
                </div>
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Status</p>
                  {getStatusBadge(selectedCall.status, isDark)}
                </div>
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Duration</p>
                  <p className={`text-sm ${textClass}`}>{formatDuration(selectedCall.talkTimeSec)}</p>
                </div>
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Purpose</p>
                  <p className={`text-sm ${textClass}`}>{selectedCall.purpose}</p>
                </div>
              </div>
              {selectedCall.transcription.length > 0 && (
                <div>
                  <p className={`text-xs ${textMutedClass} mb-2`}>Transcription</p>
                  <div className={`max-h-48 overflow-y-auto p-3 rounded-lg ${bgElevatedClass}`}>
                    {selectedCall.transcription.map((entry, i) => (
                      <p key={i} className={`text-sm ${textClass} mb-1`}>
                        <span className={entry.speaker === 'agent' ? 'text-purple-400' : 'text-blue-400'}>
                          {entry.speaker}:
                        </span>{' '}
                        {entry.text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
