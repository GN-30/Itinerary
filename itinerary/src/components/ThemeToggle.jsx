
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none glass-card bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-6 h-6 text-slate-700" />
      ) : (
        <Sun className="w-6 h-6 text-yellow-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
