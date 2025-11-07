// src/components/ThemeToggle.js

import React from 'react';
import { BiSun, BiMoon } from 'react-icons/bi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <BiMoon className="w-6 h-6" />
      ) : (
        <BiSun className="w-6 h-6" />
      )}
    </button>
  );
}