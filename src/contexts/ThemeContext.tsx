import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from localStorage on mount for immediate application
  useEffect(() => {
    const savedTheme = localStorage.getItem('nanatech-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
      applyThemeToDocument(savedTheme);
    }
    setIsInitialized(true);
  }, []);

  // Load theme from user profile when user changes
  useEffect(() => {
    if (user && isInitialized) {
      loadUserThemePreference();
    }
  }, [user, isInitialized]);

  // Apply theme to document whenever theme changes
  useEffect(() => {
    if (isInitialized) {
      applyThemeToDocument(theme);
      localStorage.setItem('nanatech-theme', theme);
    }
  }, [theme, isInitialized]);

  const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#121212';
      root.style.color = '#FFFFFF';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#FFFFFF';
      root.style.color = '#212529';
    }
  };

  const loadUserThemePreference = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error loading theme preference:', error);
        return;
      }

      if (data?.theme && (data.theme === 'light' || data.theme === 'dark')) {
        setThemeState(data.theme);
      }
    } catch (error) {
      console.error('Error loading user theme preference:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}