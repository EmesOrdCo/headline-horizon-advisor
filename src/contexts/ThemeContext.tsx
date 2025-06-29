
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    // Always apply dark theme
    document.documentElement.classList.add('dark');
    
    // Store preference as dark
    localStorage.setItem('theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Theme toggle disabled - always stay in dark mode
    console.log('Theme toggle disabled - staying in dark mode');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode: true, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
