/**
 * Theme Context - Centralized theme management
 * Provides consistent styling across the app
 */

import React, { createContext, useContext, useState } from 'react';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../components/common/AppStyles';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // App uses dark theme by default

  const theme = {
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    isDarkMode,
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    // Direct access to style constants
    Colors,
    Typography,
    Spacing,
    BorderRadius,
    Shadows,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;