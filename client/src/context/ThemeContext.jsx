import React, { createContext, useContext, useEffect, useState } from 'react';

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
    category: 'default'
  },
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes',
    preview: 'bg-gray-900 text-white',
    category: 'default'
  },
  blue: {
    name: 'Ocean Blue',
    description: 'Professional blue theme',
    preview: 'bg-blue-600 text-white',
    category: 'color'
  },
  green: {
    name: 'Forest Green',
    description: 'Nature-inspired green',
    preview: 'bg-green-600 text-white',
    category: 'color'
  },
  purple: {
    name: 'Royal Purple',
    description: 'Elegant purple theme',
    preview: 'bg-purple-600 text-white',
    category: 'color'
  },
  orange: {
    name: 'Sunset Orange',
    description: 'Warm and energetic',
    preview: 'bg-orange-600 text-white',
    category: 'color'
  },
  rose: {
    name: 'Rose Pink',
    description: 'Soft and modern',
    preview: 'bg-rose-600 text-white',
    category: 'color'
  },
  slate: {
    name: 'Slate Gray',
    description: 'Professional and minimal',
    preview: 'bg-slate-600 text-white',
    category: 'neutral'
  },
  emerald: {
    name: 'Emerald',
    description: 'Fresh and vibrant',
    preview: 'bg-emerald-600 text-white',
    category: 'color'
  },
  fresh: {
    name: 'Fresh White',
    description: 'Clean white with green accents',
    preview: 'bg-white text-gray-900 border border-green-500',
    category: 'color'
  },
  indigo: {
    name: 'Deep Indigo',
    description: 'Rich and sophisticated',
    preview: 'bg-indigo-600 text-white',
    category: 'color'
  },
  system: {
    name: 'System',
    description: 'Follow system preference',
    preview: 'bg-gradient-to-r from-gray-100 to-gray-900 text-gray-900',
    category: 'auto'
  }
};

export const ThemeProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [borderRadius, setBorderRadius] = useState('medium');

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
  }, [fontSize, borderRadius, animations, reducedMotion]);

  // Detect system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const themeContextValue = {
    // Theme options
    availableThemes: AVAILABLE_THEMES,
    
    // Layout preferences
    sidebarCollapsed,
    setSidebarCollapsed,
    
    // Accessibility preferences
    animations,
    setAnimations,
    reducedMotion,
    setReducedMotion,
    
    // Typography preferences
    fontSize,
    setFontSize,
    fontSizes: FONT_SIZES,
    
    // Design preferences
    borderRadius,
    setBorderRadius,
    borderRadiusOptions: BORDER_RADIUS,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
