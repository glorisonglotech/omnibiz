import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Palette, Sparkles } from 'lucide-react';
import { AVAILABLE_THEMES } from '@/context/ThemeContext';

const ThemeSelector = ({ onThemeChange, currentTheme }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Group themes by category
  const themesByCategory = Object.entries(AVAILABLE_THEMES).reduce((acc, [key, theme]) => {
    const category = theme.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, ...theme });
    return acc;
  }, {});

  // All themes as a flat array
  const allThemes = Object.entries(AVAILABLE_THEMES).map(([key, theme]) => ({
    key,
    ...theme
  }));

  // Filter themes by category
  const getThemesByCategory = (category) => {
    if (category === 'all') return allThemes;
    return allThemes.filter(theme => theme.category === category);
  };

  const categories = [
    { key: 'all', name: 'All Themes', icon: Palette },
    { key: 'default', name: 'Default', icon: null },
    { key: 'color', name: 'Colors', icon: null },
    { key: 'neutral', name: 'Neutral', icon: null },
    { key: 'special', name: 'Special', icon: Sparkles },
    { key: 'auto', name: 'Auto', icon: null }
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
              {cat.icon && <cat.icon className="h-3 w-3 mr-1" />}
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <ScrollArea className="h-[400px] w-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getThemesByCategory(selectedCategory).map((theme) => (
                <Card
                  key={theme.key}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentTheme === theme.key
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:ring-1 hover:ring-primary/50'
                  }`}
                  onClick={() => onThemeChange(theme.key)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {theme.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {theme.description}
                        </CardDescription>
                      </div>
                      {currentTheme === theme.key && (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {/* Theme Preview */}
                    <div className={`h-16 rounded-md ${theme.preview} p-3 flex items-center justify-center`}>
                      <div className="text-xs font-medium opacity-90">
                        Preview
                      </div>
                    </div>
                    {theme.category && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {theme.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Current Theme Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{AVAILABLE_THEMES[currentTheme]?.name || 'Light'}</p>
              <p className="text-xs text-muted-foreground">
                {AVAILABLE_THEMES[currentTheme]?.description || 'Default theme'}
              </p>
            </div>
            <div className={`h-10 w-10 rounded-full ${AVAILABLE_THEMES[currentTheme]?.preview || 'bg-white'}`} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Theme Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={currentTheme === 'light' ? 'default' : 'outline'}
          onClick={() => onThemeChange('light')}
        >
          Light
        </Button>
        <Button
          size="sm"
          variant={currentTheme === 'dark' ? 'default' : 'outline'}
          onClick={() => onThemeChange('dark')}
        >
          Dark
        </Button>
        <Button
          size="sm"
          variant={currentTheme === 'blue' ? 'default' : 'outline'}
          onClick={() => onThemeChange('blue')}
        >
          Blue
        </Button>
        <Button
          size="sm"
          variant={currentTheme === 'purple' ? 'default' : 'outline'}
          onClick={() => onThemeChange('purple')}
        >
          Purple
        </Button>
        <Button
          size="sm"
          variant={currentTheme === 'cyberpunk' ? 'default' : 'outline'}
          onClick={() => onThemeChange('cyberpunk')}
        >
          Cyberpunk
        </Button>
        <Button
          size="sm"
          variant={currentTheme === 'matrix' ? 'default' : 'outline'}
          onClick={() => onThemeChange('matrix')}
        >
          Matrix
        </Button>
      </div>
    </div>
  );
};

export default ThemeSelector;
