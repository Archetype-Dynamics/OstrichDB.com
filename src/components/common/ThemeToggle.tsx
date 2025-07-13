import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-sb-dark-accent transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-sb-cream" />
      ) : (
        <Moon size={20} className="text-sb-light hover:text-sb-cream" />
      )}
    </button>
  );
};

export default ThemeToggle;
