/**
 * =================================================
 * Author: Marshall A. Burns
 * GitHub:@SchoolyB
 * Contributors:
 *
 *
 * License: Apache License 2.0 (see LICENSE file for details)
 * Copyright (c) 2025-Present Archetype Dynamics, Inc.
 * File Description:
 *    Provides theme context and functionality for light/dark mode switching.
 * =================================================
 **/

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) return savedTheme;

    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }

    return "dark"; // Default to dark theme
  });

  // Update the data-theme attribute on the document when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
