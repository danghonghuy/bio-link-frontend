// src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';

// Tạo Context
const ThemeContext = createContext();

// Tạo Provider để bao bọc ứng dụng
export function ThemeProvider({ children }) {
  // Lấy theme từ localStorage hoặc mặc định là 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    const oldTheme = theme === 'dark' ? 'light' : 'dark';

    root.classList.remove(oldTheme);
    root.classList.add(theme);

    // Lưu lựa chọn của người dùng vào localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Tạo một custom hook để sử dụng context dễ dàng hơn
export function useTheme() {
  return useContext(ThemeContext);
}