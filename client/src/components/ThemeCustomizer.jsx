import React, { useState } from 'react';
import { useAppTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Type, 
  Zap, 
  Eye, 
  Volume2, 
  Download, 
  Upload,
  RotateCcw,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

const ThemeCustomizer = () => {
  const {
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    animations,
    setAnimations,
    reducedMotion,
    setReducedMotion,
    fontSize,
    setFontSize,
    borderRadius,
    setBorderRadius,
    compactMode,
    setCompactMode,
    highContrast,
    setHighContrast,
    customAccentColor,
    setCustomAccentColor,
    soundEnabled,
    setSoundEnabled,
    autoSave,
    setAutoSave
  } = useAppTheme();

  const [tempAccentColor, setTempAccentColor] = useState(customAccentColor);

  const fontSizeOptions = [
    { value: 'small', label: 'Small (14px)', size: 14 },
    { value: 'medium', label: 'Medium (16px)', size: 16 },
    { value: 'large', label: 'Large (18px)', size: 18 },
    { value: 'extra-large', label: 'Extra Large (20px)', size: 20 }
  ];

  const borderRadiusOptions = [
    { value: 'none', label: 'None', radius: '0px' },
    { value: 'small', label: 'Small', radius: '0.25rem' },
    { value: 'medium', label: 'Medium', radius: '0.5rem' },
    { value: 'large', label: 'Large', radius: '0.75rem' },
    { value: 'extra-large', label: 'Extra Large', radius: '1rem' }
  ];

  const handleAccentColorChange = (color) => {
    setTempAccentColor(color);
    setCustomAccentColor(color);
    toast.success('Accent color updated');
  };

  const resetToDefaults = () => {
    setTheme('light');
    setAnimations(true);
    setReducedMotion(false);
    setFontSize('medium');
    setBorderRadius('medium');
    setCompactMode(false);
    setHighContrast(false);
    setCustomAccentColor('#3b82f6');
    setSoundEnabled(true);
    setAutoSave(true);
    setTempAccentColor('#3b82f6');
    toast.success('Settings reset to defaults');
  };

  const exportSettings = () => {
    const settings = {
      theme,
      animations,
      reducedMotion,
      fontSize,
      borderRadius,
      compactMode,
      highContrast,
      customAccentColor,
      soundEnabled,
      autoSave,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnibiz-theme-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Custom Accent Color */}
          <div className="space-y-2">
            <Label>Custom Accent Color</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={tempAccentColor}
                onChange={(e) => handleAccentColorChange(e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={tempAccentColor}
                onChange={(e) => handleAccentColorChange(e.target.value)}
                className="flex-1"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <Label>Font Size</Label>
            <div className="grid grid-cols-2 gap-2">
              {fontSizeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={fontSize === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFontSize(option.value)}
                  className="justify-start"
                >
                  <Type className="h-4 w-4 mr-2" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-3">
            <Label>Border Radius</Label>
            <div className="grid grid-cols-2 gap-2">
              {borderRadiusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={borderRadius === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBorderRadius(option.value)}
                  className="justify-start"
                  style={{ borderRadius: option.radius }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Settings to improve accessibility and usability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing for more content
              </p>
            </div>
            <Switch
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance
          </CardTitle>
          <CardDescription>
            Settings that affect performance and user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Animations</Label>
              <p className="text-sm text-muted-foreground">
                Show smooth transitions and animations
              </p>
            </div>
            <Switch
              checked={animations}
              onCheckedChange={setAnimations}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for interactions
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-save Settings</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save theme changes
              </p>
            </div>
            <Switch
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Management</CardTitle>
          <CardDescription>
            Export, import, or reset your theme settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;
