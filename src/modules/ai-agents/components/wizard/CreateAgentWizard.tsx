/**
 * CreateAgentWizard
 * Main wizard component for creating AI agents
 */

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/layout/ThemeContext';
import { AgentTypeSelector } from './AgentTypeSelector';
import { AgentConfigStep } from './AgentConfigStep';
import { AgentTestStep } from './AgentTestStep';
import type { AIAgentCategory } from '../../types';

interface AgentConfigData {
  name: string;
  description: string;
  personality: 'friendly' | 'professional' | 'casual';
  welcomeMessage: string;
  systemPrompt: string;
}

interface CreateAgentWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: { type: AIAgentCategory; config: AgentConfigData }) => Promise<void>;
}

const STEPS = ['Select Type', 'Configure', 'Test'];

export function CreateAgentWizard({ open, onClose, onComplete }: CreateAgentWizardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<AIAgentCategory | null>(null);
  const [config, setConfig] = useState<AgentConfigData>({
    name: '',
    description: '',
    personality: 'friendly',
    welcomeMessage: 'Hi! How can I help you today?',
    systemPrompt: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const canProceed = () => {
    switch (step) {
      case 0: return selectedType !== null;
      case 1: return config.name.trim().length > 0;
      case 2: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        await onComplete({ type: selectedType!, config });
        handleClose();
      } catch (error) {
        console.error('Failed to create agent:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(0);
    setSelectedType(null);
    setConfig({
      name: '',
      description: '',
      personality: 'friendly',
      welcomeMessage: 'Hi! How can I help you today?',
      systemPrompt: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : ''}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={textClass}>Create AI Agent</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < step
                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'
                    : i === step
                      ? isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'
                      : isDark ? 'bg-[#1e1e1e] text-[#a3a3a3]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:inline ${i === step ? textClass : textMutedClass}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? (isDark ? 'bg-emerald-500' : 'bg-green-500') : borderClass}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="py-4">
          {step === 0 && (
            <AgentTypeSelector
              selected={selectedType}
              onSelect={setSelectedType}
              isDark={isDark}
            />
          )}
          {step === 1 && selectedType && (
            <AgentConfigStep
              agentType={selectedType}
              config={config}
              onChange={setConfig}
              isDark={isDark}
            />
          )}
          {step === 2 && (
            <AgentTestStep
              agentName={config.name}
              welcomeMessage={config.welcomeMessage}
              systemPrompt={config.systemPrompt}
              isDark={isDark}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={`flex items-center justify-between pt-4 border-t ${borderClass}`}>
          <Button variant="outline" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca]' : ''}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : step === STEPS.length - 1 ? (
              <Check className="w-4 h-4 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1" />
            )}
            {step === STEPS.length - 1 ? 'Create Agent' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
