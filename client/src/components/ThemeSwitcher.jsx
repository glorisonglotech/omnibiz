import React, { useState } from 'react';
import { useAppTheme, AVAILABLE_THEMES } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check, Monitor, Sun, Moon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeCategories = {
    default: { name: 'Default', icon: Monitor, themes: [] },
    color: { name: 'Colors', icon: Palette, themes: [] },
    neutral: { name: 'Neutral', icon: Sun, themes: [] },
    special: { name: 'Special', icon: Sparkles, themes: [] }
  };

  // Group themes by category
  Object.entries(AVAILABLE_THEMES).forEach(([key, themeData]) => {
    const category = themeData.category || 'default';
    if (themeCategories[category]) {
      themeCategories[category].themes.push({ key, ...themeData });
    }
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${AVAILABLE_THEMES[newTheme]?.name || newTheme}`);
  };

  const ThemePreview = ({ themeKey, themeData, isSelected }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={() => handleThemeChange(themeKey)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{themeData.name}</CardTitle>
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
        <CardDescription className="text-xs">{themeData.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className={`h-16 rounded-md border-2 ${themeData.preview} flex items-center justify-center text-xs font-medium`}
          style={{
            backgroundColor: themeData.colors?.background,
            color: themeData.colors?.foreground,
            borderColor: themeData.colors?.primary
          }}
        >
          <div className="flex gap-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeData.colors?.primary }}
            />
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeData.colors?.secondary }}
            />
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: themeData.colors?.accent }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="theme-toggle">
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Your Theme
          </DialogTitle>
          <DialogDescription>
            Customize your ominbiz experience with beautiful themes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="default" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(themeCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(themeCategories).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.themes.map(({ key, ...themeData }) => (
                  <ThemePreview
                    key={key}
                    themeKey={key}
                    themeData={themeData}
                    isSelected={theme === key}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Current: {AVAILABLE_THEMES[theme]?.name}</Badge>
          </div>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSwitcher;
