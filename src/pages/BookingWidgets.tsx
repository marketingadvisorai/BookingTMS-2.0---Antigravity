import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/layout/PageHeader';
import { Code, ExternalLink, Eye, Settings2, Monitor, Save, Lock } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import FareBookSettings from '../components/widgets/FareBookSettings';
import CalendarWidgetSettings from '../components/widgets/CalendarWidgetSettings';
import WidgetSettings from '../components/widgets/WidgetSettings';
import { EmbedPreview } from '../components/widgets/EmbedPreview';
import { WidgetThemeProvider } from '../components/widgets/WidgetThemeContext';
import { WidgetThemeSettings } from '../components/widgets/WidgetThemeSettings';
import { widgetTemplates, getTemplateById, isWidgetLocked } from '../components/widgets/config/widgetTemplates';
import { useWidgetConfigs } from '../components/widgets/config/useWidgetConfigs';
import { EmbedCodePanel } from '../components/widgets/embed/EmbedCodePanel';
import { EmbedInstallationGuide } from '../components/widgets/embed/EmbedInstallationGuide';

export function BookingWidgets() {
  const { isRole } = useAuth();
  const isBetaOwner = isRole('beta-owner');

  // Use widget configs hook for all state management
  const {
    fareBookConfig,
    setFareBookConfig,
    getWidgetConfig,
    getWidgetConfigSetter,
  } = useWidgetConfigs();

  const [selectedTemplate, setSelectedTemplate] = useState('singlegame');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaveStatus('saved');
    toast.success('Settings saved successfully!');
    setTimeout(() => {
      setShowSettings(false);
      setSaveStatus('idle');
    }, 500);
  };

  const selectedTemplateData = getTemplateById(selectedTemplate);
  const SelectedComponent = selectedTemplateData?.component;

  return (
    <WidgetThemeProvider>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Booking Widget Templates"
          description="Choose a professional booking widget for your website"
          sticky
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-[#6366f1]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Templates Available</p>
                  <p className="text-gray-900 dark:text-white">{widgetTemplates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Widget Bookings</p>
                  <p className="text-gray-900 dark:text-white">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Conversion Rate</p>
                  <p className="text-gray-900 dark:text-white text-sm sm:text-base">5.8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373]">Active Installs</p>
                  <p className="text-gray-900 dark:text-white">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Selection */}
        <div>
          <h2 className="text-gray-900 dark:text-white mb-3 sm:mb-4">Choose Your Template</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {widgetTemplates.map((template) => {
              const locked = isWidgetLocked(template.id, isBetaOwner);

              return (
                <Card
                  key={template.id}
                  className={`border-2 transition-all ${locked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                    } ${selectedTemplate === template.id
                      ? 'border-blue-600 dark:border-[#4f46e5] shadow-md dark:shadow-[0_0_20px_rgba(79,70,229,0.2)]'
                      : 'border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                    }`}
                  style={{
                    borderColor: selectedTemplate === template.id ? primaryColor : undefined,
                  }}
                  onClick={() => !locked && setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-4 sm:p-6 relative">
                    {/* Pro Feature Overlay for Beta Owners */}
                    {locked && (
                      <div className="absolute inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10 p-6">
                        <Lock className="w-8 h-8 text-white mb-3" />
                        <h3 className="text-white text-lg font-semibold mb-2">Pro Features</h3>
                        <p className="text-gray-300 text-sm text-center mb-4">Upgrade to unlock Custom Settings</p>
                        <Button
                          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Contact us to upgrade your plan');
                          }}
                        >
                          Upgrade
                        </Button>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-gray-900 dark:text-white text-sm sm:text-base">{template.name}</h3>
                          {template.recommended && (
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-[#4f46e5]/20 text-blue-700 dark:text-[#6366f1] border border-blue-200 dark:border-[#4f46e5]/30 text-xs flex-shrink-0">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mb-3">{template.description}</p>
                        <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#2a2a2a]">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!locked) {
                            setSelectedTemplate(template.id);
                            setShowPreview(true);
                          }
                        }}
                        disabled={locked}
                        className="flex-1 h-9 text-xs sm:text-sm"
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!locked) {
                            setSelectedTemplate(template.id);
                            setShowSettings(true);
                          }
                        }}
                        disabled={locked}
                        className="flex-1 h-9 text-xs sm:text-sm"
                      >
                        <Settings2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Settings</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!locked) {
                            setSelectedTemplate(template.id);
                            setShowEmbed(true);
                          }
                        }}
                        disabled={locked}
                        className="flex-1 h-9 text-xs sm:text-sm bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
                      >
                        <Code className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Embed</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Widget Theme & Customization */}
        <WidgetThemeSettings />

        {/* Customization & Code */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Actions */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-10 text-sm"
                  onClick={() => setShowPreview(true)}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Full Screen Preview
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 text-sm"
                  onClick={() => window.open('https://bookingtms.com/demo', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live Demo
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 text-sm bg-blue-600 dark:bg-[#4f46e5] text-white hover:bg-blue-700 dark:hover:bg-[#4338ca] hover:text-white"
                  onClick={() => setShowEmbed(true)}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Get Embed Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embed Code Panel - Now using the new component */}
          <EmbedCodePanel
            selectedTemplateId={selectedTemplate}
            selectedTemplateName={selectedTemplateData?.name || ''}
            primaryColor={primaryColor}
          />
        </div>

        {/* Installation Guide - Now using the new component */}
        <EmbedInstallationGuide />

        {/* Preview Dialog - Full Screen on Mobile */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="!w-screen !h-[100dvh] !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1400px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
            <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">{selectedTemplateData?.name}</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                    Live Preview - See how this widget will look on your website
                  </DialogDescription>
                </div>
                <Badge variant="secondary" className="bg-gray-100 dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] text-xs flex-shrink-0 hidden sm:inline-flex">
                  Template Preview
                </Badge>
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 sm:p-8 pb-24 sm:pb-28 bg-gray-50 dark:bg-[#0a0a0a] min-h-full">
                {SelectedComponent && (
                  <SelectedComponent
                    primaryColor={primaryColor}
                    config={getWidgetConfig(selectedTemplate)}
                  />
                )}
                {/* Bottom spacer to provide blank space after content */}
                <div className="h-12 sm:h-20" />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog - Full Screen on Mobile */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
            <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    Configure {selectedTemplateData?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                    {selectedTemplate === 'farebook'
                      ? 'Customize your widget settings, categories, games, and pricing'
                      : selectedTemplate === 'calendar'
                        ? 'Customize your widget settings with step-by-step game adding experience'
                        : 'Customize your widget settings, games, and pricing options'}
                  </DialogDescription>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] text-xs sm:text-sm h-9 sm:h-10 flex-shrink-0"
                  size="sm"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 sm:p-6 pb-20 sm:pb-24 bg-gray-50 dark:bg-[#0a0a0a]">
                {selectedTemplate === 'farebook' || selectedTemplate === 'farebook-single' ? (
                  <FareBookSettings
                    config={fareBookConfig}
                    onConfigChange={setFareBookConfig}
                    onPreview={() => {
                      setShowSettings(false);
                      setShowPreview(true);
                    }}
                  />
                ) : selectedTemplate === 'calendar' ? (
                  <CalendarWidgetSettings
                    config={getWidgetConfig(selectedTemplate)}
                    onConfigChange={getWidgetConfigSetter(selectedTemplate)}
                    onPreview={() => {
                      setShowSettings(false);
                      setShowPreview(true);
                    }}
                    saveStatus={saveStatus}
                  />
                ) : (
                  <WidgetSettings
                    widgetType={selectedTemplate}
                    config={getWidgetConfig(selectedTemplate)}
                    onConfigChange={getWidgetConfigSetter(selectedTemplate)}
                    onPreview={() => {
                      setShowSettings(false);
                      setShowPreview(true);
                    }}
                  />
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Embed & Install Dialog */}
        <Dialog open={showEmbed} onOpenChange={setShowEmbed}>
          <DialogContent className="!w-screen !h-[100dvh] !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[1200px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-hidden p-0 flex flex-col">
            <DialogHeader className="bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-[#2a2a2a] p-4 sm:p-6 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <DialogTitle className="text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    Embed {selectedTemplateData?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mt-0.5 hidden sm:block">
                    Get the embed code and install the widget on your website
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 sm:p-6 pb-20 sm:pb-24 bg-gray-50 dark:bg-[#0a0a0a]">
                <EmbedPreview
                  widgetId={selectedTemplate}
                  widgetName={selectedTemplateData?.name || ''}
                  primaryColor={primaryColor}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </WidgetThemeProvider>
  );
}
