import React, { useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CalendarWidget } from './CalendarWidget';
import { toast } from 'sonner';

interface CustomSettingsPanelProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export default function CustomSettingsPanel({ config, onConfigChange }: CustomSettingsPanelProps) {
  const defaults = {
    logoUrl: '',
    logoSize: 64,
    logoPosition: 'top',
    headlineText: config?.widgetTitle || '',
    headlineFont: config?.fontFamily || '',
    headlineSize: 28,
    headlineColor: '#111827',
    headlineAlign: 'center',
    descriptionHtml: config?.widgetDescription || '',
    descriptionCharLimit: 280,
    widgetWidth: 1024,
    widgetHeight: 768,
    responsiveScale: 1,
    minWidth: 320,
    maxWidth: 1600,
    previewDevice: 'desktop',
    themeVariant: 'light',
    themeColor: '#2563eb'
  };

  const cs = useMemo(() => ({ ...defaults, ...(config?.customSettings || {}) }), [config]);

  const locked = Boolean(config?.proLockedCustomSettings);

  const update = (key: string, value: any) => {
    const next = { ...config, customSettings: { ...cs, [key]: value } };
    onConfigChange(next);
  };

  const handleLogoUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('logoUrl', String(reader.result));
    reader.readAsDataURL(file);
  };

  const applyDevicePreset = (device: string) => {
    if (device === 'mobile') {
      update('previewDevice', 'mobile');
      update('widgetWidth', 375);
    } else if (device === 'tablet') {
      update('previewDevice', 'tablet');
      update('widgetWidth', 768);
    } else {
      update('previewDevice', 'desktop');
      update('widgetWidth', 1024);
    }
  };

  const validateNumber = (value: number, min: number, max: number, label: string) => {
    if (Number.isNaN(value) || value < min || value > max) {
      toast.error(`${label} must be between ${min} and ${max}`);
      return false;
    }
    return true;
  };

  const sanitizedDescription = () => {
    const html = String(cs.descriptionHtml || '').slice(0, cs.descriptionCharLimit);
    return html;
  };

  return (
    <div className="space-y-6 relative">
      {locked && (
        <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm border rounded-xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold">Pro Features</div>
            <div className="text-sm text-gray-600">Upgrade to unlock Custom Settings</div>
            <Button disabled variant="default">Upgrade</Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="visual">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>Configure logo image, size, and position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Upload Logo</Label>
                  <Input type="file" accept="image/*" disabled={locked} onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input type="range" min={24} max={200} value={cs.logoSize} disabled={locked} onChange={(e) => update('logoSize', parseInt(e.target.value, 10))} />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={cs.logoPosition} onValueChange={(v) => update('logoPosition', v)}>
                    <SelectTrigger disabled={locked}><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headline</CardTitle>
              <CardDescription>Control font, size, color, and alignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Input value={cs.headlineText} disabled={locked} onChange={(e) => update('headlineText', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Input value={cs.headlineFont} disabled={locked} onChange={(e) => update('headlineFont', e.target.value)} placeholder="e.g., Inter, Arial" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input type="range" min={12} max={48} value={cs.headlineSize} disabled={locked} onChange={(e) => update('headlineSize', parseInt(e.target.value, 10))} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input type="color" value={cs.headlineColor} disabled={locked} onChange={(e) => update('headlineColor', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <Select value={cs.headlineAlign} onValueChange={(v) => update('headlineAlign', v)}>
                    <SelectTrigger disabled={locked}><SelectValue placeholder="Select alignment" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>Rich text content with character limit and formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Rich Text</Label>
                  <div
                    contentEditable={!locked}
                    className="min-h-[120px] p-3 border rounded-md focus:outline-none"
                    onInput={(e) => update('descriptionHtml', (e.target as HTMLDivElement).innerHTML)}
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription() }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Character Limit</Label>
                  <Input
                    type="number"
                    min={50}
                    max={2000}
                    value={cs.descriptionCharLimit}
                    disabled={locked}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (validateNumber(v, 50, 2000, 'Character limit')) update('descriptionCharLimit', v);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Display</CardTitle>
              <CardDescription>Configure size and responsive behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    type="range"
                    min={cs.minWidth}
                    max={cs.maxWidth}
                    value={cs.widgetWidth}
                    disabled={locked}
                    onChange={(e) => update('widgetWidth', parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Responsive Scale</Label>
                  <Input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.05}
                    value={cs.responsiveScale}
                    disabled={locked}
                    onChange={(e) => update('responsiveScale', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Options</CardTitle>
              <CardDescription>Device emulation and theme selectors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Device</Label>
                  <Select value={cs.previewDevice} onValueChange={applyDevicePreset}>
                    <SelectTrigger disabled={locked}><SelectValue placeholder="Select device" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Theme Variant</Label>
                  <Select value={cs.themeVariant} onValueChange={(v) => update('themeVariant', v)}>
                    <SelectTrigger disabled={locked}><SelectValue placeholder="Select theme" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input type="color" value={cs.themeColor} disabled={locked} onChange={(e) => update('themeColor', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="rounded-xl border bg-white p-4">
                <div className="mb-3 text-sm text-gray-600">Real-time Preview</div>
                <div
                  className="mx-auto border rounded-xl overflow-hidden"
                  style={{ width: cs.widgetWidth, transform: `scale(${cs.responsiveScale})`, transformOrigin: 'top center' }}
                >
                  <CalendarWidget primaryColor={cs.themeColor} config={{ ...config, customSettings: cs }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

