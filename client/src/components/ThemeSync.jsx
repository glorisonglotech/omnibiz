import { useThemeSync } from '@/hooks/useThemeSync';

const ThemeSync = () => {
  useThemeSync();
  return null; // This component only handles side effects
};

export default ThemeSync;
