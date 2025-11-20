import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Palette, Moon, Sun } from 'lucide-react';
import { useWidgetTheme } from './WidgetThemeContext';

export function WidgetThemeSettings() {
  const { widgetTheme, setWidgetTheme, primaryColor, setPrimaryColor, getCurrentPrimaryColor } = useWidgetTheme();

  const presetColors = {
    light: [
      { name: 'Blue', value: '#2563eb' },
      { name: 'Purple', value: '#9333ea' },
      { name: 'Green', value: '#059669' },
      { name: 'Red', value: '#dc2626' },
      { name: 'Orange', value: '#ea580c' },
      { name: 'Pink', value: '#db2777' },
    ],
    dark: [
      { name: 'Blue (Primary)', value: '#2563eb' },
      { name: 'Purple Blue (Secondary)', value: '#5B5FFF' },
      { name: 'Cyan', value: '#06b6d4' },
      { name: 'Emerald', value: '#10b981' },
      { name: 'Rose', value: '#f43f5e' },
      { name: 'Amber', value: '#f59e0b' },
    ],
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg text-foreground">Widget Theme & Colors</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Customize the appearance of your booking widgets for both light and dark modes.
          </p>
        </div>

        {/* Theme Mode Toggle */}
        <div>
          <Label className="mb-3 block">Widget Theme Mode</Label>
          <div className="flex gap-3">
            <Button
              variant={widgetTheme === 'light' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setWidgetTheme('light')}
            >
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </Button>
            <Button
              variant={widgetTheme === 'dark' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setWidgetTheme('dark')}
            >
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </Button>
          </div>
        </div>

        {/* Color Presets for Light Mode */}
        <div>
          <Label className="mb-3 block">Light Mode Primary Color</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {presetColors.light.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor({ ...primaryColor, light: color.value })}
                className={`
                  relative aspect-square rounded-lg border-2 transition-all hover:scale-105
                  ${primaryColor.light === color.value ? 'border-foreground shadow-lg' : 'border-border'}
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {primaryColor.light === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground mb-2 block">Custom Color (Hex)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor.light}
                onChange={(e) => setPrimaryColor({ ...primaryColor, light: e.target.value })}
                className="w-16 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor.light}
                onChange={(e) => setPrimaryColor({ ...primaryColor, light: e.target.value })}
                className="flex-1 h-10 px-3 rounded border border-border bg-background text-foreground"
                placeholder="#2563eb"
              />
            </div>
          </div>
        </div>

        {/* Color Presets for Dark Mode */}
        <div>
          <Label className="mb-3 block">Dark Mode Primary Color</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {presetColors.dark.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor({ ...primaryColor, dark: color.value })}
                className={`
                  relative aspect-square rounded-lg border-2 transition-all hover:scale-105
                  ${primaryColor.dark === color.value ? 'border-foreground shadow-lg' : 'border-border'}
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {primaryColor.dark === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground mb-2 block">Custom Color (Hex)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor.dark}
                onChange={(e) => setPrimaryColor({ ...primaryColor, dark: e.target.value })}
                className="w-16 h-10 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor.dark}
                onChange={(e) => setPrimaryColor({ ...primaryColor, dark: e.target.value })}
                className="flex-1 h-10 px-3 rounded border border-border bg-background text-foreground"
                placeholder="#2563eb"
              />
            </div>
          </div>
        </div>

        {/* Current Preview */}
        <div className="p-4 bg-muted rounded-lg">
          <Label className="mb-2 block text-sm">Current Active Color</Label>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-border shadow-md"
              style={{ backgroundColor: getCurrentPrimaryColor() }}
            />
            <div>
              <div className="text-sm text-foreground">{widgetTheme === 'light' ? 'Light Mode' : 'Dark Mode'}</div>
              <div className="text-xs text-muted-foreground">{getCurrentPrimaryColor()}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
