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
    description: 'Warm orange theme',
    preview: 'bg-orange-500 text-white',
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
    description: 'Deep blue theme',
    preview: 'bg-blue-800 text-white',
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
    preview: 'bg-gray-500 text-white',
    category: 'auto',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: 'var(--background)',
      foreground: 'var(--foreground)'
    }
  },
  dracula: {
    name: 'Dracula',
    description: 'Popular dark theme',
    preview: 'bg-[#282a36] text-[#f8f8f2] border border-[#bd93f9]',
    category: 'special',
    colors: {
      primary: '#bd93f9',
      secondary: '#ff79c6',
      accent: '#50fa7b',
      background: '#282a36',
      foreground: '#f8f8f2'
    }
  },
  nord: {
    name: 'Nord',
    description: 'Arctic nordic theme',
    preview: 'bg-[#2e3440] text-[#eceff4] border border-[#88c0d0]',
    category: 'special',
    colors: {
      primary: '#88c0d0',
      secondary: '#81a1c1',
      accent: '#a3be8c',
      background: '#2e3440',
      foreground: '#eceff4'
    }
  },
  tokyonight: {
    name: 'Tokyo Night',
    description: 'Neon city nights',
    preview: 'bg-[#1a1b26] text-[#c0caf5] border border-[#7aa2f7]',
    category: 'special',
    colors: {
      primary: '#7aa2f7',
      secondary: '#bb9af7',
      accent: '#9ece6a',
      background: '#1a1b26',
      foreground: '#c0caf5'
    }
  },
  corporate: {
    name: 'Corporate Blue',
    description: 'Professional business theme',
    preview: 'bg-blue-700 text-white',
    category: 'business',
    colors: {
      primary: '#1e40af',
      secondary: '#1e3a8a',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#1e293b'
    }
  },
  forest: {
    name: 'Forest Green',
    description: 'Calm forest vibes',
    preview: 'bg-green-700 text-white',
    category: 'nature',
    colors: {
      primary: '#047857',
      secondary: '#065f46',
      accent: '#10b981',
      background: '#f0fdf4',
      foreground: '#064e3b'
    }
  },
  lavender: {
    name: 'Lavender Dreams',
    description: 'Soft lavender theme',
    preview: 'bg-purple-400 text-white',
    category: 'nature',
    colors: {
      primary: '#a855f7',
      secondary: '#ec4899',
      accent: '#d946ef',
      background: '#faf5ff',
      foreground: '#581c87'
    }
  },
  neon: {
    name: 'Neon Lights',
    description: 'Vibrant neon colors',
    preview: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
    category: 'modern',
    colors: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#06b6d4',
      background: '#18181b',
      foreground: '#fafafa'
    }
  },
  minimal: {
    name: 'Minimal Black',
    description: 'Ultra minimal design',
    preview: 'bg-black text-white',
    category: 'modern',
    colors: {
      primary: '#18181b',
      secondary: '#27272a',
      accent: '#3f3f46',
      background: '#ffffff',
      foreground: '#09090b'
    }
  },
  spring: {
    name: 'Spring Bloom',
    description: 'Fresh spring colors',
    preview: 'bg-gradient-to-r from-green-400 to-pink-400 text-white',
    category: 'seasonal',
    colors: {
      primary: '#22c55e',
      secondary: '#f472b6',
      accent: '#a3e635',
      background: '#f0fdf4',
      foreground: '#14532d'
    }
  },
  autumn: {
    name: 'Autumn Leaves',
    description: 'Warm autumn colors',
    preview: 'bg-gradient-to-r from-orange-600 to-red-700 text-white',
    category: 'seasonal',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#fffbeb',
      foreground: '#78350f'
    }
  },
  midnight: {
    name: 'Midnight Blue',
    description: 'Deep midnight theme',
    preview: 'bg-blue-950 text-blue-100',
    category: 'dark',
    colors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      accent: '#3b82f6',
      background: '#0c1629',
      foreground: '#dbeafe'
    }
  },
  monokai: {
    name: 'Monokai',
    description: 'Classic code theme',
    preview: 'bg-[#272822] text-[#f8f8f2] border border-[#66d9ef]',
    category: 'special',
    colors: {
      primary: '#66d9ef',
      secondary: '#f92672',
      accent: '#a6e22e',
      background: '#272822',
      foreground: '#f8f8f2'
    }
  },
  matrix: {
    name: 'Matrix',
    description: 'Enter the matrix',
    preview: 'bg-black text-[#00ff00] border border-[#00ff00]',
    category: 'special',
    colors: {
      primary: '#00ff00',
      secondary: '#00cc00',
      accent: '#00ff41',
      background: '#000000',
      foreground: '#00ff00'
    }
  },
  coral: {
    name: 'Coral Reef',
    description: 'Warm coral colors',
    preview: 'bg-[#fff5f5] text-[#c53030]',
    category: 'color',
    colors: {
      primary: '#f56565',
      secondary: '#fc8181',
      accent: '#feb2b2',
      background: '#fff5f5',
      foreground: '#c53030'
    }
  },
  mint: {
    name: 'Fresh Mint',
    description: 'Cool mint theme',
    preview: 'bg-[#f0fdf4] text-[#065f46]',
    category: 'color',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#f0fdf4',
      foreground: '#065f46'
    }
  },
  amber: {
    name: 'Amber Glow',
    description: 'Warm amber tones',
    preview: 'bg-[#fffbeb] text-[#78350f]',
    category: 'color',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fcd34d',
      background: '#fffbeb',
      foreground: '#78350f'
    }
  },
  forest: {
    name: 'Deep Forest',
    description: 'Dark forest theme',
    preview: 'bg-[#064e3b] text-[#d1fae5]',
    category: 'special',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#064e3b',
      foreground: '#d1fae5'
    }
  },
  sakura: {
    name: 'Cherry Blossom',
    description: 'Soft pink sakura',
    preview: 'bg-[#fdf2f8] text-[#831843]',
    category: 'color',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#f9a8d4',
      background: '#fdf2f8',
      foreground: '#831843'
    }
  },
  arctic: {
    name: 'Arctic Ice',
    description: 'Cool icy blue',
    preview: 'bg-[#f0f9ff] text-[#075985]',
    category: 'color',
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#7dd3fc',
      background: '#f0f9ff',
      foreground: '#075985'
    }
  },
  volcano: {
    name: 'Volcano',
    description: 'Fiery red theme',
    preview: 'bg-[#450a0a] text-[#fecaca]',
    category: 'special',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f87171',
      background: '#450a0a',
      foreground: '#fecaca'
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
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Helper function to convert hex to HSL for Tailwind
  const hexToHSL = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return `${h} ${s}% ${l}%`;
  };

  // Apply theme changes to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = AVAILABLE_THEMES[theme];

    if (currentTheme && currentTheme.colors) {
      // Convert colors to HSL for Tailwind
      const primaryHSL = hexToHSL(currentTheme.colors.primary);
      const secondaryHSL = hexToHSL(currentTheme.colors.secondary);
      const accentHSL = hexToHSL(currentTheme.colors.accent);
      const backgroundHSL = currentTheme.colors.background.startsWith('#') 
        ? hexToHSL(currentTheme.colors.background) 
        : '0 0% 100%';
      const foregroundHSL = hexToHSL(currentTheme.colors.foreground);

      // Apply Tailwind CSS variables
      root.style.setProperty('--primary', primaryHSL);
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', secondaryHSL);
      root.style.setProperty('--secondary-foreground', foregroundHSL);
      root.style.setProperty('--accent', accentHSL);
      root.style.setProperty('--accent-foreground', foregroundHSL);
      root.style.setProperty('--background', backgroundHSL);
      root.style.setProperty('--foreground', foregroundHSL);
      
      // Additional theme colors
      root.style.setProperty('--card', backgroundHSL);
      root.style.setProperty('--card-foreground', foregroundHSL);
      root.style.setProperty('--popover', backgroundHSL);
      root.style.setProperty('--popover-foreground', foregroundHSL);
      root.style.setProperty('--muted', secondaryHSL);
      root.style.setProperty('--muted-foreground', '0 0% 45%');
      root.style.setProperty('--border', `${primaryHSL.split(' ')[0]} 30% 80%`);
      root.style.setProperty('--input', `${primaryHSL.split(' ')[0]} 30% 80%`);
      root.style.setProperty('--ring', primaryHSL);
      
      // Legacy CSS variables for backward compatibility
      root.style.setProperty('--color-primary', currentTheme.colors.primary);
      root.style.setProperty('--color-secondary', currentTheme.colors.secondary);
      root.style.setProperty('--color-accent', currentTheme.colors.accent);
      root.style.setProperty('--color-background', currentTheme.colors.background);
      root.style.setProperty('--color-foreground', currentTheme.colors.foreground);
      
      // Update body background
      document.body.style.backgroundColor = currentTheme.colors.background;
      document.body.style.color = currentTheme.colors.foreground;
    }

    // Apply custom accent color if set
    if (customAccentColor) {
      const customAccentHSL = hexToHSL(customAccentColor);
      root.style.setProperty('--accent', customAccentHSL);
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

  // Load theme preferences from localStorage immediately (for instant load)
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const savedTheme = localStorage.getItem('app-theme');
        const savedSettings = localStorage.getItem('app-theme-settings');
        
        if (savedTheme) {
          setTheme(savedTheme);
        }
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.sidebarCollapsed !== undefined) setSidebarCollapsed(settings.sidebarCollapsed);
          if (settings.compactMode !== undefined) setCompactMode(settings.compactMode);
          if (settings.highContrast !== undefined) setHighContrast(settings.highContrast);
          if (settings.reducedMotion !== undefined) setReducedMotion(settings.reducedMotion);
          if (settings.customAccentColor) setCustomAccentColor(settings.customAccentColor);
          if (settings.animations !== undefined) setAnimations(settings.animations);
          if (settings.fontSize) setFontSize(settings.fontSize);
          if (settings.borderRadius) setBorderRadius(settings.borderRadius);
          if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
          if (settings.autoSave !== undefined) setAutoSave(settings.autoSave);
        }
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
      }
    };

    // Load immediately from localStorage
    loadFromLocalStorage();
  }, []);

  // Load theme preferences from server on mount (secondary)
  useEffect(() => {
    const loadUserThemePreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const themePrefs = response.data.themePreferences;
          if (themePrefs) {
            // Update state from server
            if (themePrefs.theme) setTheme(themePrefs.theme);
            if (themePrefs.sidebarCollapsed !== undefined) setSidebarCollapsed(themePrefs.sidebarCollapsed);
            if (themePrefs.compactMode !== undefined) setCompactMode(themePrefs.compactMode);
            if (themePrefs.highContrast !== undefined) setHighContrast(themePrefs.highContrast);
            if (themePrefs.reducedMotion !== undefined) setReducedMotion(themePrefs.reducedMotion);
            if (themePrefs.customAccentColor) setCustomAccentColor(themePrefs.customAccentColor);
            if (themePrefs.animations !== undefined) setAnimations(themePrefs.animations);
            if (themePrefs.fontSize) setFontSize(themePrefs.fontSize);
            if (themePrefs.borderRadius) setBorderRadius(themePrefs.borderRadius);
            if (themePrefs.soundEnabled !== undefined) setSoundEnabled(themePrefs.soundEnabled);
            if (themePrefs.autoSave !== undefined) setAutoSave(themePrefs.autoSave);
            
            // Also save to localStorage
            localStorage.setItem('app-theme', themePrefs.theme || 'light');
            localStorage.setItem('app-theme-settings', JSON.stringify(themePrefs));
          }
        }
      } catch (error) {
        console.log('Could not load user theme preferences from server:', error.message);
      } finally {
        setIsInitialized(true);
      }
    };

    // Load from server after a short delay (let localStorage load first)
    const timer = setTimeout(() => {
      loadUserThemePreferences();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage immediately on any theme change
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem('app-theme', theme);
      localStorage.setItem('app-theme-settings', JSON.stringify({
        theme,
        sidebarCollapsed,
        compactMode,
        highContrast,
        reducedMotion,
        customAccentColor,
        animations,
        fontSize,
        borderRadius,
        soundEnabled,
        autoSave
      }));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
    }
  }, [theme, sidebarCollapsed, compactMode, highContrast, reducedMotion, customAccentColor, animations, fontSize, borderRadius, soundEnabled, autoSave, isInitialized]);

  // Sync theme settings to server after initialization (debounced)
  useEffect(() => {
    if (!isInitialized) return;

    const syncTimer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.put('/user/settings', {
            section: 'appearance',
            settings: {
              theme,
              sidebarCollapsed,
              compactMode,
              highContrast,
              reducedMotion,
              customAccentColor,
              animations,
              fontSize,
              borderRadius,
              soundEnabled,
              autoSave
            }
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } catch (error) {
        console.log('Could not sync theme preferences:', error.message);
      }
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(syncTimer);
  }, [isInitialized, theme, sidebarCollapsed, compactMode, highContrast, reducedMotion, 
      customAccentColor, animations, fontSize, borderRadius, soundEnabled, autoSave]);

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
