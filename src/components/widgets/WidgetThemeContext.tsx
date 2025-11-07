import { createContext, useContext, useState, ReactNode } from 'react';

type WidgetTheme = 'light' | 'dark';

interface WidgetThemeColors {
  light: string;
  dark: string;
}

interface WidgetThemeContextType {
  widgetTheme: WidgetTheme;
  setWidgetTheme: (theme: WidgetTheme) => void;
  primaryColor: WidgetThemeColors;
  setPrimaryColor: (colors: WidgetThemeColors) => void;
  getCurrentPrimaryColor: () => string;
}

const WidgetThemeContext = createContext<WidgetThemeContextType | undefined>(undefined);

interface WidgetThemeProviderProps {
  children: ReactNode;
  initialTheme?: WidgetTheme;
}

export function WidgetThemeProvider({ children, initialTheme = 'light' }: WidgetThemeProviderProps) {
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>(initialTheme);
  const [primaryColor, setPrimaryColor] = useState<WidgetThemeColors>({
    light: '#2563eb', // Bright Blue for light mode
    dark: '#2563eb',  // Bright Blue for dark mode (primary)
  });

  const getCurrentPrimaryColor = () => {
    return widgetTheme === 'light' ? primaryColor.light : primaryColor.dark;
  };

  return (
    <WidgetThemeContext.Provider 
      value={{ 
        widgetTheme, 
        setWidgetTheme, 
        primaryColor, 
        setPrimaryColor,
        getCurrentPrimaryColor 
      }}
    >
      {children}
    </WidgetThemeContext.Provider>
  );
}

export function useWidgetTheme() {
  const context = useContext(WidgetThemeContext);
  if (context === undefined) {
    throw new Error('useWidgetTheme must be used within a WidgetThemeProvider');
  }
  return context;
}
