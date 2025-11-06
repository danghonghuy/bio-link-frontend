import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';


import HomePage from './pages/HomePage';
import BioPage from './pages/BioPage';

function App() {
  return (
    // ✅ BỎ HelmetProvider đi
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:slug" element={<BioPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;