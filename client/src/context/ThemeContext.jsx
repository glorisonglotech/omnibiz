import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

const ThemeContext = createContext();

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

// Available themes with their configurations
export const AVAILABLE_THEMES = {
  light: {
    name: 'Light',
    description: 'Clean and bright interface',
    preview: 'bg-white text-gray-900',
    category: 'default',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      foreground: '#1f2937'
    }
  },
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes',
    preview: 'bg-gray-900 text-white',
    category: 'default',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#34d399',
      background: '#111827',
      foreground: '#f9fafb'
    }
  },
  blue: {
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    preview: 'bg-blue-600 text-white',
    category: 'color',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#eff6ff',
      foreground: '#1e3a8a'
    }
  },
  green: {
    name: 'Forest Green',
    description: 'Nature-inspired green',
    preview: 'bg-green-600 text-white',
    category: 'color',
    colors: {
      primary: '#16a34a',
      secondary: '#15803d',
      accent: '#22c55e',
      background: '#f0fdf4',
      foreground: '#14532d'
    }
  },
  purple: {
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    preview: 'bg-purple-600 text-white',
    category: 'color',
    colors: {
      primary: '#9333ea',
      secondary: '#7c3aed',
      accent: '#a855f7',
      background: '#faf5ff',
      foreground: '#581c87'
    }
  },
  orange: {
    name: 'Sunset Orange',
    description: 'Warm and energetic',
    preview: 'bg-orange-600 text-white',
    category: 'color',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f97316',
      background: '#fff7ed',
      foreground: '#9a3412'
    }
  },
  rose: {
    name: 'Rose Pink',
    description: 'Soft and modern',
    preview: 'bg-rose-600 text-white',
    category: 'color',
    colors: {
      primary: '#e11d48',
      secondary: '#be185d',
      accent: '#f43f5e',
      background: '#fff1f2',
      foreground: '#881337'
    }
  },
  slate: {
    name: 'Slate Gray',
    description: 'Professional and minimal',
    preview: 'bg-slate-600 text-white',
    category: 'neutral',
    colors: {
      primary: '#475569',
      secondary: '#334155',
      accent: '#64748b',
      background: '#f8fafc',
      foreground: '#0f172a'
    }
  },
  emerald: {
    name: 'Emerald',
    description: 'Fresh and vibrant',
    preview: 'bg-emerald-600 text-white',
    category: 'color',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#ecfdf5',
      foreground: '#064e3b'
    }
  },
  fresh: {
    name: 'Fresh White',
    description: 'Clean white with green accents',
    preview: 'bg-white text-gray-900 border border-green-500',
    category: 'color',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#ffffff',
      foreground: '#1f2937'
    }
  },
  indigo: {
    name: 'Deep Indigo',
    description: 'Rich and sophisticated',
    preview: 'bg-indigo-600 text-white',
    category: 'color',
    colors: {
      primary: '#4f46e5',
      secondary: '#4338ca',
      accent: '#6366f1',
      background: '#f0f9ff',
      foreground: '#312e81'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Neon and futuristic',
    preview: 'bg-black text-cyan-400 border border-pink-500',
    category: 'special',
    colors: {
      primary: '#06b6d4',
      secondary: '#ec4899',
      accent: '#10b981',
      background: '#000000',
      foreground: '#22d3ee'
    }
  },
  sunset: {
    name: 'Sunset',
    description: 'Warm gradient theme',
    preview: 'bg-gradient-to-r from-orange-400 to-pink-600 text-white',
    category: 'special',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#fff7ed',
      foreground: '#9a3412'
    }
  },
  ocean: {
    name: 'Ocean Depths',
    description: 'Deep blue gradient',
    preview: 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white',
    category: 'special',
    colors: {
      primary: '#1e40af',
      secondary: '#312e81',
      accent: '#3b82f6',
      background: '#eff6ff',
      foreground: '#1e3a8a'
    }
  },
  system: {
    name: 'System',
    description: 'Follow system preference',
    preview: 'bg-gradient-to-r from-gray-100 to-gray-900 text-gray-900',
    category: 'auto',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: 'var(--background)',
      foreground: 'var(--foreground)'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [borderRadius, setBorderRadius] = useState('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [customAccentColor, setCustomAccentColor] = useState('#3b82f6');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  // Font size options
  const FONT_SIZES = {
    small: { name: 'Small', class: 'text-sm', value: '14px' },
    medium: { name: 'Medium', class: 'text-base', value: '16px' },
    large: { name: 'Large', class: 'text-lg', value: '18px' },
    xlarge: { name: 'Extra Large', class: 'text-xl', value: '20px' }
  };

  // Border radius options
  const BORDER_RADIUS = {
    none: { name: 'None', value: '0px' },
    small: { name: 'Small', value: '4px' },
    medium: { name: 'Medium', value: '8px' },
    large: { name: 'Large', value: '12px' },
    xlarge: { name: 'Extra Large', value: '16px' }
  };

  // Apply theme-specific CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply font size
    root.style.setProperty('--font-size-base', FONT_SIZES[fontSize].value);

    // Apply border radius
    root.style.setProperty('--radius', BORDER_RADIUS[borderRadius].value);

    // Apply animations preference
    if (!animations || reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.2s');
    }
  }, [theme, fontSize, borderRadius, animations, reducedMotion]);

  // Detect system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme changes to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = AVAILABLE_THEMES[theme];

    if (currentTheme && currentTheme.colors) {
      root.style.setProperty('--color-primary', currentTheme.colors.primary);
      root.style.setProperty('--color-secondary', currentTheme.colors.secondary);
      root.style.setProperty('--color-accent', currentTheme.colors.accent);
      root.style.setProperty('--color-background', currentTheme.colors.background);
      root.style.setProperty('--color-foreground', currentTheme.colors.foreground);
    }

    // Apply custom accent color if set
    if (customAccentColor) {
      root.style.setProperty('--color-accent', customAccentColor);
    }

    // Apply font size
    const fontSizeValue = FONT_SIZES[fontSize]?.value || '16px';
    root.style.setProperty('--font-size-base', fontSizeValue);

    // Apply border radius
    const borderRadiusValue = BORDER_RADIUS[borderRadius]?.value || '0.5rem';
    root.style.setProperty('--border-radius-base', borderRadiusValue);

    // Apply compact mode
    root.style.setProperty('--spacing-scale', compactMode ? '0.75' : '1');

    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply animations setting
    if (!animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }

  }, [theme, customAccentColor, fontSize, borderRadius, compactMode, highContrast, reducedMotion, animations]);

  const themeContextValue = {
    // Theme options
    theme,
    setTheme,
    themes: Object.keys(AVAILABLE_THEMES),
    availableThemes: AVAILABLE_THEMES,

    // Layout preferences
    sidebarCollapsed,
    setSidebarCollapsed,
    compactMode,
    setCompactMode,

    // Accessibility preferences
    animations,
    setAnimations,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,

    // Typography preferences
    fontSize,
    setFontSize,
    fontSizes: FONT_SIZES,

    // Design preferences
    borderRadius,
    setBorderRadius,
    borderRadiusOptions: BORDER_RADIUS,
    customAccentColor,
    setCustomAccentColor,

    // App preferences
    soundEnabled,
    setSoundEnabled,
    autoSave,
    setAutoSave,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
