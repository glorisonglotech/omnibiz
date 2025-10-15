import { useEffect } from 'react';
import { useAppTheme } from '@/context/ThemeContext';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export const useThemeSync = () => {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const {
    theme,
    setTheme,
    compactMode,
    highContrast,
    reducedMotion,
    animations,
    customAccentColor,
    fontSize,
    borderRadius,
    soundEnabled,
    availableThemes
  } = useAppTheme();

  useEffect(() => {
    if (theme !== nextTheme) {
      setNextTheme(theme);
    }
  }, [theme, nextTheme, setNextTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${theme}`);
    const currentTheme = availableThemes[theme];
    if (currentTheme && currentTheme.colors) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
    if (customAccentColor) {
      root.style.setProperty('--color-accent', customAccentColor);
      root.style.setProperty('--color-primary', customAccentColor);
    }
    if (compactMode) {
      body.classList.add('compact-mode');
      root.style.setProperty('--spacing-scale', '0.75');
    } else {
      body.classList.remove('compact-mode');
      root.style.setProperty('--spacing-scale', '1');
    }
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
    if (reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
    if (!animations) {
      body.classList.add('no-animations');
    } else {
      body.classList.remove('no-animations');
    }
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[fontSize] || '16px');
    const borderRadiusMap = {
      none: '0px',
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      'extra-large': '1rem'
    };
    root.style.setProperty('--border-radius-base', borderRadiusMap[borderRadius] || '0.5rem');
    if (soundEnabled) {
      // playThemeChangeSound();
    }
  }, [
    theme,
    compactMode,
    highContrast,
    reducedMotion,
    animations,
    customAccentColor,
    fontSize,
    borderRadius,
    soundEnabled,
    availableThemes
  ]);

  // Note: Theme settings are now synced to server via ThemeContext
  // This hook now focuses on UI synchronization only

  const resetToDefaults = () => {
    setTheme('light');
    toast.success('Theme settings reset to defaults');
  };

  const exportSettings = () => {
    const settings = {
      theme,
      compactMode,
      highContrast,
      reducedMotion,
      animations,
      customAccentColor,
      fontSize,
      borderRadius,
      soundEnabled,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnibiz-theme-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Theme settings exported successfully');
  };

  const importSettings = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        if (settings.theme && availableThemes[settings.theme]) {
          setTheme(settings.theme);
          toast.success('Theme settings imported successfully');
        } else {
          toast.error('Invalid theme settings file');
        }
      } catch (error) {
        toast.error('Failed to import theme settings');
      }
    };
    reader.readAsText(file);
  };

  return {
    resetToDefaults,
    exportSettings,
    importSettings
  };
};
