import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // <-- Bước 1: Import ThemeProvider

import HomePage from './pages/HomePage';
import BioPage from './pages/BioPage';

function App() {
  return (
    // Bước 2: Bọc toàn bộ ứng dụng bằng ThemeProvider
    // Đặt nó ở ngoài cùng để nó bao phủ cả AuthProvider
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:slug" element={<BioPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;