export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceHover: string;
  selected: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accents
  primary: string;
  primaryHover: string;
  accent: string;
  accentHover: string;
  
  // Borders
  border: string;
  borderLight: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceHover: '#E9ECEF',
  selected: '#E3F2FD',
  
  // Text
  textPrimary: '#1A1D24',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  
  // Accents
  primary: '#4A89F3',
  primaryHover: '#3B7BE8',
  accent: '#66B2FF',
  accentHover: '#5AA3F0',
  
  // Borders
  border: '#DEE2E6',
  borderLight: '#F1F3F4',
  
  // Status
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};

export const darkTheme: ThemeColors = {
  // Backgrounds
  background: '#1A1D24',
  surface: '#2A303C',
  surfaceHover: '#3A404C',
  selected: '#2A303C',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A4AB',
  textMuted: '#6C757D',
  
  // Accents
  primary: '#4A89F3',
  primaryHover: '#3B7BE8',
  accent: '#66B2FF',
  accentHover: '#5AA3F0',
  
  // Borders
  border: '#3A404C',
  borderLight: '#2A303C',
  
  // Status
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
};

export const getThemeColors = (theme: Theme): ThemeColors => {
  return theme === 'dark' ? darkTheme : lightTheme;
}; 