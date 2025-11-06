import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async'; // <-- Thêm dòng này

import HomePage from './pages/HomePage';
import BioPage from './pages/BioPage';

function App() {
  return (
    // ▼▼▼ Bọc toàn bộ ứng dụng trong HelmetProvider ▼▼▼
    <HelmetProvider> 
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:slug" element={<BioPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider> // <-- Đóng thẻ
  );
}

export default App;