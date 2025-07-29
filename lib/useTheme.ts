import { useEffect } from 'react';
import { useAppStore } from './store';
import { getThemeColors } from './theme';

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useAppStore();
  const colors = getThemeColors(theme);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    // Set CSS custom properties
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Set theme class for Tailwind
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, colors]);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, [setTheme, theme]);

  return {
    theme,
    colors,
    setTheme,
    toggleTheme,
  };
}; 