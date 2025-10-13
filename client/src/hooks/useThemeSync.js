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

  // Sync with next-themes
  useEffect(() => {
    if (theme !== nextTheme) {
      setNextTheme(theme);
    }
  }, [theme, nextTheme, setNextTheme]);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply theme class
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${theme}`);

    // Apply current theme colors
    const currentTheme = availableThemes[theme];
    if (currentTheme && currentTheme.colors) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }

    // Apply custom accent color
    if (customAccentColor) {
      root.style.setProperty('--color-accent', customAccentColor);
      root.style.setProperty('--color-primary', customAccentColor);
    }

    // Apply compact mode
    if (compactMode) {
      body.classList.add('compact-mode');
      root.style.setProperty('--spacing-scale', '0.75');
    } else {
      body.classList.remove('compact-mode');
      root.style.setProperty('--spacing-scale', '1');
    }

    // Apply high contrast
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // Apply animations setting
    if (!animations) {
      body.classList.add('no-animations');
    } else {
      body.classList.remove('no-animations');
    }

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[fontSize] || '16px');

    // Apply border radius
    const borderRadiusMap = {
      none: '0px',
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      'extra-large': '1rem'
    };
    root.style.setProperty('--border-radius-base', borderRadiusMap[borderRadius] || '0.5rem');

    // Show theme change notification
    if (soundEnabled) {
      // Play a subtle sound effect (you can implement this)
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

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      theme,
      compactMode,
      highContrast,
      reducedMotion,
      animations,
      customAccentColor,
      fontSize,
      borderRadius,
      soundEnabled
    };

    localStorage.setItem('omnibiz-theme-settings', JSON.stringify(settings));
  }, [
    theme,
    compactMode,
    highContrast,
    reducedMotion,
    animations,
    customAccentColor,
    fontSize,
    borderRadius,
    soundEnabled
  ]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('omnibiz-theme-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.theme && availableThemes[settings.theme]) {
          setTheme(settings.theme);
        }
        // Apply other settings through the context
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    }
  }, [setTheme, availableThemes]);

  const resetToDefaults = () => {
    setTheme('light');
    // Reset other settings through context
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
          // Apply other settings
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