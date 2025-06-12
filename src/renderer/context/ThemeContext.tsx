import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  
  // Load theme from settings
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await window.electron.getSettings();
        if (settings?.theme) {
          setTheme(settings.theme);
        }
      } catch (error) {
        console.error('Failed to load theme setting:', error);
      }
    };
    
    loadTheme();
    
    // Subscribe to theme changes from main process
    const unsubscribe = window.electron.on('theme:changed', (newTheme: Theme) => {
      setTheme(newTheme);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Apply theme variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update CSS variables based on theme
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--vscode-editor-background', '#1F1F1F');
      document.documentElement.style.setProperty('--vscode-editor-foreground', '#CCCCCC');
      document.documentElement.style.setProperty('--vscode-sideBar-background', '#181818');
    } else {
      document.documentElement.style.setProperty('--vscode-editor-background', '#FFFFFF');
      document.documentElement.style.setProperty('--vscode-editor-foreground', '#000000');
      document.documentElement.style.setProperty('--vscode-sideBar-background', '#F3F3F3');
    }
    
    // Save theme to settings
    window.electron.updateSettings({ theme });
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);