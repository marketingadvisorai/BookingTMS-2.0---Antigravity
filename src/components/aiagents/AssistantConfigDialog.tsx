import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import {
  Settings,
  Brain,
  MessageSquare,
  BookOpen,
  Zap,
  Plus,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

interface AssistantConfig {
  personality: {
    tone: 'professional' | 'friendly' | 'casual';
    style: 'concise' | 'detailed' | 'balanced';
    greeting: string;
    signOff: string;
  };
  knowledge: {
    customFAQs: FAQ[];
    businessHours: string;
    specialInstructions: string;
  };
  behavior: {
    autoSuggest: boolean;
    showPrices: boolean;
    collectFeedback: boolean;
    escalateToHuman: boolean;
  };
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface AssistantConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CONFIG: AssistantConfig = {
  personality: {
    tone: 'friendly',
    style: 'balanced',
    greeting: 'Hi! I\'m here to help you book an amazing escape room experience. What can I do for you today?',
    signOff: 'Thanks for chatting! I\'m here anytime you need help.'
  },
  knowledge: {
    customFAQs: [
      {
        id: '1',
        question: 'What should I bring?',
        answer: 'Just bring yourself and your team! We provide everything you need. Comfortable clothing is recommended.'
      },
      {
        id: '2',
        question: 'Can we take photos?',
        answer: 'Yes! Photos are encouraged. We have a photo area at the end where you can capture your victory moment.'
      }
    ],
    businessHours: 'Monday-Friday: 10am-10pm, Saturday-Sunday: 9am-11pm',
    specialInstructions: 'Always mention our satisfaction guarantee and offer alternative dates if fully booked.'
  },
  behavior: {
    autoSuggest: true,
    showPrices: true,
    collectFeedback: true,
    escalateToHuman: true
  }
};

export function AssistantConfigDialog({ isOpen, onClose }: AssistantConfigDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const [config, setConfig] = useState<AssistantConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = () => {
    const saved = localStorage.getItem('assistantConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    setHasChanges(false);
  };

  const saveConfig = () => {
    localStorage.setItem('assistantConfig', JSON.stringify(config));
    toast.success('Assistant configuration saved!');
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      setConfig(DEFAULT_CONFIG);
      setHasChanges(true);
    }
  };

  const updatePersonality = (field: keyof AssistantConfig['personality'], value: any) => {
    setConfig({
      ...config,
      personality: { ...config.personality, [field]: value }
    });
    setHasChanges(true);
  };

  const updateKnowledge = (field: keyof AssistantConfig['knowledge'], value: any) => {
    setConfig({
      ...config,
      knowledge: { ...config.knowledge, [field]: value }
    });
    setHasChanges(true);
  };

  const updateBehavior = (field: keyof AssistantConfig['behavior'], value: any) => {
    setConfig({
      ...config,
      behavior: { ...config.behavior, [field]: value }
    });
    setHasChanges(true);
  };

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setConfig({
      ...config,
      knowledge: {
        ...config.knowledge,
        customFAQs: [...config.knowledge.customFAQs, newFAQ]
      }
    });
    setHasChanges(true);
  };

  const updateFAQ = (id: string, field: 'question' | 'answer', value: string) => {
    setConfig({
      ...config,
      knowledge: {
        ...config.knowledge,
        customFAQs: config.knowledge.customFAQs.map(faq =>
          faq.id === id ? { ...faq, [field]: value } : faq
        )
      }
    });
    setHasChanges(true);
  };

  const deleteFAQ = (id: string) => {
    setConfig({
      ...config,
      knowledge: {
        ...config.knowledge,
        customFAQs: config.knowledge.customFAQs.filter(faq => faq.id !== id)
      }
    });
    setHasChanges(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${bgClass} ${textClass} border ${borderClass}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${textClass}`}>
            <Settings className="w-5 h-5" />
            Configure & Train Assistant
          </DialogTitle>
          <DialogDescription className={textMutedClass}>
            Customize your AI assistant's personality, knowledge, and behavior
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personality" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className={`w-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}>
            <TabsTrigger value="personality" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex-1">
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              Behavior
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-4 mt-0">
              <Card className={`${bgElevatedClass} border ${borderClass}`}>
                <CardHeader>
                  <CardTitle className={`text-sm ${textClass}`}>Tone & Style</CardTitle>
                  <CardDescription className={textMutedClass}>
                    Define how your assistant communicates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className={textClass}>Tone</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['professional', 'friendly', 'casual'] as const).map((tone) => (
                        <Button
                          key={tone}
                          variant={config.personality.tone === tone ? 'default' : 'outline'}
                          onClick={() => updatePersonality('tone', tone)}
                          className={`${
                            config.personality.tone === tone && isDark 
                              ? 'bg-[#4f46e5]' 
                              : config.personality.tone === tone 
                              ? 'bg-blue-600' 
                              : ''
                          }`}
                        >
                          {tone.charAt(0).toUpperCase() + tone.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={textClass}>Response Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['concise', 'balanced', 'detailed'] as const).map((style) => (
                        <Button
                          key={style}
                          variant={config.personality.style === style ? 'default' : 'outline'}
                          onClick={() => updatePersonality('style', style)}
                          className={`${
                            config.personality.style === style && isDark 
                              ? 'bg-[#4f46e5]' 
                              : config.personality.style === style 
                              ? 'bg-blue-600' 
                              : ''
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={textClass}>Custom Greeting</Label>
                    <Textarea
                      value={config.personality.greeting}
                      onChange={(e) => updatePersonality('greeting', e.target.value)}
                      placeholder="Enter custom greeting..."
                      className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={textClass}>Sign-off Message</Label>
                    <Textarea
                      value={config.personality.signOff}
                      onChange={(e) => updatePersonality('signOff', e.target.value)}
                      placeholder="Enter sign-off message..."
                      className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Knowledge Base Tab */}
            <TabsContent value="knowledge" className="space-y-4 mt-0">
              <Card className={`${bgElevatedClass} border ${borderClass}`}>
                <CardHeader>
                  <CardTitle className={`text-sm flex items-center justify-between ${textClass}`}>
                    Custom FAQs
                    <Button size="sm" onClick={addFAQ}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </Button>
                  </CardTitle>
                  <CardDescription className={textMutedClass}>
                    Train your assistant with custom Q&A pairs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.knowledge.customFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className={`p-3 rounded-lg border ${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                          className={`flex-1 ${isDark ? 'bg-[#161616]' : 'bg-gray-50'}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFAQ(faq.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                        className={`${isDark ? 'bg-[#161616]' : 'bg-gray-50'}`}
                        rows={2}
                      />
                    </div>
                  ))}
                  {config.knowledge.customFAQs.length === 0 && (
                    <div className={`text-center py-8 ${textMutedClass}`}>
                      <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No FAQs added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`${bgElevatedClass} border ${borderClass}`}>
                <CardHeader>
                  <CardTitle className={`text-sm ${textClass}`}>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className={textClass}>Business Hours</Label>
                    <Input
                      value={config.knowledge.businessHours}
                      onChange={(e) => updateKnowledge('businessHours', e.target.value)}
                      placeholder="e.g., Mon-Fri: 10am-10pm"
                      className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={textClass}>Special Instructions</Label>
                    <Textarea
                      value={config.knowledge.specialInstructions}
                      onChange={(e) => updateKnowledge('specialInstructions', e.target.value)}
                      placeholder="Additional guidelines for the assistant..."
                      className={`${isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-4 mt-0">
              <Card className={`${bgElevatedClass} border ${borderClass}`}>
                <CardHeader>
                  <CardTitle className={`text-sm ${textClass}`}>Assistant Features</CardTitle>
                  <CardDescription className={textMutedClass}>
                    Control what your assistant can do
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${textClass}`}>Auto-suggest Responses</p>
                      <p className={`text-xs ${textMutedClass}`}>Show quick suggestion chips</p>
                    </div>
                    <Switch
                      checked={config.behavior.autoSuggest}
                      onCheckedChange={(checked) => updateBehavior('autoSuggest', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${textClass}`}>Show Prices</p>
                      <p className={`text-xs ${textMutedClass}`}>Display pricing information</p>
                    </div>
                    <Switch
                      checked={config.behavior.showPrices}
                      onCheckedChange={(checked) => updateBehavior('showPrices', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${textClass}`}>Collect Feedback</p>
                      <p className={`text-xs ${textMutedClass}`}>Ask for feedback after conversations</p>
                    </div>
                    <Switch
                      checked={config.behavior.collectFeedback}
                      onCheckedChange={(checked) => updateBehavior('collectFeedback', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${textClass}`}>Escalate to Human</p>
                      <p className={`text-xs ${textMutedClass}`}>Offer live support option</p>
                    </div>
                    <Switch
                      checked={config.behavior.escalateToHuman}
                      onCheckedChange={(checked) => updateBehavior('escalateToHuman', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-2">
                  <Brain className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Training in Progress</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                      Your assistant learns from every conversation and improves over time based on your configurations.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className={`flex items-center justify-between pt-4 border-t ${borderClass}`}>
          <Button
            variant="outline"
            onClick={resetToDefaults}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={saveConfig}
              disabled={!hasChanges}
              className={isDark ? 'bg-[#4f46e5]' : 'bg-blue-600'}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
